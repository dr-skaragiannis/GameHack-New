import { chromium } from "playwright-core";

const browser = await chromium.launch({ headless: true });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const errors = [];
page.on("pageerror", (e) => errors.push([e.message, e.stack]));
page.on("console", (m) => { if (m.type() === "error") errors.push([m.text()]); });

await page.goto("http://localhost:8000/", { waitUntil: "networkidle" });
if (await page.getByRole("button", { name: "Register" }).count().catch(() => 0)) {
  await page.getByRole("button", { name: "Register" }).click();
  await page.getByPlaceholder("Nova Reyes").fill("Dbg User");
  await page.getByPlaceholder("nova", { exact: true }).fill("dbg");
  await page.getByPlaceholder("••••••••").fill("pass123");
  await page.getByRole("button", { name: /Create account/ }).click();
  await page.getByText(/I understand/).click();
}
await page.waitForSelector("text=Learning Map", { timeout: 8000 });

// watch for client-side navigation to module view: expose state via class/text sniffing
const before = (await page.locator("svg g.cursor-pointer").all()).length;
console.log("clickable groups:", before);

const node = page.locator("svg g.cursor-pointer").first();
const bb = await node.boundingBox();
console.log("first node bbox:", JSON.stringify(bb));

// real trusted click at the node's center
await page.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2);
await page.waitForTimeout(500);

const txt = await page.evaluate(() => document.body.textContent.slice(0, 500).replace(/\s+/g, " "));
console.log("body text after click:\n", txt.slice(0, 300));
console.log("has <header>:", await page.locator("header").count());
console.log("errors:", errors.length, errors[0]?.[0] || "");
await browser.close();
