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
  const [{ default: ModuleView }, { LEARNING_PATHS }] = await Promise.all([
    server.ssrLoadModule("/src/components/ModuleView.tsx"),
    server.ssrLoadModule("/src/data/lessons.ts"),
  ]);

  const path = LEARNING_PATHS.find((entry) => entry.id === "linux-part-01");
  assert.ok(path, "learning path 1 should be registered");

  const MARKERS = {
    en: { why: "why:", how: "how:" },
    el: { why: "γιατί:", how: "πώς:" },
  };

  /**
   * Mount the real ModuleView and open the Why & how popup for every objective
   * in the lab. This exercises the shipped splitExplain and fieldGuideForTask
   * rather than a reimplementation of them.
   */
  const sweep = (module, lang) => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    act(() => {
      root.render(React.createElement(ModuleView, {
        module,
        userId: "player-1",
        campaignId: path.id,
        lang,
        initialTab: "lab",
        topbarTools: null,
        done: [],
        moduleCompleted: false,
        hasQuiz: true,
        hasAssessment: true,
        onWidth: () => {},
        onTask: () => {},
        onCommandMetric: () => {},
        onHint: () => {},
        onStartQuiz: () => {},
        onStartAssessment: () => {},
        onCompleteLab: () => {},
        onBack: () => {},
      }));
    });

    const checked = [];
    for (const task of module.tasks ?? []) {
      const openers = [...container.querySelectorAll('button[aria-controls="why-how-popup"]')];
      const before = container.querySelector("#why-how-popup");
      assert.equal(before, null, `${module.id}/${task.id}: no popup should be open yet`);

      // Every objective row renders the same button label, so open by position.
      const index = (module.tasks ?? []).indexOf(task);
      const button = openers[index];
      assert.ok(button, `${module.id}/${task.id}: the Why & how button should render`);
      act(() => { button.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); });

      const popup = container.querySelector("#why-how-popup");
      assert.ok(popup, `${module.id}/${task.id}: clicking should open the popup`);

      const whyCard = popup.querySelector(".why-how-dialog__card.is-why p");
      const howCard = popup.querySelector(".why-how-dialog__card.is-how");
      assert.ok(whyCard, `${module.id}/${task.id} [${lang}]: the popup should render a WHY card`);
      assert.ok(howCard, `${module.id}/${task.id} [${lang}]: the popup should render a HOW card`);

      const why = whyCard.textContent.trim();
      const howParagraphs = [...howCard.querySelectorAll("p")].map((p) => p.textContent.trim()).filter(Boolean);

      assert.ok(why.length > 40, `${module.id}/${task.id} [${lang}]: WHY is too short (${why.length})`);
      assert.ok(!why.toLowerCase().includes(MARKERS[lang].why),
        `${module.id}/${task.id} [${lang}]: WHY still carries its marker, so splitExplain did not strip it`);
      assert.ok(!why.toLowerCase().includes(MARKERS[lang].how),
        `${module.id}/${task.id} [${lang}]: WHY swallowed the how-clause`);
      assert.ok(howParagraphs.length >= 1, `${module.id}/${task.id} [${lang}]: HOW should have at least one paragraph`);
      for (const paragraph of howParagraphs) {
        assert.ok(!paragraph.toLowerCase().includes(MARKERS[lang].how),
          `${module.id}/${task.id} [${lang}]: HOW still carries its marker`);
      }

      // A HOW card can also be filled from the command library, so "the card
      // exists" is not enough: the objective's own how-clause must be in it.
      // Deriving the expected fragment here is test-side expectation, not a
      // reimplementation of the code under test - the assertion still runs
      // against what the real component rendered.
      const explainText = task.explain[lang];
      const lowered = explainText.toLocaleLowerCase("el");
      const found = ["how:", "πώς:", "πως:"].map((marker) => lowered.indexOf(marker)).filter((i) => i !== -1);
      assert.ok(found.length > 0,
        `${module.id}/${task.id} [${lang}]: the objective explain must carry a how marker`);
      const clause = explainText.slice(Math.min(...found)).replace(/^[^:]*:/, "").trim();
      const probe = clause.slice(20, 70);
      assert.ok(probe.length >= 30,
        `${module.id}/${task.id} [${lang}]: how-clause is too short to verify (${probe.length})`);
      assert.ok(howParagraphs.join(" ").includes(probe),
        `${module.id}/${task.id} [${lang}]: the HOW card does not carry the objective's own how-clause`);

      // Close again so the next objective opens from a clean slate.
      act(() => { button.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true })); });
      assert.equal(container.querySelector("#why-how-popup"), null,
        `${module.id}/${task.id}: clicking again should close the popup`);

      checked.push(`${module.id}/${task.id}`);
    }

    act(() => root.unmount());
    container.remove();
    return checked;
  };

  let total = 0;
  for (const module of path.modules) {
    assert.ok((module.tasks ?? []).length > 0, `${module.id} should have objectives`);
    for (const lang of ["en", "el"]) {
      const checked = sweep(module, lang);
      total += checked.length;
    }
  }

  assert.equal(total, 96, "every objective in path 1 should be checked in both languages");
  console.log(`Why & how popup checks passed: ${total} objectives rendered through the real ModuleView, WHY and HOW cards present in both languages, no marker leakage.`);
} finally {
  await server.close();
}
