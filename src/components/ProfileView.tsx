import { useState } from "react";
import * as db from "../lib/db";
import { fidelityScore, accuracyScore, levelFromXp, INTERESTS_POOL } from "../lib/db";
import Avatar from "./Avatar";
import AvatarPicker from "./AvatarPicker";
import BadgeModal from "./BadgeModal";
import Icon from "./Icon";
import { cn } from "../utils/cn";

export default function ProfileView({
  profileId,
  viewer,
  onBack,
  onChat,
  onChanged,
}: {
  profileId: string;
  viewer: db.User;
  onBack: () => void;
  onChat: (id: string) => void;
  onChanged: () => void;
}) {
  const u = db.userById(profileId);
  const isMe = u?.id === viewer.id;
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(u?.bio || "");
  const [displayName, setDisplayName] = useState(u?.displayName || "");
  const [interests, setInterests] = useState<string[]>(u?.interests || []);
  const [avatar, setAvatar] = useState(u?.avatar || "");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [badgeOpen, setBadgeOpen] = useState<string | null>(null);

  if (!u) return <div className="p-8 text-iron-400">User not found.</div>;

  const m = u.metrics;
  const lvl = levelFromXp(m.xp);

  const save = () => {
    db.updateUser(u.id, { bio, displayName: displayName || u.username, interests, avatar });
    setEditing(false);
    onChanged();
  };

  const toggleInterest = (i: string) =>
    setInterests((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]));

  return (
    <div className="w-full">
      <button
        onClick={onBack}
        className="mb-4 rounded-lg border border-forge-border px-3 py-2 font-mono text-sm text-iron-400 transition hover:border-ember-500 hover:text-ember-400"
      >
        ← Back
      </button>

      <div className="scale-in overflow-hidden rounded-3xl border border-forge-border glass">
        <div className="strip-anim h-28 bg-gradient-to-r from-ember-700/50 via-ember-500/25 to-forge-panel" />
        <div className="px-6 pb-6">
          <div className="-mt-10 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <div className="relative">
                <Avatar name={u.displayName} src={avatar} size={88} ring className="border-4 border-forge-panel" />
                {editing && (
                  <button
                    onClick={() => setPickerOpen(true)}
                    className="pulse-ring absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-ember-600 text-white transition hover:bg-ember-500"
                    title="Change avatar"
                  >
                    <Icon name="scan" className="h-4 w-4" />
                  </button>
                )}
              </div>
              <div className="pb-1">
                {editing ? (
                  <input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="rounded-lg border border-forge-border bg-forge-bg px-2 py-1 text-xl font-black text-zinc-100 outline-none focus:border-ember-500"
                  />
                ) : (
                  <h2 className="text-2xl font-black text-zinc-100">{u.displayName}</h2>
                )}
                <div className="font-mono text-xs text-iron-500">
                  @{u.username} · {u.role === "educator" ? "Educator" : `Level ${lvl.level} Operator`}
                </div>
              </div>
            </div>
            <div className="flex gap-2 pb-1">
              {isMe ? (
                editing ? (
                  <>
                    <button onClick={save} className="rounded-lg bg-ember-600 px-4 py-2 font-mono text-xs font-bold text-white hover:bg-ember-500">
                      Save
                    </button>
                    <button onClick={() => setEditing(false)} className="rounded-lg border border-forge-border px-4 py-2 font-mono text-xs text-iron-400 hover:text-zinc-200">
                      Cancel
                    </button>
                  </>
                ) : (
                  <button onClick={() => setEditing(true)} className="rounded-lg border border-forge-border px-4 py-2 font-mono text-xs text-iron-300 hover:border-ember-500 hover:text-ember-400">
                    Edit profile
                  </button>
                )
              ) : (
                <button onClick={() => onChat(u.id)} className="rounded-lg bg-ember-600 px-4 py-2 font-mono text-xs font-bold text-white hover:bg-ember-500">
                  💬 Message
                </button>
              )}
            </div>
          </div>

          {/* bio */}
          <div className="mt-5">
            <h3 className="mb-1 font-mono text-[11px] uppercase tracking-wide text-ember-500">Biography</h3>
            {editing ? (
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="Tell others about yourself…"
                className="w-full resize-none rounded-lg border border-forge-border bg-forge-bg px-3 py-2 text-sm text-zinc-200 outline-none focus:border-ember-500"
              />
            ) : (
              <p className="text-sm text-iron-300">{u.bio || "No biography yet."}</p>
            )}
          </div>

          {/* interests */}
          <div className="mt-5">
            <h3 className="mb-2 font-mono text-[11px] uppercase tracking-wide text-ember-500">Interests</h3>
            {editing ? (
              <div className="flex flex-wrap gap-2">
                {INTERESTS_POOL.map((i) => (
                  <button
                    key={i}
                    onClick={() => toggleInterest(i)}
                    className={cn(
                      "rounded-full border px-3 py-1 font-mono text-[11px] transition",
                      interests.includes(i)
                        ? "border-ember-500 bg-ember-500/10 text-ember-400"
                        : "border-forge-border text-iron-400 hover:text-zinc-200"
                    )}
                  >
                    {i}
                  </button>
                ))}
              </div>
            ) : u.interests.length ? (
              <div className="flex flex-wrap gap-2">
                {u.interests.map((i) => (
                  <span key={i} className="rounded-full border border-forge-border bg-forge-bg px-3 py-1 font-mono text-[11px] text-ember-400">
                    {i}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-iron-500">No interests listed.</p>
            )}
          </div>

          {/* public stats */}
          {u.role === "player" && (
            <div className="mt-6">
              <h3 className="mb-2.5 font-mono text-xs uppercase tracking-wide text-ember-500">Statistics</h3>
              <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
                <Stat label="XP" value={String(m.xp)} />
                <Stat label="Level" value={String(lvl.level)} />
                <Stat label="Fidelity" value={`${fidelityScore(m)}%`} />
                <Stat label="Accuracy" value={`${accuracyScore(m)}%`} />
                <Stat label="Streak" value={`${m.streakDays}d`} />
                <Stat label="Badges" value={String(u.badges.length)} />
              </div>

              {/* badges */}
              <div className="mt-4 flex flex-wrap gap-2">
                {u.badges.length === 0 && <span className="text-sm text-iron-500">No badges earned yet.</span>}
                {u.badges.map((b, i) => (
                  <button
                    key={b}
                    onClick={() => setBadgeOpen(b)}
                    title={db.BADGES[b]?.desc}
                    className={cn(
                      "scale-in flex items-center gap-1.5 rounded-full border border-ember-500/40 bg-ember-500/10 px-3 py-1.5 text-ember-400 transition hover:scale-105 hover:border-ember-500",
                      `enter-${Math.min(i + 1, 8)}`
                    )}
                  >
                    <Icon name={db.BADGES[b]?.icon || "medal"} className="h-4 w-4 glow-pulse" />
                    <span className="font-mono text-xs font-bold">{db.BADGES[b]?.name || b}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {pickerOpen && (
        <AvatarPicker
          current={avatar}
          name={u.displayName}
          onSelect={(v) => setAvatar(v)}
          onClose={() => setPickerOpen(false)}
        />
      )}

      {badgeOpen && (
        <BadgeModal badgeId={badgeOpen} earned holderName={u.displayName} onClose={() => setBadgeOpen(null)} />
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="card-hover rounded-xl border border-forge-border bg-forge-bg p-3.5 text-center">
      <div className="font-mono text-2xl font-black text-ember-400">{value}</div>
      <div className="mt-1 text-[11px] uppercase tracking-wide text-iron-500">{label}</div>
    </div>
  );
}
