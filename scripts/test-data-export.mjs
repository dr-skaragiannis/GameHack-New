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

  // ── Regression: a stored record missing its arrays ────────────────────────
  // "Extract players" threw "s.hobbies is not iterable" on any account written
  // by an older schema. getDB() validated the top-level collections but passed
  // the user records through verbatim, and nearly every consumer spreads them,
  // so the crash landed in the archive rather than where the data was bad.
  db.resetAll();
  const legacyId = "legacy-schema@ionio.gr";
  localStorage.setItem("gamehack.platform.v1", JSON.stringify({
    users: [{
      id: legacyId, username: legacyId, password: "hunter2hunter2", role: "player",
      displayName: "Legacy Schema", avatar: "terminal", bio: "", createdAt: 1,
      lang: "en", accepted: true, metrics: { xp: 42 },
      // deliberately no interests, hobbies, badges or progress
    }],
    sessionUserId: legacyId, feed: [], tickets: [], messages: [], chats: [], teams: [],
    teamApplications: [], commandLog: [], contentOverlay: { modules: {}, paths: [] },
  }));

  const legacy = db.getDB().users.find((candidate) => candidate.id === legacyId);
  assert.ok(legacy, "a record missing its arrays must still load");
  assert.deepEqual(legacy.interests, [], "missing interests should become an empty list");
  assert.deepEqual(legacy.hobbies, [], "missing hobbies should become an empty list");
  assert.deepEqual(legacy.badges, [], "missing badges should become an empty list");
  assert.deepEqual(legacy.progress, {}, "missing progress should become an empty map");
  assert.equal(legacy.metrics.xp, 42, "metrics that are present must be preserved");
  assert.equal(legacy.metrics.commandsRun, 0, "missing metric fields must be filled, not left undefined");

  const legacyArchive = db.extractPlayerArchive();
  const legacyEntry = legacyArchive.players.find((player) => player.id === legacyId);
  assert.ok(legacyEntry, "the repaired account must appear in the player archive");
  assert.deepEqual(legacyEntry.hobbies, []);
  assert.deepEqual(legacyEntry.badges, []);
  assert.ok(db.extractOwnArchive(legacyId), "the self export must not crash on the same record");

  // passwordHash is deliberately left out of that normalisation. Writing an
  // empty string would look like an already-migrated hash, so the legacy
  // plaintext password would be dropped instead of upgraded. The migration runs
  // inside the export, so that is where it has to be observable.
  const migrated = db.getDB().users.find((candidate) => candidate.id === legacyId);
  assert.equal(migrated.password, undefined, "the legacy plaintext field must be removed once migrated");
  assert.match(migrated.passwordHash, /^scrypt\$/i, "a legacy plaintext password must still be migrated to scrypt");
  assert.equal(db.login(legacyId, "hunter2hunter2").ok, true, "the migrated password must still log the user in");


  // ── Request 17: the file documents its own structure, and imports back ──
  //
  // JSON has no comment syntax, so the documentation is a data field that the
  // parser ignores. It has to be the FIRST key or it is not really a header.
  assert.equal(Object.keys(exported)[0], "readme", "the structure docs must come first in the file");
  assert.ok(exported.readme && typeof exported.readme === "object", "the export needs a readme");
  assert.match(exported.readme.what.en, /catalogue/i, "the readme must say what the file is");
  assert.match(exported.readme.howToRead.en, /comment/i, "the readme must explain that JSON has no comment syntax");
  assert.match(exported.readme.howToRead.el, /σχολ/, "the Greek readme must explain the same thing");
  for (const key of ["path", "module", "theorySection", "task", "challenge", "quizQuestion", "assessmentQuestion"]) {
    assert.ok(exported.readme[key], `the readme must document "${key}"`);
  }
  for (const key of ["format", "version", "exportedAt", "readme", "note", "paths"]) {
    assert.ok(exported.readme.fields[key], `the readme must document the top-level "${key}"`);
  }
  assert.ok(exported.readme.importing.en && exported.readme.importing.el, "the readme must explain how to import, in both languages");
  assert.match(exported.readme.task.check.en, /\bbuiltin\b/, "the task entry must explain the check marker");
  assert.match(exported.readme.module.id.el, /αναγνωριστικό/, "the module entry must explain the id field in Greek too");
  assert.match(exported.readme.theorySection.shots.en, /transcript/i, "the readme must document the terminal transcripts");
  assert.ok(serialised.indexOf('"readme"') < serialised.indexOf('"format"'), "the readme must serialise before the payload");

  // ── Round-trip: importing the catalogue must not lose the theory visuals ──
  const baseOverlay = { modules: {}, paths: [] };
  const roundTrip = courseExport.buildOverlayFromCourseExport(exported, baseOverlay);
  assert.ok(Object.keys(roundTrip.overlay.modules).length > 0, "the import must produce overlay modules");
  const roundTripped = authoring.effectiveLearningPaths(roundTrip.overlay);
  const shotsBefore = lessons.LEARNING_PATHS.flatMap((campaign) => campaign.modules)
    .find((mod) => mod.theory.some((section) => section.shots?.length));
  const shotsAfter = roundTripped.flatMap((campaign) => campaign.modules).find((mod) => mod.id === shotsBefore.id);
  assert.ok(shotsAfter.theory.some((section) => section.shots?.length), "importing a lab must not strip its terminal screenshots");

  // ── Editing a built-in lab in the file takes effect ──
  const edited = structuredClone(exported);
  const targetPath = edited.paths.find((path) => path.id === "linux-part-01");
  const targetModule = targetPath.modules.find((mod) => mod.id === "sr-intro");
  targetModule.theory[0].body.en = "Edited from an imported file.";
  const { overlay: editedOverlay } = courseExport.buildOverlayFromCourseExport(edited, baseOverlay);
  const editedCatalog = authoring.effectiveLearningPaths(editedOverlay);
  const editedModule = editedCatalog.flatMap((campaign) => campaign.modules).find((mod) => mod.id === "sr-intro");
  assert.equal(editedModule.theory[0].body.en, "Edited from an imported file.", "an edited built-in lab must be picked up");
  assert.equal(editedOverlay.modules["sr-intro"].tasks[0].check.kind, "builtin", "the overlay defers the completion test to the built-in lab");
  const originalTask = lessons.moduleById("sr-intro").tasks.find((candidate) => candidate.id === editedModule.tasks[0].id);
  assert.ok(originalTask, "the exported objective id must still match the built-in lab");
  assert.equal(editedModule.tasks[0].check, originalTask.check, "an edited built-in lab keeps its real objective test, not a stub");

  // ── A file can add a whole new learning path ──
  const authored = {
    readme: exported.readme,
    format: courseExport.COURSE_EXPORT_FORMAT,
    version: courseExport.COURSE_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    note: "hand written",
    paths: [{
      id: "path-imported",
      title: { en: "Imported path", el: "Εισηγμένο μονοπάτι" },
      subtitle: { en: "From a file", el: "Από αρχείο" },
      blurb: { en: "Authored outside the app.", el: "Γράφτηκε έξω από την εφαρμογή." },
      scenario: "lab",
      accent: "cyan",
      modules: [{
        id: "imported-lab",
        order: 1,
        icon: "terminal",
        color: "from-cyan-400 to-sky-900",
        difficulty: 2,
        scenario: "lab",
        title: { en: "Imported lab", el: "Εισηγμένο εργαστήριο" },
        subtitle: { en: "New content", el: "Νέο περιεχόμενο" },
        badge: { en: "Imported", el: "Εισηγμένο" },
        theory: [{
          id: "imported-lab-theory",
          heading: { en: "Why", el: "Γιατί" },
          body: { en: "Because.\n\nSecond paragraph.", el: "Διότι.\n\nΔεύτερη παράγραφος." },
          shots: [{ cmd: "pwd", lines: ["/home/player"] }],
        }],
        cheats: [{ cmd: "pwd", desc: { en: "Where am I", el: "Πού είμαι" } }],
        tasks: [{ id: "imported-lab-task", instruction: { en: "Print the cwd.", el: "Εκτύπωσε το cwd." }, hint: { en: "pwd", el: "pwd" }, explain: { en: "pwd", el: "pwd" }, reward: 5 }],
        challenges: [{ id: "imported-lab-challenge", title: { en: "Challenge", el: "Πρόκληση" }, brief: { en: "Brief", el: "Σύνοψη" }, success: { en: "Done", el: "Ολοκληρώθηκε" } }],
        quiz: [{ id: "q1", q: { en: "Question?", el: "Ερώτηση;" }, choices: [{ en: "A", el: "Α" }, { en: "B", el: "Β" }], answer: 0, why: { en: "Because.", el: "Διότι." } }],
        assessment: [{ id: "a1", prompt: { en: "Judge this.", el: "Κρίνε το." }, choices: [{ en: "A", el: "Α" }, { en: "B", el: "Β" }], answer: 0, why: { en: "Because.", el: "Διότι." } }],
      }],
    }],
  };
  const { overlay: authoredOverlay, summary } = courseExport.buildOverlayFromCourseExport(authored, baseOverlay);
  assert.equal(summary.newLabs, 1, "the imported lab must be reported as new");
  assert.equal(summary.objectivesNeedingTests, 1, "a new lab has objectives without completion tests");
  const authoredCatalog = authoring.effectiveLearningPaths(authoredOverlay);
  assert.ok(authoredCatalog.some((campaign) => campaign.id === "path-imported"), "the imported path must join the catalogue");
  const authoredLab = authoring.effectiveModuleById(authoredOverlay, "imported-lab");
  assert.equal(authoredLab?.title.en, "Imported lab", "the imported lab must resolve through moduleById");
  assert.equal(authoredLab?.tasks.length, 1, "the imported objective must survive");
  // Module.challenges is a fixed two-tuple, so a lab authored with one
  // challenge is padded with an empty placeholder, exactly as in the editor.
  assert.equal(authoredLab?.challenges.length, 2, "challenges stay a fixed pair");
  assert.equal(authoredLab?.challenges[0].title.en, "Challenge", "the imported challenge must survive");
  // Quizzes and assessments are not fields on Module; they live in the static
  // banks, which is why the overlay carries its own copies.
  assert.equal(authoredOverlay.quizzes["imported-lab"].length, 1, "the imported quiz must be stored on the overlay");
  assert.equal(authoredOverlay.assessments["imported-lab"].length, 1, "the imported assessment must be stored on the overlay");

  // ── Question banks survive a save/load cycle ──
  db.saveContentOverlay(authoredOverlay);
  const reloaded = db.getContentOverlay();
  assert.equal(reloaded.quizzes["imported-lab"][0].q.en, "Question?", "the imported quiz must survive persistence");
  assert.equal(reloaded.assessments["imported-lab"][0].prompt.en, "Judge this.", "the imported assessment must survive persistence");
  assert.equal(authoredLab.theory[0].heading.en, "Why", "the imported theory must survive persistence");
  const persistedLab = authoring.effectiveModuleById(reloaded, "imported-lab");
  assert.equal(persistedLab.theory[0].shots?.length, 1, "the terminal transcript must survive the save/load sanitiser");
  assert.deepEqual(persistedLab.theory[0].shots?.[0]?.lines, ["/home/player"], "the transcript lines must survive verbatim");

  // The live question maps must reflect the import, since the popups read them directly.
  const { QUIZZES } = await server.ssrLoadModule("/src/data/quizzes.ts");
  const { ASSESSMENTS } = await server.ssrLoadModule("/src/data/assessments.ts");
  assert.equal(QUIZZES["imported-lab"][0].q.en, "Question?", "the live quiz map must carry the imported questions");
  assert.equal(ASSESSMENTS["imported-lab"][0].prompt.en, "Judge this.", "the live assessment map must carry the imported questions");
  assert.ok(QUIZZES["sr-intro"]?.length, "the shipped question banks must not be clobbered by an import");

  // Resetting the overlay puts the shipped catalogue back.
  db.saveContentOverlay({ modules: {}, paths: [] });
  assert.equal(QUIZZES["imported-lab"], undefined, "resetting the overlay must drop the imported questions");
  assert.ok(QUIZZES["sr-intro"]?.length, "resetting the overlay must restore the shipped questions");


  // ── The export carries the sandbox, and importing it makes a lab playable ──
  assert.ok(exported.readme.labFile, "the readme must document lab files");
  assert.ok(exported.readme.commandFixture, "the readme must document command results");
  assert.match(exported.readme.labFile.path.en, /absolute path/i, "the readme must say a lab file path is absolute");
  assert.match(exported.readme.commandFixture.command.el, /ακριβ/, "the Greek readme must say matching is exact");

  const sandboxCatalog = {
    readme: exported.readme,
    format: courseExport.COURSE_EXPORT_FORMAT,
    version: courseExport.COURSE_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    note: "hand written",
    filesystem: [{ path: "/srv/baseline/notes.txt", content: "baseline from the catalogue\n" }],
    paths: [{
      id: "path-sandbox",
      title: { en: "Sandbox path", el: "Μονοπάτι sandbox" },
      subtitle: { en: "Seeded", el: "Με αρχεία" },
      blurb: { en: "A lab with its own files.", el: "Εργαστήριο με δικά του αρχεία." },
      scenario: "lab",
      accent: "cyan",
      modules: [{
        id: "sandbox-lab",
        order: 1,
        icon: "terminal",
        color: "from-cyan-400 to-sky-900",
        difficulty: 2,
        scenario: "lab",
        title: { en: "Sandbox lab", el: "Εργαστήριο sandbox" },
        subtitle: { en: "Files and fixtures", el: "Αρχεία και fixtures" },
        badge: { en: "Seeder", el: "Σπορέας" },
        theory: [{ id: "sandbox-theory", heading: { en: "Why", el: "Γιατί" }, body: { en: "Because.\n\nSecond.", el: "Διότι.\n\nΔεύτερο." } }],
        cheats: [],
        tasks: [],
        challenges: [],
        quiz: [],
        assessment: [],
        files: [
          { path: "/srv/custom/report.txt", content: "TOP SECRET\nthe answer is 42\n" },
          { path: "/srv/custom/deep/nested/keys.txt", content: "root:toor\n", mode: "-rw-------", owner: "root" },
        ],
        commands: [
          { command: "mytool --scan 10.0.0.5", output: "PORT   STATE\n22/tcp open", exit: 0, flag: "scanned" },
          { command: "cat /etc/shadow", output: "cat: /etc/shadow: Permission denied", exit: 1 },
        ],
      }],
    }],
  };

  // The exporter itself must emit the sandbox it is handed, and each lab's own
  // files and command results, or the import side has nothing to read.
  const seededOverlay = courseExport.buildOverlayFromCourseExport(sandboxCatalog, { modules: {}, paths: [] }).overlay;
  const fullExport = db.exportCourseCatalog(seededOverlay, [
    { path: "/srv/baseline/notes.txt", content: "baseline from the catalogue\n" },
  ]);
  assert.equal(fullExport.filesystem?.length, 1, "the exporter emits the filesystem snapshot it is given");
  assert.equal(fullExport.filesystem?.[0].path, "/srv/baseline/notes.txt", "and keeps its path");
  const exportedLab = fullExport.paths.flatMap((path) => path.modules).find((mod) => mod.id === "sandbox-lab");
  assert.ok(exportedLab, "the lab carrying a sandbox is in the export");
  assert.equal(exportedLab.files?.length, 2, "a lab's files are exported with it");
  assert.equal(exportedLab.files?.[1].owner, "root", "including ownership");
  assert.equal(exportedLab.commands?.[0].flag, "scanned", "a lab's command results are exported with it");
  assert.equal(db.exportCourseCatalog(seededOverlay).filesystem, undefined, "an export with no snapshot carries no baseline rather than an empty one");

  const sandboxRoundTrip = courseExport.parseCourseExport(courseExport.serialiseCourseExport(sandboxCatalog));
  assert.ok(sandboxRoundTrip, "a catalogue that carries a sandbox still parses");
  assert.equal(sandboxRoundTrip.filesystem.length, 1, "the shared baseline survives the round trip");
  const sandboxImport = courseExport.buildOverlayFromCourseExport(sandboxRoundTrip, db.getContentOverlay());
  assert.equal(sandboxImport.summary.files, 2, "the summary counts the lab's files");
  assert.equal(sandboxImport.summary.commands, 2, "the summary counts the lab's command results");
  assert.equal(sandboxImport.summary.baselineFiles, 1, "the summary counts the baseline it replaces");

  db.saveContentOverlay(sandboxImport.overlay);
  const reloadedSandbox = db.getContentOverlay();
  assert.equal(reloadedSandbox.modules["sandbox-lab"].files.length, 2, "lab files survive storage");
  assert.equal(reloadedSandbox.modules["sandbox-lab"].files[1].mode, "-rw-------", "file permissions survive storage");
  assert.equal(reloadedSandbox.modules["sandbox-lab"].commands[0].flag, "scanned", "command fixtures survive storage");
  assert.equal(reloadedSandbox.filesystem[0].path, "/srv/baseline/notes.txt", "the baseline survives storage");

  // The point of all of it: the lab is actually playable in the terminal.
  const playerTerminal = await server.ssrLoadModule("/src/lib/playerTerminal.ts");
  const terminal = await server.ssrLoadModule("/src/lib/terminal.ts");
  const term = playerTerminal.createPlayerTerminal();
  playerTerminal.activateTerminalForModule(term, "sandbox-lab", "lab");
  const run = (command) => {
    const lines = terminal.runCommand(term, command);
    return { exit: term.lastExit, text: lines.filter((line) => line.kind !== "in").map((line) => line.text).join("\n") };
  };

  const read = run("cat /srv/custom/report.txt");
  assert.equal(read.exit, 0, "a seeded file can be read");
  assert.match(read.text, /the answer is 42/, "the seeded content is exactly what the educator wrote");

  const nested = run("ls -la /srv/custom/deep/nested");
  assert.equal(nested.exit, 0, "parent directories are created for a deeply nested seed");
  assert.match(nested.text, /-rw-------/, "the permissions the educator set are the ones ls shows");

  const searched = run("grep answer /srv/custom/report.txt");
  assert.equal(searched.exit, 0, "the real simulator operates on seeded files");
  assert.match(searched.text, /the answer is 42/, "grep finds what was seeded");

  const fixture = run("mytool --scan 10.0.0.5");
  assert.equal(fixture.exit, 0, "a command the simulator never implemented now answers");
  assert.match(fixture.text, /22\/tcp open/, "and prints what the educator wrote");
  assert.ok(term.flags.has("scanned"), "the fixture records its flag so a completion test can require it");

  const overridden = run("cat /etc/shadow");
  assert.equal(overridden.exit, 1, "a lab may restate what a built-in tool prints");
  assert.match(overridden.text, /Permission denied/, "and the restatement is what the player sees");

  assert.equal(run("totally-unknown-command").exit, 127, "commands with no fixture and no implementation still fail");

  // Seeding must not destroy what the player already has.
  terminal.runCommand(term, "echo edited by the player > /srv/custom/report.txt");
  playerTerminal.activateTerminalForModule(term, "sandbox-lab", "lab");
  assert.match(run("cat /srv/custom/report.txt").text, /edited by the player/, "reopening a lab does not overwrite the player's file");

  // A file the catalogue omits keeps whatever baseline is already in place.
  const noBaseline = courseExport.buildOverlayFromCourseExport(
    { ...sandboxRoundTrip, filesystem: undefined },
    { modules: {}, paths: [], filesystem: [{ path: "/srv/kept/old.txt", content: "kept\n" }] },
  );
  assert.deepEqual(noBaseline.overlay.filesystem, [{ path: "/srv/kept/old.txt", content: "kept\n" }], "omitting the baseline keeps the existing one");

  db.saveContentOverlay({ modules: {}, paths: [] });

  console.log(`Data export checks passed: the learning-paths JSON carries all ${counts.paths} paths, ${counts.labs} labs, ${counts.objectives} objectives, ${counts.quiz} quizzes and ${counts.assessment} assessments with objective tests marked rather than dropped; a self export covers one account, mints a recovery key only on the opt-in, and imports back cleanly; the real profile renders the download, the password change and the recovery key with the opt-in off by default; a stored record missing its interests, hobbies, badges and progress now loads with empty collections, keeps its migrated password and exports cleanly instead of throwing; and the exported file documents its own structure in a leading readme, imports back without losing its terminal screenshots, can edit a built-in lab while keeping that lab's real objective tests, can add a whole new learning path with its quiz and assessment, and both survive a save/load cycle while the shipped question banks stay intact. The export also carries the sandbox: the shared filesystem baseline, each lab's files with their contents and permissions, and canned results for exact command lines, so importing a file yields a lab whose files can really be read, whose directories are created, whose fixtures answer - including restating a built-in tool - while an unfixed unknown command still fails, and while seeding never overwrites a file the player has edited.`);
} finally {
  await server.close();
}
