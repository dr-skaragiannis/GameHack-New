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
// ModuleView measures the sticky topbar with a ResizeObserver.
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
dom.window.ResizeObserver = ResizeObserverStub;
globalThis.ResizeObserver = ResizeObserverStub;
// jsdom implements no scrolling; TerminalView auto-scrolls on every line.
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
  const [{ default: ModuleView }, authoring, quizProgress] = await Promise.all([
    server.ssrLoadModule("/src/components/ModuleView.tsx"),
    server.ssrLoadModule("/src/lib/contentAuthoring.ts"),
    server.ssrLoadModule("/src/lib/quizProgress.ts"),
  ]);

  // An educator-authored lab: no shipped quiz, no shipped assessment.
  const authored = authoring.compileModule({
    id: "lab-authored", order: 1, icon: "terminal", color: "from-cyan-400 to-sky-900",
    difficulty: 2, scenario: "lab",
    title: { en: "Reading logs", el: "Διάβασμα αρχείων καταγραφής" },
    subtitle: { en: "Auth logs", el: "Αρχεία auth" },
    badge: { en: "Log reader", el: "Αναγνώστης" },
    theory: [{
      id: "s1",
      heading: { en: "Why logs", el: "Γιατί τα αρχεία καταγραφής" },
      body: { en: "Logs record what a host did.\n\nThey are the first place you look.", el: "Τα αρχεία κρατούν τι έκανε ένας host.\n\nΕίναι το πρώτο σημείο ελέγχου." },
    }],
    cheats: [{ cmd: "tail -n 20 /var/log/auth.log", desc: { en: "Last lines", el: "Τελευταίες γραμμές" } }],
    tasks: [
      { id: "t1", instruction: { en: "Show the last lines.", el: "Δείξε τις τελευταίες γραμμές." }, hint: { en: "tail -n 20 /var/log/auth.log", el: "tail -n 20 /var/log/auth.log" }, explain: { en: "tail prints the end.", el: "Το tail τυπώνει το τέλος." }, reward: 9, check: { kind: "command", pattern: "^tail " } },
      { id: "t2", instruction: { en: "Read the whole log.", el: "Διάβασε όλο το αρχείο." }, hint: { en: "cat /var/log/auth.log", el: "cat /var/log/auth.log" }, explain: { en: "cat prints a file.", el: "Το cat τυπώνει ένα αρχείο." }, reward: 4, check: { kind: "fileRead", path: "auth.log" } },
    ],
    challenges: [
      { id: "c1", title: { en: "First", el: "Πρώτη" }, brief: { en: "Do the first thing.", el: "Κάνε το πρώτο πράγμα." }, success: { en: "Done.", el: "Έγινε." }, check: { kind: "command", pattern: "^tail " } },
      { id: "c2", title: { en: "Second", el: "Δεύτερη" }, brief: { en: "Do the second thing.", el: "Κάνε το δεύτερο πράγμα." }, success: { en: "Done.", el: "Έγινε." }, check: { kind: "fileRead", path: "auth.log" } },
    ],
  });

  const ALL_DONE = [...authored.tasks.map((task) => task.id), "ch-0", "ch-1"];

  /** Mount ModuleView in a throwaway container and hand back what it rendered. */
  const mount = (overrides) => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const calls = [];
    act(() => {
      root.render(React.createElement(ModuleView, {
        module: authored,
        userId: "player-1",
        campaignId: "path-1",
        lang: "en",
        initialTab: "lab",
        topbarTools: null,
        done: ALL_DONE,
        moduleCompleted: false,
        onWidth: () => {},
        onTask: () => {},
        onCommandMetric: () => {},
        onHint: () => {},
        onStartQuiz: () => calls.push("quiz"),
        onStartAssessment: () => calls.push("assessment"),
        onCompleteLab: () => calls.push("complete"),
        onBack: () => {},
        ...overrides,
      }));
    });
    const label = (text) => [...container.querySelectorAll("button")].find((b) => b.textContent.includes(text));
    return { container, root, calls, label };
  };
  const unmount = ({ container, root }) => { act(() => root.unmount()); container.remove(); };

  // ── The reason this path exists ───────────────────────────────────────────
  assert.equal(
    quizProgress.passesQuickQuiz(0, 0),
    false,
    "a quiz with no questions can never be passed, so gating an authored lab on one would lock it",
  );

  // ── An authored lab completes without a quiz ──────────────────────────────
  const open = mount({ hasQuiz: false, hasAssessment: false });
  assert.ok(open.label("Mark lab complete"), "a finished authored lab offers direct completion");
  assert.equal(open.label("Start quick quiz"), undefined, "a lab with no quiz does not offer one");
  assert.equal(open.label("Start lab assessment"), undefined, "a lab with no assessment does not offer one");
  assert.ok(
    open.container.textContent.includes("This lab has no quiz yet"),
    "the player is told why there is no quiz",
  );
  act(() => { open.label("Mark lab complete").click(); });
  assert.deepEqual(open.calls, ["complete"], "the completion button reports back exactly once");
  unmount(open);

  // ── A lab that does have a quiz keeps the old gate ────────────────────────
  const gated = mount({ hasQuiz: true, hasAssessment: true });
  assert.ok(gated.label("Start quick quiz"), "a lab with a quiz still routes through it");
  assert.ok(gated.label("Start lab assessment"), "a lab with an assessment still offers it");
  assert.equal(gated.label("Mark lab complete"), undefined, "a quiz-backed lab does not complete directly");
  act(() => { gated.label("Start quick quiz").click(); });
  assert.deepEqual(gated.calls, ["quiz"], "the quiz button reports back exactly once");
  unmount(gated);

  // ── The prompt only appears once the lab is actually finished ─────────────
  const partway = mount({ hasQuiz: false, hasAssessment: false, done: [authored.tasks[0].id] });
  assert.equal(partway.label("Mark lab complete"), undefined, "an unfinished lab offers no completion");
  unmount(partway);

  const finished = mount({ hasQuiz: false, hasAssessment: false, moduleCompleted: true });
  assert.equal(finished.label("Mark lab complete"), undefined, "an already-completed lab offers nothing more");
  unmount(finished);

  // ── The same holds in Greek ───────────────────────────────────────────────
  const greek = mount({ hasQuiz: false, hasAssessment: false, lang: "el" });
  assert.ok(greek.label("Ολοκλήρωση εργαστηρίου"), "the Greek completion button is labelled");
  assert.ok(
    greek.container.textContent.includes("δεν έχει ακόμα κουίζ"),
    "the Greek explanation is shown",
  );
  unmount(greek);

  // ── A revealed hint is rendered in the reader's language ─────────────────
  // ModuleView read task.hint.en here unconditionally, so a Greek reader was
  // shown the English hint. Nothing covered it because every shipped hint had
  // identical en and el text. This lab deliberately makes them differ.
  const bilingualHintLab = authoring.compileModule({
    id: "lab-hint-lang", order: 1, icon: "terminal", color: "from-cyan-400 to-sky-900",
    difficulty: 2, scenario: "lab",
    title: { en: "Hint language", el: "Γλώσσα υπόδειξης" },
    subtitle: { en: "Revealed hints", el: "Υποδείξεις" },
    badge: { en: "Hints", el: "Υποδείξεις" },
    theory: [{
      id: "s1",
      heading: { en: "Hints", el: "Υποδείξεις" },
      body: { en: "A hint names the command.\n\nIt should read in your language.", el: "Η υπόδειξη ονομάζει την εντολή.\n\nΠρέπει να διαβάζεται στη γλώσσα σου." },
    }],
    cheats: [],
    tasks: [{
      id: "t1",
      instruction: { en: "Read the log.", el: "Διάβασε το αρχείο καταγραφής." },
      hint: { en: "tail -n 20 /var/log/auth.log", el: "tail -n 20 /var/log/auth.log # τελευταίες γραμμές" },
      explain: { en: "Why: the tail of a log is where the answer is. How: tail prints the last lines without reading the whole file, which matters when the file is large.", el: "Γιατί: στο τέλος του αρχείου καταγραφής βρίσκεται η απάντηση. Πώς: η tail εμφανίζει τις τελευταίες γραμμές χωρίς να διαβάσει ολόκληρο το αρχείο, που έχει σημασία όταν το αρχείο είναι μεγάλο." },
      reward: 9,
      check: { kind: "command", pattern: "^tail " },
    }],
    challenges: [],
  });

  for (const [lang, expected, other] of [
    ["el", "tail -n 20 /var/log/auth.log # τελευταίες γραμμές", "Show exact command"],
    ["en", "tail -n 20 /var/log/auth.log", "τελευταίες γραμμές"],
  ]) {
    const view = mount({
      module: bilingualHintLab, userId: `hint-${lang}`, campaignId: "path-1",
      lang, initialTab: "lab", hasQuiz: false, hasAssessment: false, done: [],
    });
    const reveal = lang === "el"
      ? view.label("Εμφάνιση ακριβούς εντολής")
      : view.label("Show exact command");
    assert.ok(reveal, `the reveal button should be labelled in ${lang}`);
    act(() => { reveal.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); });
    const shown = view.container.textContent;
    assert.ok(shown.includes(expected), `the revealed hint should be the ${lang} text`);
    if (lang === "el") {
      assert.ok(!shown.includes(other), `the ${lang} view should not fall back to the English label`);
    }
    unmount(view);
  }

  console.log("Lab completion checks passed: an authored lab with no quiz completes directly, a quiz-backed lab still routes through its quiz, the prompt only shows on a finished lab, both languages are labelled, and a revealed hint renders in the reader's language.");
} finally {
  await server.close();
}
