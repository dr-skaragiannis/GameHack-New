import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { createServer } from "vite";

// A real DOM, so the authoring editor can be driven the way an educator drives it.
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
globalThis.KeyboardEvent = dom.window.KeyboardEvent;
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
globalThis.AudioContext = class {
  createGain() { return { gain: { value: 0, setValueAtTime() {} }, connect() {} }; }
  get destination() { return {}; }
  get currentTime() { return 0; }
  resume() {}
};

const React = (await import("react")).default;
const { act } = await import("react");
const { createRoot } = await import("react-dom/client");

const server = await createServer({
  configFile: false,
  logLevel: "silent",
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true },
  appType: "custom",
});

try {
  const [{ default: ContentEditor }, authoring, lessons] = await Promise.all([
    server.ssrLoadModule("/src/components/ContentEditor.tsx"),
    server.ssrLoadModule("/src/lib/contentAuthoring.ts"),
    server.ssrLoadModule("/src/data/lessons.ts"),
  ]);

  // The editor is controlled: it reports a new overlay and the host re-renders,
  // exactly like the educator dashboard does.
  let overlay = authoring.emptyOverlay();
  const messages = [];
  const host = createRoot(document.getElementById("root"));
  const render = () =>
    act(() => {
      host.render(React.createElement(ContentEditor, {
        lang: "en",
        overlay,
        onCommit: (next, message) => {
          overlay = next;
          messages.push(message);
          render();
        },
      }));
    });
  render();

  const buttons = () => [...document.querySelectorAll("button")];
  const clickButton = (label) => {
    const button = buttons().find((candidate) => candidate.textContent.trim() === label);
    assert.ok(button, `a button labelled "${label}" is on screen`);
    act(() => { button.click(); });
  };
  const labelled = (label, tag) => {
    const field = [...document.querySelectorAll("label.content-field")]
      .find((candidate) => candidate.querySelector("span")?.textContent.trim() === label);
    assert.ok(field, `a ${tag} labelled "${label}" is on screen`);
    return field.querySelector(tag);
  };
  const type = (element, value) => {
    const proto = element instanceof dom.window.HTMLTextAreaElement
      ? dom.window.HTMLTextAreaElement.prototype
      : dom.window.HTMLInputElement.prototype;
    Object.getOwnPropertyDescriptor(proto, "value").set.call(element, value);
    act(() => { element.dispatchEvent(new dom.window.Event("input", { bubbles: true })); });
  };

  // ── The shipped catalog is the starting point ─────────────────────────────
  const listed = buttons().map((button) => button.textContent.trim());
  for (const path of lessons.LEARNING_PATHS) {
    assert.ok(
      listed.some((text) => text.includes(path.title.en)),
      `the shipped path "${path.title.en}" is listed for editing`,
    );
  }

  // ── An educator creates a learning path ───────────────────────────────────
  clickButton("New learning path");
  assert.equal(overlay.paths.length, 1, "a new learning path is committed");
  assert.equal(messages.at(-1), "Saved. Players see this on their next refresh.");

  type(labelled("Path title — EN", "textarea"), "Log forensics");
  type(labelled("Path title — EL", "textarea"), "Ανάλυση αρχείων καταγραφής");
  type(labelled("Path subtitle — EN", "textarea"), "Reading what the host recorded");
  type(labelled("Path description — EN", "textarea"), "Work through real log files.");
  clickButton("Save path");
  assert.equal(overlay.paths[0].title.en, "Log forensics", "the path title is saved");
  assert.equal(overlay.paths[0].title.el, "Ανάλυση αρχείων καταγραφής", "the Greek title is saved too");
  assert.equal(overlay.paths[0].subtitle.en, "Reading what the host recorded");

  // ── …and adds a lab to it ─────────────────────────────────────────────────
  clickButton("New lab");
  const labId = Object.keys(overlay.modules).at(-1);
  assert.ok(labId, "a new lab is committed");
  assert.deepEqual(
    overlay.paths[0].moduleIds,
    [labId],
    "the new lab is listed on its path, so players can actually reach it",
  );

  // ── …and writes it ────────────────────────────────────────────────────────
  type(labelled("Lab title — EN", "textarea"), "Reading logs");
  type(labelled("Lab title — EL", "textarea"), "Διάβασμα αρχείων καταγραφής");
  type(labelled("Lab subtitle — EN", "textarea"), "Auth logs first");
  type(labelled("Badge name — EN", "textarea"), "Log reader");

  type(labelled("Heading — EN", "textarea"), "Why logs matter");
  type(labelled("Heading — EL", "textarea"), "Γιατί έχουν σημασία τα αρχεία καταγραφής");
  type(labelled("Body — EN", "textarea"), "Logs record what a host did.\n\nThey are the first place you look.");
  type(labelled("Body — EL", "textarea"), "Τα αρχεία καταγραφής κρατούν τι έκανε ένας host.\n\nΕίναι το πρώτο σημείο ελέγχου.");

  type(labelled("Instruction — EN", "textarea"), "Show the last twenty lines of the auth log.");
  type(labelled("Instruction — EL", "textarea"), "Δείξε τις είκοσι τελευταίες γραμμές του auth log.");
  type(labelled("Hint — EN", "textarea"), "tail -n 20 /var/log/auth.log");
  type(labelled("Hint — EL", "textarea"), "tail -n 20 /var/log/auth.log");
  type(labelled("Additional material — EN", "textarea"), "Compare -n 20 with -f to follow the log live.");
  type(labelled("Additional material — EL", "textarea"), "Σύγκρινε το -n 20 με το -f για να ακολουθείς το αρχείο ζωντανά.");

  // Set the XP for this objective.
  const xpField = labelled("XP reward", "input");
  type(xpField, "25");

  /** Pick a command test on one completion-test builder and fill in its pattern. */
  const setCommandCheck = (select, pattern) => {
    assert.ok(
      [...select.options].some((option) => option.value === "command"),
      "the completion-test builder offers a command test",
    );
    Object.getOwnPropertyDescriptor(dom.window.HTMLSelectElement.prototype, "value").set.call(select, "command");
    act(() => { select.dispatchEvent(new dom.window.Event("change", { bubbles: true })); });
    const field = select.closest(".content-check").querySelector("input");
    assert.ok(field, "choosing a command test reveals the pattern field");
    type(field, pattern);
  };

  const checkBuilders = () => [...document.querySelectorAll(".content-check > select")];

  // Give the objective a real completion test.
  setCommandCheck(checkBuilders()[0], "^tail ");

  // Both final challenges need a test too, or the lab could never be finished.
  for (const select of checkBuilders().slice(1)) {
    if (select.value !== "unset") continue;
    setCommandCheck(select, "^tail ");
  }

  clickButton("Save lab");
  const savedLab = overlay.modules[labId];
  assert.equal(savedLab.title.en, "Reading logs", "the lab title is saved");
  assert.equal(savedLab.theory[0].heading.en, "Why logs matter", "the theory heading is saved");
  assert.match(savedLab.theory[0].body.en, /first place you look/, "the theory body is saved");
  assert.equal(savedLab.tasks[0].instruction.en, "Show the last twenty lines of the auth log.");
  assert.equal(savedLab.tasks[0].hint.en, "tail -n 20 /var/log/auth.log");
  assert.equal(
    savedLab.tasks[0].material.en,
    "Compare -n 20 with -f to follow the log live.",
    "the educator's additional material is saved",
  );
  assert.match(savedLab.tasks[0].material.el, /ζωντανά/, "additional material is saved in Greek too");
  assert.equal(savedLab.tasks[0].reward, 25, "the educator's XP value is saved");
  assert.deepEqual(savedLab.tasks[0].check, { kind: "command", pattern: "^tail " }, "the completion test is saved");
  assert.deepEqual(
    authoring.overlayIssues({ modules: { [labId]: savedLab }, paths: [] }),
    [],
    "a fully written lab reports no problems",
  );

  // ── What the player sees ──────────────────────────────────────────────────
  const compiled = authoring.compileModule(savedLab);
  assert.equal(compiled.tasks[0].reward, 25);
  assert.deepEqual(
    compiled.tasks[0].material,
    savedLab.tasks[0].material,
    "additional material reaches the lab the player opens",
  );
  const term = { ran: ["tail -n 20 /var/log/auth.log"], flags: new Set(), filesRead: [] };
  assert.equal(compiled.tasks[0].check(term), true, "the authored objective completes on the command it asks for");
  const playerPaths = authoring.effectiveLearningPaths(overlay);
  assert.equal(playerPaths.length, lessons.LEARNING_PATHS.length + 1, "the authored path reaches the player catalog");
  assert.deepEqual(
    playerPaths.at(-1).modules.map((module) => module.id),
    [labId],
    "the authored path contains the lab the educator wrote",
  );

  // ── Deleting the lab leaves no dangling reference behind ──────────────────
  clickButton("Delete lab");
  assert.equal(overlay.modules[labId], undefined, "the lab is removed");
  assert.deepEqual(overlay.paths[0].moduleIds, [], "no path keeps a reference to the deleted lab");

  // ── Deleting the path takes its labs with it ──────────────────────────────
  clickButton("New lab");
  const secondLab = Object.keys(overlay.modules).at(-1);
  clickButton("Delete path and its labs");
  assert.deepEqual(overlay.paths, [], "the path is removed");
  assert.equal(overlay.modules[secondLab], undefined, "the path's labs are removed with it");

  // ── The warnings are written in the educator's own language ───────────────
  const broken = authoring.emptyModule(1);
  broken.id = "lab-broken";
  broken.tasks = [authoring.emptyTask()];
  broken.theory = [];
  broken.challenges = [authoring.emptyChallenge()];
  const warningsFor = (lang) => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    act(() => {
      root.render(React.createElement(ContentEditor, {
        lang,
        overlay: { modules: { "lab-broken": broken }, paths: [] },
        onCommit: () => {},
      }));
    });
    const banner = container.querySelector(".content-issues");
    const text = banner ? banner.textContent : "";
    act(() => { root.unmount(); });
    container.remove();
    return text;
  };
  const englishWarnings = warningsFor("en");
  const greekWarnings = warningsFor("el");
  assert.ok(englishWarnings.includes("Needs attention before this is teachable:"), "the banner is shown in English");
  assert.ok(englishWarnings.includes("The lab has no title."), "the English warning is real prose, not a code");
  assert.ok(greekWarnings.includes("Χρειάζεται προσοχή πριν διδαχτεί:"), "the banner is shown in Greek");
  assert.ok(greekWarnings.includes("Το εργαστήριο δεν έχει τίτλο."), "the Greek warning is real prose, not a code");
  assert.equal(greekWarnings.includes("The lab has no title."), false, "no English leaks into the Greek banner");
  assert.match(greekWarnings, /Ο στόχος 1 δεν έχει έλεγχο ολοκλήρωσης/, "the Greek warning names the objective position");

  // ── The educator reaches all of this from the dashboard ───────────────────
  const [{ default: EducatorDashboard }, db] = await Promise.all([
    server.ssrLoadModule("/src/components/EducatorDashboard.tsx"),
    server.ssrLoadModule("/src/lib/db.ts"),
  ]);
  db.resetAll();
  const dashContainer = document.createElement("div");
  document.body.appendChild(dashContainer);
  const dashRoot = createRoot(dashContainer);
  act(() => {
    dashRoot.render(React.createElement(EducatorDashboard, {
      user: db.allEducators()[0],
      lang: "en",
      onProfile: () => {},
      onOpenLab: () => {},
      onShowMap: () => {},
    }));
  });
  const tabButtons = [...dashContainer.querySelectorAll(".educator-tabs button")];
  const authoringTab = tabButtons.find((button) => button.textContent.includes("Build and edit the course"));
  assert.ok(authoringTab, "the dashboard offers a course-authoring tab");
  act(() => { authoringTab.click(); });
  assert.ok(dashContainer.querySelector(".content-editor"), "the tab opens the authoring editor");
  assert.deepEqual(
    db.getContentOverlay(),
    { modules: {}, paths: [] },
    "opening the editor writes nothing on its own",
  );
  const dashNewPath = [...dashContainer.querySelectorAll(".content-editor button")]
    .find((button) => button.textContent.trim() === "New learning path");
  assert.ok(dashNewPath, "the dashboard-hosted editor can create a path");
  act(() => { dashNewPath.click(); });
  assert.equal(db.getContentOverlay().paths.length, 1, "creating a path from the dashboard persists it");
  assert.equal(
    db.getContentOverlay().modules && Object.keys(db.getContentOverlay().modules).length,
    0,
    "an empty path carries no labs yet",
  );
  act(() => { dashRoot.unmount(); });
  dashContainer.remove();

  console.log("Content editor UI checks passed: creating a learning path, adding and writing a lab with XP and a completion test, reaching the player catalog, deleting without leftovers, bilingual warnings, and reaching it all from the educator dashboard.");
} finally {
  await server.close();
}
