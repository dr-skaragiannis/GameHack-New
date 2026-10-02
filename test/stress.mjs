// Stress: rapid scroll/drag gestures on the map (crash repro conditions).
import { chromium } from "playwright-core";

const browser = await chromium.launch({ headless: true });

for (const vp of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  const ctx = await browser.newContext({ viewport: vp, hasTouch: vp.width < 500 });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(["PAGEERROR", e.message]));
  page.on("console", (m) => { if (m.type() === "error") errors.push(["CONSOLE", m.text()]); });

  await page.goto("http://localhost:8000/", { waitUntil: "networkidle" });
  if (await page.getByRole("button", { name: "Register" }).count().catch(() => 0)) {
    await page.getByRole("button", { name: "Register" }).click();
    await page.getByPlaceholder("Nova Reyes").fill("Stress");
    await page.getByPlaceholder("nova", { exact: true }).fill("stress");
    await page.getByPlaceholder("••••••••").fill("pass123");
    await page.getByRole("button", { name: /Create account/ }).click();
    await page.getByText(/I understand/).click();
  }
  await page.waitForSelector("div.cursor-grab", { timeout: 8000 });

  const box = await page.locator("div.cursor-grab").boundingBox();
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;

  // 1) hammer the wheel (scroll/zoom) fast
  await page.mouse.move(cx, cy);
  for (let i = 0; i < 25; i++) { await page.mouse.wheel(0, i % 2 ? 240 : -240); await page.waitForTimeout(16); }

  // 2) fast drags that end OUTSIDE the element (pointerleave mid-gesture)
  for (let i = 0; i < 6; i++) {
    await page.mouse.move(cx, cy);
    await page.mouse.down();
    await page.mouse.move(cx + 300, cy - 250, { steps: 3 });
    await page.mouse.move(box.x - 80, box.y - 80, { steps: 2 }); // leaves viewport
    await page.mouse.up();
    await page.waitForTimeout(20);
  }

  // 3) drag + wheel simultaneously-ish (alternate rapidly)
  for (let i = 0; i < 5; i++) {
    await page.mouse.move(cx - 100, cy);
    await page.mouse.down();
    await page.mouse.move(cx + 80, cy + 60, { steps: 4 });
    await page.mouse.wheel(0, -180);
    await page.mouse.up();
    await page.waitForTimeout(16);
  }

  // 4) scroll while hovering nodes/markers
  await page.mouse.move(box.x + 120, box.y + 120);
  await page.mouse.wheel(0, -300);
  await page.mouse.wheel(0, 300);

  await page.waitForTimeout(400);
  const mounted = await page.evaluate(() => !!document.querySelector("#root")?.firstChild);
  const errBoundary = await page.locator("text=Something glitched in the lab").count();
  console.log(`${vp.width}x${vp.height}: mounted=${mounted} errorBoundary=${errBoundary} errors=${errors.length}`);
  for (const [k, m] of errors.slice(0, 4)) console.log(`  [${k}] ${m}`);
  await ctx.close();
}
await browser.close();
console.log("STRESS DONE");
