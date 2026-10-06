import type { Lang } from "../i18n";

export type Role = "player" | "educator";
export type ContentWidth = "centered" | "wide" | "full";
export type ModProgress = { completed: boolean; done: string[] };

// A revealed hint reduces that objective's base XP reward by this amount on completion.
export const HINT_XP_PENALTY = 2;

export type Metrics = {
  xp: number;
  commandsRun: number;
  pasteCount: number;
  typedCount: number;
  typoCount: number;
  hintsUsed: number;
  challengeAttempts: number;
  challengeSolves: number;
  secondsActive: number;
  streakDays: number;
  lastActiveDay: string;
};

export type User = {
  id: string;
  username: string;
  password: string;
  role: Role;
  displayName: string;
  avatar: string;
  bio: string;
  interests: string[];
  createdAt: number;
  lastSeen?: number;
  activeCampaignId?: string;
  activeModuleId?: string;
  teamId?: string;
  lang: Lang;
  accepted: boolean;
  contentWidth?: ContentWidth;
  sidebarCollapsed?: boolean;
  progress: Record<string, ModProgress>;
  metrics: Metrics;
  badges: string[];
};

export type Team = {
  id: string;
  name: string;
  description: string;
  educatorId: string;
  createdAt: number;
};

export type TeamApplication = {
  id: string;
  teamId: string;
  playerId: string;
  requestedAt: number;
  respondedAt?: number;
  status: "pending" | "accepted" | "declined" | "withdrawn";
};

export type CommandExecution = {
  id: string;
  userId: string;
  ts: number;
  command: string;
  campaignId: string;
  moduleId: string;
  cwd: string;
  exitCode: number;
  pasted: boolean;
  typo: boolean;
  output: string;
  outputTruncated: boolean;
};

export type CommandExecutionInput = {
  command: string;
  campaignId: string;
  moduleId: string;
  cwd: string;
  exitCode: number;
  output: string;
};

export type FeedEvent = {
  id: string;
  ts: number;
  userId: string;
  username: string;
  kind: "join" | "task" | "module" | "challenge" | "badge" | "levelup" | "login";
  text: string;
};

export type Ticket = {
  id: string;
  playerId: string;
  playerName: string;
  subject: string;
  moduleId: string | null;
  status: "open" | "answered" | "closed";
  priority: "low" | "normal" | "high";
  createdAt: number;
  messages: { from: string; fromName: string; role: Role; ts: number; text: string }[];
};

export type Message = {
  id: string;
  ts: number;
  fromId: string;
  fromName: string;
  toId: string | "broadcast";
  text: string;
  read: boolean;
  broadcast?: boolean;
};

export type ChatMessage = { id: string; ts: number; fromId: string; text: string };
export type ChatThread = { id: string; members: [string, string]; messages: ChatMessage[] };

export type DB = {
  users: User[];
  sessionUserId: string | null;
  feed: FeedEvent[];
  tickets: Ticket[];
  messages: Message[];
  chats: ChatThread[];
  teams: Team[];
  teamApplications: TeamApplication[];
  commandLog: CommandExecution[];
};

const KEY = "hackforge.platform.v1";

export const INTERESTS_POOL = [
  "Web Security",
  "Networking",
  "Reverse Engineering",
  "Cryptography",
  "Forensics",
  "OSINT",
  "Malware Analysis",
  "Cloud Security",
  "Red Team",
  "Blue Team",
  "Linux",
  "Python",
];

export type Badge = {
  name: string;
  desc: string;
  icon: string;
  tier: "bronze" | "silver" | "gold";
  blurb: string;
};

export const BADGES: Record<string, Badge> = {
  firstblood: {
    name: "First Blood",
    desc: "Completed your first objective",
    icon: "flag",
    tier: "bronze",
    blurb: "Awarded for solving your very first hands-on objective in the lab — the first strike of many.",
  },
  shell_initiate: {
    name: "Shell Initiate",
    desc: "Finished Linux Foundations",
    icon: "terminal",
    tier: "bronze",
    blurb: "Certifies command of core Linux fundamentals: navigation, files, permissions and the shell.",
  },
  recon_scout: {
    name: "Recon Scout",
    desc: "Mastered reconnaissance",
    icon: "radar",
    tier: "silver",
    blurb: "Recognises mastery of reconnaissance — host discovery, service enumeration and DNS intelligence.",
  },
  port_mapper: {
    name: "Port Mapper",
    desc: "Completed port scanning",
    icon: "scan",
    tier: "silver",
    blurb: "Confirms proficiency in port scanning and service-version fingerprinting with nmap.",
  },
  lockbreaker: {
    name: "Lock Breaker",
    desc: "Cracked a password",
    icon: "hammer",
    tier: "silver",
    blurb: "Earned by recovering credentials through brute-force and dictionary attacks against a live service.",
  },
  query_bender: {
    name: "Query Bender",
    desc: "Exploited SQL injection",
    icon: "database",
    tier: "gold",
    blurb: "Demonstrates practical exploitation of SQL injection — from detection to data extraction.",
  },
  root: {
    name: "Root Forged",
    desc: "Escalated to root",
    icon: "crown",
    tier: "gold",
    blurb: "The pinnacle: full privilege escalation to root, achieving complete control of the target.",
  },
  raven: {
    name: "Raven Rooted",
    desc: "Owned the Raven box",
    icon: "crown",
    tier: "gold",
    blurb: "Certifies a complete boot2root compromise of the Raven machine — all four flags captured.",
  },
  high_fidelity: {
    name: "High Fidelity",
    desc: "Kept fidelity above 90%",
    icon: "check",
    tier: "silver",
    blurb: "Rewards genuine practice: over 90% of commands typed by hand rather than pasted.",
  },
  flawless: {
    name: "Flawless Typist",
    desc: "10 commands, zero typos",
    icon: "bulb",
    tier: "bronze",
    blurb: "Granted for precision at the keyboard — ten consecutive commands without a single typo.",
  },
  dedicated: {
    name: "Dedicated",
    desc: "3-day learning streak",
    icon: "medal",
    tier: "silver",
    blurb: "Honours consistency — returning to train three days in a row and keeping the streak alive.",
  },
  ssh_walker: {
    name: "Wirewalker",
    desc: "Completed the SSH labyrinth",
    icon: "key",
    tier: "gold",
    blurb: "Mastery of SSH keys, hopping and tunnels across a segmented lab network.",
  },
  sudo_run: {
    name: "Sudo_Run",
    desc: "Finished Linux for Beginners",
    icon: "terminal",
    tier: "gold",
    blurb: "Certifies the full Sudo_Run path: files, permissions, networks, processes, bash, cron and core Linux services in the HackForge sandbox.",
  },
  evidence_custodian: {
    name: "Evidence Custodian",
    desc: "Completed DFIR intake and integrity",
    icon: "shield",
    tier: "bronze",
    blurb: "Demonstrates evidence handling, provenance, hashes, file identification, and read-only analysis habits.",
  },
  artifact_mapper: {
    name: "Artifact Mapper",
    desc: "Correlated Windows artifacts",
    icon: "settings",
    tier: "silver",
    blurb: "Correlated registry, shortcut, browser, and event-log artifacts into a defensible timeline.",
  },
  document_analyst: {
    name: "Document Analyst",
    desc: "Completed document and steganography triage",
    icon: "file-text",
    tier: "silver",
    blurb: "Inspected office-container metadata, extracted macro indicators statically, and evaluated image/audio clues without executing content.",
  },
  web_correlator: {
    name: "Web Correlator",
    desc: "Correlated application and WAF logs",
    icon: "globe",
    tier: "silver",
    blurb: "Correlated timestamps, web access events, server errors, and WAF rule identifiers while distinguishing evidence from attribution.",
  },
  packet_analyst: {
    name: "Packet Analyst",
    desc: "Completed network traffic analysis",
    icon: "share",
    tier: "silver",
    blurb: "Reviewed protocol summaries, display-filtered packets, reconstructed a training stream, and preserved export provenance.",
  },
  disk_examiner: {
    name: "Disk Examiner",
    desc: "Completed disk image analysis",
    icon: "hard-drive",
    tier: "silver",
    blurb: "Practiced read-only acquisition, integrity verification, filesystem enumeration, and cautious MFT timeline interpretation.",
  },
  static_analyst: {
    name: "Static Analyst",
    desc: "Completed safe malware triage",
    icon: "bug",
    tier: "gold",
    blurb: "Triaged file type, hashes, printable strings, and isolated behavior notes without executing a sample.",
  },
  memory_analyst: {
    name: "Memory Analyst",
    desc: "Completed memory artifact analysis",
    icon: "cpu",
    tier: "gold",
    blurb: "Correlated a memory profile, process tree, sockets, environment, and volatile user artifacts as a training investigation.",
  },
  container_examiner: {
    name: "Container Examiner",
    desc: "Completed container forensics",
    icon: "layers",
    tier: "silver",
    blurb: "Reviewed container configuration, runtime differences, logs, and image history while accounting for immutable layers.",
  },
  hash_examiner: {
    name: "Hash Examiner",
    desc: "Completed password hash analysis",
    icon: "key",
    tier: "gold",
    blurb: "Reviewed hash formats, candidate comparison, salts, adaptive password KDFs, authorization boundaries, and remediation.",
  },
  incident_reporter: {
    name: "Incident Reporter",
    desc: "Completed the DFIR fieldwork path",
    icon: "file-text",
    tier: "gold",
    blurb: "Completed the ten-lab DFIR Fieldwork path and practiced reporting evidence with limitations and defensive recommendations.",
  },
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

const DEFAULT_ICON_KEYS = [
  "skull",
  "terminal",
  "ghost",
  "dragon",
  "bug",
  "shield",
  "radar",
  "wolf",
  "owl",
  "raven",
  "phoenix",
  "atom",
  "cpu",
  "qubit",
  "cybereye",
  "wyvern",
];
const DEFAULT_ICON_HEXES = ["#ff6a2b", "#22d3ee", "#3ddc84", "#a78bfa", "#fcd34d", "#f472b6", "#38bdf8"];

export function randomIconAvatar(seed = Math.random()): string {
  const k = DEFAULT_ICON_KEYS[Math.floor(seed * 997) % DEFAULT_ICON_KEYS.length];
  const c = DEFAULT_ICON_HEXES[Math.floor(seed * 613) % DEFAULT_ICON_HEXES.length];
  return `ic:${k}:${c}`;
}

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function freshMetrics(): Metrics {
  return {
    xp: 0,
    commandsRun: 0,
    pasteCount: 0,
    typedCount: 0,
    typoCount: 0,
    hintsUsed: 0,
    challengeAttempts: 0,
    challengeSolves: 0,
    secondsActive: 0,
    streakDays: 1,
    lastActiveDay: today(),
  };
}

export function contentWidthClass(w?: ContentWidth): string {
  switch (w) {
    case "centered":
      return "mx-auto w-full lg:max-w-4xl";
    case "full":
      return "w-full max-w-none";
    case "wide":
      return "mx-auto w-full lg:max-w-[75%]";
    default:
      return "w-full max-w-none";
  }
}

export function fidelityScore(m: Metrics): number {
  const total = m.pasteCount + m.typedCount;
  if (total === 0) return 100;
  return Math.round((m.typedCount / total) * 100);
}

export function accuracyScore(m: Metrics): number {
  if (m.commandsRun === 0) return 100;
  const good = Math.max(0, m.commandsRun - m.typoCount);
  return Math.round((good / m.commandsRun) * 100);
}

export function xpRate(m: Metrics): number {
  const fid = fidelityScore(m) / 100;
  const acc = accuracyScore(m) / 100;
  const rate = 0.4 + 0.45 * fid + 0.15 * acc;
  return Math.min(1, Math.round(rate * 100) / 100);
}

export function levelFromXp(xp: number): { level: number; into: number; span: number; pct: number } {
  const safeXp = Math.max(0, Math.floor(Number.isFinite(xp) ? xp : 0));
  let level = 1;
  let previousThreshold = 0;
  let nextThreshold = 500;
  while (safeXp >= nextThreshold) {
    previousThreshold = nextThreshold;
    level++;
    nextThreshold *= 2;
  }
  const span = nextThreshold - previousThreshold;
  const into = safeXp - previousThreshold;
  return { level, into, span, pct: Math.min(100, Math.round((into / span) * 100)) };
}

let cache: DB | null = null;
const dbListeners = new Set<() => void>();
let storageListenerAttached = false;

function notifyDBChange() {
  dbListeners.forEach((listener) => listener());
}

export function subscribeDB(listener: () => void) {
  dbListeners.add(listener);
  if (!storageListenerAttached && typeof window !== "undefined") {
    storageListenerAttached = true;
    window.addEventListener("storage", (event) => {
      if (event.key !== KEY && event.key !== null) return;
      try {
        cache = event.newValue ? JSON.parse(event.newValue) : null;
      } catch {
        cache = null;
      }
      notifyDBChange();
    });
  }
  return () => {
    dbListeners.delete(listener);
  };
}

export const PRESENCE_WINDOW_MS = 45_000;

export function isOnline(user: User, now = Date.now()) {
  return !!user.lastSeen && user.lastSeen > 0 && now - user.lastSeen < PRESENCE_WINDOW_MS;
}

function seed(): DB {
  const db: DB = {
    users: [],
    sessionUserId: null,
    feed: [],
    tickets: [],
    messages: [],
    chats: [],
    teams: [],
    teamApplications: [],
    commandLog: [],
  };

  const edu: User = {
    id: uid(),
    username: "educator",
    password: "teach123",
    role: "educator",
    displayName: "Dr. Mara Vance",
    avatar: "ic:owl:#a78bfa",
    bio: "Lead cybersecurity instructor. Here to help you forge real skills.",
    interests: ["Red Team", "Networking", "Forensics"],
    createdAt: Date.now() - 86400000 * 30,
    lang: "en",
    accepted: true,
    progress: {},
    metrics: freshMetrics(),
    badges: [],
  };
  db.users.push(edu);

  const demoNames = [
    ["nova", "Nova Reyes", ["Web Security", "Python"], 82],
    ["byte", "Byte Walker", ["Networking", "Red Team"], 54],
    ["cipher", "Cipher Kaur", ["Cryptography", "OSINT"], 124],
  ] as const;

  for (const [u, dn, ints, xp] of demoNames) {
    const m = freshMetrics();
    m.xp = xp;
    m.commandsRun = 40 + xp * 2;
    m.typedCount = Math.floor(m.commandsRun * 0.8);
    m.pasteCount = m.commandsRun - m.typedCount;
    m.typoCount = Math.floor(m.commandsRun * 0.12);
    m.challengeAttempts = 6 + Math.floor(xp / 20);
    m.challengeSolves = Math.floor(m.challengeAttempts * 0.7);
    m.hintsUsed = Math.floor(xp / 30);
    m.secondsActive = xp * 200;
    m.streakDays = 2 + (xp % 4);
    db.users.push({
      id: uid(),
      username: u,
      password: "demo",
      role: "player",
      displayName: dn,
      avatar: randomIconAvatar(u.length / 10 + 0.11),
      bio: "Aspiring ethical hacker.",
      interests: [...ints],
      createdAt: Date.now() - 86400000 * 7,
      lang: "en",
      accepted: true,
      progress: {},
      metrics: m,
      badges: ["firstblood", "shell_initiate", "high_fidelity"],
    });
    db.feed.push({
      id: uid(),
      ts: Date.now() - Math.floor(Math.random() * 3600000),
      userId: "x",
      username: dn,
      kind: "module",
      text: `${dn} completed a module`,
    });
  }

  const signalTeam: Team = {
    id: uid(),
    name: "Signal & Shield",
    description: "Blue-team investigation and evidence-driven defense.",
    educatorId: edu.id,
    createdAt: Date.now() - 86400000 * 5,
  };
  const packetTeam: Team = {
    id: uid(),
    name: "Packet Forge",
    description: "Network reconnaissance and offensive-security practice.",
    educatorId: edu.id,
    createdAt: Date.now() - 86400000 * 3,
  };
  db.teams.push(signalTeam, packetTeam);
  const nova = db.users.find((item) => item.username === "nova");
  const byte = db.users.find((item) => item.username === "byte");
  const cipher = db.users.find((item) => item.username === "cipher");
  if (nova) nova.teamId = signalTeam.id;
  if (byte) byte.teamId = packetTeam.id;
  if (cipher) {
    db.teamApplications.push({
      id: uid(),
      teamId: signalTeam.id,
      playerId: cipher.id,
      requestedAt: Date.now() - 1000 * 60 * 18,
      status: "pending",
    });
  }
  return db;
}

const DEMO_MAP_MARK = "mapDemoV2";

function enrichDemoPresence(db: DB) {
  if ((db as unknown as Record<string, unknown>)[DEMO_MAP_MARK]) return;
  const now = Date.now();
  const plans: Record<string, { done: string[]; seenAgoMs: number }> = {
    nova: { done: ["linux-basics", "files"], seenAgoMs: 8_000 },
    byte: { done: ["linux-basics"], seenAgoMs: 26 * 3_600_000 },
    cipher: {
      done: ["linux-basics", "files", "permissions", "networking", "recon", "scanning"],
      seenAgoMs: 18_000,
    },
  };
  for (const [uname, plan] of Object.entries(plans)) {
    const u = db.users.find((x) => x.username === uname && x.role === "player");
    if (!u) continue;
    if (Object.keys(u.progress).length === 0) {
      for (const mid of plan.done) u.progress[mid] = { completed: true, done: [] };
    }
    if (!u.activeCampaignId) {
      u.activeCampaignId = "forge";
      u.activeModuleId = uname === "cipher" ? "bruteforce" : uname === "nova" ? "permissions" : "files";
    }
    if (u.lastSeen === undefined || uname === "nova" || uname === "cipher") u.lastSeen = now - plan.seenAgoMs;
  }
  (db as unknown as Record<string, unknown>)[DEMO_MAP_MARK] = 1;
}

function normalizeStoredDB(value: unknown): DB | null {
  if (!value || typeof value !== "object") return null;
  const stored = value as Partial<DB>;
  if (!Array.isArray(stored.users)) return null;
  return {
    users: stored.users,
    sessionUserId: typeof stored.sessionUserId === "string" ? stored.sessionUserId : null,
    feed: Array.isArray(stored.feed) ? stored.feed : [],
    tickets: Array.isArray(stored.tickets) ? stored.tickets : [],
    messages: Array.isArray(stored.messages) ? stored.messages : [],
    chats: Array.isArray(stored.chats) ? stored.chats : [],
    teams: Array.isArray(stored.teams) ? stored.teams : [],
    teamApplications: Array.isArray(stored.teamApplications) ? stored.teamApplications : [],
    commandLog: Array.isArray(stored.commandLog) ? stored.commandLog : [],
  };
}

export function getDB(): DB {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      cache = normalizeStoredDB(JSON.parse(raw));
      if (cache) {
        enrichDemoPresence(cache);
        saveDB();
        return cache;
      }
    }
  } catch {
    /* ignore */
  }
  cache = seed();
  enrichDemoPresence(cache);
  saveDB();
  return cache;
}

export function saveDB() {
  if (!cache) return;
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
  } catch {
    /* ignore */
  }
  notifyDBChange();
}

export function establishAuthenticatedUser(email: string, nickname: string): User {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedNickname = nickname.trim();
  if (!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@ionio\.gr$/i.test(normalizedEmail) || !normalizedNickname) {
    throw new Error("Invalid authenticated university account");
  }

  const db = getDB();
  let user = db.users.find((item) => item.id.toLowerCase() === normalizedEmail);
  if (!user) {
    user = {
      id: normalizedEmail,
      username: normalizedEmail,
      password: "",
      role: "player",
      displayName: normalizedNickname,
      avatar: randomIconAvatar(),
      bio: "",
      interests: [],
      createdAt: Date.now(),
      lang: "en",
      accepted: false,
      progress: {},
      metrics: freshMetrics(),
      badges: [],
    };
    db.users.push(user);
    pushFeed(user, "join", `${user.displayName} joined HACKFORGE`);
  } else {
    user.username = normalizedEmail;
    user.role = "player";
    if (!user.displayName) user.displayName = normalizedNickname;
  }

  db.sessionUserId = user.id;
  touchStreak(user);
  user.lastSeen = Date.now();
  pushFeed(user, "login", `${user.displayName} logged in`);
  saveDB();
  return user;
}

export function login(username: string, password: string): { ok: boolean; error?: string; user?: User } {
  const db = getDB();
  const identity = username.trim().toLowerCase();
  const u =
    db.users.find((user) => user.id.trim().toLowerCase() === identity) ||
    db.users.find((user) => user.username.trim().toLowerCase() === identity);
  if (!u || u.password !== password) return { ok: false, error: "Invalid username or email, or password" };
  db.sessionUserId = u.id;
  touchStreak(u);
  u.lastSeen = Date.now();
  pushFeed(u, "login", `${u.displayName} logged in`);
  saveDB();
  return { ok: true, user: u };
}

export function logout() {
  const db = getDB();
  const departing = db.sessionUserId ? db.users.find((x) => x.id === db.sessionUserId) : null;
  if (departing) departing.lastSeen = 0;
  db.sessionUserId = null;
  saveDB();
}

export function currentUser(): User | null {
  const db = getDB();
  if (!db.sessionUserId) return null;
  return db.users.find((u) => u.id === db.sessionUserId) || null;
}

export function updateUser(id: string, patch: Partial<User>) {
  const db = getDB();
  const u = db.users.find((x) => x.id === id);
  if (!u) return;
  Object.assign(u, patch);
  saveDB();
}

export function allPlayers(): User[] {
  return getDB().users.filter((u) => u.role === "player");
}

export function overallScoreboard(): { user: User; rank: number }[] {
  return allPlayers()
    .slice()
    .sort((a, b) => b.metrics.xp - a.metrics.xp || a.displayName.localeCompare(b.displayName) || a.id.localeCompare(b.id))
    .map((user, index) => ({ user, rank: index + 1 }));
}

export type TeamApplicationSummary = { application: TeamApplication; team: Team; player: User };
export type TeamApplicationFailure = "invalidPlayer" | "teamNotFound" | "alreadyInTeam" | "pendingElsewhere";
export type TeamApplicationResult = { ok: true; application: TeamApplication } | { ok: false; reason: TeamApplicationFailure };

export function allTeams(): Team[] {
  return getDB().teams.slice().sort((a, b) => a.name.localeCompare(b.name));
}

export function teamsForEducator(educatorId: string): Team[] {
  return allTeams().filter((team) => team.educatorId === educatorId);
}

export function teamById(teamId: string): Team | undefined {
  return getDB().teams.find((team) => team.id === teamId);
}

export function teamForPlayer(playerId: string): Team | undefined {
  const player = userById(playerId);
  return player?.teamId ? teamById(player.teamId) : undefined;
}

export function teamMembers(teamId: string): User[] {
  return allPlayers().filter((player) => player.teamId === teamId).sort((a, b) => a.displayName.localeCompare(b.displayName));
}

export function createTeam(educatorId: string, name: string, description = ""): Team | null {
  const educator = userById(educatorId);
  const cleanName = name.trim().replace(/\s+/g, " ");
  const cleanDescription = description.trim().slice(0, 180);
  if (educator?.role !== "educator" || !cleanName || cleanName.length > 40) return null;
  if (teamsForEducator(educatorId).some((team) => team.name.toLowerCase() === cleanName.toLowerCase())) return null;
  const team: Team = { id: uid(), name: cleanName, description: cleanDescription, educatorId, createdAt: Date.now() };
  getDB().teams.push(team);
  saveDB();
  return team;
}

export function applyForTeam(playerId: string, teamId: string): TeamApplicationResult {
  const db = getDB();
  const player = db.users.find((item) => item.id === playerId && item.role === "player");
  if (!player) return { ok: false, reason: "invalidPlayer" };
  const team = db.teams.find((item) => item.id === teamId);
  if (!team) return { ok: false, reason: "teamNotFound" };
  if (player.teamId) return { ok: false, reason: "alreadyInTeam" };
  const pending = db.teamApplications.find((application) => application.playerId === playerId && application.status === "pending");
  if (pending) return { ok: false, reason: "pendingElsewhere" };
  const application: TeamApplication = { id: uid(), teamId, playerId, requestedAt: Date.now(), status: "pending" };
  db.teamApplications.unshift(application);
  saveDB();
  return { ok: true, application };
}

export function withdrawTeamApplication(playerId: string, applicationId: string): boolean {
  const application = getDB().teamApplications.find((item) =>
    item.id === applicationId && item.playerId === playerId && item.status === "pending"
  );
  if (!application) return false;
  application.status = "withdrawn";
  application.respondedAt = Date.now();
  saveDB();
  return true;
}

export function teamApplicationsForPlayer(playerId: string): TeamApplicationSummary[] {
  const db = getDB();
  return db.teamApplications
    .filter((application) => application.playerId === playerId && application.status === "pending")
    .map((application) => ({
      application,
      team: db.teams.find((team) => team.id === application.teamId)!,
      player: db.users.find((player) => player.id === playerId)!,
    }))
    .filter((entry) => entry.team && entry.player);
}

export function pendingTeamApplications(educatorId: string): TeamApplicationSummary[] {
  const db = getDB();
  const ownedTeams = new Set(db.teams.filter((team) => team.educatorId === educatorId).map((team) => team.id));
  return db.teamApplications
    .filter((application) => application.status === "pending" && ownedTeams.has(application.teamId))
    .map((application) => ({
      application,
      team: db.teams.find((team) => team.id === application.teamId)!,
      player: db.users.find((player) => player.id === application.playerId)!,
    }))
    .filter((entry) => entry.team && entry.player)
    .sort((a, b) => a.application.requestedAt - b.application.requestedAt);
}

export function reviewTeamApplication(educatorId: string, applicationId: string, accept: boolean): boolean {
  const db = getDB();
  const educator = db.users.find((item) => item.id === educatorId && item.role === "educator");
  const application = db.teamApplications.find((item) => item.id === applicationId && item.status === "pending");
  const team = application ? db.teams.find((item) => item.id === application.teamId && item.educatorId === educatorId) : undefined;
  const player = application ? db.users.find((item) => item.id === application.playerId && item.role === "player") : undefined;
  if (!educator || !application || !team || !player) return false;
  if (accept && player.teamId && player.teamId !== team.id) return false;
  application.status = accept ? "accepted" : "declined";
  application.respondedAt = Date.now();
  if (accept) {
    player.teamId = team.id;
    db.teamApplications.forEach((other) => {
      if (other.playerId === player.id && other.id !== application.id && other.status === "pending") {
        other.status = "declined";
        other.respondedAt = Date.now();
      }
    });
  }
  saveDB();
  return true;
}

export function assignPlayerToTeam(educatorId: string, playerId: string, teamId: string | null): boolean {
  const db = getDB();
  const educator = db.users.find((item) => item.id === educatorId && item.role === "educator");
  const player = db.users.find((item) => item.id === playerId && item.role === "player");
  const team = teamId ? db.teams.find((item) => item.id === teamId && item.educatorId === educatorId) : undefined;
  const currentTeam = player?.teamId ? db.teams.find((item) => item.id === player.teamId) : undefined;
  if (!educator || !player || (teamId && !team)) return false;
  if (!teamId && currentTeam?.educatorId !== educatorId) return false;
  if (teamId) player.teamId = teamId;
  else delete player.teamId;
  db.teamApplications.forEach((application) => {
    if (application.playerId === playerId && application.status === "pending") {
      application.status = teamId && application.teamId === teamId ? "accepted" : "declined";
      application.respondedAt = Date.now();
    }
  });
  saveDB();
  return true;
}

export function commandExecutions(playerId?: string): CommandExecution[] {
  return getDB().commandLog
    .filter((entry) => !playerId || entry.userId === playerId)
    .slice()
    .sort((a, b) => b.ts - a.ts);
}

export function allEducators(): User[] {
  return getDB().users.filter((u) => u.role === "educator");
}

export function userById(id: string): User | undefined {
  return getDB().users.find((u) => u.id === id);
}

export function pushFeed(user: User, kind: FeedEvent["kind"], text: string) {
  const db = getDB();
  db.feed.unshift({ id: uid(), ts: Date.now(), userId: user.id, username: user.displayName, kind, text });
  db.feed = db.feed.slice(0, 80);
}

export function getFeed(): FeedEvent[] {
  return getDB().feed;
}

function touchStreak(u: User) {
  const t = today();
  if (u.metrics.lastActiveDay === t) return;
  const yest = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  u.metrics.streakDays = u.metrics.lastActiveDay === yest ? u.metrics.streakDays + 1 : 1;
  u.metrics.lastActiveDay = t;
}

function redactCommandSecrets(command: string): string {
  return command
    .replace(/(\b(?:--password|--token|--secret|--api[-_]?key)\s+)(?:"[^"]*"|'[^']*'|[^\s]+)/gi, "$1[REDACTED]")
    .replace(/(\b(?:password|token|secret|api[_-]?key)\s*=\s*)(?:"[^"]*"|'[^']*'|[^\s;&]+)/gi, "$1[REDACTED]")
    .replace(/(\bsshpass\s+-p\s+)(?:"[^"]*"|'[^']*'|[^\s]+)/gi, "$1[REDACTED]");
}

const MAX_COMMAND_LOG_ENTRIES = 500;
const MAX_COMMAND_OUTPUT_CHARS = 2400;

export function recordCommand(
  userId: string,
  opts: { pasted: boolean; typo: boolean },
  execution?: CommandExecutionInput,
) {
  const db = getDB();
  const u = db.users.find((x) => x.id === userId);
  if (!u) return;
  u.metrics.commandsRun++;
  if (opts.pasted) u.metrics.pasteCount++;
  else u.metrics.typedCount++;
  if (opts.typo) u.metrics.typoCount++;
  if (execution && execution.command.trim()) {
    const fullOutput = execution.output || "(no output)";
    db.commandLog.unshift({
      id: uid(),
      userId,
      ts: Date.now(),
      command: redactCommandSecrets(execution.command.trim()).slice(0, 500),
      campaignId: execution.campaignId,
      moduleId: execution.moduleId,
      cwd: execution.cwd.slice(0, 256),
      exitCode: execution.exitCode,
      pasted: opts.pasted,
      typo: opts.typo,
      output: fullOutput.slice(0, MAX_COMMAND_OUTPUT_CHARS),
      outputTruncated: fullOutput.length > MAX_COMMAND_OUTPUT_CHARS,
    });
    db.commandLog = db.commandLog.slice(0, MAX_COMMAND_LOG_ENTRIES);
  }
  saveDB();
}

export function awardXp(userId: string, base: number): { gained: number; leveledUp: boolean } {
  const db = getDB();
  const u = db.users.find((x) => x.id === userId);
  if (!u) return { gained: 0, leveledUp: false };
  const before = levelFromXp(u.metrics.xp).level;
  const gained = Math.round(base * xpRate(u.metrics));
  u.metrics.xp += gained;
  const after = levelFromXp(u.metrics.xp).level;
  saveDB();
  return { gained, leveledUp: after > before };
}

export function grantBadge(userId: string, badgeId: string): boolean {
  const db = getDB();
  const u = db.users.find((x) => x.id === userId);
  if (!u || u.badges.includes(badgeId)) return false;
  u.badges.push(badgeId);
  pushFeed(u, "badge", `${u.displayName} earned the "${BADGES[badgeId]?.name || badgeId}" badge`);
  saveDB();
  return true;
}

export function createTicket(
  player: User,
  subject: string,
  moduleId: string | null,
  message: string,
  priority: Ticket["priority"]
): Ticket {
  const db = getDB();
  const ticket: Ticket = {
    id: uid(),
    playerId: player.id,
    playerName: player.displayName,
    subject,
    moduleId,
    status: "open",
    priority,
    createdAt: Date.now(),
    messages: [{ from: player.id, fromName: player.displayName, role: "player", ts: Date.now(), text: message }],
  };
  db.tickets.unshift(ticket);
  saveDB();
  return ticket;
}

export function replyTicket(ticketId: string, author: User, text: string) {
  const db = getDB();
  const tk = db.tickets.find((t) => t.id === ticketId);
  if (!tk) return;
  tk.messages.push({ from: author.id, fromName: author.displayName, role: author.role, ts: Date.now(), text });
  tk.status = author.role === "educator" ? "answered" : "open";
  saveDB();
}

export function setTicketStatus(ticketId: string, status: Ticket["status"]) {
  const db = getDB();
  const tk = db.tickets.find((t) => t.id === ticketId);
  if (tk) {
    tk.status = status;
    saveDB();
  }
}

export function ticketsFor(user: User): Ticket[] {
  const db = getDB();
  return user.role === "educator" ? db.tickets : db.tickets.filter((t) => t.playerId === user.id);
}

export function sendMessage(from: User, toId: string | "broadcast", text: string) {
  const db = getDB();
  if (toId === "broadcast") {
    for (const p of db.users.filter((u) => u.role === "player")) {
      db.messages.unshift({
        id: uid(),
        ts: Date.now(),
        fromId: from.id,
        fromName: from.displayName,
        toId: p.id,
        text,
        read: false,
        broadcast: true,
      });
    }
  } else {
    db.messages.unshift({
      id: uid(),
      ts: Date.now(),
      fromId: from.id,
      fromName: from.displayName,
      toId,
      text,
      read: false,
    });
  }
  saveDB();
}

export function inboxFor(userId: string): Message[] {
  return getDB().messages.filter((m) => m.toId === userId);
}

export function markMessagesRead(userId: string) {
  const db = getDB();
  db.messages.forEach((m) => {
    if (m.toId === userId) m.read = true;
  });
  saveDB();
}

export function getThread(aId: string, bId: string): ChatThread {
  const db = getDB();
  let th = db.chats.find((c) => c.members.includes(aId) && c.members.includes(bId));
  if (!th) {
    th = { id: uid(), members: [aId, bId], messages: [] };
    db.chats.push(th);
    saveDB();
  }
  return th;
}

export function sendChat(aId: string, bId: string, text: string) {
  const th = getThread(aId, bId);
  th.messages.push({ id: uid(), ts: Date.now(), fromId: aId, text });
  saveDB();
}

export function threadsFor(userId: string): ChatThread[] {
  return getDB().chats.filter((c) => c.members.includes(userId) && c.messages.length > 0);
}

export function resetAll() {
  cache = null;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
  notifyDBChange();
}

export function heartbeat(userId: string) {
  const u = userById(userId);
  if (!u) return;
  u.lastSeen = Date.now();
  u.metrics.secondsActive += 15;
  saveDB();
}

export { uid };
