import { useEffect, useState } from "react";
import { useAuth } from "../lib/useAuth";
import { t, uppercaseLabel, type Lang } from "../i18n";
import { sound } from "../lib/sound";
import { downloadRecoveryKeyFile, parseRecoveryKeyFile, type RecoveryKeyCredential } from "../lib/recoveryKeyFile";
import Icon from "./Icon";
import { cn } from "../utils/cn";

type AuthMode = "in" | "up" | "forgot" | "reset" | "key" | "registered";

function clearAuthQuery() {
  const url = new URL(window.location.href);
  url.searchParams.delete("activate");
  url.searchParams.delete("reset");
  window.history.replaceState(null, "", `${url.pathname}${url.search}${url.hash}`);
}

export default function AuthScreen({
  initialMode = "in",
  initialLang = "en",
  onBack,
}: {
  initialMode?: "in" | "up";
  initialLang?: Lang;
  onBack?: () => void;
}) {
  const { login, loginWithRecoveryKey, register, activate, requestPasswordReset, resetPassword } = useAuth();
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [lang, setLang] = useState<Lang>(initialLang);
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [registrationRecoveryKey, setRegistrationRecoveryKey] = useState("");
  const [recoveryKeyCredential, setRecoveryKeyCredential] = useState<RecoveryKeyCredential | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const url = new URL(window.location.href);
    const activationToken = url.searchParams.get("activate");
    const passwordToken = url.searchParams.get("reset");
    if (activationToken) {
      clearAuthQuery();
      setBusy(true);
      void activate(activationToken)
        .then((result) => {
          if (result.ok) {
            setMode("in");
            setNotice(t("accountActivated", lang));
          } else {
            setError(t(result.error || "activationLinkExpired", lang));
          }
        })
        .finally(() => setBusy(false));
    } else if (passwordToken) {
      setMode("reset");
      setResetToken(passwordToken);
    }
  }, [activate, lang]);

  const readRecoveryKeyFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    setRecoveryKeyCredential(null);
    setError("");
    if (!file) return;
    if (file.size > 16_384) {
      setError(t("invalidRecoveryKeyFile", lang));
      return;
    }
    try {
      const credential = parseRecoveryKeyFile(await file.text());
      if (!credential) {
        setError(t("invalidRecoveryKeyFile", lang));
        return;
      }
      setRecoveryKeyCredential(credential);
      setIdentity(credential.email);
    } catch {
      setError(t("invalidRecoveryKeyFile", lang));
    }
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    sound.unlock();
    sound.enter();
    setError("");
    setNotice("");
    setBusy(true);

    try {
      if (mode === "in") {
        const result = await login(identity, password);
        if (!result.ok) setError(t(result.error || "invalidCredentials", lang));
        return;
      }

      if (mode === "up") {
        const result = await register(identity, password, nickname);
        if (!result.ok || !result.recoveryKey) {
          setError(t(result.error || "authServerUnavailable", lang));
          return;
        }
        setIdentity(result.account?.email || identity.trim().toLowerCase());
        setPassword("");
        setRegistrationRecoveryKey(result.recoveryKey);
        setMode("registered");
        return;
      }

      if (mode === "key") {
        if (!recoveryKeyCredential) {
          setError(t("selectRecoveryKeyFile", lang));
          return;
        }
        const result = await loginWithRecoveryKey(recoveryKeyCredential.email, recoveryKeyCredential.recoveryKey);
        if (!result.ok) setError(t(result.error || "invalidRecoveryKey", lang));
        return;
      }

      if (mode === "registered") return;

      if (mode === "forgot") {
        if (!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@ionio\.gr$/i.test(identity.trim())) {
          setError(t("universityEmailOnly", lang));
          return;
        }
        const result = await requestPasswordReset(identity);
        if (!result.ok) {
          setError(t(result.error || "authServerUnavailable", lang));
          return;
        }
        setNotice(t(result.message || "resetEmailIfAccountExists", lang));
        return;
      }

      if (password !== confirmPassword) {
        setError(t("passwordsDoNotMatch", lang));
        return;
      }
      const result = await resetPassword(resetToken, password);
      if (!result.ok) {
        setError(t(result.error || "resetLinkExpired", lang));
        return;
      }
      clearAuthQuery();
      setMode("in");
      setPassword("");
      setConfirmPassword("");
      setResetToken("");
      setNotice(t("passwordReset", lang));
    } catch {
      setError(t("authServerUnavailable", lang));
    } finally {
      setBusy(false);
    }
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setError("");
    setNotice("");
    setRecoveryKeyCredential(null);
    setRegistrationRecoveryKey("");
  };

  const continueToSignIn = () => {
    setMode("in");
    setPassword("");
    setRegistrationRecoveryKey("");
    setError("");
    setNotice("");
  };

  return (
    <div className="gamehack-grid min-h-full flex items-center justify-center p-4 relative">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="absolute top-4 left-4 z-10 inline-flex items-center gap-2 text-sm font-semibold text-iron-400 hover:text-cyan-400 border border-gamehack-border rounded-lg px-3 py-1.5"
        >
          <Icon name="chevron" className="h-4 w-4 rotate-180" />
          {t("backToHome", lang)}
        </button>
      )}
      <button
        type="button"
        onClick={() => setLang(lang === "en" ? "el" : "en")}
        className="absolute top-4 right-4 z-10 text-sm font-bold tracking-widest text-iron-400 hover:text-cyan-400 border border-gamehack-border rounded-lg px-3 py-1.5"
      >
        {t("langLabel", lang)}
      </button>

      <div className="relative z-10 w-full max-w-md enter">
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-700 gamehack-glow mb-4 float">
            <Icon name="terminal" className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-[0.2em] text-shine">{t("appName", lang)}</h1>
          <p className="mt-2 text-iron-400 text-sm">{t("tagline", lang)}</p>
          <p className="mt-3 text-zinc-400 text-sm leading-relaxed">{t("heroLine", lang)}</p>
        </div>

        <div className="glass rounded-2xl border border-gamehack-border p-6">
          {mode === "in" || mode === "up" ? (
            <div className="flex rounded-xl bg-gamehack-bg p-1 mb-5">
              {(["in", "up"] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => switchMode(option)}
                  className={cn(
                    "flex-1 py-2 rounded-lg text-sm font-semibold transition",
                    mode === option ? "bg-cyan-600 text-white" : "text-iron-400 hover:text-zinc-200"
                  )}
                >
                  {option === "in" ? t("signIn", lang) : t("register", lang)}
                </button>
              ))}
            </div>
          ) : (
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-zinc-100">
                {t(
                  mode === "forgot" ? "forgotPasswordTitle"
                    : mode === "reset" ? "chooseNewPassword"
                      : mode === "key" ? "recoveryKeyLoginTitle" : "registrationCompleteTitle",
                  lang,
                )}
              </h2>
              <button
                type="button"
                onClick={mode === "registered" ? continueToSignIn : () => switchMode("in")}
                className="text-sm text-cyan-400 hover:text-cyan-300"
              >
                {t(mode === "registered" ? "continueToSignIn" : "backToSignIn", lang)}
              </button>
            </div>
          )}

          {mode === "up" && (
            <div className="mb-4 rounded-xl border border-cyan-500/25 bg-cyan-500/5 p-3 text-sm leading-relaxed text-zinc-300">
              <p>{t("registrationNotice", lang)}</p>
              <p className="mt-1 text-iron-400">{t("registrationCompleteProfile", lang)}</p>
            </div>
          )}

          {mode === "registered" ? (
            <div className="space-y-4">
              <p className="text-sm leading-relaxed text-zinc-300">{t("registrationComplete", lang)}</p>
              <div className="rounded-xl border border-amber-400/25 bg-amber-400/5 p-3 text-sm leading-relaxed text-amber-100/90">
                {t("recoveryKeySecurityNotice", lang)}
              </div>
              <button
                type="button"
                onClick={() => downloadRecoveryKeyFile(identity, registrationRecoveryKey)}
                className="w-full rounded-xl bg-cyan-600 py-2.5 font-semibold text-white hover:bg-cyan-500"
              >
                {t("downloadRecoveryKey", lang)}
              </button>
              <p className="text-xs leading-relaxed text-iron-400">{t("recoveryKeyProfileReminder", lang)}</p>
              <button
                type="button"
                onClick={continueToSignIn}
                className="w-full rounded-xl border border-gamehack-border py-2.5 font-semibold text-zinc-200 hover:border-cyan-500/50"
              >
                {t("continueToSignIn", lang)}
              </button>
            </div>
          ) : (
          <form onSubmit={submit} className="space-y-3">
            {mode === "up" && (
              <input
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                placeholder={t("nickname", lang)}
                autoComplete="nickname"
                maxLength={32}
                required
                className="w-full rounded-xl bg-gamehack-bg border border-gamehack-border px-3 py-2.5 text-sm outline-none focus:border-cyan-500"
              />
            )}

            {(mode === "in" || mode === "up" || mode === "forgot") && (
              <input
                type={mode === "in" ? "text" : "email"}
                value={identity}
                onChange={(event) => setIdentity(event.target.value)}
                placeholder={
                  mode === "in"
                    ? t("usernameOrEmail", lang)
                    : mode === "up"
                      ? t("universityEmail", lang)
                      : t("universityEmail", lang)
                }
                autoComplete={mode === "in" ? "username" : "email"}
                required
                className="w-full rounded-xl bg-gamehack-bg border border-gamehack-border px-3 py-2.5 text-sm outline-none focus:border-cyan-500"
              />
            )}

            {mode === "key" && (
              <label className="block space-y-2">
                <span className="text-sm text-iron-300">{t("recoveryKeyFileLabel", lang)}</span>
                <input
                  type="file"
                  accept=".json,.gamehack-key,application/json"
                  onChange={readRecoveryKeyFile}
                  required
                  className="block w-full rounded-xl bg-gamehack-bg border border-gamehack-border px-3 py-2.5 text-sm text-iron-300 file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-600 file:px-3 file:py-1.5 file:font-semibold file:text-white"
                />
                {recoveryKeyCredential && (
                  <span className="block text-xs text-neon-green">
                    {t("recoveryFileLoaded", lang)} {recoveryKeyCredential.email}
                  </span>
                )}
              </label>
            )}

            {(mode === "in" || mode === "up" || mode === "reset") && (
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={mode === "reset" ? t("newPassword", lang) : t("password", lang)}
                autoComplete={mode === "in" ? "current-password" : "new-password"}
                minLength={mode === "in" ? undefined : 8}
                required
                className="w-full rounded-xl bg-gamehack-bg border border-gamehack-border px-3 py-2.5 text-sm outline-none focus:border-cyan-500"
              />
            )}

            {mode === "up" && <p className="-mt-1 text-sm text-iron-400">{t("passwordMinLength", lang)}</p>}

            {mode === "reset" && (
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder={t("confirmNewPassword", lang)}
                autoComplete="new-password"
                minLength={8}
                required
                className="w-full rounded-xl bg-gamehack-bg border border-gamehack-border px-3 py-2.5 text-sm outline-none focus:border-cyan-500"
              />
            )}

            {error && <div role="alert" className="text-rose-400 text-sm">{error}</div>}
            {notice && <div role="status" className="rounded-lg border border-neon-green/20 bg-neon-green/5 p-3 text-sm text-neon-green">{notice}</div>}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 py-2.5 font-bold text-white shimmer-hover disabled:cursor-wait disabled:opacity-60"
            >
              {busy
                ? t("working", lang)
                : mode === "in"
                  ? t("start", lang)
                  : mode === "up"
                    ? t("register", lang)
                    : mode === "forgot"
                      ? t("sendResetLink", lang)
                      : mode === "key"
                        ? t("signInWithRecoveryFile", lang)
                        : t("resetPassword", lang)}
            </button>
          </form>
          )}

          {mode === "in" && (
            <div className="mt-3 flex flex-col items-end gap-2 text-sm">
              <button
                type="button"
                onClick={() => switchMode("key")}
                className="text-cyan-400 hover:text-cyan-300"
              >
                {t("useRecoveryKey", lang)}
              </button>
              <button
                type="button"
                onClick={() => switchMode("forgot")}
                className="text-iron-400 hover:text-cyan-300"
              >
                {t("forgotPassword", lang)}
              </button>
            </div>
          )}

          {mode === "in" && (
            <div className="mt-5 pt-4 border-t border-gamehack-line text-sm text-iron-500 space-y-1">
              <div className="uppercase tracking-widest text-iron-400 mb-1">{uppercaseLabel(t("demoHint", lang), lang)}</div>
              <div>
                player — <span className="text-zinc-400 font-mono">nova / demo</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
