import { useState } from "react";
import {
  accuracyScore,
  BADGES,
  fidelityScore,
  INTERESTS_POOL,
  levelFromXp,
  updateUser,
  type User,
} from "../lib/db";
import { t, type Lang } from "../i18n";
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
  const [bio, setBio] = useState(user.bio);
  const [picker, setPicker] = useState(false);

  const toggleInterest = (i: string) => {
    const next = user.interests.includes(i) ? user.interests.filter((x) => x !== i) : [...user.interests, i];
    updateUser(user.id, { interests: next });
    onChange();
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="glass rounded-2xl border border-forge-border p-6 flex flex-wrap gap-5 items-start">
        <button type="button" disabled={!mine} onClick={() => mine && setPicker(true)} className="relative">
          <Avatar src={user.avatar} name={user.displayName} size={88} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold">{user.displayName}</h1>
          <div className="text-iron-400 text-sm">
            @{user.username} · {t(user.role, lang)} · {t("level", lang)} {lv.level}
          </div>
          <div className="flex gap-4 mt-3 text-sm">
            <span className="text-ember-400 font-semibold">{user.metrics.xp} XP</span>
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
              className="mt-3 rounded-lg bg-ember-600 px-3 py-1.5 text-sm font-semibold"
            >
              {t("chat", lang)}
            </button>
          )}
        </div>
      </div>

      <div className="glass rounded-2xl border border-forge-border p-5">
        <div className="text-xs uppercase tracking-widest text-iron-400 mb-2">{t("bio", lang)}</div>
        {mine ? (
          <>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              className="w-full rounded-xl bg-forge-bg border border-forge-border p-3 text-sm outline-none focus:border-ember-500"
            />
            <button
              type="button"
              onClick={() => {
                updateUser(user.id, { bio });
                onChange();
              }}
              className="mt-2 rounded-lg bg-forge-panel2 border border-forge-border px-3 py-1.5 text-sm"
            >
              {t("save", lang)}
            </button>
          </>
        ) : (
          <p className="text-sm text-zinc-300">{user.bio || "—"}</p>
        )}
      </div>

      <div className="glass rounded-2xl border border-forge-border p-5">
        <div className="text-xs uppercase tracking-widest text-iron-400 mb-3">{t("interests", lang)}</div>
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
                  "rounded-full border px-3 py-1 text-xs",
                  on ? "border-ember-500 bg-ember-500/15 text-ember-300" : "border-forge-border text-iron-400"
                )}
              >
                {i}
              </button>
            );
          })}
        </div>
      </div>

      <div className="glass rounded-2xl border border-forge-border p-5">
        <div className="text-xs uppercase tracking-widest text-iron-400 mb-3">{t("badges", lang)}</div>
        <div className="grid sm:grid-cols-2 gap-3">
          {user.badges.map((id) => {
            const b = BADGES[id];
            if (!b) return null;
            return (
              <div key={id} className="flex gap-3 rounded-xl border border-forge-border p-3">
                <div className="h-10 w-10 rounded-lg bg-ember-500/15 grid place-items-center text-ember-400">
                  <Icon name={b.icon} className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-sm">{b.name}</div>
                  <div className="text-xs text-iron-400">{b.desc}</div>
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
