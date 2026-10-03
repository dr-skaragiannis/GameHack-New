// Regression checks for the terminal-engine changes made for the Sudo_Run
// campaign, focused on behaviour the pre-existing campaigns depend on.
// Run: npx tsx test/terminal-regressions.ts
import { Terminal } from "../src/lib/terminal";

let fails = 0;
const check = (name: string, ok: boolean, detail = "") => {
  if (!ok) {
    fails++;
    console.log(`FAIL  ${name}${detail ? "  →  " + detail : ""}`);
  } else {
    console.log(`ok    ${name}`);
  }
};

const text = (t: Terminal, cmd: string) => t.run(cmd).map((l) => l.text).join("\n");

// --- 1) find honours -name globs and -type, and still sets ranFindCmd -------
{
  const t = new Terminal();
  const out = text(t, 'find . -name "*.txt"');
  const lines = out.split("\n").filter(Boolean);
  check("find: every result ends in .txt", lines.length > 0 && lines.every((l) => l.endsWith(".txt")), out);
  check("find: intro check still passes", t.ran.some((c) => /^find\s+.*-name/.test(c)));
  check("find: ranFindCmd set", t.ranFindCmd);
  const dirs = text(t, "find . -type d").split("\n").filter(Boolean);
  check("find: -type d lists no files", dirs.every((d) => t.pathExists(d)), dirs.join(" | "));
}

// --- 2) head/tail slice instead of dumping the whole file -------------------
{
  const t = new Terminal();
  t.run("echo 'l1' > window.txt");
  t.run("echo 'l2' >> window.txt");
  t.run("echo 'l3' >> window.txt");
  t.run("echo 'l4' >> window.txt");
  check("head -2 prints two lines", text(t, "head -2 window.txt") === "l1\nl2", text(t, "head -2 window.txt"));
  check("tail -2 prints last two lines", text(t, "tail -2 window.txt") === "l3\nl4", text(t, "tail -2 window.txt"));
  check("head -n 1 honours -n", text(t, "head -n 1 window.txt") === "l1");
  check("cat still prints everything", text(t, "cat window.txt") === "l1\nl2\nl3\nl4");
  check("head records the read", t.readFiles.has("/home/operator/window.txt"));
}

// --- 3) --help routes to the manual instead of running the command ----------
{
  const t = new Terminal();
  const help = text(t, "ls --help");
  check("ls --help prints the manual", help.includes("list directory contents"), help);
  check("ls --help does not list the cwd", !help.includes("readme.txt"), help);
  check("volatility --help works (article example)", text(t, "volatility --help").includes("memory forensics"));
  check("man ls still works", text(t, "man ls").includes("list directory contents"));
}

// --- 4) sed accepts quoted expressions --------------------------------------
{
  const t = new Terminal();
  t.run("sed -i 's/gateway/hop/g' notes.md");
  check("sed -i with quoted expression edits the file", (t.fileContent("/home/operator/notes.md") || "").includes("hop"));
  const dry = text(t, "sed s/hop/gateway/g notes.md");
  check("sed dry-run prints the substitution", dry.includes("gateway"));
}

// --- 5) pipes inside quotes are literal text, not pipelines ------------------
{
  const t = new Terminal();
  t.run("echo 'ps aux | grep sshd' > piped.txt");
  check("quoted pipe is written literally", (t.fileContent("/home/operator/piped.txt") || "").trim() === "ps aux | grep sshd");
  const cut = text(t, "echo 'a b c d e' | cut -d \" \" -f 5");
  check("cut slices the fifth field", cut === "e", cut);
  const invert = text(t, "ps aux | grep -v USER").split("\n");
  check("grep -v in a pipe still inverts", invert.length > 0 && !invert.join().includes("USER"));
  const trimmed = text(t, "ps aux | head -n -1").split("\n").length;
  check("head -n -1 drops the last line", trimmed > 0);
}

// --- 6) intro-campaign outcomes that must keep working ----------------------
{
  const t = new Terminal();
  text(t, "cat .secret");
  check("intro: cat .secret captured", t.readFiles.has("/home/operator/.secret"));
  text(t, "grep target notes.md");
  check("intro: grep recorded the match", t.grepped.has("/home/operator/notes.md"));
  text(t, "ls -l");
  check("intro: ls -l recorded", t.listedLong);
  text(t, "ls -a");
  check("intro: ls -a revealed hidden files", t.listedHidden);
  text(t, "chmod +x backup.sh");
  check("intro: chmod +x recorded", t.chmodX.has("/home/operator/backup.sh"));
  text(t, `curl http://10.10.10.5/login --data "user=' OR '1'='1"`);
  check("intro: SQLi flag still captured", t.capturedFlags.has("flag{sql_injection_authentication_bypass}"));
  text(t, "nmap 10.10.10.5");
  check("intro: nmap port scan recorded", t.nmapPortScans.has("10.10.10.5"));
  text(t, "ssh operator@10.10.10.5");
  check("intro: ssh target recorded", t.sshTargets.has("10.10.10.5"));
}

// --- 7) process/service plumbing -------------------------------------------
{
  const t = new Terminal();
  const aux = text(t, "ps aux");
  check("ps aux prints the full table", aux.includes("COMMAND") && aux.includes("msfconsole"));
  t.run("kill -9 5123");
  check("killed process disappears from ps", !text(t, "ps aux").includes("msfconsole"));
  t.run("service apache2 start");
  check("apache2 appears in ps after start", text(t, "ps aux").includes("apache2"));
  check("curl localhost serves the docroot", text(t, "curl http://localhost").includes("It works"));
  t.run("service apache2 stop");
  check("curl localhost refused after stop", text(t, "curl http://localhost").includes("Connection refused"));
}

console.log(fails ? `\n${fails} regression(s) failed` : "\nNo regressions detected.");
process.exit(fails ? 1 : 0);
