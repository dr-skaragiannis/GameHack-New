import {
  dir,
  file,
  getNode,
  parentAndName,
  resolvePath,
  type FileNode,
  type TermLine,
  type Terminal,
} from "./terminal";

const ETTER = `# etter.dns — HackForge lab copy of a DNS spoof config (educational)
# This file is a TEXT example. Never use spoofing outside a lab you own.

microsoft.com A 10.10.10.8
*.microsoft.com A 10.10.10.8
WWW.HACKFORGE.LAB A 10.10.10.8
hackforge.lab A 10.10.10.8
*.hackforge.lab A 10.10.10.8

# MX / NS playground
hackforge.lab MX 10 mail.hackforge.lab
mail.hackforge.lab A 10.10.10.9

# operator workstation
192.168.1.13 ptr kali.hackforge.lab
`;

const INDEX_HTML = `<!DOCTYPE html>
<html>
<head><title>Apache2 Debian Default Page</title></head>
<body>
<h1>Apache2 Debian Default Page</h1>
<p>It works! This is the HackForge Sudo_Run web root at /var/www/html/index.html</p>
</body>
</html>
`;

export function sudoRunFS(): FileNode {
  return dir("/", [
    dir("root", [
      file(
        "hackforge.txt",
        "Welcome to HackForge — Linux for Beginners (Sudo_Run).\nKeep notes here. Practice every command in the lab, not on the internet.\n"
      ),
      file(
        "hackforge.in",
        "Visit WWW.HACKFORGE.LAB for the lab portal.\nWWW banners should be rewritten to www with sed.\nHackForge — not articles, a forge.\n"
      ),
      file(
        "simple_bash.sh",
        "#!/bin/bash\necho \"HackForge scanner starting\"\necho \"Sudo_Run lab — simulated only\"\n# echo is here so grep can find it\n"
      ),
      file("scanning_script.sh", "#!/bin/bash\necho \"scheduled scan at HackForge\"\n"),
      file("first_script", "#!/bin/bash\necho \"Hello World\"\n"),
      file(
        "welcome.sh",
        "#!/bin/bash\necho \"What is your name?\"\nread name\necho \"Welcome, $name\"\n"
      ),
      file(
        "scanner",
        "#!/bin/bash\necho \"Enter the ip address\"\n# nmap -sn $ip/24 | grep scan | cut -d \" \" -f 5\nnmap -sn 10.10.10.0/24\n"
      ),
      dir("Desktop", [
        file("CTF-notes.txt", "CTF lab notes for Sudo_Run.\nFLAG{sudo_run_desktop}\n"),
        file("todo.txt", "1. Learn pwd/whoami/ls\n2. Never test systems you do not own\n"),
      ]),
      dir("Documents", [file(".keep", "")]),
      dir("ignite_screenshots", []),
    ], "drwx------"),
    dir("home", [
      dir("Raj", [file(".keep", "")], "drwxr-xr-x", "Raj", "ignite"),
      dir("ignite", [file("readme.txt", "ignite team home on the Sudo_Run box.\n")], "drwxr-xr-x", "ignite", "ignite"),
      dir("operator", [file("welcome.txt", "You can also work from /home/operator.\n")]),
    ]),
    dir("etc", [
      file("hostname", "kali\n"),
      file(
        "passwd",
        "root:x:0:0:root:/root:/bin/bash\nRaj:x:1001:1001:Raj:/home/Raj:/bin/bash\nignite:x:1002:1002:Ignite:/home/ignite:/bin/bash\noperator:x:1000:1000:Operator:/home/operator:/bin/bash\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nmysql:x:27:27::/nonexistent:/bin/false\n"
      ),
      file("group", "root:x:0:\nignite:x:1002:Raj,ignite\nRaj:x:1001:\noperator:x:1000:\n"),
      file("hosts", "127.0.0.1 localhost\n127.0.1.1 kali\n10.10.10.8 hackforge.lab www.hackforge.lab\n192.168.0.11 ubuntu.lab\n"),
      file("resolv.conf", "nameserver 8.8.8.8\n"),
      file(
        "crontab",
        "# /etc/crontab: system crontab (HackForge lab)\nSHELL=/bin/sh\nPATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin\n# m h dom mon dow user command\n17 *    * * *   root    cd / && run-parts --report /etc/cron.hourly\n"
      ),
      dir("ettercap", [file("etter.dns", ETTER)]),
      dir("Ettercap", [file("etter.dns", ETTER)]),
      dir("apt", [
        file(
          "sources.list",
          "deb http://http.kali.org/kali kali-rolling main contrib non-free non-free-firmware\n# Add extra repos only when you understand the risk.\n# HackForge lab — do not add experimental repos.\n"
        ),
      ]),
      dir("ssh", [file("sshd_config", "Port 22\nPermitRootLogin no\nPasswordAuthentication yes\n")]),
      dir("init.d", [file("mysql", "#!/bin/sh\n# mysql init script (simulated)\n"), file("apache2", "#!/bin/sh\n")]),
      dir("rc2.d", []),
    ]),
    dir("opt", [
      dir("labs", [file("hackforge", "HackForge marker file used by find / -type f -name hackforge\nFLAG{sudo_run_find}\n")]),
      dir("CTF", [file("readme", "CTF leftovers live here for the locate command.\n")]),
    ]),
    dir("usr", [
      dir("bin", [
        file("git", "ELF simulated git binary\n"),
        file("ls", "ELF\n"),
        file("nmap", "ELF\n"),
        file("ssh-agent", "ELF\n"),
      ]),
      dir("sbin", [file("sshd", "ELF\n")]),
      dir("share", [
        dir("man", [dir("man1", [file("git.1", "GIT(1)  git — the stupid content tracker\n")])]),
        dir("wordlists", [file("CTF.txt", "CTF wordlist stub\n")]),
        dir("volatility", [file("README", "volatility framework help lives behind: volatility --help\n")]),
      ]),
    ]),
    dir("var", [
      dir("www", [dir("html", [file("index.html", INDEX_HTML)])]),
      dir("log", [file("syslog", "Apr 12 08:00:01 kali systemd[1]: Started HackForge Sudo_Run services.\n")]),
    ]),
    dir("tmp", []),
    dir("dev", [file("null", "")]),
  ]);
}

function writeFile(t: Terminal, path: string, content: string, append = false): boolean {
  const p = resolvePath(t, path);
  const { parent, name } = parentAndName(p);
  const dirn = getNode(t.fs, parent);
  if (!dirn || dirn.type !== "dir" || !dirn.children || !name) return false;
  const existing = dirn.children[name];
  if (existing && existing.type === "file") {
    existing.content = append ? (existing.content || "") + content : content;
    return true;
  }
  dirn.children[name] = file(name, content);
  return true;
}

function copyNode(n: FileNode): FileNode {
  return {
    ...n,
    children: n.children
      ? Object.fromEntries(Object.entries(n.children).map(([k, v]) => [k, copyNode(v)]))
      : undefined,
  };
}

function walk(node: FileNode, path: string, acc: { path: string; node: FileNode }[]) {
  acc.push({ path: path || "/", node });
  if (node.type === "dir" && node.children) {
    for (const [k, c] of Object.entries(node.children)) {
      walk(c, (path === "/" ? "" : path) + "/" + k, acc);
    }
  }
}

function chmodMode(n: FileNode, spec: string) {
  const map: Record<string, string> = {
    "0": "---",
    "1": "--x",
    "2": "-w-",
    "3": "-wx",
    "4": "r--",
    "5": "r-x",
    "6": "rw-",
    "7": "rwx",
  };
  if (/^\d{3,4}$/.test(spec)) {
    const padded = spec.padStart(4, "0");
    const special = padded[0];
    const rwx = map[padded[1]] + map[padded[2]] + map[padded[3]];
    let prefix = n.type === "dir" ? "d" : "-";
    let body = rwx;
    if (special === "4") {
      body = body.slice(0, 2) + "s" + body.slice(3);
      n.mode = prefix + body;
      return;
    }
    if (special === "2") {
      body = body.slice(0, 5) + "s" + body.slice(6);
      n.mode = prefix + body;
      return;
    }
    n.mode = prefix + body;
    return;
  }
  if (spec === "+x" || spec === "u+x" || spec === "a+x") {
    const m = n.mode || "-rw-r--r--";
    n.mode = m.slice(0, 3) + "x" + m.slice(4);
  }
}

type Ctx = {
  cmd: string;
  args: string[];
  rest: string[];
  pos: string[];
  flags: Set<string>;
  input: string;
  print: (text: string, kind?: TermLine["kind"]) => void;
  stdin?: string | null;
};

export function handleSudoRun(t: Terminal, ctx: Ctx): boolean {
  const { cmd, pos, rest, flags, input, print } = ctx;
  const stdin = ctx.stdin ?? null;

  if (t.ftp) {
    return handleFtp(t, input, print);
  }

  switch (cmd) {
    case "locate": {
      const q = pos[0] || "";
      t.flags.add("locate");
      const acc: { path: string; node: FileNode }[] = [];
      walk(t.fs, "/", acc);
      const hits = acc.filter((a) => a.path.toLowerCase().includes(q.toLowerCase()) || a.node.name.toLowerCase().includes(q.toLowerCase()));
      print(hits.map((h) => h.path).join("\n") || "");
      if (/ctf/i.test(q)) t.flags.add("locate-ctf");
      return true;
    }
    case "whereis": {
      const bin = pos[0] || "";
      t.flags.add("whereis");
      print(`${bin}: /usr/bin/${bin} /usr/share/man/man1/${bin}.1`);
      if (bin === "git") t.flags.add("whereis-git");
      return true;
    }
    case "which": {
      if (!pos[0]) return false;
      t.flags.add("which");
      if (pos[0] === "git") t.flags.add("which-git");
      print(`/usr/bin/${pos[0]}`);
      return true;
    }
    case "nl": {
      const p = resolvePath(t, pos[0] || "");
      const n = getNode(t.fs, p);
      if (!n || n.type !== "file") {
        print("nl: no such file", "err");
        return true;
      }
      t.filesRead.push(p);
      t.flags.add("nl");
      print(
        (n.content || "")
          .split("\n")
          .map((l, i) => `${String(i + 1).padStart(6)}  ${l}`)
          .join("\n")
      );
      return true;
    }
    case "sed": {
      t.flags.add("sed");
      const expr = rest.find((a) => a.startsWith("s/") || a.includes("/")) || pos[0] || "";
      const target = pos[pos.length - 1];
      const p = resolvePath(t, target);
      const n = getNode(t.fs, p);
      const text = n?.type === "file" ? n.content || "" : stdin || "";
      const m = expr.match(/s\/([^/]+)\/([^/]*)\/([gip]*)/);
      if (m) {
        const re = new RegExp(m[1], m[3].includes("g") ? "g" : "");
        const out = text.replace(re, m[2]);
        print(out.replace(/\n$/, ""));
        if (/WWW/.test(m[1]) && /www/.test(m[2])) t.flags.add("sed-www");
      } else print(text);
      return true;
    }
    case "cut": {
      t.flags.add("cut");
      const dIdx = rest.indexOf("-d");
      const fIdx = rest.indexOf("-f");
      const delim = dIdx >= 0 ? rest[dIdx + 1].replace(/^["']|["']$/g, "") : " ";
      const field = fIdx >= 0 ? parseInt(rest[fIdx + 1], 10) : 1;
      const src = stdin || "";
      print(
        src
          .split("\n")
          .map((l) => l.split(delim)[field - 1] || "")
          .join("\n")
      );
      return true;
    }
    case "cp": {
      if (pos.length < 2) {
        print("cp: missing operand", "err");
        return true;
      }
      const src = getNode(t.fs, resolvePath(t, pos[0]));
      const destPath = resolvePath(t, pos[1]);
      if (!src) {
        print("cp: no such file", "err");
        return true;
      }
      const { parent, name } = parentAndName(destPath);
      let dirn = getNode(t.fs, destPath);
      if (dirn && dirn.type === "dir" && dirn.children) {
        dirn.children[src.name] = copyNode(src);
      } else {
        dirn = getNode(t.fs, parent);
        if (dirn && dirn.type === "dir" && dirn.children) dirn.children[name] = { ...copyNode(src), name };
      }
      t.flags.add("cp");
      return true;
    }
    case "mv": {
      if (pos.length < 2) {
        print("mv: missing operand", "err");
        return true;
      }
      const srcP = resolvePath(t, pos[0]);
      const destP = resolvePath(t, pos[1]);
      const src = getNode(t.fs, srcP);
      if (!src) {
        print("mv: no such file", "err");
        return true;
      }
      const { parent: sp, name: sn } = parentAndName(srcP);
      const sdir = getNode(t.fs, sp);
      let destDir = getNode(t.fs, destP);
      if (destDir && destDir.type === "dir" && destDir.children) {
        destDir.children[src.name] = copyNode(src);
      } else {
        const { parent, name } = parentAndName(destP);
        destDir = getNode(t.fs, parent);
        if (destDir && destDir.type === "dir" && destDir.children) destDir.children[name] = { ...copyNode(src), name };
      }
      if (sdir && sdir.children) delete sdir.children[sn];
      t.flags.add("mv");
      return true;
    }
    case "rm": {
      const rec = flags.has("r") || flags.has("R") || rest.includes("-r") || rest.includes("-rf");
      const p = resolvePath(t, pos[0] || "");
      const { parent, name } = parentAndName(p);
      const dirn = getNode(t.fs, parent);
      const node = getNode(t.fs, p);
      if (!node || !dirn?.children) {
        print("rm: no such file", "err");
        return true;
      }
      if (node.type === "dir" && !rec) {
        print("rm: is a directory (use rm -r)", "err");
        return true;
      }
      delete dirn.children[name];
      t.flags.add("rm");
      return true;
    }
    case "rmdir": {
      const p = resolvePath(t, pos[0] || "");
      const { parent, name } = parentAndName(p);
      const dirn = getNode(t.fs, parent);
      const node = getNode(t.fs, p);
      if (!node || node.type !== "dir") {
        print("rmdir: failed", "err");
        return true;
      }
      const kids = Object.keys(node.children || {}).filter((k) => k !== ".keep");
      if (kids.length) {
        print("rmdir: Directory not empty (use rm -r)", "err");
        return true;
      }
      if (dirn?.children) delete dirn.children[name];
      t.flags.add("rmdir");
      return true;
    }
    case "chown": {
      const who = pos[0];
      const p = resolvePath(t, pos[1] || "");
      const n = getNode(t.fs, p);
      if (!n || !who) {
        print("chown: usage: chown USER FILE", "err");
        return true;
      }
      n.owner = who;
      t.flags.add("chown");
      if (who === "Raj") t.flags.add("chown-raj");
      return true;
    }
    case "chgrp": {
      const g = pos[0];
      const p = resolvePath(t, pos[1] || "");
      const n = getNode(t.fs, p);
      if (!n || !g) {
        print("chgrp: usage: chgrp GROUP FILE", "err");
        return true;
      }
      n.group = g;
      t.flags.add("chgrp");
      if (g === "ignite") t.flags.add("chgrp-ignite");
      return true;
    }
    case "chmod": {
      const spec = pos[0] || rest.find((a) => a.startsWith("+") || /^\d/.test(a)) || "";
      const p = resolvePath(t, pos[1] || pos[0] || "");
      const n = getNode(t.fs, p);
      if (!n) {
        const n2 = getNode(t.fs, resolvePath(t, pos[pos.length - 1] || ""));
        if (!n2) {
          print("chmod: no such file", "err");
          return true;
        }
        chmodMode(n2, spec.replace(/^\+/, "+") === spec && spec.startsWith("+") ? spec : spec);
        t.flags.add("chmod");
        if (spec.includes("4644") || spec.startsWith("4")) t.flags.add("suid");
        if (spec.includes("2466") || spec.startsWith("2")) t.flags.add("sgid");
        if (spec.includes("+x")) t.flags.add("chmod-x");
        return true;
      }
      const realSpec = /^\d|^[ugoa]*[-+=]/.test(pos[0] || "") || (pos[0] || "").startsWith("+") ? pos[0] : spec;
      chmodMode(n, realSpec);
      t.flags.add("chmod");
      if (/4644/.test(input)) t.flags.add("suid");
      if (/2466/.test(input)) t.flags.add("sgid");
      if (/\+x/.test(input)) t.flags.add("chmod-x");
      return true;
    }
    case "apt-cache":
    case "apt":
    case "apt-get": {
      const sub = cmd === "apt-cache" ? pos[0] : pos[0];
      t.flags.add("apt");
      if (cmd === "apt-cache" && (sub === "search" || pos[0] === "search")) {
        t.flags.add("apt-search");
        print(`hydra - very fast network logon cracker
libhydra - hydra library (lab)
qhydra - qt frontend`);
        return true;
      }
      const action = pos[0];
      const packages = pos.slice(1);
      const pkg = packages[0] || "";
      if (action === "search") {
        t.flags.add("apt-search");
        print(`hydra - very fast network logon cracker`);
        return true;
      }
      if (action === "install") {
        if (!packages.length) {
          print("E: install requires at least one package name", "err");
          return true;
        }
        packages.forEach((packageName) => t.packages.add(packageName));
        t.flags.add("apt-install");
        print(`Reading package lists... Done
Building dependency tree... Done
The following NEW packages will be installed:
  ${packages.join("  ")}
0 upgraded, ${packages.length} newly installed.
${packages.map((packageName) => `Unpacking ${packageName} ...\nSetting up ${packageName} (lab) ...`).join("\n")}`);
        return true;
      }
      if (action === "remove") {
        t.flags.add("apt-remove");
        print(`Reading package lists... Done
The following packages will be REMOVED:
  ${pkg}
Do you want to continue? [Y/n] n
Abort.`);
        return true;
      }
      if (action === "purge") {
        t.flags.add("apt-purge");
        print(`The following packages will be REMOVED:
  ${pkg}*
Do you want to continue? [Y/n] n
Abort.`);
        return true;
      }
      if (action === "update") {
        t.flags.add("apt-update");
        print(`Hit:1 http://http.kali.org/kali kali-rolling InRelease
Reading package lists... Done`);
        return true;
      }
      if (action === "upgrade") {
        t.flags.add("apt-upgrade");
        print(`Calculating upgrade... Done
0 upgraded, 0 newly installed, 0 to remove.`);
        return true;
      }
      print("apt: try search | install | remove | purge | update | upgrade");
      return true;
    }
    case "iwconfig": {
      t.flags.add("iwconfig");
      print(`lo        no wireless extensions.

eth0      no wireless extensions.

wlan0     IEEE 802.11  ESSID:off/any
          Mode:Managed  Access Point: Not-Associated
          Retry short limit:7   RTS thr:off   Fragment thr:off
          Power Management:on`);
      return true;
    }
    case "ifconfig": {
      if (pos[0] === "eth0" && pos[1] === "down") {
        t.net.up = false;
        t.flags.add("if-down");
        return true;
      }
      if (pos[0] === "eth0" && pos[1] === "up") {
        t.net.up = true;
        t.flags.add("if-up");
        return true;
      }
      if (pos[0] === "eth0" && pos[1] === "hw" && pos[2] === "ether") {
        t.net.mac = pos[3] || t.net.mac;
        t.flags.add("mac-spoof");
        print(`ether ${t.net.mac}`);
        return true;
      }
      if (pos[0] === "eth0" && pos[1] && /^\d+\.\d+\.\d+\.\d+$/.test(pos[1])) {
        t.net.ip = pos[1];
        t.flags.add("ip-set");
        print(`eth0 inet ${t.net.ip}`);
        return true;
      }
      return false;
    }
    case "dhclient": {
      t.net.ip = "10.10.10.42";
      t.flags.add("dhclient");
      print(`Listening on LPF/eth0
DHCPREQUEST of ${t.net.ip} on eth0
bound to ${t.net.ip} -- renewal in 1800 seconds.`);
      return true;
    }
    case "dig": {
      t.flags.add("dig");
      const target = (pos[0] || "hackforge.lab").replace(/\/$/, "");
      const rec = (pos[1] || "A").toLowerCase();
      if (rec === "mx") {
        t.flags.add("dig-mx");
        print(`;; ANSWER SECTION:
${target}.    300 IN MX 10 mail.hackforge.lab.`);
      } else if (rec === "ns") {
        t.flags.add("dig-ns");
        print(`;; ANSWER SECTION:
${target}.    300 IN NS ns1.hackforge.lab.`);
      } else {
        t.flags.add("dig-a");
        print(`;; ANSWER SECTION:
${target}.    300 IN A 10.10.10.8`);
      }
      return true;
    }
    case "ps": {
      t.flags.add("ps");
      const all = rest.includes("aux") || flags.has("a") || flags.has("u") || flags.has("x") || /aux/.test(input);
      if (all) t.flags.add("ps-aux");
      const rows = t.procs.filter((p) => p.alive);
      if (!all) {
        print("  PID TTY          TIME CMD\n" + rows.slice(0, 4).map((p) => ` ${p.pid} pts/0    00:00:00 ${p.cmd.split(" ").pop()}`).join("\n"));
      } else {
        print(
          "USER       PID %CPU %MEM COMMAND\n" +
            rows.map((p) => `${p.user.padEnd(8)} ${String(p.pid).padStart(5)} ${p.cpu}  ${p.mem}  ${p.cmd}`).join("\n")
        );
      }
      return true;
    }
    case "top": {
      t.flags.add("top");
      print(
        `top - HackForge lab (refreshes conceptually)
PID USER      %CPU %MEM COMMAND
${t.procs
  .filter((p) => p.alive)
  .sort((a, b) => parseFloat(b.cpu) - parseFloat(a.cpu))
  .map((p) => `${p.pid} ${p.user}  ${p.cpu}  ${p.mem}  ${p.cmd}`)
  .join("\n")}`
      );
      return true;
    }
    case "nice": {
      t.flags.add("nice");
      print(`nice: launched ${pos[pos.length - 1] || "process"} with adjusted priority (simulated)`);
      return true;
    }
    case "renice": {
      t.flags.add("renice");
      const pid = parseInt(pos[1] || pos[0], 10);
      const pr = t.procs.find((p) => p.pid === pid);
      if (pr) pr.nice = parseInt(pos[0], 10);
      print(`${pid}: old priority 0, new priority ${pos[0]}`);
      return true;
    }
    case "kill": {
      t.flags.add("kill");
      const sig = rest.find((a) => a.startsWith("-")) || "-15";
      const pid = parseInt(pos[pos.length - 1], 10);
      const pr = t.procs.find((p) => p.pid === pid);
      if (pr) pr.alive = false;
      if (sig === "-9") t.flags.add("kill-9");
      else t.flags.add("kill-1");
      print(`killed ${pid} with ${sig}`);
      return true;
    }
    case "jobs": {
      t.flags.add("jobs");
      print(t.jobs.map((j, i) => `[${i + 1}]  Running  ${j.cmd} &`).join("\n") || "");
      return true;
    }
    case "fg": {
      t.flags.add("fg");
      const j = t.jobs[0];
      print(j ? j.cmd : "fg: current: no such job");
      return true;
    }
    case "at": {
      t.flags.add("at");
      print(`warning: commands will be executed using /bin/sh
at> (type a command then Ctrl-D in a real shell)
job 1 at ${pos.join(" ") || "now"}`);
      return true;
    }
    case "set":
    case "env": {
      if (cmd === "set") t.flags.add("set");
      print(Object.entries(t.env).map(([k, v]) => `${k}=${v}`).join("\n"));
      return true;
    }
    case "export": {
      t.flags.add("export");
      const kv = pos[0] || "";
      if (kv.includes("=")) {
        const [k, v] = kv.split("=");
        t.env[k] = v;
      } else if (pos[0] && t.env[pos[0]] !== undefined) {
        t.flags.add("export-hist");
      }
      return true;
    }
    case "unset": {
      t.flags.add("unset");
      if (pos[0]) delete t.env[pos[0]];
      return true;
    }
    case "service": {
      const name = pos[0];
      const act = pos[1];
      if (!name || !act) {
        print("usage: service NAME start|stop|status|restart", "err");
        return true;
      }
      t.flags.add("service");
      t.flags.add("service-" + name + "-" + act);
      if (act === "start" || act === "restart") t.services[name] = "running";
      if (act === "stop") t.services[name] = "stopped";
      if (act === "status") {
        const st = t.services[name] || "inactive";
        print(`● ${name}.service — ${st}
   Active: ${st === "running" ? "active (running)" : st}`);
      } else print(`${act}ing ${name} (simulated).`);
      return true;
    }
    case "crontab": {
      t.flags.add("crontab");
      if (rest.includes("-e") || flags.has("e")) {
        t.flags.add("crontab-e");
        print(`# editing crontab with nano (simulated)
# add a line like:
# 55 23 * * * /root/scanner
${t.crontab.join("\n")}`);
        if (/55\s+23/.test(input) || true) {
          /* student may type crontab then later echo */
        }
        return true;
      }
      if (rest.includes("-l")) {
        print(t.crontab.join("\n"));
        return true;
      }
      print("usage: crontab -e | crontab -l");
      return true;
    }
    case "update-rc.d": {
      t.flags.add("update-rc");
      print(`update-rc.d: enabling ${pos[0]} defaults (simulated)`);
      if (pos[0] === "mysql") t.flags.add("rc-mysql");
      return true;
    }
    case "ftp": {
      t.ftp = { host: pos[0] || "ftp.forge.lab", user: null, cwd: "/" };
      t.flags.add("ftp");
      print(`Connected to ${t.ftp.host}.
220 HackForge FTP server (simulated)
Name (${t.ftp.host}:root):`);
      return true;
    }
    case "volatility": {
      t.flags.add("volatility-help");
      print(`Volatility Foundation Volatility Framework
-h, --help   show help message and exit
Plugins: pslist, netscan, filescan (lab stub)`);
      return true;
    }
    case "bash":
    case "sh": {
      const script = pos[0];
      if (!script) {
        print("bash: interactive shell not needed in this lab");
        return true;
      }
      return runScript(t, resolvePath(t, script), print);
    }
    case "nano":
    case "vi":
    case "vim": {
      const bg = /&\s*$/.test(input);
      if (bg) {
        t.jobs.push({ pid: 7100 + t.jobs.length, cmd: input.replace(/&\s*$/, "").trim() });
        t.flags.add("bg");
        print(`[1] ${t.jobs[t.jobs.length - 1].pid}`);
        return true;
      }
      const p = pos[0] ? resolvePath(t, pos[0]) : "";
      if (p.includes("sources.list")) {
        t.flags.add("nano-sources");
        t.filesRead.push(p);
        const n = getNode(t.fs, p);
        print(n?.content || "");
        return true;
      }
      if (p.includes("/etc/hosts")) {
        t.flags.add("nano-hosts");
        t.filesRead.push(p);
        print(getNode(t.fs, p)?.content || "");
        return true;
      }
      if (p.includes("index.html")) {
        t.flags.add("nano-index");
        t.filesRead.push(p);
        print(getNode(t.fs, p)?.content || "");
        return true;
      }
      if (p.includes("crontab")) {
        t.flags.add("crontab-e");
        return true;
      }
      if (p) {
        t.flags.add("nano");
        const n = getNode(t.fs, p);
        if (!n) writeFile(t, p, "");
        print(`(simulated editor) opened ${p} — contents saved.`);
        return true;
      }
      return false;
    }
    default:
      break;
  }

  if (cmd.startsWith("./") || cmd.startsWith("/")) {
    return runScript(t, resolvePath(t, cmd), print);
  }

  if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(input.trim()) && !input.includes(" ")) {
    const [k, v] = input.trim().split("=");
    t.env[k] = v.replace(/^["']|["']$/g, "");
    t.flags.add("assign");
    if (k === "HISTSIZE") t.flags.add("histsize");
    if (/url/i.test(k)) t.flags.add("url-var");
    return true;
  }

  return false;
}

function runScript(t: Terminal, p: string, print: Ctx["print"]): boolean {
  const n = getNode(t.fs, p);
  if (!n || n.type !== "file") return false;
  t.flags.add("run-script");
  const c = n.content || "";
  if (/Hello World/i.test(c)) {
    print("Hello World");
    t.flags.add("hello-script");
  }
  if (/What is your name/i.test(c) || /read name/.test(c)) {
    print("What is your name?\nWelcome, operator");
    t.flags.add("read-script");
  }
  if (/nmap|scanner| -s[nP] /i.test(c) || p.endsWith("scanner")) {
    t.flags.add("run-scanner");
    print(`Starting Nmap 7.94 ( simulated ping scan )
Nmap scan report for 10.10.10.1
Nmap scan report for 10.10.10.5
Nmap scan report for 10.10.10.8
Nmap scan report for 10.10.10.12`);
  }
  if (/echo /.test(c) && !t.flags.has("hello-script")) {
    const m = c.match(/echo\s+"([^"]+)"/);
    if (m) print(m[1]);
  }
  return true;
}

function handleFtp(t: Terminal, input: string, print: Ctx["print"]): boolean {
  const line = input.trim();
  if (!t.ftp) return false;
  if (!t.ftp.user) {
    t.ftp.user = line || "anonymous";
    print("331 Please specify the password.");
    t.flags.add("ftp-user");
    return true;
  }
  if (!t.flags.has("ftp-pass")) {
    t.flags.add("ftp-pass");
    print("230 Login successful. Use ls, cd, get, bye.");
    return true;
  }
  if (line === "ls" || line === "dir") {
    print(`drwxr-xr-x  ubuntu
-rw-r--r--  welcome.txt
drwxr-xr-x  release`);
    t.flags.add("ftp-ls");
    return true;
  }
  if (line.startsWith("cd ")) {
    t.ftp.cwd += "/" + line.slice(3);
    print("250 Directory successfully changed.");
    return true;
  }
  if (line.startsWith("get ")) {
    const name = line.slice(4).trim();
    writeFile(t, "/root/" + name.replace(/^.*\//, ""), "HackForge FTP souvenir\n");
    t.flags.add("ftp-get");
    print(`local: ${name} remote: ${name}
226 Transfer complete.`);
    return true;
  }
  if (line === "bye" || line === "quit" || line === "exit") {
    t.ftp = null;
    t.flags.add("ftp-bye");
    print("221 Goodbye.");
    return true;
  }
  print("ftp> (try ls, cd ubuntu/release, get favicon.ico, bye)");
  return true;
}

export function applyRedirect(t: Terminal, _left: string, dest: string, append: boolean, text: string) {
  writeFile(t, dest, text.endsWith("\n") ? text : text + "\n", append);
  t.flags.add("redir");
  if (dest.includes("resolv.conf")) t.flags.add("dns-set");
  if (dest.includes("valueofHISTSIZE")) t.flags.add("hist-save");
  if (dest.includes("crontab") || /scanner/.test(text)) t.flags.add("cron-line");
}

export function splitPipes(input: string): string[] {
  const out: string[] = [];
  let cur = "";
  let q: string | null = null;
  for (const ch of input) {
    if (q) {
      cur += ch;
      if (ch === q) q = null;
    } else if (ch === "'" || ch === '"') {
      q = ch;
      cur += ch;
    } else if (ch === "|") {
      out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}
