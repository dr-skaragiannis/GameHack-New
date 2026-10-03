// HACKFORGE platform data layer.
// A fully client-side "backend" persisted in localStorage. It stores users
// (players + educators), per-user lab progress, gamification metrics, badges,
// a live activity feed, tickets, direct/broadcast messages and player chat.
//
// Everything is namespaced under one key and loaded/saved as a single blob.

import type { Lang } from "../i18n";

export type Role = "player" | "educator";

// Reading-column width preference for theory/content.
export type ContentWidth = "centered" | "wide" | "full";

export type ModProgress = { completed: boolean; done: string[] };

// Scientific-ish learning metrics tracked per user.
export type Metrics = {
  xp: number; // effective XP already awarded (after rate modifiers)
  commandsRun: number;
  pasteCount: number; // commands that were pasted (lowers fidelity)
  typedCount: number; // commands typed by hand
  typoCount: number; // mistyped / command-not-found events
  hintsUsed: number;
  challengeAttempts: number;
  challengeSolves: number;
  secondsActive: number;
  streakDays: number;
  lastActiveDay: string; // yyyy-mm-dd
};

export type User = {
  id: string;
  username: string;
  password: string; // plaintext for this local simulation only
  role: Role;
  displayName: string;
  avatar: string; // data-url or "" (fallback to generated)
  bio: string;
  interests: string[];
  createdAt: number;
  lastSeen?: number; // ms epoch — presence heartbeat for the learning map
  lang: Lang;
  accepted: boolean;
  // UI preferences
  contentWidth?: ContentWidth; // theory/reading column width
  sidebarCollapsed?: boolean; // left sidebar minimized
  // learning data
  progress: Record<string, ModProgress>; // moduleId -> progress
  metrics: Metrics;
  badges: string[]; // badge ids earned
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
  moduleId: string | null; // lab-specific or general
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
  blurb: string; // longer certification-style description
};

export const BADGES: Record<string, Badge> = {
  // ---- Sudo_Run (Linux for Beginners) campaign ----
  sr_first_boot: {
    name: "First Boot",
    desc: "Finished Sudo_Run Boot Camp",
    icon: "terminal",
    tier: "bronze",
    blurb: "Certifies the very first steps on a Linux box: orientation with pwd, whoami, ls and cd.",
  },
  sr_finder: {
    name: "Finder",
    desc: "Finished Sudo_Run Search Party",
    icon: "radar",
    tier: "bronze",
    blurb: "Earned by mastering the search toolkit: --help, man, locate, whereis, which, find and grep.",
  },
  sr_blacksmith: {
    name: "Blacksmith",
    desc: "Finished Sudo_Run File Forge",
    icon: "folder",
    tier: "bronze",
    blurb: "Proves command of the file lifecycle: cat, touch, mkdir, cp, mv, rm and rmdir.",
  },
  sr_text_smith: {
    name: "Text Smith",
    desc: "Finished Sudo_Run Text Smith",
    icon: "scale",
    tier: "bronze",
    blurb: "Awarded for slicing, numbering and rewriting text with head, tail, nl, sed, more and less.",
  },
  sr_quartermaster: {
    name: "Quartermaster",
    desc: "Finished Sudo_Run Package Ops",
    icon: "database",
    tier: "silver",
    blurb: "Certifies the apt workflow: search the cache, install, remove, purge, update and upgrade.",
  },
  sr_keymaster: {
    name: "Keymaster",
    desc: "Finished Sudo_Run Permission Forge",
    icon: "key",
    tier: "silver",
    blurb: "Recognises mastery of the Linux permission model: rwx triplets, chmod, chown, chgrp, SUID and SGID.",
  },
  sr_signal_rider: {
    name: "Signal Rider",
    desc: "Finished Sudo_Run Network Control",
    icon: "globe",
    tier: "silver",
    blurb: "Earned by controlling interfaces, addresses and name resolution: ifconfig, dhclient, dig and the resolver files.",
  },
  sr_process_wrangler: {
    name: "Process Wrangler",
    desc: "Finished Sudo_Run Process Command",
    icon: "scan",
    tier: "silver",
    blurb: "Certifies process control: ps, top, nice, renice, kill, background jobs and the at scheduler.",
  },
  sr_env_shaper: {
    name: "Env Shaper",
    desc: "Finished Sudo_Run Environment Shaper",
    icon: "bulb",
    tier: "silver",
    blurb: "Awarded for shaping the shell environment: env, set, HISTSIZE, export, custom variables and unset.",
  },
  sr_scriptwright: {
    name: "Scriptwright",
    desc: "Finished Sudo_Run Script Forge",
    icon: "hammer",
    tier: "gold",
    blurb: "Proves you can build and run bash programs: shebang, echo, read, chmod +x, ./script and nmap pipelines.",
  },
  sr_timekeeper: {
    name: "Timekeeper",
    desc: "Finished Sudo_Run Clockwork",
    icon: "lock",
    tier: "gold",
    blurb: "Recognises mastery of scheduling and boot services: cron, the seven crontab fields, runlevels and update-rc.d.",
  },
  sr_service_marshal: {
    name: "Service Marshal",
    desc: "Finished Sudo_Run Service Ops",
    icon: "medal",
    tier: "gold",
    blurb: "The campaign finale: Apache on localhost, OpenSSH to a remote box, and an anonymous FTP download.",
  },
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
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

// Pick a random themed icon avatar ("ic:<key>:<hex>") for new accounts.
const DEFAULT_ICON_KEYS = [
  "skull", "terminal", "ghost", "dragon", "bug", "shield", "radar", "wolf",
  "owl", "raven", "phoenix", "atom", "cpu", "qubit", "cybereye", "wyvern",
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

// Tailwind classes for the reading/content column width preference.
// On small screens content is always full width; the preference applies at lg+.
export function contentWidthClass(w?: ContentWidth): string {
  switch (w) {
    case "centered":
      return "mx-auto w-full lg:max-w-4xl";
    case "full":
      return "w-full max-w-none";
    case "wide":
    default:
      return "mx-auto w-full lg:max-w-[75%]";
  }
}

// ---------------- derived gamification scores ----------------

// Fidelity = share of commands typed by hand (not pasted). High fidelity means
// the learner is genuinely practicing rather than copy-pasting solutions.
export function fidelityScore(m: Metrics): number {
  const total = m.pasteCount + m.typedCount;
  if (total === 0) return 100;
  return Math.round((m.typedCount / total) * 100);
}

// Accuracy = share of commands that were not typos.
export function accuracyScore(m: Metrics): number {
  if (m.commandsRun === 0) return 100;
  const good = Math.max(0, m.commandsRun - m.typoCount);
  return Math.round((good / m.commandsRun) * 100);
}

// The XP rate multiplier applied to every award. Pasting and typos reduce it,
// so sloppy copy-paste runs earn less XP than careful hands-on practice.
export function xpRate(m: Metrics): number {
  const fid = fidelityScore(m) / 100; // 0..1
  const acc = accuracyScore(m) / 100; // 0..1
  // weight fidelity heavier; floor at 0.4 so progress never fully stalls
  const rate = 0.4 + 0.45 * fid + 0.15 * acc;
  return Math.min(1, Math.round(rate * 100) / 100);
}

export function levelFromXp(xp: number): { level: number; into: number; span: number; pct: number } {
  // Small, memorable thresholds: level 1→2 needs 10 XP, then +5 per level.
  let level = 1;
  let remaining = xp;
  let span = 10;
  while (remaining >= span) {
    remaining -= span;
    level++;
    span = 10 + (level - 1) * 5;
  }
  return { level, into: remaining, span, pct: Math.round((remaining / span) * 100) };
}

// ---------------- persistence ----------------

let cache: DB | null = null;

function seed(): DB {
  const db: DB = { users: [], sessionUserId: null, feed: [], tickets: [], messages: [], chats: [] };
  // a default educator so the educator dashboard is reachable out of the box
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
  // a couple of demo players to populate leaderboards & charts
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
  return db;
}

// One-time idempotent enrichment so the learning map looks alive out of the
// box: demo players get lab progress (so they pin to different map nodes) and
// staggered presence timestamps (a mix of online / offline markers).
const DEMO_MAP_MARK = "mapDemoV1";
function enrichDemoPresence(db: DB) {
  if ((db as unknown as Record<string, unknown>)[DEMO_MAP_MARK]) return;
  const now = Date.now();
  const plans: Record<string, { done: string[]; seenAgoMs: number }> = {
    nova: { done: ["linux-basics", "files"], seenAgoMs: 2 * 60_000 }, // online now
    byte: { done: ["linux-basics"], seenAgoMs: 26 * 3_600_000 }, // offline since yesterday
    cipher: {
      done: ["linux-basics", "files", "permissions", "networking", "recon", "scanning"],
      seenAgoMs: 45_000, // online now
    },
  };
  for (const [uname, plan] of Object.entries(plans)) {
    const u = db.users.find((x) => x.username === uname && x.role === "player");
    if (!u) continue;
    if (Object.keys(u.progress).length === 0) {
      for (const mid of plan.done) u.progress[mid] = { completed: true, done: [] };
    }
    if (u.lastSeen === undefined) u.lastSeen = now - plan.seenAgoMs;
  }
  (db as unknown as Record<string, unknown>)[DEMO_MAP_MARK] = 1;
}

export function getDB(): DB {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      cache = JSON.parse(raw);
      enrichDemoPresence(cache!);
      saveDB();
      return cache!;
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
}

// ---------------- auth ----------------

export function register(
  username: string,
  password: string,
  role: Role,
  displayName: string
): { ok: boolean; error?: string; user?: User } {
  const db = getDB();
  const uname = username.trim().toLowerCase();
  if (!uname || !password) return { ok: false, error: "Username and password required" };
  if (uname.length < 3) return { ok: false, error: "Username must be at least 3 characters" };
  if (db.users.some((u) => u.username === uname)) return { ok: false, error: "Username already taken" };
  const user: User = {
    id: uid(),
    username: uname,
    password,
    role,
    displayName: displayName.trim() || username,
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
  db.sessionUserId = user.id;
  pushFeed(user, "join", `${user.displayName} joined HACKFORGE`);
  saveDB();
  return { ok: true, user };
}

export function login(username: string, password: string): { ok: boolean; error?: string; user?: User } {
  const db = getDB();
  const u = db.users.find((x) => x.username === username.trim().toLowerCase());
  if (!u || u.password !== password) return { ok: false, error: "Invalid username or password" };
  db.sessionUserId = u.id;
  touchStreak(u);
  u.lastSeen = Date.now();
  pushFeed(u, "login", `${u.displayName} logged in`);
  saveDB();
  return { ok: true, user: u };
}

export function logout() {
  const db = getDB();
  // mark the departing user offline so the learning map greys them out
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
export function allEducators(): User[] {
  return getDB().users.filter((u) => u.role === "educator");
}
export function userById(id: string): User | undefined {
  return getDB().users.find((u) => u.id === id);
}

// ---------------- feed ----------------

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

// ---------------- gamification events ----------------

export function recordCommand(userId: string, opts: { pasted: boolean; typo: boolean }) {
  const db = getDB();
  const u = db.users.find((x) => x.id === userId);
  if (!u) return;
  u.metrics.commandsRun++;
  if (opts.pasted) u.metrics.pasteCount++;
  else u.metrics.typedCount++;
  if (opts.typo) u.metrics.typoCount++;
  saveDB();
}

// Award XP for a task/challenge, scaled by the current XP rate modifier.
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

// ---------------- tickets ----------------

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

// ---------------- messages (educator -> players, broadcast) ----------------

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
    db.messages.unshift({ id: uid(), ts: Date.now(), fromId: from.id, fromName: from.displayName, toId, text, read: false });
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

// ---------------- player-to-player chat ----------------

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
}
