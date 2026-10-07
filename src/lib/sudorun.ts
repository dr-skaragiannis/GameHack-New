import {
  dir,
  displayPath,
  file,
  getNode,
  normalize,
  parentAndName,
  resolvePath,
  type FileNode,
  type TermLine,
  type Terminal,
} from "./terminal";

const ETTER = `# etter.dns — GameHack lab copy of a DNS spoof config (educational)
# This file is a TEXT example. Never use spoofing outside a lab you own.

microsoft.com A 10.10.10.8
*.microsoft.com A 10.10.10.8
WWW.gamehack.lab A 10.10.10.8
gamehack.lab A 10.10.10.8
*.gamehack.lab A 10.10.10.8

# MX / NS playground
gamehack.lab MX 10 mail.gamehack.lab
mail.gamehack.lab A 10.10.10.9

# operator workstation
192.168.1.13 ptr kali.gamehack.lab
`;

const INDEX_HTML = `<!DOCTYPE html>
<html>
<head><title>Apache2 Debian Default Page</title></head>
<body>
<h1>Apache2 Debian Default Page</h1>
<p>It works! This is the GameHack Sudo_Run web root at /var/www/html/index.html</p>
</body>
</html>
`;

export function sudoRunFS(): FileNode {
  return dir("/", [
    dir("root", [
      file(
        "gamehack.txt",
        "Welcome to GameHack — Linux for Beginners (Sudo_Run).\nKeep notes here. Practice every command in the lab, not on the internet.\n"
      ),
      file(
        "gamehack.in",
        "Visit WWW.gamehack.lab for the lab portal.\nWWW banners should be rewritten to www with sed.\nLinux training portal (simulated).\n"
      ),
      file(
        "simple_bash.sh",
        "#!/bin/bash\necho \"GameHack scanner starting\"\necho \"Sudo_Run lab — simulated only\"\n# echo is here so grep can find it\n"
      ),
      file(
        "scanner",
        "#!/bin/bash\necho \"Enter the lab IP address (10.10.10.2)\"\nread ip\necho \"GameHack uses only its fixed fictional subnet.\"\n# Authorized real-world pattern: nmap -sn \"$ip\"/24 after read ip.\n# GameHack runs only the fixed fixture subnet below.\nnmap -sn 10.10.10.0/24 | grep scan | cut -d \" \" -f 5 | head -n -1\n",
        "-rwxr-xr-x",
      ),
      file("scanning_script.sh", "#!/bin/bash\necho \"scheduled scan at GameHack\"\n"),
      file("first_script", "#!/bin/bash\necho \"Hello World\"\n"),
      file(
        "welcome.sh",
        "#!/bin/bash\necho \"What is your name?\"\nread name\necho \"Welcome, $name\"\n"
      ),
      file(
        "scanner",
        "#!/bin/bash\necho \"Enter the ip address\"\n# nmap -sn $ip/24 | grep scan | cut -d \" \" -f 5\nnmap -sn 10.10.10.0/24\n"
      ),
      file(
        ".bashrc",
        "# Virtual startup file for Linux for Beginners #2\n# Add session-specific exports below this line.\n"
      ),
      dir("linux-beginners-2", [
        file(
          "README.txt",
          "Linux for Beginners #2 — sandbox notes\nAll network devices, processes, schedules, and variables in these exercises are simulated.\nUse only the reserved gamehack.lab names and the files inside this virtual filesystem.\n"
        ),
        dir("network", [
          file(
            "interfaces.txt",
            "eth0  wired  10.10.10.2/24  MAC 08:00:27:12:34:56\nwlan0 wireless  simulated, not associated\nlo    loopback 127.0.0.1\n"
          ),
          file(
            "dns-records.txt",
            "gamehack.lab A 10.10.10.8\ngamehack.lab MX 10 mail.gamehack.lab\ngamehack.lab NS ns1.gamehack.lab\nmail.gamehack.lab A 10.10.10.9\n"
          ),
          file(
            "hosts-plan.txt",
            "# Local-only training mapping\n10.10.10.30 docs.gamehack.lab\n"
          ),
        ]),
        dir("processes", [
          file(
            "roster.txt",
            "PID 7440  training-worker --batch  (safe to renice or stop in this lab)\nPID 7441  training-reporter           (SIGHUP demonstration)\nPID 7442  training-cleanup             (SIGKILL demonstration)\n"
          ),
          file(
            "schedule-notes.txt",
            "Use at 21:30 /root/scanning_script.sh to record a one-time virtual job; the script is never run.\nUse echo '30 21 * * * /root/scanning_script.sh' | crontab - to record a recurring entry, then inspect it with crontab -l.\nCrontab fields are minute hour day-of-month month day-of-week followed by the command.\nAll schedule changes remain in this player's simulated workspace and never run on the host.\n"
          ),
          file("notes.txt", "Training editor fixture. No host process is started.\n"),
        ]),
        dir("environment", [
          file(
            "variable-notes.txt",
            "HISTSIZE begins at 1000 in the virtual shell. Save its value before experimenting.\nA shell assignment lasts for the current shell; export passes it to child commands.\n"
          ),
          file("defaults.txt", "LAB_MODE is unset until the learner creates it.\n"),
        ]),
      ]),
      dir("linux-beginners-3", [
        file(
          "README.txt",
          "Linux for Beginners #3 fixtures\nAll Bash, cron, boot-service, Apache, SSH, and FTP behavior in this course is simulated in this player’s one persistent virtual filesystem.\nThe only scan target is the fictional 10.10.10.0/24 subnet. Public FTP hosts and real host services are blocked.\n"
        ),
        file("first_script", "#!/bin/bash\necho \"Hello World\"\n"),
        file(
          "welcome.sh",
          "#!/bin/bash\necho \"What is your name?\"\nread name\necho \"Welcome, $name\"\n"
        ),
        file(
          "scanner",
          "#!/bin/bash\necho \"Enter the lab IP address (10.10.10.2)\"\nread ip\necho \"GameHack uses only its fixed fictional subnet.\"\n# Authorized real-world pattern: nmap -sn \"$ip\"/24 expands the value read above.\n# The simulator ignores user input and runs only the fixed fixture subnet below.\nnmap -sn 10.10.10.0/24 | grep scan | cut -d \" \" -f 5 | head -n -1\n"
        ),
        file(
          "runlevels.txt",
          "Traditional SysV runlevel reference (the exact meaning can vary by distribution):\n0  halt / stop the system\n1  single-user or rescue mode\n2  multi-user mode\n3  multi-user mode\n4  multi-user mode\n5  multi-user mode\n6  reboot\n\nThese are teaching notes only; GameHack never changes the host boot mode.\n"
        ),
        file(
          "cron-reference.txt",
          "Per-user crontab: minute hour day-of-month month day-of-week command\nExample: 55 23 * * * /root/scanner  (every day at 23:55; six parts total)\n/etc/crontab adds a username between the five time fields and the command (seven columns).\nThe simulator records rows per player but never executes scheduled commands.\n"
        ),
        file(
          "service-reference.txt",
          "Apache page: /var/www/html/index.html\nSSH fixture: ignite@192.168.0.11 (fictional ubuntu.lab)\nFTP fixture: ftp.gamehack.lab -> /ubuntu/release/favicon.ico\nPublic FTP hosts and telnet connections are blocked by the simulator.\n"
        ),
        file("head-fixture.txt", "first\nsecond\nlast\n"),
      ]),
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
    dir("srv", [
      dir("ftp", [
        file("welcome.txt", "GameHack FTP fixture. Files here are fictional text examples.\n"),
        dir("ubuntu", [
          file("readme.txt", "Browse into release for the training download.\n"),
          dir("release", [
            file("favicon.ico", "GameHack-FAKE-FAVICON\nBinary image data is not stored or served.\n"),
            file("release-notes.txt", "Fictional FTP release fixture for Linux for Beginners #3.\n"),
          ]),
        ]),
      ]),
    ]),
    dir("etc", [
      file("hostname", "kali\n"),
      file(
        "passwd",
        "root:x:0:0:root:/root:/bin/bash\nRaj:x:1001:1001:Raj:/home/Raj:/bin/bash\nignite:x:1002:1002:Ignite:/home/ignite:/bin/bash\noperator:x:1000:1000:Operator:/home/operator:/bin/bash\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nmysql:x:27:27::/nonexistent:/bin/false\n"
      ),
      file("group", "root:x:0:\nignite:x:1002:Raj,ignite\nRaj:x:1001:\noperator:x:1000:\n"),
      file("hosts", "127.0.0.1 localhost\n127.0.1.1 kali\n10.10.10.8 gamehack.lab www.gamehack.lab\n192.168.0.11 ubuntu.lab\n"),
      file("resolv.conf", "nameserver 10.10.10.53\n"),
      file(
        "crontab",
        "# /etc/crontab: system crontab (GameHack lab)\nSHELL=/bin/sh\nPATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin\n# m h dom mon dow user command\n17 *    * * *   root    cd / && run-parts --report /etc/cron.hourly\n"
      ),
      dir("ettercap", [file("etter.dns", ETTER)]),
      dir("Ettercap", [file("etter.dns", ETTER)]),
      dir("apt", [
        file(
          "sources.list",
          "deb http://http.kali.org/kali kali-rolling main contrib non-free non-free-firmware\n# Add extra repos only when you understand the risk.\n# GameHack lab — do not add experimental repos.\n"
        ),
      ]),
      dir("ssh", [file("sshd_config", "Port 22\nPermitRootLogin no\nPasswordAuthentication yes\n")]),
      dir("init.d", [
        file("mysql", "#!/bin/sh\n# mysql init script (simulated; never executed on the host)\n"),
        file("apache2", "#!/bin/sh\n# apache2 init script (simulated; never executed on the host)\n"),
        file("cron", "#!/bin/sh\n# cron init script (simulated; never executed on the host)\n"),
      ]),
      dir("rc0.d", []),
      dir("rc1.d", []),
      dir("rc2.d", []),
      dir("rc3.d", []),
      dir("rc4.d", []),
      dir("rc5.d", []),
      dir("rc6.d", []),
    ]),
    dir("opt", [
      dir("labs", [file("gamehack", "GameHack marker file used by find / -type f -name gamehack\nFLAG{sudo_run_find}\n")]),
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
      dir("log", [file("syslog", "Apr 12 08:00:01 kali systemd[1]: Started GameHack Sudo_Run services.\n")]),
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

function setVirtualServiceProcess(t: Terminal, service: string, running: boolean): void {
  if (service !== "mysql") return;
  let process = t.procs.find((candidate) => candidate.cmd.startsWith("mysqld "));
  if (running) {
    if (process) process.alive = true;
    else {
      process = { pid: 3410, user: "mysql", cpu: "0.1", mem: "1.2", cmd: "mysqld --defaults-file=/etc/mysql/my.cnf", nice: 0, alive: true };
      t.procs.push(process);
    }
  } else if (process) {
    process.alive = false;
  }
}

function setVirtualRcLinks(t: Terminal, service: string, action: "defaults" | "enable" | "disable" | "remove"): void {
  const startLevels = action === "defaults" || action === "enable" ? [2, 3, 4, 5] : [];
  const stopLevels = action === "disable" ? [0, 1, 2, 3, 4, 5, 6] : [0, 1, 6];
  for (let level = 0; level <= 6; level += 1) {
    const directory = getNode(t.fs, `/etc/rc${level}.d`);
    if (!directory || directory.type !== "dir" || !directory.children) continue;
    for (const name of Object.keys(directory.children)) {
      if (/^[SK]\d{2}/.test(name) && name.endsWith(service)) delete directory.children[name];
    }
    if (action === "remove") continue;
    const startsHere = startLevels.includes(level);
    const stopsHere = stopLevels.includes(level);
    if (!startsHere && !stopsHere) continue;
    const prefix = startsHere ? "S" : "K";
    const linkName = `${prefix}01${service}`;
    const link = file(linkName, `../init.d/${service}`, "lrwxrwxrwx", "root", "root");
    link.linkTarget = `../init.d/${service}`;
    link.linkDisplayTarget = `../init.d/${service}`;
    directory.children[linkName] = link;
  }
}

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
      const rootPath = resolvePath(t, "/");
      const root = getNode(t.fs, rootPath);
      const acc: { path: string; node: FileNode }[] = [];
      if (root) walk(root, rootPath, acc);
      const hits = acc.filter((a) => a.path.toLowerCase().includes(q.toLowerCase()) || a.node.name.toLowerCase().includes(q.toLowerCase()));
      print(hits.map((h) => displayPath(t, h.path)).join("\n") || `locate: no matches for '${q}'`);
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
      const delimiterOption = rest.find((value) => value.startsWith("-d") && value !== "-d");
      const delimiterIndex = rest.indexOf("-d");
      const fieldOption = rest.find((value) => value.startsWith("-f") && value !== "-f");
      const fieldIndex = rest.indexOf("-f");
      const delimiter = (delimiterOption?.slice(2) || (delimiterIndex >= 0 ? rest[delimiterIndex + 1] : ":"))
        .replace(/^["']|["']$/g, "") || ":";
      const fieldSpec = fieldOption?.slice(2) || (fieldIndex >= 0 ? rest[fieldIndex + 1] : "1") || "1";
      const field = Math.max(1, Number.parseInt(fieldSpec.split(",")[0], 10) || 1);
      const path = pos.find((value) => !/^\d+$/.test(value));
      let source = stdin;
      if (source == null && path) {
        const resolved = resolvePath(t, path);
        const node = getNode(t.fs, resolved);
        if (!node || node.type !== "file") {
          print(`cut: ${path}: No such file or not a regular file`, "err");
          return true;
        }
        source = node.content || "";
        t.filesRead.push(resolved);
      }
      if (source == null) {
        print("cut: missing input (provide a file or pipeline)", "err");
        return true;
      }
      const selected = source.split(/\r?\n/).map((line) => line.split(delimiter)[field - 1] || "");
      print(selected.join("\n"));
      t.flags.add("cut");
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
      let destinationName = name;
      if (dirn && dirn.type === "dir" && dirn.children) {
        destinationName = src.name;
      } else {
        dirn = getNode(t.fs, parent);
      }
      if (!dirn || dirn.type !== "dir" || !dirn.children || !destinationName) {
        print(`cp: cannot create '${pos[1]}': No such directory`, "err");
        return true;
      }
      dirn.children[destinationName] = { ...copyNode(src), name: destinationName };
      t.flags.add("cp");
      print(`Copied ${pos[0]} to ${pos[1]} in the virtual filesystem.`);
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
      let destinationName = src.name;
      if (!(destDir && destDir.type === "dir" && destDir.children)) {
        const { parent, name } = parentAndName(destP);
        destDir = getNode(t.fs, parent);
        destinationName = name;
      }
      if (!sdir?.children || !destDir || destDir.type !== "dir" || !destDir.children || !destinationName) {
        print(`mv: cannot move '${pos[0]}' to '${pos[1]}': No such directory`, "err");
        return true;
      }
      destDir.children[destinationName] = { ...copyNode(src), name: destinationName };
      delete sdir.children[sn];
      t.flags.add("mv");
      print(`Moved ${pos[0]} to ${pos[1]} in the virtual filesystem.`);
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
      print(`Removed virtual ${node.type}: ${pos[0]}`);
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
      print(`Removed empty virtual directory: ${pos[0]}`);
      return true;
    }
    case "chown": {
      const who = pos[0];
      const target = pos[1] || "";
      const p = resolvePath(t, target);
      const n = getNode(t.fs, p);
      if (!n || !who || !target) {
        print("chown: usage: chown USER[:GROUP] FILE", "err");
        return true;
      }
      const [owner, group] = who.split(":");
      n.owner = owner;
      if (group) n.group = group;
      t.flags.add("chown");
      if (owner === "Raj") t.flags.add("chown-raj");
      print(`Changed ownership of ${target} to ${who}.`);
      return true;
    }
    case "chgrp": {
      const g = pos[0];
      const target = pos[1] || "";
      const p = resolvePath(t, target);
      const n = getNode(t.fs, p);
      if (!n || !g || !target) {
        print("chgrp: usage: chgrp GROUP FILE", "err");
        return true;
      }
      n.group = g;
      t.flags.add("chgrp");
      if (g === "ignite") t.flags.add("chgrp-ignite");
      print(`Changed group of ${target} to ${g}.`);
      return true;
    }
    case "chmod": {
      const modeIndex = pos.findIndex((value) => /^\d{3,4}$/.test(value) || /^[ugoa]*[+-=][rwxXstugo]+$/.test(value) || /^[+-][rwxXstugo]+$/.test(value));
      const spec = modeIndex >= 0 ? pos[modeIndex] : rest.find((value) => value.startsWith("+") || /^\d/.test(value)) || "";
      const target = pos.filter((_value, index) => index !== modeIndex).pop() || "";
      const p = resolvePath(t, target);
      const node = getNode(t.fs, p, false);
      if (!node || !spec || !target) {
        print("chmod: usage: chmod MODE FILE", "err");
        return true;
      }
      chmodMode(node, spec);
      t.flags.add("chmod");
      if (/4644/.test(spec)) t.flags.add("suid");
      if (/2466/.test(spec)) t.flags.add("sgid");
      if (/\+x/.test(spec)) t.flags.add("chmod-x");
      print(`Mode of ${target} changed to ${node.mode || spec}.`);
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
      if (cmd === "apt-cache" && sub === "show") {
        const packageName = pos[1] || "";
        if (!packageName) print("E: apt-cache show requires a package name", "err");
        else print(`Package: ${packageName}\nVersion: 1.0-lab\nArchitecture: all\nDescription: Fictional GameHack training package ${packageName}.`);
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
        print("eth0: interface is down (simulated)");
        return true;
      }
      if (pos[0] === "eth0" && pos[1] === "up") {
        t.net.up = true;
        t.flags.add("if-up");
        print("eth0: interface is up (simulated)");
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
      const target = (pos[0] || "gamehack.lab").replace(/\/$/, "");
      const rec = (pos[1] || "A").toLowerCase();
      if (rec === "mx") {
        t.flags.add("dig-mx");
        print(`;; ANSWER SECTION:
${target}.    300 IN MX 10 mail.gamehack.lab.`);
      } else if (rec === "ns") {
        t.flags.add("dig-ns");
        print(`;; ANSWER SECTION:
${target}.    300 IN NS ns1.gamehack.lab.`);
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
      const processes = t.procs.filter((process) => process.alive);
      const zombies = processes.filter((process) => /\[zombie/i.test(process.cmd)).length;
      const running = processes.length > zombies ? 1 : 0;
      const sleeping = Math.max(0, processes.length - running - zombies);
      let markedRunning = false;
      const rows = processes
        .sort((a, b) => parseFloat(b.cpu) - parseFloat(a.cpu))
        .map((process) => {
          const isZombie = /\[zombie/i.test(process.cmd);
          const state = isZombie ? "Z" : markedRunning ? "S" : "R";
          if (!isZombie && !markedRunning) markedRunning = true;
          return `${String(process.pid).padStart(5)} ${process.user.padEnd(8)} 20 ${String(process.nice).padStart(2)}  64M   8M   4M ${state} ${String(process.cpu).padStart(4)} ${String(process.mem).padStart(4)} 0:00.08 ${process.cmd}`;
        });
      print(
        `top - 09:00:00 up 2 days, 1 user, load average: 0.04, 0.08, 0.09 — GameHack virtual snapshot
` +
          `Tasks: ${processes.length} total, ${running} running, ${sleeping} sleeping, 0 stopped, ${zombies} zombie${zombies === 1 ? "" : "s"}
` +
          `%Cpu(s): 2.1 us, 0.7 sy, 0.0 ni, 97.2 id
` +
          `MiB Mem : 1024.0 total, 384.0 used, 512.0 free, 128.0 buff/cache
` +
          `MiB Swap: 0.0 total, 0.0 used, 0.0 free
` +
          `PID USER     PR NI VIRT RES SHR S %CPU %MEM TIME+ COMMAND
` +
          rows.join("\n"),
      );
      return true;
    }
    case "nice": {
      t.flags.add("nice");
      const priorityMatch = input.match(/(?:^|\s)-n\s+(-?\d+)/);
      const requested = priorityMatch ? Number.parseInt(priorityMatch[1], 10) : 10;
      const priority = Math.max(-20, Math.min(19, requested));
      const command = input.trim().replace(/^nice\s+/, "").replace(/(?:^|\s)-n\s+-?\d+/, "").trim();
      print(`would start ${command || "process"} with nice ${priority} (simulated; positive values lower scheduling priority)`);
      return true;
    }
    case "renice": {
      t.flags.add("renice");
      const requested = Number.parseInt(pos[0] || "", 10);
      const pid = Number.parseInt(pos[1] || "", 10);
      if (!Number.isFinite(requested) || requested < -20 || requested > 19) {
        print("renice: priority must be between -20 and 19", "err");
        return true;
      }
      const pr = t.procs.find((process) => process.pid === pid && process.alive);
      if (!pr) {
        print(`renice: failed to get priority for ${pid}: no such process`, "err");
        return true;
      }
      const previous = pr.nice;
      pr.nice = requested;
      print(`${pid}: old priority ${previous}, new priority ${requested}`);
      return true;
    }
    case "kill": {
      t.flags.add("kill");
      const signalArg = rest.find((argument) => /^-(?:\d+|[A-Za-z]+)$/.test(argument)) || "-15";
      const signalToken = signalArg.slice(1).toUpperCase();
      const signalNames: Record<string, string> = {
        "1": "SIGHUP", HUP: "SIGHUP", SIGHUP: "SIGHUP",
        "2": "SIGINT", INT: "SIGINT", SIGINT: "SIGINT",
        "9": "SIGKILL", KILL: "SIGKILL", SIGKILL: "SIGKILL",
        "15": "SIGTERM", TERM: "SIGTERM", SIGTERM: "SIGTERM",
      };
      const signalName = signalNames[signalToken] || `SIG${signalToken}`;
      const pid = Number.parseInt(pos[pos.length - 1] || "", 10);
      const process = t.procs.find((entry) => entry.pid === pid && entry.alive);
      if (!Number.isFinite(pid) || !process) {
        print(`kill: (${Number.isFinite(pid) ? pid : "?"}) - No such process`, "err");
        return true;
      }
      if (signalName === "SIGHUP") t.flags.add("kill-1");
      if (signalName === "SIGTERM") {
        t.flags.add("kill-term");
        process.alive = false;
      }
      if (signalName === "SIGKILL") {
        t.flags.add("kill-9");
        process.alive = false;
      }
      if (signalName === "SIGINT") process.alive = false;
      print(signalName === "SIGHUP"
        ? `sent SIGHUP to ${pid}; outcome depends on the process (simulated).`
        : `sent ${signalName} to ${pid}; process ${process.alive ? "remains running" : "stopped"} (simulated).`);
      return true;
    }
    case "jobs": {
      t.flags.add("jobs");
      print(t.jobs.map((j, i) => `[${i + 1}]  Running  ${j.cmd} &`).join("\n") || "No active simulated background jobs.");
      return true;
    }
    case "fg": {
      t.flags.add("fg");
      const requestedJob = pos[0] || "%1";
      const requestedIndex = Number.parseInt(requestedJob.replace(/^%/, ""), 10);
      const index = Number.isFinite(requestedIndex) && requestedIndex > 0 ? requestedIndex - 1 : t.jobs.length - 1;
      const [job] = index >= 0 ? t.jobs.splice(index, 1) : [];
      print(job
        ? `${job.cmd}\n[foreground job resumed in the simulator; no host process was started]`
        : `fg: ${requestedJob === "%1" ? "current" : requestedJob}: no such job`);
      return true;
    }
    case "at": {
      t.flags.add("at");
      const time = pos[0] || "";
      const command = pos.slice(1).join(" ").trim();
      if (!time) {
        print("usage: at TIME COMMAND... (simulated; command is recorded, never run on the host)", "err");
        return true;
      }
      if (!command) {
        t.atPendingTime = time;
        print(`at ${time}> enter one command on the next line; the simulator will queue it and return to the prompt without running it. Type Ctrl-D to cancel in a real interactive shell.`);
        return true;
      }
      const id = t.atQueue.length + 1;
      t.atQueue.push({ id, time, command });
      print(`job ${id} queued for ${time}: ${command} (simulated; not executed)`);
      return true;
    }
    case "set": {
      t.flags.add("set");
      print(Object.entries(t.shellVars).map(([key, value]) => `${key}=${value}`).join("\n"));
      return true;
    }
    case "env": {
      print(Object.entries(t.env).map(([key, value]) => `${key}=${value}`).join("\n"));
      return true;
    }
    case "export": {
      t.flags.add("export");
      const declaration = pos[0] || "";
      if (declaration.includes("=")) {
        const separator = declaration.indexOf("=");
        const key = declaration.slice(0, separator);
        const value = declaration.slice(separator + 1).replace(/^["']|["']$/g, "");
        t.shellVars[key] = value;
        t.env[key] = value;
        if (key === "HISTSIZE") t.flags.add("export-hist");
        print(`${key} exported for this virtual shell.`);
      } else if (declaration && t.shellVars[declaration] !== undefined) {
        t.env[declaration] = t.shellVars[declaration];
        if (declaration === "HISTSIZE") t.flags.add("export-hist");
        print(`${declaration}=${t.shellVars[declaration]} exported for this virtual shell.`);
      } else if (declaration) {
        print(`export: ${declaration} is not set`, "err");
      } else {
        print(Object.entries(t.env).map(([key, value]) => `declare -x ${key}="${value}"`).join("\n"));
      }
      return true;
    }
    case "unset": {
      if (!pos[0]) {
        print("unset: missing variable name", "err");
        return true;
      }
      t.flags.add("unset");
      const existed = Object.prototype.hasOwnProperty.call(t.shellVars, pos[0]) || Object.prototype.hasOwnProperty.call(t.env, pos[0]);
      delete t.shellVars[pos[0]];
      delete t.env[pos[0]];
      print(existed ? `Removed ${pos[0]} from the virtual shell.` : `${pos[0]} was not set.`);
      return true;
    }
    case "service": {
      const name = pos[0];
      const act = pos[1];
      if (!name || !act || !["start", "stop", "status", "restart"].includes(act)) {
        print("usage: service NAME start|stop|status|restart", "err");
        return true;
      }
      t.flags.add("service");
      t.flags.add("service-" + name + "-" + act);
      if (act === "start" || act === "restart") {
        t.services[name] = "running";
        setVirtualServiceProcess(t, name, true);
      }
      if (act === "stop") {
        t.services[name] = "stopped";
        setVirtualServiceProcess(t, name, false);
      }
      if (act === "status") {
        const st = t.services[name] || "inactive";
        print(`● ${name}.service — ${st}
   Active: ${st === "running" ? "active (running)" : st}`);
      } else print(`${act === "restart" ? "restarting" : act === "stop" ? "stopping" : "starting"} ${name} (simulated).`);
      return true;
    }
    case "crontab": {
      t.flags.add("crontab");
      if (rest.includes("-") && stdin !== null) {
        const entries = stdin.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
        if (!entries.length) {
          print("crontab: refusing to install an empty simulated table", "err");
          return true;
        }
        t.crontab = ["# m h dom mon dow command", ...entries];
        t.flags.add("crontab-install");
        print(`installed ${entries.length} recurring entry${entries.length === 1 ? "" : "ies"} in the virtual crontab (not executed)`);
        return true;
      }
      if (rest.includes("-e") || flags.has("e")) {
        t.flags.add("crontab-e");
        t.crontabEditorPending = true;
        print(`Select an editor:\n1. /bin/nano\n2. /usr/bin/vim.tiny\nChoose 1-2 [1]:`);
        return true;
      }
      if (rest.includes("-l")) {
        print(t.crontab.join("\n"));
        return true;
      }
      print("usage: crontab -e | crontab -l | crontab - (read entries from a simulated pipe)");
      return true;
    }
    case "update-rc.d": {
      const service = pos[0];
      const action = pos[1] as "defaults" | "enable" | "disable" | "remove" | undefined;
      if (!service || !action || !["defaults", "enable", "disable", "remove"].includes(action)) {
        print("usage: update-rc.d SERVICE defaults|enable|disable|remove", "err");
        return true;
      }
      const initScript = getNode(t.fs, `/etc/init.d/${service}`);
      if (!initScript || initScript.type !== "file") {
        print(`update-rc.d: unknown virtual init script '${service}'`, "err");
        return true;
      }
      t.flags.add("update-rc");
      t.flags.add(`rc-${service}-${action}`);
      if (action === "defaults" || action === "enable") {
        t.bootServices[service] = "enabled";
        t.flags.add(`rc-${service}`);
        setVirtualRcLinks(t, service, action);
        print(`update-rc.d: ${service} enabled for the simulated default runlevels 2, 3, 4 and 5.`);
      } else if (action === "disable") {
        t.bootServices[service] = "disabled";
        setVirtualRcLinks(t, service, action);
        print(`update-rc.d: ${service} disabled for future simulated boots.`);
      } else {
        delete t.bootServices[service];
        setVirtualRcLinks(t, service, action);
        print(`update-rc.d: removed virtual rc links for ${service}; the init script and installed service remain.`);
      }
      return true;
    }
    case "reboot": {
      t.flags.add("reboot");
      const started: string[] = [];
      for (const [service, bootState] of Object.entries(t.bootServices)) {
        const running = bootState === "enabled";
        t.services[service] = running ? "running" : "stopped";
        setVirtualServiceProcess(t, service, running);
        if (running) started.push(service);
      }
      const syslog = getNode(t.fs, "/var/log/syslog");
      if (syslog?.type === "file") {
        syslog.content = `${syslog.content || ""}GameHack: simulated reboot; virtual services updated (${started.join(", ") || "none"}).\n`;
      }
      print(`GameHack reboot simulated; only virtual boot-enabled services were updated.\nStarted: ${started.join(", ") || "none"}. No host reboot occurred.`);
      return true;
    }
    case "read": {
      const variable = pos[0] || "REPLY";
      const value = variable === "ip" ? "10.10.10.2" : "operator";
      t.shellVars[variable] = value;
      t.flags.add("read");
      print(`${variable}=${value} (simulated input)`);
      return true;
    }
    case "telnet": {
      t.flags.add("telnet-blocked");
      print("telnet is plaintext and disabled for connections; use the simulated SSH lesson instead.");
      return true;
    }
    case "ftp": {
      const host = (pos[0] || "ftp.gamehack.lab").toLowerCase();
      if (host !== "ftp.gamehack.lab") {
        t.flags.add("ftp-external-blocked");
        print(`ftp: external host '${host}' is blocked in this lab. Use ftp ftp.gamehack.lab; no connection was attempted.`, "err");
        return true;
      }
      t.ftp = { host, user: null, cwd: "/", authenticated: false };
      t.flags.add("ftp");
      print(`Connected to ${host}.
220 GameHack FTP server (simulated)
Name (${host}:root):`);
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
      return runScript(t, resolvePath(t, script), print, true);
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
        if (!n) {
          writeFile(t, p, "");
          print(`(simulated editor) created ${p} in the virtual filesystem.`);
          return true;
        }
        if (n.type === "file") {
          t.filesRead.push(p);
          print(`(simulated editor preview) ${p}\n${n.content || ""}\nUse supported VFS redirection commands to save changes.`);
        } else {
          print(`nano: ${p}: Is a directory`, "err");
        }
        return true;
      }
      return false;
    }
    default:
      break;
  }

  if (cmd.startsWith("./") || cmd.startsWith("/")) {
    return runScript(t, resolvePath(t, cmd), print, false);
  }

  if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(input.trim()) && !input.includes(" ")) {
    const [k, v] = input.trim().split("=");
    const value = v.replace(/^["']|["']$/g, "");
    t.shellVars[k] = value;
    if (Object.prototype.hasOwnProperty.call(t.env, k)) t.env[k] = value;
    t.flags.add("assign");
    if (k === "HISTSIZE") t.flags.add("histsize");
    if (/url/i.test(k)) t.flags.add("url-var");
    return true;
  }

  return false;
}

function runScript(t: Terminal, p: string, print: Ctx["print"], viaBash = false): boolean {
  const n = getNode(t.fs, p);
  if (!n || n.type !== "file") return false;
  if (!viaBash && !/[xst]/i.test(n.mode || "")) {
    print(`bash: ${p}: Permission denied (use chmod +x first)`, "err");
    t.lastExit = 126;
    return true;
  }

  t.flags.add("run-script");
  const c = n.content || "";
  const executableText = c.split(/\r?\n/).filter((line) => !line.trim().startsWith("#")).join("\n");
  if (/Hello World/i.test(executableText)) {
    print("Hello World");
    t.flags.add("hello-script");
  }
  if (/What is your name/i.test(executableText) || /read name/.test(executableText)) {
    t.shellVars.name = "operator";
    print("What is your name?\nWelcome, operator");
    t.flags.add("read-script");
  }
  if (/nmap|scanner| -s[nP] /i.test(executableText) || p.endsWith("/scanner")) {
    t.flags.add("run-scanner");
    t.flags.add("nmap");
    t.flags.add("nmap-sn");
    t.flags.add("nmap-sweep");
    if (/echo\s+"Enter/i.test(executableText)) print("Enter the lab IP address (10.10.10.2)");
    if (/read\s+ip/.test(executableText)) {
      t.shellVars.ip = "10.10.10.2";
      print("Simulated input: 10.10.10.2");
    }
    const hasPipeline = /grep\s+scan/.test(executableText) && /cut\s+-d/.test(executableText) && /head\s+-n\s+-1/.test(executableText);
    if (hasPipeline) {
      t.flags.add("grep");
      t.flags.add("cut");
      t.flags.add("head");
      print("10.10.10.5\n10.10.10.8\n10.10.10.12\n10.10.10.21");
    } else {
      print(`Starting Nmap 7.94 ( simulated ping scan )
Nmap scan report for 10.10.10.5 (raven.lab)
Nmap scan report for 10.10.10.8 (web.lab)
Nmap scan report for 10.10.10.12 (ssh.lab)
Nmap scan report for 10.10.10.21 (db.lab)`);
    }
  }
  if (/echo /.test(executableText) && !t.flags.has("hello-script") && !/What is your name/i.test(executableText)) {
    const m = executableText.match(/echo\s+"([^"]+)"/);
    if (m) print(m[1]);
  }
  return true;
}

function handleFtp(t: Terminal, input: string, print: Ctx["print"]): boolean {
  const line = input.trim();
  const session = t.ftp;
  if (!session) return false;

  if (!session.user) {
    session.user = line || "anonymous";
    print("331 Please specify the password.");
    t.flags.add("ftp-user");
    return true;
  }
  if (!session.authenticated) {
    if (session.user !== "anonymous" || line !== "anonymous") {
      t.ftp = null;
      print("530 Login incorrect. The fixture accepts only its anonymous training account.", "err");
      return true;
    }
    session.authenticated = true;
    t.flags.add("ftp-pass");
    t.flags.add("ftp-login");
    print("230 Login successful. Use ls, cd, get, bye.");
    return true;
  }

  if (line === "ls" || line === "dir") {
    const remotePath = normalize(`/srv/ftp/${session.cwd}`);
    const directory = getNode(t.fs, remotePath);
    if (!directory || directory.type !== "dir") {
      print("550 Failed to list directory.", "err");
      return true;
    }
    const rows = Object.values(directory.children || {}).map((node) =>
      `${node.type === "dir" ? "drwxr-xr-x" : "-rw-r--r--"}  ${node.name}`
    );
    print(rows.join("\n") || "(empty directory)");
    t.flags.add("ftp-ls");
    return true;
  }
  if (line.startsWith("cd ")) {
    const requested = line.slice(3).trim();
    const remotePath = normalize(`/srv/ftp/${session.cwd}/${requested}`);
    if (remotePath !== "/srv/ftp" && !remotePath.startsWith("/srv/ftp/")) {
      print("550 Directory is outside the FTP fixture root.", "err");
      return true;
    }
    const destination = getNode(t.fs, remotePath);
    if (!destination || destination.type !== "dir") {
      print("550 Directory not found.", "err");
      return true;
    }
    session.cwd = remotePath.slice("/srv/ftp".length) || "/";
    print("250 Directory successfully changed.");
    return true;
  }
  if (line.startsWith("get ")) {
    const requested = line.slice(4).trim();
    const remotePath = normalize(`/srv/ftp/${session.cwd}/${requested}`);
    if (!remotePath.startsWith("/srv/ftp/")) {
      print("550 File path is outside the FTP fixture root.", "err");
      return true;
    }
    const remoteFile = getNode(t.fs, remotePath);
    if (!remoteFile || remoteFile.type !== "file") {
      print(`550 ${requested}: File not found in the FTP fixture.`, "err");
      return true;
    }
    const localName = requested.split("/").filter(Boolean).at(-1) || "download";
    const localPath = normalize(`${t.cwd}/${localName}`);
    if (!writeFile(t, localPath, remoteFile.content || "")) {
      print(`550 ${requested}: Could not write into the virtual working directory.`, "err");
      return true;
    }
    t.flags.add("ftp-get");
    print(`local: ${localName} remote: ${requested}\n226 Transfer complete.`);
    return true;
  }
  if (line === "bye" || line === "quit" || line === "exit") {
    t.ftp = null;
    t.flags.add("ftp-bye");
    print("221 Goodbye.");
    return true;
  }
  print("ftp> (try ls, cd ubuntu, cd release, get favicon.ico, bye)");
  return true;
}

export function applyRedirect(t: Terminal, _left: string, dest: string, append: boolean, text: string) {
  writeFile(t, dest, text.endsWith("\n") ? text : text + "\n", append);
  t.flags.add("redir");
  if (dest.includes("resolv.conf")) t.flags.add("dns-set");
  if (dest.includes("valueofHISTSIZE") || dest.endsWith("/histsize-before-change.txt")) t.flags.add("hist-save");
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
