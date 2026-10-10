import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { createServer } from "vite";

const dom = new JSDOM("<!doctype html><html><body><div id=\"root\"></div></body></html>", {
  url: "http://localhost/",
  pretendToBeVisual: true,
});
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.HTMLInputElement = dom.window.HTMLInputElement;
globalThis.HTMLTextAreaElement = dom.window.HTMLTextAreaElement;
globalThis.HTMLSelectElement = dom.window.HTMLSelectElement;
globalThis.Event = dom.window.Event;
globalThis.MouseEvent = dom.window.MouseEvent;
globalThis.Node = dom.window.Node;
globalThis.SVGElement = dom.window.SVGElement;
globalThis.getComputedStyle = dom.window.getComputedStyle;
dom.window.matchMedia = (query) => ({
  matches: false, media: query, onchange: null,
  addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {},
  dispatchEvent: () => false,
});
globalThis.matchMedia = dom.window.matchMedia;
globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.localStorage = dom.window.localStorage;
// AuthProvider probes the API for a university session on mount.
globalThis.fetch = async () => ({ ok: false, status: 401, json: async () => ({}) });

const React = (await import("react")).default;
const { act } = await import("react");
const { createRoot } = await import("react-dom/client");

const values = dom.window.localStorage;
const KEY = "gamehack.platform.v1";

const server = await createServer({
  configFile: false,
  logLevel: "silent",
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true },
  appType: "custom",
});

try {
  const db = await server.ssrLoadModule("/src/lib/db.ts");

  // ── Both documented logins work out of the box ────────────────────────────
  db.resetAll();
  assert.equal(db.login("nova", "demodemo").ok, true, "nova signs in with demodemo");
  db.logout();
  assert.equal(db.login("educator", "teach123").ok, true, "the educator signs in with teach123");
  db.logout();
  assert.equal(db.login("nova", "demo").ok, false, "the old demo password no longer works");
  assert.equal(db.login("nova", "demodemo ").ok, false, "the password is not merely trimmed into shape");
  const nova = db.allPlayers().find((player) => player.username === "nova");
  const educator = db.allEducators().find((user) => user.username === "educator");
  assert.equal(nova.role, "player", "nova stays a player account");
  assert.equal(educator.role, "educator", "the seeded instructor stays an educator");
  for (const account of [nova, educator]) {
    assert.match(account.passwordHash, /^scrypt\$/i, "the guaranteed logins are stored hashed, never in clear");
  }

  // ── Wiping them out of storage brings them back ───────────────────────────
  const stored = JSON.parse(values.getItem(KEY));
  stored.users = stored.users.filter((user) => user.username !== "nova" && user.username !== "educator");
  values.setItem(KEY, JSON.stringify(stored));
  const revived = await server.ssrLoadModule("/src/lib/db.ts?v=revive");
  assert.equal(revived.login("nova", "demodemo").ok, true, "deleting nova from storage does not remove the demo login");
  revived.logout();
  assert.equal(revived.login("educator", "teach123").ok, true, "deleting the educator from storage does not remove it either");
  revived.logout();

  // ── A changed password is restored, so the shared login cannot be locked out ──
  const drifted = await server.ssrLoadModule("/src/lib/db.ts?v=drift");
  const target = drifted.allPlayers().find((player) => player.username === "nova");
  target.passwordHash = "scrypt$" + "00".repeat(16) + "$" + "11".repeat(64);
  drifted.saveDB();
  const healed = await server.ssrLoadModule("/src/lib/db.ts?v=healed");
  assert.equal(healed.login("nova", "demodemo").ok, true, "a drifted demo password is reset to the documented one");
  healed.logout();

  // ── The login screen advertises the player demo and nothing else ──────────
  const [{ default: AuthScreen }, { AuthProvider }] = await Promise.all([
    server.ssrLoadModule("/src/components/AuthScreen.tsx"),
    server.ssrLoadModule("/src/lib/useAuth.tsx"),
  ]);
  const container = document.getElementById("root");
  const root = createRoot(container);
  await act(async () => {
    root.render(React.createElement(AuthProvider, null, React.createElement(AuthScreen, { initialMode: "in" })));
  });
  const rendered = container.textContent;
  assert.ok(rendered.includes("nova / demodemo"), "the login screen advertises the player demo login");
  assert.equal(rendered.includes("teach123"), false, "the instructor password is never shown on the login screen");
  assert.equal(rendered.includes("educator /"), false, "no instructor credential pair is shown");
  assert.equal(rendered.toLowerCase().includes("dr. mara vance"), false, "the instructor is not named on the login screen");
  const html = container.innerHTML;
  for (const secret of ["teach123", "demodemo"]) {
    const visible = rendered.includes(secret);
    const present = html.includes(secret);
    assert.equal(present, visible, `${secret} is not smuggled into a hidden attribute`);
  }
  act(() => root.unmount());

  console.log("Demo account checks passed: nova/demodemo and educator/teach123 always sign in, survive deletion and password drift, and the login screen advertises only the player demo.");
} finally {
  await server.close();
}
