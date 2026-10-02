import { chromium } from "playwright-core";
const browser = await chromium.launch({ headless: true });
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const errors = [];
page.on("pageerror", (e) => errors.push([e.message, e.stack]));
page.on("console", (m) => { if (m.type() === "error") errors.push([m.text()]); });
await page.goto("http://localhost:8000/", { waitUntil: "networkidle" });
if (await page.getByRole("button", { name: "Register" }).count().catch(() => 0)) {
  await page.getByRole("button", { name: "Register" }).click();
  await page.getByPlaceholder("Nova Reyes").fill("Dbg");
  await page.getByPlaceholder("nova", { exact: true }).fill("dbg");
  await page.getByPlaceholder("••••••••").fill("pass123");
  await page.getByRole("button", { name: /Create account/ }).click();
  await page.getByText(/I understand/).click();
}
await page.waitForSelector("div.cursor-grab", { timeout: 8000 });
// collapse intro
await page.locator("button[title='Hide labs']").first().click({ force: true });
await page.waitForTimeout(300);
console.log("after collapse: cursor-grab count =", await page.locator("div.cursor-grab").count());
console.log("expand buttons:", await page.locator("button[title='Expand labs']").count());
// which elements match '+'
const handles = await page.locator("button[title='Expand labs']").all();
for (const h of handles) console.log("  '+' grp:", (await h.innerHTML().catch(()=>"")).slice(0,160).replace(/\n/g,''));
await page.locator("button[title='Expand labs']").first().click({ force: true });
await page.waitForTimeout(300);
console.log("after expand: cursor-grab count =", await page.locator("div.cursor-grab").count());
console.log("body tail:", (await page.evaluate(() => document.body.textContent)).slice(0, 220).replace(/\s+/g, " "));
console.log("errors:", errors.length, errors[0]?.[0] || "");
await browser.close();
