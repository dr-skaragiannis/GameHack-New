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
const sessionCookieName = "hackforge_session";
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

let store = { accounts: [] };
let saveQueue = Promise.resolve();

try {
  const parsed = JSON.parse(await fs.readFile(dataFile, "utf8"));
  if (parsed && Array.isArray(parsed.accounts)) store = parsed;
} catch (error) {
  if (error.code !== "ENOENT") {
    console.error(`Could not read auth data at ${dataFile}:`, error);
    process.exit(1);
  }
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
  return { email: account.email, nickname: account.nickname, role: "player" };
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
    subject: "Activate your HACKFORGE account",
    text: `Hi ${account.nickname},\n\nActivate your HACKFORGE account using this link (expires in 24 hours):\n${link.href}\n\nIf you did not request this account, you can ignore this email.`,
    html: `<p>Hi ${nickname},</p><p>Activate your HACKFORGE account using the link below. It expires in 24 hours.</p><p><a href="${link.href}">Activate account</a></p><p>If you did not request this account, you can ignore this email.</p>`,
  });
}

async function sendResetEmail(req, account, token) {
  const link = new URL("/", appOrigin(req));
  link.searchParams.set("reset", token);
  const nickname = escapeHtml(account.nickname);
  await mailer.sendMail({
    from: mailFrom,
    to: account.email,
    subject: "Reset your HACKFORGE password",
    text: `Hi ${account.nickname},\n\nUse this link to reset your HACKFORGE password (expires in 1 hour):\n${link.href}\n\nIf you did not request a password reset, you can ignore this email.`,
    html: `<p>Hi ${nickname},</p><p>Use the link below to reset your HACKFORGE password. It expires in one hour.</p><p><a href="${link.href}">Reset password</a></p><p>If you did not request a password reset, you can ignore this email.</p>`,
  });
}

function signSession(account) {
  const payload = Buffer.from(JSON.stringify({
    sub: account.email,
    ver: account.sessionVersion,
    exp: Math.floor(Date.now() / 1000) + sessionLifetimeSeconds,
  })).toString("base64url");
  const signature = crypto.createHmac("sha256", sessionSecret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function readCookie(req, name) {
  const item = String(req.headers.cookie || "").split(";").map((value) => value.trim()).find((value) => value.startsWith(`${name}=`));
  return item ? item.slice(name.length + 1) : "";
}

function authenticatedAccount(req) {
  const token = readCookie(req, sessionCookieName);
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
    return account;
  } catch {
    return null;
  }
}

function sessionCookie(req, token, maxAge) {
  const forwardedProto = String(req.headers["x-forwarded-proto"] || "").split(",")[0].trim();
  const secure = process.env.NODE_ENV === "production" || forwardedProto === "https";
  return `${sessionCookieName}=${token}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${maxAge}${secure ? "; Secure" : ""}`;
}

async function handleAuth(req, res, pathname) {
  if (req.method === "GET" && pathname === "/api/auth/me") {
    const account = authenticatedAccount(req);
    if (!account) return sendJson(res, 401, { error: "notAuthenticated" });
    return sendJson(res, 200, { account: publicAccount(account) });
  }

  if (req.method === "POST" && pathname === "/api/auth/logout") {
    return sendJson(res, 200, { ok: true }, { "Set-Cookie": sessionCookie(req, "", 0) });
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
    if (!mailReady()) return sendJson(res, 503, { error: "emailServiceUnavailable" });

    if (registeringEmails.has(email)) return sendJson(res, 409, { error: "registrationInProgress" });
    registeringEmails.add(email);
    try {
      let account = store.accounts.find((item) => item.email === email);
      if (account?.activatedAt) return sendJson(res, 409, { error: "emailAlreadyRegistered" });
      const previousAccount = account ? { ...account } : null;
      const passwordHash = await hashPassword(password);
      const token = crypto.randomBytes(32).toString("base64url");
      if (!account) {
        account = {
          email,
          nickname,
          passwordHash,
          createdAt: Date.now(),
          activatedAt: null,
          activationTokenHash: tokenHash(token),
          activationExpiresAt: Date.now() + activationLifetimeMs,
          resetTokenHash: null,
          resetExpiresAt: null,
          sessionVersion: 0,
        };
        store.accounts.push(account);
      } else {
        account.nickname = nickname;
        account.passwordHash = passwordHash;
        account.activationTokenHash = tokenHash(token);
        account.activationExpiresAt = Date.now() + activationLifetimeMs;
      }
      await saveStore();
      try {
        await sendActivationEmail(req, account, token);
      } catch (error) {
        if (previousAccount) Object.assign(account, previousAccount);
        else store.accounts = store.accounts.filter((item) => item.email !== email);
        await saveStore();
        console.error("Activation email delivery failed:", error);
        return sendJson(res, 502, { error: "emailDeliveryFailed" });
      }
      return sendJson(res, 200, { ok: true, message: "activationEmailSent" });
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
    if (!account) return sendJson(res, 401, { error: "invalidCredentials" });
    if (!account.activatedAt) return sendJson(res, 403, { error: "accountNeedsActivation" });
    if (!(await verifyPassword(password, account.passwordHash))) return sendJson(res, 401, { error: "invalidCredentials" });
    const cookie = sessionCookie(req, signSession(account), sessionLifetimeSeconds);
    return sendJson(res, 200, { account: publicAccount(account) }, { "Set-Cookie": cookie });
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

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || "/", "http://localhost");
    if (url.pathname.startsWith("/api/auth/")) return await handleAuth(req, res, url.pathname);
    return await serveStatic(req, res, url.pathname);
  } catch (error) {
    console.error("Request failed:", error);
    if (!res.headersSent) sendJson(res, 500, { error: "serverError" });
    else res.destroy();
  }
});

server.listen(port, process.env.HOST || "0.0.0.0", () => {
  console.log(`HACKFORGE server listening on ${port}`);
  if (!mailReady()) console.warn("Email is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER/SMTP_PASS, and MAIL_FROM to enable account emails.");
});
