import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createServer as createTcpServer } from "node:net";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tempDir = await mkdtemp(path.join(os.tmpdir(), "gamehack-auth-test-"));
const dataFile = path.join(tempDir, "accounts.json");

async function availablePort() {
  const server = createTcpServer();
  await new Promise((resolve, reject) => server.once("error", reject).listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  return port;
}

const port = await availablePort();
const env = {
  ...process.env,
  PORT: String(port),
  HOST: "127.0.0.1",
  AUTH_DATA_FILE: dataFile,
  AUTH_SESSION_SECRET: "test-only-session-secret-that-is-long-enough",
  SMTP_HOST: "",
  SMTP_PORT: "",
  SMTP_USER: "",
  SMTP_PASS: "",
  MAIL_FROM: "",
};
const server = spawn(process.execPath, [path.join(rootDir, "server/index.mjs")], {
  cwd: rootDir,
  env,
  stdio: ["ignore", "pipe", "pipe"],
});
let logs = "";
server.stdout.setEncoding("utf8").on("data", (chunk) => { logs += chunk; });
server.stderr.setEncoding("utf8").on("data", (chunk) => { logs += chunk; });

async function waitForServer() {
  const started = Date.now();
  while (Date.now() - started < 8000) {
    if (logs.includes(`listening on ${port}`)) return;
    if (server.exitCode !== null) throw new Error(`Auth server exited early: ${logs}`);
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`Auth server did not start: ${logs}`);
}

function cookieFrom(response) {
  const cookie = response.headers.get("set-cookie")?.split(";")[0];
  assert.ok(cookie, "authenticated endpoint should set a session cookie");
  return cookie;
}

async function post(route, body, cookie) {
  return fetch(`http://127.0.0.1:${port}/api/auth/${route}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: JSON.stringify(body),
  });
}

try {
  await waitForServer();
  const email = "auth-test@ionio.gr";
  const originalPassword = "original-password-123";
  const newPassword = "updated-password-456";
  const recoveryPassword = "recovered-password-789";

  const registrationResponse = await post("register", { email, nickname: "Auth Test", password: originalPassword });
  assert.equal(registrationResponse.status, 201, "registration should not depend on an email service");
  const registration = await registrationResponse.json();
  assert.equal(registration.account.email, email);
  assert.match(registration.recoveryKey, /^[A-Za-z0-9_-]{43}$/);

  const duplicateResponse = await post("register", { email, nickname: "Duplicate", password: originalPassword });
  assert.equal(duplicateResponse.status, 409, "duplicate registrations should be rejected");

  const passwordLogin = await post("login", { email, password: originalPassword });
  assert.equal(passwordLogin.status, 200, "new accounts should be usable without email activation");
  const passwordCookie = cookieFrom(passwordLogin);
  assert.equal((await (await fetch(`http://127.0.0.1:${port}/api/auth/me`, { headers: { Cookie: passwordCookie } })).json()).account.email, email);

  const badCurrent = await post("change-password", { currentPassword: "wrong-password", newPassword }, passwordCookie);
  assert.equal(badCurrent.status, 400);
  assert.equal((await badCurrent.json()).error, "currentPasswordIncorrect");

  const changedPassword = await post("change-password", { currentPassword: originalPassword, newPassword }, passwordCookie);
  assert.equal(changedPassword.status, 200);
  const passwordChangedCookie = cookieFrom(changedPassword);
  const invalidatedSession = await fetch(`http://127.0.0.1:${port}/api/auth/me`, { headers: { Cookie: passwordCookie } });
  assert.equal(invalidatedSession.status, 401, "changing a password should invalidate older sessions");
  assert.equal((await post("login", { email, password: originalPassword })).status, 401);
  assert.equal((await post("login", { email, password: newPassword })).status, 200);

  const keyLogin = await post("login-with-key", { email, recoveryKey: registration.recoveryKey });
  assert.equal(keyLogin.status, 200, "the generated account-bound key should allow passwordless login");
  const recoveryCookie = cookieFrom(keyLogin);
  const recoveryPasswordChange = await post("change-password", { currentPassword: "", newPassword: recoveryPassword }, recoveryCookie);
  assert.equal(recoveryPasswordChange.status, 200, "a recovery-key session can set a new password without the forgotten password");
  assert.equal((await post("login", { email, password: recoveryPassword })).status, 200);
  assert.equal((await post("login-with-key", { email: "someone-else@ionio.gr", recoveryKey: registration.recoveryKey })).status, 401,
    "a recovery key must be restricted to its account");

  const rotateResponse = await post("recovery-key/rotate", {}, cookieFrom(recoveryPasswordChange));
  assert.equal(rotateResponse.status, 200);
  const rotated = await rotateResponse.json();
  assert.match(rotated.recoveryKey, /^[A-Za-z0-9_-]{43}$/);
  assert.notEqual(rotated.recoveryKey, registration.recoveryKey);
  assert.equal((await post("login-with-key", { email, recoveryKey: registration.recoveryKey })).status, 401,
    "rotating the key should invalidate the previously downloaded file");
  assert.equal((await post("login-with-key", { email, recoveryKey: rotated.recoveryKey })).status, 200);

  const savedStore = await readFile(dataFile, "utf8");
  assert.ok(savedStore.includes("recoveryKeyHash"));
  assert.ok(!savedStore.includes(registration.recoveryKey), "raw recovery keys must not be stored on the server");

  console.log("Auth checks passed: email-free registration, recovery-key login and rotation, account binding, and profile password changes.");
} finally {
  server.kill("SIGTERM");
  await new Promise((resolve) => {
    if (server.exitCode !== null) return resolve();
    server.once("exit", resolve);
    setTimeout(resolve, 1500);
  });
  if (server.exitCode === null) server.kill("SIGKILL");
  await rm(tempDir, { recursive: true, force: true });
}
