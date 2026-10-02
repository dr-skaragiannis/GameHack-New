// Focused repro: module node click, wheel zoom, drag, hub button, mobile viewport.
import { chromium } from "playwright-core";

const browser = await chromium.launch({ headless: true });

async function run(label, viewport) {
  console.log(`\n===== ${label} (${viewport.width}x${viewport.height}) =====`);
  const ctx = await browser.newContext({ viewport, hasTouch: viewport.width < 500 });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(["PAGEERROR", e.message, e.stack]));
  page.on("console", (m) => { if (m.type() === "error") errors.push(["CONSOLE", m.text()]); });

  await page.addInitScript(() => {
    const m = () => ({ xp: 82, commandsRun: 200, pasteCount: 40, typedCount: 160, typoCount: 24, hintsUsed: 2, challengeAttempts: 8, challengeSolves: 5, secondsActive: 16000, streakDays: 3, lastActiveDay: "2026-10-01" });
    const u = (id, un, dn, role, av) => ({ id, username: un, password: "demo", role, displayName: dn, avatar: av, bio: "", interests: [], createdAt: Date.now() - 86400000 * 7, lang: "en", accepted: true, progress: {}, metrics: m(), badges: [] });
    const db = {
      users: [
        u("e1", "educator", "Dr. Mara Vance", "educator", "ic:owl:#a78bfa"),
        u("p1", "nova", "Nova Reyes", "player", "ic:terminal:#22d3ee"),
        u("p2", "byte", "Byte Walker", "player", "ic:ghost:#3ddc84"),
        u("p3", "cipher", "Cipher Kaur", "player", "ic:raven:#a78bfa"),
        u("me", "tester", "Crash Tester", "player", "ic:skull:#ff6a2b"),
      ],
      sessionUserId: "me", feed: [], tickets: [], messages: [], chats: [],
    };
    localStorage.setItem("hackforge.platform.v1", JSON.stringify(db));
  });

  await page.goto("http://localhost:8000/", { waitUntil: "networkidle" });
  await page.waitForSelector("text=Learning Map", { timeout: 8000 });

  const alive = async () => page.evaluate(() => !!document.querySelector("#root")?.firstChild);
  const report = async (what) => console.log(`${what} -> mounted: ${await alive()}, errors: ${errors.length}`);

  // 1) click a module node directly (first interactive thing)
  const node = page.locator("svg g.cursor-pointer").first();
  await node.click({ timeout: 5000, force: true });
  await page.waitForTimeout(500);
  await report("click module node");
  const moduleOpen = await page.locator("header", { hasText: "Level" }).count().catch(() => 0);
  console.log("  module opened?", moduleOpen > 0 ? "YES" : "no");

  // back to dashboard
  await page.goto("http://localhost:8000/", { waitUntil: "networkidle" }).catch(() => {});
  await page.waitForSelector("text=Learning Map", { timeout: 8000 });
  await page.waitForSelector("div.cursor-grab", { timeout: 8000 });

  // 2) hub collapse button (the circled -/+ on hubs) — target by its text content
  const hubBtn = page.locator("button[title='Hide labs']").first();
  if (await hubBtn.count()) { await hubBtn.click({ timeout: 3000, force: true }).catch((e) => console.log("hub − click fail", String(e).split("\n")[0])); }
  await page.waitForTimeout(300);
  await report("click hub collapse (−)");
  const hubPlus = page.locator("button[title='Expand labs']").first();
  if (await hubPlus.count()) { await hubPlus.click({ timeout: 3000, force: true }).catch((e) => console.log("hub + click fail", String(e).split("\n")[0])); }
  await page.waitForTimeout(300);
  await report("click hub expand (+)");

  // 3) wheel zoom on canvas
  const map = page.locator("div.cursor-grab");
  const box = await map.boundingBox();
  if (box) {
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.wheel(0, -400);
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(300);
  }
  await report("wheel zoom");

  // 4) drag pan
  if (box) {
    await page.mouse.move(box.x + 200, box.y + 200);
    await page.mouse.down();
    await page.mouse.move(box.x + 350, box.y + 300, { steps: 8 });
    await page.mouse.up();
    await page.waitForTimeout(300);
  }
  await report("drag pan");

  // 5) click demo player marker (@...). The name tag divs contain @username — find their button sibling
  const marker = page.locator("div.cursor-grab div.pointer-events-none > div.pointer-events-auto").nth(1).locator("button").first();
  if (await marker.count()) { await marker.click({ timeout: 3000 }).catch((e) => console.log("marker click fail", String(e).split("\n")[0])); }
  await page.waitForTimeout(400);
  await report("click demo marker");

  if (errors.length) {
    console.log("\nERRORS:");
    for (const [k, m, s] of errors.slice(0, 4)) { console.log(`[${k}] ${m}`); if (s) console.log(s.split("\n").slice(0, 15).join("\n")); }
  }
  await ctx.close();
}

await run("desktop", { width: 1440, height: 900 });
await run("mobile", { width: 390, height: 844 });
await browser.close();
console.log("\nDONE");
