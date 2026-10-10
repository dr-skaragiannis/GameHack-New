import crypto from "node:crypto";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import nodemailer from "nodemailer";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
try {
  process.loadEnvFile(path.join(rootDir, ".env"));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}
const distDir = path.join(rootDir, "dist");
const dataFile = path.resolve(process.env.AUTH_DATA_FILE || path.join(rootDir, ".data", "accounts.json"));
const port = Number(process.env.PORT || process.env.API_PORT || 3000);
const sessionCookieName = "gamehack_session";
const legacySessionCookieName = "hackforge_session";
const sessionSecret = process.env.AUTH_SESSION_SECRET || crypto.randomBytes(32).toString("hex");
const activationLifetimeMs = 24 * 60 * 60 * 1000;
const resetLifetimeMs = 60 * 60 * 1000;
const sessionLifetimeSeconds = 7 * 24 * 60 * 60;
const minimumPasswordLength = 8;
const tokenHash = (token) => crypto.createHash("sha256").update(token).digest("hex");
const rateLimits = new Map();
const registeringEmails = new Set();

if (!process.env.AUTH_SESSION_SECRET) {
  console.warn("AUTH_SESSION_SECRET is not set; active sessions will be invalidated after a server restart.");
}

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 587);
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const mailFrom = process.env.MAIL_FROM;
const mailer = smtpHost && mailFrom && (!!smtpUser === !!smtpPass)
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === "true" : smtpPort === 465,
      ...(smtpUser ? { auth: { user: smtpUser, pass: smtpPass } } : {}),
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 15_000,
    })
  : null;

let store = { accounts: [], platform: null };
let saveQueue = Promise.resolve();

/**
 * Everything the platform used to keep in the browser's localStorage: player
 * progress, profiles, badges, tickets, messages, teams and the authored course
 * overlay. It lives here so a cohort shares one state and a redeploy or a
 * different device does not lose it.
 */
const PLATFORM_COLLECTIONS = [
  "users", "feed", "tickets", "messages", "chats", "teams", "teamApplications", "commandLog",
];

function defaultPlatform() {
  const base = { revision: 0, contentOverlay: {}, updatedAt: 0 };
  for (const name of PLATFORM_COLLECTIONS) base[name] = [];
  return base;
}

/**
 * Whether a store file was actually on disk at boot. The demo logins are
 * provisioned when it is missing, so an account count can never be zero again -
 * this flag is what still tells an operator their volume is not attached.
 */
let storeFileExisted = false;

// A whole classroom travels as one document, so the auth body limit is far too
// small. This is the ceiling for platform payloads.
const PLATFORM_BODY_LIMIT = 8 * 1024 * 1024;

async function readLargeJson(req, limit) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > limit) throw Object.assign(new Error("body-too-large"), { statusCode: 413 });
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    throw Object.assign(new Error("invalid-json"), { statusCode: 400 });
  }
}

/** Emails that may write the shared collections (tickets, teams, overlay...). */
function educatorEmails() {
  return String(process.env.EDUCATOR_EMAILS || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function isEducatorAccount(account) {
  const email = String(account.email || "").trim().toLowerCase();
  return account.role === "educator" || educatorEmails().includes(email);
}

/**
 * A player may only ever write their own record. Whatever else the client
 * claims, the identity, credentials and role stay what the server already has.
 */
function sanitizeSelfUser(incoming, existing, account) {
  const base = existing ? { ...existing } : {};
  const safe = { ...base, ...incoming };
  safe.id = base.id || incoming.id;
  safe.username = base.username || incoming.username;
  safe.displayName = base.displayName || incoming.displayName;
  // Never accept authority or credentials from the browser.
  delete safe.passwordHash;
  delete safe.recoveryKeyHash;
  safe.role = base.role || (isEducatorAccount(account) ? "educator" : "player");
  if (existing) {
    safe.passwordHash = existing.passwordHash;
    safe.recoveryKeyHash = existing.recoveryKeyHash;
    safe.role = existing.role || safe.role;
  }
  safe.email = account.email;
  return safe;
}

/**
 * Personal activity logs are append-only per player: a client can add its own
 * entries but cannot rewrite or delete somebody else's history.
 */
function mergeOwnEntries(list, incoming, ownerId) {
  if (!Array.isArray(incoming)) return 0;
  const mine = new Set(
    list.filter((item) => String(item?.userId || "").toLowerCase() === ownerId)
      .map((item) => item.id),
  );
  let added = 0;
  for (const entry of incoming) {
    if (!entry || typeof entry !== "object") continue;
    if (String(entry.userId || "").toLowerCase() !== ownerId) continue;
    if (entry.id && mine.has(entry.id)) continue;
    list.push(entry);
    if (entry.id) mine.add(entry.id);
    added += 1;
  }
  return added;
}

try {
  const parsed = JSON.parse(await fs.readFile(dataFile, "utf8"));
  if (parsed && Array.isArray(parsed.accounts)) store = { ...parsed };
  storeFileExisted = true;
  if (!store.platform || typeof store.platform !== "object") store.platform = defaultPlatform();
  for (const name of PLATFORM_COLLECTIONS) {
    if (!Array.isArray(store.platform[name])) store.platform[name] = [];
  }
} catch (error) {
  if (error.code !== "ENOENT") {
    console.error(`Could not read auth data at ${dataFile}:`, error);
    process.exit(1);
  }
}

function isScryptPasswordHash(value) {
  return typeof value === "string" && /^scrypt\$[0-9a-f]{32}\$[0-9a-f]{128}$/i.test(value);
}

async function saveStore() {
  const contents = JSON.stringify(store, null, 2);
  saveQueue = saveQueue.catch(() => {}).then(async () => {
    await fs.mkdir(path.dirname(dataFile), { recursive: true });
    const tempFile = `${dataFile}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tempFile, contents, { encoding: "utf8", mode: 0o600 });
    await fs.rename(tempFile, dataFile);
    await fs.chmod(dataFile, 0o600).catch(() => {});
  });
  return saveQueue;
}

function validUniversityEmail(value) {
  if (typeof value !== "string") return false;
  const email = value.trim();
  return email.length <= 254 && /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@ionio\.gr$/i.test(email);
}

function cleanNickname(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}

function publicAccount(account) {
  // The role is decided here, never by the client, so the browser cannot claim
  // authority it does not have.
  return {
    email: account.email,
    nickname: account.nickname,
    role: isEducatorAccount(account) ? "educator" : "player",
  };
}

function sendJson(res, status, body, headers = {}) {
  res.writeHead(status, {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
    ...headers,
  });
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 16_384) throw Object.assign(new Error("body-too-large"), { statusCode: 413 });
    chunks.push(chunk);
  }
  try {
    const parsed = JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("invalid-json");
    return parsed;
  } catch {
    throw Object.assign(new Error("invalid-json"), { statusCode: 400 });
  }
}

function clientAddress(req) {
  return (req.headers["x-forwarded-for"] || "").split(",")[0].trim() || req.socket.remoteAddress || "unknown";
}

function isRateLimited(req, route, limit, intervalMs) {
  const key = `${route}:${clientAddress(req)}`;
  const now = Date.now();
  const recent = (rateLimits.get(key) || []).filter((timestamp) => now - timestamp < intervalMs);
  if (recent.length >= limit) {
    rateLimits.set(key, recent);
    return true;
  }
  recent.push(now);
  rateLimits.set(key, recent);
  return false;
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, derivedKey) => {
      if (error) return reject(error);
      resolve(`scrypt$${salt.toString("hex")}$${derivedKey.toString("hex")}`);
    });
  });
}

async function verifyPassword(password, savedHash) {
  const [algorithm, saltHex, expectedHex] = String(savedHash || "").split("$");
  if (algorithm !== "scrypt" || !saltHex || !expectedHex) return false;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(expectedHex, "hex");
  if (expected.length !== 64) return false;
  const actual = await new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, expected.length, (error, derivedKey) => {
      if (error) return reject(error);
      resolve(derivedKey);
    });
  });
  return crypto.timingSafeEqual(expected, actual);
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[char]);
}

function appOrigin(req) {
  const configured = process.env.APP_ORIGIN?.trim();
  if (configured) return new URL(configured).origin;
  const origin = req.headers.origin;
  if (origin && /^https?:\/\//i.test(origin)) return new URL(origin).origin;
  const forwardedProto = String(req.headers["x-forwarded-proto"] || "").split(",")[0].trim();
  const protocol = forwardedProto || (process.env.NODE_ENV === "production" ? "https" : "http");
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost:5173";
  return new URL(`${protocol}://${host}`).origin;
}

function mailReady() {
  return !!mailer && !!mailFrom;
}

async function sendActivationEmail(req, account, token) {
  const link = new URL("/", appOrigin(req));
  link.searchParams.set("activate", token);
  const nickname = escapeHtml(account.nickname);
  await mailer.sendMail({
    from: mailFrom,
    to: account.email,
    subject: "Activate your GameHack account",
    text: `Hi ${account.nickname},\n\nActivate your GameHack account using this link (expires in 24 hours):\n${link.href}\n\nIf you did not request this account, you can ignore this email.`,
    html: `<p>Hi ${nickname},</p><p>Activate your GameHack account using the link below. It expires in 24 hours.</p><p><a href="${link.href}">Activate account</a></p><p>If you did not request this account, you can ignore this email.</p>`,
  });
}

async function sendResetEmail(req, account, token) {
  const link = new URL("/", appOrigin(req));
  link.searchParams.set("reset", token);
  const nickname = escapeHtml(account.nickname);
  await mailer.sendMail({
    from: mailFrom,
    to: account.email,
    subject: "Reset your GameHack password",
    text: `Hi ${account.nickname},\n\nUse this link to reset your GameHack password (expires in 1 hour):\n${link.href}\n\nIf you did not request a password reset, you can ignore this email.`,
    html: `<p>Hi ${nickname},</p><p>Use the link below to reset your GameHack password. It expires in one hour.</p><p><a href="${link.href}">Reset password</a></p><p>If you did not request a password reset, you can ignore this email.</p>`,
  });
}

function signSession(account, authMethod = "password") {
  const payload = Buffer.from(JSON.stringify({
    sub: account.email,
    ver: account.sessionVersion,
    authMethod,
    exp: Math.floor(Date.now() / 1000) + sessionLifetimeSeconds,
  })).toString("base64url");
  const signature = crypto.createHmac("sha256", sessionSecret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function readCookie(req, name) {
  const item = String(req.headers.cookie || "").split(";").map((value) => value.trim()).find((value) => value.startsWith(`${name}=`));
  return item ? item.slice(name.length + 1) : "";
}

function authenticatedSession(req) {
  const token = readCookie(req, sessionCookieName) || readCookie(req, legacySessionCookieName);
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;
  const expected = crypto.createHmac("sha256", sessionSecret).update(payload).digest();
  let actual;
  try {
    actual = Buffer.from(signature, "base64url");
  } catch {
    return null;
  }
  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) return null;

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!decoded.sub || decoded.exp <= Date.now() / 1000) return null;
    const account = store.accounts.find((item) => item.email === decoded.sub && item.activatedAt);
    if (!account || account.sessionVersion !== decoded.ver) return null;
    return { account, authMethod: decoded.authMethod === "recovery" ? "recovery" : "password" };
  } catch {
    return null;
  }
}

function authenticatedAccount(req) {
  return authenticatedSession(req)?.account || null;
}

function sessionCookie(req, token, maxAge, name = sessionCookieName) {
  const forwardedProto = String(req.headers["x-forwarded-proto"] || "").split(",")[0].trim();
  const secure = process.env.NODE_ENV === "production" || forwardedProto === "https";
  return `${name}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secure ? "; Secure" : ""}`;
}

async function handleAuth(req, res, pathname) {
  if (req.method === "GET" && pathname === "/api/auth/me") {
    const account = authenticatedAccount(req);
    if (!account) return sendJson(res, 401, { error: "notAuthenticated" });
    return sendJson(res, 200, { account: publicAccount(account) });
  }

  if (req.method === "POST" && pathname === "/api/auth/logout") {
    return sendJson(res, 200, { ok: true }, {
      "Set-Cookie": [
        sessionCookie(req, "", 0),
        sessionCookie(req, "", 0, legacySessionCookieName),
      ],
    });
  }

  if (req.method !== "POST") return sendJson(res, 405, { error: "methodNotAllowed" }, { Allow: "GET, POST" });

  let body;
  try {
    body = await readJson(req);
  } catch (error) {
    return sendJson(res, error.statusCode || 400, { error: error.message === "body-too-large" ? "requestTooLarge" : "invalidRequest" });
  }

  if (pathname === "/api/auth/register") {
    if (isRateLimited(req, "register", 6, 10 * 60 * 1000)) return sendJson(res, 429, { error: "tryAgainLater" });
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const nickname = cleanNickname(body.nickname);
    const password = typeof body.password === "string" ? body.password : "";
    if (!validUniversityEmail(email)) return sendJson(res, 400, { error: "universityEmailOnly" });
    if (!nickname) return sendJson(res, 400, { error: "nicknameRequired" });
    if (nickname.length > 32) return sendJson(res, 400, { error: "nicknameTooLong" });
    if (!password || password.length < minimumPasswordLength) return sendJson(res, 400, { error: "passwordTooShort" });

    if (registeringEmails.has(email)) return sendJson(res, 409, { error: "registrationInProgress" });
    registeringEmails.add(email);
    try {
      let account = store.accounts.find((item) => item.email === email);
      if (account?.activatedAt) return sendJson(res, 409, { error: "emailAlreadyRegistered" });
      const previousAccount = account ? { ...account } : null;
      const now = Date.now();
      const passwordHash = await hashPassword(password);
      const recoveryKey = crypto.randomBytes(32).toString("base64url");
      if (!account) {
        account = {
          email,
          nickname,
          passwordHash,
          createdAt: now,
          activatedAt: now,
          activationTokenHash: null,
          activationExpiresAt: null,
          recoveryKeyHash: tokenHash(recoveryKey),
          resetTokenHash: null,
          resetExpiresAt: null,
          sessionVersion: 0,
        };
        store.accounts.push(account);
      } else {
        account.nickname = nickname;
        account.passwordHash = passwordHash;
        account.activatedAt = now;
        account.activationTokenHash = null;
        account.activationExpiresAt = null;
        account.recoveryKeyHash = tokenHash(recoveryKey);
        account.resetTokenHash = null;
        account.resetExpiresAt = null;
        account.sessionVersion = (account.sessionVersion || 0) + 1;
      }
      try {
        await saveStore();
      } catch (error) {
        if (previousAccount) Object.assign(account, previousAccount);
        else store.accounts = store.accounts.filter((item) => item.email !== email);
        throw error;
      }
      return sendJson(res, 201, {
        ok: true,
        message: "registrationComplete",
        account: publicAccount(account),
        recoveryKey,
      });
    } finally {
      registeringEmails.delete(email);
    }
  }

  if (pathname === "/api/auth/activate") {
    if (isRateLimited(req, "activate", 20, 10 * 60 * 1000)) return sendJson(res, 429, { error: "tryAgainLater" });
    const token = typeof body.token === "string" ? body.token : "";
    const tokenDigest = tokenHash(token);
    const account = store.accounts.find((item) => item.activationTokenHash === tokenDigest);
    if (!account || account.activationExpiresAt < Date.now()) return sendJson(res, 400, { error: "activationLinkExpired" });
    account.activatedAt = Date.now();
    account.activationTokenHash = null;
    account.activationExpiresAt = null;
    await saveStore();
    return sendJson(res, 200, { ok: true, message: "accountActivated" });
  }

  if (pathname === "/api/auth/login") {
    if (isRateLimited(req, "login", 15, 10 * 60 * 1000)) return sendJson(res, 429, { error: "tryAgainLater" });
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (!validUniversityEmail(email)) return sendJson(res, 401, { error: "invalidCredentials" });
    const account = store.accounts.find((item) => item.email === email);
    if (!account || !(await verifyPassword(password, account.passwordHash))) {
      return sendJson(res, 401, { error: "invalidCredentials" });
    }
    if (!account.activatedAt) {
      account.activatedAt = Date.now();
      account.activationTokenHash = null;
      account.activationExpiresAt = null;
      await saveStore();
    }
    const cookie = sessionCookie(req, signSession(account), sessionLifetimeSeconds);
    return sendJson(res, 200, { account: publicAccount(account) }, { "Set-Cookie": cookie });
  }

  if (pathname === "/api/auth/login-with-key") {
    if (isRateLimited(req, "login-key", 15, 10 * 60 * 1000)) return sendJson(res, 429, { error: "tryAgainLater" });
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const recoveryKey = typeof body.recoveryKey === "string" ? body.recoveryKey.trim() : "";
    if (!validUniversityEmail(email) || !/^[A-Za-z0-9_-]{43}$/.test(recoveryKey)) {
      return sendJson(res, 401, { error: "invalidRecoveryKey" });
    }
    const account = store.accounts.find((item) => item.email === email && item.activatedAt);
    if (!account || !account.recoveryKeyHash || tokenHash(recoveryKey) !== account.recoveryKeyHash) {
      return sendJson(res, 401, { error: "invalidRecoveryKey" });
    }
    const cookie = sessionCookie(req, signSession(account, "recovery"), sessionLifetimeSeconds);
    return sendJson(res, 200, { account: publicAccount(account) }, { "Set-Cookie": cookie });
  }

  if (pathname === "/api/auth/change-password") {
    if (isRateLimited(req, "change-password", 12, 10 * 60 * 1000)) return sendJson(res, 429, { error: "tryAgainLater" });
    const session = authenticatedSession(req);
    if (!session) return sendJson(res, 401, { error: "notAuthenticated" });
    const currentPassword = typeof body.currentPassword === "string" ? body.currentPassword : "";
    const newPassword = typeof body.newPassword === "string" ? body.newPassword : "";
    if (newPassword.length < minimumPasswordLength) return sendJson(res, 400, { error: "passwordTooShort" });
    if (session.authMethod !== "recovery" || currentPassword) {
      if (!currentPassword) return sendJson(res, 400, { error: "currentPasswordRequired" });
      if (!(await verifyPassword(currentPassword, session.account.passwordHash))) {
        return sendJson(res, 400, { error: "currentPasswordIncorrect" });
      }
    }
    session.account.passwordHash = await hashPassword(newPassword);
    session.account.sessionVersion = (session.account.sessionVersion || 0) + 1;
    session.account.resetTokenHash = null;
    session.account.resetExpiresAt = null;
    await saveStore();
    const cookie = sessionCookie(req, signSession(session.account), sessionLifetimeSeconds);
    return sendJson(res, 200, { ok: true, message: "passwordChanged" }, { "Set-Cookie": cookie });
  }

  if (pathname === "/api/auth/recovery-key/rotate") {
    if (isRateLimited(req, "recovery-key-rotate", 10, 10 * 60 * 1000)) return sendJson(res, 429, { error: "tryAgainLater" });
    const account = authenticatedAccount(req);
    if (!account) return sendJson(res, 401, { error: "notAuthenticated" });
    const recoveryKey = crypto.randomBytes(32).toString("base64url");
    account.recoveryKeyHash = tokenHash(recoveryKey);
    await saveStore();
    return sendJson(res, 200, { ok: true, message: "recoveryKeyRotated", recoveryKey });
  }

  if (pathname === "/api/auth/forgot-password") {
    if (isRateLimited(req, "forgot", 5, 10 * 60 * 1000)) return sendJson(res, 429, { error: "tryAgainLater" });
    if (!mailReady()) return sendJson(res, 503, { error: "emailServiceUnavailable" });
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const account = validUniversityEmail(email)
      ? store.accounts.find((item) => item.email === email && item.activatedAt)
      : null;
    if (account) {
      const token = crypto.randomBytes(32).toString("base64url");
      account.resetTokenHash = tokenHash(token);
      account.resetExpiresAt = Date.now() + resetLifetimeMs;
      await saveStore();
      try {
        await sendResetEmail(req, account, token);
      } catch (error) {
        account.resetTokenHash = null;
        account.resetExpiresAt = null;
        await saveStore();
        console.error("Password reset email delivery failed:", error);
        return sendJson(res, 502, { error: "emailDeliveryFailed" });
      }
    }
    // Return the same response for unknown and known accounts to avoid account enumeration.
    return sendJson(res, 200, { ok: true, message: "resetEmailIfAccountExists" });
  }

  if (pathname === "/api/auth/reset-password") {
    if (isRateLimited(req, "reset", 10, 10 * 60 * 1000)) return sendJson(res, 429, { error: "tryAgainLater" });
    const token = typeof body.token === "string" ? body.token : "";
    const password = typeof body.password === "string" ? body.password : "";
    if (password.length < minimumPasswordLength) return sendJson(res, 400, { error: "passwordTooShort" });
    const tokenDigest = tokenHash(token);
    const account = store.accounts.find((item) => item.resetTokenHash === tokenDigest);
    if (!account || !account.resetExpiresAt || account.resetExpiresAt < Date.now()) {
      return sendJson(res, 400, { error: "resetLinkExpired" });
    }
    account.passwordHash = await hashPassword(password);
    account.resetTokenHash = null;
    account.resetExpiresAt = null;
    account.sessionVersion++;
    await saveStore();
    return sendJson(res, 200, { ok: true, message: "passwordReset" });
  }

  return sendJson(res, 404, { error: "notFound" });
}

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".woff2": "font/woff2",
};

async function serveStatic(req, res, pathname) {
  if (req.method !== "GET" && req.method !== "HEAD") return sendJson(res, 404, { error: "notFound" });
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    return sendJson(res, 400, { error: "invalidPath" });
  }
  const candidate = path.resolve(distDir, `.${decodedPath}`);
  if (candidate !== distDir && !candidate.startsWith(`${distDir}${path.sep}`)) {
    return sendJson(res, 400, { error: "invalidPath" });
  }
  let file = candidate;
  try {
    const stat = await fs.stat(file);
    if (!stat.isFile()) file = path.join(distDir, "index.html");
  } catch {
    file = path.join(distDir, "index.html");
  }
  try {
    const contents = await fs.readFile(file);
    res.writeHead(200, {
      "Cache-Control": file.endsWith("index.html") ? "no-cache" : "public, max-age=3600",
      "Content-Type": mimeTypes[path.extname(file)] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
    });
    res.end(req.method === "HEAD" ? undefined : contents);
  } catch {
    sendJson(res, 503, { error: "appBuildMissing" });
  }
}

/**
 * Whether the account store can actually be written. A read-only or missing
 * mount means every registration and key rotation is silently lost on restart,
 * which is the failure this endpoint exists to make visible.
 */
async function probePersistence() {
  const directory = path.dirname(dataFile);
  let writable = false;
  try {
    await fs.mkdir(directory, { recursive: true });
    const probe = path.join(directory, `.write-probe-${process.pid}`);
    await fs.writeFile(probe, "ok", { encoding: "utf8" });
    await fs.rm(probe, { force: true });
    writable = true;
  } catch {
    writable = false;
  }
  let persisted = false;
  try {
    persisted = (await fs.stat(dataFile)).isFile();
  } catch {
    persisted = false;
  }
  return { path: dataFile, directory, writable, persisted, accounts: store.accounts.length };
}

async function handleHealth(req, res) {
  if (req.method !== "GET" && req.method !== "HEAD") return sendJson(res, 405, { error: "methodNotAllowed" });
  const persistence = await probePersistence();
  // The service is up even when the store cannot be written, so report 200 and
  // let the operator read the flags; a 503 here would only page about a warning.
  return sendJson(res, 200, {
    ok: true,
    persistence,
    email: mailReady(),
    stableSessions: Boolean(process.env.AUTH_SESSION_SECRET),
  });
}

/**
 * The shared platform document. Any signed-in player can read all of it, which
 * is what makes other players, their progress and the leaderboard visible to
 * everybody. Writes are scoped: a player may replace only their own record and
 * append to their own activity, while the shared collections need an educator.
 */
async function handlePlatform(req, res, pathname) {
  const session = authenticatedSession(req);
  if (!session) return sendJson(res, 401, { error: "authenticationRequired" });
  const account = session.account;
  if (!store.platform) store.platform = defaultPlatform();
  const identity = String(account.email || "").trim().toLowerCase();

  if (req.method === "GET" && pathname === "/api/platform") {
    return sendJson(res, 200, { ok: true, platform: store.platform });
  }

  if (req.method === "PUT" && pathname === "/api/platform/self") {
    const body = await readLargeJson(req, PLATFORM_BODY_LIMIT);
    const incoming = body && body.user;
    if (!incoming || typeof incoming !== "object") return sendJson(res, 400, { error: "userRequired" });
    const claimed = String(incoming.id || "").trim().toLowerCase();
    if (claimed && claimed !== identity) {
      return sendJson(res, 403, { error: "cannotWriteAnotherPlayer" });
    }
    const list = store.platform.users;
    const index = list.findIndex((item) => String(item.id || "").toLowerCase() === identity);
    const safe = sanitizeSelfUser(incoming, index >= 0 ? list[index] : null, account);
    safe.id = identity;
    safe.username = safe.username || identity;
    if (index >= 0) list[index] = safe; else list.push(safe);
    const addedLog = mergeOwnEntries(store.platform.commandLog, body.commandLog, identity);
    const addedFeed = mergeOwnEntries(store.platform.feed, body.feed, identity);
    store.platform.revision += 1;
    store.platform.updatedAt = Date.now();
    await saveStore();
    return sendJson(res, 200, {
      ok: true,
      revision: store.platform.revision,
      user: safe,
      addedLog,
      addedFeed,
    });
  }

  if (req.method === "PUT" && pathname === "/api/platform/shared") {
    if (!isEducatorAccount(account)) return sendJson(res, 403, { error: "educatorOnly" });
    const body = await readLargeJson(req, PLATFORM_BODY_LIMIT);
    const applied = [];
    for (const name of ["tickets", "messages", "chats", "teams", "teamApplications"]) {
      if (Array.isArray(body?.[name])) {
        store.platform[name] = body[name];
        applied.push(name);
      }
    }
    if (body?.contentOverlay && typeof body.contentOverlay === "object") {
      store.platform.contentOverlay = body.contentOverlay;
      applied.push("contentOverlay");
    }
    if (Array.isArray(body?.feed)) {
      store.platform.feed = body.feed;
      applied.push("feed");
    }
    store.platform.revision += 1;
    store.platform.updatedAt = Date.now();
    await saveStore();
    return sendJson(res, 200, { ok: true, revision: store.platform.revision, applied });
  }

  return sendJson(res, 405, { error: "methodNotAllowed" });
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", "http://localhost");
    if (url.pathname === "/api/health") return await handleHealth(req, res);
    if (url.pathname.startsWith("/api/auth/")) return await handleAuth(req, res, url.pathname);
    if (url.pathname === "/api/platform" || url.pathname.startsWith("/api/platform/")) {
      return await handlePlatform(req, res, url.pathname);
    }
    return await serveStatic(req, res, url.pathname);
  } catch (error) {
    console.error("Request failed:", error);
    if (!res.headersSent) sendJson(res, 500, { error: "serverError" });
    else res.destroy();
  }
});

async function upgradePlaintextPasswords() {
  let changed = false;
  for (const account of store.accounts) {
    if (typeof account.password === "string" && account.password) {
      account.passwordHash = await hashPassword(account.password);
      delete account.password;
      changed = true;
    }
    if (account.password) delete account.password;
    if (account.passwordHash && !isScryptPasswordHash(account.passwordHash)) {
      console.warn(`Account ${account.email} has a password hash that is not scrypt. It was left unchanged so an existing login is not destroyed.`);
    }
  }
  if (changed) await saveStore();
}

await upgradePlaintextPasswords();

/**
 * The two logins the platform must always offer: a player account for trying it
 * out and the instructor account. They are provisioned here rather than in the
 * browser, so a cohort shares one identity for them and their progress persists
 * on the server exactly like everybody else's.
 */
const DEMO_ACCOUNTS = [
  { email: "nova@ionio.gr", nickname: "Nova Reyes", password: "demodemo", role: "player" },
  { email: "educator@ionio.gr", nickname: "Dr. Mara Vance", password: "teach123", role: "educator" },
];

async function ensureDemoAccounts() {
  let changed = false;
  for (const demo of DEMO_ACCOUNTS) {
    const existing = store.accounts.find((item) => item.email === demo.email);
    if (existing) {
      if (existing.role !== demo.role) {
        existing.role = demo.role;
        changed = true;
      }
      continue;
    }
    const now = Date.now();
    store.accounts.push({
      email: demo.email,
      nickname: demo.nickname,
      passwordHash: await hashPassword(demo.password),
      role: demo.role,
      createdAt: now,
      activatedAt: now,
      activationTokenHash: null,
      activationExpiresAt: null,
      recoveryKeyHash: null,
      resetTokenHash: null,
      resetExpiresAt: null,
      sessionVersion: 0,
    });
    changed = true;
    console.log(`Provisioned the ${demo.role} demo account ${demo.email}.`);
  }
  if (changed) await saveStore();
}

await ensureDemoAccounts();

// Credentials and recovery keys live only in this file. Report where it is, and
// shout when it is empty or unwritable, before announcing that the service is
// up — an operator reading the boot log should hit the diagnosis first, and
// nothing that watches for "listening" should race the warnings.
const persistence = await probePersistence();
console.log(`Account store: ${persistence.path} (${persistence.accounts} account(s), writable: ${persistence.writable}, file present: ${persistence.persisted})`);
if (!persistence.writable) {
  console.warn(`The account store directory ${persistence.directory} is not writable. Registrations, password changes and recovery keys will be lost on restart. Mount persistent storage there or set AUTH_DATA_FILE to a durable path.`);
}
if (!storeFileExisted) {
  console.warn(`No accounts were found on disk at ${persistence.path}; the store file did not exist, so the demo logins were provisioned from scratch. If this service was deployed before, the previous store was not attached — every registered account, recovery key and all player progress from it is gone. Mount persistent storage at ${persistence.directory} (see README "Production deployment") so it survives a redeploy.`);
}
if (!process.env.AUTH_DATA_FILE && persistence.directory.startsWith(rootDir)) {
  console.warn(`AUTH_DATA_FILE is not set, so the store defaults to ${persistence.path} inside the application directory. In a container that path is part of the image layer and is discarded on every deploy. Set AUTH_DATA_FILE to a mounted volume.`);
}

server.listen(port, process.env.HOST || "0.0.0.0", () => {
  console.log(`GameHack server listening on ${port}`);
  if (!mailReady()) console.warn("Email is not configured; email-based password resets are disabled. Registration and recovery-key sign-in still work.");
});
