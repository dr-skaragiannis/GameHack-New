import { sha256 } from "@noble/hashes/sha256";
import { bytesToHex, randomBytes, utf8ToBytes } from "@noble/hashes/utils";
import type { Lang } from "../i18n";
import type { Metrics, ModProgress, Role, User } from "./db";
import { hashPassword, isScryptHash } from "./passwordHash";

export const PLAYER_ARCHIVE_FORMAT = "gamehack-players";
export const PLAYER_ARCHIVE_VERSION = 1;

export type RecoveryKeyFileRecord = {
  format: "gamehack-recovery-key";
  version: 1;
  email: string;
  recoveryKey: string;
};

export type PlayerArchiveEntry = {
  id: string;
  username: string;
  displayName: string;
  role: Role;
  avatar: string;
  bio: string;
  interests: string[];
  hobbies: string[];
  createdAt: number;
  teamId?: string;
  lang: Lang;
  progress: Record<string, ModProgress>;
  metrics: Metrics;
  badges: string[];
  passwordHash: string;
  recoveryKeyHash: string | null;
  recoveryKeyFile: RecoveryKeyFileRecord | null;
};

export type PlayerArchive = {
  format: typeof PLAYER_ARCHIVE_FORMAT;
  version: typeof PLAYER_ARCHIVE_VERSION;
  exportedAt: string;
  passwordStorage: "scrypt";
  recoveryKeyStorage: "sha256";
  players: PlayerArchiveEntry[];
};

type ArchiveUser = User & { password?: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

/** A fresh 43-character recovery key. Exported so a self-service data download
 *  can mint one on request; the plaintext is never stored, only its hash. */
export function recoveryKey(): string {
  const bytes = randomBytes(32);
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

export function hashRecoveryKey(key: string): string {
  return bytesToHex(sha256(utf8ToBytes(key)));
}

function recoveryFile(value: unknown): RecoveryKeyFileRecord | null {
  if (!isRecord(value)) return null;
  if (value.format !== "gamehack-recovery-key" || value.version !== 1) return null;
  if (typeof value.email !== "string" || typeof value.recoveryKey !== "string") return null;
  if (!/^[A-Za-z0-9_-]{43}$/.test(value.recoveryKey)) return null;
  return {
    format: "gamehack-recovery-key",
    version: 1,
    email: value.email.trim().toLowerCase(),
    recoveryKey: value.recoveryKey,
  };
}

function stringList(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function entryFromUser(user: User, file: RecoveryKeyFileRecord | null = null): PlayerArchiveEntry {
  const stored = user as ArchiveUser;
  const passwordHash = isScryptHash(user.passwordHash)
    ? user.passwordHash
    : isScryptHash(stored.password || "")
      ? stored.password || ""
      : "";
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    role: user.role === "educator" ? "educator" : "player",
    avatar: user.avatar,
    bio: user.bio,
    interests: [...user.interests],
    hobbies: [...user.hobbies],
    createdAt: user.createdAt,
    teamId: user.teamId,
    lang: user.lang,
    progress: structuredClone(user.progress),
    metrics: { ...user.metrics },
    badges: [...user.badges],
    passwordHash,
    recoveryKeyHash: user.recoveryKeyHash || null,
    recoveryKeyFile: file,
  };
}

export function buildPlayerArchive(users: User[], now = new Date()): { archive: PlayerArchive; users: User[] } {
  const nextUsers = users.map((user) => ({ ...user, interests: [...user.interests], hobbies: [...user.hobbies], badges: [...user.badges], progress: { ...user.progress }, metrics: { ...user.metrics } }));
  const players = nextUsers.map((user) => {
    const universityAccount = user.id.toLowerCase().endsWith("@ionio.gr");
    if (user.recoveryKeyHash || universityAccount) return entryFromUser(user, null);
    const key = recoveryKey();
    const file: RecoveryKeyFileRecord = {
      format: "gamehack-recovery-key",
      version: 1,
      email: user.username,
      recoveryKey: key,
    };
    user.recoveryKeyHash = hashRecoveryKey(key);
    return entryFromUser(user, file);
  });
  return {
    users: nextUsers,
    archive: {
      format: PLAYER_ARCHIVE_FORMAT,
      version: PLAYER_ARCHIVE_VERSION,
      exportedAt: now.toISOString(),
      passwordStorage: "scrypt",
      recoveryKeyStorage: "sha256",
      players,
    },
  };
}

export function parsePlayerArchive(contents: string): PlayerArchive | null {
  try {
    const parsed: unknown = JSON.parse(contents);
    if (!isRecord(parsed) || parsed.format !== PLAYER_ARCHIVE_FORMAT || parsed.version !== PLAYER_ARCHIVE_VERSION) return null;
    if (!Array.isArray(parsed.players)) return null;
    const players: PlayerArchiveEntry[] = [];
    for (const item of parsed.players) {
      if (!isRecord(item)) return null;
      if (typeof item.id !== "string" || typeof item.username !== "string" || typeof item.displayName !== "string") return null;
      if (!isRecord(item.metrics) || typeof item.metrics.xp !== "number") return null;
      const passwordHash = typeof item.passwordHash === "string"
        ? item.passwordHash
        : typeof item.password === "string"
          ? item.password
          : "";
      const file = recoveryFile(item.recoveryKeyFile);
      players.push({
        id: item.id,
        username: item.username,
        displayName: item.displayName,
        role: item.role === "educator" ? "educator" : "player",
        avatar: typeof item.avatar === "string" ? item.avatar : "",
        bio: typeof item.bio === "string" ? item.bio : "",
        interests: stringList(item.interests),
        hobbies: stringList(item.hobbies),
        createdAt: typeof item.createdAt === "number" ? item.createdAt : Date.now(),
        teamId: typeof item.teamId === "string" ? item.teamId : undefined,
        lang: item.lang === "el" ? "el" : "en",
        progress: isRecord(item.progress) ? item.progress as Record<string, ModProgress> : {},
        metrics: item.metrics as Metrics,
        badges: stringList(item.badges),
        passwordHash: isScryptHash(passwordHash) ? passwordHash : passwordHash,
        recoveryKeyHash: typeof item.recoveryKeyHash === "string" ? item.recoveryKeyHash : null,
        recoveryKeyFile: file,
      });
    }
    return {
      format: PLAYER_ARCHIVE_FORMAT,
      version: PLAYER_ARCHIVE_VERSION,
      exportedAt: typeof parsed.exportedAt === "string" ? parsed.exportedAt : new Date().toISOString(),
      passwordStorage: "scrypt",
      recoveryKeyStorage: "sha256",
      players,
    };
  } catch {
    return null;
  }
}

export async function passwordHashForImport(entry: PlayerArchiveEntry): Promise<string> {
  if (isScryptHash(entry.passwordHash)) return entry.passwordHash;
  if (entry.passwordHash) return hashPassword(entry.passwordHash);
  return "";
}
