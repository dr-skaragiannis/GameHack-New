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
  const [{ ALL_LINUX_COMMANDS }, terminal, playerTerminal, lessons, commandGuide] = await Promise.all([
    server.ssrLoadModule("/src/lib/linuxCommandCatalog.ts"),
    server.ssrLoadModule("/src/lib/terminal.ts"),
    server.ssrLoadModule("/src/lib/playerTerminal.ts"),
    server.ssrLoadModule("/src/data/lessons.ts"),
    server.ssrLoadModule("/src/data/commandGuide.ts"),
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
  const catalogNames = new Set(ALL_LINUX_COMMANDS.map((command) => command.name));
  for (const name of [
    "ifconfig", "ip", "iwconfig", "dhclient", "dig", "echo", "nano", "cat", "grep",
    "ps", "top", "nice", "renice", "kill", "jobs", "fg", "at", "crontab",
    "set", "more", "env", "export", "unset", "read", "reboot", "exit", "telnet", "ftp", "update-rc.d",
  ]) {
    assert.ok(catalogNames.has(name), `source command ${name} should be in the shared command catalog`);
  }

  // Every row of every lab's command sheet must resolve to a real entry in the
  // in-app command library, or the player gets the "no entry yet" fallback
  // for a command the course just taught them.
  const unexplained = [];
  let cheatRows = 0;
  for (const path of lessons.LEARNING_PATHS) {
    for (const module of path.modules) {
      for (const cheat of module.cheats) {
        cheatRows += 1;
        if (!commandGuide.commandLessonForLabel(cheat.cmd)) {
          unexplained.push(`${module.id}: ${cheat.cmd}`);
        }
      }
    }
  }
  assert.deepEqual(unexplained, [], "every command-sheet row should have a command library entry");
  assert.ok(cheatRows > 200, `the command sheets should still be substantial (saw ${cheatRows})`);
  // The share-enumeration tools the fifth path teaches must be explained too.
  for (const name of ["testparm", "smbclient", "nxc", "exportfs", "showmount", "rpcinfo", "mount", "umount"]) {
    assert.ok(commandGuide.commandLessonForName(name), `the command library should explain ${name}`);
  }

  const topTerm = playerTerminal.createPlayerTerminal();
  playerTerminal.activateTerminalForModule(topTerm, "sr-proc", "sudorun");
  const topOutput = terminal.runCommand(topTerm, "top").map((line) => line.text).join("\n");
  assert.match(topOutput, /Tasks: .*running.*sleeping/);
  assert.match(topOutput, /%CPU.*%MEM.*COMMAND/);
  assert.match(topOutput, /up .*load average/);
  assert.match(topOutput, /training-worker/);
  assert.ok(topTerm.flags.has("top"), "top should be an executable simulated command in Path 03");

  const interactiveAtTerm = playerTerminal.createPlayerTerminal();
  playerTerminal.activateTerminalForModule(interactiveAtTerm, "sr-proc", "sudorun");
  terminal.runCommand(interactiveAtTerm, "at 21:30");
  assert.equal(interactiveAtTerm.atPendingTime, "21:30");
  const atQueueOutput = terminal.runCommand(interactiveAtTerm, "/root/scanning_script.sh").map((line) => line.text).join("\n");
  assert.match(atQueueOutput, /queued for 21:30/);
  assert.equal(interactiveAtTerm.atQueue[0]?.command, "/root/scanning_script.sh");
  assert.ok(!interactiveAtTerm.flags.has("run-script"), "at must queue its input without executing the script");

  const backgroundTerm = playerTerminal.createPlayerTerminal();
  playerTerminal.activateTerminalForModule(backgroundTerm, "sr-proc", "sudorun");
  terminal.runCommand(backgroundTerm, "sleep 10 &");
  const backgroundList = terminal.runCommand(backgroundTerm, "jobs").map((line) => line.text).join("\n");
  assert.match(backgroundList, /sleep 10/);
  assert.ok(backgroundTerm.flags.has("bg"));
  const foregroundOutput = terminal.runCommand(backgroundTerm, "fg %1").map((line) => line.text).join("\n");
  assert.match(foregroundOutput, /foreground job resumed/);
  assert.equal(backgroundTerm.jobs.length, 0, "fg should remove the selected job from the background list");

  const learningPath = lessons.campaignById("linux-beginners-2");
  const linuxPart3 = lessons.campaignById("linux-beginners-3");
  assert.ok(learningPath, "Linux for Beginners #2 should be registered as a learning path");
  assert.ok(linuxPart3, "Linux for Beginners #3 should be registered as a learning path");
  assert.equal(learningPath.pathNumber, 3);
  assert.equal(linuxPart3.pathNumber, 4);
  assert.deepEqual(lessons.LEARNING_PATHS.map((path) => path.id), ["linux-part-01", "linux-part-02", "linux-part-03", "ssh-port-22", "file-shares"]);
  assert.deepEqual(lessons.LEARNING_PATHS.map((path) => path.pathNumber), [1, 2, 3, 4, 5]);
  assert.deepEqual(lessons.LEARNING_PATHS[0].modules.map((module) => module.id), ["sr-intro", "sr-help", "sr-search", "sr-files", "sr-text", "sr-apt", "sr-perms"]);
  assert.deepEqual(lessons.LEARNING_PATHS[1].modules.map((module) => module.id), ["sr-net", "sr-proc", "sr-env"]);
  assert.deepEqual(lessons.LEARNING_PATHS[2].modules.map((module) => module.id), ["sr-bash", "sr-cron", "sr-svc"]);
  assert.deepEqual(lessons.LEARNING_PATHS[3].modules.map((module) => module.id), ["ssh-doc-setup", "ssh-svc-recon", "ssh-svc-auth", "ssh-doc-boundary", "ssh-svc-harden", "ssh-doc-audit"]);
  assert.deepEqual(lessons.LEARNING_PATHS[4].modules.map((module) => module.id), ["share-doc-intro", "share-ftp", "share-smb", "share-nfs", "share-harden"]);
  assert.doesNotMatch(JSON.stringify(lessons.LEARNING_PATHS[3]), /hydra -l|netexec|meterpreter|ssh2john/i);
  for (const hiddenId of ["gamehack", "raven", "wirewalk", "sudorun", "linux-beginners-2", "linux-beginners-3", "dfir-fieldwork", "ssh-service"]) {
    assert.equal(lessons.LEARNING_PATHS.some((path) => path.id === hiddenId), false, `${hiddenId} should stay off the visible map`);
  }
  assert.deepEqual(learningPath.modules.map((module) => module.id), ["sr-net", "sr-proc", "sr-env"]);
  assert.deepEqual(linuxPart3.modules.map((module) => module.id), ["sr-bash", "sr-cron", "sr-svc"]);
  assert.equal(lessons.campaignById("wirewalk")?.pathNumber, 5);
  assert.equal(lessons.campaignById("raven")?.pathNumber, 6);
  assert.equal(lessons.campaignById("dfir-fieldwork")?.pathNumber, 7);
  const sshService = lessons.campaignById("ssh-service");
  assert.ok(sshService, "SSH service testing should be registered as a learning path");
  assert.equal(sshService.pathNumber, 8);
  assert.deepEqual(sshService.modules.map((module) => module.id), ["ssh-svc-recon", "ssh-svc-auth", "ssh-svc-creds", "ssh-svc-harden", "ssh-svc-lab"]);
  assert.equal(sshService.title.el, "Ελεγχος ασφάλειας υπηρεσίας SSH");
  const sshLabels = [
    sshService.title.el,
    sshService.subtitle.el,
    ...sshService.modules.flatMap((module) => [
      module.title.el,
      module.subtitle.el,
      module.badge.el,
      ...module.theory.map((section) => section.heading.el),
    ]),
  ];
  for (const label of sshLabels) {
    assert.doesNotMatch(label, /[ΆΈΉΊΌΎΏΪΫ]/, `Greek label should not put a tonos on a capital: ${label}`);
  }
  const fileShares = lessons.campaignById("file-shares");
  assert.ok(fileShares, "the anonymous-login file-share path should be registered");
  assert.equal(fileShares.pathNumber, 5);
  assert.deepEqual(fileShares.modules.map((module) => module.id), ["share-doc-intro", "share-ftp", "share-smb", "share-nfs", "share-harden"]);
  const shareLabels = [
    fileShares.title.el,
    fileShares.subtitle.el,
    ...fileShares.modules.flatMap((module) => [
      module.title.el,
      module.subtitle.el,
      module.badge.el,
      ...module.theory.map((section) => section.heading.el),
    ]),
  ];
  for (const label of shareLabels) {
    assert.doesNotMatch(label, /[ΆΈΉΊΌΎΏΪΫ]/, `Greek label should not put a tonos on a capital: ${label}`);
  }
  for (const section of fileShares.modules.flatMap((module) => module.theory)) {
    for (const language of ["en", "el"]) {
      const paragraphs = section.body[language].split(/\n\s*\n/).filter((paragraph) => paragraph.trim());
      assert.ok(paragraphs.length >= 2, `${section.heading.en} should have two ${language} paragraphs`);
    }
  }
  for (const section of sshService.modules.flatMap((module) => module.theory)) {
    for (const language of ["en", "el"]) {
      const paragraphs = section.body[language].split(/\n\s*\n/).filter((paragraph) => paragraph.trim());
      assert.ok(paragraphs.length >= 2, `${section.heading.en} should have two ${language} paragraphs`);
    }
  }
  const sshLab = playerTerminal.createPlayerTerminal();
  playerTerminal.activateTerminalForModule(sshLab, "ssh-svc-auth", "lab");
  const authScan = terminal.runCommand(sshLab, "nmap --script ssh-auth-methods -p 22 10.10.10.12").map((line) => line.text).join("\n");
  assert.match(authScan, /publickey/);
  assert.match(authScan, /password/);
  assert.ok(sshLab.flags.has("ssh-auth-methods"));
  terminal.runCommand(sshLab, "ssh-keygen -t ed25519");
  assert.ok(sshLab.flags.has("ssh-keygen-ed25519"));
  const forward = terminal.runCommand(sshLab, "ssh -L 8080:127.0.0.1:8080 labuser@10.10.10.12").map((line) => line.text).join("\n");
  assert.match(forward, /No socket was opened/);
  assert.ok(sshLab.flags.has("ssh-forward"));
  assert.equal(sshLab.sshReturn, null, "a recorded forward must not open a remote session");
  const allPathModuleIds = lessons.LEARNING_PATHS.flatMap((path) => path.modules.map((module) => module.id));
  assert.equal(new Set(allPathModuleIds).size, allPathModuleIds.length, "reused modules should appear in exactly one learning path");
  assert.equal(lessons.campaignById("sudorun")?.modules.length, 7, "the existing path should retain its other modules without duplicates");
  assert.equal(lessons.moduleById("sr-net")?.title.en, learningPath.modules[0].title.en, "existing network module progress should route to the updated lesson");
  assert.equal(lessons.moduleById("sr-bash")?.title.en, linuxPart3.modules[0].title.en, "existing Bash module progress should route to the updated lesson");
  for (const path of [learningPath, linuxPart3]) {
    const courseText = JSON.stringify(path);
    assert.doesNotMatch(courseText, /hackingarticles|hacking articles|publisher/i, "the course must not retain source branding");
    for (const module of path.modules) {
      for (const section of module.theory) {
        for (const language of ["en", "el"]) {
          const paragraphs = section.body[language].split(/\n\s*\n/).filter((paragraph) => paragraph.trim());
          assert.ok(paragraphs.length >= 2, `${module.id}/${section.heading[language]} should have two readable ${language} paragraphs`);
        }
      }
    }
  }

  const courseTerm = playerTerminal.createPlayerTerminal();
  const courseFixtures = [
    "/root/linux-beginners-2/README.txt",
    "/root/linux-beginners-2/network/interfaces.txt",
    "/root/linux-beginners-2/network/dns-records.txt",
    "/root/linux-beginners-2/network/hosts-plan.txt",
    "/root/linux-beginners-2/processes/roster.txt",
    "/root/linux-beginners-2/processes/schedule-notes.txt",
    "/root/linux-beginners-2/processes/notes.txt",
    "/root/linux-beginners-2/environment/variable-notes.txt",
    "/root/linux-beginners-2/environment/defaults.txt",
    "/root/linux-beginners-3/README.txt",
    "/root/linux-beginners-3/first_script",
    "/root/linux-beginners-3/welcome.sh",
    "/root/linux-beginners-3/scanner",
    "/root/linux-beginners-3/runlevels.txt",
    "/root/linux-beginners-3/cron-reference.txt",
    "/root/linux-beginners-3/service-reference.txt",
    "/root/linux-beginners-3/head-fixture.txt",
    "/root/scanner",
    "/root/.bashrc",
    "/etc/crontab",
    "/etc/init.d/mysql",
    "/etc/rc0.d",
    "/etc/rc6.d",
    "/var/www/html/index.html",
    "/srv/ftp/ubuntu/release/favicon.ico",
    "/etc/vsftpd.conf",
    "/etc/samba/smb.conf",
    "/etc/samba/gdbcommands",
    "/etc/exports",
    "/var/ftp",
    "/srv/nfs",
  ];
  for (const path of courseFixtures) {
    assert.ok(terminal.getNode(courseTerm.fs, path), `missing virtual course fixture: ${path}`);
  }
  for (const module of learningPath.modules) {
    playerTerminal.activateTerminalForModule(courseTerm, module.id, "sudorun");
    for (const objective of module.tasks) {
      for (const command of objective.hint.en.split(/\r?\n/).filter(Boolean)) terminal.runCommand(courseTerm, command);
      assert.ok(objective.check(courseTerm), `${module.id}/${objective.id} should complete from its exact hint`);
    }
  }
  assert.equal(courseTerm.net.ip, "10.10.10.42", "the simulated DHCP lease should replace the temporary interface address");
  assert.equal(courseTerm.atQueue.length, 1, "the queue should hold the scheduled job that was not cancelled");
  assert.deepEqual(courseTerm.atQueue[0], { id: 2, time: "21:30", command: "/root/scanning_script.sh" },
    "at should record a one-time job, and the queue exercise cancels only the entry it created");
  assert.ok(courseTerm.flags.has("atrm"), "atrm should remove a queued job without executing it");
  assert.equal(courseTerm.jobs.length, 1, "only the nohup job should remain in the background table");
  assert.match(courseTerm.jobs[0].cmd, /^nohup \//, "fg should return the background editor to the foreground");
  assert.ok(courseTerm.flags.has("crontab-install"), "crontab - should accept a recurring entry from the virtual pipe");
  assert.match(courseTerm.crontab.join("\n"), /30 21 \* \* \* \/root\/scanning_script\.sh/);
  assert.equal(courseTerm.procs.find((process) => process.pid === 7440)?.nice, 10, "renice should update the simulated process");
  assert.equal(courseTerm.procs.find((process) => process.pid === 7440)?.alive, false, "SIGTERM should stop only the selected virtual process");
  assert.equal(courseTerm.procs.find((process) => process.pid === 7441)?.alive, true, "SIGHUP should be recorded without assuming every program exits");
  assert.equal(courseTerm.shellVars.HISTSIZE, "0");
  assert.equal(courseTerm.env.HISTSIZE, "0", "export should pass HISTSIZE into the simulated environment");
  assert.equal(terminal.getNode(courseTerm.fs, "/root/linux-beginners-2/environment/histsize-before-change.txt")?.content?.trim(), "1000");
  assert.match(terminal.getNode(courseTerm.fs, "/etc/hosts")?.content || "", /docs\.gamehack\.lab/);
  assert.match(terminal.getNode(courseTerm.fs, "/etc/resolv.conf")?.content || "", /10\.10\.10\.53/);

  for (const module of linuxPart3.modules) {
    playerTerminal.activateTerminalForModule(courseTerm, module.id, "sudorun");
    for (const objective of module.tasks) {
      for (const command of objective.hint.en.split(/\r?\n/).filter(Boolean)) terminal.runCommand(courseTerm, command);
      assert.ok(objective.check(courseTerm), `${module.id}/${objective.id} should complete from its exact hint`);
    }
  }
  // every visible learning path: each task must complete when the player types its own hint
  for (const visiblePath of lessons.LEARNING_PATHS) {
    for (const module of visiblePath.modules) {
      const moduleTerm = playerTerminal.createPlayerTerminal();
      playerTerminal.activateTerminalForModule(moduleTerm, module.id, module.scenario);
      for (const objective of module.tasks) {
        for (const command of objective.hint.en.split(/\r?\n/).filter(Boolean)) terminal.runCommand(moduleTerm, command);
        assert.ok(objective.check(moduleTerm), `${module.id}/${objective.id} should complete from its exact hint`);
      }
    }
  }
  assert.ok(courseTerm.flags.has("hello-script"));
  assert.ok(courseTerm.flags.has("read-script"));
  assert.ok(courseTerm.flags.has("run-scanner"));
  assert.ok(courseTerm.flags.has("nmap-sn"));
  const pipelineTerm = playerTerminal.createPlayerTerminal();
  playerTerminal.activateTerminalForModule(pipelineTerm, "sr-bash", "sudorun");
  const pipelineOutput = terminal.runCommand(
    pipelineTerm,
    'nmap -sn 10.10.10.0/24 | grep scan | cut -d " " -f 5 | head -n -1',
  ).filter((line) => line.kind === "out").map((line) => line.text);
  assert.deepEqual(pipelineOutput, ["10.10.10.5", "10.10.10.8", "10.10.10.12", "10.10.10.21"],
    "the negative head count should remove the Nmap summary row, not a discovered host");
  const scriptTerm = playerTerminal.createPlayerTerminal();
  playerTerminal.activateTerminalForModule(scriptTerm, "sr-bash", "sudorun");
  terminal.runCommand(scriptTerm, "cd /root/linux-beginners-3");
  terminal.runCommand(scriptTerm, "chmod +x scanner");
  const scannerOutput = terminal.runCommand(scriptTerm, "./scanner").filter((line) => line.kind === "out").map((line) => line.text);
  assert.ok(scannerOutput.includes("10.10.10.21"), "the scripted scanner should show the same four fixture hosts");
  assert.ok(courseTerm.flags.has("crontab-editor-nano"));
  assert.match(courseTerm.crontab.join("\n"), /55 23 \* \* \* \/root\/scanner/);
  assert.equal(courseTerm.services.cron, "running");
  assert.equal(courseTerm.services.apache2, "running", "the final Apache restart should restore its virtual running state");
  assert.equal(courseTerm.services.ssh, "running");
  assert.equal(courseTerm.bootServices.mysql, "enabled");
  assert.ok(terminal.getNode(courseTerm.fs, "/etc/rc2.d/S01mysql"), "update-rc.d defaults should create virtual runlevel links");
  assert.ok(courseTerm.procs.some((process) => process.alive && /mysqld/.test(process.cmd)), "the simulated boot should start the virtual MySQL process");
  assert.ok(courseTerm.flags.has("ssh-return") && courseTerm.flags.has("telnet-blocked"));
  assert.ok(courseTerm.flags.has("ftp-login") && courseTerm.flags.has("ftp-get") && courseTerm.flags.has("ftp-bye"));
  assert.equal(courseTerm.ftp, null, "bye should close the fictional FTP session");
  const downloadedFavicon = terminal.getNode(courseTerm.fs, "/root/linux-beginners-3/favicon.ico");
  assert.match(downloadedFavicon?.content || "", /GameHack-FAKE-FAVICON/);
  assert.match(terminal.getNode(courseTerm.fs, "/var/www/html/index.html")?.content || "", /GameHack/);
  const stoppedApacheTerm = playerTerminal.createPlayerTerminal();
  playerTerminal.activateTerminalForModule(stoppedApacheTerm, "sr-svc", "sudorun");
  const refusedLocalCurl = terminal.runCommand(stoppedApacheTerm, "curl http://localhost").map((line) => line.text).join("\n");
  assert.match(refusedLocalCurl, /Connection refused/);
  const blockedFtpTerm = playerTerminal.createPlayerTerminal();
  playerTerminal.activateTerminalForModule(blockedFtpTerm, "sr-svc", "sudorun");
  const blockedFtpOutput = terminal.runCommand(blockedFtpTerm, "ftp ftp.cesca.es").map((line) => line.text).join("\n");
  assert.match(blockedFtpOutput, /external host .* is blocked/);
  assert.ok(blockedFtpTerm.flags.has("ftp-external-blocked"));
  const unstartedSshTerm = playerTerminal.createPlayerTerminal();
  playerTerminal.activateTerminalForModule(unstartedSshTerm, "sr-svc", "sudorun");
  const unstartedSshOutput = terminal.runCommand(unstartedSshTerm, "ssh ignite@192.168.0.11").map((line) => line.text).join("\n");
  assert.match(unstartedSshOutput, /Connection refused/);
  assert.equal(unstartedSshTerm.sshReturn, null, "a refused connection must not create a remote-session context");
  const traversalFtpTerm = playerTerminal.createPlayerTerminal();
  playerTerminal.activateTerminalForModule(traversalFtpTerm, "sr-svc", "sudorun");
  terminal.runCommand(traversalFtpTerm, "ftp ftp.gamehack.lab");
  terminal.runCommand(traversalFtpTerm, "anonymous");
  terminal.runCommand(traversalFtpTerm, "anonymous");
  const traversalOutput = terminal.runCommand(traversalFtpTerm, "get ../../../../etc/passwd").map((line) => line.text).join("\n");
  assert.match(traversalOutput, /outside the FTP fixture root/);
  assert.ok(!traversalFtpTerm.flags.has("ftp-get"), "FTP paths must not escape the fixture tree");

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
    ["sudorun", "/root/gamehack.txt"],
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
  term.atQueue = [{ id: 1, time: "21:30", command: "/root/scanning_script.sh" }];
  term.services.apache2 = "running";
  term.bootServices.mysql = "enabled";
  term.crontab = ["# m h dom mon dow command", "55 23 * * * /root/scanner"];
  term.sshReturn = { user: "analyst", host: "forensics-workstation", cwd: "/cases/IR-2404/evidence", home: "/cases/IR-2404", isRoot: false, scenario: "dfir" };
  playerTerminal.savePlayerTerminal("student@example.ionio.gr", term);
  const restored = playerTerminal.loadPlayerTerminal("student@example.ionio.gr");
  assert.deepEqual(restored.atQueue, term.atQueue, "simulated one-time schedule records should persist per player");
  assert.deepEqual(restored.crontab, term.crontab);
  assert.equal(restored.services.apache2, "running");
  assert.equal(restored.bootServices.mysql, "enabled");
  assert.deepEqual(restored.sshReturn, term.sshReturn);
  assert.ok(terminal.getNode(restored.fs, "/root/persistent-note.txt"));
  assert.equal(restored.activeModuleId, term.activeModuleId);
  assert.deepEqual(restored.history, term.history);

  const preCourseTerm = playerTerminal.createPlayerTerminal();
  const preCourseRoot = terminal.getNode(preCourseTerm.fs, "/root");
  assert.ok(preCourseRoot?.children);
  delete preCourseRoot.children["linux-beginners-3"];
  preCourseRoot.children["learner-note.txt"] = terminal.file("learner-note.txt", "keep this saved player file\n");
  preCourseTerm.activeModuleId = "sr-bash";
  preCourseTerm.flags.add("saved-progress-marker");
  const legacyCaseNotes = terminal.getNode(preCourseTerm.fs, "/cases/IR-2404/case_notes.md");
  assert.ok(legacyCaseNotes?.type === "file");
  legacyCaseNotes.content = legacyCaseNotes.content.replace(/GH-2404/g, "HF-2404");
  preCourseTerm.flags.add("cat-hf");
  preCourseTerm.flags.add("find-hf");
  preCourseTerm.flags.add("touch-hf2");
  const preCourseKey = `hackforge.player-terminal.v2:${encodeURIComponent("upgrade@example.ionio.gr")}`;
  storageValues.set(preCourseKey, JSON.stringify({
    version: 2,
    ...preCourseTerm,
    flags: [...preCourseTerm.flags],
    packages: [...preCourseTerm.packages],
  }));
  const upgradedPlayer = playerTerminal.loadPlayerTerminal("upgrade@example.ionio.gr");
  assert.ok(terminal.getNode(upgradedPlayer.fs, "/root/linux-beginners-3/scanner"),
    "an existing VFS should receive new missing course fixtures after load");
  assert.equal(terminal.getNode(upgradedPlayer.fs, "/root/learner-note.txt")?.content, "keep this saved player file\n");
  assert.match(terminal.getNode(upgradedPlayer.fs, "/cases/IR-2404/case_notes.md")?.content || "", /CASE GH-2404/,
    "legacy fictional case identifiers should migrate in saved player evidence");
  assert.ok(upgradedPlayer.flags.has("saved-progress-marker"));
  assert.ok(upgradedPlayer.flags.has("cat-gamehack") && upgradedPlayer.flags.has("find-gamehack") && upgradedPlayer.flags.has("touch-gamehack2"),
    "legacy lesson completion markers should migrate to their current identifiers");
  assert.equal(upgradedPlayer.activeModuleId, "sr-bash");
  assert.ok(storageValues.has(`gamehack.player-terminal.v2:${encodeURIComponent("upgrade@example.ionio.gr")}`),
    "legacy-branded snapshots should migrate to the GameHack storage key");
  assert.ok(!storageValues.has(preCourseKey), "the old storage key is retired after migration");

  const legacyFs = terminal.defaultFS();
  const mounted = (name, source) => terminal.dir(name, Object.values(source.children || {}), source.mode, source.owner, source.group);
  const sudoMount = mounted("sudorun", (await server.ssrLoadModule("/src/lib/sudorun.ts")).sudoRunFS());
  sudoMount.children.root.children["persistent-note.txt"] = terminal.file("persistent-note.txt", "saved from the old module root\n");
  const oldNotes = sudoMount.children.root.children["gamehack.txt"];
  assert.ok(oldNotes);
  sudoMount.children.root.children["hackforge.txt"] = terminal.file(
    "hackforge.txt",
    oldNotes.content.replace(/gamehack/gi, "hackforge") + "player edit from the legacy workspace\n",
  );
  const ravenMount = mounted("raven", terminal.ravenFS());
  legacyFs.children.labs = terminal.dir("labs", [terminal.dir("scenarios", [ravenMount, sudoMount])]);
  legacyFs.children.home.children.operator.children["legacy-root-note.txt"] = terminal.file("legacy-root-note.txt", "saved from the shared root\n");
  const legacyTerm = terminal.createTerminal({ fs: legacyFs, scenario: "sudorun" });
  legacyTerm.activeModuleId = "sr-files";
  legacyTerm.crontab = [
    "# m h  dom mon dow   command",
    "17 * * * * root    cd / && run-parts --report /etc/cron.hourly",
  ];
  const legacyKey = `hackforge.player-terminal.v1:${encodeURIComponent("legacy@example.ionio.gr")}`;
  storageValues.set(legacyKey, JSON.stringify({
    version: 1,
    ...legacyTerm,
    flags: [...legacyTerm.flags],
    packages: [...legacyTerm.packages],
  }));
  const migrated = playerTerminal.loadPlayerTerminal("legacy@example.ionio.gr");
  assert.deepEqual(migrated.crontab, ["# m h dom mon dow command"],
    "the legacy system table should not remain in the per-user crontab state");
  assert.ok(terminal.getNode(migrated.fs, "/root/persistent-note.txt"), "legacy challenge files should migrate into the unified root");
  assert.match(terminal.getNode(migrated.fs, "/root/gamehack.txt")?.content || "", /player edit from the legacy workspace/);
  assert.match(terminal.getNode(migrated.fs, "/root/gamehack.txt.rebrand-backup")?.content || "", /Welcome to GameHack/,
    "an existing current-brand fixture should remain available when a saved legacy file takes its name");
  assert.equal(terminal.getNode(migrated.fs, "/root/hackforge.txt"), null, "the old fixture filename should migrate without losing edits");
  assert.ok(terminal.getNode(migrated.fs, "/home/operator/legacy-root-note.txt"));
  assert.equal(terminal.getNode(migrated.fs, "/labs/scenarios"), null, "module-specific root mounts should be removed after migration");
  playerTerminal.savePlayerTerminal("legacy@example.ionio.gr", migrated);
  assert.ok(storageValues.has(`gamehack.player-terminal.v2:${encodeURIComponent("legacy@example.ionio.gr")}`));
  assert.ok(!storageValues.has(legacyKey), "saving the migrated terminal should retire the legacy snapshot");

  const resetUser = "reset-lab@example.ionio.gr";
  const dirty = playerTerminal.createPlayerTerminal();
  const operatorHome = terminal.getNode(dirty.fs, "/home/operator");
  assert.ok(operatorHome?.children);
  delete operatorHome.children["welcome.txt"];
  dirty.procs = dirty.procs.filter((proc) => proc.pid !== 7440);
  dirty.services.apache2 = "running";
  dirty.flags.add("should-not-survive-revert");
  playerTerminal.savePlayerTerminal(resetUser, dirty);
  const reverted = playerTerminal.resetPlayerTerminal(resetUser, {
    moduleId: "sr-files",
    scenario: "sudorun",
    notice: "Lab restored.",
  });
  assert.ok(terminal.getNode(reverted.fs, "/home/operator/welcome.txt"), "revert should restore deleted lab files");
  assert.equal(reverted.services.apache2, "stopped", "revert should restore service state");
  assert.ok(reverted.procs.some((proc) => proc.pid === 7440 && proc.alive), "revert should restore lab processes");
  assert.equal(reverted.flags.has("should-not-survive-revert"), false, "revert clears lab flags so completed objectives are not replayed for XP");
  assert.equal(reverted.activeModuleId, "sr-files");
  assert.match(reverted.lines.at(-1)?.text || "", /Lab restored/);

  console.log(`Linux sandbox checks passed: ${ALL_LINUX_COMMANDS.length} advertised command examples, one unified VFS, per-player isolation, persistence, legacy migration, and lab revert.`);
} finally {
  await server.close();
}
