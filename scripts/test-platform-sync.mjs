import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer as createTcpServer } from "node:net";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import { createServer as createViteServer } from "vite";

/**
 * End-to-end proof of the storage move: player progress is written to the
 * server, survives losing the browser entirely, and is readable by the other
 * players. localStorage is exercised as the offline cache it now is, never as
 * the thing that holds the state.
 */

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tempDir = await mkdtemp(path.join(os.tmpdir(), "gamehack-sync-test-"));
const dataFile = path.join(tempDir, "accounts.json");

async function availablePort() {
  const probe = createTcpServer();
  await new Promise((resolve, reject) => probe.once("error", reject).listen(0, "127.0.0.1", resolve));
  const { port } = probe.address();
  await new Promise((resolve, reject) => probe.close((error) => (error ? reject(error) : resolve())));
  return port;
}

const port = await availablePort();
const server = spawn(process.execPath, [path.join(rootDir, "server/index.mjs")], {
  cwd: rootDir,
  env: {
    ...process.env,
    PORT: String(port),
    HOST: "127.0.0.1",
    AUTH_DATA_FILE: dataFile,
    AUTH_SESSION_SECRET: "test-only-session-secret-that-is-long-enough",
    SMTP_HOST: "", SMTP_PORT: "", SMTP_USER: "", SMTP_PASS: "", MAIL_FROM: "",
  },
  stdio: ["ignore", "pipe", "pipe"],
});
let logs = "";
server.stdout.setEncoding("utf8").on("data", (chunk) => { logs += chunk; });
server.stderr.setEncoding("utf8").on("data", (chunk) => { logs += chunk; });

async function waitForServer() {
  const started = Date.now();
  while (Date.now() - started < 8000) {
    if (logs.includes(`listening on ${port}`)) return;
    if (server.exitCode !== null) throw new Error(`server exited early: ${logs}`);
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`server did not start: ${logs}`);
}

// ── jsdom, and a fetch that speaks to the real server with a cookie jar ──────
const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", pretendToBeVisual: true });
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;
const realFetch = globalThis.fetch;
const jar = { cookie: "" };
globalThis.fetch = async (input, init = {}) => {
  const target = String(input).startsWith("http") ? String(input) : `http://127.0.0.1:${port}${input}`;
  const headers = { ...(init.headers || {}), ...(jar.cookie ? { Cookie: jar.cookie } : {}) };
  const response = await realFetch(target, { ...init, headers, redirect: "manual" });
  const setCookie = response.headers.get("set-cookie");
  if (setCookie) jar.cookie = setCookie.split(";")[0];
  return response;
};

const vite = await createViteServer({
  configFile: false,
  logLevel: "silent",
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true },
  appType: "custom",
});

/** A distinct module instance stands in for a distinct device. */
async function freshDevice(tag) {
  dom.window.localStorage.clear();
  // Only db.ts is versioned: it imports platformSync unversioned, so the sync
  // helpers have to be reached through db to hit the same module instance the
  // write-through queued into.
  const db = await vite.ssrLoadModule(`/src/lib/db.ts?v=${tag}`);
  return { db, sync: db };
}

async function signIn(email, password) {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  assert.equal(response.status, 200, `${email} should sign in (${response.status})`);
  const body = await response.json();
  return body.account;
}

const PROGRESS = { "sr-intro": { completed: true, done: ["cat", "ls"] }, "sr-help": { completed: false, done: [] } };

try {
  await waitForServer();

  // ── Device 1: the demo player earns some progress ────────────────────────
  const deviceA = await freshDevice("a");
  const nova = await signIn("nova@ionio.gr", "demodemo");
  deviceA.db.establishAuthenticatedUser(nova.email, nova.nickname);
  const novaId = deviceA.db.getDB().sessionUserId;
  assert.ok(novaId, "the demo player has a session after signing in");
  deviceA.db.updateUser(novaId, { progress: PROGRESS, badges: ["first-steps"] });
  await deviceA.db.flushPlatformWrites();

  const published = await (await fetch("/api/platform")).json();
  const novaOnServer = published.platform.users.find((user) => user.id === "nova@ionio.gr");
  assert.ok(novaOnServer, "the player record reached the server");
  assert.deepEqual(novaOnServer.progress, PROGRESS, "progress reached the server");
  assert.deepEqual(novaOnServer.badges, ["first-steps"], "badges reached the server");
  assert.equal(novaOnServer.passwordHash, undefined, "no credential travelled to the server");

  // ── Device 2: same player, browser storage gone entirely ─────────────────
  const deviceB = await freshDevice("b");
  assert.equal(dom.window.localStorage.length, 0, "the second device starts with no localStorage");
  await signIn("nova@ionio.gr", "demodemo");
  deviceB.db.establishAuthenticatedUser(nova.email, nova.nickname);
  const hydrated = await deviceB.db.hydrateFromServer();
  assert.equal(hydrated, true, "the second device hydrated from the server");
  const restored = deviceB.db.userById("nova@ionio.gr");
  assert.ok(restored, "the player exists on the new device");
  assert.deepEqual(restored.progress, PROGRESS, "progress came back from the server, not from localStorage");
  assert.deepEqual(restored.badges, ["first-steps"], "badges came back from the server");

  // ── Device 3: a different player can see that progress ───────────────────
  const registerOla = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: "ola@ionio.gr", nickname: "Ola", password: "ola-password-123" }),
  });
  assert.ok([201, 409].includes(registerOla.status), `registering Ola: ${registerOla.status}`);
  const deviceC = await freshDevice("c");
  const ola = await signIn("ola@ionio.gr", "ola-password-123");
  deviceC.db.establishAuthenticatedUser(ola.email, ola.nickname);
  await deviceC.db.hydrateFromServer();
  const seenByOla = deviceC.db.userById("nova@ionio.gr");
  assert.ok(seenByOla, "another player can see the demo player's profile");
  assert.deepEqual(seenByOla.progress, PROGRESS, "another player can see the demo player's progress");

  // Ola's own progress does not disturb what Nova published.
  deviceC.db.updateUser(deviceC.db.getDB().sessionUserId, { progress: { "sr-net": { completed: true, done: [] } } });
  await deviceC.db.flushPlatformWrites();
  const afterOla = await (await fetch("/api/platform")).json();
  assert.deepEqual(
    afterOla.platform.users.find((user) => user.id === "nova@ionio.gr").progress,
    PROGRESS,
    "one player writing does not overwrite another's progress",
  );
  assert.equal(afterOla.platform.users.length, 2, "both players are on the server");

  // ── Device 4: the educator posts a ticket every player then sees ─────────
  const deviceD = await freshDevice("d");
  const teacher = await signIn("educator@ionio.gr", "teach123");
  assert.equal(teacher.role, "educator", "the server reports the educator's role, and it decides it");
  deviceD.db.establishAuthenticatedUser(teacher.email, teacher.nickname, teacher.role);
  const educatorId = deviceD.db.getDB().sessionUserId;
  assert.equal(deviceD.db.userById(educatorId)?.role, "educator", "the demo educator signs in as an educator");
  const ticket = {
    id: "ticket-sync-1",
    subject: "Lab 06 walkthrough on Friday",
    body: "Bring the case notes.",
    status: "open",
    authorId: educatorId,
    createdAt: Date.now(),
  };
  deviceD.db.getDB().tickets.push(ticket);
  deviceD.db.saveDB();
  await deviceD.db.flushPlatformWrites();

  const deviceE = await freshDevice("e");
  await signIn("ola@ionio.gr", "ola-password-123");
  const olaAgain = deviceE.db.userById("ola@ionio.gr");
  deviceE.db.establishAuthenticatedUser(olaAgain?.email || "ola@ionio.gr", olaAgain?.displayName || "Ola");
  await deviceE.db.hydrateFromServer();
  assert.ok(
    deviceE.db.getDB().tickets.some((item) => item.id === "ticket-sync-1"),
    "a ticket the educator posts reaches the other players",
  );

  console.log("Platform sync checks passed: progress and badges written in the app reach the server, a player who returns on a device with no localStorage gets them back from the server, another player can read them, one player's write does not disturb another's record, and a ticket the educator posts reaches the other players.");
} catch (error) {
  console.error(error);
  if (logs) console.error("--- server log ---\n" + logs.slice(-1200));
  process.exitCode = 1;
} finally {
  await vite.close();
  server.kill("SIGKILL");
  await rm(tempDir, { recursive: true, force: true });
}
