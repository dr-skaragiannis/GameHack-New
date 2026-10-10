import assert from "node:assert/strict";
import { createServer } from "vite";

const values = new Map();
globalThis.localStorage = {
  getItem: (key) => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, String(value)),
  removeItem: (key) => values.delete(key),
};

/**
 * Final challenges are deliberately harder than the objectives: 34 of the 48
 * fall out of the work the objectives already did, and the other 14 need
 * commands the challenge brief asks for by name. Those 14 are spelled out here,
 * one command list per challenge, taken from its own brief — never harvested
 * from prose with a regex, which matches English sentence fragments.
 *
 * Anything not listed here must pass on the objectives' hints alone, so a
 * challenge whose check drifts away from its brief fails this suite.
 */
const CHALLENGE_PLANS = {
  "sr-intro[0]": [
    "cd ~",
    "pwd",
  ],
  "sr-intro[1]": [
    "cd ~",
    "cat Desktop/CTF-notes.txt",
  ],
  "sr-search[1]": [
    "cat /opt/labs/gamehack",
  ],
  "sr-net[0]": [
    "cat /root/linux-beginners-2/network/dns-records.txt",
    "dig gamehack.lab MX",
  ],
  "sr-proc[1]": [
    "cat /root/linux-beginners-2/processes/schedule-notes.txt",
    "at 21:30",
    "/root/scanning_script.sh",
    "crontab -l",
  ],
  "sr-env[0]": [
    // The fixture has no saved-value file, so the challenge starts by writing one.
    'echo "$HISTSIZE" > /root/linux-beginners-2/environment/histsize-before-change.txt',
    "cat /root/linux-beginners-2/environment/histsize-before-change.txt",
    "export HISTSIZE=1000",
    "env",
  ],
  "sr-bash[1]": [
    "submit FLAG{linux_beginners_3_bash}",
  ],
  "sr-cron[1]": [
    "submit FLAG{linux_beginners_3_cron}",
  ],
  "sr-svc[0]": [
    // The objectives' hints already ran the FTP session and the get; the
    // challenge is the local proof, which needs the file actually read.
    "ls",
    "cat favicon.ico",
  ],
  "sr-svc[1]": [
    "submit FLAG{linux_beginners_3_services}",
  ],
  "ssh-svc-auth[0]": [
    "cat /etc/ssh/sshd_config",
    "grep -n PasswordAuthentication /etc/ssh/sshd_config",
  ],
  "ssh-svc-harden[0]": [
    "ssh -L 8080:127.0.0.1:8080 labuser@10.10.10.12",
  ],
  "ssh-svc-harden[1]": [
    "ssh-keygen -t ed25519",
    "cat /etc/ssh/sshd_config",
  ],
  "share-doc-intro[1]": [
    "whoami",
    "pwd",
    "hostname",
  ],
  "dfi-intro[1]": [
    "cat /cases/IR-2404/evidence/01-intake/triage-notes.txt",
  ],
  // The brief names the repair and both confirmations; the objectives supply the
  // diagnosis and the copy.
  "dfi-live[1]": [
    "file /cases/IR-2404/evidence/01-intake/challenge.png",
    "hexedit /home/operator/recovered.png",
    "file /home/operator/recovered.png",
  ],
};

const server = await createServer({
  configFile: false,
  logLevel: "silent",
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true },
  appType: "custom",
});

try {
  const [lessons, terminal, playerTerminal] = await Promise.all([
    server.ssrLoadModule("/src/data/lessons.ts"),
    server.ssrLoadModule("/src/lib/terminal.ts"),
    server.ssrLoadModule("/src/lib/playerTerminal.ts"),
  ]);

  const seen = new Set();
  let total = 0;

  for (const path of lessons.LEARNING_PATHS) {
    for (const mod of path.modules) {
      const term = playerTerminal.createPlayerTerminal();
      playerTerminal.activateTerminalForModule(term, mod.id, mod.scenario);

      // The objectives first, replayed exactly the way test:linux does it.
      for (const objective of mod.tasks) {
        for (const command of objective.hint.en.split(/\r?\n/).filter(Boolean)) {
          terminal.runCommand(term, command);
        }
        assert.ok(objective.check(term), `${mod.id}/${objective.id} completes from its own hint`);
      }

      mod.challenges.forEach((challenge, index) => {
        const key = `${mod.id}[${index}]`;
        seen.add(key);
        total += 1;
        const plan = CHALLENGE_PLANS[key];
        if (plan) {
          for (const command of plan) terminal.runCommand(term, command);
        }
        assert.ok(
          challenge.check(term),
          `${key} "${challenge.title.en}" completes ${plan ? "from the commands its own brief names" : "from the objectives alone"}`,
        );
      });
    }
  }

  // A stale plan would silently stop guarding anything.
  const everyModule = new Set(
    lessons.LEARNING_PATHS.flatMap((path) => path.modules)
      .flatMap((mod) => mod.challenges.map((_, index) => `${mod.id}[${index}]`)),
  );
  for (const key of Object.keys(CHALLENGE_PLANS)) {
    assert.ok(everyModule.has(key), `the plan for ${key} still matches a live challenge`);
  }

  // An objective must not be satisfiable by typing the command name alone: the
  // player has to supply the arguments the objective asked for, and usually see
  // the resulting output. Two objectives are legitimately bare-command shapes -
  // `volatility` prints its help either way, and the FTP login still supplies
  // the anonymous username and password.
  const BARE_OK = new Set(["sr-help/vol", "sr-svc/ftp-connect"]);
  const trivial = [];
  for (const path of lessons.LEARNING_PATHS) {
    for (const mod of path.modules) {
      for (const objective of mod.tasks) {
        const hints = objective.hint.en.split(/\r?\n/).filter(Boolean);
        if (!hints.some((command) => command.split(/\s+/).length > 1)) continue;
        const lazy = playerTerminal.createPlayerTerminal();
        playerTerminal.activateTerminalForModule(lazy, mod.id, mod.scenario);
        for (const command of hints) terminal.runCommand(lazy, command.split(/\s+/)[0]);
        if (objective.check(lazy) && !BARE_OK.has(`${mod.id}/${objective.id}`)) {
          trivial.push(`${mod.id}/${objective.id}`);
        }
      }
    }
  }
  assert.deepEqual(trivial, [], "no objective should complete from the bare command with no arguments");

  assert.equal(total, 58, "every live lab contributes exactly two final challenges");
  console.log(`Challenge replay checks passed: all ${total} final challenges complete, ${Object.keys(CHALLENGE_PLANS).length} of them from the commands their own brief names.`);
} finally {
  await server.close();
}
