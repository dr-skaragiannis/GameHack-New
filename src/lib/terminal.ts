// A safe, simulated Linux terminal engine for the HACKFORGE lab.
// No real commands are executed — everything is a scripted simulation.

export type FileNode = {
  type: "file" | "dir";
  content?: string;
  perms: string; // e.g. "rwxr-xr-x"
  owner: string;
  group: string;
  size: number;
  hidden?: boolean;
  setuid?: boolean;
  setgid?: boolean;
  children?: Record<string, FileNode>;
};

export type CmdResult = {
  lines: OutLine[];
  command: string;
};

export type OutLine = { text: string; cls?: string };

// Common surface used by the TerminalView component so it can drive either the
// lab Terminal or the Raven terminal.
export interface TerminalLike {
  history: string[];
  prompt(): string;
  run(raw: string): OutLine[];
  complete(input: string): { completed: string; candidates: string[] };
}

const c = {
  err: "text-red-400",
  ok: "text-neon-green",
  warn: "text-amber-300",
  dim: "text-iron-500",
  info: "text-neon-cyan",
  ember: "text-ember-400",
};

function line(text: string, cls?: string): OutLine {
  return { text, cls };
}

// ------------------------- Virtual File System -------------------------

function file(content: string, perms = "rw-r--r--", owner = "operator"): FileNode {
  return { type: "file", content, perms, owner, group: owner, size: content.length };
}
function dir(children: Record<string, FileNode>, perms = "rwxr-xr-x", owner = "operator"): FileNode {
  return { type: "dir", children, perms, owner, group: owner, size: 4096 };
}

export function buildFS(): FileNode {
  return dir({
    home: dir({
      operator: dir({
        "readme.txt": file(
          "Welcome to HACKFORGE, operator.\nThis is a sandbox. Practice freely.\nRule #1: hack only what you are allowed to.\n"
        ),
        "notes.md": file("# Recon notes\n- gateway is 10.10.10.1\n- target box: 10.10.10.5\n"),
        documents: dir({
          "passwords.txt": file("do-not-store-passwords-in-plaintext\n", "rw-------"),
          "todo.txt": file("1. learn linux\n2. scan network\n3. profit (ethically)\n"),
          ".htpasswd": file("root:x:hidden\nadmin:BACKDOOR:flag{grep_found_the_backdoor}\nguest:x:none\n"),
        }),
        loot: dir({}),
        ".secret": file("flag{hidden_files_start_with_a_dot}\n"),
        ".vault": dir({
          "flag.txt": file("flag{you_navigated_the_hidden_vault}\n"),
        }),
        ".ssh": dir({
          id_rsa: file("-----BEGIN OPENSSH PRIVATE KEY-----\n(simulated private key)\n-----END-----\n", "rw-r--r--"),
          "id_rsa.pub": file("ssh-rsa AAAAB3... operator@kali\n"),
        }),
        "backup.sh": file("#!/bin/bash\ntar -czf backup.tgz documents/\n", "rwxr-xr-x"),
      }),
    }),
    etc: dir({
      passwd: file(
        "root:x:0:0:root:/root:/bin/bash\noperator:x:1000:1000::/home/operator:/bin/bash\nwww-data:x:33:33::/var/www:/usr/sbin/nologin\n",
        "rw-r--r--",
        "root"
      ),
      hosts: file("127.0.0.1 localhost\n10.10.10.5 target.hackforge.lab\n", "rw-r--r--", "root"),
      shadow: file(
        "root:$6$saltsalt$R0oThAsh...:19000:0:99999:7:::\noperator:$6$abc$hAsH...:19000:0:99999:7:::\nflag{root_reads_the_shadow_file}\n",
        "rw-------",
        "root"
      ),
    }),
    var: dir({
      www: dir({ "index.html": file("<h1>It works</h1>\n", "rw-r--r--", "www-data") }, "rwxr-xr-x", "www-data"),
    }),
    root: dir(
      {
        "flag.txt": file("flag{root_access_the_forge_is_complete}\n", "rw-------", "root"),
      },
      "rwx------",
      "root"
    ),
  });
}

// ------------------------- Network model -------------------------

const NETWORK: Record<string, { ports: { port: number; svc: string; ver: string; state?: string }[]; hostname: string }> = {
  "10.10.10.1": { hostname: "gateway.hackforge.lab", ports: [{ port: 53, svc: "domain", ver: "dnsmasq 2.85" }] },
  "10.10.10.5": {
    hostname: "target.hackforge.lab",
    ports: [
      { port: 22, svc: "ssh", ver: "OpenSSH 8.9p1" },
      { port: 80, svc: "http", ver: "Apache 2.4.52" },
      { port: 3306, svc: "mysql", ver: "MySQL 5.7.38" },
    ],
  },
  "10.10.10.7": {
    hostname: "web.hackforge.lab",
    ports: [
      { port: 80, svc: "http", ver: "nginx 1.18.0" },
      { port: 443, svc: "https", ver: "nginx 1.18.0" },
    ],
  },
  "10.10.10.6": {
    hostname: "hackforge.in",
    ports: [
      { port: 53, svc: "domain", ver: "BIND 9.18" },
      { port: 80, svc: "http", ver: "Apache 2.4.52" },
      { port: 443, svc: "https", ver: "Apache 2.4.52" },
    ],
  },
  "10.10.10.9": {
    hostname: "files.hackforge.lab",
    ports: [
      { port: 21, svc: "ftp", ver: "vsftpd 3.0.5" },
      { port: 22, svc: "ssh", ver: "OpenSSH 8.9p1" },
    ],
  },
};
const HOSTALIAS: Record<string, string> = {
  "target.hackforge.lab": "10.10.10.5",
  "web.hackforge.lab": "10.10.10.7",
  "gateway.hackforge.lab": "10.10.10.1",
  "scanme.hackforge.lab": "10.10.10.5",
  "hackforge.in": "10.10.10.6",
  "www.hackforge.in": "10.10.10.6",
  "files.hackforge.lab": "10.10.10.9",
};

// Domains that always resolve in the lab (used by dig / ftp).
const DOMAIN_IPS: Record<string, string> = {
  "hackforge.in": "10.10.10.6",
  "www.hackforge.in": "10.10.10.6",
  "files.hackforge.lab": "10.10.10.9",
};

// Simulated FTP server tree (Sudo_Run campaign): files.hackforge.lab
const FTP_TREE: Record<string, string[]> = {
  "": ["ubuntu/"],
  ubuntu: ["releases/"],
  "ubuntu/releases": ["favicon.ico", "SHA256SUMS.txt", "README.txt"],
};
const FTP_FILES: Record<string, string> = {
  "ubuntu/releases/favicon.ico": "FAKE-ICO-DATA hackforge labs favicon",
  "ubuntu/releases/SHA256SUMS.txt": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855  hackforge.iso",
  "ubuntu/releases/README.txt": "HackForge Labs mirror - training mirrors only.",
};

// Static process table for ps/top (Sudo_Run campaign lessons).
const PROC_TABLE: { pid: number; name: string; cpu: string; mem: string; state: string }[] = [
  { pid: 1432, name: "kworker/u2:1", cpu: "0.0", mem: "0.0", state: "S" },
  { pid: 1668, name: "kworker/2:3", cpu: "0.1", mem: "0.1", state: "S" },
  { pid: 2145, name: "cupsd", cpu: "0.0", mem: "0.3", state: "S" },
  { pid: 2568, name: "wirelesstracker", cpu: "0.4", mem: "0.8", state: "S" },
  { pid: 3120, name: "bash", cpu: "0.0", mem: "0.2", state: "S" },
  { pid: 3898, name: "apt", cpu: "0.2", mem: "0.5", state: "S" },
  { pid: 4198, name: "dnsmasq", cpu: "0.0", mem: "0.1", state: "S" },
  { pid: 4378, name: "bluetoothd", cpu: "0.1", mem: "0.2", state: "Z (zombie)" },
  { pid: 4423, name: "apt-listchanges", cpu: "0.0", mem: "0.2", state: "S" },
  { pid: 4569, name: "sshd", cpu: "0.0", mem: "0.3", state: "S" },
  { pid: 5123, name: "msfconsole", cpu: "2.4", mem: "6.1", state: "S" },
  { pid: 6242, name: "ssh-agent", cpu: "0.0", mem: "0.1", state: "S" },
  { pid: 6673, name: "rsyslogd", cpu: "0.0", mem: "0.2", state: "S" },
  { pid: 7102, name: "ps", cpu: "0.3", mem: "0.1", state: "R" },
];

function resolve(host: string): string | null {
  if (NETWORK[host]) return host;
  if (HOSTALIAS[host]) return HOSTALIAS[host];
  return null;
}

// ------------------------- Engine -------------------------

export class Terminal {
  fs: FileNode;
  cwd: string[]; // path segments, e.g. ["home","operator"]
  user: string;
  host: string;
  history: string[] = [];
  commandsRun = 0;
  ran: string[] = []; // normalized command log for objective checks

  // ---- Outcome tracking (method-agnostic) — checks read these, NOT raw text ----
  // Every flag below is set ONLY when a command actually executes successfully in
  // the right context (correct user/permissions/target), never just because the
  // command string was typed.
  capturedFlags = new Set<string>(); // any flag{...} the player has revealed
  pinged = new Set<string>(); // IPs proven reachable (by IP or resolved name)
  resolved = new Set<string>(); // hostnames/IPs resolved via any DNS tool
  nmapSubnet = false; // performed a subnet sweep
  nmapVersionScans = new Set<string>(); // IPs given a service/version scan
  nmapPortScans = new Set<string>(); // IPs given any port scan
  nmapSpecificPorts = new Set<string>(); // `${ip}:${port}` explicitly scanned via -p
  bruteforced = new Set<string>(); // services successfully brute-forced
  sqlmapRun = false; // ran an automated SQLi tool
  sqlmapDumped = false; // ran sqlmap with --dump (extracted data)
  nmapFullScan = new Set<string>(); // IPs scanned with -p- (all ports)
  // simple "this action actually happened" outcomes
  ranHelp = false;
  ranWhoami = false;
  ranId = false;
  ranPwd = false;
  ranClear = false;
  ranIpAddr = false;
  ranIpRoute = false;
  ranNetstat = false;
  ranIfconfig = false;
  ranFindCmd = false; // a find that executed over a valid path
  whoisDone = false;
  listedDirs = new Set<string>(); // dirs successfully listed with ls
  listedHidden = false; // ls -a that actually revealed hidden entries
  listedLong = false; // ls -l performed on a real dir
  readFiles = new Set<string>(); // abs paths of files whose content was printed
  sudoReadFiles = new Set<string>(); // files read while effectively root (via sudo/root)
  grepped = new Set<string>(); // abs file paths where grep returned a match
  curled = new Set<string>(); // hosts successfully fetched with curl
  sshTargets = new Set<string>(); // hosts an ssh session was opened to
  sshSessions = new Set<string>(); // "user@host" strings an ssh session was opened to

  // ---- Sudo_Run campaign engine state ----
  vars: Record<string, string> = {}; // shell/environment variables (HISTSIZE, custom ones)
  exported = new Set<string>(); // variables marked with export
  unsetVars = new Set<string>(); // variables removed with unset
  awaitingRead: string | null = null; // a running script paused on `read VAR`
  scriptQueue: string[] = []; // remaining script lines to run after read completes
  scriptStack: { lines: string[]; idx: number } | null = null;
  ranScripts = new Set<string>(); // abs paths of scripts executed via ./script
  readUsed = false; // a script consumed user input via `read`
  chmodX = new Set<string>(); // files made executable with chmod
  jobs: { id: number; pid: number; cmd: string }[] = []; // background jobs (&)
  fgUsed = false;
  killed = new Set<string>(); // pids killed with kill
  killedPids = new Set<number>(); // pids that no longer show up in ps/top
  niceRan = false;
  reniceRan = false;
  atScheduled = false;
  awaitingAtJob: string | null = null; // an `at TIME` session waiting for its command
  atJobs: { time: string; cmd: string }[] = []; // jobs handed to the at daemon
  psRan = false;
  psAux = false;
  topRan = false;
  envViewed = false;
  iwconfigRan = false;
  eth0 = { ip: "10.10.10.13", mac: "08:00:27:1a:2b:3c", up: true };
  ipChanged = false;
  macSpoofed = false;
  dhcpDone = false;
  digMx = false;
  digNs = false;
  locateRan = false;
  whereisRan = false;
  whichRan = false;
  nlRan = false;
  sedRan = false;
  sedReplaced = new Set<string>(); // files whose content was rewritten via sed -i
  nanoOpened = new Set<string>(); // files opened in the nano editor sim
  aptSearched = false;
  installedPkgs = new Set<string>(); // packages installed via apt-get install
  removedPkgs = new Set<string>(); // packages removed via apt-get remove
  purgedPkgs = new Set<string>(); // packages purged via apt-get purge
  aptUpdated = false; // apt-get update ran
  aptUpgraded = false; // apt-get upgrade ran
  serviceStates: Record<string, string> = { apache2: "inactive (dead)", ssh: "inactive (dead)", cron: "inactive (dead)", mysql: "active (running)" };
  rcAdded = new Set<string>(); // services added to boot with update-rc.d
  cronListed = false; // crontab -l ran
  cronEdited = false; // crontab -e ran (editor selection shown)
  ftpGot = new Set<string>(); // files downloaded via ftp get
  ftpDone = false; // ftp session used (get + bye)
  whichFound: string | null = null; // last program successfully resolved by which
  niceValue: string | null = null; // niceness passed to nice -n
  renicedPid: string | null = null; // pid adjusted with renice
  manRan = false; // a manual page was viewed
  manViewed = new Set<string>(); // manuals opened
  nmapPingSweep = false; // nmap -sP/-sn host discovery ran

  constructor(fs?: FileNode) {
    this.fs = fs || buildFS();
    this.cwd = ["home", "operator"];
    this.user = "operator";
    this.host = "kali";
    this.vars = { HISTSIZE: "1000", HOSTNAME: "kali", USER: "operator", HOME: "/home/operator", PATH: "/usr/local/bin:/usr/bin:/bin", SHELL: "/bin/bash", LANG: "en_US.UTF-8" };
  }

  // ---- public helpers for module/challenge checks ----
  fileContent(input: string): string | null {
    const segs = this.resolvePath(input);
    const n = segs && this.nodeAt(segs);
    return n && n.type === "file" ? n.content || "" : null;
  }
  serviceState(name: string): string {
    return this.serviceStates[name] || "unknown";
  }
  hasPkg(name: string): boolean {
    return this.installedPkgs.has(name) && !this.removedPkgs.has(name);
  }
  getVar(name: string): string | undefined {
    return this.vars[name];
  }
  specialPerms(input: string): { suid: boolean; setgid: boolean } | null {
    const segs = this.resolvePath(input);
    const n = segs && this.nodeAt(segs);
    return n ? { suid: !!n.setuid, setgid: !!n.setgid } : null;
  }
  exists(input: string): boolean {
    const segs = this.resolvePath(input);
    return !!(segs && this.nodeAt(segs));
  }
  permsOf(input: string): string | null {
    const segs = this.resolvePath(input);
    const n = segs && this.nodeAt(segs);
    return n ? n.perms : null;
  }
  ownerOf(input: string): string | null {
    const segs = this.resolvePath(input);
    const n = segs && this.nodeAt(segs);
    return n ? n.owner : null;
  }
  groupOf(input: string): string | null {
    const segs = this.resolvePath(input);
    const n = segs && this.nodeAt(segs);
    return n ? n.group : null;
  }
  private writeFileAbs(segs: string[], content: string, append: boolean): boolean {
    const parent = this.nodeAt(segs.slice(0, -1));
    if (!parent || parent.type !== "dir" || !parent.children) return false;
    const name = segs[segs.length - 1];
    const existing = parent.children[name];
    if (existing && existing.type === "dir") return false;
    if (existing) {
      existing.content = append ? (existing.content || "") + content : content;
      existing.size = (existing.content || "").length;
    } else {
      parent.children[name] = file(content);
    }
    return true;
  }

  cwdStr(): string {
    const p = "/" + this.cwd.join("/");
    if (p === "/home/operator") return "~";
    if (p.startsWith("/home/operator/")) return "~" + p.slice("/home/operator".length);
    return p;
  }

  prompt(): string {
    return `${this.user}@${this.host}:${this.cwdStr()}$`;
  }

  // Public helper for challenge checks: permission string of a path, or null.
  pathPerms(input: string): string | null {
    const segs = this.resolvePath(input);
    const n = segs && this.nodeAt(segs);
    return n ? n.perms : null;
  }

  // Public helper for challenge checks: does a path exist?
  pathExists(input: string): boolean {
    const segs = this.resolvePath(input);
    return !!(segs && this.nodeAt(segs));
  }

  // Tab completion: given the current input, return the completed string and any
  // ambiguous candidates. Completes command names on the first word, otherwise paths.
  complete(input: string): { completed: string; candidates: string[] } {
    const noneChange = { completed: input, candidates: [] as string[] };
    const trailingSpace = /\s$/.test(input);
    const parts = input.split(/\s+/);
    const isFirstWord = parts.length === 1 && !trailingSpace;

    // ---- complete a command name ----
    if (isFirstWord) {
      const frag = parts[0];
      if (!frag) return noneChange;
      const cmds = COMMANDS.filter((c) => c.startsWith(frag));
      if (cmds.length === 0) return noneChange;
      if (cmds.length === 1) return { completed: cmds[0] + " ", candidates: [] };
      const common = longestCommonPrefix(cmds);
      return { completed: common.length > frag.length ? common : frag, candidates: cmds };
    }

    // ---- complete a path argument ----
    const frag = trailingSpace ? "" : parts[parts.length - 1];
    // split fragment into a directory portion and the final name portion
    const slash = frag.lastIndexOf("/");
    const dirPart = slash >= 0 ? frag.slice(0, slash + 1) : "";
    const namePart = slash >= 0 ? frag.slice(slash + 1) : frag;
    const dirSegs = this.resolvePath(dirPart || ".");
    const dirNode = dirSegs && this.nodeAt(dirSegs);
    if (!dirNode || dirNode.type !== "dir" || !dirNode.children) return noneChange;

    let names = Object.keys(dirNode.children).filter((n) => n.startsWith(namePart));
    // only show dotfiles if the user has started typing a dot
    if (!namePart.startsWith(".")) names = names.filter((n) => !n.startsWith("."));
    if (names.length === 0) return noneChange;

    const decorate = (n: string) => (dirNode.children![n].type === "dir" ? n + "/" : n);

    if (names.length === 1) {
      const full = dirPart + decorate(names[0]);
      const rebuilt = [...parts.slice(0, -1), full].join(" ");
      return { completed: rebuilt + (dirNode.children[names[0]].type === "dir" ? "" : " "), candidates: [] };
    }
    const common = longestCommonPrefix(names);
    const full = dirPart + (common.length > namePart.length ? common : namePart);
    const rebuilt = [...parts.slice(0, -1), full].join(" ");
    return { completed: rebuilt, candidates: names.map(decorate) };
  }

  private nodeAt(segs: string[]): FileNode | null {
    let n: FileNode = this.fs;
    for (const s of segs) {
      if (n.type !== "dir" || !n.children || !n.children[s]) return null;
      n = n.children[s];
    }
    return n;
  }

  private resolvePath(input: string): string[] | null {
    let segs: string[];
    if (input.startsWith("/")) segs = input.split("/").filter(Boolean);
    else if (input === "~" || input.startsWith("~/")) {
      segs = ["home", "operator", ...input.slice(1).split("/").filter(Boolean)];
    } else {
      segs = [...this.cwd, ...input.split("/").filter(Boolean)];
    }
    const out: string[] = [];
    for (const s of segs) {
      if (s === ".") continue;
      if (s === "..") out.pop();
      else out.push(s);
    }
    return out;
  }

  run(raw: string): OutLine[] {
    let input = raw.trim();
    if (input) {
      this.history.push(input);
      this.commandsRun++;
      this.ran.push(input.replace(/\s+/g, " "));
    }

    // 1) A script paused on `read VAR` consumes this line as the variable's value.
    if (this.awaitingRead) {
      const name = this.awaitingRead;
      const rest = this.scriptQueue;
      this.awaitingRead = null;
      this.scriptQueue = [];
      this.vars[name] = input;
      this.readUsed = true;
      return this.execScriptLines(rest);
    }

    // 2) Inside an FTP session everything routes to the FTP mini-shell.
    if (this.ftp) return this.ftpInput(input);

    // 2b) An `at TIME` session swallows the next line as the job to schedule.
    if (this.awaitingAtJob) {
      const time = this.awaitingAtJob;
      this.awaitingAtJob = null;
      this.atScheduled = true;
      this.atJobs.push({ time, cmd: input });
      return [
        line(`job 12 at Sat Oct 03 ${time} 2026`, c.ok),
        line(`scheduled: ${input}`, c.ok),
        line("(sim) one command per entry — on a real box Ctrl+D closes the at> prompt.", c.dim),
      ];
    }

    if (!input) return [];

    // 3) Shell variable assignment: NAME=value (quotes stripped)
    if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(input)) {
      const eq = input.indexOf("=");
      this.vars[input.slice(0, eq)] = input.slice(eq + 1).replace(/^["']|["']$/g, "");
      return [];
    }

    // 4) Expand $VAR / ${VAR} before dispatch
    input = input.replace(
      /\$\{([A-Za-z_][A-Za-z0-9_]*)\}|\$([A-Za-z_][A-Za-z0-9_]*)/g,
      (_m, a, b) => this.vars[a || b] ?? ""
    );

    // 5) Background job marker: trailing &
    let background = false;
    if (/&\s*$/.test(input)) {
      background = true;
      input = input.replace(/&\s*$/, "").trim();
    }

    // 6) Output redirection: ... > file  |  ... >> file
    let redirect: { op: string; target: string } | null = null;
    const red = input.match(/\s+(>>?)\s*([^\s>]+)\s*$/);
    if (red) {
      redirect = { op: red[1], target: red[2] };
      input = input.slice(0, red.index).trim();
    }

    // 7) Pipelines: a | b | c  (stderr marker 2>&1 tolerated anywhere)
    let out = this.execPipeline(input);

    if (background) {
      const id = this.jobs.length + 1;
      const pid = 7800 + id * 137;
      this.jobs.push({ id, pid, cmd: input });
      out = [line(`[${id}] ${pid}`, c.ok)];
    }

    if (redirect) {
      const segs = this.resolvePath(redirect.target);
      const text = out.filter((l) => l.text !== "__CLEAR__").map((l) => l.text).join("\n") + "\n";
      if (!segs || !this.writeFileAbs(segs, text, redirect.op === ">>")) {
        return [line(`bash: ${redirect.target}: No such file or directory`, c.err)];
      }
      return [];
    }

    // Any command whose output reveals a flag captures it — method-agnostic.
    for (const l of out) {
      const m = l.text.match(/flag\{[^}]+\}/g);
      if (m) m.forEach((f) => this.capturedFlags.add(f));
    }
    return out;
  }

  // Run one pipeline ("a | b | c"). Shared by interactive input and by the
  // bash-script interpreter, so scripts can pipe exactly like the shell does.
  private execPipeline(input: string): OutLine[] {
    const stages = this.splitPipeline(input);
    let out = this.dispatch(stages[0] || "");
    for (const stage of stages.slice(1)) out = this.pipeStage(stage, out);
    return out;
  }

  // Split on '|' but NOT inside quotes, so `echo 'a | b' > f` writes the text.
  private splitPipeline(input: string): string[] {
    const stages: string[] = [];
    let cur = "";
    let quote: string | null = null;
    for (let i = 0; i < input.length; i++) {
      const ch = input[i];
      if (quote) {
        cur += ch;
        if (ch === quote) quote = null;
        continue;
      }
      if (ch === '"' || ch === "'") {
        quote = ch;
        cur += ch;
        continue;
      }
      if (ch === "|") {
        stages.push(cur);
        cur = "";
        continue;
      }
      cur += ch;
    }
    stages.push(cur);
    return stages.map((st) => st.replace(/2>&1/g, "").trim()).filter(Boolean);
  }

  // Handle one stage of a pipeline against the previous stage's output.
  private pipeStage(stage: string, lines: OutLine[]): OutLine[] {
    const parts = stage.split(/\s+/);
    const cmd = parts[0];
    const flags = parts.slice(1).filter((a) => a.startsWith("-")).join("");
    const args = parts.slice(1).filter((a) => !a.startsWith("-"));
    const texts = lines.map((l) => l.text);
    switch (cmd) {
      case "grep": {
        // Quoted patterns may contain spaces: grep "scan report", grep -v "Permission denied"
        const raw = stage.replace(/^\s*grep\s+/, "");
        const quoted = raw.match(/^(?:-\S+\s+)*("[^"]*"|'[^']*')/);
        const pattern = quoted ? quoted[1].slice(1, -1) : (args[0] || "").replace(/^["']|["']$/g, "");
        if (!pattern) return [line("usage: grep PATTERN", c.err)];
        const invert = flags.includes("v");
        const ci = flags.includes("i");
        const test = (s: string) =>
          ci ? s.toLowerCase().includes(pattern.toLowerCase()) : s.includes(pattern);
        const kept = texts.filter((tx) => (invert ? !test(tx) : test(tx)));
        return kept.map((tx) => line(tx, invert ? c.dim : c.ok));
      }
      case "more":
      case "less":
      case "cat":
        return lines;
      case "head":
      case "tail": {
        // head [-n] N | head -n -N (everything BUT the last N lines)
        let n = 10;
        for (let i = 1; i < parts.length; i++) {
          const a = parts[i];
          if (a === "-n" || a === "--lines") n = Number(parts[++i]);
          else if (/^-?\d+$/.test(a)) n = Number(a);
        }
        if (cmd === "head") {
          return n < 0 ? lines.slice(0, n) : lines.slice(0, n || 10);
        }
        return n < 0 ? lines.slice(-n) : lines.slice(-(n || 10));
      }
      case "cut": {
        // cut -d " " -f 5   |   cut -f 1-3   (delimiter may be quoted)
        const raw = stage.replace(/^\s*cut\s+/, "");
        const dm = raw.match(/-d\s*("[^"]*"|'[^']*'|\S+)/);
        const fm = raw.match(/-f\s*("[^"]*"|'[^']*'|\S+)/);
        if (!fm) return [line("cut: usage: cut -d DELIM -f FIELDS", c.err)];
        let delim = dm ? dm[1].replace(/^["']|["']$/g, "") : "\t";
        if (delim === "") delim = " ";
        const spec = fm[1].replace(/^["']|["']$/g, "");
        const picks: number[] = [];
        for (const chunk of spec.split(",")) {
          const range = chunk.split("-");
          const from = Number(range[0]) || 1;
          const to = range.length > 1 ? Number(range[1]) || from : from;
          for (let i = from; i <= to; i++) picks.push(i);
        }
        return texts.map((tx) => {
          const fields = tx.split(delim);
          return line(picks.map((i) => fields[i - 1] ?? "").join(delim), c.ok);
        });
      }
      case "sort":
        return texts.slice().sort().map((tx) => line(tx));
      case "uniq": {
        const uniq: string[] = [];
        for (const tx of texts) if (uniq[uniq.length - 1] !== tx) uniq.push(tx);
        return uniq.map((tx) => line(tx));
      }
      case "wc":
        return [line(`${texts.filter((tx) => tx.trim()).length}`, c.ok)];
      default:
        return [line(`(sim) pipe to '${cmd}' is not supported — try grep, head, tail, cut, sort, uniq, more, less`, c.dim), ...lines];
    }
  }

  private dispatch(input: string): OutLine[] {
    const parts = input.split(/\s+/);
    const cmd = parts[0];
    const args = parts.slice(1);
    const flags = args.filter((a) => a.startsWith("-")).join("").replace(/-/g, "");
    const pos = args.filter((a) => !a.startsWith("-"));

    // Every command answers "--help" with its manual page (like real tools:
    // `volatility --help`, `nmap --help`). Handled before the per-command
    // switch so no command has to remember to implement it.
    if (cmd !== "help" && (args.includes("--help") || args.includes("-h"))) return this.man(cmd);

    switch (cmd) {
      case "help":
        this.ranHelp = true;
        return this.help();
      case "clear":
      case "cls":
        this.ranClear = true;
        return [{ text: "__CLEAR__" }];
      case "pwd":
        this.ranPwd = true;
        return [line("/" + this.cwd.join("/"))];
      case "whoami":
        this.ranWhoami = true;
        return [line(this.user)];
      case "id":
        this.ranId = true;
        return [
          line(
            this.user === "root"
              ? "uid=0(root) gid=0(root) groups=0(root)"
              : "uid=1000(operator) gid=1000(operator) groups=1000(operator),27(sudo)"
          ),
        ];
      case "hostname":
        return [line(this.host)];
      case "echo":
        return [line(args.join(" ").replace(/^["']|["']$/g, ""))];
      case "date":
        return [line(new Date().toString())];
      case "history":
        return this.history.map((h, i) => line(`${String(i + 1).padStart(4)}  ${h}`));
      case "ls":
        return this.ls(flags, pos);
      case "cd":
        return this.cd(pos[0]);
      case "cat":
      case "less":
      case "more":
      case "bat":
        return this.cat(pos);
      case "head":
        return this.headTail(args, "head");
      case "tail":
        return this.headTail(args, "tail");
      case "mkdir":
        return this.mkdir(pos);
      case "touch":
        return this.touch(pos);
      case "rm":
        return this.rm(flags, pos);
      case "rmdir":
        if (!pos[0]) return [line("rmdir: missing operand", c.err)];
        {
          const segs = this.resolvePath(pos[0]);
          const node = segs && this.nodeAt(segs);
          if (!node) return [line(`rmdir: failed to remove '${pos[0]}': No such file or directory`, c.err)];
          if (node.type !== "dir") return [line(`rmdir: failed to remove '${pos[0]}': Not a directory`, c.err)];
          if (Object.keys(node.children || {}).length)
            return [line(`rmdir: failed to remove '${pos[0]}': Directory not empty — use rm -r for non-empty dirs`, c.err)];
          const parent = this.nodeAt(segs!.slice(0, -1));
          if (parent && parent.children) delete parent.children[segs![segs!.length - 1]];
        }
        return [];
      case "cp":
        return this.cp(pos);
      case "mv":
        return this.mv(pos);
      case "find":
        return this.find(args);
      case "grep":
        return this.grep(args);
      case "chmod":
        return this.chmod(pos);
      case "chown":
        return this.chown(pos);
      case "sudo":
        return this.sudo(args);
      case "man":
        return this.man(pos[0]);
      case "ip":
        return this.ip(args);
      case "ifconfig":
        return this.ifconfig(args);
      case "ping":
        return this.ping(pos);
      case "netstat":
      case "ss":
        return this.netstat();
      case "nslookup":
      case "host":
      case "resolvectl":
        return this.nslookup(pos[0]);
      case "dig":
        return this.dig(pos[0], pos[1]);
      case "whois":
        return this.whois(pos[0]);
      case "nmap":
        return this.nmap(args);
      case "hydra":
        return this.hydra(args);
      case "curl":
        return this.curl(args);
      case "sqlmap":
        return this.sqlmap(args);
      case "ssh":
        return this.ssh(args);
      case "exit":
        return [line("logout", c.dim)];
      // ---- Sudo_Run additions ----
      case "locate":
        return this.locate(pos[0]);
      case "whereis":
        return this.whereis(pos[0]);
      case "which":
        return this.which(pos[0]);
      case "nl":
        return this.nl(pos[0]);
      case "sed":
        return this.sed(args);
      case "chgrp":
        return this.chgrp(pos);
      case "apt-cache":
        return this.aptCache(pos);
      case "apt-get":
        return this.aptGet(pos, flags);
      case "nano":
        return this.nano(pos[0]);
      case "iwconfig":
        this.iwconfigRan = true;
        return this.iwconfig();
      case "dhclient":
        return this.dhclient(pos[0]);
      case "ps":
        return this.ps(args);
      case "top":
        this.topRan = true;
        return this.topOut();
      case "nice":
        return this.nice(args);
      case "renice":
        return this.renice(pos);
      case "kill":
        return this.killProc(pos, flags);
      case "jobs":
        if (!this.jobs.length) return [line("no active jobs", c.dim)];
        return this.jobs.map((j) => line(`[${j.id}]+  Running    ${j.cmd} &`));
      case "fg":
        return this.fg(pos[0]);
      case "at":
        return this.atCmd(pos);
      case "env":
      case "set":
        this.envViewed = true;
        return Object.entries(this.vars).map(([k, v]) => line(`${k}=${v}`));
      case "export":
        for (const p of pos) {
          const name = p.split("=")[0];
          this.exported.add(name);
        }
        return [];
      case "unset":
        for (const p of pos) {
          delete this.vars[p];
          this.unsetVars.add(p);
        }
        return [];
      case "service":
        return this.service(pos);
      case "crontab":
        return this.crontab(args);
      case "update-rc.d":
        return this.updateRc(pos);
      case "ftp":
        return this.ftpConnect(pos[0]);
      case "bash":
      case "sh":
        return this.runScript(pos[0], false);
      default:
        if (cmd.startsWith("./") || cmd.endsWith(".sh")) return this.runScript(cmd, true);
        return [line(`${cmd}: command not found`, c.err), line(`Type 'help' for available commands.`, c.dim)];
    }
  }

  private help(): OutLine[] {
    const groups: [string, string[]][] = [
      ["files", ["ls", "cd", "pwd", "cat", "echo", "mkdir", "touch", "cp", "mv", "rm", "find", "grep"]],
      ["system", ["whoami", "id", "chmod", "chown", "chgrp", "sudo", "history", "man", "clear"]],
      ["text", ["head", "tail", "nl", "sed", "more", "less"]],
      ["packages", ["apt-cache search", "apt-get install/remove/purge", "apt-get update/upgrade"]],
      ["network", ["ip a", "ifconfig", "iwconfig", "dhclient", "ping", "nslookup", "dig [mx|ns]", "whois"]],
      ["processes", ["ps [aux]", "top", "nice -n", "renice", "kill [-S]", "jobs", "fg", "at"]],
      ["environment", ["env", "set", "export", "unset", "echo $VAR"]],
      ["services", ["service", "crontab [-l|-e]", "update-rc.d", "ftp", "nano"]],
      ["lookup", ["locate", "whereis", "which"]],
      ["offensive", ["nmap", "hydra", "curl", "sqlmap", "ssh"]],
      ["shell", ["pipes: a | grep b", "redirect: > file / >> file", "jobs: cmd &", "vars: NAME=value", "./script.sh"]],
    ];
    const out: OutLine[] = [line("Available commands (simulated):", c.ember)];
    for (const [g, cmds] of groups) {
      out.push(line("  " + g + ":", c.info));
      out.push(line("    " + cmds.join("  "), c.dim));
    }
    return out;
  }

  private ls(flags: string, pos: string[]): OutLine[] {
    const target = pos[0] ? this.resolvePath(pos[0]) : this.cwd;
    if (!target) return [line(`ls: cannot access '${pos[0]}': No such file or directory`, c.err)];
    const node = this.nodeAt(target);
    if (!node) return [line(`ls: cannot access '${pos[0]}': No such file or directory`, c.err)];
    let names: string[];
    let nodes: Record<string, FileNode>;
    if (node.type === "file") {
      names = [target[target.length - 1]];
      nodes = { [names[0]]: node };
    } else {
      nodes = node.children || {};
      names = Object.keys(nodes).sort();
    }
    const showAll = flags.includes("a");
    const hadHidden = names.some((n) => n.startsWith("."));
    if (!showAll) names = names.filter((n) => !n.startsWith("."));
    const long = flags.includes("l");
    // outcomes: only record a successful directory listing
    if (node.type === "dir") {
      this.listedDirs.add("/" + target.join("/"));
      if (showAll && hadHidden) this.listedHidden = true;
      if (long) this.listedLong = true;
    }
    if (long) {
      const out: OutLine[] = [];
      if (node.type === "dir") out.push(line(`total ${names.length}`, c.dim));
      for (const n of names) {
        const f = nodes[n];
        const type = f.type === "dir" ? "d" : "-";
        const nm = f.type === "dir" ? n + "/" : n;
        const cls = f.type === "dir" ? c.info : f.perms.includes("x") ? c.ok : undefined;
        const pv = renderPerms(f);
        out.push(
          line(
            `${type}${pv}  1 ${f.owner.padEnd(8)} ${f.group.padEnd(8)} ${String(f.size).padStart(5)} Jan 01 09:00 ${nm}`,
            cls
          )
        );
      }
      return out.length ? out : [line("")];
    }
    // grid-ish single line
    const disp = names.map((n) => {
      const f = nodes[n];
      return f.type === "dir" ? n + "/" : n;
    });
    return [line(disp.join("   "), undefined)];
  }

  private cd(target?: string): OutLine[] {
    if (!target || target === "~") {
      this.cwd = ["home", "operator"];
      return [];
    }
    const segs = this.resolvePath(target);
    if (!segs) return [line(`cd: ${target}: No such file or directory`, c.err)];
    const node = this.nodeAt(segs);
    if (!node) return [line(`cd: ${target}: No such file or directory`, c.err)];
    if (node.type !== "dir") return [line(`cd: ${target}: Not a directory`, c.err)];
    this.cwd = segs;
    return [];
  }

  private cat(pos: string[]): OutLine[] {
    if (!pos.length) return [line("cat: missing file operand", c.err)];
    const out: OutLine[] = [];
    for (const p of pos) {
      const segs = this.resolvePath(p);
      const node = segs && this.nodeAt(segs);
      if (!node) out.push(line(`cat: ${p}: No such file or directory`, c.err));
      else if (node.type === "dir") out.push(line(`cat: ${p}: Is a directory`, c.err));
      else if (node.perms.startsWith("rw-------") && this.user !== "root" && node.owner !== this.user)
        out.push(line(`cat: ${p}: Permission denied`, c.err));
      else {
        // outcome: content was actually printed → record the real read
        const abs = "/" + segs!.join("/");
        this.readFiles.add(abs);
        if (this.user === "root") this.sudoReadFiles.add(abs);
        (node.content || "").split("\n").forEach((l, i, arr) => {
          if (i === arr.length - 1 && l === "") return;
          out.push(line(l));
        });
      }
    }
    return out;
  }

  private mkdir(pos: string[]): OutLine[] {
    if (!pos.length) return [line("mkdir: missing operand", c.err)];
    const out: OutLine[] = [];
    for (const p of pos.filter((x) => x !== "-p")) {
      const segs = this.resolvePath(p);
      if (!segs) continue;
      const parent = this.nodeAt(segs.slice(0, -1));
      if (!parent || parent.type !== "dir") {
        out.push(line(`mkdir: cannot create directory '${p}': No such file or directory`, c.err));
        continue;
      }
      const name = segs[segs.length - 1];
      if (parent.children![name]) out.push(line(`mkdir: cannot create directory '${p}': File exists`, c.err));
      else parent.children![name] = dir({}, "rwxr-xr-x", this.user);
    }
    return out;
  }

  private touch(pos: string[]): OutLine[] {
    if (!pos.length) return [line("touch: missing file operand", c.err)];
    for (const p of pos) {
      const segs = this.resolvePath(p);
      if (!segs) continue;
      const parent = this.nodeAt(segs.slice(0, -1));
      if (!parent || parent.type !== "dir") continue;
      const name = segs[segs.length - 1];
      if (!parent.children![name]) parent.children![name] = file("", "rw-r--r--", this.user);
    }
    return [];
  }

  private rm(flags: string, pos: string[]): OutLine[] {
    if (!pos.length) return [line("rm: missing operand", c.err)];
    const out: OutLine[] = [];
    for (const p of pos) {
      const segs = this.resolvePath(p);
      const node = segs && this.nodeAt(segs);
      if (!node) {
        out.push(line(`rm: cannot remove '${p}': No such file or directory`, c.err));
        continue;
      }
      if (node.type === "dir" && !flags.includes("r")) {
        out.push(line(`rm: cannot remove '${p}': Is a directory`, c.err));
        continue;
      }
      const parent = this.nodeAt(segs!.slice(0, -1));
      if (parent && parent.children) delete parent.children[segs![segs!.length - 1]];
    }
    return out;
  }

  private cp(pos: string[]): OutLine[] {
    if (pos.length < 2) return [line("cp: missing destination file operand", c.err)];
    const src = this.resolvePath(pos[0]);
    const node = src && this.nodeAt(src);
    if (!node) return [line(`cp: cannot stat '${pos[0]}': No such file or directory`, c.err)];
    const dst = this.resolvePath(pos[1]);
    if (!dst) return [line(`cp: bad destination`, c.err)];
    const dstNode = this.nodeAt(dst);
    if (dstNode && dstNode.type === "dir") {
      dstNode.children![src![src!.length - 1]] = JSON.parse(JSON.stringify(node));
    } else {
      const parent = this.nodeAt(dst.slice(0, -1));
      if (parent && parent.children) parent.children[dst[dst.length - 1]] = JSON.parse(JSON.stringify(node));
    }
    return [];
  }

  private mv(pos: string[]): OutLine[] {
    if (pos.length < 2) return [line("mv: missing destination file operand", c.err)];
    const out = this.cp(pos);
    if (out.length) return out;
    return this.rm("r", [pos[0]]);
  }

  private find(args: string[]): OutLine[] {
    // Parse the real option grammar: find PATH [-type f|d] [-name PATTERN]
    const rest: string[] = [];
    let pattern = "";
    let typeFilter = "";
    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a === "-name" || a === "-iname") {
        pattern = (args[++i] || "").replace(/^["']|["']$/g, "");
        continue;
      }
      if (a === "-type") {
        typeFilter = args[++i] || "";
        continue;
      }
      if (a.startsWith("-")) continue; // -print, -exec ... tolerated
      rest.push(a);
    }
    const start = rest[0] || ".";
    const base = this.resolvePath(start.startsWith("-") ? "." : start) || this.cwd;
    const node = this.nodeAt(base);
    if (!node) return [line(`find: '${start}': No such file or directory`, c.err)];
    this.ranFindCmd = true; // outcome: a find actually ran over a valid path
    // Shell globs: * → anything, ? → one char. Anchored on the base NAME, like
    // real find, so "*.sh" matches only entries whose whole name ends in .sh.
    const glob = pattern
      ? new RegExp(
          "^" +
            pattern
              .replace(/[.+^${}()|[\]\\]/g, "\\$&")
              .replace(/\*/g, "[^/]*")
              .replace(/\?/g, "[^/]") +
            "$"
        )
      : null;
    const out: OutLine[] = [];
    const prefix = start === "." ? "." : start.replace(/\/$/, "");
    const walk = (n: FileNode, path: string) => {
      if (n.type === "dir" && n.children) {
        for (const [k, v] of Object.entries(n.children)) {
          const p = path === "" ? k : `${path}/${k}`;
          // Non-root users cannot traverse root-only trees: mimic the real
          // "Permission denied" noise everyone meets on `find /`.
          const locked = v.perms.startsWith("rwx--") && v.owner === "root" && this.user !== "root";
          const lockedFile = v.type === "file" && v.perms === "rw-------" && v.owner === "root" && this.user !== "root";
          if (locked) {
            out.push(line(`find: '${prefix}/${p}': Permission denied`, c.err));
            continue;
          }
          if (lockedFile) {
            out.push(line(`find: '${prefix}/${p}': Permission denied`, c.err));
            continue;
          }
          const typeOk = typeFilter === "f" ? v.type === "file" : typeFilter === "d" ? v.type === "dir" : true;
          if (typeOk && (!glob || glob.test(k))) out.push(line(`${prefix}/${p}`));
          walk(v, p);
        }
      }
    };
    walk(node, "");
    return out;
  }

  // head / tail — real line-window semantics: head [-n] N FILE, tail -f FILE.
  private headTail(args: string[], which: "head" | "tail"): OutLine[] {
    const files: string[] = [];
    let count = 10;
    let follow = false;
    for (let i = 0; i < args.length; i++) {
      const a = args[i];
      if (a === "-n" || a === "--lines") {
        count = Number(args[++i]);
        continue;
      }
      if (/^-\d+$/.test(a)) {
        count = Number(a.slice(1));
        continue;
      }
      if (a === "-f") {
        follow = true;
        continue;
      }
      if (a.startsWith("-")) continue;
      files.push(a);
    }
    if (!files.length) return [line(`${which}: missing file operand`, c.err)];
    const out: OutLine[] = [];
    for (const p of files) {
      const segs = this.resolvePath(p);
      const node = segs && this.nodeAt(segs);
      if (!node || node.type !== "file") {
        out.push(line(`${which}: cannot open '${p}' for reading: No such file or directory`, c.err));
        continue;
      }
      const abs = "/" + segs!.join("/");
      this.readFiles.add(abs);
      if (this.user === "root") this.sudoReadFiles.add(abs);
      let rows = (node.content || "").split("\n");
      if (rows.length && rows[rows.length - 1] === "") rows = rows.slice(0, -1);
      const window = Math.abs(count);
      const slice = which === "head" ? rows.slice(0, window) : rows.slice(-window);
      slice.forEach((l) => out.push(line(l)));
      if (which === "tail" && follow) out.push(line(`(following ${p} — new lines appear here as they are written; Ctrl+C stops)`, c.dim));
    }
    return out;
  }

  private grep(args: string[]): OutLine[] {
    const flags = args.filter((a) => a.startsWith("-")).join("");
    const nonFlags = args.filter((a) => !a.startsWith("-"));
    if (nonFlags.length < 1) return [line("usage: grep PATTERN FILE", c.err)];
    const pattern = nonFlags[0].replace(/^["']|["']$/g, "");
    const ci = flags.includes("i");
    const recursive = flags.includes("r") || flags.includes("R");
    const matchLine = (l: string) => (ci ? l.toLowerCase().includes(pattern.toLowerCase()) : l.includes(pattern));

    // Recursive search across a directory tree.
    if (recursive) {
      const startArg = nonFlags[1] || ".";
      const base = this.resolvePath(startArg) || this.cwd;
      const node = this.nodeAt(base);
      if (!node) return [line(`grep: ${startArg}: No such file or directory`, c.err)];
      const out: OutLine[] = [];
      const walk = (n: FileNode, path: string, abs: string[]) => {
        if (n.type === "file") {
          (n.content || "").split("\n").forEach((l) => {
            if (l && matchLine(l)) {
              out.push(line(`${path}:${l}`, c.ok));
              this.grepped.add("/" + abs.join("/")); // outcome: match in this file
            }
          });
        } else if (n.children) {
          for (const [k, v] of Object.entries(n.children))
            walk(v, path === "" ? k : `${path}/${k}`, [...abs, k]);
        }
      };
      walk(node, startArg === "." ? "" : startArg, base);
      return out;
    }

    const fileArg = nonFlags[1];
    if (!fileArg) return [line("usage: grep PATTERN FILE", c.err)];
    const segs = this.resolvePath(fileArg);
    const node = segs && this.nodeAt(segs);
    if (!node || node.type !== "file") return [line(`grep: ${fileArg}: No such file or directory`, c.err)];
    const matches = (node.content || "").split("\n").filter(matchLine);
    if (matches.length) this.grepped.add("/" + segs!.join("/")); // outcome: match found
    return matches.map((m) => line(m, c.ok));
  }

  private chmod(pos: string[]): OutLine[] {
    if (pos.length < 2) return [line("chmod: missing operand", c.err)];
    const mode = pos[0];
    const segs = this.resolvePath(pos[1]);
    const node = segs && this.nodeAt(segs);
    if (!node) return [line(`chmod: cannot access '${pos[1]}': No such file or directory`, c.err)];
    if (/^[0-7]{3,4}$/.test(mode)) {
      node.perms = octalToPerms(mode.slice(-3));
      if (node.perms.includes("x")) this.chmodX.add("/" + segs!.join("/"));
      if (mode.length === 4) {
        const special = parseInt(mode[0], 8);
        node.setuid = (special & 4) !== 0;
        node.setgid = (special & 2) !== 0;
      } else {
        node.setuid = false;
        node.setgid = false;
      }
      return [];
    }
    // symbolic — supports comma-separated clauses and +, -, = operators
    const clauses = mode.split(",");
    let perms = node.perms;
    for (const cl of clauses) {
      if (!/^[ugoa]*[+\-=][rwx]*$/.test(cl)) {
        return [line(`chmod: invalid mode: '${mode}'`, c.err)];
      }
      perms = applySymbolic(perms, cl);
    }
    node.perms = perms;
    if (perms.includes("x")) this.chmodX.add("/" + segs!.join("/"));
    return [];
  }

  private chown(pos: string[]): OutLine[] {
    if (this.user !== "root") return [line("chown: changing ownership: Operation not permitted (try sudo)", c.err)];
    if (pos.length < 2) return [line("chown: missing operand", c.err)];
    const segs = this.resolvePath(pos[1]);
    const node = segs && this.nodeAt(segs);
    if (!node) return [line(`chown: cannot access '${pos[1]}': No such file or directory`, c.err)];
    const owner = pos[0].split(":")[0];
    node.owner = owner;
    if (pos[0].includes(":")) node.group = pos[0].split(":")[1] || owner;
    return [];
  }

  private sudo(args: string[]): OutLine[] {
    if (!args.length) return [line("usage: sudo command", c.err)];
    const prev = this.user;
    this.user = "root";
    const out = this.dispatch(args.join(" "));
    // keep root only for that command
    if (args[0] !== "su" && args.join(" ") !== "-i") this.user = prev;
    // Simulate "sudo su" giving a root shell
    if (args[0] === "su" || (args[0] === "-i")) {
      this.user = "root";
      return [line("root shell acquired. You are now root.", c.ok)];
    }
    return out;
  }

  private man(name?: string): OutLine[] {
    const pages: Record<string, string> = {
      ls: "ls - list directory contents. -l long format, -a show hidden.",
      cd: "cd - change working directory. cd .. up one, cd ~ home, cd / root.",
      chmod: "chmod - change file mode bits. e.g. chmod 755 file, chmod +x script.sh, chmod 4644 file (SUID).",
      chown: "chown - change file owner and group: chown user file | chown user:group file",
      chgrp: "chgrp - change group ownership: chgrp group file",
      find: "find - search files in a directory tree. find / -name pattern",
      grep: "grep - print lines matching a pattern. -i ignore case, -v invert match, -r recursive.",
      sed: "sed - stream editor. sed 's/old/new/g' file  (-i edits the file in place)",
      ps: "ps - report process status. ps aux for all processes with user/CPU/mem info.",
      top: "top - live process monitor sorted by CPU usage.",
      kill: "kill - send a signal to a process. kill -9 PID force, kill -1 PID hangup.",
      nice: "nice - run a command with modified scheduling priority: nice -n N cmd",
      renice: "renice - alter the priority of a running process: renice N PID",
      crontab: "crontab - manage cron jobs. -l list, -e edit.",
      service: "service - run an init script: service NAME start|stop|restart|status",
      "apt-get": "apt-get - package manager. install, remove, purge, update, upgrade.",
      "apt-cache": "apt-cache - query the package cache: apt-cache search NAME",
      nmap: "nmap - network mapper. Scan hosts & ports. -sV service versions, -p ports.",
      hydra: "hydra - parallelized login brute-forcer. e.g. hydra -l user -P wordlist ssh://host",
      ping: "ping - send ICMP ECHO_REQUEST to network hosts. -c count.",
      man: "man - display manual pages. man COMMAND",
      ftp: "ftp - file transfer client: ftp HOST, then ls/cd/get/bye.",
      ssh: "ssh - openssh client: ssh user@host",
      dig: "dig - DNS lookup: dig domain [mx|ns]",
      ifconfig: "ifconfig - configure network interfaces: ifconfig eth0 [up|down|ip|hw ether MAC]",
      volatility: "volatility - memory forensics framework. volatility --help lists plugins: imageinfo, pslist, netscan, memdump.",
      head: "head - output the first lines of a file. head FILE (10), head -n 5 FILE, head -5 FILE.",
      tail: "tail - output the last lines of a file. tail FILE, tail -3 FILE, tail -f LOG follows a growing log.",
      nl: "nl - number the lines of a file: nl FILE",
      more: "more - page through a file forward only: more FILE (space = next page, q = quit).",
      less: "less - page both ways and search: less FILE ( /pattern searches, n next match, q quits).",
      cut: "cut - slice columns out of lines: cut -d \" \" -f 5  (-d delimiter, -f fields)",
      locate: "locate - find paths by name from the on-disk index: locate PATTERN (updatedb refreshes it).",
      whereis: "whereis - locate the binary, source and manual page of a command: whereis git",
      which: "which - show the exact binary your PATH would execute: which git",
      env: "env - print the environment variables: env | grep HISTSIZE (set works the same way)",
      export: "export - mark a variable as an environment variable so child processes inherit it: export NAME",
      unset: "unset - delete a variable: unset NAME",
      at: "at - run a job once at a given time: at 9:00pm  then type the command (Ctrl+D ends it).",
      jobs: "jobs - list background jobs started with '&' in this shell.",
      fg: "fg - bring a background job to the foreground: fg %1 or fg PID",
      iwconfig: "iwconfig - configure wireless interfaces: iwconfig shows ESSID, mode, bit rate.",
      dhclient: "dhclient - ask the DHCP daemon for a lease: dhclient eth0",
      "update-rc.d": "update-rc.d - add/remove a service from the boot runlevels: update-rc.d mysql defaults",
      nano: "nano - small terminal text editor: nano FILE (^O save, ^X exit).",
      touch: "touch - create an empty file or refresh its timestamp: touch FILE",
      mkdir: "mkdir - create a directory: mkdir DIR (mkdir -p a/b/c creates parents too).",
      rmdir: "rmdir - remove an EMPTY directory (use rm -r for non-empty trees).",
      cp: "cp - copy files: cp SRC DST  (cp -r for directories).",
      mv: "mv - move OR rename: mv OLD NEW",
      rm: "rm - delete files: rm FILE, rm -r DIR (no trash bin — permanent).",
      cat: "cat - print whole files: cat FILE1 FILE2",
      whoami: "whoami - print the effective user name.",
      id: "id - print uid, gid and every group you belong to.",
      curl: "curl - transfer a URL: curl http://host/ (add -o FILE to save the body).",
    };
    this.manRan = true;
    if (name) this.manViewed.add(name);
    if (!name) return [line("What manual page do you want?", c.dim)];
    return pages[name] ? [line(pages[name])] : [line(`No manual entry for ${name}`, c.err)];
  }

  private ip(args: string[]): OutLine[] {
    if (args[0] === "a" || args[0] === "addr" || args[0] === "address") {
      this.ranIpAddr = true;
      return [
        line("1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN", c.dim),
        line("    inet 127.0.0.1/8 scope host lo", c.info),
        line("2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP", c.dim),
        line("    link/ether 08:00:27:1a:2b:3c brd ff:ff:ff:ff:ff:ff", c.dim),
        line("    inet 10.10.10.13/24 brd 10.10.10.255 scope global dynamic eth0", c.info),
      ];
    }
    if (args[0] === "r" || args[0] === "route") {
      this.ranIpRoute = true;
      return [line("default via 10.10.10.1 dev eth0 proto dhcp"), line("10.10.10.0/24 dev eth0 proto kernel scope link src 10.10.10.13")];
    }
    return [line("Usage: ip a | ip route", c.dim)];
  }

  private ifconfig(args: string[] = []): OutLine[] {
    this.ranIfconfig = true;
    const pos = args.filter((a) => !a.startsWith("-"));
    // ifconfig eth0 down | up
    if (pos[0] === "eth0" && pos[1] === "down") {
      this.eth0.up = false;
      return [line("eth0: link down", c.dim)];
    }
    if (pos[0] === "eth0" && pos[1] === "up") {
      this.eth0.up = true;
      return [line("eth0: link up", c.dim)];
    }
    // ifconfig eth0 hw ether 00:11:22:33:44:55
    if (pos[0] === "eth0" && pos[1] === "hw" && pos[2] === "ether") {
      const mac = pos[3];
      if (!mac) return [line("usage: ifconfig eth0 hw ether MAC", c.err)];
      const old = this.eth0.mac;
      this.eth0.mac = mac;
      this.macSpoofed = mac !== "08:00:27:1a:2b:3c";
      return [line(`ether set to ${mac} (was ${old})`, c.dim)];
    }
    // ifconfig eth0 192.168.1.13
    if (pos[0] === "eth0" && /^\d+\.\d+\.\d+\.\d+$/.test(pos[1] || "")) {
      this.eth0.ip = pos[1];
      this.ipChanged = pos[1] !== "10.10.10.13";
      return [line(`inet set to ${pos[1]} (sim)`, c.dim)];
    }
    if (!this.eth0.up) return [line("eth0: interface is DOWN (ifconfig eth0 up)", c.err)];
    return [
      line("eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500"),
      line(`        inet ${this.eth0.ip}  netmask 255.255.255.0  broadcast 10.10.10.255`, c.info),
      line(`        ether ${this.eth0.mac}  txqueuelen 1000  (Ethernet)`, c.dim),
      line("lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536"),
      line("        inet 127.0.0.1  netmask 255.0.0.0", c.info),
    ];
  }

  private ping(pos: string[]): OutLine[] {
    const host = pos[0];
    if (!host) return [line("ping: usage error: Destination address required", c.err)];
    const ip = resolve(host) || (/^\d+\.\d+\.\d+\.\d+$/.test(host) ? host : null);
    if (!ip || (!NETWORK[ip] && ip !== "10.10.10.13")) {
      return [line(`ping: ${host}: Name or service not known`, c.err)];
    }
    this.pinged.add(ip); // outcome: this host is proven reachable
    const out: OutLine[] = [line(`PING ${host} (${ip}) 56(84) bytes of data.`)];
    for (let i = 1; i <= 4; i++) {
      const ms = (0.2 + Math.random() * 1.5).toFixed(2);
      out.push(line(`64 bytes from ${ip}: icmp_seq=${i} ttl=64 time=${ms} ms`, c.ok));
    }
    out.push(line(`--- ${host} ping statistics ---`));
    out.push(line("4 packets transmitted, 4 received, 0% packet loss, time 3005ms", c.dim));
    return out;
  }

  private netstat(): OutLine[] {
    this.ranNetstat = true;
    return [
      line("Active Internet connections (only servers)"),
      line("Proto  Local Address        State       PID/Program", c.dim),
      line("tcp    0.0.0.0:22           LISTEN      612/sshd"),
      line("tcp    127.0.0.1:3306       LISTEN      889/mysqld"),
      line("tcp    10.10.10.13:44210    ESTABLISHED 1201/firefox"),
    ];
  }

  private nslookup(host?: string): OutLine[] {
    if (!host) return [line("usage: nslookup HOST", c.err)];
    const ip = resolve(host);
    if (!ip) return [line(`** server can't find ${host}: NXDOMAIN`, c.err)];
    this.resolved.add(host);
    this.resolved.add(ip);
    return [
      line("Server:\t\t10.10.10.1"),
      line("Address:\t10.10.10.1#53", c.dim),
      line(""),
      line(`Name:\t${NETWORK[ip].hostname}`, c.info),
      line(`Address: ${ip}`, c.ok),
    ];
  }

  private dig(host?: string, type?: string): OutLine[] {
    if (!host) return [line("usage: dig HOST [A|MX|NS]", c.err)];
    const t = (type || "a").toLowerCase();
    // The lab domain always resolves; other names need a known alias.
    const ip = DOMAIN_IPS[host] || resolve(host);
    if (!ip) return [line(`;; ->>HEADER<<- status: NXDOMAIN`, c.err)];
    this.resolved.add(host);
    this.resolved.add(ip);
    if (t === "mx") {
      this.digMx = true;
      return [
        line(`; <<>> DiG 9.18 <<>> ${host} mx`, c.dim),
        line(";; ANSWER SECTION:"),
        line(`${host}.  300  IN  MX  10 mail.${host.replace(/^www\./, "")}.`, c.ok),
        line(`${host}.  300  IN  MX  20 mail2.${host.replace(/^www\./, "")}.`, c.ok),
        line(";; Query time: 6 msec", c.dim),
      ];
    }
    if (t === "ns") {
      this.digNs = true;
      return [
        line(`; <<>> DiG 9.18 <<>> ${host} ns`, c.dim),
        line(";; ANSWER SECTION:"),
        line(`${host}.  300  IN  NS  ns1.hackforge.lab.`, c.ok),
        line(`${host}.  300  IN  NS  ns2.hackforge.lab.`, c.ok),
        line(";; Query time: 5 msec", c.dim),
      ];
    }
    return [
      line(`; <<>> DiG 9.18 <<>> ${host}`, c.dim),
      line(";; ANSWER SECTION:"),
      line(`${host}.  300  IN  A  ${ip}`, c.ok),
      line(";; Query time: 4 msec", c.dim),
    ];
  }

  private whois(host?: string): OutLine[] {
    if (!host) return [line("usage: whois DOMAIN", c.err)];
    this.whoisDone = true;
    return [
      line(`Domain Name: ${host.toUpperCase()}`),
      line("Registrar: HACKFORGE Labs Registrar"),
      line("Creation Date: 2024-01-01T00:00:00Z", c.dim),
      line("Name Server: NS1.HACKFORGE.LAB", c.dim),
      line("Registrant Country: (simulated)", c.dim),
    ];
  }

  private nmap(args: string[]): OutLine[] {
    // A target looks like a host/IP/subnet (contains a dot or slash), which also
    // avoids mistaking a port spec like "22,3306" for the target.
    const target = args.find((a) => !a.startsWith("-") && a !== "nmap" && /[.\/]/.test(a));
    if (!target) return [line("Nmap: no target specified.", c.err)];
    // Version detection: -sV, -A (aggressive), or --version-* all imply it.
    const sV =
      args.some((a) => /^-(sV|A)$/.test(a)) ||
      args.join(" ").includes("-sV") ||
      args.some((a) => a.startsWith("--version"));

    const pingSweep = args.some((a) => /^-(sP|sn)$/.test(a));
    if (pingSweep) this.nmapPingSweep = true;
    // subnet / range scan
    if (target.includes("/") || target.includes("-") || target.includes("*")) {
      this.nmapSubnet = true; // outcome: swept the network
      const out: OutLine[] = [line("Starting Nmap 7.94 ( https://nmap.org )", c.dim)];
      for (const ip of Object.keys(NETWORK)) {
        if (!pingSweep) this.nmapPortScans.add(ip);
        if (sV && !pingSweep) this.nmapVersionScans.add(ip);
        out.push(line(`Nmap scan report for ${NETWORK[ip].hostname} (${ip})`, c.info));
        out.push(line("Host is up (0.00042s latency).", c.ok));
        if (pingSweep) continue; // ping sweep lists hosts only, no port table
      }
      out.push(line(`Nmap done: 254 IP addresses (${Object.keys(NETWORK).length} hosts up) scanned.`, c.dim));
      return out;
    }

    const ip = resolve(target) || (NETWORK[target] ? target : null);
    if (!ip || !NETWORK[ip]) return [line(`Failed to resolve "${target}".`, c.err)];
    this.nmapPortScans.add(ip); // outcome: scanned this host's ports
    if (sV) this.nmapVersionScans.add(ip); // outcome: fingerprinted services
    const host = NETWORK[ip];
    const out: OutLine[] = [
      line("Starting Nmap 7.94 ( https://nmap.org )", c.dim),
      line(`Nmap scan report for ${host.hostname} (${ip})`, c.info),
      line("Host is up (0.00038s latency).", c.ok),
      line(""),
      line("PORT     STATE SERVICE" + (sV ? "   VERSION" : ""), c.ember),
    ];
    let ports = host.ports;
    // Resolve the port spec, which may be attached ('-p22,80', '-p-') or a
    // separate following argument ('-p 22,80').
    const pIdx = args.findIndex((a) => a === "-p" || a.startsWith("-p"));
    if (pIdx >= 0) {
      let spec = args[pIdx].replace(/^-p/, "");
      if (spec === "" && args[pIdx] === "-p") spec = args[pIdx + 1] || "";
      if (spec === "-") {
        // '-p-' scans ALL 65535 ports — keep every port, record the full scan.
        this.nmapFullScan.add(ip);
      } else if (spec) {
        const wanted = spec.split(",").map((x) => parseInt(x, 10)).filter((n) => !isNaN(n));
        wanted.forEach((pn) => this.nmapSpecificPorts.add(`${ip}:${pn}`)); // outcome
        ports = ports.filter((p) => wanted.includes(p.port));
      }
    }
    for (const p of ports) {
      const svc = `${p.port}/tcp`.padEnd(9);
      out.push(line(`${svc}open  ${p.svc.padEnd(8)}${sV ? " " + p.ver : ""}`, c.ok));
    }
    out.push(line(""));
    out.push(line(`Nmap done: 1 IP address (1 host up) scanned in 1.42 seconds`, c.dim));
    return out;
  }

  private hydra(args: string[]): OutLine[] {
    const str = args.join(" ");
    const svcMatch = str.match(/(ssh|ftp|http-post-form|mysql):\/\/([^\s]+)/) || str.match(/\b(ssh|ftp|mysql)\b/);
    const hasList = args.includes("-P") || args.includes("-x");
    const hasUser = args.includes("-l") || args.includes("-L");
    const service = svcMatch ? svcMatch[1] : args[args.length - 1];
    if (!hasUser || !hasList) {
      return [line("Hydra: you must supply a login (-l) and a password list (-P). e.g.", c.err), line("  hydra -l admin -P rockyou.txt ssh://10.10.10.5", c.dim)];
    }
    const userIdx = args.indexOf("-l");
    const user = userIdx >= 0 ? args[userIdx + 1] : "admin";
    if (service) this.bruteforced.add(service.toLowerCase()); // outcome: cracked this service
    return [
      line("Hydra v9.5 (c) by van Hauser/THC - for legal purposes only.", c.dim),
      line(`[DATA] attacking ${service}://target...`, c.dim),
      line("[ATTEMPT] target - login \"" + user + "\" - pass \"123456\"", c.dim),
      line("[ATTEMPT] target - login \"" + user + "\" - pass \"password\"", c.dim),
      line("[ATTEMPT] target - login \"" + user + "\" - pass \"letmein\"", c.dim),
      line(`[22][${service}] host: 10.10.10.5   login: ${user}   password: hunter2`, c.ok),
      line("1 of 1 target successfully completed, 1 valid password found", c.ok),
    ];
  }

  private curl(args: string[]): OutLine[] {
    const url = args.find((a) => a.startsWith("http")) || args[args.length - 1];
    if (!url) return [line("curl: try 'curl <url>'", c.err)];
    const hostMatch = url.match(/^https?:\/\/([^/]+)/);
    if (hostMatch) this.curled.add(hostMatch[1]); // outcome: fetched this host
    // Loopback = YOUR OWN apache2 service: it answers only when the service is
    // running, and it serves the real /var/www/html/index.html of this box.
    if (hostMatch && /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(hostMatch[1])) {
      if (!(this.serviceStates.apache2 || "").startsWith("active"))
        return [line("curl: (7) Failed to connect to localhost port 80: Connection refused", c.err), line("(is the web server up?  service apache2 start)", c.dim)];
      // Debian/Kali serve /var/www/html, older layouts serve /var/www.
      const html = this.fileContent("/var/www/html/index.html") ?? this.fileContent("/var/www/index.html") ?? "";
      return [
        line("HTTP/1.1 200 OK", c.dim),
        line("Server: Apache/2.4.52 (Kali)", c.dim),
        line("Content-Type: text/html", c.dim),
        line(""),
        ...html.split("\n").filter((l) => l !== "").map((l) => line(l, c.ok)),
      ];
    }
    if (url.includes("login") && args.join(" ").includes("' OR '1'='1")) {
      return [
        line("HTTP/1.1 200 OK", c.dim),
        line("Set-Cookie: session=admin; HttpOnly", c.warn),
        line("<h1>Welcome back, administrator!</h1>", c.ok),
        line("flag{sql_injection_authentication_bypass}", c.ember),
      ];
    }
    return [
      line("HTTP/1.1 200 OK", c.dim),
      line("Server: Apache/2.4.52", c.dim),
      line("Content-Type: text/html", c.dim),
      line(""),
      line("<html><body><h1>HACKFORGE Demo App</h1>"),
      line('<form action="/login"><input name="user"><input name="pass"></form>'),
      line("</body></html>"),
    ];
  }

  private sqlmap(args: string[]): OutLine[] {
    const url = args.find((a) => a.includes("http")) || "";
    if (!url) return [line("sqlmap: option -u is required. e.g. sqlmap -u \"http://10.10.10.5/item?id=1\"", c.err)];
    this.sqlmapRun = true; // outcome: automated SQLi executed
    const wantsDump = args.some((a) => a === "--dump" || a === "--dump-all");
    const head = [
      line("        ___", c.dim),
      line("       __H__  sqlmap 1.8", c.ember),
      line("[*] starting @ 09:00", c.dim),
      line("[INFO] testing connection to the target URL", c.dim),
      line("[INFO] GET parameter 'id' appears to be injectable", c.warn),
      line("[INFO] the back-end DBMS is MySQL", c.info),
    ];
    if (wantsDump) {
      this.sqlmapDumped = true; // outcome: extracted table data
      return [
        ...head,
        line("[INFO] fetching columns for table 'users'", c.dim),
        line("[INFO] dumping table 'users' entries", c.dim),
        line("Database: webapp", c.ok),
        line("Table: users", c.ok),
        line("+----+----------+------------------+", c.dim),
        line("| id | username | password         |", c.ember),
        line("+----+----------+------------------+", c.dim),
        line("| 1  | admin    | hunter2          |", c.ok),
        line("| 2  | editor   | p@ssw0rd!        |", c.ok),
        line("+----+----------+------------------+", c.dim),
        line("[*] data dumped to CSV. 2 entries extracted.", c.warn),
      ];
    }
    return [
      ...head,
      line("[INFO] fetching database names", c.dim),
      line("available databases [3]:", c.ok),
      line("[*] information_schema", c.ok),
      line("[*] webapp", c.ok),
      line("[*] users", c.ok),
      line("Tip: re-run with --dump to extract a table's data.", c.dim),
    ];
  }

  private ssh(args: string[]): OutLine[] {
    const tgt = args.find((a) => !a.startsWith("-"));
    if (!tgt) return [line("usage: ssh user@host", c.err)];
    // outcome: opened a session to this host (requires user@host form + known host)
    const at = tgt.split("@");
    const host = at.length > 1 ? at[1] : tgt;
    const who = at.length > 1 ? at[0] : this.user;
    const hip = resolve(host) || (/^\d+\.\d+\.\d+\.\d+$/.test(host) ? host : null);
    if (at.length > 1 && hip && NETWORK[hip]) this.sshTargets.add(hip);
    if (at.length > 1) this.sshSessions.add(tgt); // outcome: a user@host session was opened
    return [
      line(`The authenticity of host '${host}' can't be established.`, c.dim),
      line("Warning: Permanently added to the list of known hosts.", c.dim),
      line(`${who}@${host}'s password: ********`, c.dim),
      line(`Welcome to Ubuntu 22.04 LTS (simulated) — logged in as ${who}@${host}`, c.ok),
      line("You are now on the remote box. (In this sim, keep working locally.)", c.info),
    ];
  }

  // =========================== Sudo_Run command set ===========================

  private walkAll(segs: string[] = []): { path: string[]; name: string; node: FileNode }[] {
    const out: { path: string[]; name: string; node: FileNode }[] = [];
    const dirNode = segs.length ? this.nodeAt(segs) : this.fs;
    if (!dirNode || dirNode.type !== "dir") return out;
    for (const [name, node] of Object.entries(dirNode.children || {})) {
      const p = [...segs, name];
      out.push({ path: p, name, node });
      if (node.type === "dir" && !name.startsWith(".")) out.push(...this.walkAll(p));
    }
    return out;
  }

  private locate(pattern?: string): OutLine[] {
    this.locateRan = true;
    if (!pattern) return [line("usage: locate PATTERN", c.err)];
    const p = pattern.toLowerCase();
    const hits = this.walkAll()
      .filter((e) => e.name.toLowerCase().includes(p))
      .map((e) => "/" + e.path.join("/"));
    if (this.hasPkg("hydra") || pattern === "hydra") hits.push("/usr/bin/hydra", "/usr/share/man/man1/hydra.1.gz");
    if (this.hasPkg("git")) hits.push("/usr/bin/git", "/usr/share/man/man1/git.1.gz");
    if (!hits.length) return [line("(locate database: no matches)", c.dim)];
    return hits.map((hh) => line(hh, c.info));
  }

  private whereis(name?: string): OutLine[] {
    this.whereisRan = true;
    if (!name) return [line("usage: whereis PROGRAM", c.err)];
    const builtin = ["ls", "cd", "cat", "ps", "grep", "find", "chmod", "kill", "man", "sed", "nl", "ifconfig", "nmap"].includes(name);
    const installed = this.hasPkg(name);
    if (!builtin && !installed) return [line(`${name}:`)];
    return [line(`${name}: /usr/bin/${name} /usr/share/man/man1/${name}.1.gz`, c.info)];
  }

  private which(name?: string): OutLine[] {
    this.whichRan = true;
    if (!name) return [line("usage: which PROGRAM", c.err)];
    const builtin = ["ls", "cd", "cat", "ps", "grep", "find", "chmod", "kill", "man", "sed", "nl", "ifconfig", "nmap", "apt-get", "apt-cache", "service", "crontab", "ssh", "ftp", "dig", "top"].includes(name);
    const installed = this.hasPkg(name);
    if (!builtin && !installed) return [line(`${name} not found`, c.err)];
    this.whichFound = name;
    return [line(`/usr/bin/${name}`, c.ok)];
  }

  private nl(file?: string): OutLine[] {
    this.nlRan = true;
    if (!file) return [line("usage: nl FILE", c.err)];
    const segs = this.resolvePath(file);
    const node = segs && this.nodeAt(segs);
    if (!node || node.type !== "file") return [line(`nl: ${file}: No such file or directory`, c.err)];
    return (node.content || "").split("\n").map((tx, i) => line(`     ${i + 1}  ${tx}`));
  }

  private sed(args: string[]): OutLine[] {
    this.sedRan = true;
    const edit = args.includes("-i");
    const strip = (a: string) => a.replace(/^["']|["']$/g, "");
    // The expression is usually quoted: sed -i 's/WWW/www/g' file
    const exprRaw = args.find((a) => /^["']?s\//.test(a));
    if (!exprRaw) return [line("sed: usage: sed [options] 's/old/new/[g]' FILE", c.err)];
    const expr = strip(exprRaw);
    const m = expr.match(/^s\/([\s\S]*?)\/([\s\S]*?)\/(g|gi)?$/);
    if (!m) return [line("sed: unsupported expression (this sim supports s/old/new/g)", c.err)];
    const [, from, to, mod] = m;
    const fileArg = strip(args[args.indexOf(exprRaw) + 1] || "");
    if (!fileArg) return [line("sed: no input file", c.err)];
    const segs = this.resolvePath(fileArg);
    const node = segs && this.nodeAt(segs);
    if (!node || node.type !== "file") return [line(`sed: can't read ${fileArg}: No such file or directory`, c.err)];
    const src = node.content || "";
    const re = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), mod ? (mod.includes("i") ? "gi" : "g") : "");
    const result = src.replace(re, to);
    if (edit) {
      node.content = result;
      node.size = result.length;
      this.sedReplaced.add("/" + segs!.join("/"));
      return [];
    }
    return result.split("\n").map((tx) => line(tx));
  }

  private chgrp(pos: string[]): OutLine[] {
    if (pos.length < 2) return [line("chgrp: missing operand", c.err)];
    const segs = this.resolvePath(pos[1]);
    const node = segs && this.nodeAt(segs);
    if (!node) return [line(`chgrp: cannot access '${pos[1]}': No such file or directory`, c.err)];
    node.group = pos[0];
    return [];
  }

  private aptCache(pos: string[]): OutLine[] {
    const sub = pos[0];
    if (sub !== "search") return [line("apt-cache: try  apt-cache search <name>", c.dim)];
    this.aptSearched = true;
    const q = (pos[1] || "").toLowerCase();
    const catalog: Record<string, [string, string][]> = {
      git: [
        ["git", "fast, scalable, distributed revision control system"],
        ["git-core", "transitional package for git"],
      ],
      hydra: [
        ["hydra", "very fast network logon cracker"],
        ["hydra-gtk", "graphical frontend for hydra"],
      ],
      nmap: [["nmap", "the Network Mapper"]],
      apache2: [["apache2", "Apache HTTP Server"]],
    };
    const rows = catalog[q] || (q ? catalog[q.split("-")[0]] : undefined);
    if (!rows) return [line("(no packages matched)", c.dim)];
    return rows.map(([n, d]) => line(`${n} - ${d}`));
  }

  private aptGet(pos: string[], _flags: string): OutLine[] {
    const sub = pos[0];
    const pkg = pos[1];
    if (sub === "update") {
      this.aptUpdated = true;
      return [
        line("Get:1 http://kali.hackforge.lab/kali kali-rolling InRelease [41.2 kB]", c.info),
        line("Get:2 http://kali.hackforge.lab/kali kali-rolling/main amd64 Packages [19.8 MB]", c.dim),
        line("Get:3 http://kali.hackforge.lab/kali kali-rolling/non-free amd64 Packages [166 kB]", c.dim),
        line("Fetched 20.0 MB in 3s (6,112 kB/s)", c.dim),
        line("Reading package lists... Done", c.ok),
      ];
    }
    if (sub === "upgrade") {
      this.aptUpgraded = true;
      return [
        line("Reading package lists... Done", c.dim),
        line("Calculating upgrade... Done", c.dim),
        line("The following packages have been kept back:", c.dim),
        line("  linux-headers-amd64", c.dim),
        line("0 upgraded, 0 newly installed, 0 to remove and 1 not upgraded.", c.ok),
      ];
    }
    if (sub === "install" && pkg) {
      this.installedPkgs.add(pkg);
      this.removedPkgs.delete(pkg);
      this.purgedPkgs.delete(pkg);
      return [
        line("Reading package lists... Done", c.dim),
        line(`The following NEW packages will be installed: ${pkg}`, c.dim),
        line(`Setting up ${pkg} (${pkg === "git" ? "1:2.39-1" : pkg === "hydra" ? "9.5-1" : "1.0-1"}) ...`, c.ok),
      ];
    }
    if (sub === "remove" && pkg) {
      this.removedPkgs.add(pkg);
      return [
        line("Reading package lists... Done", c.dim),
        line(`The following packages will be REMOVED: ${pkg}`, c.dim),
        line(`Removing ${pkg} ...`, c.ok),
      ];
    }
    if (sub === "purge" && pkg) {
      this.purgedPkgs.add(pkg);
      this.removedPkgs.add(pkg);
      return [
        line("Reading package lists... Done", c.dim),
        line(`The following packages will be REMOVED: ${pkg}* and its configuration files`, c.dim),
        line(`Purging configuration files for ${pkg} ...`, c.ok),
      ];
    }
    return [line("apt-get: try  apt-get install|remove|purge <pkg>  |  apt-get update|upgrade", c.dim)];
  }

  private nano(file?: string): OutLine[] {
    if (!file) return [line("GNU nano 7.2   (sim) — usage: nano FILE", c.dim)];
    const segs = this.resolvePath(file);
    let node = segs && this.nodeAt(segs);
    if (!node && segs) {
      // nano creates a new empty file on open
      this.writeFileAbs(segs, "", false);
      node = this.nodeAt(segs);
    }
    if (!node) return [line(`nano: cannot open ${file}`, c.err)];
    this.nanoOpened.add("/" + segs!.join("/"));
    const body = (node.content || "").split("\n").slice(0, 8).map((tx) => line(tx));
    return [
      line(`  GNU nano 7.2        ${file}        `, c.ember),
      ...body,
      line("^G Get Help  ^O Write Out  ^X Exit", c.info),
      line("(sim) editor opened read-style; use echo/sed to modify files in this sandbox.", c.dim),
    ];
  }

  private iwconfig(): OutLine[] {
    return [
      line("lo        no wireless extensions.", c.dim),
      line("eth0      no wireless extensions.", c.dim),
      line("wlan0     IEEE 802.11  ESSID:\"HackForge-5G\"  Mode:Managed", c.info),
      line("          Bit Rate=433.3 Mb/s  Tx-Power=20 dBm", c.dim),
    ];
  }

  private dhclient(iface?: string): OutLine[] {
    const dev = iface || "eth0";
    this.dhcpDone = true;
    this.eth0.ip = "10.10.10.13";
    this.eth0.up = true;
    this.ipChanged = false;
    return [
      line(`DHCPDISCOVER on ${dev} to 255.255.255.255 port 67 interval 3`, c.dim),
      line("DHCPREQUEST for 10.10.10.13 on " + dev + " to 255.255.255.255 port 67", c.dim),
      line("DHCPOFFER of 10.10.10.13 from 10.10.10.1", c.info),
      line("DHCPACK of 10.10.10.13 from 10.10.10.1", c.ok),
      line("bound to 10.10.10.13 -- renewal in 1592 seconds.", c.ok),
    ];
  }

  private psList(): { pid: number; name: string; cpu: string; mem: string; state: string }[] {
    const rows = PROC_TABLE.filter((p) => !this.killedPids.has(p.pid));
    if ((this.serviceStates.apache2 || "").startsWith("active")) rows.push({ pid: 8021, name: "apache2", cpu: "0.0", mem: "0.9", state: "S" });
    if ((this.serviceStates.mysql || "").startsWith("active")) rows.push({ pid: 889, name: "mysqld", cpu: "0.1", mem: "3.4", state: "S" });
    if ((this.serviceStates.cron || "").startsWith("active")) rows.push({ pid: 731, name: "cron", cpu: "0.0", mem: "0.1", state: "S" });
    if ((this.serviceStates.ssh || "").startsWith("active")) rows.push({ pid: 640, name: "sshd", cpu: "0.0", mem: "0.2", state: "S" });
    return rows;
  }

  private ps(args: string[]): OutLine[] {
    this.psRan = true;
    const hasAux = args.some((a) => /^(aux|-aux|-[au]+)$/.test(a));
    if (hasAux) {
      this.psAux = true;
      const head = line("USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND", c.dim);
      const rows = this.psList().map((p) =>
        line(
          `root    ${String(p.pid).padStart(7)}  ${p.cpu}  ${p.mem}  12300  ${String(3000 + p.pid).padStart(6)} ?        ${p.state.padEnd(10)} 00:00   0:00 ${p.name}`
        )
      );
      return [head, ...rows];
    }
    return [
      line("    PID TTY          TIME CMD", c.dim),
      line(`   3120 pts/0    00:00:00 bash`),
      line(`   ${String(7200 + this.commandsRun)} pts/0    00:00:00 ps`),
    ];
  }

  private topOut(): OutLine[] {
    return [
      line("top - 14:12:03 up 1:42,  1 user,  load average: 0.13, 0.28, 0.62", c.dim),
      line("Tasks:  14 total,   1 running,  13 sleeping", c.info),
      line("%Cpu(s):  0.7 us,  0.3 sy,  0.0 ni, 98.9 id", c.info),
      line("  PID USER      PR  NI    VIRT    RES  %CPU %MEM     S COMMAND", c.dim),
      ...this.psList()
        .slice(0, 8)
        .map((p) => line(`${String(p.pid).padStart(6)} root       20   0   90000  12000 ${p.cpu.padStart(4)} ${p.mem.padStart(4)}     ${p.state[0]} ${p.name}`)),
      line("(refreshes periodically in a real top — 'q' to quit; static in this sim)", c.dim),
    ];
  }

  private nice(args: string[]): OutLine[] {
    // nice -n -10 nano notes.txt   (the value can itself start with '-')
    const nIdx = args.indexOf("-n");
    if (nIdx < 0 || args[nIdx + 1] === undefined) return [line("usage: nice -n NUM COMMAND", c.err)];
    this.niceRan = true;
    this.niceValue = args[nIdx + 1];
    const cmd = args.slice(nIdx + 2).join(" ");
    return [line(`${cmd}: started with niceness ${args[nIdx + 1]}`, c.dim)];
  }

  private renice(pos: string[]): OutLine[] {
    // renice 20 6242   or   renice +5 -p 6242
    const pid = pos.find((p) => /^\d{3,}$/.test(p) && Number(p) > 100);
    const prio = pos.find((p) => /^\+?-?\d{1,2}$/.test(p));
    if (!pid || prio === undefined) return [line("usage: renice PRIORITY PID", c.err)];
    this.reniceRan = true;
    this.renicedPid = pid;
    return [line(`${pid} (process ID) old priority 0, new priority ${prio.replace("+", "")}`, c.ok)];
  }

  private killProc(pos: string[], flags: string): OutLine[] {
    // kill -1 6242 | kill -9 5123 | kill 6242
    const pid = pos[0] || "";
    if (!pid) return [line("kill: usage: kill [-SIGNAL] PID", c.err)];
    const sig = flags || "15";
    this.killed.add(`${sig}:${pid}`);
    if (sig === "9") this.killed.add(`any:${pid}`);
    if (/^\d+$/.test(pid)) this.killedPids.add(Number(pid));
    return [line(`sent signal ${sig} to ${pid} ${sig === "9" ? "(SIGKILL — forced)" : sig === "1" ? "(SIGHUP — hangup/reload)" : "(SIGTERM)"}`, c.dim)];
  }

  private fg(idOrPid?: string): OutLine[] {
    if (!idOrPid) return [line("fg: usage: fg %JOBID or fg PID", c.err)];
    const clean = idOrPid.replace("%", "");
    const j = this.jobs.find((jj) => String(jj.id) === clean || String(jj.pid) === clean) || this.jobs[this.jobs.length - 1];
    if (!j) return [line(`fg: ${idOrPid}: no such job`, c.err)];
    this.fgUsed = true;
    this.jobs = this.jobs.filter((jj) => jj !== j);
    return [line(`fg %${j.id}`), line(`${j.cmd} — now running in the foreground.`, c.ok)];
  }

  private atCmd(pos: string[]): OutLine[] {
    const time = pos[0];
    if (!time) return [line("at: usage: at TIME  (e.g. at 9:00pm)", c.err)];
    const jobCmd = pos.slice(1).join(" ");
    if (!jobCmd) {
      // Real `at` drops you into its own "at>" prompt to type the command.
      this.awaitingAtJob = time;
      return [
        line("warning: commands will be executed using /bin/sh", c.dim),
        line(`job 12 at Sat Oct 03 ${time} 2026`, c.ok),
        line("at>  (type the command to schedule, then Enter)", c.info),
      ];
    }
    this.atScheduled = true;
    this.atJobs.push({ time, cmd: jobCmd });
    return [line(`job 12 at Sat Oct 03 ${time} 2026`, c.ok), line(`scheduled: ${jobCmd}`, c.dim)];
  }

  private service(pos: string[]): OutLine[] {
    const name = pos[0];
    const action = pos[1];
    if (!name || !action) return [line("Usage: service <name> <action|status>", c.err)];
    if (!(name in this.serviceStates)) return [line(`service: ${name}: unrecognized service`, c.err)];
    const run = "active (running)";
    const dead = "inactive (dead)";
    switch (action) {
      case "start":
        this.serviceStates[name] = run;
        return [line(`● ${name}.service - ${name} (HackForge sim)`, c.dim), line(`   Active: ${this.serviceStates[name]} since just now; 0s ago`, c.ok)];
      case "stop":
        this.serviceStates[name] = dead;
        return [line(`● ${name}.service - ${name} (HackForge sim)`, c.dim), line(`   Active: ${this.serviceStates[name]}`, c.err)];
      case "restart":
        this.serviceStates[name] = run;
        return [line(`● ${name}.service - ${name}`, c.dim), line("   Active: active (running) since just now (restarted)", c.ok)];
      case "status": {
        const st = this.serviceStates[name];
        return [
          line(`● ${name}.service - ${name} (HackForge sim)`, c.dim),
          line(`   Active: ${st}`, st.startsWith("active") ? c.ok : c.err),
        ];
      }
      default:
        return [line(`service: ${action || "?"}: unsupported action — start|stop|restart|status`, c.err)];
    }
  }

  private crontab(args: string[]): OutLine[] {
    if (args.includes("-l")) {
      this.cronListed = true;
      const f = this.fileContent("/etc/crontab") || "";
      return [
        line("# HackForge crontab (sim) — m h dom mon dow user command", c.dim),
        ...f.split("\n").filter(Boolean).map((tx) => line(tx)),
      ];
    }
    if (args.includes("-e")) {
      this.cronEdited = true;
      return [
        line("Select an editor.  To change later, run 'select-editor'.", c.dim),
        line("  1. /bin/nano        <---- easiest", c.info),
        line("  2. /usr/bin/vim.basic", c.dim),
        line("  3. /usr/bin/vim.tiny", c.dim),
        line("Choose 1-3 [1]: 1  →  /etc/crontab opened in nano (sim)", c.dim),
        line("(sim) append a schedule with:", c.dim),
        line(`  echo "55 23 * * * operator /home/operator/scanner.sh" >> /etc/crontab`, c.info),
        line("  then verify with:  crontab -l", c.info),
      ];
    }
    return [line("crontab: usage: crontab -l (list) | crontab -e (edit)", c.dim)];
  }

  private updateRc(pos: string[]): OutLine[] {
    const name = pos[0];
    const action = pos[1] || "defaults";
    if (!name) return [line("update-rc.d: usage: update-rc.d <service> defaults|enable|disable|remove", c.err)];
    if (!this.fileContent(`/etc/init.d/${name}`)) return [line(`update-rc.d: /etc/init.d/${name}: file not found`, c.err)];
    this.rcAdded.add(`${name}:${action}`);
    const remove = action === "remove" || action === "disable";
    const linkName = remove ? `K01${name}` : `S01${name}`;
    // Materialize the boot links in the runlevel directories so `ls /etc/rc3.d`
    // shows exactly what the tool claims to have done.
    for (const rl of ["rc2.d", "rc3.d", "rc4.d", "rc5.d"]) {
      const dirNode = this.mkdirTree(["etc", rl]);
      if (!dirNode || !dirNode.children) continue;
      for (const old of Object.keys(dirNode.children)) if (old.endsWith(name)) delete dirNode.children[old];
      if (!remove) dirNode.children[linkName] = { type: "file", content: `#!/bin/sh\n# HackForge sim: boot link → /etc/init.d/${name}\n`, perms: "rwxr-xr-x", owner: "root", group: "root", size: 40 };
    }
    return [
      line(`update-rc.d: ${name} ${action}`, c.dim),
      remove
        ? line(`Removing autostart links for /etc/init.d/${name} (runlevels 2 3 4 5)`, c.warn)
        : line(`Adding autostart links for /etc/init.d/${name} (runlevels 2 3 4 5)`, c.ok),
    ];
  }

  // Create a directory path (and its parents) inside the VFS; returns the node.
  private mkdirTree(segs: string[]): FileNode | null {
    let node: FileNode = this.fs;
    for (const s of segs) {
      if (node.type !== "dir" || !node.children) return null;
      if (!node.children[s]) node.children[s] = { type: "dir", children: {}, perms: "rwxr-xr-x", owner: "root", group: "root", size: 4096 };
      node = node.children[s];
    }
    return node;
  }

  private ftp: { stage: "name" | "pass" | "cmd"; cwd: string[]; host: string } | null = null;

  private ftpConnect(host?: string): OutLine[] {
    if (!host) return [line("usage: ftp <host>", c.err)];
    const ip = DOMAIN_IPS[host] || resolve(host);
    if (!ip || !NETWORK[ip]) return [line(`ftp: ${host}: Name or service not known`, c.err)];
    this.ftp = { stage: "name", cwd: [], host };
    return [
      line(`Trying ${ip}...`, c.dim),
      line(`Connected to ${host}.`, c.ok),
      line("220 HackForge FTP server ready.", c.info),
      line(`Name (${host}:operator):`, c.dim),
    ];
  }

  private ftpInput(input: string): OutLine[] {
    const ftp = this.ftp!;
    if (ftp.stage === "name") {
      ftp.stage = "pass";
      return [line("331 Please specify the password."), line("Password:", c.dim)];
    }
    if (ftp.stage === "pass") {
      ftp.stage = "cmd";
      return [line("230 Login successful (anonymous read-only access).", c.ok), line("Remote system type is UNIX."), line("Using binary mode to transfer files.", c.dim)];
    }
    const [cmd, ...rest] = input.split(/\s+/);
    const arg = rest.join(" ");
    const key = ftp.cwd.join("/");
    switch (cmd) {
      case "ls":
      case "dir": {
        const entries = FTP_TREE[key] || [];
        return entries.map((e) => line(e, c.info));
      }
      case "pwd":
        return [line(`257 "/${key}" is the current directory`, c.info)];
      case "cd": {
        const entries = FTP_TREE[key] || [];
        const t = (arg || "").replace(/\/+$/, "");
        if (t === ".." ) {
          ftp.cwd.pop();
          return [line("250 Directory successfully changed.", c.ok)];
        }
        if (entries.includes(t + "/")) {
          ftp.cwd.push(t);
          return [line("250 Directory successfully changed.", c.ok)];
        }
        return [line(`550 Failed to change directory: ${arg}`, c.err)];
      }
      case "get": {
        const path = [...ftp.cwd, arg].join("/");
        if (!(path in FTP_FILES)) return [line(`550 ${arg}: No such file`, c.err)];
        const segs = [...this.cwd, arg];
        this.writeFileAbs(segs, FTP_FILES[path] + "\n", false);
        this.ftpGot.add(arg);
        return [
          line(`local randi: ${arg}  remote: /${path}`, c.dim),
          line("150 Opening BINARY mode data connection for " + arg + ".", c.dim),
          line("226 Transfer complete — saved to your local home directory.", c.ok),
        ];
      }
      case "bye":
      case "quit":
      case "exit": {
        const got = this.ftpGot.size > 0;
        this.ftpDone = this.ftpDone || got;
        this.ftp = null;
        return [line("221 Goodbye.", c.ok)];
      }
      case "help":
        return [line("Commands: ls, cd <dir>, pwd, get <file>, bye", c.dim)];
      default:
        return [line(`?Invalid command '${cmd}' — try help`, c.err)];
    }
  }

  // Run a shell script: must exist, and (for ./script) be executable.
  private runScript(path: string | undefined, needExec: boolean): OutLine[] {
    if (!path) return [line("usage: ./script.sh  or  sh script.sh", c.err)];
    const segs = this.resolvePath(path);
    const node = segs && this.nodeAt(segs);
    if (!node || node.type !== "file") return [line(`bash: ${path}: No such file or directory`, c.err)];
    if (needExec && !(node.perms.includes("x") || node.setuid)) {
      return [line(`bash: ${path}: Permission denied — make it executable: chmod +x ${path}`, c.err)];
    }
    this.ranScripts.add("/" + segs!.join("/"));
    const lines = (node.content || "")
      .split("\n")
      .map((l) => l.trim())
      .filter((ll) => ll && !ll.startsWith("#"));
    return this.execScriptLines(lines);
  }

  private execScriptLines(lines: string[]): OutLine[] {
    const out: OutLine[] = [];
    const rest = [...lines];
    while (rest.length) {
      const l = rest.shift()!;
      const echoM = l.match(/^echo\s+(["']?)([\s\S]*)\1$/);
      const readM = l.match(/^read\s+([A-Za-z_][A-Za-z0-9_]*)/);
      if (echoM) {
        const txt = echoM[2].replace(/\$\{?([A-Za-z_][A-Za-z0-9_]*)\}?/g, (_m, v) => this.vars[v] ?? `$${v}`);
        out.push(line(txt, c.ok));
      } else if (readM) {
        this.awaitingRead = readM[1];
        this.scriptQueue = rest;
        return out; // pause — next input line becomes the variable's value
      } else if (/^(exit|cd\b)/.test(l)) {
        continue;
      } else if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(l)) {
        // in-script variable assignment: NAME=value
        const eq = l.indexOf("=");
        this.vars[l.slice(0, eq)] = l.slice(eq + 1).replace(/^["']|["']$/g, "");
      } else {
        const expanded = l.replace(/\$\{?([A-Za-z_][A-Za-z0-9_]*)\}?/g, (_m, v) => this.vars[v] ?? "");
        out.push(...this.execPipeline(expanded));
      }
    }
    return out;
  }
}

// All commands available for tab completion.
export const COMMANDS = [
  "help", "clear", "cls", "pwd", "whoami", "id", "hostname", "echo", "date", "history",
  "ls", "cd", "cat", "less", "more", "head", "tail", "bat", "mkdir", "rmdir", "touch", "rm", "cp", "mv",
  "find", "grep", "chmod", "chown", "chgrp", "sudo", "man",
  "nl", "sed", "nano", "locate", "whereis", "which", "cut", "sort", "uniq",
  "apt-cache", "apt-get",
  "ip", "ifconfig", "iwconfig", "dhclient", "ping", "netstat", "ss", "nslookup", "host", "resolvectl", "dig", "whois",
  "ps", "top", "nice", "renice", "kill", "jobs", "fg", "at",
  "env", "set", "export", "unset",
  "service", "crontab", "update-rc.d",
  "ftp", "bash", "sh", "git",
  "nmap", "hydra", "curl", "sqlmap", "ssh", "exit",
];

function longestCommonPrefix(arr: string[]): string {
  if (!arr.length) return "";
  let prefix = arr[0];
  for (const s of arr) {
    while (!s.startsWith(prefix)) prefix = prefix.slice(0, -1);
    if (!prefix) return "";
  }
  return prefix;
}

// helpers
function octalToPerms(oct: string): string {
  const map = ["---", "--x", "-w-", "-wx", "r--", "r-x", "rw-", "rwx"];
  return oct.split("").map((d) => map[parseInt(d, 10)]).join("");
}
function renderPerms(f: FileNode): string {
  if (!f.setuid && !f.setgid) return f.perms;
  return f.perms
    .split("")
    .map((ch, i) => {
      if (f.setuid && i === 2) return ch === "x" ? "s" : "S";
      if (f.setgid && i === 5) return ch === "x" ? "s" : "S";
      return ch;
    })
    .join("");
}
function applySymbolic(perms: string, clause: string): string {
  // clause like: a+x, go-rwx, u=rw, o=, +x
  const op = clause.includes("+") ? "+" : clause.includes("-") ? "-" : "=";
  const who = clause.match(/^[ugoa]*/)?.[0] || "";
  const bit = clause.slice(clause.indexOf(op) + 1); // rwx portion (may be empty for '=')
  const applyWho = who === "" || who === "a" ? ["u", "g", "o"] : who.split("");
  const p = perms.split("");
  const chars = ["r", "w", "x"];
  for (const w of applyWho) {
    const base = w === "u" ? 0 : w === "g" ? 3 : 6;
    for (let i = 0; i < 3; i++) {
      const has = bit.includes(chars[i]);
      if (op === "+") {
        if (has) p[base + i] = chars[i];
      } else if (op === "-") {
        if (has) p[base + i] = "-";
      } else {
        // '=' sets exactly the listed bits, clears the rest
        p[base + i] = has ? chars[i] : "-";
      }
    }
  }
  return p.join("");
}
