import type { Lang } from "../i18n";
import { AVATAR_COLORS, AVATAR_ICONS } from "./avatarCatalog";
import { hashPassword, isScryptHash, verifyPassword } from "./passwordHash";
import {
  buildPlayerArchive,
  entryFromUser,
  hashRecoveryKey,
  passwordHashForImport,
  PLAYER_ARCHIVE_FORMAT,
  PLAYER_ARCHIVE_VERSION,
  recoveryKey,
  type PlayerArchive,
  type RecoveryKeyFileRecord,
} from "./playerArchive";
import { emptyOverlay, type AuthoredModule, type AuthoredPath, type AuthoredSection, type ContentOverlay } from "./contentAuthoring";
import { buildCourseExport, type CourseExport } from "./courseExport";
import type { AssessmentQ } from "../data/assessments";
import type { LabCommandFixture, LabFileSeed } from "./terminal";
import type { QuizQ } from "../data/quizzes";
import { applyCourseQuizOverrides } from "./courseQuizOverrides";

export type Role = "player" | "educator";
export type ContentWidth = "centered" | "wide" | "full";
export type ModProgress = {
  completed: boolean;
  done: string[];
  startedAt?: number;
  completedAt?: number;
  hinted?: boolean;
  // True once the student passes this lab's scenario assessment.
  assessed?: boolean;
};

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
  passwordHash: string;
  recoveryKeyHash?: string;
  role: Role;
  displayName: string;
  avatar: string;
  bio: string;
  interests: string[];
  hobbies: string[];
  createdAt: number;
  lastSeen?: number;
  activeCampaignId?: string;
  activeModuleId?: string;
  teamId?: string;
  lang: Lang;
  accepted: boolean;
  contentWidth?: ContentWidth;
  sidebarCollapsed?: boolean;
  uiScale?: number;
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
  kind: "join" | "task" | "module" | "challenge" | "badge" | "levelup" | "login" | "broadcast";
  text: string;
  campaignId?: string;
  moduleId?: string;
  objectiveId?: string;
  pathCompleted?: boolean;
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
  contentOverlay: ContentOverlay;
};

const KEY = "gamehack.platform.v1";

/**
 * The two logins that must always work: a player account for trying the
 * platform and the instructor account. ensureDemoAccounts() recreates them if
 * storage ever loses them and restores these passwords if they stop matching,
 * so a shared classroom login cannot be locked out by one student.
 */
export const DEMO_ACCOUNTS = [
  { username: "nova", password: "demodemo", role: "player", displayName: "Nova Reyes" },
  { username: "educator", password: "teach123", role: "educator", displayName: "Dr. Mara Vance" },
] as const;
const LEGACY_KEY = "hackforge.platform.v1";

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

export const HOBBIES_POOL = [
  "Gaming",
  "CTFs",
  "Coding",
  "Reading",
  "Music",
  "Movies",
  "Sports",
  "Chess",
  "Photography",
  "Hiking",
  "Cooking",
  "Robotics",
];

export type BadgeCategory = "certification" | "achievement" | "legacy";
export type BadgeCopy = { en: string; el: string };
export type Badge = {
  name: BadgeCopy;
  desc: BadgeCopy;
  icon: string;
  tier: "bronze" | "silver" | "gold";
  category: BadgeCategory;
  blurb: BadgeCopy;
};

const badgeCopy = (en: string, el: string): BadgeCopy => ({ en, el });
const legacyBadge = (nameEn: string, nameEl: string, icon: string, tier: Badge["tier"]): Badge => ({
  name: badgeCopy(nameEn, nameEl),
  desc: badgeCopy("Earlier lab badge", "Παλαιότερο παράσημο εργαστηρίου"),
  icon,
  tier,
  category: "legacy",
  blurb: badgeCopy(
    "Kept from an earlier course. New certifications are awarded at the end of a learning path.",
    "Κρατήθηκε από παλαιότερο κύκλο. Οι νέες πιστοποιήσεις δίνονται στο τέλος μιας διαδρομής μάθησης.",
  ),
});

export const PATH_CERTIFICATION: Record<string, string> = {
  "linux-part-01": "cert-linux-01",
  "linux-part-02": "cert-linux-02",
  "linux-part-03": "cert-linux-03",
  "ssh-port-22": "cert-ssh-22",
};

export const SWIFT_MS_PER_MODULE = 8 * 60 * 1000;

export function pathCompletedSwiftly(
  modules: { id: string }[],
  progress: Record<string, ModProgress>,
  msPerModule = SWIFT_MS_PER_MODULE,
): boolean {
  if (!modules.length) return false;
  let start = Infinity;
  let end = 0;
  for (const module of modules) {
    const saved = progress[module.id];
    if (!saved?.startedAt || !saved.completedAt || saved.completedAt < saved.startedAt) return false;
    start = Math.min(start, saved.startedAt);
    end = Math.max(end, saved.completedAt);
  }
  const elapsed = end - start;
  return elapsed > 0 && elapsed <= modules.length * msPerModule;
}

export function pathCompletedCleanly(modules: { id: string }[], progress: Record<string, ModProgress>): boolean {
  if (!modules.length) return false;
  return modules.every((module) => {
    const saved = progress[module.id];
    return !!saved?.startedAt && saved.hinted !== true;
  });
}

export const BADGES: Record<string, Badge> = {
  "cert-linux-01": {
    name: badgeCopy("Linux for Beginners, Part 1", "Linux για αρχάριους, μέρος 1"),
    desc: badgeCopy("Finished learning path 01", "Ολοκλήρωσες τη διαδρομή 01"),
    icon: "terminal",
    tier: "gold",
    category: "certification",
    blurb: badgeCopy(
      "Certifies the shell, files, text, packages and permissions. Awarded only when every lab in path 01 is complete.",
      "Πιστοποιεί το shell, τα αρχεία, το κείμενο, τα πακέτα και τα δικαιώματα. Δίνεται μόνο όταν ολοκληρωθεί κάθε εργαστήριο της διαδρομής 01.",
    ),
  },
  "cert-linux-02": {
    name: badgeCopy("Linux for Beginners, Part 2", "Linux για αρχάριους, μέρος 2"),
    desc: badgeCopy("Finished learning path 02", "Ολοκλήρωσες τη διαδρομή 02"),
    icon: "wifi",
    tier: "gold",
    category: "certification",
    blurb: badgeCopy(
      "Certifies networks, processes and environment variables inside the sandbox. Awarded at the end of path 02, not after each lab.",
      "Πιστοποιεί δίκτυα, διεργασίες και μεταβλητές περιβάλλοντος μέσα στο sandbox. Δίνεται στο τέλος της διαδρομής 02, όχι μετά από κάθε εργαστήριο.",
    ),
  },
  "cert-linux-03": {
    name: badgeCopy("Linux for Beginners, Part 3", "Linux για αρχάριους, μέρος 3"),
    desc: badgeCopy("Finished learning path 03", "Ολοκλήρωσες τη διαδρομή 03"),
    icon: "settings",
    tier: "gold",
    category: "certification",
    blurb: badgeCopy(
      "Certifies scripting, scheduling and the simulated services. Awarded when path 03 is complete.",
      "Πιστοποιεί scripting, χρονοπρογραμματισμό και τις εικονικές υπηρεσίες. Δίνεται όταν ολοκληρωθεί η διαδρομή 03.",
    ),
  },
  "cert-ssh-22": {
    name: badgeCopy("SSH on Port 22", "SSH στη θύρα 22"),
    desc: badgeCopy("Finished learning path 04", "Ολοκλήρωσες τη διαδρομή 04"),
    icon: "lock",
    tier: "gold",
    category: "certification",
    blurb: badgeCopy(
      "Certifies reading the fictional SSH service and the controls that harden it. Attack procedures are not part of this certificate.",
      "Πιστοποιεί την ανάγνωση της φανταστικής υπηρεσίας SSH και τους ελέγχους που τη σκληραίνουν. Οι διαδικασίες επίθεσης δεν είναι μέρος αυτού του πιστοποιητικού.",
    ),
  },
  "cert-all": {
    name: badgeCopy("Course Complete", "Ολοκλήρωση κύκλου"),
    desc: badgeCopy("Finished every learning path", "Ολοκλήρωσες κάθε διαδρομή μάθησης"),
    icon: "medal",
    tier: "gold",
    category: "certification",
    blurb: badgeCopy(
      "Awarded after all four numbered learning paths are complete.",
      "Δίνεται αφού ολοκληρωθούν και οι τέσσερις αριθμημένες διαδρομές μάθησης.",
    ),
  },
  firstblood: {
    name: badgeCopy("First Blood", "Πρώτο αίμα"),
    desc: badgeCopy("Completed your first objective", "Ολοκλήρωσες τον πρώτο στόχο"),
    icon: "flag",
    tier: "bronze",
    category: "achievement",
    blurb: badgeCopy(
      "Awarded for solving your very first hands-on objective in the lab.",
      "Δίνεται για την επίλυση του πρώτου πρακτικού στόχου στο εργαστήριο.",
    ),
  },
  swift: {
    name: badgeCopy("Swift", "Ταχύς"),
    desc: badgeCopy("Finished a path in under eight minutes per lab", "Ολοκλήρωσες διαδρομή σε λιγότερο από οκτώ λεπτά ανά εργαστήριο"),
    icon: "activity",
    tier: "silver",
    category: "achievement",
    blurb: badgeCopy(
      "Measured from the first objective of a learning path to its last quiz. The whole path must finish inside eight minutes per lab.",
      "Μετριέται από τον πρώτο στόχο μιας διαδρομής μέχρι το τελευταίο κουίζ. Ολόκληρη η διαδρομή πρέπει να κλείσει μέσα σε οκτώ λεπτά ανά εργαστήριο.",
    ),
  },
  clean_run: {
    name: badgeCopy("Independent", "Ανεξάρτητος"),
    desc: badgeCopy("Finished a path without hints", "Ολοκλήρωσες διαδρομή χωρίς υποδείξεις"),
    icon: "bulb",
    tier: "silver",
    category: "achievement",
    blurb: badgeCopy(
      "Every lab in a learning path was cleared without opening a hint.",
      "Κάθε εργαστήριο μιας διαδρομής ολοκληρώθηκε χωρίς άνοιγμα υπόδειξης.",
    ),
  },
  perfect_quiz: {
    name: badgeCopy("Perfect Quiz", "Τέλειο κουίζ"),
    desc: badgeCopy("Answered every quiz question correctly", "Απάντησες σωστά σε κάθε ερώτηση κουίζ"),
    icon: "target",
    tier: "bronze",
    category: "achievement",
    blurb: badgeCopy(
      "A quick quiz passed with a perfect score.",
      "Ένα σύντομο κουίζ πέρασε με τέλειο σκορ.",
    ),
  },
  high_fidelity: {
    name: badgeCopy("High Fidelity", "Υψηλή πιστότητα"),
    desc: badgeCopy("Kept fidelity above 90%", "Κράτησες πιστότητα πάνω από 90%"),
    icon: "check",
    tier: "silver",
    category: "achievement",
    blurb: badgeCopy(
      "Rewards genuine practice: over 90% of commands typed by hand rather than pasted, across at least 10 commands.",
      "Επιβραβεύει πραγματική εξάσκηση: πάνω από 90% των εντολών πληκτρολογημένες, όχι επικολλημένες, σε τουλάχιστον 10 εντολές.",
    ),
  },
  flawless: {
    name: badgeCopy("Flawless Typist", "Άψογος πληκτρολόγος"),
    desc: badgeCopy("10 commands, zero typos", "10 εντολές, κανένα τυπογραφικό"),
    icon: "spark",
    tier: "bronze",
    category: "achievement",
    blurb: badgeCopy(
      "Granted for precision at the keyboard: ten commands without a single typo.",
      "Δίνεται για ακρίβεια στο πληκτρολόγιο: δέκα εντολές χωρίς κανένα τυπογραφικό.",
    ),
  },
  accurate: {
    name: badgeCopy("Sharp Operator", "Ακριβής χειριστής"),
    desc: badgeCopy("90% accuracy across 15 commands", "90% ακρίβεια σε 15 εντολές"),
    icon: "scan",
    tier: "silver",
    category: "achievement",
    blurb: badgeCopy(
      "Command accuracy stayed at 90% or higher after at least 15 commands.",
      "Η ακρίβεια εντολών έμεινε στο 90% ή ψηλότερα μετά από τουλάχιστον 15 εντολές.",
    ),
  },
  dedicated: {
    name: badgeCopy("Dedicated", "Αφοσιωμένος"),
    desc: badgeCopy("3-day learning streak", "Σερί μάθησης 3 ημερών"),
    icon: "medal",
    tier: "silver",
    category: "achievement",
    blurb: badgeCopy(
      "Honours consistency: returning to train three days in a row.",
      "Τιμά τη συνέπεια: επιστροφή για εξάσκηση τρεις ημέρες στη σειρά.",
    ),
  },
  week_streak: {
    name: badgeCopy("Week Streak", "Σερί εβδομάδας"),
    desc: badgeCopy("7-day learning streak", "Σερί μάθησης 7 ημερών"),
    icon: "crown",
    tier: "gold",
    category: "achievement",
    blurb: badgeCopy(
      "Awarded for training seven days in a row.",
      "Δίνεται για εξάσκηση επτά ημέρες στη σειρά.",
    ),
  },
  shell_initiate: {
    name: badgeCopy("Shell Initiate", "Μυημένος του shell"),
    desc: badgeCopy("Earlier lab badge", "Παλαιότερο παράσημο εργαστηρίου"),
    icon: "terminal",
    tier: "bronze",
    category: "legacy",
    blurb: badgeCopy(
      "Kept from an earlier course. New certifications are awarded at the end of a learning path.",
      "Κρατήθηκε από παλαιότερο κύκλο. Οι νέες πιστοποιήσεις δίνονται στο τέλος μιας διαδρομής μάθησης.",
    ),
  },
  recon_scout: legacyBadge("Recon Scout", "Ανιχνευτής αναγνώρισης", "radar", "silver"),
  port_mapper: legacyBadge("Port Mapper", "Χαρτογράφος θυρών", "scan", "silver"),
  lockbreaker: legacyBadge("Lock Breaker", "Σπαστήρας κλειδαριών", "hammer", "silver"),
  query_bender: legacyBadge("Query Bender", "Χειριστής ερωτημάτων", "database", "gold"),
  root: legacyBadge("Root Master", "Κυρίαρχος root", "crown", "gold"),
  raven: legacyBadge("Raven Rooted", "Κατάκτηση Raven", "raven", "gold"),
  ssh_walker: legacyBadge("Wirewalker", "Περιπατητής καλωδίων", "key", "gold"),
  sudo_run: legacyBadge("Linux for Beginners #1", "Linux για αρχάριους 1", "terminal", "gold"),
  evidence_custodian: legacyBadge("Evidence Custodian", "Φύλακας τεκμηρίων", "shield", "bronze"),
  artifact_mapper: legacyBadge("Artifact Mapper", "Χαρτογράφος ιχνών", "settings", "silver"),
  document_analyst: legacyBadge("Document Analyst", "Αναλυτής εγγράφων", "file-text", "silver"),
  web_correlator: legacyBadge("Web Correlator", "Συσχετιστής ιστού", "globe", "silver"),
  packet_analyst: legacyBadge("Packet Analyst", "Αναλυτής πακέτων", "share", "silver"),
  disk_examiner: legacyBadge("Disk Examiner", "Εξεταστής δίσκου", "hard-drive", "silver"),
  static_analyst: legacyBadge("Static Analyst", "Στατικός αναλυτής", "bug", "gold"),
  memory_analyst: legacyBadge("Memory Analyst", "Αναλυτής μνήμης", "cpu", "gold"),
  container_examiner: legacyBadge("Container Examiner", "Εξεταστής container", "layers", "silver"),
  hash_examiner: legacyBadge("Hash Examiner", "Εξεταστής κατακερματισμών", "key", "gold"),
  incident_reporter: legacyBadge("Incident Reporter", "Συντάκτης αναφοράς", "file-text", "gold"),
};

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

const DEFAULT_ICON_KEYS = AVATAR_ICONS;
const DEFAULT_ICON_HEXES = AVATAR_COLORS;

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
    contentOverlay: emptyOverlay(),
  };

  const edu: User = {
    id: uid(),
    username: "educator",
    passwordHash: DEMO_ACCOUNTS[1].password,
    role: "educator",
    displayName: "Dr. Mara Vance",
    avatar: "ic:owl:#f97316",
    bio: "Lead cybersecurity instructor. Here to help you build practical skills.",
    interests: ["Red Team", "Networking", "Forensics"],
    hobbies: ["Reading", "Chess"],
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
      passwordHash: u === "nova" ? DEMO_ACCOUNTS[0].password : "demo",
      role: "player",
      displayName: dn,
      avatar: randomIconAvatar(u.length / 10 + 0.11),
      bio: "Aspiring ethical hacker.",
      interests: [...ints],
      hobbies: ["CTFs", "Gaming"],
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
    name: "Packet Ops",
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
    if (!u.activeCampaignId || u.activeCampaignId === "gamehack") {
      u.activeCampaignId = "linux-part-01";
      u.activeModuleId = uname === "cipher" ? "sr-perms" : uname === "nova" ? "sr-files" : "sr-intro";
    }
    if (u.lastSeen === undefined || uname === "nova" || uname === "cipher") u.lastSeen = now - plan.seenAgoMs;
  }
  (db as unknown as Record<string, unknown>)[DEMO_MAP_MARK] = 1;
}

/**
 * Guarantee the demo and educator logins. Called on every database load, so
 * wiping, importing or corrupting storage cannot leave the platform without a
 * way in. A password that no longer matches the documented one is reset, which
 * is deliberate: these are shared accounts, not personal ones.
 */
function ensureDemoAccounts(db: DB): boolean {
  let changed = false;
  for (const account of DEMO_ACCOUNTS) {
    const existing = db.users.find(
      (user) => user.username.trim().toLowerCase() === account.username.toLowerCase(),
    );
    if (!existing) {
      db.users.push({
        id: uid(),
        username: account.username,
        passwordHash: hashPassword(account.password),
        role: account.role,
        displayName: account.displayName,
        avatar: randomIconAvatar(),
        bio: "",
        interests: [],
        hobbies: [],
        createdAt: Date.now(),
        lang: "en",
        accepted: true,
        progress: {},
        metrics: freshMetrics(),
        badges: [],
      });
      changed = true;
      continue;
    }
    if (existing.role !== account.role) {
      existing.role = account.role;
      changed = true;
    }
    if (!verifyPassword(account.password, existing.passwordHash)) {
      existing.passwordHash = hashPassword(account.password);
      changed = true;
    }
  }
  return changed;
}

/**
 * A stored user record can arrive from an older schema, from the legacy storage
 * key, or from a hand-edited payload, and any of those may be missing the
 * collection fields. Almost every consumer spreads them, so one missing array
 * is a crash waiting to happen somewhere unrelated — the player archive export
 * is merely where it surfaced. Fill them in here instead of guarding at each
 * call site.
 *
 * Only the fields that get spread or iterated are normalised. `passwordHash` in
 * particular is left alone on purpose: upgradePasswordHashes() migrates a
 * legacy plaintext `password` into it, and writing an empty string here would
 * look like an already-migrated value and destroy that login.
 */
function normalizeStoredUser(value: unknown): User | null {
  if (!value || typeof value !== "object") return null;
  const stored = value as Partial<User>;
  if (typeof stored.id !== "string" || !stored.id) return null;
  const stringList = (candidate: unknown): string[] =>
    Array.isArray(candidate) ? candidate.filter((item): item is string => typeof item === "string") : [];
  return {
    ...stored,
    id: stored.id,
    interests: stringList(stored.interests),
    hobbies: stringList(stored.hobbies),
    badges: stringList(stored.badges),
    progress: stored.progress && typeof stored.progress === "object" ? stored.progress : {},
    metrics: {
      ...freshMetrics(),
      ...(stored.metrics && typeof stored.metrics === "object" ? stored.metrics : {}),
    },
  } as User;
}

function normalizeStoredDB(value: unknown): DB | null {
  if (!value || typeof value !== "object") return null;
  const stored = value as Partial<DB>;
  if (!Array.isArray(stored.users)) return null;
  return {
    users: stored.users
      .map((user) => normalizeStoredUser(user))
      .filter((user): user is User => user !== null),
    sessionUserId: typeof stored.sessionUserId === "string" ? stored.sessionUserId : null,
    feed: Array.isArray(stored.feed) ? stored.feed : [],
    tickets: Array.isArray(stored.tickets) ? stored.tickets : [],
    messages: Array.isArray(stored.messages) ? stored.messages : [],
    chats: Array.isArray(stored.chats) ? stored.chats : [],
    teams: Array.isArray(stored.teams) ? stored.teams : [],
    teamApplications: Array.isArray(stored.teamApplications) ? stored.teamApplications : [],
    commandLog: Array.isArray(stored.commandLog) ? stored.commandLog : [],
    contentOverlay: sanitizeOverlay(stored.contentOverlay),
  };
}

type StoredUser = User & { password?: string };

function upgradePasswordHashes(db: DB): boolean {
  let changed = false;
  for (const user of db.users as StoredUser[]) {
    const legacy = typeof user.password === "string" ? user.password : "";
    const current = typeof user.passwordHash === "string" ? user.passwordHash : legacy;
    if (current && !isScryptHash(current)) {
      user.passwordHash = hashPassword(current);
      changed = true;
    } else if (typeof user.passwordHash !== "string") {
      user.passwordHash = "";
      changed = true;
    }
    if ("password" in user) {
      delete user.password;
      changed = true;
    }
  }
  return changed;
}

function migrateLegacyCampaignIds(db: DB): void {
  for (const user of db.users) {
    const hiddenCampaigns = new Set([
      "forge",
      "gamehack",
      "raven",
      "wirewalk",
      "sudorun",
      "linux-beginners-2",
      "linux-beginners-3",
      "dfir-fieldwork",
      "ssh-service",
    ]);
    const visibleCampaignForModule: Record<string, string> = {
      "sr-intro": "linux-part-01",
      "sr-help": "linux-part-01",
      "sr-search": "linux-part-01",
      "sr-files": "linux-part-01",
      "sr-text": "linux-part-01",
      "sr-apt": "linux-part-01",
      "sr-perms": "linux-part-01",
      "sr-net": "linux-part-02",
      "sr-proc": "linux-part-02",
      "sr-env": "linux-part-02",
      "sr-bash": "linux-part-03",
      "sr-cron": "linux-part-03",
      "sr-svc": "linux-part-03",
      "ssh-doc-setup": "ssh-port-22",
      "ssh-svc-recon": "ssh-port-22",
      "ssh-svc-auth": "ssh-port-22",
      "ssh-doc-boundary": "ssh-port-22",
      "ssh-svc-harden": "ssh-port-22",
    };
    if (!user.activeCampaignId || hiddenCampaigns.has(user.activeCampaignId)) {
      const visible = visibleCampaignForModule[user.activeModuleId || ""];
      user.activeCampaignId = visible || "linux-part-01";
      if (!visible) user.activeModuleId = "sr-intro";
    }
    if (typeof user.avatar === "string") user.avatar = user.avatar.replace(/#ff6a2b/gi, "#06b6d4");
    if (user.bio === "Lead cybersecurity instructor. Here to help you forge real skills.") {
      user.bio = "Lead cybersecurity instructor. Here to help you build practical skills.";
    }
  }
  for (const team of db.teams) {
    if (team.name === "Packet Forge" && team.description === "Network reconnaissance and offensive-security practice.") {
      team.name = "Packet Ops";
    }
  }
  for (const event of db.feed) {
    if (event.campaignId === "forge" || event.campaignId === "gamehack") event.campaignId = "linux-part-01";
    if (typeof event.text === "string") event.text = event.text.replace(/\bjoined HACKFORGE\b/g, "joined GameHack");
  }
  for (const execution of db.commandLog) {
    if (execution.campaignId === "forge" || execution.campaignId === "gamehack") execution.campaignId = "linux-part-01";
  }
}

/**
 * Authored content comes from storage, so it is shape-checked on the way in
 * rather than trusted. Anything malformed is dropped instead of rendered.
 */
function sanitizeBi(value: unknown): { en: string; el: string } {
  const record = (value || {}) as Record<string, unknown>;
  return {
    en: typeof record.en === "string" ? record.en.slice(0, 8000) : "",
    el: typeof record.el === "string" ? record.el.slice(0, 8000) : "",
  };
}

function sanitizeCheck(value: unknown): AuthoredModule["tasks"][number]["check"] {
  const record = (value || {}) as Record<string, unknown>;
  const text = (field: string) => (typeof record[field] === "string" ? (record[field] as string).slice(0, 600) : "");
  switch (record.kind) {
    case "command":
      return { kind: "command", pattern: text("pattern") };
    case "flag":
      return { kind: "flag", name: text("name") };
    case "fileRead":
      return { kind: "fileRead", path: text("path") };
    case "commandAndFile":
      return { kind: "commandAndFile", pattern: text("pattern"), path: text("path") };
    case "builtin":
      return { kind: "builtin" };
    default:
      return { kind: "unset" };
  }
}

/** Terminal transcripts are plain data; dropping them here would silently
 *  delete every screenshot from an edited or imported lab. */
function sanitizeShots(value: unknown): AuthoredSection["shots"] {
  if (!Array.isArray(value)) return undefined;
  const shots = value.slice(0, 40).map((shot: Record<string, unknown>) => ({
    ...(typeof shot?.cmd === "string" ? { cmd: shot.cmd.slice(0, 500) } : {}),
    ...(shot?.caption ? { caption: sanitizeBi(shot.caption) } : {}),
    lines: Array.isArray(shot?.lines)
      ? (shot.lines as unknown[]).filter((line): line is string => typeof line === "string").slice(0, 200).map((line) => line.slice(0, 500))
      : [],
  }));
  return shots.length ? shots : undefined;
}

/** Files a lab seeds into the sandbox. Content is the point, so it is kept whole. */
function sanitizeFileSeeds(value: unknown, limit: number): LabFileSeed[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const seeds = value.slice(0, limit).map((raw: Record<string, unknown>) => ({
    path: typeof raw?.path === "string" ? raw.path.slice(0, 400) : "",
    content: typeof raw?.content === "string" ? raw.content.slice(0, 200_000) : "",
    ...(typeof raw?.contentBase64 === "string" && raw.contentBase64.trim()
      ? { contentBase64: raw.contentBase64.replace(/[^A-Za-z0-9+/=]/g, "").slice(0, 400_000) }
      : {}),
    ...(typeof raw?.mode === "string" ? { mode: raw.mode.slice(0, 20) } : {}),
    ...(typeof raw?.owner === "string" ? { owner: raw.owner.slice(0, 60) } : {}),
    ...(typeof raw?.group === "string" ? { group: raw.group.slice(0, 60) } : {}),
  })).filter((seed: LabFileSeed) => seed.path.startsWith("/"));
  return seeds.length ? seeds : undefined;
}

/** Canned command results for a lab. Matching is exact, so the key is the line. */
function sanitizeCommandFixtures(value: unknown, limit: number): LabCommandFixture[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const fixtures = value.slice(0, limit).map((raw: Record<string, unknown>) => ({
    command: typeof raw?.command === "string" ? raw.command.slice(0, 400) : "",
    output: typeof raw?.output === "string" ? raw.output.slice(0, 100_000) : "",
    ...(Number.isFinite(Number(raw?.exit)) ? { exit: Math.max(0, Math.min(255, Number(raw.exit))) } : {}),
    ...(typeof raw?.flag === "string" && raw.flag ? { flag: raw.flag.slice(0, 80) } : {}),
  })).filter((fixture: LabCommandFixture) => fixture.command.trim().length > 0);
  return fixtures.length ? fixtures : undefined;
}

function stringIdList(value: unknown, limit: number): string[] {
  if (!Array.isArray(value)) return [];
  return (value as unknown[]).filter((entry): entry is string => typeof entry === "string" && !!entry).slice(0, limit).map((entry) => entry.slice(0, 80));
}

function sanitizePath(path: Record<string, unknown> | undefined, fallbackId: string): AuthoredPath {
  return {
    id: typeof path?.id === "string" && path.id ? path.id.slice(0, 80) : fallbackId,
    title: sanitizeBi(path?.title),
    subtitle: sanitizeBi(path?.subtitle),
    blurb: sanitizeBi(path?.blurb),
    scenario: (["lab", "raven", "ssh", "sudorun", "dfir"].includes(String(path?.scenario)) ? String(path?.scenario) : "lab") as AuthoredPath["scenario"],
    accent: typeof path?.accent === "string" ? path.accent.slice(0, 40) : "cyan",
    moduleIds: Array.isArray(path?.moduleIds)
      ? (path.moduleIds as unknown[]).filter((entry): entry is string => typeof entry === "string").slice(0, 40)
      : [],
  };
}

/** Edits to shipped paths, keyed by built-in id. A blank key would be unaddressable. */
function sanitizePathEdits(value: unknown): Record<string, AuthoredPath> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const result: Record<string, AuthoredPath> = {};
  let count = 0;
  for (const [rawId, raw] of Object.entries(value as Record<string, Record<string, unknown>>)) {
    if (!rawId || !raw || typeof raw !== "object" || count >= 20) continue;
    result[rawId.slice(0, 80)] = sanitizePath(raw, rawId.slice(0, 80));
    count += 1;
  }
  return Object.keys(result).length ? result : undefined;
}

function sanitizeQuestionBank<T>(value: unknown): Record<string, T[]> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const result: Record<string, T[]> = {};
  for (const [rawId, questions] of Object.entries(value as Record<string, unknown>)) {
    if (!rawId || !Array.isArray(questions)) continue;
    result[rawId.slice(0, 80)] = questions.slice(0, 20) as T[];
  }
  return Object.keys(result).length ? result : undefined;
}

function sanitizeOverlay(value: unknown): ContentOverlay {
  const record = (value || {}) as Record<string, unknown>;
  const modules: ContentOverlay["modules"] = {};
  if (record.modules && typeof record.modules === "object") {
    for (const [rawId, raw] of Object.entries(record.modules as Record<string, Record<string, unknown>>)) {
      if (!rawId || typeof raw !== "object" || !raw) continue;
      const id = rawId.slice(0, 80);
      const difficulty = Number(raw.difficulty);
      modules[id] = {
        id,
        order: Number.isFinite(Number(raw.order)) ? Number(raw.order) : 1,
        icon: typeof raw.icon === "string" ? raw.icon.slice(0, 40) : "terminal",
        color: typeof raw.color === "string" ? raw.color.slice(0, 80) : "from-cyan-400 to-sky-900",
        difficulty: ([1, 2, 3, 4, 5].includes(difficulty) ? difficulty : 2) as AuthoredModule["difficulty"],
        scenario: (["lab", "raven", "ssh", "sudorun", "dfir"].includes(String(raw.scenario)) ? String(raw.scenario) : "lab") as AuthoredModule["scenario"],
        title: sanitizeBi(raw.title),
        subtitle: sanitizeBi(raw.subtitle),
        badge: sanitizeBi(raw.badge),
        theory: Array.isArray(raw.theory)
          ? raw.theory.slice(0, 40).map((section: Record<string, unknown>, index: number) => ({
              id: typeof section?.id === "string" ? section.id.slice(0, 80) : `${id}-theory-${index}`,
              heading: sanitizeBi(section?.heading),
              body: sanitizeBi(section?.body),
              ...(section?.tip ? { tip: sanitizeBi(section.tip) } : {}),
              ...(Array.isArray(section?.shots) && section.shots.length
                ? { shots: sanitizeShots(section.shots) }
                : {}),
              ...(section?.visual ? { visual: structuredClone(section.visual) as AuthoredSection["visual"] } : {}),
            }))
          : [],
        cheats: Array.isArray(raw.cheats)
          ? raw.cheats.slice(0, 80).map((cheat: Record<string, unknown>) => ({
              cmd: typeof cheat?.cmd === "string" ? cheat.cmd.slice(0, 300) : "",
              desc: sanitizeBi(cheat?.desc),
            }))
          : [],
        tasks: Array.isArray(raw.tasks)
          ? raw.tasks.slice(0, 40).map((task: Record<string, unknown>, index: number) => ({
              id: typeof task?.id === "string" ? task.id.slice(0, 80) : `${id}-task-${index}`,
              instruction: sanitizeBi(task?.instruction),
              hint: sanitizeBi(task?.hint),
              explain: sanitizeBi(task?.explain),
              reward: Number.isFinite(Number(task?.reward)) ? Math.max(0, Math.min(999, Number(task.reward))) : 5,
              ...(task?.material ? { material: sanitizeBi(task.material) } : {}),
              check: sanitizeCheck(task?.check),
            }))
          : [],
        challenges: Array.isArray(raw.challenges)
          ? raw.challenges.slice(0, 2).map((challenge: Record<string, unknown>, index: number) => ({
              id: typeof challenge?.id === "string" ? challenge.id.slice(0, 80) : `${id}-challenge-${index}`,
              title: sanitizeBi(challenge?.title),
              brief: sanitizeBi(challenge?.brief),
              success: sanitizeBi(challenge?.success),
              check: sanitizeCheck(challenge?.check),
            }))
          : [],
        ...(sanitizeFileSeeds(raw.files, 400) ? { files: sanitizeFileSeeds(raw.files, 400) } : {}),
        ...(sanitizeCommandFixtures(raw.commands, 200) ? { commands: sanitizeCommandFixtures(raw.commands, 200) } : {}),
      };
    }
  }
  const paths = Array.isArray(record.paths)
    ? record.paths.slice(0, 20).map((path: Record<string, unknown>, index: number) => sanitizePath(path, `path-${index}`))
    : [];
  const pathEdits = sanitizePathEdits(record.pathEdits);
  const hiddenPaths = stringIdList(record.hiddenPaths, 20);
  const hiddenModules = stringIdList(record.hiddenModules, 200);
  const filesystem = sanitizeFileSeeds(record.filesystem, 4000);
  const quizzes = sanitizeQuestionBank<QuizQ>(record.quizzes);
  const assessments = sanitizeQuestionBank<AssessmentQ>(record.assessments);
  return {
    modules,
    paths,
    ...(pathEdits ? { pathEdits } : {}),
    ...(hiddenPaths.length ? { hiddenPaths } : {}),
    ...(hiddenModules.length ? { hiddenModules } : {}),
    ...(filesystem ? { filesystem } : {}),
    ...(quizzes ? { quizzes } : {}),
    ...(assessments ? { assessments } : {}),
  };
}

/** The authored-content layer educators edit from the dashboard. */
export function getContentOverlay(): ContentOverlay {
  return getDB().contentOverlay;
}

export function saveContentOverlay(overlay: ContentOverlay): boolean {
  const db = getDB();
  db.contentOverlay = sanitizeOverlay(overlay);
  applyCourseQuizOverrides(db.contentOverlay);
  return saveDB();
}

export function getDB(): DB {
  if (cache) return cache;
  try {
    const current = localStorage.getItem(KEY);
    const raw = current || localStorage.getItem(LEGACY_KEY);
    if (raw) {
      cache = normalizeStoredDB(JSON.parse(raw));
      if (cache) {
        migrateLegacyCampaignIds(cache);
        enrichDemoPresence(cache);
        ensureDemoAccounts(cache);
        // Imported question banks have to reach the live maps before any screen
        // reads them, which happens on first render.
        applyCourseQuizOverrides(cache.contentOverlay);
        if (saveDB()) {
          try {
            localStorage.removeItem(LEGACY_KEY);
          } catch {
            /* Keep the legacy copy if storage cleanup is blocked. */
          }
        }
        return cache;
      }
    }
  } catch {
    /* ignore */
  }
  cache = seed();
  enrichDemoPresence(cache);
  upgradePasswordHashes(cache);
  ensureDemoAccounts(cache);
  saveDB();
  return cache;
}

export function saveDB(): boolean {
  if (!cache) return false;
  let saved = false;
  try {
    localStorage.setItem(KEY, JSON.stringify(cache));
    saved = true;
  } catch {
    /* Keep the legacy copy if storage is unavailable or full. */
  }
  notifyDBChange();
  return saved;
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
      passwordHash: "",
      role: "player",
      displayName: normalizedNickname,
      avatar: randomIconAvatar(),
      bio: "",
      interests: [],
      hobbies: [],
      createdAt: Date.now(),
      lang: "en",
      accepted: false,
      progress: {},
      metrics: freshMetrics(),
      badges: [],
    };
    db.users.push(user);
    pushFeed(user, "join", `${user.displayName} joined GameHack`);
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
  if (!u || !verifyPassword(password, u.passwordHash)) return { ok: false, error: "Invalid username or email, or password" };
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

export type FeedEventDetails = Pick<FeedEvent, "campaignId" | "moduleId" | "objectiveId" | "pathCompleted">;

export function pushFeed(user: User, kind: FeedEvent["kind"], text: string, details?: FeedEventDetails) {
  const db = getDB();
  db.feed.unshift({ id: uid(), ts: Date.now(), userId: user.id, username: user.displayName, kind, text, ...details });
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
  pushFeed(u, "badge", `${u.displayName} earned the "${BADGES[badgeId]?.name.en || badgeId}" badge`);
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
    pushFeed(from, "broadcast", text);
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

export function extractPlayerArchive(): PlayerArchive {
  const db = getDB();
  upgradePasswordHashes(db);
  const built = buildPlayerArchive(db.users);
  db.users.forEach((user, index) => {
    user.recoveryKeyHash = built.users[index]?.recoveryKeyHash;
  });
  saveDB();
  return built.archive;
}

/**
 * A self-service backup of one account.
 *
 * The plaintext recovery key is never stored anywhere — only its hash — so an
 * export cannot contain the key the user already has. Passing
 * `issueNewRecoveryKey` mints a replacement, persists its hash and embeds the
 * plaintext in the file; the previous key stops working, which is why the UI
 * leaves this off by default and warns before turning it on.
 */
export function extractOwnArchive(
  userId: string,
  issueNewRecoveryKey = false,
): { archive: PlayerArchive; recoveryKey: string | null } | null {
  const db = getDB();
  upgradePasswordHashes(db);
  const user = db.users.find((candidate) => candidate.id === userId);
  if (!user) return null;

  let recoveryKeyPlaintext: string | null = null;
  let recoveryKeyFile: RecoveryKeyFileRecord | null = null;
  if (issueNewRecoveryKey) {
    recoveryKeyPlaintext = recoveryKey();
    user.recoveryKeyHash = hashRecoveryKey(recoveryKeyPlaintext);
    recoveryKeyFile = {
      format: "gamehack-recovery-key",
      version: 1,
      email: user.username,
      recoveryKey: recoveryKeyPlaintext,
    };
    saveDB();
  }

  const archive: PlayerArchive = {
    format: PLAYER_ARCHIVE_FORMAT,
    version: PLAYER_ARCHIVE_VERSION,
    exportedAt: new Date().toISOString(),
    passwordStorage: "scrypt",
    recoveryKeyStorage: "sha256",
    players: [entryFromUser(user, recoveryKeyFile)],
  };
  return { archive, recoveryKey: recoveryKeyPlaintext };
}

/** The full effective course catalogue — built-in paths merged with authored
 *  edits — as plain JSON. Objective tests are closures, so they are marked
 *  rather than silently dropped. */
export function exportCourseCatalog(overlay?: ContentOverlay, filesystem?: LabFileSeed[]): CourseExport {
  return buildCourseExport(overlay ?? getDB().contentOverlay, new Date(), filesystem);
}

export async function importPlayerArchive(archive: PlayerArchive, currentUserId?: string): Promise<number> {
  const db = getDB();
  let imported = 0;
  for (const entry of archive.players) {
    const identity = entry.id.trim().toLowerCase();
    const username = entry.username.trim().toLowerCase();
    let user = db.users.find((item) => item.id.toLowerCase() === identity)
      || db.users.find((item) => item.username.trim().toLowerCase() === username);
    const passwordHash = await passwordHashForImport(entry);
    const recoveryKeyHash = entry.recoveryKeyFile
      ? hashRecoveryKey(entry.recoveryKeyFile.recoveryKey)
      : entry.recoveryKeyHash || undefined;
    const metrics = { ...freshMetrics(), ...entry.metrics, xp: Number(entry.metrics.xp) || 0 };
    if (!user) {
      user = {
        id: entry.id,
        username: entry.username,
        passwordHash,
        recoveryKeyHash,
        role: entry.role,
        displayName: entry.displayName,
        avatar: entry.avatar,
        bio: entry.bio,
        interests: [...entry.interests],
        hobbies: [...entry.hobbies],
        createdAt: entry.createdAt,
        teamId: entry.teamId,
        lang: entry.lang,
        accepted: true,
        progress: structuredClone(entry.progress),
        metrics,
        badges: [...entry.badges],
      };
      db.users.push(user);
    } else {
      user.username = entry.username || user.username;
      user.displayName = entry.displayName || user.displayName;
      user.avatar = entry.avatar || user.avatar;
      user.bio = entry.bio;
      user.interests = [...entry.interests];
      user.hobbies = [...entry.hobbies];
      user.teamId = entry.teamId;
      user.lang = entry.lang;
      user.progress = structuredClone(entry.progress);
      user.metrics = metrics;
      user.badges = [...entry.badges];
      if (passwordHash) user.passwordHash = passwordHash;
      if (recoveryKeyHash) user.recoveryKeyHash = recoveryKeyHash;
      if (user.id !== currentUserId) user.role = entry.role;
    }
    imported += 1;
  }
  saveDB();
  return imported;
}

export function resetAll() {
  cache = null;
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(LEGACY_KEY);
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
