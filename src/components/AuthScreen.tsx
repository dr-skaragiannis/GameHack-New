import { useState } from "react";
import { useAuth } from "../lib/useAuth";
import { t, type Lang } from "../i18n";
import { sound } from "../lib/sound";
import Icon from "./Icon";
import { cn } from "../utils/cn";
import type { Role } from "../lib/db";

export default function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [lang, setLang] = useState<Lang>("en");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<Role>("player");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    sound.unlock();
    sound.enter();
    const res =
      mode === "in" ? login(username, password) : register(username, password, role, displayName || username);
    if (!res.ok) {
      setError(res.error || "Error");
      sound.error();
    }
  };

  return (
    <div className="forge-grid min-h-full flex items-center justify-center p-4 relative">
      <button
        type="button"
        onClick={() => setLang(lang === "en" ? "el" : "en")}
        className="absolute top-4 right-4 z-10 text-sm font-bold tracking-widest text-iron-400 hover:text-ember-400 border border-forge-border rounded-lg px-3 py-1.5"
      >
        {t("langLabel", lang)}
      </button>

      <div className="relative z-10 w-full max-w-md enter">
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-ember-500 to-ember-700 forge-glow mb-4 float">
            <Icon name="hammer" className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-[0.2em] text-shine">{t("appName", lang)}</h1>
          <p className="mt-2 text-iron-400 text-sm">{t("tagline", lang)}</p>
          <p className="mt-3 text-zinc-400 text-sm leading-relaxed">{t("heroLine", lang)}</p>
        </div>

        <div className="glass rounded-2xl border border-forge-border p-6">
          <div className="flex rounded-xl bg-forge-bg p-1 mb-5">
            {(["in", "up"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError("");
                }}
                className={cn(
                  "flex-1 py-2 rounded-lg text-sm font-semibold transition",
                  mode === m ? "bg-ember-600 text-white" : "text-iron-400 hover:text-zinc-200"
                )}
              >
                {m === "in" ? t("signIn", lang) : t("createAccount", lang)}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "up" && (
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={t("displayName", lang)}
                className="w-full rounded-xl bg-forge-bg border border-forge-border px-3 py-2.5 text-sm outline-none focus:border-ember-500"
              />
            )}
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t("username", lang)}
              autoComplete="username"
              className="w-full rounded-xl bg-forge-bg border border-forge-border px-3 py-2.5 text-sm outline-none focus:border-ember-500"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t("password", lang)}
              autoComplete={mode === "in" ? "current-password" : "new-password"}
              className="w-full rounded-xl bg-forge-bg border border-forge-border px-3 py-2.5 text-sm outline-none focus:border-ember-500"
            />
            {mode === "up" && (
              <div className="grid grid-cols-2 gap-2">
                {(["player", "educator"] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    className={cn(
                      "rounded-xl border py-2 text-sm font-semibold",
                      role === r
                        ? "border-ember-500 bg-ember-500/15 text-ember-300"
                        : "border-forge-border text-iron-400"
                    )}
                  >
                    {r === "player" ? t("iAmPlayer", lang) : t("iAmEducator", lang)}
                  </button>
                ))}
              </div>
            )}
            {error && <div className="text-rose-400 text-sm">{error}</div>}
            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-ember-600 to-ember-500 py-2.5 font-bold text-white shimmer-hover"
            >
              {mode === "in" ? t("start", lang) : t("createAccount", lang)}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-forge-line text-sm text-iron-500 space-y-1">
            <div className="uppercase tracking-widest text-iron-400 mb-1">{t("demoHint", lang)}</div>
            <div>
              player — <span className="text-zinc-400 font-mono">nova / demo</span>
            </div>
            <div>
              educator — <span className="text-zinc-400 font-mono">educator / teach123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
