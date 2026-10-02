// Verify: map node click opens its module; hub collapse works; markers open profiles.
// Then open EVERY module via the built-in CampaignMap view to find any ModuleView crash.
import { chromium } from "playwright-core";
import { CAMPAIGNS } from "../src/data/lessons.ts";

const browser = await chromium.launch({ headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(["PAGEERROR", e.message, e.stack]));
page.on("console", (m) => { if (m.type() === "error") errors.push(["CONSOLE", m.text()]); });

async function freshPlayer() {
  await page.goto("http://localhost:8000/", { waitUntil: "networkidle" });
  const onAuth = await page.getByRole("button", { name: "Register" }).count().catch(() => 0);
  if (onAuth) {
    await page.getByRole("button", { name: "Register" }).click();
    await page.getByPlaceholder("Nova Reyes").fill("Map Clicker");
    await page.getByPlaceholder("nova", { exact: true }).fill("clicker");
    await page.getByPlaceholder("••••••••").fill("pass123");
    await page.getByRole("button", { name: /Create account/ }).click();
    await page.getByText(/I understand/).click();
  }
  await page.waitForSelector("text=Learning Map", { timeout: 8000 });
}
const inModule = async () => (await page.locator("header", { hasText: "Level" }).count()) > 0;
const mounted = async () => page.evaluate(() => !!document.querySelector("#root")?.firstChild);

await freshPlayer();

// A) click first module node -> module should open now
await page.locator("svg g.cursor-pointer").first().click({ force: true });
await page.waitForTimeout(400);
console.log("A) node click opens module:", await inModule(), "| mounted:", await mounted(), "| errors:", errors.length);

// back to dashboard
await page.goto("http://localhost:8000/", { waitUntil: "domcontentloaded" });

// B) hub collapse button hides labs
await page.waitForSelector("text=Learning Map", { timeout: 8000 });
const before = await page.locator("svg g.cursor-pointer").count();
await page.locator("svg g.cursor-pointer text:has-text('−')").first().click({ force: true }).catch((e) => console.log("hub btn click fail:", String(e).split("\n")[0]));
await page.waitForTimeout(300);
const after = await page.locator("svg g.cursor-pointer").count();
console.log(`B) hub collapse: nodes+buttons before=${before} after=${after} (expect fewer)`, "| mounted:", await mounted());

// C) marker button opens profile (look for a marker near a node)
const marker = page.locator("div.pointer-events-none > div.pointer-events-auto > button").first();
if (await marker.count()) {
  await marker.click({ force: true });
  await page.waitForTimeout(400);
  const onProfile = (await page.locator("text=/Operator|Educator/").count()) > 0;
  console.log("C) marker click opens profile-ish view:", onProfile, "| mounted:", await mounted());
} else console.log("C) no marker found");
await page.goto("http://localhost:8000/", { waitUntil: "domcontentloaded" });
await page.waitForSelector("text=Learning Map", { timeout: 8000 });

// D) open EVERY module from the built-in CampaignMap (the app's 'map' view)
console.log("\nD) opening every module via Campaigns -> campaign -> module card:");
for (const c of CAMPAIGNS) {
  const mods = [...c.modules].sort((a, b) => a.order - b.order);
  for (const m of mods) {
    await page.goto("http://localhost:8000/", { waitUntil: "domcontentloaded" });
    await page.waitForSelector("text=Learning Map", { timeout: 8000 });
    await page.locator("button", { hasText: "Campaigns" }).first().click();
    await page.waitForTimeout(250);
    await page.locator("button", { hasText: c.title.en.slice(0, 12) }).first().click({ force: true });
    await page.waitForTimeout(350);
    await page.locator("button", { hasText: m.title.en.slice(0, 14) }).first().click({ force: true }).catch((e) => console.log("  module card click fail:", String(e).split("\n")[0]));
    await page.waitForTimeout(450);
    const ok = await inModule();
    const alive = await mounted();
    console.log(`  [${c.id}] ${m.id}: opened=${ok} mounted=${alive} errors=${errors.length}`);
    if (errors.length || !alive) {
      console.log("  *** CRASH DETECTED ***", m.id);
      for (const [k, msg, st] of errors.slice(0, 3)) { console.log(`[${k}] ${msg}`); if (st) console.log(st.split("\n").slice(0, 16).join("\n")); }
      await browser.close();
      process.exit(1);
    }
  }
}
console.log("\nALL GREEN — errors:", errors.length);
await browser.close();
