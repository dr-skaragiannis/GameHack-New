import { useEffect, useState } from "react";
import {
  accuracyScore,
  BADGES,
  fidelityScore,
  HOBBIES_POOL,
  INTERESTS_POOL,
  levelFromXp,
  updateUser,
  type User,
} from "../lib/db";
import { t, uppercaseLabel, type Lang } from "../i18n";
import Avatar from "./Avatar";
import AvatarPicker from "./AvatarPicker";
import Icon from "./Icon";
import { cn } from "../utils/cn";
import { useAuth } from "../lib/useAuth";
import { downloadRecoveryKeyFile } from "../lib/recoveryKeyFile";

export default function ProfileView({
  user,
  viewer,
  lang,
  onChange,
  onChat,
  onBadge,
}: {
  user: User;
  viewer: User;
  lang: Lang;
  onChange: () => void;
  onChat?: (id: string) => void;
  onBadge?: (badgeId: string) => void;
}) {
  const mine = viewer.id === user.id;
  const { changePassword: requestPasswordChange, rotateRecoveryKey } = useAuth();
  const lv = levelFromXp(user.metrics.xp);
  const [nickname, setNickname] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio);
  const [picker, setPicker] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordNotice, setPasswordNotice] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [recoveryError, setRecoveryError] = useState("");
  const [recoveryNotice, setRecoveryNotice] = useState("");
  const [recoveryBusy, setRecoveryBusy] = useState(false);
  const canManageAuth = mine && user.role === "player" && user.id.toLowerCase().endsWith("@ionio.gr");

  useEffect(() => {
    setNickname(user.displayName);
    setBio(user.bio);
  }, [user.id, user.displayName, user.bio]);

  const saveProfile = () => {
    const nextNickname = nickname.trim();
    if (!nextNickname || nextNickname.length > 32) return;
    updateUser(user.id, { displayName: nextNickname, bio: bio.trim() });
    onChange();
  };

  const interests = user.interests ?? [];
  const hobbies = user.hobbies ?? [];
  const [interestInput, setInterestInput] = useState("");
  const [hobbyInput, setHobbyInput] = useState("");

  const toggleInterest = (i: string) => {
    const next = interests.includes(i) ? interests.filter((x) => x !== i) : [...interests, i];
    updateUser(user.id, { interests: next });
    onChange();
  };

  const toggleHobby = (h: string) => {
    const next = hobbies.includes(h) ? hobbies.filter((x) => x !== h) : [...hobbies, h];
    updateUser(user.id, { hobbies: next });
    onChange();
  };

  const addCustomInterest = () => {
    const value = interestInput.trim();
    if (!value || interests.some((x) => x.toLowerCase() === value.toLowerCase())) return;
    updateUser(user.id, { interests: [...interests, value] });
    setInterestInput("");
    onChange();
  };

  const addCustomHobby = () => {
    const value = hobbyInput.trim();
    if (!value || hobbies.some((x) => x.toLowerCase() === value.toLowerCase())) return;
    updateUser(user.id, { hobbies: [...hobbies, value] });
    setHobbyInput("");
    onChange();
  };

  const submitPasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordNotice("");
    if (newPassword !== confirmPassword) {
      setPasswordError(t("passwordsDoNotMatch", lang));
      return;
    }
    setPasswordBusy(true);
    try {
      const result = await requestPasswordChange(currentPassword, newPassword);
      if (!result.ok) {
        setPasswordError(t(result.error || "authServerUnavailable", lang));
        return;
      }
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPasswordNotice(t(result.message || "passwordChanged", lang));
    } catch {
      setPasswordError(t("authServerUnavailable", lang));
    } finally {
      setPasswordBusy(false);
    }
  };

  const downloadNewRecoveryKey = async () => {
    setRecoveryError("");
    setRecoveryNotice("");
    setRecoveryBusy(true);
    try {
      const result = await rotateRecoveryKey();
      if (!result.ok || !result.recoveryKey) {
        setRecoveryError(t(result.error || "authServerUnavailable", lang));
        return;
      }
      downloadRecoveryKeyFile(user.id, result.recoveryKey);
      setRecoveryNotice(t(result.message || "recoveryKeyRotated", lang));
    } catch {
      setRecoveryError(t("authServerUnavailable", lang));
    } finally {
      setRecoveryBusy(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="glass rounded-2xl border border-gamehack-border p-6 flex flex-wrap gap-5 items-start">
        <button
          type="button"
          disabled={!mine}
          onClick={() => mine && setPicker(true)}
          title={mine ? t("chooseAvatar", lang) : undefined}
          aria-label={mine ? t("chooseAvatar", lang) : user.displayName}
          className="relative rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 disabled:cursor-default"
        >
          <Avatar src={user.avatar} name={user.displayName} size={88} />
          {mine && (
            <span className="absolute bottom-0 right-0 grid h-7 w-7 place-items-center rounded-full border border-gamehack-border bg-gamehack-panel text-cyan-400">
              <Icon name="settings" className="h-4 w-4" />
            </span>
          )}
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold">{user.displayName}</h1>
          <div className="text-iron-400 text-sm">
            {user.username.includes("@") ? null : `@${user.username}, `}
            {t(user.role, lang)}, {t("level", lang)} {lv.level}
          </div>
          <div className="flex gap-4 mt-3 text-sm">
            <span className="text-cyan-400 font-semibold">{user.metrics.xp} XP</span>
            <span>
              {t("fidelity", lang)} {fidelityScore(user.metrics)}%
            </span>
            <span>
              {t("accuracy", lang)} {accuracyScore(user.metrics)}%
            </span>
            <span>
              {t("streak", lang)} {user.metrics.streakDays}d
            </span>
          </div>
          {!mine && onChat && (
            <button
              type="button"
              onClick={() => onChat(user.id)}
              className="mt-3 rounded-lg bg-cyan-600 px-3 py-1.5 text-sm font-semibold"
            >
              {t("chat", lang)}
            </button>
          )}
        </div>
      </div>

      <div className="glass rounded-2xl border border-gamehack-border p-5">
        {mine ? (
          <div className="space-y-4">
            <label className="block space-y-2">
              <span className="text-sm uppercase tracking-widest text-iron-400">{uppercaseLabel(t("nickname", lang), lang)}</span>
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={32}
                required
                className="w-full rounded-xl bg-gamehack-bg border border-gamehack-border px-3 py-2.5 text-sm outline-none focus:border-cyan-500"
              />
            </label>
            <label className="block space-y-2">
              <span className="text-sm uppercase tracking-widest text-iron-400">{uppercaseLabel(t("bio", lang), lang)}</span>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={4}
                maxLength={500}
                className="w-full rounded-xl bg-gamehack-bg border border-gamehack-border p-3 text-sm outline-none focus:border-cyan-500"
              />
            </label>
            <button
              type="button"
              onClick={saveProfile}
              disabled={!nickname.trim() || nickname.trim().length > 32}
              className="rounded-lg bg-gamehack-panel2 border border-gamehack-border px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("saveProfile", lang)}
            </button>
          </div>
        ) : (
          <>
            <div className="text-sm uppercase tracking-widest text-iron-400 mb-2">{uppercaseLabel(t("bio", lang), lang)}</div>
            <p className="text-sm text-zinc-300">{user.bio || "—"}</p>
          </>
        )}
      </div>

      {canManageAuth && (
        <section className="glass rounded-2xl border border-gamehack-border p-5 space-y-6" aria-labelledby="account-security-title">
          <h2 id="account-security-title" className="text-lg font-semibold text-zinc-100">{t("accountSecurity", lang)}</h2>
          <form onSubmit={submitPasswordChange} className="space-y-3">
            <h3 className="text-sm font-semibold text-zinc-200">{t("passwordChangeTitle", lang)}</h3>
            <input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              placeholder={t("currentPassword", lang)}
              autoComplete="current-password"
              className="w-full rounded-xl bg-gamehack-bg border border-gamehack-border px-3 py-2.5 text-sm outline-none focus:border-cyan-500"
            />
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder={t("newPassword", lang)}
              autoComplete="new-password"
              minLength={8}
              required
              className="w-full rounded-xl bg-gamehack-bg border border-gamehack-border px-3 py-2.5 text-sm outline-none focus:border-cyan-500"
            />
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
            <p className="text-sm leading-relaxed text-iron-400">{t("recoveryKeyPasswordNote", lang)}</p>
            {passwordError && <p role="alert" className="text-sm text-rose-300">{passwordError}</p>}
            {passwordNotice && <p role="status" className="text-sm text-neon-green">{passwordNotice}</p>}
            <button
              type="submit"
              disabled={passwordBusy || !newPassword || !confirmPassword}
              className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500 disabled:cursor-wait disabled:opacity-60"
            >
              {passwordBusy ? t("working", lang) : t("passwordChangeTitle", lang)}
            </button>
          </form>

          <div className="space-y-3 border-t border-gamehack-border pt-5">
            <h3 className="text-sm font-semibold text-zinc-200">{t("recoveryKeyTitle", lang)}</h3>
            <p className="text-sm leading-relaxed text-iron-400">{t("recoveryKeyRotationNote", lang)}</p>
            {recoveryError && <p role="alert" className="text-sm text-rose-300">{recoveryError}</p>}
            {recoveryNotice && <p role="status" className="text-sm text-neon-green">{recoveryNotice}</p>}
            <button
              type="button"
              onClick={downloadNewRecoveryKey}
              disabled={recoveryBusy}
              className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-200 hover:bg-cyan-500/20 disabled:cursor-wait disabled:opacity-60"
            >
              {recoveryBusy ? t("working", lang) : t("downloadRecoveryKey", lang)}
            </button>
          </div>
        </section>
      )}

      <div className="glass rounded-2xl border border-gamehack-border p-5">
        <div className="text-sm uppercase tracking-widest text-iron-400 mb-3">{uppercaseLabel(t("interests", lang), lang)}</div>
        <div className="flex flex-wrap gap-2">
          {(mine ? [...INTERESTS_POOL, ...interests.filter((i) => !INTERESTS_POOL.includes(i))] : interests).map((i) => {
            const on = interests.includes(i);
            const custom = !INTERESTS_POOL.includes(i);
            return (
              <button
                key={i}
                type="button"
                disabled={!mine}
                onClick={() => mine && toggleInterest(i)}
                title={mine && custom && on ? t("remove", lang) : undefined}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm inline-flex items-center gap-1.5",
                  on ? "border-cyan-500 bg-cyan-500/15 text-cyan-300" : "border-gamehack-border text-iron-400"
                )}
              >
                {i}
                {mine && custom && on && <Icon name="close" className="h-3.5 w-3.5" />}
              </button>
            );
          })}
        </div>
        {mine && (
          <div className="mt-3 flex gap-2">
            <input
              value={interestInput}
              onChange={(e) => setInterestInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addCustomInterest();
              }}
              placeholder={t("customInterestPlaceholder", lang)}
              maxLength={32}
              className="flex-1 min-w-0 rounded-xl bg-gamehack-bg border border-gamehack-border px-3 py-2 text-sm outline-none focus:border-cyan-500"
            />
            <button
              type="button"
              onClick={addCustomInterest}
              disabled={!interestInput.trim()}
              className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("add", lang)}
            </button>
          </div>
        )}
      </div>

      <div className="glass rounded-2xl border border-gamehack-border p-5">
        <div className="text-sm uppercase tracking-widest text-iron-400 mb-3">{uppercaseLabel(t("hobbies", lang), lang)}</div>
        <div className="flex flex-wrap gap-2">
          {(mine ? [...HOBBIES_POOL, ...hobbies.filter((h) => !HOBBIES_POOL.includes(h))] : hobbies).map((h) => {
            const on = hobbies.includes(h);
            const custom = !HOBBIES_POOL.includes(h);
            return (
              <button
                key={h}
                type="button"
                disabled={!mine}
                onClick={() => mine && toggleHobby(h)}
                title={mine && custom && on ? t("remove", lang) : undefined}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm inline-flex items-center gap-1.5",
                  on ? "border-cyan-500 bg-cyan-500/15 text-cyan-300" : "border-gamehack-border text-iron-400"
                )}
              >
                {h}
                {mine && custom && on && <Icon name="close" className="h-3.5 w-3.5" />}
              </button>
            );
          })}
        </div>
        {mine && (
          <div className="mt-3 flex gap-2">
            <input
              value={hobbyInput}
              onChange={(e) => setHobbyInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addCustomHobby();
              }}
              placeholder={t("customHobbyPlaceholder", lang)}
              maxLength={32}
              className="flex-1 min-w-0 rounded-xl bg-gamehack-bg border border-gamehack-border px-3 py-2 text-sm outline-none focus:border-cyan-500"
            />
            <button
              type="button"
              onClick={addCustomHobby}
              disabled={!hobbyInput.trim()}
              className="rounded-xl bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("add", lang)}
            </button>
          </div>
        )}
      </div>

      <div className="glass rounded-2xl border border-gamehack-border p-5">
        <div className="text-sm uppercase tracking-widest text-iron-400 mb-3">{uppercaseLabel(t("badges", lang), lang)}</div>
        <div className="grid sm:grid-cols-2 gap-3">
          {user.badges.map((id) => {
            const b = BADGES[id];
            if (!b) return null;
            const inner = (
              <>
                <div className="h-10 w-10 shrink-0 rounded-lg bg-cyan-500/15 grid place-items-center text-cyan-400">
                  <Icon name={b.icon} className="w-5 h-5" />
                </div>
                <div className="min-w-0 text-left">
                  <div className="font-semibold text-sm">{b.name}</div>
                  <div className="text-sm text-iron-400">{b.desc}</div>
                </div>
                {onBadge && <Icon name="chevron" className="ml-auto h-4 w-4 shrink-0 self-center text-iron-500" />}
              </>
            );
            return onBadge ? (
              <button
                key={id}
                type="button"
                onClick={() => onBadge(id)}
                title={`${b.name} — ${b.desc}`}
                aria-label={`${b.name}. ${b.desc}`}
                className="flex items-center gap-3 rounded-xl border border-gamehack-border p-3 transition hover:border-cyan-500/50 hover:bg-cyan-500/5"
              >
                {inner}
              </button>
            ) : (
              <div key={id} className="flex items-center gap-3 rounded-xl border border-gamehack-border p-3">
                {inner}
              </div>
            );
          })}
        </div>
      </div>

      {picker && (
        <AvatarPicker
          lang={lang}
          value={user.avatar}
          onChange={(v) => {
            updateUser(user.id, { avatar: v });
            onChange();
          }}
          onClose={() => setPicker(false)}
        />
      )}
    </div>
  );
}
