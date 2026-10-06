import { LEARNING_PATHS } from "../data/lessons";
import {
  accuracyScore,
  BADGES,
  fidelityScore,
  levelFromXp,
  type User,
} from "../lib/db";
import { bi, t, type Lang } from "../i18n";
import Icon, { MODULE_ICON } from "./Icon";
import LiveFeed from "./LiveFeed";
import Avatar from "./Avatar";
import { cn } from "../utils/cn";
import InteractiveMap from "./InteractiveMap";

export default function PlayerDashboard({
  user,
  lang,
  onOpen,
  onCampaign,
}: {
  user: User;
  lang: Lang;
  onOpen: (cid: string, mid: string) => void;
  onCampaign: (campaignId: string) => void;
}) {
  const lv = levelFromXp(user.metrics.xp);
  const allMods = LEARNING_PATHS.flatMap((c) => c.modules);
  const completed = allMods.filter((m) => user.progress[m.id]?.completed).length;
  const next =
    LEARNING_PATHS.map((c) => {
      const ordered = [...c.modules].sort((a, b) => a.order - b.order);
      const idx = ordered.findIndex((m, i) => {
        const unlocked = i === 0 || !!user.progress[ordered[i - 1].id]?.completed;
        return unlocked && !user.progress[m.id]?.completed;
      });
      return idx >= 0 ? { c, m: ordered[idx] } : null;
    }).find(Boolean) || null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-sm uppercase tracking-[0.25em] text-ember-400">{t("dashboard", lang)}</div>
          <h1 className="text-3xl font-bold text-zinc-50 mt-1">
            {t("welcomeBack", lang)}, {user.displayName.split(" ")[0]}
          </h1>
          <p className="text-iron-400 text-sm mt-1">{t("forgeReady", lang)}</p>
        </div>
        <div className="flex items-center gap-3 glass rounded-2xl border border-forge-border px-4 py-3">
          <Avatar src={user.avatar} name={user.displayName} size={44} />
          <div>
            <div className="text-sm text-iron-400">
              {t("level", lang)} {lv.level}
            </div>
            <div className="text-lg font-bold text-ember-400">{user.metrics.xp} XP</div>
            <div className="h-1.5 w-32 rounded-full bg-forge-bg overflow-hidden mt-1">
              <div className="h-full bg-ember-500" style={{ width: `${lv.pct}%` }} />
            </div>
          </div>
        </div>
      </div>

      <LiveFeed compact />

      <InteractiveMap user={user} lang={lang} onOpen={onOpen} embedded />

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { k: t("modules", lang), v: `${completed}/${allMods.length}`, ic: "flag" },
          { k: t("fidelity", lang), v: `${fidelityScore(user.metrics)}%`, ic: "check" },
          { k: t("accuracy", lang), v: `${accuracyScore(user.metrics)}%`, ic: "target" },
          { k: t("streak", lang), v: `${user.metrics.streakDays} ${t("days", lang)}`, ic: "medal" },
        ].map((s, i) => (
          <div key={s.k} className={cn("glass rounded-2xl border border-forge-border p-4 enter", `enter-${i + 1}`)}>
            <div className="flex items-center gap-2 text-iron-400 text-sm uppercase tracking-widest">
              <Icon name={s.ic} className="w-4 h-4 text-ember-400" />
              {s.k}
            </div>
            <div className="text-2xl font-bold mt-2 text-zinc-100">{s.v}</div>
          </div>
        ))}
      </div>

      {next && (
        <button
          type="button"
          onClick={() => onOpen(next.c.id, next.m.id)}
          className="w-full text-left glass rounded-2xl border border-ember-600/40 p-5 forge-glow card-hover flex items-center gap-4"
        >
          <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${next.m.color} grid place-items-center`}>
            <Icon name={MODULE_ICON[next.m.id] || next.m.icon} className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <div className="text-sm uppercase tracking-widest text-ember-400">{t("continueLearning", lang)}</div>
            <div className="text-lg font-bold text-zinc-100">{bi(next.m.title, lang)}</div>
            <div className="text-sm text-iron-400">
              {bi(next.c.title, lang)} · {bi(next.m.subtitle, lang)}
            </div>
          </div>
          <Icon name="chevron" className="w-6 h-6 text-ember-400" />
        </button>
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-semibold text-zinc-300">{t("campaigns", lang)}</h3>
          <div className="grid sm:grid-cols-3 gap-3">
            {LEARNING_PATHS.map((c) => {
              const n = c.modules.filter((m) => user.progress[m.id]?.completed).length;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => onCampaign(c.id)}
                  className="glass rounded-2xl border border-forge-border p-4 text-left card-hover"
                >
                  <div className="text-sm font-bold text-zinc-100">
                    <span className="font-mono text-sm tracking-widest text-ember-400 mr-2">{String(c.pathNumber).padStart(2, "0")}.</span>
                    {bi(c.title, lang)}
                  </div>
                  <div className="text-sm text-iron-400 mt-1 line-clamp-2">{bi(c.subtitle, lang)}</div>
                  <div className="mt-3 h-1.5 rounded-full bg-forge-bg overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-ember-600 to-ember-400"
                      style={{ width: `${(n / c.modules.length) * 100}%` }}
                    />
                  </div>
                  <div className="text-sm text-iron-500 mt-1">
                    {n}/{c.modules.length}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-zinc-300 mb-3">{t("badges", lang)}</h3>
          <div className="flex flex-wrap gap-2">
            {user.badges.length === 0 && <span className="text-sm text-iron-500">—</span>}
            {user.badges.map((id) => {
              const b = BADGES[id];
              if (!b) return null;
              return (
                <div
                  key={id}
                  title={b.desc}
                  className="h-12 w-12 rounded-xl border border-forge-border bg-forge-panel2 grid place-items-center text-ember-400"
                >
                  <Icon name={b.icon} className="w-6 h-6" />
                </div>
              );
            })}
          </div>
          <h3 className="text-sm font-semibold text-zinc-300 mt-6 mb-3">{t("liveFeed", lang)}</h3>
          <div className="glass rounded-2xl border border-forge-border p-4 max-h-64 overflow-auto">
            <LiveFeed />
          </div>
        </div>
      </div>
    </div>
  );
}
