import { useEffect, useMemo, useState } from "react";
import * as db from "../lib/db";
import { fidelityScore, accuracyScore, xpRate, levelFromXp } from "../lib/db";
import { CAMPAIGNS } from "../data/lessons";
import type { Lang } from "../i18n";
import Avatar from "./Avatar";
import Icon from "./Icon";
import BadgeModal from "./BadgeModal";
import LearningMap from "./LearningMap";
import { FeedTicker, FeedBox } from "./LiveFeed";
import { cn } from "../utils/cn";

export default function PlayerDashboard({
  user,
  lang,
  onOpenCampaigns,
  onOpenModule,
  onOpenProfile,
}: {
  user: db.User;
  lang: Lang;
  onOpenCampaigns: () => void;
  onOpenModule: (campaignId: string, moduleId: string) => void;
  onOpenProfile: (id: string) => void;
}) {
  const m = user.metrics;
  const lvl = levelFromXp(m.xp);
  const fid = fidelityScore(m);
  const acc = accuracyScore(m);
  const rate = xpRate(m);

  const players = db.allPlayers().sort((a, b) => b.metrics.xp - a.metrics.xp);
  const myRank = players.findIndex((p) => p.id === user.id) + 1;

  const { doneTasks, totalTasks, nextModule } = useMemo(() => {
    let done = 0;
    let total = 0;
    let next: { campaignId: string; moduleId: string; title: string } | null = null;
    for (const c of CAMPAIGNS) {
      const mods = [...c.modules].sort((a, b) => a.order - b.order);
      for (const mod of mods) {
        total += mod.tasks.length;
        const prog = user.progress[mod.id];
        done += prog?.done.length || 0;
        if (!next && !prog?.completed) next = { campaignId: c.id, moduleId: mod.id, title: mod.title[lang] };
      }
    }
    return { doneTasks: done, totalTasks: total, nextModule: next };
  }, [user, lang]);
  const pct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  // Players don't see login/logout/join noise in their feed.
  const feed = db.getFeed().filter((f) => f.kind !== "login" && f.kind !== "join");
  const [badgeOpen, setBadgeOpen] = useState<string | null>(null);

  return (
    <div className="w-full space-y-6">
      {/* Live feed ticker — one line sliding across the top */}
      <div className="enter enter-1">
        <FeedTicker events={feed} />
      </div>

      {/* Interactive learning map — the centerpiece */}
      <div className="enter enter-2">
        <LearningMap user={user} lang={lang} onOpenModule={onOpenModule} onOpenProfile={onOpenProfile} />
      </div>

      {/* Scoreboard + Next challenge hero row */}
      <div className="grid gap-5 lg:grid-cols-5">
        {/* Scoreboard */}
        <div className="enter enter-3 rounded-3xl border border-forge-border glass p-6 lg:col-span-3">
          <div className="mb-4 flex items-center gap-3">
            <Avatar name={user.displayName} src={user.avatar} size={44} ring />
            <div className="min-w-0 flex-1">
              <div className="truncate text-lg font-black text-zinc-50">{user.displayName}</div>
              <div className="font-mono text-[11px] uppercase tracking-widest text-ember-500">
                Level {lvl.level} · Operator
              </div>
            </div>
            <SectionTitle icon="scan" title="Scoreboard" inline />
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            <Metric label="XP" value={m.xp} count tone="ember" />
            <Metric label="Level" value={lvl.level} count tone="ember" />
            <Gauge label="Fidelity" value={fid} hint="typed" />
            <Gauge label="Accuracy" value={acc} hint="typo-free" />
            <Metric
              label="XP rate"
              value={Math.round(rate * 100)}
              suffix="%"
              count
              tone={rate >= 0.85 ? "green" : rate >= 0.6 ? "amber" : "red"}
            />
            <Metric label="Streak" value={m.streakDays} suffix="d" count tone="cyan" />
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric label="Commands" value={m.commandsRun} count small />
            <Metric label="Typos" value={m.typoCount} count small tone={m.typoCount > 0 ? "amber" : undefined} />
            <Metric label="Pastes" value={m.pasteCount} count small tone={m.pasteCount > 0 ? "amber" : undefined} />
            <Metric label="Challenges" value={`${m.challengeSolves}/${m.challengeAttempts}`} small />
          </div>
        </div>

        {/* next challenge */}
        <div className="enter enter-4 card-hover relative flex flex-col justify-between overflow-hidden rounded-3xl border border-ember-500/40 bg-gradient-to-br from-ember-600/15 to-forge-panel p-7 lg:col-span-2">
          <div className="pointer-events-none absolute -right-10 -bottom-10 h-40 w-40 rounded-full bg-ember-500/15 blur-2xl" />
          <div className="relative">
            <div className="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-ember-400">
              <Icon name="sword" className="h-5 w-5 glow-pulse" /> Next challenge
            </div>
            <div className="text-xl font-black text-zinc-50">{nextModule ? nextModule.title : "All clear! 🏴"}</div>
            <p className="mt-1.5 text-sm text-iron-400">
              {nextModule
                ? "Pick up where you left off and keep your streak alive."
                : "You've completed everything available."}
            </p>
          </div>
          <button
            onClick={() => (nextModule ? onOpenModule(nextModule.campaignId, nextModule.moduleId) : onOpenCampaigns())}
            className="shimmer-hover forge-glow relative mt-5 w-full overflow-hidden rounded-xl bg-ember-600 py-3 font-mono text-sm font-bold text-white transition hover:bg-ember-500"
          >
            {nextModule ? "Resume →" : "Browse campaigns →"}
          </button>
        </div>
      </div>

      {rate < 0.85 && (
        <div className="fadeup flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          <Icon name="bulb" className="mt-0.5 h-5 w-5 shrink-0 glow-pulse" />
          <span>
            Your XP rate is reduced. <b>Type commands by hand</b> instead of pasting to raise fidelity, and avoid typos
            to boost accuracy — both increase the XP you earn per task.
          </span>
        </div>
      )}

      {/* MVP leaderboard + level / overall progress */}
      <div className="grid gap-5 lg:grid-cols-5">
        {/* MVP leaderboard */}
        <div className="enter enter-5 relative overflow-hidden rounded-3xl border border-forge-border glass p-6 lg:col-span-2">
          <div className="absolute inset-x-0 top-0 h-1 strip-anim bg-gradient-to-r from-amber-500 via-ember-400 to-amber-500" />
          <div className="mb-4 flex items-center justify-between">
            <SectionTitle icon="crown" title="MVP Leaderboard" inline />
            <span className="rounded-md bg-ember-500/10 px-2 py-0.5 font-mono text-xs font-bold text-ember-400">
              You're #{myRank}
            </span>
          </div>
          <div className="space-y-2">
            {players.slice(0, 5).map((p, i) => (
              <button
                key={p.id}
                onClick={() => onOpenProfile(p.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition hover:-translate-y-0.5 hover:border-ember-500/60",
                  p.id === user.id ? "border-ember-500/50 bg-ember-500/5" : "border-forge-border bg-forge-bg"
                )}
              >
                <span
                  className={cn(
                    "w-6 text-center font-mono text-lg font-black",
                    i === 0 ? "text-amber-300 text-glow" : i === 1 ? "text-zinc-300" : i === 2 ? "text-ember-500" : "text-iron-600"
                  )}
                >
                  {i === 0 ? "★" : i + 1}
                </span>
                <Avatar name={p.displayName} src={p.avatar} size={36} ring={i < 3} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold text-zinc-100">{p.displayName}</div>
                  <div className="font-mono text-[11px] text-iron-500">Lv {levelFromXp(p.metrics.xp).level}</div>
                </div>
                <span className="font-mono text-sm font-black text-ember-400">{p.metrics.xp.toLocaleString()}</span>
              </button>
            ))}
          </div>
        </div>

        {/* level + overall progress */}
        <div className="enter enter-6 card-hover relative overflow-hidden rounded-3xl border border-forge-border glass p-7 lg:col-span-3">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-ember-600/10 blur-3xl float" />
          <div className="relative mb-1.5 flex justify-between font-mono text-xs text-iron-400">
            <span>Level {lvl.level} progress</span>
            <span>
              {lvl.into}/{lvl.span} XP → Lv {lvl.level + 1}
            </span>
          </div>
          <div className="relative h-3 overflow-hidden rounded-full border border-forge-border bg-forge-bg">
            <div
              className="bar-grow h-full rounded-full bg-gradient-to-r from-ember-600 via-ember-500 to-ember-300 shadow-[0_0_14px_rgba(255,106,43,0.6)]"
              style={{ width: `${lvl.pct}%` }}
            />
          </div>
          <div className="relative mt-5 flex items-center justify-between">
            <SectionTitle icon="terminal" title="Overall progress" inline />
            <span className="font-mono text-xl font-black text-ember-400">{pct}%</span>
          </div>
          <div className="relative mt-2 h-3 overflow-hidden rounded-full border border-forge-border bg-forge-bg">
            <div
              className="bar-grow h-full rounded-full bg-gradient-to-r from-ember-600 to-ember-300 shadow-[0_0_12px_rgba(255,106,43,0.5)]"
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="relative mt-2.5 font-mono text-xs text-iron-500">
            {doneTasks}/{totalTasks} objectives across {CAMPAIGNS.length} campaigns
          </div>
        </div>
      </div>

      {/* live feed box + badges */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="enter enter-7 rounded-2xl border border-forge-border glass p-6">
          <SectionTitle icon="radar" title="Live Feed" sub="Recent platform activity" />
          <div className="mt-4">
            <FeedBox events={feed} maxHeight="max-h-72" />
          </div>
        </div>

        <div className="enter enter-8 rounded-2xl border border-forge-border glass p-6">
          <SectionTitle icon="medal" title="Badges" sub={`${user.badges.length} earned · tap to view`} />
          <div className="mt-4 grid grid-cols-4 gap-2.5 sm:grid-cols-6">
            {Object.entries(db.BADGES).map(([id, b], i) => {
              const earned = user.badges.includes(id);
              return (
                <button
                  key={id}
                  onClick={() => setBadgeOpen(id)}
                  title={`${b.name} — ${b.desc}`}
                  className={cn(
                    "flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border p-1.5 text-center transition",
                    earned
                      ? "scale-in border-ember-500/50 bg-ember-500/10 text-ember-400 hover:scale-110"
                      : "border-forge-line bg-forge-bg text-iron-700 opacity-50 hover:opacity-80",
                    `enter-${Math.min(i + 1, 8)}`
                  )}
                >
                  <Icon name={b.icon} className={cn("h-6 w-6", earned && "glow-pulse")} />
                  <span className="truncate text-[9px] font-bold leading-tight">{b.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {badgeOpen && (
        <BadgeModal
          badgeId={badgeOpen}
          earned={user.badges.includes(badgeOpen)}
          holderName={user.badges.includes(badgeOpen) ? user.displayName : undefined}
          onClose={() => setBadgeOpen(null)}
        />
      )}
    </div>
  );
}

export function timeAgo(ts: number): string {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function SectionTitle({
  icon,
  title,
  sub,
  inline,
}: {
  icon: string;
  title: string;
  sub?: string;
  inline?: boolean;
}) {
  return (
    <div className={cn(!inline && "mb-3")}>
      <div className="flex items-center gap-2">
        <Icon name={icon} className="h-5 w-5 text-ember-400" />
        <h3 className="font-mono text-base font-bold text-zinc-100">{title}</h3>
      </div>
      {sub && <p className="ml-7 font-mono text-xs text-iron-500">{sub}</p>}
    </div>
  );
}

// Animated count-up number
function useCountUp(target: number, run: boolean) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!run) {
      setVal(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const dur = 700;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, run]);
  return val;
}

function Metric({
  label,
  value,
  tone,
  small,
  count,
  prefix = "",
  suffix = "",
}: {
  label: string;
  value: number | string;
  tone?: "ember" | "green" | "amber" | "red" | "cyan";
  small?: boolean;
  count?: boolean;
  prefix?: string;
  suffix?: string;
}) {
  const numeric = typeof value === "number";
  const shown = useCountUp(numeric ? (value as number) : 0, !!count && numeric);
  const color =
    tone === "ember"
      ? "text-ember-400"
      : tone === "green"
        ? "text-neon-green"
        : tone === "amber"
          ? "text-amber-300"
          : tone === "red"
            ? "text-red-400"
            : tone === "cyan"
              ? "text-neon-cyan"
              : "text-zinc-100";
  return (
    <div className="card-hover rounded-2xl border border-forge-border glass p-3 text-center sm:p-4">
      <div className={cn("font-mono font-black tabular-nums", small ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl", color)}>
        {prefix}
        {numeric ? (count ? shown : value) : value}
        {suffix}
      </div>
      <div className="mt-1 truncate text-[10px] font-semibold uppercase tracking-wide text-iron-500 sm:text-[11px]">{label}</div>
    </div>
  );
}

function Gauge({ label, value, hint }: { label: string; value: number; hint: string }) {
  const shown = useCountUp(value, true);
  const color = value >= 85 ? "text-neon-green" : value >= 60 ? "text-amber-300" : "text-red-400";
  const bar = value >= 85 ? "bg-neon-green" : value >= 60 ? "bg-amber-300" : "bg-red-400";
  return (
    <div className="card-hover rounded-2xl border border-forge-border glass p-3 text-center sm:p-4">
      <div className={cn("font-mono text-2xl font-black tabular-nums sm:text-3xl", color)}>{shown}%</div>
      <div className="mt-1 truncate text-[10px] font-semibold uppercase tracking-wide text-iron-500 sm:text-[11px]">{label}</div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-forge-bg">
        <div className={cn("bar-grow h-full rounded-full", bar)} style={{ width: `${value}%` }} />
      </div>
      <div className="mt-1 text-[10px] text-iron-600">{hint}</div>
    </div>
  );
}
