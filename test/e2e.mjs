// Real-browser repro for the map crash. Run: node test/e2e.mjs [--olddata]
import { chromium } from "playwright-core";

const OLD_DATA = process.argv.includes("--olddata");

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const errors = [];
page.on("pageerror", (e) => errors.push(["PAGEERROR", e.message, e.stack]));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(["CONSOLE", m.text()]);
});

if (OLD_DATA) {
  // Simulate the user's browser state: a v1 localStorage seeded BEFORE the
  // lastSeen/progress enrichment existed, with a registered player.
  await page.addInitScript(() => {
    const m = () => ({
      xp: 10, commandsRun: 20, pasteCount: 4, typedCount: 16, typoCount: 2,
      hintsUsed: 0, challengeAttempts: 1, challengeSolves: 1, secondsActive: 900,
      streakDays: 2, lastActiveDay: new Date().toISOString().slice(0, 10),
    });
    const u = (id, un, dn, role, av) => ({
      id, username: un, password: "pass123", role, displayName: dn, avatar: av, bio: "",
      interests: [], createdAt: Date.now() - 86400000 * 5, lang: "en", accepted: true,
      progress: {}, metrics: m(), badges: [],
    });
    const db = {
      users: [
        u("edu1", "educator", "Dr. Mara Vance", "educator", "ic:owl:#a78bfa"),
        u("p1", "nova", "Nova Reyes", "player", "ic:terminal:#22d3ee"),
        u("p2", "byte", "Byte Walker", "player", "ic:ghost:#3ddc84"),
        u("p3", "cipher", "Cipher Kaur", "player", "ic:raven:#a78bfa"),
        u("me1", "tester", "Crash Tester", "player", "ic:skull:#ff6a2b"),
      ],
      sessionUserId: "me1", feed: [], tickets: [], messages: [], chats: [],
    };
    db.users[1].metrics.xp = 82; db.users[2].metrics.xp = 54; db.users[3].metrics.xp = 124;
    localStorage.setItem("hackforge.platform.v1", JSON.stringify(db));
  });
}

await page.goto("http://localhost:8000/", { waitUntil: "networkidle" });

if (!OLD_DATA) {
  // register a fresh player through the UI
  await page.getByText("Register", { exact: true }).click();
  await page.getByPlaceholder("Nova Reyes").fill("Crash Tester");
  await page.getByPlaceholder("nova", { exact: true }).fill("tester");
  await page.getByPlaceholder("••••••••").fill("pass123");
  await page.getByText("Create account →").click();
  // ethics gate
  await page.getByText(/I understand|Κατανοώ/i).click();
}

await page.waitForSelector("text=Learning Map", { timeout: 8000 });
console.log("dashboard loaded");

async function clickAndReport(desc, locator) {
  try {
    const count = await locator.count();
    if (!count) { console.log("SKIP (not found):", desc); return; }
    await locator.first().click({ timeout: 3000, force: false });
    await page.waitForTimeout(400);
    console.log("CLICKED OK:", desc);
  } catch (e) {
    console.log("CLICK FAILED:", desc, "-", String(e).split("\n")[0]);
  }
}

// 1) click on map canvas background
await clickAndReport("map background", page.locator("div.cursor-grab"));
// 2) zoom buttons
await clickAndReport("zoom + button", page.getByRole("button", { name: "Zoom in", exact: true }));
await clickAndReport("zoom out button", page.getByRole("button", { name: "Zoom out", exact: true }));
// 3) hide/expand labs
await clickAndReport("hide labs", page.locator("button", { hasText: "Hide" }).first());
await clickAndReport("expand labs", page.locator("button", { hasText: "Expand" }).first());
// 4) filter chips
await clickAndReport("online chip", page.locator("button", { hasText: "Online ·" }).first());
await clickAndReport("all chip", page.locator("button", { hasText: /^All ·/ }).first());
// 5) player marker (YOU)
await clickAndReport("player marker", page.locator("div.cursor-grab button").first());
// 6) module node (svg g with cursor-pointer inside world layer)
await clickAndReport("module node", page.locator("svg g.cursor-pointer").first());

console.log("\n--- final body still mounted?", await page.evaluate(() => !!document.querySelector("#root")?.firstChild));
console.log("--- errors captured:", errors.length);
for (const [kind, msg, stack] of errors.slice(0, 5)) {
  console.log(`\n[${kind}] ${msg}`);
  if (stack) console.log(stack.split("\n").slice(0, 14).join("\n"));
}
await browser.close();
process.exit(errors.length ? 1 : 0);
