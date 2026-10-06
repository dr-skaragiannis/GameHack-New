import { applyRedirect, handleSudoRun, splitPipes } from "./sudorun";
import { handleDfirCommand } from "./dfir";
export { splitPipes };

export type FileNode = {
  name: string;
  type: "dir" | "file";
  content?: string;
  mode?: string;
  owner?: string;
  group?: string;
  children?: Record<string, FileNode>;
};

export type Proc = {
  pid: number;
  user: string;
  cpu: string;
  mem: string;
  cmd: string;
  nice: number;
  alive: boolean;
};

export type TermLine = { kind: "in" | "out" | "err" | "ok" | "sys"; text: string };

export type HostInfo = {
  ip: string;
  hostname: string;
  ports: { port: number; proto: string; service: string; version: string; state: string }[];
  os?: string;
};

export type Terminal = {
  user: string;
  host: string;
  cwd: string;
  ran: string[];
  history: string[];
  lines: TermLine[];
  fs: FileNode;
  env: Record<string, string>;
  flags: Set<string>;
  filesRead: string[];
  hosts: HostInfo[];
  creds: { user: string; pass: string; service: string }[];
  isRoot: boolean;
  lastExit: number;
  scenario: string;
  net: { ip: string; mask: string; bcast: string; mac: string; up: boolean };
  procs: Proc[];
  jobs: { pid: number; cmd: string }[];
  services: Record<string, "running" | "stopped" | "inactive">;
  packages: Set<string>;
  ftp: { host: string; user: string | null; cwd: string } | null;
  crontab: string[];
};

export function dir(name: string, children: FileNode[] = [], mode = "drwxr-xr-x", owner = "root", group = "root"): FileNode {
  const map: Record<string, FileNode> = {};
  for (const c of children) map[c.name] = c;
  return { name, type: "dir", mode, owner, group, children: map };
}

export function file(name: string, content: string, mode = "-rw-r--r--", owner = "root", group = "root"): FileNode {
  return { name, type: "file", content, mode, owner, group };
}

export function defaultFS(): FileNode {
  return dir("/", [
    dir("home", [
      dir("operator", [
        file("welcome.txt", "Welcome to HACKFORGE, operator.\nYour home is /home/operator.\nTry `help` if you get lost.\n"),
        file("notes.txt", "TODO:\n- enumerate the lab network 10.10.10.0/24\n- check hidden files with ls -a\n- never test systems you don't own\n"),
        file(".secret", "FLAG{hidden_in_plain_sight}\nRemember: files starting with a dot are hidden from a plain `ls`.\n", "-rw-------"),
        file(".bash_history", "whoami\npwd\nls -la\ncat notes.txt\n"),
        dir("documents", [
          file("readme.md", "# Operator notes\nKeep your findings here.\nThe ethics oath still applies outside this lab.\n"),
          file("credentials.txt", "labuser:labpass123  (training only — simulated)\n"),
        ]),
        dir("tools", [
          file("wordlist.txt", "admin\npassword\n123456\noperator\nlabpass123\nraven\nnevermore\n"),
          file("targets.txt", "10.10.10.5 raven.lab\n10.10.10.8 web.lab\n10.10.10.12 ssh.lab\n10.10.10.21 db.lab\n"),
        ]),
        dir("labs", [file(".keep", "")]),
      ]),
    ]),
    dir("etc", [
      file("hostname", "kali\n"),
      file(
        "passwd",
        "root:x:0:0:root:/root:/bin/bash\noperator:x:1000:1000:Operator:/home/operator:/bin/bash\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nmysql:x:27:27:MySQL Server:/nonexistent:/bin/false\nraven:x:1001:1001:Raven:/home/raven:/bin/bash\n"
      ),
      file("hosts", "127.0.0.1 localhost\n10.10.10.5 raven.lab\n10.10.10.8 web.lab\n10.10.10.12 ssh.lab\n10.10.10.21 db.lab\n"),
      file("shadow", "root:*:19000:0:99999:7:::\noperator:*:19000:0:99999:7:::\n", "-rw-------"),
      file("issue", "HACKFORGE Training OS 1.0 — simulated Kali\nUnauthorized access is a crime. This is a sandbox.\n"),
      dir("ssh", [file("sshd_config", "Port 22\nPermitRootLogin no\nPasswordAuthentication yes\nPubkeyAuthentication yes\n")]),
    ]),
    dir("var", [
      dir("log", [
        file(
          "auth.log",
          "Apr 12 09:01:11 kali sshd[1021]: Accepted password for operator from 10.10.10.1 port 51222\nApr 12 09:14:02 kali sudo: operator : TTY=pts/0 ; PWD=/home/operator ; USER=root ; COMMAND=/usr/bin/id\n"
        ),
        file("syslog", "Apr 12 08:00:01 kali systemd[1]: Started HACKFORGE lab services.\n"),
      ]),
      dir("www", [
        dir("html", [
          file("index.html", "<html><body><h1>Forge CMS</h1><p>Login at /login.php</p></body></html>\n"),
          file(
            "login.php",
            "<?php /* simulated */ $user=$_POST['user']; $pass=$_POST['pass']; /* vulnerable to SQLi in this lab only */ ?>\n"
          ),
        ]),
      ]),
    ]),
    dir("tmp", [file(".keep", "")]),
    dir("root", [file("flag.txt", "FLAG{root_of_the_forge}\n", "-rw-------")], "drwx------"),
    dir("opt", [
      dir("raven", [
        file("user.txt", "FLAG{raven_foothold}\n"),
        file("todo.txt", "Move the web backup off this box.\nCheck /var/www/html.\n"),
      ]),
    ]),
    dir("usr", [
      dir("bin", []),
      dir("share", [
        dir("wordlists", [file("rockyou-mini.txt", "password\n123456\nadmin\nletmein\nraven\nnevermore\nqwerty\nlabpass123\n")]),
      ]),
    ]),
  ]);
}

export function ravenFS(): FileNode {
  return dir("/", [
    dir("home", [
      dir("raven", [
        file("user.txt", "FLAG{raven_user_nevermore}\n"),
        file("note.txt", "Stephanie, the CMS backup is in /var/backups/cms.sql — rotate it.\nSSH key leftover in .ssh/\n"),
        dir(".ssh", [
          file("id_rsa", "-----BEGIN OPENSSH PRIVATE KEY-----\nSIMULATED-KEY-DO-NOT-USE\n-----END OPENSSH PRIVATE KEY-----\n", "-rw-------"),
          file("authorized_keys", "ssh-rsa AAAFAKE raven@raven.lab\n"),
        ]),
      ]),
      dir("operator", [file("welcome.txt", "You pivoted onto raven.lab. Stay ethical.\n")]),
    ]),
    dir("var", [
      dir("www", [
        dir("html", [
          file("index.php", "<?php echo 'Raven CMS v1.2'; ?>\n"),
          file("config.php", "<?php $db_user='raven'; $db_pass='nevermore'; $db_name='ravencms'; ?>\n"),
          file("login.php", "<?php /* SQLi lab endpoint */ ?>\n"),
        ]),
      ]),
      dir("backups", [file("cms.sql", "-- dump\nINSERT INTO users VALUES (1,'admin','FLAG{raven_web_dump}');\n")]),
      dir("log", [file("apache2/access.log", "10.10.10.1 - - [12/Apr] \"GET /login.php?id=1' HTTP/1.1\" 500\n")]),
    ]),
    dir("etc", [
      file("hostname", "raven\n"),
      file("passwd", "root:x:0:0:root:/root:/bin/bash\nraven:x:1001:1001::/home/raven:/bin/bash\nwww-data:x:33:33::/var/www:/usr/sbin/nologin\n"),
      file("crontab", "* * * * * root /usr/local/bin/backup.sh\n"),
    ]),
    dir("usr", [
      dir("local", [
        dir("bin", [
          file(
            "backup.sh",
            "#!/bin/bash\n# world-writable backup script — privesc vector (simulated)\ncp -r /var/www/html /var/backups/\n",
            "-rwxrwxrwx"
          ),
        ]),
      ]),
    ]),
    dir("root", [file("root.txt", "FLAG{raven_rooted_the_nevermore}\n", "-rw-------")], "drwx------"),
    dir("tmp", []),
  ]);
}

export function sshFS(): FileNode {
  return dir("/", [
    dir("home", [
      dir("operator", [
        file("jump.txt", "Bastion 10.10.20.2 (jump.lab)\nDev 10.10.20.14 (dev.lab) — key auth only\ndb-int 10.10.20.30 — reachable from dev only\n"),
        dir(".ssh", [
          file("id_ed25519", "-----BEGIN OPENSSH PRIVATE KEY-----\nSIMULATED-OPERATOR-KEY\n-----END OPENSSH PRIVATE KEY-----\n", "-rw-------"),
          file("config", "Host jump\n  HostName 10.10.20.2\n  User operator\nHost dev\n  HostName 10.10.20.14\n  User dev\n  ProxyJump jump\n"),
        ]),
        file("id_dev", "-----BEGIN OPENSSH PRIVATE KEY-----\nSIMULATED-DEV-KEY\n-----END OPENSSH PRIVATE KEY-----\n", "-rw-------"),
      ]),
    ]),
    dir("etc", [
      file("hostname", "kali\n"),
      file("hosts", "10.10.20.2 jump.lab\n10.10.20.14 dev.lab\n10.10.20.30 db-int.lab\n"),
    ]),
    dir("tmp", [file("flag-hop.txt", "FLAG{ssh_proxyjump_ok}\n")]),
    dir("opt", [file("tunnel.flag", "FLAG{ssh_local_forward}\n")]),
  ]);
}

const DEFAULT_HOSTS: HostInfo[] = [
  {
    ip: "10.10.10.5",
    hostname: "raven.lab",
    os: "Linux 5.10",
    ports: [
      { port: 22, proto: "tcp", service: "ssh", version: "OpenSSH 8.4p1", state: "open" },
      { port: 80, proto: "tcp", service: "http", version: "Apache 2.4.51 (RavenCMS)", state: "open" },
      { port: 111, proto: "tcp", service: "rpcbind", version: "2-4", state: "open" },
    ],
  },
  {
    ip: "10.10.10.8",
    hostname: "web.lab",
    os: "Linux 5.15",
    ports: [
      { port: 22, proto: "tcp", service: "ssh", version: "OpenSSH 8.9", state: "open" },
      { port: 80, proto: "tcp", service: "http", version: "nginx 1.18.0", state: "open" },
      { port: 443, proto: "tcp", service: "https", version: "nginx 1.18.0", state: "open" },
      { port: 3306, proto: "tcp", service: "mysql", version: "MySQL 5.7", state: "filtered" },
    ],
  },
  {
    ip: "10.10.10.12",
    hostname: "ssh.lab",
    os: "Linux 5.4",
    ports: [{ port: 22, proto: "tcp", service: "ssh", version: "OpenSSH 7.9", state: "open" }],
  },
  {
    ip: "10.10.10.21",
    hostname: "db.lab",
    os: "Linux 5.10",
    ports: [
      { port: 22, proto: "tcp", service: "ssh", version: "OpenSSH 8.2", state: "filtered" },
      { port: 3306, proto: "tcp", service: "mysql", version: "MariaDB 10.5", state: "open" },
    ],
  },
  {
    ip: "10.10.20.2",
    hostname: "jump.lab",
    os: "Linux 5.15",
    ports: [{ port: 22, proto: "tcp", service: "ssh", version: "OpenSSH 8.9", state: "open" }],
  },
  {
    ip: "10.10.20.14",
    hostname: "dev.lab",
    os: "Linux 5.15",
    ports: [{ port: 22, proto: "tcp", service: "ssh", version: "OpenSSH 8.9", state: "open" }],
  },
  {
    ip: "10.10.20.30",
    hostname: "db-int.lab",
    os: "Linux 5.10",
    ports: [
      { port: 22, proto: "tcp", service: "ssh", version: "OpenSSH 8.2", state: "filtered" },
      { port: 5432, proto: "tcp", service: "postgresql", version: "14.5", state: "open" },
    ],
  },
];

function defaultProcs(): Proc[] {
  return [
    { pid: 1, user: "root", cpu: "0.0", mem: "0.1", cmd: "/sbin/init", nice: 0, alive: true },
    { pid: 412, user: "root", cpu: "0.1", mem: "0.4", cmd: "sshd", nice: 0, alive: true },
    { pid: 880, user: "root", cpu: "1.2", mem: "2.1", cmd: "msfconsole", nice: 0, alive: true },
    { pid: 4378, user: "root", cpu: "8.4", mem: "6.2", cmd: "[zombie-lab]", nice: 5, alive: true },
    { pid: 6242, user: "root", cpu: "0.3", mem: "0.8", cmd: "/usr/bin/ssh-agent", nice: 0, alive: true },
    { pid: 9001, user: "root", cpu: "0.0", mem: "0.2", cmd: "cron", nice: 0, alive: true },
  ];
}

export function createTerminal(opts?: { fs?: FileNode; user?: string; host?: string; scenario?: string }): Terminal {
  const user = opts?.user || "operator";
  const isDfir = opts?.scenario === "dfir";
  const rooty = user === "root" || opts?.scenario === "sudorun";
  const account = isDfir ? "analyst" : rooty ? "root" : user;
  const home = isDfir ? "/cases/IR-2404" : rooty ? "/root" : "/home/operator";
  return {
    user: account,
    host: opts?.host || (isDfir ? "forensics-workstation" : "kali"),
    cwd: isDfir ? "/cases/IR-2404/evidence" : home,
    ran: [],
    history: [],
    lines: [
      { kind: "sys", text: "HACKFORGE simulated terminal — educational sandbox only." },
      { kind: "sys", text: "Type `help` for commands. Unauthorized access outside this lab is illegal." },
    ],
    fs: opts?.fs || defaultFS(),
    env: {
      HOME: home,
      USER: account,
      PATH: "/usr/local/bin:/usr/bin:/bin:/usr/sbin",
      HISTSIZE: "1000",
      SHELL: "/bin/bash",
    },
    flags: new Set(),
    filesRead: [],
    hosts: DEFAULT_HOSTS,
    creds: [
      { user: "labuser", pass: "labpass123", service: "ssh://10.10.10.12" },
      { user: "raven", pass: "nevermore", service: "ssh://10.10.10.5" },
      { user: "admin", pass: "admin' OR '1'='1", service: "http://10.10.10.8/login.php" },
      { user: "ignite", pass: "ignite", service: "ssh://192.168.0.11" },
    ],
    isRoot: rooty,
    lastExit: 0,
    scenario: opts?.scenario || "lab",
    net: { ip: "10.10.10.2", mask: "255.255.255.0", bcast: "10.10.10.255", mac: "08:00:27:12:34:56", up: true },
    procs: defaultProcs(),
    jobs: [],
    services: { apache2: "stopped", ssh: "stopped", cron: "inactive", mysql: "stopped" },
    packages: new Set(["git", "nmap", "hydra", "apache2", "cron", "openssh-server"]),
    ftp: null,
    crontab: ["# m h  dom mon dow   command", "17 * * * * root    cd / && run-parts --report /etc/cron.hourly"],
  };
}

export function normalize(path: string): string {
  const parts: string[] = [];
  for (const p of path.split("/")) {
    if (!p || p === ".") continue;
    if (p === "..") parts.pop();
    else parts.push(p);
  }
  return "/" + parts.join("/");
}

export function resolvePath(t: Terminal, p: string): string {
  if (!p || p === "~") return t.env.HOME || "/home/operator";
  if (p.startsWith("~/")) return normalize((t.env.HOME || "/home/operator") + p.slice(1));
  if (p.startsWith("/")) return normalize(p);
  return normalize(t.cwd + "/" + p);
}

export function getNode(root: FileNode, path: string): FileNode | null {
  const norm = normalize(path);
  if (norm === "/") return root;
  let cur: FileNode | undefined = root;
  for (const part of norm.split("/").filter(Boolean)) {
    if (!cur || cur.type !== "dir" || !cur.children) return null;
    cur = cur.children[part];
  }
  return cur || null;
}

export function parentAndName(path: string): { parent: string; name: string } {
  const norm = normalize(path);
  const i = norm.lastIndexOf("/");
  if (i <= 0) return { parent: "/", name: norm.slice(1) };
  return { parent: norm.slice(0, i), name: norm.slice(i + 1) };
}

function promptOf(t: Terminal): string {
  const home = t.env.HOME || "/home/operator";
  const short = t.cwd === home ? "~" : t.cwd.startsWith(home + "/") ? "~" + t.cwd.slice(home.length) : t.cwd;
  const sig = t.isRoot ? "#" : "$";
  return `${t.user}@${t.host}:${short}${sig}`;
}

function lsMode(n: FileNode): string {
  return n.mode || (n.type === "dir" ? "drwxr-xr-x" : "-rw-r--r--");
}

function canRead(t: Terminal, n: FileNode): boolean {
  const mode = lsMode(n);
  if (t.isRoot) return true;
  if (mode.includes("------") || mode.endsWith("------")) return false;
  if (n.mode === "-rw-------" && !t.isRoot) return false;
  if (n.mode === "drwx------" && !t.isRoot) return false;
  return true;
}

const HELP = `HACKFORGE lab commands (simulated):
  help                 this list
  clear                clear the screen
  whoami / id          current user
  pwd                  print working directory
  ls [-la] [path]      list files
  cd [dir]             change directory
  cat FILE             print file
  head/tail FILE       first/last lines
  grep PAT FILE        search file
  find PATH -name GLOB search tree
  echo TEXT            print text
  uname -a             system info
  hostname             host name
  history              command history
  env                  environment
  which CMD            locate command
  ping HOST            icmp echo (sim)
  ip addr / ifconfig   interfaces (sim)
  nmap [opts] TARGET   port scan (sim)
  curl URL             fetch (sim)
  hydra ...            password spray (sim)
  ssh user@host        remote login (sim)
  sudo -l / sudo su    privilege (sim)
  file / strings       identify type and printable clues
  md5sum / sha256sum   verify evidence identity (sim)
  xxd / hexedit        inspect / repair a virtual copy
  oleid / olevba       static Office triage
  tshark / volatility  packet and memory fixtures
  docker inspect/diff  container evidence fixtures
  timeline CASE        correlate case timestamps
  submit FLAG{...}     submit a captured flag
  man CMD              short manual

This is a SAFE simulation. Never run these techniques on systems you do not own.`;

function globToRe(glob: string): RegExp {
  const esc = glob.replace(/[.+^${}()|[\]\\]/g, "\\$&").replace(/\*/g, ".*").replace(/\?/g, ".");
  return new RegExp("^" + esc + "$");
}

function walk(node: FileNode, path: string, acc: { path: string; node: FileNode }[]) {
  acc.push({ path: path || "/", node });
  if (node.type === "dir" && node.children) {
    for (const [k, c] of Object.entries(node.children)) {
      walk(c, (path === "/" ? "" : path) + "/" + k, acc);
    }
  }
}

function findHost(t: Terminal, target: string): HostInfo | undefined {
  const clean = target.replace(/\/.*$/, "");
  return t.hosts.find((h) => h.ip === clean || h.hostname === clean || h.hostname === clean + ".lab");
}

export function parseArgs(raw: string): string[] {
  const out: string[] = [];
  let cur = "";
  let q: string | null = null;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (q) {
      if (ch === q) q = null;
      else cur += ch;
    } else if (ch === '"' || ch === "'") q = ch;
    else if (/\s/.test(ch)) {
      if (cur) out.push(cur);
      cur = "";
    } else cur += ch;
  }
  if (cur) out.push(cur);
  return out;
}

export function complete(t: Terminal, partial: string): string[] {
  const parts = partial.split(/\s+/);
  const last = parts[parts.length - 1] || "";
  if (parts.length <= 1) {
    const cmds = [
      "help",
      "clear",
      "whoami",
      "id",
      "pwd",
      "ls",
      "cd",
      "cat",
      "head",
      "tail",
      "grep",
      "find",
      "echo",
      "uname",
      "hostname",
      "history",
      "env",
      "which",
      "ping",
      "ip",
      "ifconfig",
      "nmap",
      "curl",
      "hydra",
      "ssh",
      "sudo",
      "submit",
      "man",
      "locate",
      "whereis",
      "chmod",
      "chown",
      "chgrp",
      "cp",
      "mv",
      "rm",
      "rmdir",
      "apt-get",
      "apt-cache",
      "dig",
      "ps",
      "top",
      "kill",
      "service",
      "crontab",
      "ftp",
      "sed",
      "nl",
      "file",
      "strings",
      "md5sum",
      "sha1sum",
      "sha256sum",
      "hashdeep",
      "hash-identifier",
      "xxd",
      "hexdump",
      "hexedit",
      "exiftool",
      "oleid",
      "olevba",
      "oleobj",
      "zsteg",
      "steghide",
      "audio-analyze",
      "tshark",
      "tcpdump",
      "wireshark",
      "ewfacquire",
      "ftkimager",
      "mmls",
      "fls",
      "mftecmd",
      "icat",
      "timeline",
      "memory-acquire",
      "static-report",
      "sandbox-report",
      "volatility",
      "docker",
      "reg",
      "sqlitebrowser",
      "evtx",
      "wevtutil",
      "LECmd",
      "john",
      "hashcat",
    ];
    return cmds.filter((c) => c.startsWith(last));
  }
  const base = last.includes("/") ? last.slice(0, last.lastIndexOf("/") + 1) : "";
  const rest = last.includes("/") ? last.slice(last.lastIndexOf("/") + 1) : last;
  const dirPath = resolvePath(t, base || ".");
  const node = getNode(t.fs, dirPath);
  if (!node || node.type !== "dir" || !node.children) return [];
  return Object.keys(node.children)
    .filter((n) => n.startsWith(rest))
    .map((n) => (base || "") + n + (node.children![n].type === "dir" ? "/" : ""));
}

let PIPE_STDIN: string | null = null;

export function runCommand(t: Terminal, raw: string, inner?: { capture?: boolean; stdin?: string | null }): TermLine[] {
  let input = raw.replace(/\s+$/, "");
  if (!input.trim()) return [];
  const capturing = !!inner?.capture;
  if (!capturing) {
    t.ran.push(input.trim());
    t.history.push(input.trim());
  }
  const out: TermLine[] = capturing ? [] : [{ kind: "in", text: `${promptOf(t)} ${input}` }];

  if (!capturing && /&\s*$/.test(input) && !input.trim().startsWith("nano") === false) {
    /* background handled in sudo handler too */
  }

  if (!capturing && input.includes("|") && !input.includes("||")) {
    const stages = splitPipes(input);
    let stdin = "";
    for (const st of stages) {
      const part = runCommand(t, st, { capture: true, stdin });
      stdin = part
        .filter((l) => l.kind === "out" || l.kind === "ok" || l.kind === "sys")
        .map((l) => l.text)
        .join("\n");
    }
    t.flags.add("pipe");
    if (/grep/.test(input)) t.flags.add("grep");
    if (/ifconfig/.test(input) && /grep/.test(input)) t.flags.add("grep-inet");
    if (/ps/.test(input) && /grep/.test(input)) t.flags.add("ps-grep");
    if (/locate/.test(input)) t.flags.add("locate");
    if (/find/.test(input)) t.flags.add("find");
    if (/set/.test(input) && /HISTSIZE/.test(input)) t.flags.add("grep-hist");
    for (const line of stdin.split("\n")) out.push({ kind: "out", text: line });
    t.lastExit = 0;
    return out;
  }

  const redir = input.match(/^(.*?)(>>?)(\s*)(\S+)$/);
  if (!capturing && redir && /echo|cat|printf/.test(redir[1]) && !redir[1].includes("|")) {
    const left = redir[1].trim();
    const append = redir[2] === ">>";
    const dest = redir[4];
    const innerOut = runCommand(t, left, { capture: true });
    const text = innerOut
      .filter((l) => l.kind === "out" || l.kind === "ok")
      .map((l) => l.text)
      .join("\n");
    applyRedirect(t, left, dest, append, text);
    t.lastExit = 0;
    return out;
  }

  const args = parseArgs(input.trim());
  const cmd = args[0];
  const rest = args.slice(1);
  const flags = new Set(rest.filter((a) => a.startsWith("-") && !a.startsWith("--")).flatMap((a) => a.slice(1).split("")));
  const pos = rest.filter((a) => !a.startsWith("-"));

  const print = (text: string, kind: TermLine["kind"] = "out") => {
    for (const line of text.split("\n")) out.push({ kind, text: line });
  };

  const unknown = () => {
    print(`${cmd}: command not found`, "err");
    t.lastExit = 127;
  };

  try {
    const prevStdin = PIPE_STDIN;
    PIPE_STDIN = inner?.stdin ?? null;
    const context = {
      cmd,
      args,
      rest,
      pos,
      flags,
      input,
      print,
      stdin: PIPE_STDIN,
    };
    const handled = t.scenario === "dfir" && handleDfirCommand(t, context)
      ? true
      : handleSudoRun(t, context);
    PIPE_STDIN = prevStdin;
    if (handled) {
      t.lastExit = out.some((l) => l.kind === "err") ? 1 : 0;
      return out;
    }

    switch (cmd) {
      case "help":
        print(HELP, "sys");
        t.flags.add("used-help");
        break;
      case "clear":
        t.lines = [];
        t.lastExit = 0;
        return [];
      case "whoami":
        print(t.isRoot ? "root" : t.user);
        t.flags.add("whoami");
        break;
      case "id":
        if (t.isRoot) print("uid=0(root) gid=0(root) groups=0(root)");
        else print(`uid=1000(${t.user}) gid=1000(${t.user}) groups=1000(${t.user}),27(sudo)`);
        t.flags.add("id");
        break;
      case "pwd":
        print(t.cwd);
        t.flags.add("pwd");
        break;
      case "hostname":
        print(t.host);
        break;
      case "uname":
        print("Linux " + t.host + " 5.15.0-forge #1 SMP x86_64 GNU/Linux");
        t.flags.add("uname");
        break;
      case "date":
        print(new Date().toString());
        break;
      case "echo": {
        const rawE = rest.join(" ");
        const expanded = rawE.replace(/\$\{?([A-Za-z_][A-Za-z0-9_]*)\}?/g, (_, k) => t.env[k] ?? "");
        print(expanded.replace(/^["']|["']$/g, ""));
        t.flags.add("echo");
        break;
      }
      case "env":
      case "printenv":
        print(Object.entries(t.env).map(([k, v]) => `${k}=${v}`).join("\n"));
        break;
      case "history":
        print(t.history.map((c, i) => `  ${i + 1}  ${c}`).join("\n"));
        break;
      case "which":
        if (!pos[0]) print("which: missing argument", "err");
        else print(`/usr/bin/${pos[0]}`);
        break;
      case "man": {
        const m = pos[0] || cmd;
        t.flags.add("man");
        if (m === "ls") {
          t.flags.add("man-ls");
          print(`LS(1)                            User Commands                           LS(1)

NAME
       ls - list directory contents

SYNOPSIS
       ls [OPTION]... [FILE]...

DESCRIPTION
       -a  do not ignore entries starting with .
       -l  use a long listing format
       -h  with -l, print sizes in human readable format`);
        } else print(`MAN ${m} — simulated. Try \`help\` for the lab command list.`, "sys");
        break;
      }
      case "ls": {
        const target = resolvePath(t, pos[0] || ".");
        const node = getNode(t.fs, target);
        if (!node) {
          print(`ls: cannot access '${pos[0]}': No such file or directory`, "err");
          t.lastExit = 2;
          break;
        }
        const long = flags.has("l");
        const all = flags.has("a");
        t.flags.add("ls");
        if (all) t.flags.add("ls-a");
        if (long) t.flags.add("ls-l");
        if (node.type === "file") {
          print(long ? `${lsMode(node)} 1 ${node.owner || t.user} ${node.group || t.user} ${String(node.content?.length || 0).padStart(4)} ${node.name}` : node.name);
          break;
        }
        const names = Object.keys(node.children || {}).sort();
        const shown = all ? [".", "..", ...names] : names.filter((n) => !n.startsWith("."));
        if (!long) {
          print(shown.join("  ") || "");
        } else {
          const rows = shown.map((n) => {
            if (n === "." || n === "..") return `drwxr-xr-x 2 ${t.user} ${t.user}    4 ${n}`;
            const c = node.children![n];
            const sz = c.type === "file" ? String(c.content?.length || 0).padStart(4) : "   4";
            return `${lsMode(c)} 1 ${c.owner || t.user} ${c.group || t.user} ${sz} ${n}`;
          });
          print("total " + shown.length + "\n" + rows.join("\n"));
        }
        break;
      }
      case "cd": {
        const dest = resolvePath(t, pos[0] || "~");
        const node = getNode(t.fs, dest);
        if (!node) {
          print(`bash: cd: ${pos[0]}: No such file or directory`, "err");
          t.lastExit = 1;
          break;
        }
        if (node.type !== "dir") {
          print(`bash: cd: ${pos[0]}: Not a directory`, "err");
          t.lastExit = 1;
          break;
        }
        if (!canRead(t, node)) {
          print(`bash: cd: ${pos[0]}: Permission denied`, "err");
          t.lastExit = 1;
          break;
        }
        t.cwd = dest;
        t.flags.add("cd");
        if (dest.includes("documents") || dest.includes("Documents")) t.flags.add("cd-documents");
        if (dest.endsWith("/Desktop") || dest.endsWith("/Desktop/")) t.flags.add("cd-desktop");
        if (dest.includes("/opt/raven")) t.flags.add("cd-raven");
        if (dest.includes("/home/raven")) t.flags.add("cd-home-raven");
        if (dest.includes("/var/www")) t.flags.add("cd-www");
        if (dest.includes("/root")) t.flags.add("cd-root");
        break;
      }
      case "cat":
      case "head":
      case "tail":
      case "less":
      case "more": {
        if (!pos[0] && PIPE_STDIN != null) {
          let content = PIPE_STDIN;
          if (cmd === "head") content = content.split("\n").slice(0, 10).join("\n");
          if (cmd === "tail") content = content.split("\n").slice(-10).join("\n");
          print(content);
          t.flags.add(cmd);
          break;
        }
        if (!pos[0]) {
          print(`${cmd}: missing file operand`, "err");
          break;
        }
        const p = resolvePath(t, pos[0]);
        const node = getNode(t.fs, p);
        if (!node) {
          print(`${cmd}: ${pos[0]}: No such file or directory`, "err");
          t.lastExit = 1;
          break;
        }
        if (node.type === "dir") {
          print(`${cmd}: ${pos[0]}: Is a directory`, "err");
          t.lastExit = 1;
          break;
        }
        if (!canRead(t, node)) {
          print(`${cmd}: ${pos[0]}: Permission denied`, "err");
          t.lastExit = 1;
          break;
        }
        let content = node.content || "";
        if (cmd === "head") content = content.split("\n").slice(0, 10).join("\n");
        if (cmd === "tail") content = content.split("\n").slice(-10).join("\n");
        print(content.replace(/\n$/, ""));
        t.filesRead.push(p);
        t.flags.add("cat");
        if (p.endsWith(".secret") || content.includes("FLAG{hidden")) t.flags.add("read-secret");
        if (content.includes("FLAG{")) {
          const m = content.match(/FLAG\{[^}]+\}/g);
          if (m) m.forEach((f) => t.flags.add("saw:" + f));
        }
        if (p.includes("welcome.txt")) t.flags.add("read-welcome");
        if (p.includes("notes.txt")) t.flags.add("read-notes");
        if (p.includes("config.php")) t.flags.add("read-config");
        if (p.includes("cms.sql")) t.flags.add("read-sql");
        if (p.includes("user.txt")) t.flags.add("read-user-flag");
        if (p.includes("root.txt") || p.includes("/root/flag")) t.flags.add("read-root-flag");
        if (p.includes("backup.sh")) t.flags.add("read-backup-script");
        if (p.includes("id_rsa") || p.includes("id_ed25519") || p.includes("id_dev")) t.flags.add("read-ssh-key");
        if (p.includes("jump.txt")) t.flags.add("read-jump");
        if (p.includes("credentials.txt")) t.flags.add("read-creds");
        if (p.includes("wordlist") || p.includes("rockyou")) t.flags.add("read-wordlist");
        if (p.includes("/etc/passwd")) t.flags.add("read-passwd");
        if (p.includes("/etc/hosts")) t.flags.add("read-hosts");
        if (p.includes("sshd_config")) t.flags.add("read-sshd");
        if (p.includes("crontab")) t.flags.add("read-cron");
        if (/hackforge\.txt/.test(p)) t.flags.add("cat-hf");
        if (/etter\.dns/.test(p)) t.flags.add("etter");
        if (/simple_bash/.test(p)) t.flags.add("cat-bash");
        if (/sources\.list/.test(p)) t.flags.add("read-sources");
        break;
      }
      case "grep": {
        const pat = (pos[0] || "").replace(/^["']|["']$/g, "");
        const re = new RegExp(pat, "i");
        let source = PIPE_STDIN;
        if (source == null && pos[1]) {
          const p = resolvePath(t, pos[1]);
          const node = getNode(t.fs, p);
          if (!node || node.type !== "file") {
            print(`grep: ${pos[1]}: No such file`, "err");
            break;
          }
          source = node.content || "";
          t.filesRead.push(p);
        }
        if (source == null) {
          print("usage: grep PATTERN FILE", "err");
          break;
        }
        const hits = source.split("\n").filter((l) => re.test(l));
        print(hits.join("\n") || "");
        t.flags.add("grep");
        if (/echo/i.test(pat)) t.flags.add("grep-echo");
        if (/inet/i.test(pat)) t.flags.add("grep-inet");
        if (/msf/i.test(pat)) t.flags.add("ps-grep");
        if (/HISTSIZE/i.test(pat)) t.flags.add("grep-hist");
        if (hits.some((h) => h.includes("FLAG{"))) t.flags.add("grep-flag");
        break;
      }
      case "find": {
        const start = resolvePath(t, pos[0] || ".");
        const node = getNode(t.fs, start);
        if (!node) {
          print(`find: '${pos[0]}': No such file or directory`, "err");
          break;
        }
        const nameIdx = rest.indexOf("-name");
        const pat = nameIdx >= 0 ? rest[nameIdx + 1] : "*";
        const re = globToRe(pat || "*");
        const acc: { path: string; node: FileNode }[] = [];
        walk(node, start, acc);
        const hits = acc.filter((a) => re.test(a.node.name)).map((a) => a.path);
        print(hits.join("\n") || "");
        t.flags.add("find");
        if (hits.some((h) => h.includes(".secret") || h.includes("flag") || h.includes("id_rsa"))) t.flags.add("find-secret");
        if (hits.some((h) => /hackforge$/i.test(h) || h.endsWith("/hackforge"))) t.flags.add("find-hf");
        break;
      }
      case "ping": {
        const target = pos[0];
        if (!target) {
          print("ping: missing host", "err");
          break;
        }
        const h = findHost(t, target) || { ip: target, hostname: target };
        print(`PING ${h.hostname || target} (${h.ip || target}): 56 data bytes`);
        print(`64 bytes from ${h.ip || target}: icmp_seq=1 ttl=64 time=0.4 ms`);
        print(`64 bytes from ${h.ip || target}: icmp_seq=2 ttl=64 time=0.3 ms`);
        print(`--- ${target} ping statistics ---`);
        print(`2 packets transmitted, 2 received, 0% packet loss`);
        t.flags.add("ping");
        if (String(target).includes("10.10.10")) t.flags.add("ping-lab");
        break;
      }
      case "ifconfig":
      case "ip": {
        print(`eth0: flags=${t.net.up ? "4163<UP,BROADCAST,RUNNING>" : "4098<BROADCAST,MULTICAST>"} mtu 1500
        inet ${t.net.ip}  netmask ${t.net.mask}  broadcast ${t.net.bcast}
        inet6 fe80::a00:27ff:fe12:3456  prefixlen 64
        ether ${t.net.mac}
lo: flags=73<UP,LOOPBACK,RUNNING> mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0`);
        t.flags.add("ip");
        if (/\d+\.\d+\.\d+\.\d+/.test(pos[0] || "") && /eth0/.test(input)) {
          t.net.ip = pos.find((p) => /^\d+\.\d+\.\d+\.\d+$/.test(p)) || t.net.ip;
          t.flags.add("ip-set");
        }
        break;
      }
      case "nmap": {
        const target = pos.find((p) => /[0-9]|lab/.test(p)) || pos[0];
        if (!target) {
          print("nmap: specify a target, e.g. nmap 10.10.10.0/24", "err");
          break;
        }
        t.flags.add("nmap");
        const svc = rest.includes("-sV") || rest.includes("-A") || rest.includes("-sC");
        if (svc) t.flags.add("nmap-sv");
        if (rest.includes("-sn") || rest.includes("-sP") || rest.includes("-sp")) t.flags.add("nmap-sn");
        if (target.includes("/24") || target.endsWith(".0")) {
          t.flags.add("nmap-sweep");
          print(`Starting Nmap 7.94 ( https://nmap.org ) at lab-time
Nmap scan report for 10.10.10.5 (raven.lab)
Host is up (0.001s latency).
Nmap scan report for 10.10.10.8 (web.lab)
Host is up (0.001s latency).
Nmap scan report for 10.10.10.12 (ssh.lab)
Host is up (0.002s latency).
Nmap scan report for 10.10.10.21 (db.lab)
Host is up (0.002s latency).
Nmap done: 256 IP addresses (4 hosts up) scanned in 2.14 seconds`);
          break;
        }
        const h = findHost(t, target);
        if (!h) {
          print(`Note: Host seems down (this is a simulated lab — try 10.10.10.5).`, "err");
          break;
        }
        t.flags.add("nmap-host");
        if (h.ip === "10.10.10.5") t.flags.add("nmap-raven");
        if (h.ip === "10.10.10.8") t.flags.add("nmap-web");
        if (h.ip === "10.10.10.12") t.flags.add("nmap-ssh");
        const lines = [
          `Starting Nmap 7.94 ( simulated )`,
          `Nmap scan report for ${h.hostname} (${h.ip})`,
          `Host is up (0.0012s latency).`,
          svc && h.os ? `OS: ${h.os}` : "",
          `PORT     STATE    SERVICE    ${svc ? "VERSION" : ""}`,
          ...h.ports.map(
            (p) =>
              `${String(p.port).padEnd(5)}/${p.proto} ${p.state.padEnd(8)} ${p.service.padEnd(10)} ${svc ? p.version : ""}`.trimEnd()
          ),
          `Nmap done: 1 IP address (1 host up) scanned`,
        ].filter(Boolean);
        print(lines.join("\n"));
        break;
      }
      case "curl":
      case "wget": {
        const url = pos[0] || "";
        t.flags.add("curl");
        if (/login\.php/i.test(url) && /[?&](id|user|u)=/i.test(url) && /('|or|union)/i.test(url)) {
          print('{"id":1,"user":"admin","flag":"FLAG{sqli_union_selected}"}');
          t.flags.add("sqli-win");
          break;
        }
        if (/10\.10\.10\.8|web\.lab/.test(url)) {
          print("<html><h1>Forge CMS</h1><a href='/login.php'>login</a></html>");
          t.flags.add("curl-web");
          break;
        }
        if (/10\.10\.10\.5|raven\.lab/.test(url)) {
          print("<html><h1>Raven CMS v1.2</h1><p>login.php</p></html>");
          t.flags.add("curl-raven");
          break;
        }
        if (/localhost|127\.0\.0\.1/.test(url)) {
          t.flags.add("curl-local");
          const page = getNode(t.fs, "/var/www/html/index.html");
          print(page?.content || "<h1>It works!</h1>");
          break;
        }
        if (url) print(`curl: fetched ${url} (simulated empty body)`);
        else print("curl: try curl http://10.10.10.8/", "err");
        break;
      }
      case "hydra":
      case "medusa":
      case "ncrack": {
        t.flags.add("hydra");
        const joined = input.toLowerCase();
        const hasList = joined.includes("wordlist") || joined.includes("rockyou") || joined.includes("-p") || joined.includes("-P");
        const hasTarget = /10\.10\.10\.12|ssh\.lab|10\.10\.10\.5|raven/.test(joined);
        if (!hasList || !hasTarget) {
          print("hydra: specify a target and wordlist (simulated). e.g.\n  hydra -l labuser -P tools/wordlist.txt ssh://10.10.10.12", "err");
          break;
        }
        if (/10\.10\.10\.12|ssh\.lab/.test(joined)) {
          print(`[DATA] attacking ssh://10.10.10.12:22
[22][ssh] host: 10.10.10.12   login: labuser   password: labpass123
1 of 1 target successfully completed, 1 valid password found`);
          t.flags.add("hydra-win");
        } else if (/10\.10\.10\.5|raven/.test(joined)) {
          print(`[22][ssh] host: 10.10.10.5   login: raven   password: nevermore
1 valid password found`);
          t.flags.add("hydra-raven");
        } else print("hydra: no valid password found in this simulation");
        break;
      }
      case "ssh": {
        t.flags.add("ssh");
        const dest = pos.find((p) => p.includes("@") || p.includes(".")) || pos[0] || "";
        const key = rest.includes("-i") || /id_/.test(input);
        if (/ignite@|192\.168\.0\.11/.test(dest) || /ignite@/.test(input)) {
          print("Welcome to ubuntu (HackForge lab host)\nLast login: simulated\nignite@ubuntu:~$");
          t.flags.add("ssh-ignite");
          t.user = "ignite";
          t.host = "ubuntu";
          break;
        }
        if (/labuser@10\.10\.10\.12|labuser@ssh/.test(dest) || (/10\.10\.10\.12/.test(dest) && t.flags.has("hydra-win"))) {
          print("Welcome to Ubuntu 20.04 LTS (ssh.lab)\nLast login: simulated");
          t.user = "labuser";
          t.host = "ssh";
          t.cwd = "/home/operator";
          t.flags.add("ssh-labuser");
          break;
        }
        if (/raven@10\.10\.10\.5|raven@raven/.test(dest) || (key && /10\.10\.10\.5|raven/.test(dest))) {
          print("Welcome to raven.lab — nevermore\nuser.txt awaits in ~");
          t.user = "raven";
          t.host = "raven";
          t.fs = ravenFS();
          t.cwd = "/home/raven";
          t.env.HOME = "/home/raven";
          t.flags.add("ssh-raven");
          break;
        }
        if (/jump|10\.10\.20\.2/.test(dest)) {
          print("Welcome to jump.lab bastion. Use ProxyJump to reach dev.");
          t.host = "jump";
          t.flags.add("ssh-jump");
          break;
        }
        if (/dev@|10\.10\.20\.14|ProxyJump| -J /.test(input)) {
          print("Welcome to dev.lab via jump host.\nInternal db is at 10.10.20.30");
          t.host = "dev";
          t.user = "dev";
          t.flags.add("ssh-dev");
          t.flags.add("ssh-hop");
          break;
        }
        if (/10\.10\.20\.30|db-int/.test(dest) && t.flags.has("ssh-dev")) {
          print("psql (14.5) on db-int.lab\nFLAG{ssh_deep_pivot}");
          t.flags.add("ssh-db");
          break;
        }
        print(`ssh: connect to host ${dest || "?"} port 22: Connection refused (try a lab host)`, "err");
        t.lastExit = 1;
        break;
      }
      case "sudo": {
        t.flags.add("sudo");
        if (rest[0] === "-l") {
          print(`User ${t.user} may run the following commands on ${t.host}:
    (ALL) NOPASSWD: /usr/bin/find
    (root) NOPASSWD: /usr/local/bin/backup.sh`);
          t.flags.add("sudo-l");
          break;
        }
        if (rest[0] === "su" || rest.join(" ") === "-i" || rest[0] === "bash" || rest[0] === "su-") {
          print("root@forge — simulated. Remember the oath.");
          t.isRoot = true;
          t.user = "root";
          t.flags.add("got-root");
          break;
        }
        if (rest.includes("find") || /find/.test(input)) {
          print("GTFOBins find → root (simulated). You are now root.");
          t.isRoot = true;
          t.user = "root";
          t.flags.add("got-root");
          t.flags.add("privesc-find");
          break;
        }
        if (/backup\.sh/.test(input)) {
          print("Running world-writable backup.sh as root (simulated).");
          t.flags.add("ran-backup-root");
          if (t.flags.has("wrote-backup")) {
            t.isRoot = true;
            t.user = "root";
            t.flags.add("got-root");
          }
          break;
        }
        print("sudo: a simulated password is not required in this lab. Try `sudo -l`.", "err");
        break;
      }
      case "chmod":
      case "echo-append":
        break;
      case "submit": {
        const flag = pos[0] || "";
        if (/^FLAG\{.+\}$/.test(flag)) {
          t.flags.add("submit:" + flag);
          t.flags.add("submitted");
          print(`Flag accepted: ${flag}`, "ok");
        } else print("usage: submit FLAG{...}", "err");
        break;
      }
      case "python":
      case "python3":
        print("Python 3.11.2 (simulated). Use the shell tools in this lab.");
        break;
      case "nc":
      case "netcat":
        print("nc: simulated. No live listeners in the sandbox.");
        break;
      case "sqlmap": {
        t.flags.add("sqlmap");
        if (/login\.php|10\.10\.10\.8|10\.10\.10\.5/.test(input)) {
          print(`sqlmap identified the following injection point:
Parameter: id (GET)
    Type: UNION query
    Title: Generic UNION query (simulated)
available databases [2]:
[*] information_schema
[*] ravencms
Table: users
[2 entries]
+-------+----------------------------------+
| admin | FLAG{sqli_union_selected}        |
+-------+----------------------------------+`);
          t.flags.add("sqli-win");
        } else print("sqlmap: provide a lab URL such as http://10.10.10.8/login.php?id=1");
        break;
      }
      case "john":
      case "hashcat":
        print("Hash cracking is simulated here. Use hydra against lab SSH for the password module.");
        break;
      case "scp":
        t.flags.add("scp");
        print("scp: simulated transfer complete.");
        break;
      case "touch": {
        const p = resolvePath(t, pos[0] || "");
        if (!pos[0]) {
          print("touch: missing file operand", "err");
          break;
        }
        const { parent, name } = parentAndName(p);
        const dirn = getNode(t.fs, parent);
        if (dirn && dirn.type === "dir" && dirn.children) {
          if (!dirn.children[name]) dirn.children[name] = file(name, "");
          t.flags.add("touch");
          if (/hackforge-2/.test(name)) t.flags.add("touch-hf2");
        }
        break;
      }
      case "mkdir": {
        const p = resolvePath(t, pos[0] || "");
        const { parent, name } = parentAndName(p);
        const dirn = getNode(t.fs, parent);
        if (dirn && dirn.type === "dir" && dirn.children && name) {
          dirn.children[name] = dir(name);
          t.flags.add("mkdir");
          if (name === "ignite") t.flags.add("mkdir-ignite");
        }
        break;
      }
      case "nano":
      case "vi":
      case "vim": {
        if (/backup\.sh/.test(input)) {
          t.flags.add("wrote-backup");
          print("Edited /usr/local/bin/backup.sh (simulated). Next run it via sudo.");
        } else print(`${cmd}: editor simulated — not needed for this lab.`);
        break;
      }
      default:
        unknown();
        return out;
    }
    t.lastExit = out.some((l) => l.kind === "err") ? 1 : 0;
  } catch (e) {
    print(String(e), "err");
    t.lastExit = 1;
  }
  return out;
}

export function usedCmd(t: Terminal, re: RegExp): boolean {
  return t.ran.some((c) => re.test(c));
}

export function prompt(t: Terminal): string {
  return promptOf(t);
}
