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
  const [db, i18n, quizProgress, quizData, recoveryKeyFile] = await Promise.all([
    server.ssrLoadModule("/src/lib/db.ts"),
    server.ssrLoadModule("/src/i18n.ts"),
    server.ssrLoadModule("/src/lib/quizProgress.ts"),
    server.ssrLoadModule("/src/data/quizzes.ts"),
    server.ssrLoadModule("/src/lib/recoveryKeyFile.ts"),
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

  for (const [score, total, expected] of [
    [0, 3, false],
    [1, 3, false],
    [2, 3, true],
    [3, 3, true],
    [-1, 3, false],
    [4, 3, false],
    [2, 4, false],
    [3, 4, true],
    [1, 0, false],
  ]) {
    assert.equal(quizProgress.passesQuickQuiz(score, total), expected, `quiz pass at ${score}/${total}`);
  }
  for (const [moduleId, questions] of Object.entries(quizData.QUIZZES)) {
    assert.equal(questions.length, 3, `${moduleId} should have three quiz questions`);
    for (const question of questions) {
      assert.ok(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < question.choices.length,
        `${moduleId} has a valid correct-answer index`);
    }
  }

  const recoveryKey = "A".repeat(43);
  const validRecoveryFile = JSON.stringify({
    format: "gamehack-recovery-key",
    version: 1,
    email: "player@ionio.gr",
    recoveryKey,
  });
  assert.deepEqual(recoveryKeyFile.parseRecoveryKeyFile(validRecoveryFile), { email: "player@ionio.gr", recoveryKey });
  assert.equal(recoveryKeyFile.parseRecoveryKeyFile(validRecoveryFile.replace("player@ionio.gr", "other@example.com")), null);
  assert.equal(recoveryKeyFile.parseRecoveryKeyFile("not a key file"), null);

  const greekMenu = ["homeNav", "challengesNav", "learningMapNav", "leaderboard", "teamsNav", "activityNav", "profileNav", "settingsNav", "ticketsNav"]
    .map((key) => i18n.t(key, "el"));
  assert.deepEqual(greekMenu, ["Αρχική", "Προκλήσεις", "Μαθησιακές Διαδρομές", "Κατάταξη", "Ομάδες", "Δραστηριότητα", "Το προφίλ μου", "Ρυθμίσεις", "Βοήθεια & Υποστήριξη"]);

  assert.equal(i18n.uppercaseLabel("Συνέχεια μάθησης", "el"), "Συνεχεια μαθησης");
  assert.equal(i18n.uppercaseLabel("ΐδιο", "el"), "ϊδιο", "Greek dialytika should remain when tonos is removed");
  assert.equal(i18n.uppercaseLabel("Continue learning", "en"), "Continue learning");

  console.log("Progression, quiz thresholds, recovery-key file parsing, Greek navigation copy, and uppercase accent checks passed.");
} finally {
  await server.close();
}
