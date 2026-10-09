import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const serverEntry = path.join(rootDir, "server", "index.mjs");

/**
 * The reported failure: credentials work while developing, then a redeploy
 * discards every account. The cause is not hashing — it is that the account
 * store lives at AUTH_DATA_FILE and a deploy that does not attach persistent
 * storage boots with an empty one.
 *
 * So this drives the real server process: register, kill it, boot a fresh one
 * against the same store path, and require the same credentials to still work.
 * Then it repeats against a different store path to show that the persistence
 * path — not the password hashing — is the thing that decides.
 */

let nextPort = 4100;
const started = [];

function startServer({ dataFile, port }) {
  const child = spawn(process.execPath, [serverEntry], {
    cwd: rootDir,
    env: {
      ...process.env,
      PORT: String(port),
      HOST: "127.0.0.1",
      AUTH_DATA_FILE: dataFile,
      AUTH_SESSION_SECRET: "persistence-test-secret",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  let log = "";
  let exited = false;
  child.once("exit", () => { exited = true; });
  child.stdout.on("data", (chunk) => { log += chunk.toString(); });
  child.stderr.on("data", (chunk) => { log += chunk.toString(); });

  const listening = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(`server did not start on ${port}\n${log}`)), 20_000);
    child.stdout.on("data", (chunk) => {
      if (chunk.toString().includes("listening on")) {
        clearTimeout(timer);
        resolve();
      }
    });
    child.on("exit", (code) => reject(new Error(`server exited early (${code})\n${log}`)));
  });

  const handle = {
    child,
    port,
    get log() { return log; },
    async ready() { await listening; },
    async stop() {
      // Idempotent, and never waits forever: once "exit" has already fired the
      // listener would never run again and the top-level await would hang.
      if (exited) return;
      child.kill("SIGTERM");
      await new Promise((resolve) => {
        const timer = setTimeout(resolve, 5000);
        const done = () => { clearTimeout(timer); resolve(); };
        child.once("exit", done);
        child.once("close", done);
      });
    },
    async request(route, body, cookie) {
      const response = await fetch(`http://127.0.0.1:${port}${route}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(cookie ? { cookie } : {}) },
        body: JSON.stringify(body),
      });
      const cookieHeader = response.headers.getSetCookie?.()[0] ?? response.headers.get("set-cookie");
      return { status: response.status, body: await response.json(), cookie: cookieHeader };
    },
    async health() {
      const response = await fetch(`http://127.0.0.1:${port}/api/health`);
      return { status: response.status, body: await response.json() };
    },
  };
  // Tracked so a failed assertion cannot leave a server holding the port and
  // make the next run fail with EADDRINUSE instead of the real error.
  started.push(handle);
  return handle;
}

const volume = await fs.mkdtemp(path.join(os.tmpdir(), "gamehack-volume-"));
const ephemeral = await fs.mkdtemp(path.join(os.tmpdir(), "gamehack-ephemeral-"));
const email = "persist-check@ionio.gr";
const password = "correct-horse-battery";
let recoveryKey = "";

try {
  // ── First deploy: register against a persistent store ─────────────────────
  const first = startServer({ dataFile: path.join(volume, "accounts.json"), port: nextPort++ });
  await first.ready();

  const healthBefore = await first.health();
  assert.equal(healthBefore.status, 200, "health should answer");
  assert.equal(healthBefore.body.persistence.accounts, 2,
    "a fresh volume holds only the two provisioned demo accounts");

  const registered = await first.request("/api/auth/register", { email, password, nickname: "Persist Check" });
  assert.equal(registered.status, 201, `registration should succeed: ${JSON.stringify(registered.body)}`);
  recoveryKey = registered.body.recoveryKey;
  assert.match(recoveryKey, /^[A-Za-z0-9_-]{43}$/, "registration must hand back a recovery key");

  // The store has to be on disk before the process dies, or nothing persists.
  const stored = JSON.parse(await fs.readFile(path.join(volume, "accounts.json"), "utf8"));
  assert.ok(
    stored.accounts.some((account) => account.email === email),
    "the account must be written to the store file",
  );
  assert.ok(stored.accounts.every((account) => !("password" in account)), "no plaintext password may be stored");
  assert.ok(stored.accounts.every((account) => !("recoveryKey" in account)), "no plaintext recovery key may be stored");
  assert.ok(
    stored.accounts.find((account) => account.email === email)?.recoveryKeyHash,
    "the recovery key must be stored as a hash",
  );

  const healthAfter = await first.health();
  assert.equal(healthAfter.body.persistence.accounts, 3, "health should report the stored account");
  assert.equal(healthAfter.body.persistence.persisted, true, "health should report the file on disk");
  assert.equal(healthAfter.body.persistence.writable, true, "health should report the store writable");
  assert.equal(healthAfter.body.stableSessions, true, "AUTH_SESSION_SECRET should be reported as set");

  await first.stop();

  // ── Redeploy: a new process, the same mounted volume ──────────────────────
  // This is the case that was failing.
  const second = startServer({ dataFile: path.join(volume, "accounts.json"), port: nextPort++ });
  await second.ready();
  assert.equal((await second.health()).body.persistence.accounts, 3, "the redeploy should find the account");

  const login = await second.request("/api/auth/login", { email, password });
  assert.equal(login.status, 200, `the same credentials must work after a redeploy: ${JSON.stringify(login.body)}`);
  assert.equal(login.body.account.email, email);

  const keyLogin = await second.request("/api/auth/login-with-key", { email, recoveryKey });
  assert.equal(keyLogin.status, 200, `the recovery key must still work after a redeploy: ${JSON.stringify(keyLogin.body)}`);

  const wrongPassword = await second.request("/api/auth/login", { email, password: "not-the-password" });
  assert.equal(wrongPassword.status, 401, "a wrong password must still be rejected after a redeploy");

  await second.stop();

  // ── Negative control: a deploy with no persistent store attached ──────────
  // Same code, same image, different (ephemeral) path. This is what an operator
  // gets when the volume is missing, and it must fail — otherwise the test above
  // would pass for a reason that has nothing to do with persistence.
  const third = startServer({ dataFile: path.join(ephemeral, "accounts.json"), port: nextPort++ });
  await third.ready();
  assert.match(third.log, /No accounts were found/, "an empty store must warn loudly at startup");
  assert.match(third.log, /AUTH_DATA_FILE is not set|persistent storage/i, "the warning should name the cause");

  const lost = await third.request("/api/auth/login", { email, password });
  assert.equal(lost.status, 401, "without the store attached the account is gone — that is the reported bug");

  await third.stop();

  console.log(`Persistence checks passed: an account registered against a mounted AUTH_DATA_FILE survives a full server restart — password login, recovery-key login and wrong-password rejection all behave — while the same deploy against an unattached store boots empty and warns, reproducing the reported loss of credentials.`);
} finally {
  for (const handle of started) await handle.stop().catch(() => {});
  await fs.rm(volume, { recursive: true, force: true });
  await fs.rm(ephemeral, { recursive: true, force: true });
}
