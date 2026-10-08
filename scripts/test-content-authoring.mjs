import assert from "node:assert/strict";
import { createServer } from "vite";

const values = new Map();
globalThis.localStorage = {
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, String(value)),
  removeItem: (key) => values.delete(key),
};

const server = await createServer({
  configFile: false,
  logLevel: "silent",
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true },
  appType: "custom",
});

try {
  const [lessons, authoring, terminal, playerTerminal, db, catalog, i18n] = await Promise.all([
    server.ssrLoadModule("/src/data/lessons.ts"),
    server.ssrLoadModule("/src/lib/contentAuthoring.ts"),
    server.ssrLoadModule("/src/lib/terminal.ts"),
    server.ssrLoadModule("/src/lib/playerTerminal.ts"),
    server.ssrLoadModule("/src/lib/db.ts"),
    server.ssrLoadModule("/src/lib/catalog.ts"),
    server.ssrLoadModule("/src/i18n.ts"),
  ]);

  const freshTerm = () => {
    const term = playerTerminal.createPlayerTerminal();
    playerTerminal.activateTerminalForModule(term, "sr-intro", "lab");
    return term;
  };
  const run = (term, command) => terminal.runCommand(term, command);

  // ── A shipped lab survives a snapshot → compile round trip ────────────────
  const shipped = lessons.moduleById("sr-intro");
  assert.ok(shipped, "sr-intro exists in the shipped catalog");
  const snapshot = authoring.snapshotModule(shipped);
  assert.equal(snapshot.tasks.length, shipped.tasks.length, "every objective is carried into the snapshot");
  assert.ok(
    snapshot.tasks.every((task) => task.check.kind === "builtin"),
    "a built-in objective's function cannot be serialised, so it becomes a marker",
  );

  const restored = authoring.compileModule(snapshot);
  assert.equal(restored.id, shipped.id);
  assert.deepEqual(restored.title, shipped.title, "titles survive the round trip in both languages");
  assert.equal(restored.theory.length, shipped.theory.length, "theory sections survive the round trip");
  assert.equal(restored.cheats.length, shipped.cheats.length, "the command sheet survives the round trip");
  assert.equal(restored.challenges.length, 2);
  shipped.tasks.forEach((task, index) => {
    const copy = restored.tasks[index];
    assert.deepEqual(copy.instruction, task.instruction, `objective ${index + 1} keeps its instruction`);
    assert.deepEqual(copy.hint, task.hint, `objective ${index + 1} keeps its hint`);
    assert.equal(copy.reward, task.reward ?? 5, `objective ${index + 1} keeps its XP value`);
  });

  // The borrowed checks behave exactly like the shipped ones.
  shipped.tasks.forEach((task, index) => {
    const before = freshTerm();
    run(before, task.hint.en);
    const after = freshTerm();
    run(after, task.hint.en);
    assert.equal(
      restored.tasks[index].check(after),
      task.check(before),
      `objective ${index + 1} still completes on the same evidence`,
    );
  });

  // ── An educator can rewrite an objective ──────────────────────────────────
  const edited = structuredClone(snapshot);
  edited.tasks[0].reward = 25;
  edited.tasks[0].instruction = { en: "Check the kernel banner.", el: "Έλεγξε τον kernel banner." };
  edited.tasks[0].material = { en: "Read the uname(1) manual page.", el: "Διάβασε τη σελίδα εγχειριδίου uname(1)." };
  edited.tasks.push({
    id: "task-authored-1",
    instruction: { en: "Print the full system banner.", el: "Εκτύπωσε τον πλήρη banner του συστήματος." },
    hint: { en: "uname -a", el: "uname -a" },
    explain: { en: "uname -a reports kernel and host in one line.", el: "Το uname -a δίνει kernel και host σε μία γραμμή." },
    reward: 12,
    material: { en: "", el: "" },
    check: { kind: "command", pattern: "^uname -a$" },
  });
  const editedModule = authoring.compileModule(edited);
  assert.equal(editedModule.tasks[0].reward, 25, "the educator's XP value replaces the default");
  assert.deepEqual(editedModule.tasks[0].material, edited.tasks[0].material, "additional material reaches the lab");
  assert.equal(
    editedModule.tasks[editedModule.tasks.length - 1].material,
    undefined,
    "an objective with no additional material does not gain an empty panel",
  );
  const authoredTerm = freshTerm();
  assert.equal(editedModule.tasks[4].check(authoredTerm), false, "an objective is not complete before the work is done");
  run(authoredTerm, "uname -a");
  assert.equal(editedModule.tasks[4].check(authoredTerm), true, "the authored completion test recognises the command");
  assert.equal(editedModule.tasks[4].reward, 12);
  assert.equal(editedModule.tasks.length, shipped.tasks.length + 1, "the authored objective is appended");

  // ── Every completion-test flavour resolves against a real terminal ────────
  const cmdTerm = freshTerm();
  const flagTerm = freshTerm();
  const fileTerm = freshTerm();
  const bothTerm = freshTerm();
  const commandCheck = authoring.compileCheck({ kind: "command", pattern: "^whoami$" });
  const flagCheck = authoring.compileCheck({ kind: "flag", name: "whoami" });
  const fileCheck = authoring.compileCheck({ kind: "fileRead", path: "auth.log" });
  const bothCheck = authoring.compileCheck({ kind: "commandAndFile", pattern: "^cat ", path: "auth.log" });
  const unsetCheck = authoring.compileCheck({ kind: "unset" });
  const badRegexCheck = authoring.compileCheck({ kind: "command", pattern: "(unclosed" });

  assert.equal(commandCheck(cmdTerm), false);
  assert.equal(flagCheck(flagTerm), false);
  assert.equal(fileCheck(fileTerm), false);
  assert.equal(bothCheck(bothTerm), false);
  run(cmdTerm, "whoami");
  run(flagTerm, "whoami");
  run(fileTerm, "cat /var/log/auth.log");
  run(bothTerm, "cat /var/log/auth.log");
  assert.equal(commandCheck(cmdTerm), true, "a command test matches a command that was run");
  assert.equal(flagCheck(flagTerm), true, "a flag test matches a simulator flag");
  assert.equal(fileCheck(fileTerm), true, "a file test matches a file that was read");
  assert.equal(bothCheck(bothTerm), true, "a combined test needs both halves");
  assert.equal(unsetCheck(cmdTerm), false, "an objective with no test never completes");
  assert.equal(badRegexCheck(cmdTerm), false, "a broken pattern fails closed instead of throwing");
  assert.equal(authoring.compileCheck({ kind: "builtin" })(cmdTerm), false, "a built-in marker with no original fails closed");
  assert.equal(
    authoring.compileCheck({ kind: "builtin" }, () => true)(cmdTerm),
    true,
    "a built-in marker delegates to the shipped test",
  );

  // ── Editing a shipped lab replaces it in place ────────────────────────────
  const inPlace = { modules: { "sr-intro": edited }, paths: [] };
  const inPlacePaths = authoring.effectiveLearningPaths(inPlace);
  assert.equal(inPlacePaths.length, lessons.LEARNING_PATHS.length, "editing a lab adds no path");
  const hostPath = inPlacePaths.find((path) => path.modules.some((module) => module.id === "sr-intro"));
  assert.equal(
    hostPath.modules.find((module) => module.id === "sr-intro").tasks[0].reward,
    25,
    "the edited lab replaces the shipped one wherever it is listed",
  );
  assert.equal(
    lessons.moduleById("sr-intro").tasks[0].reward,
    shipped.tasks[0].reward,
    "the shipped catalog is never mutated by an authored edit",
  );

  // ── A brand new learning path with brand new labs ─────────────────────────
  const newLabA = authoring.emptyModule(1);
  newLabA.id = "lab-authored-a";
  newLabA.title = { en: "Reading logs", el: "Διάβασμα αρχείων καταγραφής" };
  newLabA.theory = [{ id: "s1", heading: { en: "Why logs", el: "Γιατί τα αρχεία καταγραφής" }, body: { en: "Logs record what happened.", el: "Τα αρχεία καταγραφής κρατούν τι συνέβη." } }];
  newLabA.tasks = [{
    id: "task-a-1",
    instruction: { en: "Show the last log lines.", el: "Δείξε τις τελευταίες γραμμές." },
    hint: { en: "tail /var/log/auth.log", el: "tail /var/log/auth.log" },
    explain: { en: "tail prints the end of a file.", el: "Το tail τυπώνει το τέλος ενός αρχείου." },
    reward: 8,
    check: { kind: "command", pattern: "^tail " },
  }];
  const newLabB = authoring.emptyModule(2);
  newLabB.id = "lab-authored-b";
  newLabB.title = { en: "Log rotation", el: "Περιστροφή αρχείων καταγραφής" };
  newLabB.theory = [{ id: "s1", heading: { en: "Rotation", el: "Περιστροφή" }, body: { en: "Rotation keeps logs small.", el: "Η περιστροφή κρατά τα αρχεία μικρά." } }];
  newLabB.tasks = [{
    id: "task-b-1",
    instruction: { en: "List the log directory.", el: "Δείξε τον κατάλογο." },
    hint: { en: "ls -al /var/log", el: "ls -al /var/log" },
    explain: { en: "ls -al lists everything.", el: "Το ls -al δείχνει τα πάντα." },
    reward: 6,
    check: { kind: "command", pattern: "^ls -al " },
  }];
  for (const challenge of [...newLabA.challenges, ...newLabB.challenges]) {
    challenge.check = { kind: "command", pattern: "^(tail|ls) " };
  }
  const newPath = authoring.emptyPath();
  newPath.id = "path-authored-1";
  newPath.title = { en: "Log forensics", el: "Ανάλυση αρχείων καταγραφής" };
  newPath.moduleIds = [newLabA.id, newLabB.id];

  const authoredOverlay = { modules: { [newLabA.id]: newLabA, [newLabB.id]: newLabB }, paths: [newPath] };
  const authoredPaths = authoring.effectiveLearningPaths(authoredOverlay);
  assert.equal(authoredPaths.length, lessons.LEARNING_PATHS.length + 1, "an authored path is appended to the catalog");
  const compiledPath = authoredPaths[authoredPaths.length - 1];
  assert.equal(compiledPath.id, newPath.id);
  assert.equal(compiledPath.pathNumber, lessons.LEARNING_PATHS.length + 1, "the authored path is numbered after the shipped ones");
  assert.deepEqual(compiledPath.modules.map((module) => module.id), [newLabA.id, newLabB.id], "labs keep the order the educator set");
  assert.deepEqual(compiledPath.modules.map((module) => module.order), [1, 2], "labs are renumbered inside the path");
  assert.equal(compiledPath.title.el, "Ανάλυση αρχείων καταγραφής");

  const authoredLabTerm = freshTerm();
  run(authoredLabTerm, "tail /var/log/auth.log");
  assert.equal(
    authoring.effectiveModuleById(authoredOverlay, newLabA.id).tasks[0].check(authoredLabTerm),
    true,
    "an authored lab's objective can actually be completed in the simulator",
  );

  // ── The editor warns about content nobody could finish ────────────────────
  const broken = authoring.emptyModule(1);
  broken.id = "lab-broken";
  broken.tasks = [authoring.emptyTask()];
  broken.theory = [];
  broken.challenges = [authoring.emptyChallenge()];
  const issues = authoring.overlayIssues({ modules: { [broken.id]: broken }, paths: [] });
  const flagged = issues.find((entry) => entry.moduleId === broken.id);
  assert.ok(flagged, "an unfinished lab is reported");
  const codes = flagged.issues.map((issue) => issue.code);
  for (const expected of ["noTitle", "noTheory", "objectiveNoInstruction", "objectiveNoTest", "needsTwoChallenges"]) {
    assert.ok(codes.includes(expected), `an unfinished lab reports "${expected}"`);
  }
  assert.ok(
    flagged.issues.some((issue) => issue.code === "challengeNoTest" && issue.index === 0),
    "a challenge nobody can pass is reported",
  );

  // Issues are codes, so every one of them must exist in both languages.
  for (const code of new Set(codes)) {
    for (const lang of ["en", "el"]) {
      const text = i18n.t(`issue_${code}`, lang);
      assert.notEqual(text, `issue_${code}`, `issue_${code} is translated into ${lang}`);
      assert.ok(text.trim().length > 3, `issue_${code} has real ${lang} copy`);
    }
  }
  assert.notEqual(i18n.t("issue_noTitle", "en"), i18n.t("issue_noTitle", "el"), "the two languages differ");
  assert.equal(
    i18n.t("issue_objectiveNoTest", "el").includes("{n}"),
    true,
    "the Greek string keeps the position placeholder",
  );
  assert.deepEqual(
    authoring.overlayIssues({ modules: { [newLabA.id]: newLabA, [newLabB.id]: newLabB }, paths: [] }),
    [],
    "a fully written lab reports nothing",
  );

  // ── Authored content persists and survives a reload ───────────────────────
  db.resetAll();
  assert.deepEqual(db.getContentOverlay(), { modules: {}, paths: [] }, "a fresh database carries no authored content");
  db.saveContentOverlay(authoredOverlay);
  const reloaded = db.getContentOverlay();
  assert.deepEqual(reloaded, authoredOverlay, "authored content round-trips through storage unchanged");

  // Hostile or stale storage must not break the app. Rewrite what is on disk and
  // read it back through a fresh db instance, which is what a reload does.
  const stored = JSON.parse(values.get("gamehack.platform.v1"));
  stored.contentOverlay = {
    modules: { "lab-junk": { tasks: [{ id: "t", reward: "lots", check: { kind: "nonsense" } }] } },
    paths: "not-an-array",
  };
  values.set("gamehack.platform.v1", JSON.stringify(stored));
  const reloadedDb = await server.ssrLoadModule("/src/lib/db.ts?v=corrupt");
  assert.notEqual(reloadedDb, db, "a second module instance has to re-read storage");
  const sanitised = reloadedDb.getContentOverlay();
  assert.ok(Array.isArray(sanitised.paths), "a corrupt path list is replaced rather than trusted");
  assert.equal(Array.isArray(sanitised.modules["lab-junk"]?.tasks), true, "a corrupt objective list still parses");
  assert.equal(sanitised.modules["lab-junk"].tasks[0].check.kind, "unset", "an unrecognised test falls back to unset");

  // ── The catalog every screen renders from follows the overlay ─────────────
  db.saveContentOverlay(authoredOverlay);
  assert.deepEqual(db.getContentOverlay(), authoredOverlay, "the live session keeps its own authored content");
  db.saveContentOverlay({ modules: {}, paths: [] });
  catalog.invalidateCatalog();
  assert.equal(catalog.learningPaths().length, lessons.LEARNING_PATHS.length, "with no authored content the catalog is the shipped one");
  db.saveContentOverlay(authoredOverlay);
  assert.equal(
    catalog.learningPaths().length,
    lessons.LEARNING_PATHS.length,
    "the catalog is memoised until it is invalidated",
  );
  catalog.invalidateCatalog();
  assert.equal(catalog.learningPaths().length, lessons.LEARNING_PATHS.length + 1, "invalidating picks up the authored path");
  assert.ok(catalog.moduleById(newLabA.id), "an authored lab resolves by id");
  assert.ok(catalog.moduleById("sr-intro"), "a shipped lab still resolves by id");
  db.saveContentOverlay({ modules: {}, paths: [] });
  catalog.invalidateCatalog();
  assert.equal(catalog.moduleById(newLabA.id), undefined, "deleting the authored path removes its labs from the catalog");

  console.log("Content authoring checks passed: lab snapshots, authored objectives with XP, hints and extra material, every completion-test flavour, new learning paths, editor warnings, storage round-trip and catalog refresh.");
} finally {
  await server.close();
}
