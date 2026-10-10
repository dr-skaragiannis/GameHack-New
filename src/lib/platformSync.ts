/**
 * The bridge between the browser and the server-held platform document.
 *
 * Player progress, profiles, badges, tickets, messages, teams and the authored
 * course overlay used to live only in localStorage, so they were per-browser
 * and invisible to everybody else. They now live on the server; this module is
 * the only place that talks to it.
 *
 * It deliberately does not import db.ts - db.ts imports this - and it knows
 * nothing about the shape of a user beyond the fields it has to route.
 */

export type PlatformDocument = {
  revision: number;
  users: Record<string, unknown>[];
  feed: Record<string, unknown>[];
  tickets: Record<string, unknown>[];
  messages: Record<string, unknown>[];
  chats: Record<string, unknown>[];
  teams: Record<string, unknown>[];
  teamApplications: Record<string, unknown>[];
  commandLog: Record<string, unknown>[];
  contentOverlay: Record<string, unknown>;
};

export type SyncState = "idle" | "online" | "offline";

let lastState: SyncState = "idle";

/**
 * Whether the most recent round trip reached the server. The app shows this so
 * a player working against a dead backend is told their work is local only,
 * rather than silently believing it was saved.
 */
export function platformSyncState(): SyncState {
  return lastState;
}

async function request(method: string, path: string, body?: unknown): Promise<{ ok: boolean; status: number; data: Record<string, unknown> }> {
  try {
    const response = await fetch(path, {
      method,
      credentials: "same-origin",
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const data = (await response.json().catch(() => ({}))) as Record<string, unknown>;
    lastState = "online";
    return { ok: response.ok, status: response.status, data };
  } catch {
    lastState = "offline";
    return { ok: false, status: 0, data: {} };
  }
}

/** The whole shared document, or null when the server cannot be reached. */
export async function fetchPlatform(): Promise<PlatformDocument | null> {
  const result = await request("GET", "/api/platform");
  if (!result.ok) return null;
  const platform = result.data.platform as PlatformDocument | undefined;
  if (!platform || !Array.isArray(platform.users)) return null;
  return platform;
}

export type OwnPush = {
  user: Record<string, unknown>;
  feed?: Record<string, unknown>[];
  commandLog?: Record<string, unknown>[];
};

/** Save the signed-in player's own record. The server rejects anybody else's. */
export async function pushOwnUser(payload: OwnPush): Promise<{ ok: boolean; status: number; revision?: number }> {
  const result = await request("PUT", "/api/platform/self", payload);
  return { ok: result.ok, status: result.status, revision: result.data.revision as number | undefined };
}

/** Save the shared collections. The server allows this for educators only. */
export async function pushSharedCollections(payload: Record<string, unknown>): Promise<{ ok: boolean; status: number }> {
  const result = await request("PUT", "/api/platform/shared", payload);
  return { ok: result.ok, status: result.status };
}

/**
 * Debounced write-through. Every mutation in the app calls saveDB(), which is
 * far too often to hit the network for, so pushes collapse into one round trip.
 */
let ownTimer: ReturnType<typeof setTimeout> | null = null;
let pendingOwn: OwnPush | null = null;
let sharedTimer: ReturnType<typeof setTimeout> | null = null;
let pendingShared: Record<string, unknown> | null = null;
let inflightOwn: Promise<unknown> = Promise.resolve();

export function queueOwnPush(payload: OwnPush, delayMs = 400): void {
  // Later calls win for the record itself; activity lists accumulate so nothing
  // typed in the debounce window is dropped.
  pendingOwn = {
    user: payload.user,
    feed: [...(pendingOwn?.feed || []), ...(payload.feed || [])],
    commandLog: [...(pendingOwn?.commandLog || []), ...(payload.commandLog || [])],
  };
  if (ownTimer) clearTimeout(ownTimer);
  ownTimer = setTimeout(() => {
    ownTimer = null;
    const batch = pendingOwn;
    pendingOwn = null;
    if (!batch) return;
    inflightOwn = inflightOwn.then(() => pushOwnUser(batch)).catch(() => undefined);
  }, delayMs);
}

export function queueSharedPush(payload: Record<string, unknown>, delayMs = 600): void {
  pendingShared = { ...(pendingShared || {}), ...payload };
  if (sharedTimer) clearTimeout(sharedTimer);
  sharedTimer = setTimeout(() => {
    sharedTimer = null;
    const batch = pendingShared;
    pendingShared = null;
    if (!batch) return;
    void pushSharedCollections(batch).catch(() => undefined);
  }, delayMs);
}

/** Force anything waiting to go now - used on logout and before unload. */
export async function flushPlatformWrites(): Promise<void> {
  if (ownTimer) {
    clearTimeout(ownTimer);
    ownTimer = null;
  }
  if (sharedTimer) {
    clearTimeout(sharedTimer);
    sharedTimer = null;
  }
  const own = pendingOwn;
  pendingOwn = null;
  const shared = pendingShared;
  pendingShared = null;
  if (shared) await pushSharedCollections(shared).catch(() => undefined);
  if (own) await pushOwnUser(own).catch(() => undefined);
  await inflightOwn.catch(() => undefined);
}
