// Click EVERY map node and check for black-screen crashes.
import { chromium } from "playwright-core";
import { CAMPAIGNS } from "../src/data/lessons.ts";

const labels = [];
for (const c of CAMPAIGNS) for (const m of [...c.modules].sort((a, b) => a.order - b.order)) labels.push([c.id, m.title.en.slice(0, 18)]);
console.log("nodes:", labels.length);

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
let errors = [];
page.on("pageerror", (e) => { errors.push(["PAGEERROR", e.message, e.stack]); });
page.on("console", (m) => { if (m.type() === "error") errors.push(["CONSOLE", m.text()]); });

// NOTE: localStorage left empty -> app shows AuthScreen; register via UI quickly
await page.goto("http://localhost:8000/", { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Register" }).click();
await page.getByPlaceholder("Nova Reyes").fill("Map Clicker");
await page.getByPlaceholder("nova", { exact: true }).fill("clicker");
await page.getByPlaceholder("••••••••").fill("pass123");
await page.getByRole("button", { name: /Create account/ }).click();
await page.getByText(/I understand/).click();
await page.waitForSelector("text=Learning Map", { timeout: 8000 });

for (const [cid, label] of labels) {
  const node = page.locator(`svg g.cursor-pointer:has-text("${label.slice(0, 10).replace(/["\\]/g, "")}")`).first();
  const n = await node.count();
  if (!n) { console.log(`[${cid}] '${label}' — node not found (maybe text differs)`); continue; }
  await node.click({ force: true }).catch((e) => console.log("  click fail:", String(e).split("\n")[0]));
  await page.waitForTimeout(350);
  const mounted = await page.evaluate(() => !!document.querySelector("#root")?.firstChild);
  const bodyText = (await page.evaluate(() => document.body.textContent || "")).slice(0, 4000);
  const opened = bodyText.includes("Complete the objectives") || bodyText.includes("theory") || bodyText.includes("Theory");
  console.log(`[${cid}] '${label}' — mounted: ${mounted}, module opened: ${opened}, errors: ${errors.length}`);
  if (errors.length) break;
  if (opened) {
    // back to dashboard
    await page.locator("header button").first().click().catch(() => {});
    await page.waitForTimeout(300);
    await page.goto("http://localhost:8000/", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("text=Learning Map", { timeout: 8000 });
  }
}

if (errors.length) {
  console.log("\nCAPTURED ERRORS:");
  for (const [k, m, s] of errors.slice(0, 3)) { console.log(`[${k}] ${m}`); if (s) console.log(s.split("\n").slice(0, 15).join("\n")); }
}
await browser.close();
