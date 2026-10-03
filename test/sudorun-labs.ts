// End-to-end lab test for the Sudo_Run campaign.
//
// It drives the REAL Terminal engine (src/lib/terminal.ts) with the exact
// command sequence each objective asks for, using the campaign's own virtual
// filesystem, and then evaluates the real check() function of every task and
// challenge. Run: npx tsx test/sudorun-labs.ts
import { CAMPAIGNS } from "../src/data/lessons";
import { Terminal } from "../src/lib/terminal";

const campaign = CAMPAIGNS.find((c) => c.id === "sudorun");
if (!campaign) {
  console.error("FAIL: campaign 'sudorun' not found in CAMPAIGNS");
  process.exit(1);
}

// moduleId -> commands the player is expected to type (one string per Enter press)
const SCRIPTS: Record<string, string[]> = {
  "sr-boot": [
    "pwd", "whoami", "ls", "ls -l", "ls -a",
    "cd Documents", "pwd", "cd ..", "pwd",
    "cd /", "ls", "cd /home/operator",
    "cd Documents/ignite", "cat notes.txt", "cd /home/operator",
    "hostname", "id", "date",
  ],
  "sr-search": [
    "ls --help", "man ls", "man find", "locate hackforge", "whereis sed", "which nmap",
    "find / -name simple_bash.sh",
    'find / -name simple_bash.sh 2>&1 | grep -v "Permission denied"',
    "grep hackforge /etc/hosts",
    "grep -i www hackforge.in",
    "find / -name '*.sh'",
    "find / -name '*hosts*' 2>&1 | grep -v 'Permission denied'",
  ],
  "sr-files": [
    "cat hackforge.txt",
    "touch forge.txt", "ls",
    "mkdir ForgeLab",
    "mkdir ForgeLab/lab1", "mkdir ForgeLab/lab2",
    "cp hackforge.txt ForgeLab/", "ls ForgeLab",
    "mv forge.txt ForgeLab/moved.txt", "ls",
    "touch delete_me.txt", "rm delete_me.txt",
    "rmdir ForgeLab/lab2",
    "mkdir Documents/reports", "touch Documents/reports/notes.txt", "cat Documents/reports/notes.txt",
    "touch swap.log", "cp swap.log keep.log", "rm swap.log",
    "rm -r ForgeLab", "ls",
  ],
  "sr-text": [
    "head /etc/ettercap/etter.dns", "tail /etc/ettercap/etter.dns", "nl /etc/ettercap/etter.dns",
    "more /etc/ettercap/etter.dns", "less /etc/ettercap/etter.dns",
    "sed s/WWW/www/g hackforge.in", "sed -i 's/WWW/www/g' hackforge.in", "grep -i www hackforge.in",
    "sed -i 's/www/WWW/g' hackforge.in", "cat hackforge.in",
    "echo '192.168.4.66 trap.hackforge.lab' >> /etc/hosts", "tail /etc/hosts",
  ],
  "sr-apt": [
    "apt-cache search hydra", "cat /etc/apt/sources.list", "which git",
    "apt-get install git", "which git", "apt-get remove git",
    "apt-get install git", "apt-get purge git", "apt-get update", "apt-get upgrade",
    "apt-get install hydra", "whereis hydra", "apt-get purge hydra", "which hydra",
  ],
  "sr-perms": [
    "ls -l", "cat /etc/shadow",
    "sudo chown ignite hackforge.txt", "chgrp ignite hackforge.txt", "ls -l hackforge.txt",
    "chmod +x hackforge.txt", "chmod 644 hackforge.txt",
    "chmod 4644 hackforge.txt", "chmod 2466 hackforge.txt",
    "touch secret.txt", "echo 'flag{permissions_keep_secrets}' > secret.txt", "chmod 600 secret.txt",
    "chmod 4755 scanner.sh", "ls -l",
  ],
  "sr-net": [
    "ifconfig", "iwconfig", "ifconfig eth0 192.168.1.13", "ifconfig",
    "ifconfig eth0 down", "ifconfig eth0 hw ether 00:11:22:33:44:55", "ifconfig eth0 up",
    "dhclient eth0",
    "dig hackforge.in", "dig hackforge.in mx", "dig hackforge.in ns",
    'echo "nameserver 1.1.1.1" > /etc/resolv.conf', "cat /etc/resolv.conf",
    "nano /etc/hosts", "ifconfig | grep inet",
    "ifconfig eth0 down", "ifconfig eth0 hw ether aa:bb:cc:dd:ee:ff", "ifconfig eth0 up", "ifconfig",
    "echo '10.10.10.99 www.hackforge.in' >> /etc/hosts", "grep hackforge /etc/hosts",
  ],
  "sr-proc": [
    "ps", "ps aux", "ps aux | grep msfconsole", "top",
    "nice -n -10 /usr/bin/ssh-agent", "renice 20 6242",
    "kill -1 6242", "kill -9 4378", "ps aux",
    "nano hackforge.txt &", "jobs", "fg 1",
    "at 9:00pm", "/home/operator/simple_bash.sh",
    "at 11:30pm", "/home/operator/scanner.sh",
  ],
  "sr-env": [
    "set", "set | more", "set | grep HISTSIZE",
    "echo $HISTSIZE > ~/valueofHISTSIZE.txt", "cat ~/valueofHISTSIZE.txt",
    "HISTSIZE=0", "export HISTSIZE",
    'url_variable="hackforge.in/"', "echo $url_variable", "unset url_variable", "echo $url_variable",
    "echo $PATH",
    "cat ~/valueofHISTSIZE.txt", "HISTSIZE=1000", "export HISTSIZE",
    "OPSKIT=/home/operator/Documents", "export OPSKIT", "env | grep OPSKIT",
  ],
  "sr-script": [
    "cat first_script.sh", "./first_script.sh", "chmod +x first_script.sh", "./first_script.sh",
    "chmod +x greet.sh", "./greet.sh", "HackForge",
    "chmod +x scanner.sh", "cat scanner.sh", "./scanner.sh", "10.10.10.0/24",
    "nano myscan.sh",
    "echo '#!/bin/bash' > hello.sh", "echo 'echo Hello from HackForge' >> hello.sh",
    "chmod +x hello.sh", "./hello.sh",
    "bash simple_bash.sh",
    "echo '#!/bin/bash' > ssdcheck.sh", "echo 'ps aux | grep sshd' >> ssdcheck.sh",
    "chmod +x ssdcheck.sh", "./ssdcheck.sh",
  ],
  "sr-cron": [
    "service cron status", "service cron start", "cat /etc/crontab",
    "crontab -l", "crontab -e",
    'echo "55 23 * * * operator /home/operator/scanner.sh" >> /etc/crontab',
    "crontab -l", "ls /etc/rc3.d", "update-rc.d mysql defaults", "ls /etc/rc3.d",
    "ps aux | grep mysql",
    'echo "0 * * * * operator /home/operator/simple_bash.sh" >> /etc/crontab', "crontab -l",
    "update-rc.d mysql remove", "ls /etc/rc3.d",
  ],
  "sr-services": [
    "curl http://localhost", "service apache2 status", "service apache2 start",
    "curl http://localhost", "nano /var/www/html/index.html", "service apache2 restart",
    "service apache2 stop",
    "service ssh start", "ssh ignite@192.168.0.11",
    "ftp files.hackforge.lab", "anonymous", "anonymous",
    "ls", "cd ubuntu", "cd releases", "ls", "get favicon.ico", "get SHA256SUMS.txt", "bye",
    "ls",
    "echo '<h1>HackForge was here</h1>' > /var/www/html/index.html",
    "service apache2 start", "curl http://localhost",
  ],
};

let failures = 0;
let taskCount = 0;
let challengeCount = 0;

const modules = [...campaign.modules].sort((a, b) => a.order - b.order);
console.log(`Campaign: ${campaign.title.en} — ${modules.length} labs\n`);

for (const mod of modules) {
  const script = SCRIPTS[mod.id];
  if (!script) {
    console.error(`FAIL  ${mod.id}: no command script defined in this test`);
    failures++;
    continue;
  }
  const t = new Terminal(mod.labFS ? mod.labFS() : undefined);
  const errors: string[] = [];
  const doneTasks = new Set<string>();
  const doneChals = new Set<number>();
  for (const line of script) {
    const out = t.run(line);
    for (const l of out) if (l.cls === "text-red-400") errors.push(`${line}  →  ${l.text}`);
    // The app re-evaluates every objective after each action (ModuleView.handleAction).
    for (const task of mod.tasks) if (!doneTasks.has(task.id) && task.check(t)) doneTasks.add(task.id);
    mod.challenges.forEach((ch, i) => {
      if (!doneChals.has(i) && ch.check(t)) doneChals.add(i);
    });
  }

  const failedTasks = mod.tasks.filter((task) => !doneTasks.has(task.id));
  const failedChals = mod.challenges.filter((_ch, i) => !doneChals.has(i));
  taskCount += mod.tasks.length;
  challengeCount += mod.challenges.length;

  const status = failedTasks.length || failedChals.length ? "FAIL" : "ok  ";
  if (failedTasks.length || failedChals.length) failures++;
  console.log(
    `${status}  ${String(mod.order).padStart(2)}. ${mod.id.padEnd(12)} tasks ${mod.tasks.length - failedTasks.length}/${mod.tasks.length}  challenges ${mod.challenges.length - failedChals.length}/${mod.challenges.length}`
  );
  for (const f of failedTasks) console.log(`        ✗ task      ${f.id}`);
  for (const f of failedChals) console.log(`        ✗ challenge ${f.title.en}`);
  if (errors.length) console.log(`        engine errors: ${errors.length} → ${errors.slice(0, 3).join(" | ")}`);
}

console.log(`\n${modules.length} labs · ${taskCount} objectives · ${challengeCount} challenges`);
if (failures) {
  console.error(`\n${failures} lab(s) with unsolved objectives`);
  process.exit(1);
}
console.log("All Sudo_Run objectives and challenges verified.");
