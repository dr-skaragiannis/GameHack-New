// Headless smoke test: mount the real app, log in, click a map node, catch crashes.
import { JSDOM } from "jsdom";

const dom = new JSDOM("<!doctype html><html><body><div id='root'></div></body></html>", {
  url: "http://localhost/",
  pretendToBeVisual: true,
});

const g = globalThis as any;
g.window = dom.window;
g.document = dom.window.document;
// Node >=21 exposes a getter-only globalThis.navigator, so plain assignment throws.
const defineGlobal = (name: string, value: unknown) => {
  try {
    (g as any)[name] = value;
  } catch {
    Object.defineProperty(g, name, { value, configurable: true, writable: true });
  }
};
defineGlobal("navigator", dom.window.navigator);
g.localStorage = dom.window.localStorage;
g.HTMLElement = dom.window.HTMLElement;
g.SVGElement = dom.window.SVGElement;
g.Element = dom.window.Element;
g.Node = dom.window.Node;
g.CustomEvent = dom.window.CustomEvent;
g.MouseEvent = dom.window.MouseEvent;
g.KeyboardEvent = dom.window.KeyboardEvent;
g.Event = dom.window.Event;
g.getComputedStyle = dom.window.getComputedStyle;
g.requestAnimationFrame = (cb: any) => setTimeout(() => cb(Date.now()), 0);
g.cancelAnimationFrame = (id: any) => clearTimeout(id);
dom.window.requestAnimationFrame = g.requestAnimationFrame;
dom.window.cancelAnimationFrame = g.cancelAnimationFrame;
dom.window.scrollTo = () => {};
g.ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
dom.window.ResizeObserver = g.ResizeObserver;
(domsafe => { domsafe.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} }); })(dom.window);
dom.window.AudioContext = class {
  createOscillator() { return { connect() {}, start() {}, stop() {}, frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, type: "" }; }
  createGain() { return { connect() {}, gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {} } }; }
  get destination() { return {}; }
  get currentTime() { return 0; }
};

// capture fatal render errors
process.on("uncaughtException", (e) => {
  console.error("UNCAUGHT:", e.message);
  console.error(e.stack?.split("\n").slice(0, 12).join("\n"));
  process.exit(1);
});

const React = await import("react");
const { createRoot } = await import("react-dom/client");
const { act } = await import("react");

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const { AuthProvider } = await import("../src/lib/useAuth");
const db = await import("../src/lib/db");
const App = (await import("../src/App")).default;

// create + login a player directly
const reg = db.register("testplayer", "pass123", "player", "Test Player");
if (!reg.ok) throw new Error("register failed: " + reg.error);
db.login("testplayer", "pass123");
// accept ethics gate
db.updateUser(reg.user!.id, { accepted: true });

const root = createRoot(document.getElementById("root")!);
await act(async () => {
  root.render(React.createElement(AuthProvider, null, React.createElement(App)));
});
await act(async () => { await new Promise(r => setTimeout(r, 50)); });

const click = async (el: Element, label: string) => {
  console.log("CLICK:", label);
  await act(async () => {
    el.dispatchEvent(new dom.window.MouseEvent("pointerdown", { bubbles: true }));
    el.dispatchEvent(new dom.window.MouseEvent("pointerup", { bubbles: true }));
    el.dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true, cancelable: true }));
    await new Promise(r => setTimeout(r, 30));
  });
};

// 1) background click on the map viewport
const mapViewport = [...document.querySelectorAll("div")].find(d => d.className.includes("cursor-grab"));
if (mapViewport) await click(mapViewport, "map background");

// 2) click a module node <g> (has cursor-pointer and is inside map svg)
const nodes = [...document.querySelectorAll("svg g")].filter(g2 => (g2.getAttribute("class") || "").includes("cursor-pointer"));
console.log("found clickable svg groups:", nodes.length);
if (nodes[0]) await click(nodes[0], "first map node (module/hub-toggle)");
console.log("after first node click, body has", document.body.innerHTML.length, "chars, module view?", document.body.textContent?.includes("Theory") ? "MODULE OPENED" : "no");

// 3) collapse/expand hub button & zoom controls via their text
const allBtns = [...document.querySelectorAll("button")];
const plusMinus = allBtns.filter(b => ["−", "+"].includes(b.textContent.trim()));
console.log("found +/- buttons:", plusMinus.length);
if (plusMinus[0]) await click(plusMinus[0], "hub collapse −");

// 4) player marker buttons (contain @username tag -> div with YOU/@)
const markerBtns = allBtns.filter(b => b.parentElement?.querySelector("div")?.textContent?.startsWith("@") || b.parentElement?.querySelector("div")?.textContent === "YOU");
console.log("found marker buttons:", markerBtns.length);
if (markerBtns[0]) await click(markerBtns[0], "player marker");

// 5) filter chips
const chip = allBtns.find(b => b.textContent.includes("Online ·"));
if (chip) await click(chip, "online filter chip");

console.log("ALL CLICKS SURVIVED");
process.exit(0);
