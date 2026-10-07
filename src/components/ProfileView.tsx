import { useEffect, useState } from "react";
import {
  accuracyScore,
  BADGES,
  fidelityScore,
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

export default function ProfileView({
  user,
  viewer,
  lang,
  onChange,
  onChat,
}: {
  user: User;
  viewer: User;
  lang: Lang;
  onChange: () => void;
  onChat?: (id: string) => void;
}) {
  const mine = viewer.id === user.id;
  const lv = levelFromXp(user.metrics.xp);
  const [nickname, setNickname] = useState(user.displayName);
  const [bio, setBio] = useState(user.bio);
  const [picker, setPicker] = useState(false);

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

  const toggleInterest = (i: string) => {
    const next = user.interests.includes(i) ? user.interests.filter((x) => x !== i) : [...user.interests, i];
    updateUser(user.id, { interests: next });
    onChange();
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
            {user.username.includes("@") ? null : `@${user.username} · `}
            {t(user.role, lang)} · {t("level", lang)} {lv.level}
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

      <div className="glass rounded-2xl border border-gamehack-border p-5">
        <div className="text-sm uppercase tracking-widest text-iron-400 mb-3">{uppercaseLabel(t("interests", lang), lang)}</div>
        <div className="flex flex-wrap gap-2">
          {(mine ? INTERESTS_POOL : user.interests).map((i) => {
            const on = user.interests.includes(i);
            return (
              <button
                key={i}
                type="button"
                disabled={!mine}
                onClick={() => mine && toggleInterest(i)}
                className={cn(
                  "rounded-full border px-3 py-1 text-sm",
                  on ? "border-cyan-500 bg-cyan-500/15 text-cyan-300" : "border-gamehack-border text-iron-400"
                )}
              >
                {i}
              </button>
            );
          })}
        </div>
      </div>

      <div className="glass rounded-2xl border border-gamehack-border p-5">
        <div className="text-sm uppercase tracking-widest text-iron-400 mb-3">{uppercaseLabel(t("badges", lang), lang)}</div>
        <div className="grid sm:grid-cols-2 gap-3">
          {user.badges.map((id) => {
            const b = BADGES[id];
            if (!b) return null;
            return (
              <div key={id} className="flex gap-3 rounded-xl border border-gamehack-border p-3">
                <div className="h-10 w-10 rounded-lg bg-cyan-500/15 grid place-items-center text-cyan-400">
                  <Icon name={b.icon} className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">{b.name}</div>
                  <div className="text-sm text-iron-400">{b.desc}</div>
                </div>
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
