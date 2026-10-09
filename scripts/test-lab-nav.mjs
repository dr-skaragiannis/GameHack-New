import assert from "node:assert/strict";

const { JSDOM } = await import("jsdom");
const dom = new JSDOM("<!doctype html><html><body><div id='root'></div></body></html>", { url: "http://localhost/", pretendToBeVisual: true });
globalThis.window = dom.window; globalThis.document = dom.window.document;
globalThis.localStorage = dom.window.localStorage;
globalThis.HTMLElement = dom.window.HTMLElement; globalThis.Element = dom.window.Element;
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
globalThis.ResizeObserver = class { observe(){} unobserve(){} disconnect(){} };
dom.window.matchMedia = (q) => ({ matches: false, media: q, onchange: null, addListener(){}, removeListener(){}, addEventListener(){}, removeEventListener(){}, dispatchEvent(){ return false; } });
globalThis.matchMedia = dom.window.matchMedia;
dom.window.scrollTo = () => {};
dom.window.Element.prototype.scrollTo = function () {};
dom.window.Element.prototype.scrollIntoView = function () {};
globalThis.getComputedStyle = (el) => dom.window.getComputedStyle(el);
globalThis.fetch = async () => ({ ok: false, status: 401, json: async () => ({}) });
globalThis.URL.createObjectURL = () => "blob:x"; globalThis.URL.revokeObjectURL = () => {};
const React = await import("react");
const { createRoot } = await import("react-dom/client");
const { act } = React;
const { createServer } = await import("vite");
const server = await createServer({ server: { middlewareMode: true }, appType: "custom", logLevel: "error" });
const flush = async (n=6) => { for (let i=0;i<n;i++) await act(async () => { await new Promise(r=>setTimeout(r,0)); }); };
const setVal = (el, v) => {
  const proto = el instanceof dom.window.HTMLTextAreaElement ? dom.window.HTMLTextAreaElement.prototype : dom.window.HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(proto, "value").set.call(el, v);
  el.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
};
try {
  const { AuthProvider } = await server.ssrLoadModule("/src/lib/useAuth.tsx");
  const App = (await server.ssrLoadModule("/src/App.tsx")).default;
  const c = document.getElementById("root"); const root = createRoot(c);
  await act(async () => { root.render(React.createElement(AuthProvider, null, React.createElement(App))); });
  await flush();
  const byLabel = (txt) => [...c.querySelectorAll("button")].find(b => b.textContent.trim().toLowerCase() === txt);
  await act(async () => { byLabel("sign in").click(); });
  await flush();
  const inputs = [...c.querySelectorAll("input")];
    if (inputs.length >= 2) {
    await act(async () => { setVal(inputs[0], "nova"); setVal(inputs[1], "demodemo"); });
    const form = c.querySelector("form");
    await act(async () => { form.dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true })); });
    await flush(10);
  }
  const byText = (txt) => [...c.querySelectorAll("button")].find((b) => b.textContent.trim().toLowerCase().includes(txt));
  const continueButton = byText("continue learning") || byText("continue");
  assert.ok(continueButton, "the dashboard offers a way into the current lab");
  await act(async () => { continueButton.click(); });
  await flush(8);

  // The quiz trigger and the lab stepper live in the topbar, never under the
  // terminal where they used to be covered by it.
  const nav = c.querySelector(".module-topbar__lab-nav");
  assert.ok(nav, "the topbar carries the lab navigation cluster");
  const navButtons = [...nav.querySelectorAll("button")];
  const labelsOf = navButtons.map((b) => b.textContent.trim());
  assert.ok(labelsOf.includes("Start quick quiz"), "the quick quiz trigger moved into the topbar");
  assert.ok(labelsOf.includes("Previous lab"), "the topbar offers the previous lab");
  assert.ok(labelsOf.includes("Next lab"), "the topbar offers the next lab");

  const quiz = navButtons.find((b) => b.textContent.trim() === "Start quick quiz");
  const next = navButtons.find((b) => b.textContent.trim() === "Next lab");
  assert.equal(quiz.disabled, true, "the quiz stays locked until the lab's own work is done");
  assert.equal(next.disabled, true, "the next lab stays locked until this lab is complete");
  assert.match(quiz.title, /unlock the quiz/, "a locked quiz explains how to unlock it");
  assert.match(next.title, /Complete this lab/, "a locked next lab explains why");

  // It has to sit immediately to the left of the language switch.
  const account = c.querySelector(".module-topbar__account-tools");
  const order = [...account.children];
  const navIndex = order.findIndex((el) => el.classList.contains("module-topbar__lab-nav"));
  const langIndex = order.findIndex((el) => el.tagName === "BUTTON" && el.textContent.trim() === "EL");
  assert.ok(navIndex >= 0 && langIndex === navIndex + 1,
    `the lab nav should sit directly left of the language switch (nav=${navIndex}, lang=${langIndex})`);

  // The inline triggers are gone for good.
  const everyButton = [...c.querySelectorAll("button")].map((b) => b.textContent.trim());
  assert.ok(!everyButton.includes("Start lab assessment"), "the lab assessment entry point was removed");
  assert.equal(
    everyButton.filter((label) => label === "Start quick quiz").length, 1,
    "the quiz trigger appears once, in the topbar, and not again under the terminal",
  );

  await act(async () => { root.unmount(); });
  console.log("Lab navigation checks passed: the quick quiz trigger and the previous/next lab stepper live in the module topbar directly left of the language switch, the quiz and the next lab both stay disabled with an explanatory tooltip until the lab is finished, and the assessment entry point is gone.");
} catch (error) {
  const aggregated = error.errors || (error.cause && error.cause.errors);
  if (aggregated) aggregated.slice(0, 3).forEach((e) => console.error(" ->", e.stack));
  console.error(error);
  await server.close();
  // jsdom and the dev server keep handles open, so a failure would otherwise
  // hang instead of reporting.
  process.exit(1);
}
await server.close();
process.exit(0);
