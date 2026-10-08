import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { createServer } from "vite";

const dom = new JSDOM("<!doctype html><html><body></body></html>", { url: "http://localhost/", pretendToBeVisual: true });
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
class ResizeObserverStub { observe() {} unobserve() {} disconnect() {} }
dom.window.ResizeObserver = ResizeObserverStub;
globalThis.ResizeObserver = ResizeObserverStub;
dom.window.Element.prototype.scrollTo = function scrollTo() {};
dom.window.Element.prototype.scrollIntoView = function scrollIntoView() {};
globalThis.requestAnimationFrame = (cb) => setTimeout(() => cb(Date.now()), 0);
globalThis.cancelAnimationFrame = (id) => clearTimeout(id);
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.localStorage = dom.window.localStorage;
globalThis.AudioContext = class {
  createGain() { return { gain: { value: 0, setValueAtTime() {} }, connect() {} }; }
  get destination() { return {}; }
  get currentTime() { return 0; }
  resume() {}
};
// jsdom has no object URLs; the download helper creates one per file.
let downloaded = [];
dom.window.URL.createObjectURL = () => "blob:stub";
dom.window.URL.revokeObjectURL = () => {};
globalThis.URL.createObjectURL = dom.window.URL.createObjectURL;
globalThis.URL.revokeObjectURL = dom.window.URL.revokeObjectURL;
// Capture what the anchor was asked to save instead of hitting a filesystem.
const realCreateElement = dom.window.document.createElement.bind(dom.window.document);
dom.window.document.createElement = (tag, options) => {
  const node = realCreateElement(tag, options);
  if (String(tag).toLowerCase() === "a") {
    node.click = () => { downloaded.push({ name: node.download, href: node.href }); };
  }
  return node;
};

const React = (await import("react")).default;
const { act } = await import("react");
const { createRoot } = await import("react-dom/client");

// AuthProvider probes the session endpoint on mount; without a stub the promise
// settles after the act block and React logs an unwrapped-update warning.
globalThis.fetch = async () => ({ ok: false, status: 401, json: async () => ({}) });
dom.window.fetch = globalThis.fetch;

const server = await createServer({
  configFile: false,
  logLevel: "silent",
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true },
  appType: "custom",
});

try {
  const [courseExport, authoring, db, playerArchive, lessons, ProfileView, useAuth] = await Promise.all([
    server.ssrLoadModule("/src/lib/courseExport.ts"),
    server.ssrLoadModule("/src/lib/contentAuthoring.ts"),
    server.ssrLoadModule("/src/lib/db.ts"),
    server.ssrLoadModule("/src/lib/playerArchive.ts"),
    server.ssrLoadModule("/src/data/lessons.ts"),
    server.ssrLoadModule("/src/components/ProfileView.tsx"),
    server.ssrLoadModule("/src/lib/useAuth.tsx"),
  ]);

  // ── Learning paths export: nothing silently dropped ───────────────────────
  // The trap here is JSON.stringify quietly discarding every closure. Each
  // objective's completion test is one, so it has to be replaced by an explicit
  // marker rather than vanish. The other trap is routing the export through
  // snapshotModule, which drops objective material and theory screenshots.
  const overlay = authoring.emptyOverlay();
  const live = authoring.effectiveLearningPaths(overlay);
  const exported = courseExport.buildCourseExport(overlay);
  const serialised = courseExport.serialiseCourseExport(exported);
  const reparsed = courseExport.parseCourseExport(serialised);
  assert.ok(reparsed, "the export must survive a serialise/parse round trip");

  const liveLabs = live.flatMap((path) => path.modules);
  const exportedLabs = reparsed.paths.flatMap((path) => path.modules);
  assert.equal(reparsed.paths.length, live.length, "every learning path must be exported");
  assert.equal(exportedLabs.length, liveLabs.length, "every lab must be exported");
  assert.equal(
    exportedLabs.reduce((n, m) => n + m.tasks.length, 0),
    liveLabs.reduce((n, m) => n + m.tasks.length, 0),
    "every objective must be exported",
  );

  // Closures cannot survive; assert they were marked, not dropped.
  for (const module of exportedLabs) {
    for (const task of module.tasks) assert.deepEqual(task.check, { builtin: true }, `${module.id}/${task.id} test should be marked`);
    for (const challenge of module.challenges) assert.deepEqual(challenge.check, { builtin: true }, `${module.id} challenge test should be marked`);
  }

  // The fields a lossy serialiser would drop must still be there.
  const liveWithMaterial = liveLabs.flatMap((m) => m.tasks.filter((task) => task.material).map((task) => `${m.id}/${task.id}`));
  assert.ok(liveWithMaterial.length > 0, "the catalogue should have objectives carrying additional material");
  for (const ref of liveWithMaterial) {
    const [moduleId, taskId] = ref.split("/");
    const task = exportedLabs.find((m) => m.id === moduleId)?.tasks.find((candidate) => candidate.id === taskId);
    assert.ok(task?.material?.en && task?.material?.el, `${ref} must keep its additional material in the export`);
  }
  const liveShots = liveLabs.reduce((n, m) => n + m.theory.reduce((k, s) => k + (s.shots?.length ?? 0), 0), 0);
  const exportedShots = exportedLabs.reduce((n, m) => n + m.theory.reduce((k, s) => k + (s.shots?.length ?? 0), 0), 0);
  assert.equal(exportedShots, liveShots, "theory screenshots must survive the export");

  // Quizzes and assessments are stored per lab, so they travel with the file.
  const counts = courseExport.courseExportCounts(reparsed);
  assert.ok(counts.quiz > 0 && counts.assessment > 0, "the export should carry quizzes and assessments");
  assert.equal(counts.objectives, liveLabs.reduce((n, m) => n + m.tasks.length, 0));

  // A reader must be able to tell this file from any other JSON.
  assert.equal(courseExport.parseCourseExport("{}"), null, "an empty object is not a course export");
  assert.equal(courseExport.parseCourseExport("not json"), null, "garbage is not a course export");
  assert.equal(courseExport.parseCourseExport(JSON.stringify({ ...exported, version: 99 })), null, "a future version must not be accepted silently");
  assert.equal(courseExport.parseCourseExport(JSON.stringify({ ...exported, format: "something-else" })), null, "a different format must be rejected");

  // The educator dashboard button calls exactly this combination; exercise it
  // end to end so the db wrapper and the dated filename are covered too.
  downloaded = [];
  const dashboardPayload = courseExport.serialiseCourseExport(db.exportCourseCatalog(db.getDB().contentOverlay));
  courseExport.downloadJsonFile(courseExport.courseExportFilename(new Date("2026-10-08T00:00:00Z")), dashboardPayload);
  assert.equal(downloaded.length, 1, "the learning-paths download should produce one file");
  assert.equal(downloaded[0].name, "gamehack-learning-paths-2026-10-08.json", "the file should be dated");
  const fromWrapper = courseExport.parseCourseExport(dashboardPayload);
  assert.ok(fromWrapper, "the dashboard wrapper must produce a parseable catalogue");
  assert.equal(courseExport.courseExportCounts(fromWrapper).labs, liveLabs.length, "the wrapper must cover every lab");

  // ── Self-service data download ────────────────────────────────────────────
  const me = db.getDB().users[0];
  const plain = db.extractOwnArchive(me.id);
  assert.ok(plain, "an account should export its own data");
  assert.equal(plain.archive.players.length, 1, "a self export covers exactly one account");
  assert.equal(plain.archive.players[0].id, me.id);
  assert.equal(plain.recoveryKey, null, "no new key is issued unless asked");
  assert.equal(plain.archive.players[0].recoveryKeyFile, null, "no key file without the opt-in");
  assert.ok(playerArchive.parsePlayerArchive(JSON.stringify(plain.archive)), "the self export must be a valid player archive");

  // Turning the opt-in on mints a replacement, because the plaintext of the
  // existing key is not stored anywhere and cannot be recovered.
  const before = db.getDB().users.find((u) => u.id === me.id)?.recoveryKeyHash;
  const keyed = db.extractOwnArchive(me.id, true);
  assert.ok(keyed?.recoveryKey, "the opt-in should return the plaintext key");
  assert.match(keyed.recoveryKey, /^[A-Za-z0-9_-]{43}$/, "the key must match the login format");
  assert.equal(keyed.archive.players[0].recoveryKeyFile?.recoveryKey, keyed.recoveryKey, "the key must be embedded in the file");
  const after = db.getDB().users.find((u) => u.id === me.id)?.recoveryKeyHash;
  assert.ok(after && after !== before, "issuing a key must persist its hash so the old one stops working");
  assert.equal(playerArchive.hashRecoveryKey(keyed.recoveryKey), after, "the stored hash must match the issued key");

  // The file has to be restorable, otherwise the download is decorative.
  const restored = await db.importPlayerArchive(playerArchive.parsePlayerArchive(JSON.stringify(keyed.archive)), me.id);
  assert.ok(restored >= 1, "the exported account must import again");

  // ── The profile actually offers it ────────────────────────────────────────
  // Mounting the real component is the only way to know the button is rendered
  // and wired; a helper test would just re-implement the thing it claims to check.
  // The password and recovery-key controls are gated to university accounts, so
  // mount as one rather than as the demo login.
  const account = db.establishAuthenticatedUser("export-check@ionio.gr", "Export Check");
  const container = dom.window.document.createElement("div");
  dom.window.document.body.appendChild(container);
  const root = createRoot(container);
  let refreshed = 0;
  await act(async () => {
    root.render(
      React.createElement(useAuth.AuthProvider, null,
        React.createElement(ProfileView.default, {
          user: account, viewer: account, lang: "en", onChange: () => { refreshed += 1; },
        }),
      ),
    );
  });
  // Let the session probe settle so no state update lands outside act. It runs
  // through several awaited ticks, so a single microtask is not enough.
  for (let tick = 0; tick < 5; tick += 1) {
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 0)); });
  }

  const labels = [...container.querySelectorAll("button, h2, label")].map((node) => node.textContent || "");
  assert.ok(labels.some((text) => text.includes("Download my data")), "the profile should offer the data download");
  assert.ok(labels.some((text) => text.includes("Change password")), "the profile should offer a password change");
  assert.ok(labels.some((text) => text.includes("Download recovery key file")), "the profile should offer the recovery key");
  assert.ok(labels.some((text) => text.includes("Also issue a new recovery key")), "the recovery key opt-in should be visible");

  const checkbox = container.querySelector('input[type="checkbox"]');
  assert.ok(checkbox, "the opt-in should be a checkbox");
  assert.equal(checkbox.checked, false, "the destructive opt-in must start off");

  downloaded = [];
  const downloadButton = [...container.querySelectorAll("button")].find((b) => (b.textContent || "").includes("Download my data"));
  await act(async () => { downloadButton.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); });
  assert.equal(downloaded.length, 1, "clicking should download exactly one file");
  assert.match(downloaded[0].name, /^gamehack-account-.+\.json$/, "the file should be named after the account");
  assert.ok(container.textContent.includes("Your data file downloaded."), "the profile should confirm the download");

  // Off by default means no key was minted by that click.
  assert.equal(
    db.getDB().users.find((u) => u.id === account.id)?.recoveryKeyHash,
    account.recoveryKeyHash,
    "downloading without the opt-in must not rotate the key",
  );

  await act(async () => { root.unmount(); });
  container.remove();

  console.log(`Data export checks passed: the learning-paths JSON carries all ${counts.paths} paths, ${counts.labs} labs, ${counts.objectives} objectives, ${counts.quiz} quizzes and ${counts.assessment} assessments with objective tests marked rather than dropped; a self export covers one account, mints a recovery key only on the opt-in, and imports back cleanly; and the real profile renders the download, the password change and the recovery key with the opt-in off by default.`);
} finally {
  await server.close();
}
