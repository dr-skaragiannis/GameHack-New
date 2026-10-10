import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer as createTcpServer } from "node:net";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tempDir = await mkdtemp(path.join(os.tmpdir(), "gamehack-platform-test-"));
const dataFile = path.join(tempDir, "accounts.json");

async function availablePort() {
  const probe = createTcpServer();
  await new Promise((resolve, reject) => probe.once("error", reject).listen(0, "127.0.0.1", resolve));
  const { port } = probe.address();
  await new Promise((resolve, reject) => probe.close((error) => (error ? reject(error) : resolve())));
  return port;
}

const educatorEmail = "teacher@ionio.gr";
let server = null;
let logs = "";

function startServer(port) {
  logs = "";
  const child = spawn(process.execPath, [path.join(rootDir, "server/index.mjs")], {
    cwd: rootDir,
    env: {
      ...process.env,
      PORT: String(port),
      HOST: "127.0.0.1",
      AUTH_DATA_FILE: dataFile,
      AUTH_SESSION_SECRET: "test-only-session-secret-that-is-long-enough",
      EDUCATOR_EMAILS: educatorEmail,
      SMTP_HOST: "", SMTP_PORT: "", SMTP_USER: "", SMTP_PASS: "", MAIL_FROM: "",
    },
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stdout.setEncoding("utf8").on("data", (chunk) => { logs += chunk; });
  child.stderr.setEncoding("utf8").on("data", (chunk) => { logs += chunk; });
  return child;
}

async function waitForServer(port) {
  const started = Date.now();
  while (Date.now() - started < 8000) {
    if (logs.includes(`listening on ${port}`)) return;
    if (server.exitCode !== null) throw new Error(`server exited early: ${logs}`);
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`server did not start: ${logs}`);
}

async function call(method, route, body, cookie) {
  return fetch(`http://127.0.0.1:${port}/${route.replace(/^\//, "")}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

async function signIn(email, password = "platform-test-password") {
  const registered = await call("POST", "/api/auth/register", { email, nickname: email.split("@")[0], password });
  assert.ok([201, 409].includes(registered.status), `registration of ${email}: ${registered.status}`);
  const login = await call("POST", "/api/auth/login", { email, password });
  assert.equal(login.status, 200, `${email} should sign in`);
  const cookie = login.headers.get("set-cookie")?.split(";")[0];
  assert.ok(cookie, `${email} should get a session cookie`);
  return cookie;
}

const port = await availablePort();

try {
  server = startServer(port);
  await waitForServer(port);

  const alice = await signIn("alice@ionio.gr");
  const bob = await signIn("bob@ionio.gr");
  const teacher = await signIn(educatorEmail);

  // ── The document is behind authentication ────────────────────────────────
  assert.equal((await call("GET", "/api/platform")).status, 401, "the platform needs a session");

  const empty = await (await call("GET", "/api/platform", undefined, alice)).json();
  assert.ok(empty.ok, "an authenticated player can read the platform");
  for (const name of ["users", "feed", "tickets", "messages", "chats", "teams", "teamApplications", "commandLog"]) {
    assert.ok(Array.isArray(empty.platform[name]), `the platform carries ${name}`);
  }
  assert.equal(typeof empty.platform.revision, "number", "the platform is versioned");

  // ── A player writes their own progress, and only their own ───────────────
  const progress = { "sr-intro": { completed: true, done: ["cat", "ls"] } };
  const wrote = await call("PUT", "/api/platform/self", {
    user: {
      id: "alice@ionio.gr",
      displayName: "Alice",
      avatar: "cybereye",
      progress,
      badges: ["first-blood"],
      metrics: { xp: 120 },
    },
  }, alice);
  assert.equal(wrote.status, 200, "a player can save their own record");
  const wroteBody = await wrote.json();
  assert.deepEqual(wroteBody.user.progress, progress, "progress came back as it was sent");
  assert.equal(wroteBody.user.role, "player", "a fresh player is a player");

  const impersonate = await call("PUT", "/api/platform/self", {
    user: { id: "bob@ionio.gr", progress: { hacked: true } },
  }, alice);
  assert.equal(impersonate.status, 403, "a player cannot write another player's record");

  const escalate = await call("PUT", "/api/platform/self", {
    user: { id: "alice@ionio.gr", role: "educator", passwordHash: "attacker" },
  }, alice);
  const escalated = await escalate.json();
  assert.equal(escalated.user.role, "player", "a player cannot grant themselves the educator role");
  assert.equal(escalated.user.passwordHash, undefined, "a player cannot plant a password hash");

  // ── Progress is visible to the other players ─────────────────────────────
  const fromBob = await (await call("GET", "/api/platform", undefined, bob)).json();
  const aliceSeenByBob = fromBob.platform.users.find((user) => user.id === "alice@ionio.gr");
  assert.ok(aliceSeenByBob, "Bob can see Alice's profile");
  assert.deepEqual(aliceSeenByBob.progress, progress, "Bob can see Alice's progress");
  assert.deepEqual(aliceSeenByBob.badges, ["first-blood"], "Bob can see Alice's badges");

  // ── Personal activity is append-only ─────────────────────────────────────
  await call("PUT", "/api/platform/self", {
    user: { id: "alice@ionio.gr" },
    commandLog: [{ id: "c1", userId: "alice@ionio.gr", command: "ls" }],
  }, alice);
  await call("PUT", "/api/platform/self", {
    user: { id: "alice@ionio.gr" },
    commandLog: [
      { id: "c1", userId: "alice@ionio.gr", command: "ls" },
      { id: "c2", userId: "alice@ionio.gr", command: "ps" },
      { id: "c3", userId: "bob@ionio.gr", command: "rm -rf /" },
    ],
  }, alice);
  const afterLog = await (await call("GET", "/api/platform", undefined, bob)).json();
  const aliceLog = afterLog.platform.commandLog.filter((entry) => entry.userId === "alice@ionio.gr");
  assert.deepEqual(aliceLog.map((entry) => entry.id), ["c1", "c2"], "replaying an entry does not duplicate it");
  assert.ok(
    !afterLog.platform.commandLog.some((entry) => entry.id === "c3"),
    "a player cannot forge another player's activity",
  );

  // ── Shared collections need an educator ──────────────────────────────────
  const ticket = { id: "t1", subject: "Lab 3 is broken", body: "It will not start", status: "open" };
  const denied = await call("PUT", "/api/platform/shared", { tickets: [ticket] }, alice);
  assert.equal(denied.status, 403, "a player cannot write the shared collections");

  const allowed = await call("PUT", "/api/platform/shared", { tickets: [ticket] }, teacher);
  assert.equal(allowed.status, 200, "an educator can write the shared collections");
  const sharedSeenByBob = await (await call("GET", "/api/platform", undefined, bob)).json();
  assert.deepEqual(sharedSeenByBob.platform.tickets, [ticket], "every player sees the tickets an educator posts");

  // ── It survives a restart, because it is on the volume not in a browser ──
  const onDisk = JSON.parse(await readFile(dataFile, "utf8"));
  assert.ok(Array.isArray(onDisk.platform?.users), "the platform document is written to the store file");

  server.kill("SIGTERM");
  await new Promise((resolve) => server.once("exit", resolve));
  server = startServer(port);
  await waitForServer(port);

  const aliceAgain = await call("POST", "/api/auth/login", { email: "alice@ionio.gr", password: "platform-test-password" });
  const revivedCookie = aliceAgain.headers.get("set-cookie")?.split(";")[0];
  const revived = await (await call("GET", "/api/platform", undefined, revivedCookie)).json();
  const revivedAlice = revived.platform.users.find((user) => user.id === "alice@ionio.gr");
  assert.ok(revivedAlice, "the player record survives a server restart");
  assert.deepEqual(revivedAlice.progress, progress, "progress survives a server restart");
  assert.deepEqual(revived.platform.tickets, [ticket], "tickets survive a server restart");

  console.log("Platform store checks passed: the shared document sits behind the session, a player can write only their own record and cannot forge another player's activity or grant themselves the educator role, one player's progress and badges are readable by the others, an educator alone can post the shared collections, and the whole document survives a server restart on the mounted store.");
} catch (error) {
  console.error(error);
  if (logs) console.error("--- server log ---\n" + logs.slice(-1500));
  process.exitCode = 1;
} finally {
  if (server && server.exitCode === null) server.kill("SIGKILL");
  await rm(tempDir, { recursive: true, force: true });
}
