import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from "react";
import * as db from "./db";
import type { User } from "./db";
import { flushPlatformWrites } from "./platformSync";

type AuthResult = {
  ok: boolean;
  error?: string;
  message?: string;
  account?: RemoteAccount;
  recoveryKey?: string;
};
type RemoteAccount = { email: string; nickname: string; role: "player" };
type AuthCtx = {
  user: User | null;
  version: number;
  authReady: boolean;
  refresh: () => void;
  login: (identity: string, password: string) => Promise<AuthResult>;
  loginWithRecoveryKey: (email: string, recoveryKey: string) => Promise<AuthResult>;
  register: (email: string, password: string, nickname: string) => Promise<AuthResult>;
  activate: (token: string) => Promise<AuthResult>;
  requestPasswordReset: (email: string) => Promise<AuthResult>;
  resetPassword: (token: string, password: string) => Promise<AuthResult>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<AuthResult>;
  rotateRecoveryKey: () => Promise<AuthResult>;
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

async function postAuth(path: string, payload: Record<string, string>): Promise<AuthResult> {
  try {
    const response = await fetch(path, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const result = await response.json().catch(() => ({}));
    return response.ok
      ? { ok: true, ...result }
      : { ok: false, error: result.error || "authServerUnavailable" };
  } catch {
    return { ok: false, error: "authServerUnavailable" };
  }
}

async function getRemoteSession(): Promise<RemoteAccount | null> {
  try {
    const response = await fetch("/api/auth/me", { credentials: "same-origin", cache: "no-store" });
    if (!response.ok) return null;
    const result = await response.json();
    return result.account || null;
  } catch {
    return null;
  }
}

function hasUniversityId(user: User | null): user is User {
  return !!user?.id.toLowerCase().endsWith("@ionio.gr");
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [initialSession] = useState(() => {
    const cached = db.currentUser();
    const url = new URL(window.location.href);
    const authLink = url.searchParams.has("activate") || url.searchParams.has("reset");
    return {
      cached,
      authLink,
      serverAccountId: hasUniversityId(cached) ? cached.id : null,
      shouldRestoreServerSession: !authLink && (!cached || hasUniversityId(cached)),
    };
  });
  const [user, setUser] = useState<User | null>(
    initialSession.authLink || initialSession.serverAccountId
      ? null
      : initialSession.cached
        ? { ...initialSession.cached }
        : null
  );
  const [authReady, setAuthReady] = useState(initialSession.authLink || !initialSession.shouldRestoreServerSession);
  const [version, setVersion] = useState(0);

  const snapshot = () => {
    const current = db.currentUser();
    return current ? { ...current } : null;
  };

  const refresh = useCallback(() => {
    setUser(snapshot());
    setVersion((value) => value + 1);
  }, []);

  useEffect(() => {
    if (!initialSession.shouldRestoreServerSession) return;
    let cancelled = false;
    getRemoteSession()
      .then(async (account) => {
        if (cancelled) return;
        if (account) {
          db.establishAuthenticatedUser(account.email, account.nickname, account.role);
          // Pull the shared document before the first render reads it, so the
          // cohort's progress and tickets are there rather than a stale copy.
          await db.hydrateFromServer().catch(() => false);
          if (!cancelled) setUser(snapshot());
        } else if (initialSession.serverAccountId) {
          db.logout();
          setUser(null);
        }
      })
      .finally(() => {
        if (!cancelled) setAuthReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [initialSession]);

  /**
   * Every sign-in goes to the server, which holds the platform state. A bare
   * username is a university address without the domain, so it is completed
   * rather than treated as a separate local identity - that split is what used
   * to leave progress stranded in one browser's localStorage.
   */
  const serverSignIn = useCallback(async (identity: string, password: string): Promise<AuthResult> => {
    const email = identity.includes("@") ? identity.trim() : `${identity.trim().toLowerCase()}@ionio.gr`;
    const result = await postAuth("/api/auth/login", { email, password });
    if (result.ok && result.account) {
      try {
        db.establishAuthenticatedUser(result.account.email, result.account.nickname, result.account.role);
        await db.hydrateFromServer();
        setUser(snapshot());
        setVersion((value) => value + 1);
        return { ok: true };
      } catch {
        return { ok: false, error: "authServerUnavailable" };
      }
    }
    return { ok: false, error: result.error || "invalidCredentials" };
  }, []);

  const doLogin = useCallback(async (identity: string, password: string): Promise<AuthResult> => {
    const viaServer = await serverSignIn(identity, password);
    if (viaServer.ok || viaServer.error !== "authServerUnavailable") return viaServer;
    // The server is unreachable, not the credentials wrong. Fall back to the
    // browser copy so a classroom without a network is not locked out, and let
    // the sync-state badge say the work is local only.
    const result = db.login(identity.trim(), password);
    if (result.ok) {
      setUser(snapshot());
      setVersion((value) => value + 1);
    }
    return { ok: result.ok, error: result.error };
  }, [serverSignIn]);

  const doLoginWithRecoveryKey = useCallback(async (email: string, recoveryKey: string): Promise<AuthResult> => {
    const result = await postAuth("/api/auth/login-with-key", { email, recoveryKey });
    if (!result.ok || !result.account) return { ok: false, error: result.error || "invalidRecoveryKey" };
    try {
      db.establishAuthenticatedUser(result.account.email, result.account.nickname);
      setUser(snapshot());
      setVersion((value) => value + 1);
      return { ok: true };
    } catch {
      return { ok: false, error: "authServerUnavailable" };
    }
  }, []);

  const doRegister = useCallback((email: string, password: string, nickname: string) =>
    postAuth("/api/auth/register", { email, password, nickname }), []);

  const activate = useCallback((token: string) => postAuth("/api/auth/activate", { token }), []);
  const requestPasswordReset = useCallback((email: string) =>
    postAuth("/api/auth/forgot-password", { email }), []);
  const resetPassword = useCallback((token: string, password: string) =>
    postAuth("/api/auth/reset-password", { token, password }), []);
  const changePassword = useCallback((currentPassword: string, newPassword: string) =>
    postAuth("/api/auth/change-password", { currentPassword, newPassword }), []);
  const rotateRecoveryKey = useCallback(() =>
    postAuth("/api/auth/recovery-key/rotate", {}), []);

  const doLogout = useCallback(() => {
    void flushPlatformWrites().catch(() => undefined);
    void fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }).catch(() => {});
    db.logout();
    setUser(null);
    setVersion((value) => value + 1);
  }, []);

  return (
    <Ctx.Provider
      value={{
        user,
        version,
        authReady,
        refresh,
        login: doLogin,
        loginWithRecoveryKey: doLoginWithRecoveryKey,
        register: doRegister,
        activate,
        requestPasswordReset,
        resetPassword,
        changePassword,
        rotateRecoveryKey,
        logout: doLogout,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const context = useContext(Ctx);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
