import {
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
import { findLinuxCommand } from "./linuxCommandCatalog";

export type SharedCommandContext = {
  cmd: string;
  rest: string[];
  pos: string[];
  flags: Set<string>;
  input: string;
  stdin: string | null;
  print: (text: string, kind?: TermLine["kind"]) => void;
  execute: (input: string, stdin?: string | null) => TermLine[];
};

function canReadVirtualFile(t: Terminal, node: FileNode): boolean {
  return t.isRoot || (node.mode !== "-rw-------" && node.mode !== "drwx------");
}

function readVirtualFile(
  t: Terminal,
  path: string,
  command: string,
  print: SharedCommandContext["print"],
): { path: string; node: FileNode; text: string } | null {
  const resolved = resolvePath(t, path);
  const node = getNode(t.fs, resolved);
  if (!node) {
    print(`${command}: ${path}: No such file or directory`, "err");
    return null;
  }
  if (node.type !== "file") {
    print(`${command}: ${path}: Is a directory`, "err");
    return null;
  }
  if (!canReadVirtualFile(t, node)) {
    print(`${command}: ${path}: Permission denied`, "err");
    return null;
  }
  t.filesRead.push(resolved);
  return { path: resolved, node, text: node.content || "" };
}

function writeVirtualFile(
  t: Terminal,
  path: string,
  text: string,
  append: boolean,
  command: string,
  print: SharedCommandContext["print"],
): boolean {
  const resolved = resolvePath(t, path);
  const { parent, name } = parentAndName(resolved);
  const directory = getNode(t.fs, parent);
  if (!directory || directory.type !== "dir" || !directory.children) {
    print(`${command}: cannot create '${path}': No such directory`, "err");
    return false;
  }
  if (!t.isRoot && directory.mode === "drwx------") {
    print(`${command}: cannot create '${path}': Permission denied`, "err");
    return false;
  }
  const existing = directory.children[name];
  if (existing && existing.type === "dir") {
    print(`${command}: '${path}' is a directory`, "err");
    return false;
  }
  if (append && existing) existing.content = (existing.content || "") + text;
  else directory.children[name] = file(name, text, existing?.mode, existing?.owner || t.user, existing?.group || t.user);
  return true;
}

function nodeBytes(node: FileNode): number {
  if (node.type === "file") return (node.content || "").length;
  return Object.values(node.children || {}).reduce((total, child) => total + nodeBytes(child), 0);
}

function serializeVirtualTree(node: FileNode, path: string): string {
  if (node.type === "file") return `--- ${path} ---\n${node.content || ""}`;
  return Object.values(node.children || {})
    .map((child) => serializeVirtualTree(child, normalize(path + "/" + child.name)))
    .join("\n");
}

function humanSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}K`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}M`;
}

function optionValue(rest: string[], short: string, fallback: number): number {
  const separate = rest.findIndex((value) => value === `-${short}`);
  if (separate >= 0 && /^\d+$/.test(rest[separate + 1] || "")) return Number(rest[separate + 1]);
  const combined = rest.find((value) => new RegExp(`^-${short}\\d+$`).test(value));
  if (combined) return Number(combined.slice(2));
  return fallback;
}

function fixtureFileType(path: string, text: string): string {
  if (/\.png$/i.test(path)) return "PNG image data (fictional text fixture)";
  if (/\.jpe?g$/i.test(path)) return "JPEG image data (fictional text fixture)";
  if (/\.pcapng?$/i.test(path)) return "packet capture fixture (not a live capture)";
  if (/\.evtx$/i.test(path)) return "Windows Event Log text fixture";
  if (/\.sqlite?$/i.test(path)) return "SQLite training export (text fixture)";
  if (/\.(docm|pptx|xlsx)$/i.test(path)) return "Office document training fixture";
  if (/\.sh$/i.test(path)) return "POSIX shell script, ASCII text";
  if (/\.php$/i.test(path)) return "PHP script, ASCII text";
  if (/\.bin$|\.raw$|\.dd$/i.test(path)) return "data (simulated evidence; not executable)";
  if (text.startsWith("#!/")) return "POSIX shell script, ASCII text";
  return "ASCII text";
}

function simulatedDigest(command: string, text: string): string {
  if (text === "test") {
    if (command === "md5sum") return "098f6bcd4621d373cade4e832627b4f6";
    if (command === "sha1sum") return "a94a8fe5ccb19ba61c4c0873d391e987982fbbd3";
    return "9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08";
  }
  const algorithm = command.replace("sum", "");
  return `fixture-only-${algorithm}-digest-not-computed`;
}

function escapeArg(value: string): string {
  return `"${value.replace(/"/g, "").replace(/\\/g, "\\\\")}"`;
}

export function runSharedLinuxCommand(t: Terminal, context: SharedCommandContext): boolean {
  const { cmd, rest, pos, flags, input, stdin, print, execute } = context;
  const first = pos[0];

  switch (cmd) {
    case "awk": {
      const program = pos.find((value) => value.includes("{") && value.includes("}")) || "";
      const path = pos.find((value) => value !== program);
      const fileInput = stdin == null && path ? readVirtualFile(t, path, cmd, print)?.text ?? null : null;
      const source = stdin ?? fileInput;
      if (!program || source == null) {
        print("usage: awk 'PROGRAM' [FILE...] (supported form: {print $N})", "err");
        return true;
      }
      const separatorArg = rest.find((value) => value.startsWith("-F"));
      const separator = separatorArg === "-F"
        ? rest[rest.indexOf("-F") + 1] || " "
        : separatorArg?.slice(2) || " ";
      const field = program.match(/\$([0-9]+)/)?.[1];
      const result = source.split(/\r?\n/).filter((line) => line.length > 0).map((line) => {
        if (!field || field === "0") return line;
        const fields = separator === " " ? line.trim().split(/\s+/) : line.split(separator);
        return fields[Number(field) - 1] || "";
      });
      print(result.join("\n"));
      return true;
    }
    case "basename": {
      if (!first) {
        print("basename: missing operand", "err");
        return true;
      }
      let result = first.replace(/\/+$/, "").split("/").pop() || "/";
      if (pos[1] && result.endsWith(pos[1])) result = result.slice(0, -pos[1].length);
      print(result);
      return true;
    }
    case "dirname": {
      if (!first) {
        print("dirname: missing operand", "err");
        return true;
      }
      const normalized = first.replace(/\/+$/, "");
      const slash = normalized.lastIndexOf("/");
      print(slash < 0 ? "." : slash === 0 ? "/" : normalized.slice(0, slash));
      return true;
    }
    case "dd": {
      const inputPath = input.match(/(?:^|\s)if=([^\s]+)/)?.[1];
      const outputPath = input.match(/(?:^|\s)of=([^\s]+)/)?.[1];
      if (!inputPath || !outputPath) {
        print("dd: training mode requires virtual if=FILE and of=FILE operands", "err");
        return true;
      }
      if (inputPath.startsWith("/dev/") || outputPath.startsWith("/dev/")) {
        print("dd: host devices are unavailable in the HackForge sandbox", "err");
        return true;
      }
      const source = readVirtualFile(t, inputPath, cmd, print);
      if (source && writeVirtualFile(t, outputPath, source.text, false, cmd, print)) {
        print(`${source.text.length} bytes copied (virtual filesystem)`);
      }
      return true;
    }
    case "df": {
      print(`Filesystem      Size  Used Avail Use% Mounted on
virtual-root    8.0G  1.2G  6.8G  15% /
tmpfs           512M     0  512M   0% /tmp`);
      return true;
    }
    case "diff": {
      if (pos.length < 2) {
        print("diff: missing operand\nusage: diff [OPTIONS] FILE1 FILE2", "err");
        return true;
      }
      const left = readVirtualFile(t, pos[0], cmd, print);
      const right = left ? readVirtualFile(t, pos[1], cmd, print) : null;
      if (!left || !right) return true;
      const leftLines = left.text.split(/\r?\n/);
      const rightLines = right.text.split(/\r?\n/);
      if (left.text === right.text) print("");
      else {
        const changes = [
          `--- ${pos[0]}`,
          `+++ ${pos[1]}`,
          ...leftLines.filter((line) => line && !rightLines.includes(line)).map((line) => `-${line}`),
          ...rightLines.filter((line) => line && !leftLines.includes(line)).map((line) => `+${line}`),
        ];
        print(changes.join("\n"));
      }
      return true;
    }
    case "dmesg": {
      print("[    0.000000] Linux version 5.15.0-hackforge (virtual kernel)\n[    1.204812] eth0: simulated lab interface ready\n[    2.014882] HackForge training sandbox initialized; no host devices exposed.");
      return true;
    }
    case "journalctl": {
      const log = getNode(t.fs, resolvePath(t, "/var/log/syslog"));
      const lines = (log?.type === "file" ? log.content || "" : "Apr 12 08:00:01 kali systemd[1]: Started HACKFORGE lab services.").trim().split(/\r?\n/);
      const limit = optionValue(rest, "n", 50);
      print(lines.slice(-Math.max(1, Math.min(100, limit))).join("\n"));
      return true;
    }
    case "du": {
      const targetPath = resolvePath(t, first || ".");
      const node = getNode(t.fs, targetPath);
      if (!node) {
        print(`du: cannot access '${first}': No such file or directory`, "err");
        return true;
      }
      const size = nodeBytes(node);
      const human = flags.has("h") || rest.includes("-sh") || rest.includes("-hs");
      print(`${human ? humanSize(size) : Math.ceil(size / 1024)}\t${first || "."}`);
      return true;
    }
    case "free": {
      print(`              total        used        free      shared  buff/cache   available\nMem:        2097152      524288     1179648       16384      524288     1499136\nSwap:        524288           0      524288`);
      return true;
    }
    case "groups": {
      const user = first || t.user;
      const groups = user === "root" ? "root" : `${user} sudo users`;
      print(`${user} : ${groups}`);
      return true;
    }
    case "gzip": {
      const decompress = rest.includes("-d") || rest.includes("--decompress");
      const path = first;
      if (!path) {
        print("gzip: missing file operand", "err");
        return true;
      }
      if (decompress) {
        const archive = readVirtualFile(t, path, cmd, print);
        if (!archive) return true;
        const match = archive.text.match(/^HACKFORGE-GZIP\n([\s\S]*)$/);
        if (!match) {
          print(`gzip: ${path}: not in simulated gzip format`, "err");
          return true;
        }
        const destination = path.replace(/\.gz$/, "");
        if (writeVirtualFile(t, destination, match[1], false, cmd, print)) print(`decompressed ${path} to ${destination}`);
        return true;
      }
      const source = readVirtualFile(t, path, cmd, print);
      if (!source) return true;
      const destination = path.endsWith(".gz") ? path : `${path}.gz`;
      if (writeVirtualFile(t, destination, `HACKFORGE-GZIP\n${source.text}`, false, cmd, print)) print(`created ${destination} (text-only virtual archive)`);
      return true;
    }
    case "killall":
    case "pkill": {
      const pattern = pos[pos.length - 1] || "";
      if (!pattern) {
        print(`${cmd}: missing process name`, "err");
        return true;
      }
      const matches = t.procs.filter((process) => process.alive && process.cmd.toLowerCase().includes(pattern.toLowerCase()));
      matches.forEach((process) => { process.alive = false; });
      print(matches.length ? `${cmd}: signalled ${matches.length} simulated process${matches.length === 1 ? "" : "es"}` : `${cmd}: no process matched '${pattern}'`);
      return true;
    }
    case "lsof": {
      if (rest.some((value) => value === "-i" || value === "-i:80")) {
        print("COMMAND   PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME\nsshd      412 root    3u  IPv4  10240      0t0  TCP *:22 (LISTEN)\napache2   808 root    4u  IPv4  10241      0t0  TCP *:80 (LISTEN)\n# Simulated sockets only; no host descriptors are exposed.");
      } else {
        const opened = [...new Set(t.filesRead)].slice(-10);
        print("COMMAND  PID USER   FD   NAME\n" + (opened.map((path, index) => `bash     ${1000 + index} ${t.user}   3r   ${displayPath(t, path)}`).join("\n") || `bash     1000 ${t.user} cwd  ${t.cwd}`));
      }
      return true;
    }
    case "ln": {
      const symbolic = rest.includes("-s") || rest.includes("--symbolic");
      const target = pos[0];
      const linkName = pos[1];
      if (!target || !linkName) {
        print("ln: usage: ln [-s] TARGET LINK_NAME", "err");
        return true;
      }
      const targetPath = resolvePath(t, target);
      if (!getNode(t.fs, targetPath, false)) {
        print(`ln: failed to create link '${linkName}': target '${target}' does not exist`, "err");
        return true;
      }
      const linkPath = resolvePath(t, linkName);
      const { parent, name } = parentAndName(linkPath);
      const directory = getNode(t.fs, parent);
      if (!directory || directory.type !== "dir" || !directory.children) {
        print(`ln: failed to create link '${linkName}': No such directory`, "err");
        return true;
      }
      if (directory.children[name]) {
        print(`ln: failed to create link '${linkName}': File exists`, "err");
        return true;
      }
      if (symbolic) {
        const storedTarget = target.startsWith("/") ? targetPath : target;
        directory.children[name] = {
          ...file(name, storedTarget, "lrwxrwxrwx", t.user, t.user),
          linkTarget: storedTarget,
          linkDisplayTarget: target,
        };
        print(`Created virtual symbolic link: ${linkName} -> ${target}`);
      } else {
        directory.children[name] = { ...getNode(t.fs, targetPath)!, name };
        print(`Created virtual hard link: ${linkName} -> ${target}`);
      }
      return true;
    }
    case "mount": {
      if (rest.length === 0) {
        print("/dev/virtual-root on / type ext4 (ro,relatime)\ntmpfs on /tmp type tmpfs (rw,nosuid,nodev)\n# Host mounts and block devices are not exposed.");
      } else {
        print("mount: host devices cannot be mounted in the HackForge sandbox", "err");
      }
      return true;
    }
    case "netstat": {
      print("Active Internet connections (simulated)\nProto Recv-Q Send-Q Local Address       Foreign Address     State\ntcp        0      0 0.0.0.0:22          0.0.0.0:*           LISTEN\ntcp        0      0 0.0.0.0:80          0.0.0.0:*           LISTEN\nNo live host sockets were inspected.");
      return true;
    }
    case "nslookup": {
      if (!first) {
        print("usage: nslookup NAME [SERVER]", "err");
        return true;
      }
      const host = t.hosts.find((item) => item.hostname === first || item.hostname === `${first}.lab` || item.ip === first);
      print(`Server:         10.10.10.1\nAddress:        10.10.10.1#53\n\nName:   ${host?.hostname || first}\nAddress: ${host?.ip || "NXDOMAIN"}`);
      return true;
    }
    case "passwd": {
      print(`Changing password for ${first || t.user}.\nPassword updated successfully (training simulation; no credential was stored).`);
      return true;
    }
    case "paste": {
      let sources: string[] = [];
      if (stdin != null) sources = [stdin.split(/\r?\n/).filter(Boolean).join("\n")];
      else {
        for (const path of pos) {
          const source = readVirtualFile(t, path, cmd, print);
          if (!source) return true;
          sources.push(source.text.replace(/\n$/, ""));
        }
      }
      if (!sources.length) {
        print("paste: missing file operand", "err");
        return true;
      }
      const columns = sources.map((source) => source.split(/\r?\n/));
      const rows = Math.max(...columns.map((column) => column.length));
      print(Array.from({ length: rows }, (_, row) => columns.map((column) => column[row] || "").join("\t")).join("\n"));
      return true;
    }
    case "printf": {
      const format = rest[0];
      if (format == null) {
        print("printf: missing format string", "err");
        return true;
      }
      const values = rest.slice(1);
      let index = 0;
      const rendered = format.replace(/%[-+ #0]*(?:\d+)?(?:\.\d+)?([sdif])/g, (_match, conversion: string) => {
        const value = values[index++] || "";
        if (conversion === "d" || conversion === "i" || conversion === "f") return String(Number(value) || 0);
        return value;
      }).replace(/\\([nrt\\])/g, (_match, escaped: string) => ({ n: "\n", r: "\r", t: "\t", "\\": "\\" })[escaped] || escaped);
      print(rendered.replace(/\n$/, ""));
      return true;
    }
    case "readlink": {
      if (!first) {
        print("readlink: missing operand", "err");
        return true;
      }
      const resolved = resolvePath(t, first);
      const node = getNode(t.fs, resolved, false);
      if (node?.linkTarget) print(node.linkDisplayTarget || (node.linkTarget.startsWith("/") ? displayPath(t, node.linkTarget) : node.linkTarget));
      else if ((rest.includes("-f") || rest.includes("--canonicalize")) && getNode(t.fs, resolved)) print(first.startsWith("/labs") ? resolved : displayPath(t, resolved));
      else print(`readlink: ${first}: Invalid argument`, "err");
      return true;
    }
    case "route": {
      print("Kernel IP routing table\nDestination     Gateway         Genmask         Flags Metric Ref    Use Iface\ndefault         10.10.10.1      0.0.0.0         UG    100    0        0 eth0\n10.10.10.0      0.0.0.0         255.255.255.0   U     100    0        0 eth0");
      return true;
    }
    case "seq": {
      const numbers = pos.map(Number);
      if (!numbers.length || numbers.some((number) => !Number.isFinite(number))) {
        print("seq: missing or invalid numeric argument", "err");
        return true;
      }
      const start = numbers.length === 1 ? 1 : numbers[0];
      const step = numbers.length === 3 ? numbers[1] : 1;
      const end = numbers.length === 1 ? numbers[0] : numbers.length === 2 ? numbers[1] : numbers[2];
      if (step === 0 || Math.abs((end - start) / step) > 500) {
        print("seq: sequence too large or invalid increment", "err");
        return true;
      }
      const output: number[] = [];
      for (let value = start; step > 0 ? value <= end : value >= end; value += step) output.push(value);
      print(output.join("\n"));
      return true;
    }
    case "sha256sum":
    case "sha1sum":
    case "md5sum": {
      if (!first) {
        print(`${cmd}: missing file operand`, "err");
        return true;
      }
      const source = readVirtualFile(t, first, cmd, print);
      if (source) print(`${simulatedDigest(cmd, source.text)}  ${first}`);
      return true;
    }
    case "sleep": {
      const seconds = Number(first || 1);
      if (!Number.isFinite(seconds) || seconds < 0) print("sleep: invalid time interval", "err");
      else print(`sleep: simulated ${seconds}s; returned immediately so the browser stays responsive.`);
      return true;
    }
    case "sort": {
      const path = pos.find((value) => !/^\d+$/.test(value));
      const source = stdin ?? (path ? readVirtualFile(t, path, cmd, print)?.text ?? null : null);
      if (source == null) {
        print("sort: missing input (provide a file or pipeline)", "err");
        return true;
      }
      const rows = source.replace(/\n$/, "").split(/\r?\n/).sort((left, right) => left.localeCompare(right));
      if (rest.includes("-r") || rest.includes("--reverse")) rows.reverse();
      print(rows.join("\n"));
      return true;
    }
    case "stat": {
      if (!first) {
        print("stat: missing operand", "err");
        return true;
      }
      const path = resolvePath(t, first);
      const node = getNode(t.fs, path, false);
      if (!node) {
        print(`stat: cannot statx '${first}': No such file or directory`, "err");
        return true;
      }
      const size = nodeBytes(node);
      const linkTarget = node.linkTarget
        ? node.linkDisplayTarget || (node.linkTarget.startsWith("/") ? displayPath(t, node.linkTarget) : node.linkTarget)
        : "";
      print(`  File: ${first}${linkTarget ? ` -> ${linkTarget}` : ""}\n  Size: ${size}\tBlocks: ${Math.ceil(size / 512)}\tIO Block: 4096 ${node.type === "dir" ? "directory" : "regular file"}\nDevice: virtual\tInode: 1000\tLinks: 1\nAccess: (${node.mode || (node.type === "dir" ? "drwxr-xr-x" : "-rw-r--r--")})\nUid: (${node.owner || t.user})\tGid: (${node.group || t.user})`);
      return true;
    }
    case "strings": {
      if (!first) {
        print("strings: missing file operand", "err");
        return true;
      }
      const source = readVirtualFile(t, first, cmd, print);
      if (source) print(source.text.split(/\r?\n/).filter((line) => line.trim().length >= 4).join("\n"));
      return true;
    }
    case "file": {
      if (!first) {
        print("file: missing file operand", "err");
        return true;
      }
      const source = readVirtualFile(t, first, cmd, print);
      if (source) print(`${first}: ${fixtureFileType(first, source.text)}`);
      return true;
    }
    case "xxd":
    case "hexdump": {
      if (!first) {
        print(`${cmd}: missing file operand`, "err");
        return true;
      }
      const source = readVirtualFile(t, first, cmd, print);
      if (!source) return true;
      const bytes = Array.from(source.text).map((character) => character.charCodeAt(0) & 0xff).slice(0, 128);
      const rows: string[] = [];
      for (let offset = 0; offset < bytes.length; offset += 16) {
        const row = bytes.slice(offset, offset + 16);
        const hex = row.map((byte) => byte.toString(16).padStart(2, "0")).join(" ").padEnd(47, " ");
        const printable = row.map((byte) => byte >= 32 && byte <= 126 ? String.fromCharCode(byte) : ".").join("");
        rows.push(`${offset.toString(16).padStart(8, "0")}: ${hex} ${printable}`);
      }
      print(rows.join("\n") || "(empty file)");
      return true;
    }
    case "uniq": {
      const path = pos[0];
      const source = stdin ?? (path ? readVirtualFile(t, path, cmd, print)?.text ?? null : null);
      if (source == null) {
        print("uniq: missing input (provide a file or pipeline)", "err");
        return true;
      }
      const lines = source.replace(/\n$/, "").split(/\r?\n/);
      const groups: { line: string; count: number }[] = [];
      lines.forEach((line) => {
        const previous = groups[groups.length - 1];
        if (previous?.line === line) previous.count += 1;
        else groups.push({ line, count: 1 });
      });
      print(groups.map(({ line, count }) => rest.includes("-c") ? `${String(count).padStart(7)} ${line}` : line).join("\n"));
      return true;
    }
    case "uptime": {
      print(` ${new Date().toLocaleTimeString()} up 12 days,  4:32,  1 user,  load average: 0.08, 0.11, 0.10 (simulated)`);
      return true;
    }
    case "wc": {
      const path = pos.find((value) => !/^\d+$/.test(value));
      const source = stdin ?? (path ? readVirtualFile(t, path, cmd, print)?.text ?? null : null);
      if (source == null) {
        print("wc: missing input (provide a file or pipeline)", "err");
        return true;
      }
      const lines = source === "" ? 0 : source.split("\n").length - (source.endsWith("\n") ? 1 : 0);
      const words = source.trim() ? source.trim().split(/\s+/).length : 0;
      const bytes = new TextEncoder().encode(source).length;
      const parts = [
        ...(flags.has("l") ? [String(lines)] : []),
        ...(flags.has("w") ? [String(words)] : []),
        ...(flags.has("c") || flags.has("m") ? [String(bytes)] : []),
      ];
      print(`${(parts.length ? parts : [String(lines), String(words), String(bytes)]).join(" ")}${path ? ` ${path}` : ""}`);
      return true;
    }
    case "who": {
      print(`${t.user}     pts/0        ${new Date().toLocaleString()} (hackforge)`);
      return true;
    }
    case "tee": {
      if (stdin == null) {
        print("tee: expected input from a pipeline", "err");
        return true;
      }
      for (const path of pos) {
        if (!writeVirtualFile(t, path, stdin, rest.includes("-a"), cmd, print)) return true;
      }
      print(stdin.replace(/\n$/, ""));
      return true;
    }
    case "tar": {
      const listArchive = rest.some((value) => value.startsWith("-") && value.includes("t"));
      const archivePath = pos[0];
      if (!archivePath) {
        print("tar: missing archive file operand", "err");
        return true;
      }
      if (listArchive) {
        const archive = readVirtualFile(t, archivePath, cmd, print);
        if (!archive) return true;
        const match = archive.text.match(/^HACKFORGE-TAR\n([\s\S]*)$/);
        if (!match) print(`tar: ${archivePath}: not a virtual HackForge archive`, "err");
        else print(match[1].split(/\r?\n/).filter((line) => line.startsWith("--- ")).map((line) => line.slice(4, -4)).join("\n"));
        return true;
      }
      const sourcePaths = pos.slice(1);
      if (!sourcePaths.length) {
        print("tar: no input files specified", "err");
        return true;
      }
      const sources: string[] = [];
      for (const path of sourcePaths) {
        const resolved = resolvePath(t, path);
        const node = getNode(t.fs, resolved);
        if (!node) {
          print(`tar: ${path}: Cannot stat: No such file or directory`, "err");
          return true;
        }
        sources.push(serializeVirtualTree(node, resolved));
      }
      if (writeVirtualFile(t, archivePath, `HACKFORGE-TAR\n${sources.join("\n")}`, false, cmd, print)) {
        print(`${archivePath}: virtual text archive created`);
      }
      return true;
    }
    case "time": {
      const command = rest.filter((value) => !value.startsWith("-")).join(" ");
      if (!command) {
        print("time: missing command", "err");
        return true;
      }
      const result = execute(command, stdin);
      result.filter((line) => line.kind !== "in").forEach((line) => print(line.text, line.kind));
      print("\nreal    0m0.004s\nuser    0m0.001s\nsys     0m0.001s");
      return true;
    }
    case "tr": {
      if (rest.length < 2 && stdin == null) {
        print("tr: missing operand (expected SET1 SET2 and pipeline input)", "err");
        return true;
      }
      const expand = (set: string): string[] => {
        const range = set.match(/^(.)-(.)$/);
        if (range) {
          const start = range[1].charCodeAt(0);
          const end = range[2].charCodeAt(0);
          const step = start <= end ? 1 : -1;
          return Array.from({ length: Math.abs(end - start) + 1 }, (_, index) => String.fromCharCode(start + step * index));
        }
        return Array.from(set.replace(/\\n/g, "\n").replace(/\\t/g, "\t"));
      };
      const from = expand(rest[0] || "");
      const to = expand(rest[1] || "");
      const source = stdin ?? "";
      const translated = Array.from(source).map((character) => {
        const index = from.indexOf(character);
        if (index < 0) return character;
        return to[Math.min(index, Math.max(0, to.length - 1))] || "";
      }).join("");
      print(translated.replace(/\n$/, ""));
      return true;
    }
    case "xargs": {
      if (stdin == null) {
        print("xargs: expected words from a pipeline", "err");
        return true;
      }
      const command = pos[0] || "echo";
      const safeCommands = new Set(["echo", "cat", "wc", "basename", "dirname", "grep", "head", "tail", "sort"]);
      if (!safeCommands.has(command)) {
        print("xargs: only safe text and file commands are enabled in this browser simulator", "err");
        return true;
      }
      const values = stdin.trim().split(/\s+/).filter(Boolean);
      if (!values.length) return true;
      const args = [...pos.slice(1), ...values].map(escapeArg).join(" ");
      const result = execute(`${command}${args ? ` ${args}` : ""}`);
      result.filter((line) => line.kind !== "in").forEach((line) => print(line.text, line.kind));
      return true;
    }
    case "systemctl": {
      const action = pos[0] || "status";
      const unit = (pos[1] || "").replace(/\.service$/, "");
      if (!unit) {
        print("systemctl: missing unit name", "err");
        return true;
      }
      if (action === "start" || action === "restart") t.services[unit] = "running";
      else if (action === "stop") t.services[unit] = "stopped";
      else if (action !== "status" && action !== "is-active" && action !== "enable" && action !== "disable") {
        print(`systemctl: unsupported action '${action}'`, "err");
        return true;
      }
      const state = t.services[unit] || "inactive";
      print(action === "is-active" ? state : `● ${unit}.service - HackForge simulated service\n   Loaded: loaded (/lib/systemd/system/${unit}.service; static)\n   Active: ${state === "running" ? "active (running)" : state}`);
      return true;
    }
    case "exit": {
      print("logout (simulated terminal remains available)", "sys");
      return true;
    }
    case "bash":
    case "sh": {
      if (rest[0] === "-c" || rest[0] === "-lc") {
        const command = rest.slice(1).join(" ");
        if (!command) print(`${cmd}: -c: option requires an argument`, "err");
        else execute(command).filter((line) => line.kind !== "in").forEach((line) => print(line.text, line.kind));
        return true;
      }
      if (!first) {
        print(`${cmd}: interactive shell session is simulated; try -c COMMAND`, "sys");
        return true;
      }
      const script = readVirtualFile(t, first, cmd, print);
      if (script) {
        for (const line of script.text.split(/\r?\n/).map((value) => value.trim()).filter((value) => value && !value.startsWith("#"))) {
          execute(line).filter((entry) => entry.kind !== "in").forEach((entry) => print(entry.text, entry.kind));
        }
      }
      return true;
    }
    case "su": {
      if (t.isRoot) print(`root@${t.host}:~#`, "sys");
      else print("su: Authentication failure. Use a permitted sudo command in this training lab.", "err");
      return true;
    }
    case "type": {
      if (!first) {
        print("type: usage: type NAME...", "err");
        return true;
      }
      const known = !!findLinuxCommand(first) || ["python", "netcat", "submit", "clear", "whoami", "id"].includes(first);
      print(known ? `${first} is /usr/bin/${first}` : `bash: type: ${first}: not found`, known ? "out" : "err");
      return true;
    }
    case "alias": {
      if (first) {
        const aliasValue = first === "ll" ? "ls -alF" : first === "la" ? "ls -A" : null;
        print(aliasValue ? `alias ${first}='${aliasValue}'` : `alias: ${first}: not found`, aliasValue ? "out" : "err");
      } else print("alias ll='ls -alF'\nalias la='ls -A'");
      return true;
    }
    case "unalias": {
      print(first ? `unalias: ${first}: not found` : "unalias: usage: unalias NAME", first ? "err" : "out");
      return true;
    }
    case "source":
    case ".": {
      if (!first) {
        print(`${cmd}: filename argument required`, "err");
        return true;
      }
      const source = readVirtualFile(t, first, cmd, print);
      if (!source) return true;
      for (const line of source.text.split(/\r?\n/).map((value) => value.trim()).filter((value) => value && !value.startsWith("#"))) {
        const result = execute(line);
        result.filter((entry) => entry.kind !== "in").forEach((entry) => print(entry.text, entry.kind));
      }
      return true;
    }
    case "groupadd":
    case "useradd":
    case "usermod": {
      if (!t.isRoot) {
        print(`${cmd}: permission denied; try sudo in the simulated lab`, "err");
        return true;
      }
      print(`${cmd}: ${first || "missing account name"} updated in the virtual account database`);
      return true;
    }
    case "umask": {
      print(first ? `umask: ${first} (simulated)` : "0022");
      return true;
    }
    case "hashdeep":
    case "hash-identifier":
    case "hexedit":
    case "exiftool":
    case "oleid":
    case "oleobj":
    case "olevba":
    case "zsteg":
    case "steghide":
    case "audio-analyze":
    case "tshark":
    case "tcpdump":
    case "wireshark":
    case "ewfacquire":
    case "ftkimager":
    case "mmls":
    case "fls":
    case "mftecmd":
    case "icat":
    case "timeline":
    case "memory-acquire":
    case "static-report":
    case "sandbox-report":
    case "docker":
    case "reg":
    case "sqlite3":
    case "sqlitebrowser":
    case "evtx":
    case "wevtutil":
    case "get-winevent":
    case "LECmd": {
      if (cmd === "docker") {
        print("CONTAINER ID   IMAGE             STATUS         NAME\nforge-web      hackforge/web     Up (simulated) web-lab\nNo host containers are visible.");
      } else if (cmd === "timeline") {
        print("TIME                 SOURCE                  EVENT\n2026-04-12 09:01:11  /var/log/auth.log       simulated SSH login\n2026-04-12 09:14:02  /var/log/auth.log       simulated sudo command");
      } else if (cmd === "hexedit") {
        print("hexedit: evidence files are read-only in this lab. Use a designated virtual working copy for edits.", "err");
      } else {
        const target = first && !first.startsWith("-") ? first : "(no file specified)";
        print(`${cmd}: HackForge ${cmd} training fixture\nTarget: ${target}\nThis command inspects virtual lab data only; it does not invoke a host utility.`);
      }
      return true;
    }
    default:
      return false;
  }
}
