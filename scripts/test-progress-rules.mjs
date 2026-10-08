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
  const [db, i18n, quizProgress, quizData, recoveryKeyFile, lessons, assessmentData, catalog] = await Promise.all([
    server.ssrLoadModule("/src/lib/db.ts"),
    server.ssrLoadModule("/src/i18n.ts"),
    server.ssrLoadModule("/src/lib/quizProgress.ts"),
    server.ssrLoadModule("/src/data/quizzes.ts"),
    server.ssrLoadModule("/src/lib/recoveryKeyFile.ts"),
    server.ssrLoadModule("/src/data/lessons.ts"),
    server.ssrLoadModule("/src/data/assessments.ts"),
    server.ssrLoadModule("/src/lib/linuxCommandCatalog.ts"),
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

  // Every visible lab carries a scenario assessment, and none of its text may
  // reproduce a command the lab already hands to the student.
  const commandNames = new Set(catalog.ALL_LINUX_COMMANDS.map((command) => command.name.toLowerCase()));
  for (const path of lessons.LEARNING_PATHS) {
    for (const module of path.modules) {
      const questions = assessmentData.ASSESSMENTS[module.id] || [];
      assert.equal(questions.length, 3, `${module.id} should have three assessment scenarios`);

      const labCommands = new Set();
      for (const cheat of module.cheats) labCommands.add(cheat.cmd.trim().replace(/\s+/g, " "));
      for (const task of module.tasks) {
        for (const hint of [task.hint.en, task.hint.el]) {
          for (const line of hint.split(/\r?\n/)) {
            const trimmed = line.trim().replace(/\s+/g, " ");
            if (trimmed) labCommands.add(trimmed);
          }
        }
      }
      const quizTexts = (quizData.QUIZZES[module.id] || []).map((item) => item.q.en);

      for (const question of questions) {
        assert.ok(question.scenario.en && question.scenario.el, `${module.id} scenarios must be bilingual`);
        assert.ok(question.q.en && question.q.el && question.why.en && question.why.el, `${module.id} assessment items must be bilingual`);
        assert.equal(question.choices.length, 4, `${module.id} assessment choices should be four`);
        assert.ok(Number.isInteger(question.answer) && question.answer >= 0 && question.answer < question.choices.length,
          `${module.id} has a valid assessment answer index`);
        for (const language of ["en", "el"]) {
          assert.ok(!quizTexts.includes(question.q[language]), `${module.id} assessment should not reuse a quiz question`);
        }

        const text = [
          question.scenario.en, question.scenario.el,
          question.q.en, question.q.el,
          question.why.en, question.why.el,
          ...question.choices.flatMap((choice) => [choice.en, choice.el]),
        ];
        for (const chunk of text) {
          const normalised = chunk.replace(/\s+/g, " ");
          for (const command of labCommands) {
            // Only real invocations count: a bare word such as "history" in prose
            // is not the student being handed a command.
            if (command.length >= 5 && command.includes(" ") && normalised.includes(command)) {
              assert.fail(`${module.id} assessment repeats a lab command: ${command}`);
            }
          }
        }
        for (const choice of question.choices) {
          for (const language of ["en", "el"]) {
            const words = choice[language].trim().split(/\s+/);
            const first = words[0].toLowerCase();
            assert.ok(
              !(words.length > 1 && commandNames.has(first) && /^-{1,2}\S/.test(words[1] || "")),
              `${module.id} assessment choices must not be commands: ${choice[language]}`,
            );
          }
        }
      }
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
  assert.deepEqual(greekMenu, ["Αρχική", "Μαθησιακές Διαδρομές", "Χάρτης", "Κατάταξη", "Ομάδες", "Δραστηριότητα", "Το προφίλ μου", "Ρυθμίσεις", "Βοήθεια & Υποστήριξη"]);

  assert.equal(i18n.uppercaseLabel("Συνέχεια μάθησης", "el"), "Συνεχεια μαθησης");
  assert.equal(i18n.uppercaseLabel("ΐδιο", "el"), "ϊδιο", "Greek dialytika should remain when tonos is removed");
  assert.equal(i18n.uppercaseLabel("Continue learning", "en"), "Continue learning");

  const activeBadges = Object.values(db.BADGES).filter((badge) => badge.category !== "legacy");
  assert.ok(activeBadges.some((badge) => badge.category === "certification"));
  assert.ok(activeBadges.some((badge) => badge.category === "achievement"));
  assert.equal(db.PATH_CERTIFICATION["linux-part-01"], "cert-linux-01");
  assert.equal(db.PATH_CERTIFICATION["ssh-port-22"], "cert-ssh-22");
  assert.equal(db.BADGES.shell_initiate.category, "legacy");
  assert.equal(db.BADGES["cert-linux-01"].category, "certification");
  assert.equal(db.pathCompletedSwiftly(
    [{ id: "a" }, { id: "b" }],
    {
      a: { completed: true, done: [], startedAt: 1_000, completedAt: 61_000 },
      b: { completed: true, done: [], startedAt: 61_000, completedAt: 121_000 },
    },
  ), true);
  assert.equal(db.pathCompletedSwiftly(
    [{ id: "a" }],
    { a: { completed: true, done: [], startedAt: 1_000, completedAt: 1_000 + 9 * 60 * 1000 } },
  ), false);
  assert.equal(db.pathCompletedCleanly(
    [{ id: "a" }],
    { a: { completed: true, done: [], startedAt: 1_000, hinted: true } },
  ), false);
  for (const label of ["badgeCategoryCertification", "badgeCategoryAchievement", "badgeCategoryLegacy"]) {
    const stripped = i18n.uppercaseLabel(i18n.t(label, "el"), "el");
    assert.equal(stripped, stripped.normalize("NFD").replace(/\u0301|\u0300|\u0342/g, "").normalize("NFC"));
  }

  console.log("Progression, quiz thresholds, per-lab scenario assessments, recovery-key file parsing, Greek navigation copy, and uppercase accent checks passed.");
} finally {
  await server.close();
}
