import {
  createTerminal,
  defaultFS,
  dir,
  file,
  ravenFS,
  setTerminalScenario,
  sshFS,
  getNode,
  normalize,
  type FileNode,
  type Terminal,
} from "./terminal";
import { dfirFS } from "./dfir";
import { sudoRunFS } from "./sudorun";

const STORAGE_PREFIX = "hackforge.player-terminal.v2:";
const LEGACY_STORAGE_PREFIX = "hackforge.player-terminal.v1:";
const MAX_SAVED_LINES = 1200;
const MAX_SAVED_HISTORY = 600;
const MAX_SAVED_COMMANDS = 1200;
const MAX_SAVED_READS = 1200;

function cloneNode(node: FileNode): FileNode {
  return {
    ...node,
    children: node.children
      ? Object.fromEntries(Object.entries(node.children).map(([name, child]) => [name, cloneNode(child)]))
      : undefined,
  };
}

function ensureDirectory(root: FileNode, path: string): FileNode | null {
  let current = root;
  for (const name of normalize(path).split("/").filter(Boolean)) {
    if (current.type !== "dir") return null;
    current.children ||= {};
    const existing = current.children[name];
    if (existing && existing.type !== "dir") return null;
    if (existing) current = existing;
    else {
      const created = dir(name);
      current.children[name] = created;
      current = created;
    }
  }
  return current;
}

function storeAlternateFixture(root: FileNode, scenario: string, path: string, node: FileNode): void {
  const normalized = normalize(path);
  const parentPath = normalized.slice(0, normalized.lastIndexOf("/")) || "/";
  const destination = ensureDirectory(root, normalize(`/labs/fixtures/${scenario}${parentPath}`));
  if (!destination || !destination.children) return;
  destination.children[node.name] = cloneNode(node);
}

function mergeUniqueLines(existing: string, incoming: string, identity?: (line: string) => string): string {
  const lines = [...existing.split(/\r?\n/), ...incoming.split(/\r?\n/)];
  const seen = new Set<string>();
  const merged: string[] = [];
  for (const line of lines) {
    if (!line && merged.at(-1) === "") continue;
    const key = identity ? identity(line) : line;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    merged.push(line);
  }
  return merged.join("\n") + (merged.length ? "\n" : "");
}

function mergeAccountLines(existing: string, incoming: string): string {
  const accounts = new Map<string, string>();
  for (const line of existing.split(/\r?\n/)) {
    const name = line.split(":", 1)[0];
    if (name) accounts.set(name, line);
  }
  for (const line of incoming.split(/\r?\n/)) {
    const name = line.split(":", 1)[0];
    if (name) accounts.set(name, line);
  }
  return [...accounts.values()].join("\n") + (accounts.size ? "\n" : "");
}

function mergeMissingNodes(target: FileNode, source: FileNode): void {
  if (target.type !== "dir" || source.type !== "dir") return;
  target.children ||= {};
  for (const [name, sourceNode] of Object.entries(source.children || {})) {
    const existing = target.children[name];
    if (!existing) target.children[name] = cloneNode(sourceNode);
    else if (existing.type === "dir" && sourceNode.type === "dir") mergeMissingNodes(existing, sourceNode);
  }
}

function setNodeAtPath(root: FileNode, path: string, node: FileNode): void {
  const normalized = normalize(path);
  const parentPath = normalized.slice(0, normalized.lastIndexOf("/")) || "/";
  const parent = ensureDirectory(root, parentPath);
  if (parent?.children) parent.children[normalized.slice(normalized.lastIndexOf("/") + 1)] = cloneNode(node);
}

function applyLegacyFile(root: FileNode, scenario: string, path: string, node: FileNode): void {
  const normalized = normalize(path);
  const existing = getNode(root, normalized, false);
  if (["/etc/hosts", "/etc/crontab", "/etc/ssh/sshd_config", "/var/log/syslog"].includes(normalized)) {
    if (existing?.type === "file") {
      existing.content = mergeUniqueLines(existing.content || "", node.content || "");
      existing.mode = node.mode || existing.mode;
    } else setNodeAtPath(root, normalized, node);
    return;
  }
  if (normalized === "/etc/passwd") {
    if (existing?.type === "file") {
      existing.content = mergeAccountLines(existing.content || "", node.content || "");
      existing.mode = node.mode || existing.mode;
    } else setNodeAtPath(root, normalized, node);
    return;
  }
  if (normalized === "/etc/hostname" && scenario === "raven") {
    storeAlternateFixture(root, scenario, normalized, node);
    return;
  }
  if (normalized === "/home/operator/welcome.txt" && (scenario === "raven" || scenario === "sudorun")) {
    storeAlternateFixture(root, scenario, normalized, node);
    return;
  }
  if (normalized === "/var/www/html/login.php" && scenario === "raven") {
    const ravenWeb = ensureDirectory(root, "/var/www/html/raven");
    if (ravenWeb?.children) ravenWeb.children["login.php"] = cloneNode(node);
    storeAlternateFixture(root, scenario, normalized, node);
    return;
  }
  if (normalized === "/var/www/html/index.html" && scenario === "sudorun" && existing?.type === "file") {
    storeAlternateFixture(root, "sudorun-original", normalized, existing);
    existing.content = node.content;
    existing.mode = node.mode || existing.mode;
    return;
  }
  setNodeAtPath(root, normalized, node);
}

function mergeLegacyChanges(
  root: FileNode,
  scenario: string,
  source: FileNode,
  baseline: FileNode | null,
  path: string,
): void {
  if (source.type === "dir") {
    const destination = ensureDirectory(root, path);
    if (destination && baseline?.type === "dir" && source.mode && source.mode !== baseline.mode) {
      destination.mode = source.mode;
      destination.owner = source.owner;
      destination.group = source.group;
    }
    for (const child of Object.values(source.children || {})) {
      mergeLegacyChanges(root, scenario, child, baseline?.type === "dir" ? baseline.children?.[child.name] || null : null, normalize(`${path}/${child.name}`));
    }
    return;
  }

  if (!baseline || baseline.type !== "file" || baseline.content !== source.content || baseline.mode !== source.mode) {
    applyLegacyFile(root, scenario, path, source);
  }
}

function migrateLegacyFileSystem(legacyFs: FileNode): FileNode {
  const root = createPlayerFileSystem();
  const baselineRoot = defaultFS();

  for (const child of Object.values(legacyFs.children || {})) {
    if (child.name === "labs") {
      const oldLabs = child;
      if (oldLabs.type !== "dir") continue;
      for (const labChild of Object.values(oldLabs.children || {})) {
        if (labChild.name === "scenarios") continue;
        mergeLegacyChanges(root, "legacy-root", labChild, null, `/labs/${labChild.name}`);
      }
      continue;
    }
    mergeLegacyChanges(root, "legacy-root", child, baselineRoot.children?.[child.name] || null, `/${child.name}`);
  }

  const oldMounts = getNode(legacyFs, "/labs/scenarios", false);
  if (oldMounts?.type === "dir") {
    const baselines: Record<string, FileNode> = {
      raven: ravenFS(),
      ssh: sshFS(),
      sudorun: sudoRunFS(),
      dfir: dfirFS(),
    };
    for (const scenario of Object.keys(baselines)) {
      const oldMount = oldMounts.children?.[scenario];
      if (oldMount?.type !== "dir") continue;
      mergeLegacyChanges(root, scenario, oldMount, baselines[scenario], "/");
    }
  }
  return root;
}

function mergeScenario(root: FileNode, scenario: string, source: FileNode): void {
  const visit = (sourceNode: FileNode, path: string) => {
    if (sourceNode.type === "dir") {
      const destination = ensureDirectory(root, path);
      if (!destination || !destination.children) {
        storeAlternateFixture(root, scenario, path, sourceNode);
        return;
      }
      for (const child of Object.values(sourceNode.children || {})) {
        visit(child, normalize(`${path}/${child.name}`));
      }
      return;
    }

    const parentPath = path.slice(0, path.lastIndexOf("/")) || "/";
    const name = path.slice(path.lastIndexOf("/") + 1);
    const parent = ensureDirectory(root, parentPath);
    if (!parent || !parent.children) {
      storeAlternateFixture(root, scenario, path, sourceNode);
      return;
    }

    const existing = parent.children[name];
    if (!existing) {
      parent.children[name] = cloneNode(sourceNode);
      return;
    }
    if (existing.type !== "file") {
      storeAlternateFixture(root, scenario, path, sourceNode);
      return;
    }

    if (["/etc/hosts", "/etc/crontab", "/etc/ssh/sshd_config", "/var/log/syslog"].includes(path)) {
      existing.content = mergeUniqueLines(existing.content || "", sourceNode.content || "");
      return;
    }
    if (path === "/etc/passwd") {
      existing.content = mergeUniqueLines(existing.content || "", sourceNode.content || "", (line) => line.split(":", 1)[0]);
      return;
    }
    if (path === "/var/www/html/index.html" && scenario === "sudorun") {
      existing.content = sourceNode.content;
      existing.mode = sourceNode.mode;
      return;
    }
    if (path === "/var/www/html/login.php" && scenario === "raven") {
      const ravenWeb = ensureDirectory(root, "/var/www/html/raven");
      if (ravenWeb?.children) ravenWeb.children[name] = cloneNode(sourceNode);
      storeAlternateFixture(root, scenario, path, sourceNode);
      return;
    }
    if (path === "/etc/hostname" && scenario !== "raven") {
      if (existing.content !== sourceNode.content) storeAlternateFixture(root, scenario, path, sourceNode);
      return;
    }
    if (existing.content === sourceNode.content && existing.mode === sourceNode.mode) return;
    storeAlternateFixture(root, scenario, path, sourceNode);
  };

  for (const child of Object.values(source.children || {})) {
    visit(child, `/${child.name}`);
  }
}

function preserveForgeWebPage(root: FileNode): void {
  const html = getNode(root, "/var/www/html");
  const originalIndex = html?.children?.["index.html"];
  if (!html || html.type !== "dir" || !html.children || !originalIndex || originalIndex.type !== "file") return;
  const forge = dir("forge");
  forge.children = { "index.html": cloneNode(originalIndex) };
  html.children.forge = forge;
}

/** Build one complete filesystem tree for the player; challenge data is merged, never swapped per module. */
export function createPlayerFileSystem(): FileNode {
  const root = defaultFS();
  root.children ||= {};
  root.children.labs = dir("labs", [
    file(
      "README.txt",
      "HACKFORGE SHARED PLAYER WORKSPACE\n" +
        "This is one persistent virtual Linux filesystem for every campaign, module, command, and challenge on your account.\n" +
        "Switching modules changes the lesson context, not the filesystem. Files you create in /tmp, /home, /root, /etc, and /cases remain in the same tree.\n" +
        "Challenge evidence lives at its normal training paths, including /root, /home/raven, /var/www/html, /opt, and /cases/IR-2404.\n" +
        "Alternate versions of conflicting fictional fixtures are preserved under /labs/fixtures.\n" +
        "All files and command effects are fictional; no host filesystem, host process, or live network is exposed.\n",
    ),
    dir("fixtures", [
      file(
        "README.txt",
        "Collision-safe copies of alternate teaching fixtures live here. The active CLI uses one shared root; this folder does not represent a separate machine.\n",
      ),
    ]),
  ]);

  preserveForgeWebPage(root);
  mergeScenario(root, "sudorun", sudoRunFS());
  mergeScenario(root, "raven", ravenFS());
  mergeScenario(root, "ssh", sshFS());
  mergeScenario(root, "dfir", dfirFS());
  return root;
}

export function createPlayerTerminal(): Terminal {
  return createTerminal({ fs: createPlayerFileSystem(), scenario: "lab", user: "operator" });
}

export function activateTerminalForModule(term: Terminal, moduleId: string, scenario: string): Terminal {
  const scenarioChanged = term.scenario !== scenario;
  if (scenarioChanged) setTerminalScenario(term, scenario);

  if (scenario === "sudorun" && moduleId === "sr-proc") {
    const trainingProcesses = [
      { pid: 7440, user: "root", cpu: "0.4", mem: "0.2", cmd: "training-worker --batch", nice: 0, alive: true },
      { pid: 7441, user: "root", cpu: "0.1", mem: "0.1", cmd: "training-reporter", nice: 0, alive: true },
      { pid: 7442, user: "root", cpu: "0.2", mem: "0.1", cmd: "training-cleanup", nice: 0, alive: true },
    ];
    for (const process of trainingProcesses) {
      if (!term.procs.some((existing) => existing.pid === process.pid)) term.procs.push(process);
    }
  }

  if (term.activeModuleId !== moduleId) {
    term.lines = [
      {
        kind: "sys",
        text: `HACKFORGE shared player workspace — active challenge: ${moduleId}.`,
      },
      {
        kind: "sys",
        text: "Every module uses this same persistent Linux filesystem; changing lessons does not replace it.",
      },
      {
        kind: "sys",
        text: "Challenge fixtures are available at their normal paths. Alternate conflicting examples are under /labs/fixtures.",
      },
      {
        kind: "sys",
        text: "Type `help` for the command reference. All operations remain inside this fictional training sandbox.",
      },
    ];
    term.activeModuleId = moduleId;
  }
  return term;
}

function playerStorageKey(userId: string, legacy = false): string {
  const prefix = legacy ? LEGACY_STORAGE_PREFIX : STORAGE_PREFIX;
  return `${prefix}${encodeURIComponent(userId.trim().toLowerCase())}`;
}

type PersistedTerminal = Omit<Terminal, "flags" | "packages"> & {
  flags: string[];
  packages: string[];
};

function localStorageOrNull(): Storage | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

export function loadPlayerTerminal(userId: string): Terminal {
  const fresh = createPlayerTerminal();
  const storage = localStorageOrNull();
  if (!storage) return fresh;

  try {
    const raw = storage.getItem(playerStorageKey(userId)) || storage.getItem(playerStorageKey(userId, true));
    if (!raw) return fresh;
    const parsed = JSON.parse(raw) as Partial<PersistedTerminal> & { version?: number };
    if ((parsed.version !== 1 && parsed.version !== 2) || !parsed.fs || parsed.fs.type !== "dir") return fresh;

    const fs = parsed.version === 1 ? migrateLegacyFileSystem(parsed.fs) : parsed.fs;
    mergeMissingNodes(fs, createPlayerFileSystem());
    const env = parsed.env && typeof parsed.env === "object" ? parsed.env : fresh.env;
    const shellVars = parsed.shellVars && typeof parsed.shellVars === "object"
      ? parsed.shellVars
      : { ...fresh.shellVars, ...env };
    return {
      ...fresh,
      ...parsed,
      fs,
      shellVars,
      flags: new Set(Array.isArray(parsed.flags) ? parsed.flags.filter((value): value is string => typeof value === "string") : []),
      packages: new Set(Array.isArray(parsed.packages) ? parsed.packages.filter((value): value is string => typeof value === "string") : []),
      history: Array.isArray(parsed.history) ? parsed.history.filter((value): value is string => typeof value === "string").slice(-MAX_SAVED_HISTORY) : fresh.history,
      ran: Array.isArray(parsed.ran) ? parsed.ran.filter((value): value is string => typeof value === "string").slice(-MAX_SAVED_COMMANDS) : fresh.ran,
      lines: Array.isArray(parsed.lines) ? parsed.lines.slice(-MAX_SAVED_LINES) : fresh.lines,
      filesRead: Array.isArray(parsed.filesRead) ? parsed.filesRead.filter((value): value is string => typeof value === "string").slice(-MAX_SAVED_READS) : fresh.filesRead,
      env,
      activeModuleId: typeof parsed.activeModuleId === "string" ? parsed.activeModuleId : undefined,
    } as Terminal;
  } catch {
    return fresh;
  }
}

export function savePlayerTerminal(userId: string, term: Terminal): void {
  const storage = localStorageOrNull();
  if (!storage) return;

  term.history = term.history.slice(-MAX_SAVED_HISTORY);
  term.ran = term.ran.slice(-MAX_SAVED_COMMANDS);
  term.lines = term.lines.slice(-MAX_SAVED_LINES);
  term.filesRead = term.filesRead.slice(-MAX_SAVED_READS);

  const snapshot: PersistedTerminal & { version: number } = {
    version: 2,
    ...term,
    flags: [...term.flags],
    packages: [...term.packages],
  };
  try {
    storage.setItem(playerStorageKey(userId), JSON.stringify(snapshot));
    storage.removeItem(playerStorageKey(userId, true));
  } catch {
    // The active terminal remains usable for this visit if browser storage is unavailable or full.
  }
}
