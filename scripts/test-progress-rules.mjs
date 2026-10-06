import assert from "node:assert/strict";
import { createServer } from "vite";

const server = await createServer({
  configFile: false,
  logLevel: "silent",
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true },
  appType: "custom",
});

try {
  const [db, i18n] = await Promise.all([
    server.ssrLoadModule("/src/lib/db.ts"),
    server.ssrLoadModule("/src/i18n.ts"),
  ]);

  const levelBoundaries = [
    [0, 1],
    [499, 1],
    [500, 2],
    [999, 2],
    [1000, 3],
    [1999, 3],
    [2000, 4],
    [3999, 4],
    [4000, 5],
    [7999, 5],
    [8000, 6],
  ];
  for (const [xp, expectedLevel] of levelBoundaries) {
    assert.equal(db.levelFromXp(xp).level, expectedLevel, `expected level ${expectedLevel} at ${xp} XP`);
  }

  assert.equal(i18n.uppercaseLabel("Συνέχεια μάθησης", "el"), "Συνεχεια μαθησης");
  assert.equal(i18n.uppercaseLabel("ΐδιο", "el"), "ϊδιο", "Greek dialytika should remain when tonos is removed");
  assert.equal(i18n.uppercaseLabel("Continue learning", "en"), "Continue learning");

  console.log("Progression thresholds and Greek uppercase accent rules passed.");
} finally {
  await server.close();
}
