import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import * as db from "./db";
import type { User } from "./db";

type AuthCtx = {
  user: User | null;
  version: number; // bump to force consumers to re-read derived data
  refresh: () => void;
  login: (u: string, p: string) => { ok: boolean; error?: string };
  register: (u: string, p: string, role: db.Role, dn: string) => { ok: boolean; error?: string };
  logout: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const u = db.currentUser();
    return u ? { ...u } : null;
  });
  const [version, setVersion] = useState(0);

  // Always hand components a fresh snapshot so React reliably re-renders with the
  // latest persisted state (db mutates its cached object in place).
  const snapshot = () => {
    const u = db.currentUser();
    return u ? { ...u } : null;
  };

  const refresh = useCallback(() => {
    setUser(snapshot());
    setVersion((v) => v + 1);
  }, []);

  const doLogin = useCallback((u: string, p: string) => {
    const res = db.login(u, p);
    if (res.ok) {
      setUser(snapshot());
      setVersion((v) => v + 1);
    }
    return { ok: res.ok, error: res.error };
  }, []);

  const doRegister = useCallback((u: string, p: string, role: db.Role, dn: string) => {
    const res = db.register(u, p, role, dn);
    if (res.ok) {
      setUser(snapshot());
      setVersion((v) => v + 1);
    }
    return { ok: res.ok, error: res.error };
  }, []);

  const doLogout = useCallback(() => {
    db.logout();
    setUser(null);
    setVersion((v) => v + 1);
  }, []);

  return (
    <Ctx.Provider value={{ user, version, refresh, login: doLogin, register: doRegister, logout: doLogout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
