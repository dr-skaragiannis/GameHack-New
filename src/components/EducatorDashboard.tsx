import { useMemo } from "react";
import {
  allPlayers,
  accuracyScore,
  fidelityScore,
  isOnline,
  levelFromXp,
  overallScoreboard,
  ticketsFor,
  type User,
} from "../lib/db";
import { CAMPAIGNS } from "../data/lessons";
import { t, uppercaseLabel, type Lang } from "../i18n";
import Avatar from "./Avatar";
import LiveFeed from "./LiveFeed";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function EducatorDashboard({
  user,
  lang,
  onProfile,
}: {
  user: User;
  lang: Lang;
  onProfile: (id: string) => void;
}) {
  const players = allPlayers();
  const scoreboard = overallScoreboard();
  const tickets = ticketsFor(user).filter((x) => x.status === "open");
  const mods = CAMPAIGNS.flatMap((c) => c.modules);
  const online = players.filter((p) => isOnline(p)).length;
  const avgXp = players.length ? Math.round(players.reduce((s, p) => s + p.metrics.xp, 0) / players.length) : 0;
  const completion = players.length
    ? Math.round(
        (players.reduce((s, p) => s + Object.values(p.progress).filter((x) => x.completed).length, 0) /
          (players.length * mods.length)) *
          100
      )
    : 0;

  const chart = useMemo(
    () =>
      scoreboard.map(({ user: p }) => ({
        name: p.displayName.split(" ")[0],
        xp: p.metrics.xp,
        fid: fidelityScore(p.metrics),
      })),
    [scoreboard]
  );

  return (
    <div className="space-y-6">
      <div>
        <div className="text-sm uppercase tracking-[0.25em] text-ember-400">{uppercaseLabel(t("educator", lang), lang)}</div>
        <h1 className="text-3xl font-bold text-zinc-50 mt-1">{t("dashboard", lang)}</h1>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { k: t("operators", lang), v: players.length },
          { k: t("activeNow", lang), v: online },
          { k: t("avgXp", lang), v: avgXp },
          { k: t("completion", lang), v: `${completion}%` },
        ].map((s) => (
          <div key={s.k} className="glass rounded-2xl border border-forge-border p-4">
            <div className="text-sm uppercase tracking-widest text-iron-400">{uppercaseLabel(s.k, lang)}</div>
            <div className="text-2xl font-bold mt-1">{s.v}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass rounded-2xl border border-forge-border p-4 h-72">
          <div className="text-sm font-semibold mb-2">{t("overallScoreboard", lang)}</div>
          <ResponsiveContainer width="100%" height="90%">
            <BarChart data={chart}>
              <CartesianGrid stroke="#26262c" vertical={false} />
              <XAxis dataKey="name" stroke="#71717a" fontSize={11} />
              <YAxis stroke="#71717a" fontSize={11} />
              <Tooltip
                contentStyle={{ background: "#101012", border: "1px solid #26262c", borderRadius: 12 }}
              />
              <Bar dataKey="xp" fill="#ff6a2b" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass rounded-2xl border border-forge-border p-4">
          <div className="text-sm font-semibold mb-3">{t("liveFeed", lang)}</div>
          <LiveFeed />
        </div>
      </div>

      <div className="glass rounded-2xl border border-forge-border overflow-hidden">
        <div className="px-4 py-3 border-b border-forge-border text-sm font-semibold">{t("overallScoreboard", lang)}</div>
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="text-sm uppercase tracking-widest text-iron-500">
              <tr>
                <th className="text-left px-4 py-2 font-medium">{uppercaseLabel(t("position", lang), lang)}</th>
                <th className="text-left px-4 py-2 font-medium">{uppercaseLabel(t("player", lang), lang)}</th>
                <th className="text-left px-4 py-2 font-medium">{uppercaseLabel(t("level", lang), lang)}</th>
                <th className="text-left px-4 py-2 font-medium">XP</th>
                <th className="text-left px-4 py-2 font-medium">{uppercaseLabel(t("fidelity", lang), lang)}</th>
                <th className="text-left px-4 py-2 font-medium">{uppercaseLabel(t("accuracy", lang), lang)}</th>
                <th className="text-left px-4 py-2 font-medium">{uppercaseLabel(t("progress", lang), lang)}</th>
              </tr>
            </thead>
            <tbody>
              {scoreboard.map(({ user: p, rank }) => {
                  const lv = levelFromXp(p.metrics.xp);
                  const done = Object.values(p.progress).filter((x) => x.completed).length;
                  return (
                    <tr
                      key={p.id}
                      className="border-t border-forge-line hover:bg-white/5 cursor-pointer"
                      onClick={() => onProfile(p.id)}
                    >
                      <td className="px-4 py-2 font-mono font-bold text-ember-400">#{rank}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <Avatar src={p.avatar} name={p.displayName} size={28} />
                          <div>
                            <div className="font-medium">{p.displayName}</div>
                            <div className="text-sm text-iron-500">
                              {p.username.includes("@") ? t("player", lang) : `@${p.username}`}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2">{lv.level}</td>
                      <td className="px-4 py-2 text-ember-400 font-semibold">{p.metrics.xp}</td>
                      <td className="px-4 py-2">{fidelityScore(p.metrics)}%</td>
                      <td className="px-4 py-2">{accuracyScore(p.metrics)}%</td>
                      <td className="px-4 py-2">
                        {done}/{mods.length}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {tickets.length > 0 && (
        <div className="text-sm text-amber-300">
          {tickets.length} open {t("tickets", lang).toLowerCase()}
        </div>
      )}
    </div>
  );
}
