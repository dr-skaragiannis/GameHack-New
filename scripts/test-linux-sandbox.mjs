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
  const [{ ALL_LINUX_COMMANDS }, terminal, playerTerminal] = await Promise.all([
    server.ssrLoadModule("/src/lib/linuxCommandCatalog.ts"),
    server.ssrLoadModule("/src/lib/terminal.ts"),
    server.ssrLoadModule("/src/lib/playerTerminal.ts"),
  ]);

  const failedCommands = [];
  for (const command of ALL_LINUX_COMMANDS) {
    const term = playerTerminal.createPlayerTerminal();
    const scenario = command.category === "Forensics labs" ? "dfir" : "lab";
    playerTerminal.activateTerminalForModule(term, `catalog-${command.name}`, scenario);
    const result = terminal.runCommand(term, command.example);
    const visibleOutput = result
      .filter((line) => line.kind !== "in" && line.text.trim())
      .map((line) => line.text)
      .join("\n");

    if (command.name === "clear") {
      assert.equal(term.lines.length, 0, "clear should clear the terminal screen");
      continue;
    }

    const commandErrors = result.filter((line) => line.kind === "err" && line.text.trim());
    if (!visibleOutput || term.lastExit === 127 || commandErrors.length) {
      failedCommands.push({
        name: command.name,
        example: command.example,
        output: visibleOutput,
        errors: commandErrors.map((line) => line.text),
        exit: term.lastExit,
      });
    }
  }
  assert.deepEqual(failedCommands, [], "every advertised Linux command should produce visible output");

  const aptTerm = playerTerminal.createPlayerTerminal();
  const aptOutput = terminal.runCommand(aptTerm, "apt install hydra").map((line) => line.text).join("\n");
  assert.match(aptOutput, /Setting up hydra/);
  assert.ok(aptTerm.packages.has("hydra"));
  const packageInfo = terminal.runCommand(aptTerm, "apt-cache show hydra").map((line) => line.text).join("\n");
  assert.match(packageInfo, /Package: hydra/);

  const forensicTerm = playerTerminal.createPlayerTerminal();
  playerTerminal.activateTerminalForModule(forensicTerm, "dfir-magic", "dfir");
  const sourcePath = terminal.resolvePath(forensicTerm, "/cases/IR-2404/evidence/01-intake/challenge-corrupt.png");
  const workingCopyPath = terminal.resolvePath(forensicTerm, "/cases/IR-2404/working-copy/challenge-corrupt.png");
  const sourceBefore = terminal.getNode(forensicTerm.fs, sourcePath)?.content;
  const hexEditOutput = terminal.runCommand(forensicTerm, "hexedit /cases/IR-2404/working-copy/challenge-corrupt.png")
    .map((line) => line.text)
    .join("\\n");
  assert.match(hexEditOutput, /Virtual working copy updated/);
  assert.ok(forensicTerm.flags.has("dfir-magic-fixed"));
  assert.equal(terminal.getNode(forensicTerm.fs, sourcePath)?.content, sourceBefore,
    "the read-only evidence original must remain unchanged");
  assert.match(terminal.getNode(forensicTerm.fs, workingCopyPath)?.content || "", /89 50 4e 47/);

  const term = playerTerminal.createPlayerTerminal();
  const fileSystem = term.fs;
  playerTerminal.activateTerminalForModule(term, "sr-files", "sudorun");
  const createOutput = terminal.runCommand(term, "touch /root/persistent-note.txt").map((line) => line.text).join("\n");
  assert.match(createOutput, /Created virtual file/);
  assert.ok(terminal.getNode(term.fs, terminal.resolvePath(term, "/root/persistent-note.txt")));

  playerTerminal.activateTerminalForModule(term, "raven-web", "raven");
  assert.equal(term.fs, fileSystem, "switching challenges must not replace a player's VFS");
  assert.ok(terminal.getNode(term.fs, "/root/persistent-note.txt"));
  assert.ok(terminal.getNode(term.fs, terminal.resolvePath(term, "/home/raven/user.txt")));
  const sharedRoot = terminal.runCommand(term, "ls /").map((line) => line.text).join("\n");
  for (const directory of ["cases", "home", "labs", "opt", "root", "var"]) assert.match(sharedRoot, new RegExp(`\\b${directory}\\b`));
  const fixtureAlternates = terminal.runCommand(term, "find /labs/fixtures -name '*.txt'").map((line) => line.text).join("\n");
  assert.match(fixtureAlternates, /raven/);
  assert.match(fixtureAlternates, /sudorun/);

  const requiredFixtures = [
    ["ssh", "/home/operator/.ssh/config"],
    ["sudorun", "/root/hackforge.txt"],
    ["dfir", "/cases/IR-2404/evidence/01-intake/manifest.csv"],
  ];
  for (const [scenario, path] of requiredFixtures) {
    playerTerminal.activateTerminalForModule(term, `fixture-${scenario}`, scenario);
    assert.ok(terminal.getNode(term.fs, terminal.resolvePath(term, path)), `${scenario} fixture ${path} should be mounted`);
    assert.equal(term.fs, fileSystem);
  }

  const otherPlayer = playerTerminal.createPlayerTerminal();
  playerTerminal.activateTerminalForModule(otherPlayer, "sr-files", "sudorun");
  assert.equal(terminal.getNode(otherPlayer.fs, terminal.resolvePath(otherPlayer, "/root/persistent-note.txt")), null,
    "each player should receive an isolated filesystem");

  const storageValues = new Map();
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (key) => storageValues.get(key) ?? null,
      setItem: (key, value) => storageValues.set(key, String(value)),
      removeItem: (key) => storageValues.delete(key),
    },
  });
  playerTerminal.savePlayerTerminal("student@example.ionio.gr", term);
  const restored = playerTerminal.loadPlayerTerminal("student@example.ionio.gr");
  assert.ok(terminal.getNode(restored.fs, "/root/persistent-note.txt"));
  assert.equal(restored.activeModuleId, term.activeModuleId);
  assert.deepEqual(restored.history, term.history);

  const legacyFs = terminal.defaultFS();
  const mounted = (name, source) => terminal.dir(name, Object.values(source.children || {}), source.mode, source.owner, source.group);
  const sudoMount = mounted("sudorun", (await server.ssrLoadModule("/src/lib/sudorun.ts")).sudoRunFS());
  sudoMount.children.root.children["persistent-note.txt"] = terminal.file("persistent-note.txt", "saved from the old module root\n");
  sudoMount.children.root.children["hackforge.txt"].content += "player edit from the legacy workspace\n";
  const ravenMount = mounted("raven", terminal.ravenFS());
  legacyFs.children.labs = terminal.dir("labs", [terminal.dir("scenarios", [ravenMount, sudoMount])]);
  legacyFs.children.home.children.operator.children["legacy-root-note.txt"] = terminal.file("legacy-root-note.txt", "saved from the shared root\n");
  const legacyTerm = terminal.createTerminal({ fs: legacyFs, scenario: "sudorun" });
  legacyTerm.activeModuleId = "sr-files";
  const legacyKey = `hackforge.player-terminal.v1:${encodeURIComponent("legacy@example.ionio.gr")}`;
  storageValues.set(legacyKey, JSON.stringify({
    version: 1,
    ...legacyTerm,
    flags: [...legacyTerm.flags],
    packages: [...legacyTerm.packages],
  }));
  const migrated = playerTerminal.loadPlayerTerminal("legacy@example.ionio.gr");
  assert.ok(terminal.getNode(migrated.fs, "/root/persistent-note.txt"), "legacy challenge files should migrate into the unified root");
  assert.match(terminal.getNode(migrated.fs, "/root/hackforge.txt")?.content || "", /player edit from the legacy workspace/);
  assert.ok(terminal.getNode(migrated.fs, "/home/operator/legacy-root-note.txt"));
  assert.equal(terminal.getNode(migrated.fs, "/labs/scenarios"), null, "module-specific root mounts should be removed after migration");
  playerTerminal.savePlayerTerminal("legacy@example.ionio.gr", migrated);
  assert.ok(storageValues.has(`hackforge.player-terminal.v2:${encodeURIComponent("legacy@example.ionio.gr")}`));
  assert.ok(!storageValues.has(legacyKey), "saving the migrated terminal should retire the legacy snapshot");

  console.log(`Linux sandbox checks passed: ${ALL_LINUX_COMMANDS.length} advertised command examples, one unified VFS, per-player isolation, persistence, and legacy migration.`);
} finally {
  await server.close();
}
