import { useState } from "react";
import { useAuth } from "../lib/useAuth";
import type { Role } from "../lib/db";
import Icon from "./Icon";
import { cn } from "../utils/cn";

export default function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [role, setRole] = useState<Role>("player");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res =
      mode === "login" ? login(username, password) : register(username, password, role, displayName);
    if (!res.ok) setError(res.error || "Something went wrong");
  };

  return (
    <div className="forge-grid relative flex min-h-screen items-center justify-center overflow-hidden bg-forge-bg px-6 py-12">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-ember-600/20 blur-[120px] float" />
      <div className="relative z-10 w-full max-w-md">
        <div className="fadeup mb-8 text-center">
          <h1 className="text-glow font-mono text-6xl font-black tracking-tight text-ember-400">
            HACK<span className="text-zinc-100">FORGE</span>
          </h1>
          <p className="mt-2 font-mono text-xs uppercase tracking-[0.4em] text-iron-500">
            Interactive Ethical Hacking Lab
          </p>
        </div>

        <div className="scale-in rounded-3xl border border-forge-border glass p-5 forge-glow sm:p-7">
          {/* mode tabs */}
          <div className="mb-5 flex rounded-lg border border-forge-border bg-forge-bg p-1">
            {(["login", "register"] as const).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setMode(m);
                  setError("");
                }}
                className={cn(
                  "flex-1 rounded-md py-2 font-mono text-xs font-bold uppercase transition",
                  mode === m ? "bg-ember-600 text-white" : "text-iron-400 hover:text-zinc-200"
                )}
              >
                {m === "login" ? "Log in" : "Register"}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === "register" && (
              <div>
                <label className="mb-1 block font-mono text-[11px] uppercase tracking-wide text-iron-500">
                  I am a…
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(["player", "educator"] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={cn(
                        "flex items-center justify-center gap-2 rounded-lg border py-2.5 font-mono text-xs font-bold capitalize transition",
                        role === r
                          ? "border-ember-500 bg-ember-500/10 text-ember-400"
                          : "border-forge-border text-iron-400 hover:text-zinc-200"
                      )}
                    >
                      <Icon name={r === "player" ? "terminal" : "crown"} className="h-4 w-4" />
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mode === "register" && (
              <Field label="Display name" value={displayName} onChange={setDisplayName} placeholder="Nova Reyes" />
            )}
            <Field label="Username" value={username} onChange={setUsername} placeholder="nova" autoFocus />
            <Field
              label="Password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              type="password"
            />

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 font-mono text-xs text-red-300">
                <Icon name="ban" className="h-4 w-4 shrink-0" /> {error}
              </div>
            )}

            <button
              type="submit"
              className="forge-glow w-full rounded-xl bg-ember-600 py-3 font-mono text-sm font-bold text-white transition hover:bg-ember-500"
            >
              {mode === "login" ? "Enter the Lab →" : "Create account →"}
            </button>
          </form>

          <div className="mt-4 rounded-lg bg-forge-bg px-3 py-2 font-mono text-[11px] leading-relaxed text-iron-500">
            <span className="text-ember-400">Demo:</span> player <b className="text-zinc-300">nova / demo</b> ·
            educator <b className="text-zinc-300">educator / teach123</b>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoFocus,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  autoFocus?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block font-mono text-[11px] uppercase tracking-wide text-iron-500">{label}</label>
      <input
        type={type}
        value={value}
        autoFocus={autoFocus}
        spellCheck={false}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-forge-border bg-forge-bg px-3 py-2.5 font-mono text-sm text-zinc-100 outline-none transition focus:border-ember-500"
      />
    </div>
  );
}
