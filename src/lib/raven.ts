// Self-contained simulated engine for the "Raven" boot2root campaign.
// A shared RavenSession is mutated by BOTH the terminal and the browser, so
// objective checks can simply read the session regardless of which tool was used.
// Everything is a safe, scripted simulation — no real commands run.

import type { OutLine } from "./terminal";

const c = {
  err: "text-red-400",
  ok: "text-neon-green",
  warn: "text-amber-300",
  dim: "text-iron-500",
  info: "text-neon-cyan",
  ember: "text-ember-400",
};
const L = (text: string, cls?: string): OutLine => ({ text, cls });

export const TARGET_IP = "192.168.56.101";

// Real Raven-1 artifacts (public CTF facts)
export const FLAG1 = "flag1{b9bbcb33e11b80be759c4e844862482d}";
export const FLAG2 = "flag2{fc3fd58dcdad9ab23faca6e9a36e581c}";
export const FLAG3 = "flag3{afc01ab56b50591e7dccf93122770cd2}";
export const FLAG4 = "flag4{715dea6c055b9fe3337544932f2941ce}";

// ------------------------- Shared session state -------------------------

export class RavenSession {
  // network / recon outcomes
  hostDiscovered = false;
  portsScanned = false;
  dirbRun = false;
  wpUsersEnumerated = false;
  sshCracked = false; // hydra found michael:michael
  // access state
  location: "attacker" | "remote" = "attacker";
  remoteUser = ""; // michael | steven | root
  foothold = false; // shell as michael obtained
  // loot
  dbCreds = false; // read wp-config.php
  dbAccess = false; // logged into mysql
  wpPostsDumped = false;
  wpUsersDumped = false;
  stevenCracked = false; // john/hashcat -> pink84
  ranSudoL = false; // ran `sudo -l`
  isRoot = false;
  // extra outcomes used by the two final challenges per module
  pingedTarget = false; // pinged the target host
  readPasswd = false; // read /etc/passwd on the box
  ranFind = false; // used find to locate flag files
  showedTables = false; // ran `show tables;` in MySQL
  readShadow = false; // read /etc/shadow as root
  // flags captured (any tool)
  flags = new Set<string>();
  // browser
  visited = new Set<string>();
  sawSource = new Set<string>();

  capture(text: string) {
    const m = text.match(/flag\d\{[^}]+\}/g);
    if (m) m.forEach((f) => this.flags.add(f));
  }
  has(flag: string) {
    return this.flags.has(flag);
  }
}

// ------------------------- Simulated web pages -------------------------

export type WebPage = {
  title: string;
  // rendered "look" is described by a kind the component knows how to draw
  kind: "raven-home" | "raven-page" | "wp-blog" | "wp-login" | "notfound";
  heading?: string;
  body?: string[];
  source: string; // the HTML you see in "view source"
  flag?: string; // captured when source is viewed
};

export const RAVEN_NAV = [
  { label: "Home", path: "/" },
  { label: "About", path: "/about.html" },
  { label: "Services", path: "/services.html" },
  { label: "Team", path: "/team.html" },
  { label: "Contact", path: "/contact.html" },
];

export function resolvePage(rawUrl: string, session: RavenSession): { url: string; page: WebPage } {
  let url = rawUrl.trim();
  if (!url) url = "http://" + TARGET_IP + "/";
  if (!/^https?:\/\//.test(url)) url = "http://" + url;
  // normalise: strip protocol + host to a path
  const m = url.match(/^https?:\/\/([^/]+)(\/.*)?$/);
  const host = m ? m[1] : TARGET_IP;
  let path = (m && m[2]) || "/";
  if (host !== TARGET_IP && host !== "raven.local") {
    return { url, page: NOT_FOUND };
  }
  if (path === "") path = "/";
  session.visited.add(path);

  const page = PAGES[path] || (path.startsWith("/wordpress") ? wpRouter(path) : NOT_FOUND);
  return { url: `http://${host}${path}`, page };
}

function wpRouter(path: string): WebPage {
  if (path.includes("wp-login")) return PAGES["/wordpress/wp-login.php"];
  return PAGES["/wordpress/"];
}

const NOT_FOUND: WebPage = {
  title: "Not Found",
  kind: "notfound",
  source: "<h1>404 Not Found</h1>",
};

const PAGES: Record<string, WebPage> = {
  "/": {
    title: "Raven Security",
    kind: "raven-home",
    heading: "RAVEN SECURITY",
    body: [
      "Providing world-class security consulting to keep your business safe.",
      "Penetration testing · Incident response · Security training.",
    ],
    source: [
      "<!DOCTYPE html>",
      "<html><head><title>Raven Security</title></head>",
      "<body>",
      '  <nav>Home | About | Services | Team | Contact</nav>',
      "  <h1>RAVEN SECURITY</h1>",
      "  <p>World-class security consulting.</p>",
      "  <!-- nothing to see here on the homepage -->",
      "</body></html>",
    ].join("\n"),
  },
  "/about.html": {
    title: "About — Raven Security",
    kind: "raven-page",
    heading: "About Us",
    body: ["Raven Security was founded to protect organisations from modern threats."],
    source: "<html><body><h1>About Us</h1><p>Founded to protect organisations.</p></body></html>",
  },
  "/services.html": {
    title: "Services — Raven Security",
    kind: "raven-page",
    heading: "Our Services",
    body: [
      "Penetration Testing",
      "Security Auditing",
      "Incident Response",
      "Nothing suspicious is visible on the rendered page… have you tried viewing the source?",
    ],
    // flag1 hidden inside an HTML comment in the source — just like the real box
    source: [
      "<html><head><title>Services</title></head>",
      "<body>",
      "  <h1>Our Services</h1>",
      "  <ul>",
      "    <li>Penetration Testing</li>",
      "    <li>Security Auditing</li>",
      "    <li>Incident Response</li>",
      "  </ul>",
      `  <!-- ${FLAG1} -->`,
      "</body></html>",
    ].join("\n"),
    flag: FLAG1,
  },
  "/team.html": {
    title: "Team — Raven Security",
    kind: "raven-page",
    heading: "Our Team",
    body: ["Michael — Systems Administrator", "Steven — Lead Developer"],
    source: "<html><body><h1>Our Team</h1><p>Michael, Steven</p></body></html>",
  },
  "/contact.html": {
    title: "Contact — Raven Security",
    kind: "raven-page",
    heading: "Contact",
    body: ["Read our latest posts on our Blog (powered by WordPress): /wordpress/"],
    source: '<html><body><h1>Contact</h1><a href="/wordpress/">Blog</a></body></html>',
  },
  "/wordpress/": {
    title: "Raven Security — Blog",
    kind: "wp-blog",
    heading: "Raven Security Blog",
    body: [
      "Welcome to Raven — Coming soon!",
      "Posted by admin.  (The theme looks half-broken — it keeps referencing raven.local.)",
      "Login: /wordpress/wp-login.php",
    ],
    source: [
      "<html><head><title>Raven Security Blog</title>",
      '  <link rel="stylesheet" href="http://raven.local/wordpress/wp-content/themes/twenty/style.css">',
      "</head><body class=\"wordpress\">",
      "  <h1>Raven Security Blog</h1>",
      '  <div class="post"><h2>Welcome to Raven</h2><p>Coming soon!</p></div>',
      '  <a href="/wordpress/wp-login.php">Log in</a>',
      "  <!-- WordPress 4.8.x -->",
      "</body></html>",
    ].join("\n"),
  },
  "/wordpress/wp-login.php": {
    title: "Log In — WordPress",
    kind: "wp-login",
    heading: "WordPress",
    body: ["Username / Password", "Hint: there are no login lockouts here — perfect for brute force."],
    source: [
      '<form name="loginform" action="/wordpress/wp-login.php" method="post">',
      '  <input type="text"     name="log" placeholder="Username">',
      '  <input type="password" name="pwd" placeholder="Password">',
      '  <input type="submit"   value="Log In">',
      "</form>",
    ].join("\n"),
  },
};

// ------------------------- Terminal engine -------------------------

type Pending =
  | { type: "ssh-pass"; user: string }
  | { type: "su-pass"; user: string }
  | { type: "mysql-pass" }
  | null;

// Remote (Raven box) filesystem — only a few relevant files.
const REMOTE_FS: Record<string, string[]> = {
  "/home/michael": ["(empty)"],
  "/var/www": ["flag2.txt", "html"],
  "/var/www/html": ["wordpress", "index.html"],
  "/var/www/html/wordpress": ["wp-config.php", "wp-content", "wp-admin", "wp-includes", "index.php"],
  "/root": ["flag4.txt"],
};
const REMOTE_FILES: Record<string, { content: string; rootOnly?: boolean }> = {
  "/var/www/flag2.txt": { content: FLAG2 },
  "/var/www/html/wordpress/wp-config.php": {
    content: [
      "<?php",
      "/** MySQL database username */",
      "define('DB_USER', 'root');",
      "/** MySQL database password */",
      "define('DB_PASSWORD', 'R@v3nSecurity');",
      "define('DB_NAME', 'wordpress');",
      "define('DB_HOST', 'localhost');",
      "?>",
    ].join("\n"),
  },
  "/root/flag4.txt": { content: FLAG4, rootOnly: true },
  "/etc/passwd": {
    content: [
      "root:x:0:0:root:/root:/bin/bash",
      "michael:x:1000:1000::/home/michael:/bin/bash",
      "steven:x:1001:1001::/home/steven:/bin/bash",
      "mysql:x:106:110:MySQL Server:/nonexistent:/bin/false",
    ].join("\n"),
  },
  "/etc/shadow": {
    rootOnly: true,
    content: [
      "root:$6$R@v3n$9x...:19000:0:99999:7:::",
      "michael:$6$abc$7y...:19000:0:99999:7:::",
      "steven:$1$pink$84...:19000:0:99999:7:::",
    ].join("\n"),
  },
};

const RAVEN_COMMANDS_ATTACKER = [
  "help", "clear", "netdiscover", "nmap", "dirb", "gobuster", "wpscan",
  "hydra", "ssh", "ping", "curl", "whoami", "exit",
];
const RAVEN_COMMANDS_REMOTE = [
  "help", "clear", "ls", "cd", "pwd", "cat", "less", "whoami", "id", "find",
  "grep", "mysql", "su", "sudo", "john", "hashcat", "uname", "exit",
];

export class RavenTerminal {
  s: RavenSession;
  cwd = "/home/michael";
  mysqlMode = false;
  mysqlDb = "";
  pending: Pending = null;
  history: string[] = [];

  constructor(session: RavenSession) {
    this.s = session;
  }

  prompt(): string {
    if (this.pending?.type === "ssh-pass") return `${this.pending.user}@${TARGET_IP}'s password:`;
    if (this.pending?.type === "su-pass") return "Password:";
    if (this.pending?.type === "mysql-pass") return "Enter password:";
    if (this.mysqlMode) return "mysql>";
    if (this.s.location === "attacker") return "kali@kali:~$";
    const sym = this.s.remoteUser === "root" ? "#" : "$";
    const short = this.cwd.replace("/home/" + this.s.remoteUser, "~");
    return `${this.s.remoteUser}@raven:${short}${sym}`;
  }

  complete(input: string): { completed: string; candidates: string[] } {
    const none = { completed: input, candidates: [] as string[] };
    if (this.pending || this.mysqlMode) return none;
    const parts = input.split(/\s+/);
    if (parts.length === 1 && !/\s$/.test(input)) {
      const list = this.s.location === "attacker" ? RAVEN_COMMANDS_ATTACKER : RAVEN_COMMANDS_REMOTE;
      const hits = list.filter((x) => x.startsWith(parts[0]));
      if (hits.length === 1) return { completed: hits[0] + " ", candidates: [] };
      if (hits.length > 1) return { completed: lcp(hits) || parts[0], candidates: hits };
    }
    return none;
  }

  run(raw: string): OutLine[] {
    const input = raw.trim();
    // pending interactive input (passwords) — not stored in history
    if (this.pending) {
      const out = this.handlePending(input);
      for (const l of out) this.s.capture(l.text);
      return out;
    }
    if (!input) return [];
    this.history.push(input);
    const out = this.mysqlMode ? this.mysql(input) : this.dispatch(input);
    for (const l of out) this.s.capture(l.text);
    return out;
  }

  private dispatch(input: string): OutLine[] {
    const parts = input.split(/\s+/);
    const cmd = parts[0];
    const args = parts.slice(1);

    if (cmd === "clear" || cmd === "cls") return [{ text: "__CLEAR__" }];
    if (cmd === "help") return this.help();
    if (cmd === "exit") {
      if (this.s.location === "remote") {
        if (this.s.remoteUser === "root") {
          this.s.remoteUser = "steven";
          return [L("exit", c.dim)];
        }
        this.s.location = "attacker";
        this.s.remoteUser = "";
        return [L("logout", c.dim), L("Connection to " + TARGET_IP + " closed.", c.dim)];
      }
      return [L("logout", c.dim)];
    }

    if (this.s.location === "attacker") return this.attacker(cmd, args, input);
    return this.remote(cmd, args, input);
  }

  // ---------------- attacker machine ----------------
  private attacker(cmd: string, args: string[], input: string): OutLine[] {
    switch (cmd) {
      case "whoami":
        return [L("kali")];
      case "netdiscover":
        this.s.hostDiscovered = true;
        return [
          L("Currently scanning: 192.168.56.0/24   |   Screen View: Unique Hosts", c.dim),
          L(""),
          L(" IP              At MAC Address      Count  Vendor", c.ember),
          L(" 192.168.56.1    0a:00:27:00:00:10      1   (gateway)", c.dim),
          L(` ${TARGET_IP}  08:00:27:a4:1b:9c      1   PCS Systemtechnik / Oracle VirtualBox`, c.ok),
          L(""),
          L(`Target acquired: ${TARGET_IP}`, c.info),
        ];
      case "ping": {
        const t = args.find((a) => !a.startsWith("-"));
        if (t === TARGET_IP || t === "raven.local") {
          this.s.pingedTarget = true; // outcome: target confirmed alive
          return [L(`PING ${t}: 64 bytes icmp_seq=1 ttl=64 time=0.42 ms`, c.ok), L("host is up.", c.dim)];
        }
        return [L(`ping: ${t || ""}: could not resolve`, c.err)];
      }
      case "nmap":
        return this.nmap(args);
      case "dirb":
      case "gobuster":
        return this.dirb(input);
      case "wpscan":
        return this.wpscan(input);
      case "hydra":
        return this.hydra(input);
      case "curl":
        return [L("Tip: use the Browser tab to view web pages and their source.", c.info)];
      case "ssh":
        return this.ssh(args);
      default:
        return [L(`${cmd}: command not found`, c.err), L("Type 'help' for available commands.", c.dim)];
    }
  }

  private nmap(args: string[]): OutLine[] {
    const t = args.find((a) => !a.startsWith("-"));
    if (!t || (!t.includes(TARGET_IP) && t !== "raven.local")) {
      if (t && t.includes("/24")) {
        this.s.hostDiscovered = true;
        return [
          L("Starting Nmap 7.94", c.dim),
          L(`Nmap scan report for ${TARGET_IP}`, c.info),
          L("Host is up (0.00040s latency).", c.ok),
          L("Nmap done: 256 IP addresses (1 host up) scanned.", c.dim),
        ];
      }
      return [L(`Failed to resolve "${t || ""}". Did you run netdiscover first?`, c.err)];
    }
    this.s.portsScanned = true;
    this.s.hostDiscovered = true;
    return [
      L("Starting Nmap 7.94 ( https://nmap.org )", c.dim),
      L(`Nmap scan report for ${TARGET_IP}`, c.info),
      L("Host is up (0.00038s latency).", c.ok),
      L(""),
      L("PORT     STATE SERVICE VERSION", c.ember),
      L("22/tcp   open  ssh     OpenSSH 6.7p1 Debian 5+deb8u4", c.ok),
      L("80/tcp   open  http    Apache httpd 2.4.10 ((Debian))", c.ok),
      L("111/tcp  open  rpcbind 2-4 (RPC #100000)", c.ok),
      L("|_http-title: Raven Security", c.dim),
      L(""),
      L("Service detection performed. Nmap done: 1 IP address (1 host up).", c.dim),
    ];
  }

  private dirb(input: string): OutLine[] {
    if (!input.includes(TARGET_IP) && !input.includes("raven.local"))
      return [L("dirb usage: dirb http://" + TARGET_IP, c.err)];
    this.s.dirbRun = true;
    return [
      L("DIRB v2.22", c.dim),
      L(`URL_BASE: http://${TARGET_IP}/`, c.dim),
      L("-----------------", c.dim),
      L("+ http://" + TARGET_IP + "/index.html (CODE:200)", c.ok),
      L("==> DIRECTORY: http://" + TARGET_IP + "/css/", c.info),
      L("==> DIRECTORY: http://" + TARGET_IP + "/js/", c.info),
      L("==> DIRECTORY: http://" + TARGET_IP + "/vendor/", c.info),
      L("==> DIRECTORY: http://" + TARGET_IP + "/wordpress/", c.ember),
      L("-----------------", c.dim),
      L("Interesting: /wordpress/ — a WordPress install. Enumerate it with wpscan.", c.warn),
    ];
  }

  private wpscan(input: string): OutLine[] {
    if (!input.includes("wordpress"))
      return [L("wpscan: point it at the blog, e.g. wpscan --url http://" + TARGET_IP + "/wordpress --enumerate u", c.err)];
    this.s.wpUsersEnumerated = true;
    return [
      L("_______________________________________________________________", c.dim),
      L("        __          _______   _____", c.ember),
      L("        \\ \\        / /  __ \\ / ____|                          ", c.ember),
      L("   WordPress Security Scanner  (WPScan)", c.ember),
      L("_______________________________________________________________", c.dim),
      L("[+] URL: http://" + TARGET_IP + "/wordpress/", c.dim),
      L("[+] Interesting: WordPress version 4.8.7 identified", c.info),
      L(""),
      L("[i] User(s) Identified:", c.ember),
      L("[+] steven", c.ok),
      L("[+] michael", c.ok),
      L(""),
      L("Two users found. Try brute forcing SSH with hydra using these names.", c.warn),
    ];
  }

  private hydra(input: string): OutLine[] {
    if (!/ssh/.test(input) || !/(-l|-L)/.test(input) || !/-P|-x/.test(input))
      return [
        L("Hydra: need a login and a password list against ssh. e.g.", c.err),
        L("  hydra -l michael -P /usr/share/wordlists/rockyou.txt ssh://" + TARGET_IP, c.dim),
      ];
    this.s.sshCracked = true;
    return [
      L("Hydra v9.5 (c) by van Hauser/THC - for legal purposes only.", c.dim),
      L("[DATA] attacking ssh://" + TARGET_IP + ":22/", c.dim),
      L('[ATTEMPT] login "michael" - pass "123456"', c.dim),
      L('[ATTEMPT] login "michael" - pass "password"', c.dim),
      L('[ATTEMPT] login "michael" - pass "michael"', c.dim),
      L(`[22][ssh] host: ${TARGET_IP}   login: michael   password: michael`, c.ok),
      L(`[22][ssh] host: ${TARGET_IP}   login: steven   password: (not found in list)`, c.dim),
      L("1 valid password found. Weak, reused credentials — log in with ssh.", c.warn),
    ];
  }

  private ssh(args: string[]): OutLine[] {
    const tgt = args.find((a) => a.includes("@"));
    if (!tgt) return [L("usage: ssh user@" + TARGET_IP, c.err)];
    const [user, host] = tgt.split("@");
    if (host !== TARGET_IP && host !== "raven.local")
      return [L(`ssh: could not resolve hostname ${host}`, c.err)];
    if (user !== "michael" && user !== "steven")
      return [L(`ssh: connect to host ${host}: no such user in this sim`, c.err)];
    this.pending = { type: "ssh-pass", user };
    return [L(`The authenticity of host '${host}' can't be established.`, c.dim), L("Warning: Permanently added to known hosts.", c.dim)];
  }

  // ---------------- remote Raven box ----------------
  private remote(cmd: string, args: string[], input: string): OutLine[] {
    switch (cmd) {
      case "whoami":
        return [L(this.s.remoteUser)];
      case "id":
        return [L(idLine(this.s.remoteUser))];
      case "uname":
        return [L("Linux Raven 3.16.0-6-amd64 #1 SMP Debian 3.16.57-2 x86_64 GNU/Linux", c.dim)];
      case "pwd":
        return [L(this.cwd)];
      case "cd":
        return this.cd(args[0]);
      case "ls":
        return this.ls(args);
      case "cat":
      case "less":
      case "more":
        return this.cat(args.filter((a) => !a.startsWith("-")));
      case "find":
        return this.find(input);
      case "grep":
        return [L("grep: try 'cat' on a file, or 'find / -name flag*'", c.dim)];
      case "mysql":
        return this.mysqlLogin(input);
      case "su":
        return this.su(args);
      case "sudo":
        return this.sudo(args, input);
      case "john":
      case "hashcat":
        return this.crack();
      default:
        return [L(`${cmd}: command not found`, c.err)];
    }
  }

  private resolveRemote(p: string): string {
    if (!p) return this.cwd;
    let base: string[];
    if (p.startsWith("/")) base = p.split("/").filter(Boolean);
    else if (p === "~") return "/home/" + this.s.remoteUser;
    else base = [...this.cwd.split("/").filter(Boolean), ...p.split("/").filter(Boolean)];
    const out: string[] = [];
    for (const s of base) {
      if (s === ".") continue;
      if (s === "..") out.pop();
      else out.push(s);
    }
    return "/" + out.join("/");
  }

  private cd(p?: string): OutLine[] {
    if (!p || p === "~") {
      this.cwd = "/home/" + this.s.remoteUser;
      return [];
    }
    const path = this.resolveRemote(p);
    if (REMOTE_FS[path] || path === "/" || path === "/home/" + this.s.remoteUser) {
      this.cwd = path;
      return [];
    }
    // allow cd into dirs implied by files map
    const known = Object.keys(REMOTE_FS).concat(["/var", "/home", "/etc"]);
    if (known.includes(path)) {
      this.cwd = path;
      return [];
    }
    return [L(`bash: cd: ${p}: No such file or directory`, c.err)];
  }

  private ls(args: string[]): OutLine[] {
    const p = args.find((a) => !a.startsWith("-"));
    const path = this.resolveRemote(p || "");
    const items = REMOTE_FS[path];
    if (items) return [L(items.join("   "))];
    if (path === "/home/" + this.s.remoteUser) return [L("(empty)", c.dim)];
    if (path === "/") return [L("bin  boot  etc  home  root  var", c.info)];
    return [L(`ls: cannot access '${p || path}': No such file or directory`, c.err)];
  }

  private cat(paths: string[]): OutLine[] {
    if (!paths.length) return [L("cat: missing file operand", c.err)];
    const out: OutLine[] = [];
    for (const p of paths) {
      const path = this.resolveRemote(p);
      const f = REMOTE_FILES[path];
      if (!f) {
        out.push(L(`cat: ${p}: No such file or directory`, c.err));
        continue;
      }
      if (f.rootOnly && this.s.remoteUser !== "root") {
        out.push(L(`cat: ${p}: Permission denied`, c.err));
        continue;
      }
      if (path.endsWith("wp-config.php")) this.s.dbCreds = true;
      if (path === "/etc/passwd") this.s.readPasswd = true;
      if (path === "/etc/shadow") this.s.readShadow = true;
      f.content.split("\n").forEach((l) => out.push(L(l, path.includes("flag") ? c.ember : undefined)));
    }
    return out;
  }

  private find(input: string): OutLine[] {
    if (/flag/i.test(input)) {
      this.s.ranFind = true; // outcome: located flags via find
      const lines = [L("/var/www/flag2.txt")];
      if (this.s.remoteUser === "root") lines.push(L("/root/flag4.txt"));
      return lines;
    }
    return [L("find: specify a name, e.g. find / -name 'flag*'", c.dim)];
  }

  private mysqlLogin(input: string): OutLine[] {
    if (!/-u\s*root/.test(input) && !/-uroot/.test(input))
      return [L("mysql: use the DB user from wp-config.php, e.g. mysql -u root -p", c.err)];
    if (!/-p/.test(input)) return [L("mysql: add -p to be prompted for the password", c.err)];
    this.pending = { type: "mysql-pass" };
    return [];
  }

  private su(args: string[]): OutLine[] {
    const user = args.find((a) => !a.startsWith("-")) || "root";
    this.pending = { type: "su-pass", user };
    return [];
  }

  private sudo(args: string[], input: string): OutLine[] {
    if (args[0] === "-l") {
      // Only steven has a sudo entry — `sudo -l` only "succeeds" (reveals rights)
      // for steven. Running it as michael/root does NOT satisfy the objective.
      if (this.s.remoteUser === "steven") {
        this.s.ranSudoL = true; // outcome: the privesc path was actually revealed
        return [
          L("Matching Defaults entries for steven on raven:", c.dim),
          L("User steven may run the following commands on raven:", c.dim),
          L("    (ALL) NOPASSWD: /usr/bin/python", c.ok),
          L("→ python can be abused to spawn a root shell.", c.warn),
        ];
      }
      return [
        L(`Sorry, user ${this.s.remoteUser} may not run sudo -l, or has no entry.`, c.err),
        L("(this privilege check only yields results as the right user)", c.dim),
      ];
    }
    // steven + python -> root shell
    if (this.s.remoteUser === "steven" && /python/.test(input) && /(os\.system|pty|spawn|\/bin\/(ba)?sh)/.test(input)) {
      this.s.remoteUser = "root";
      this.s.isRoot = true;
      this.cwd = "/root";
      return [L("# root shell spawned via sudo python. You are now root.", c.ok)];
    }
    if (/python/.test(input) && this.s.remoteUser !== "steven")
      return [L(`${this.s.remoteUser} is not allowed to run python via sudo. Pivot to steven first.`, c.err)];
    return [L("usage: sudo -l   (list rights)   then abuse an allowed binary", c.dim)];
  }

  private crack(): OutLine[] {
    if (!this.s.wpUsersDumped)
      return [L("Nothing to crack yet. Dump the wp_users table from MySQL first.", c.err)];
    this.s.stevenCracked = true;
    return [
      L("Loaded 1 password hash (phpass [MD5])", c.dim),
      L("Proceeding with wordlist:/usr/share/wordlists/rockyou.txt", c.dim),
      L("pink84           (steven)", c.ok),
      L("1 password hash cracked. Now: su steven  (password: pink84)", c.warn),
    ];
  }

  // ---------------- pending password prompts ----------------
  private handlePending(input: string): OutLine[] {
    const p = this.pending!;
    this.pending = null;
    if (p.type === "ssh-pass") {
      if (p.user === "michael" && input === "michael") {
        this.s.location = "remote";
        this.s.remoteUser = "michael";
        this.s.foothold = true;
        this.cwd = "/home/michael";
        return [
          L("Linux Raven 3.16.0-6-amd64 GNU/Linux", c.dim),
          L("Welcome. Last login: from 192.168.56.10", c.dim),
          L("You have mail.", c.dim),
          L("michael@Raven:~$  (foothold obtained — look around: cd /var/www)", c.ok),
        ];
      }
      return [L("Permission denied, please try again.", c.err), L("(hint: the password is the same as the username)", c.dim)];
    }
    if (p.type === "su-pass") {
      if (p.user === "steven" && input === "pink84") {
        this.s.remoteUser = "steven";
        this.cwd = "/home/steven";
        return [L("steven@Raven:~$  (switched user to steven — try: sudo -l)", c.ok)];
      }
      if (p.user === "root") return [L("su: Authentication failure", c.err)];
      return [L("su: Authentication failure", c.err), L("(crack steven's hash from wp_users to get the password)", c.dim)];
    }
    if (p.type === "mysql-pass") {
      if (input === "R@v3nSecurity") {
        this.mysqlMode = true;
        this.s.dbAccess = true;
        return [
          L("Welcome to the MySQL monitor.  Commands end with ;", c.dim),
          L("Server version: 5.5.60 MariaDB", c.dim),
          L("Type 'show databases;' to begin, 'exit' to leave.", c.info),
        ];
      }
      return [L("ERROR 1045 (28000): Access denied for user 'root'@'localhost'", c.err), L("(the password is in wp-config.php)", c.dim)];
    }
    return [];
  }

  // ---------------- interactive MySQL ----------------
  private mysql(input: string): OutLine[] {
    const q = input.replace(/;+\s*$/, "").trim().toLowerCase();
    if (q === "exit" || q === "quit" || q === "\\q") {
      this.mysqlMode = false;
      return [L("Bye", c.dim)];
    }
    if (q === "show databases") {
      return [
        L("+--------------------+", c.dim),
        L("| Database           |", c.ember),
        L("+--------------------+", c.dim),
        L("| information_schema |"),
        L("| mysql              |"),
        L("| wordpress          |", c.ok),
        L("+--------------------+", c.dim),
      ];
    }
    if (q.startsWith("use ")) {
      this.mysqlDb = q.slice(4).trim();
      return [L(`Database changed`, c.ok)];
    }
    if (q === "show tables") {
      if (this.mysqlDb !== "wordpress") return [L("ERROR: No database selected. Run: use wordpress;", c.err)];
      this.s.showedTables = true; // outcome: enumerated the tables
      return [
        L("+-----------------------+", c.dim),
        L("| Tables_in_wordpress   |", c.ember),
        L("+-----------------------+", c.dim),
        L("| wp_options            |"),
        L("| wp_posts              |", c.ok),
        L("| wp_users              |", c.ok),
        L("| wp_usermeta           |"),
        L("+-----------------------+", c.dim),
      ];
    }
    if (q.includes("from wp_posts")) {
      if (this.mysqlDb !== "wordpress") return [L("ERROR: run 'use wordpress;' first", c.err)];
      this.s.wpPostsDumped = true;
      return [
        L("+----+-------------+---------------------------------------------+", c.dim),
        L("| ID | post_status | post_content                                |", c.ember),
        L("+----+-------------+---------------------------------------------+", c.dim),
        L("|  1 | publish     | Welcome to Raven                            |"),
        L(`|  2 | auto-draft  | ${FLAG3}   |`, c.ember),
        L(`|  3 | auto-draft  | ${FLAG4}   |`, c.ember),
        L("+----+-------------+---------------------------------------------+", c.dim),
        L("Two flags hidden in draft posts — nice misconfiguration.", c.warn),
      ];
    }
    if (q.includes("from wp_users")) {
      if (this.mysqlDb !== "wordpress") return [L("ERROR: run 'use wordpress;' first", c.err)];
      this.s.wpUsersDumped = true;
      return [
        L("+----+------------+------------------------------------+", c.dim),
        L("| ID | user_login | user_pass                          |", c.ember),
        L("+----+------------+------------------------------------+", c.dim),
        L("|  1 | michael    | $P$Bk3VD9O...(bcrypt)              |"),
        L("|  2 | steven     | $P$Bk3VD9jsxxx/loJoqNsURgHiaB23j7W |", c.ok),
        L("+----+------------+------------------------------------+", c.dim),
        L("Save steven's hash and crack it (john/hashcat) → pink84.", c.warn),
      ];
    }
    if (!q) return [];
    return [L(`ERROR 1064: check the MySQL syntax near '${input}'`, c.err)];
  }

  private help(): OutLine[] {
    const list = this.s.location === "attacker" ? RAVEN_COMMANDS_ATTACKER : RAVEN_COMMANDS_REMOTE;
    return [
      L(this.s.location === "attacker" ? "Attacker machine (kali) — commands:" : "Raven box — commands:", c.ember),
      L("  " + list.join("  "), c.dim),
      L("Use the Browser tab for web recon (view page source!).", c.info),
    ];
  }
}

function idLine(user: string): string {
  if (user === "root") return "uid=0(root) gid=0(root) groups=0(root)";
  if (user === "steven") return "uid=1001(steven) gid=1001(steven) groups=1001(steven)";
  return "uid=1000(michael) gid=1000(michael) groups=1000(michael)";
}

function lcp(arr: string[]): string {
  if (!arr.length) return "";
  let p = arr[0];
  for (const s of arr) {
    while (!s.startsWith(p)) p = p.slice(0, -1);
    if (!p) return "";
  }
  return p;
}
