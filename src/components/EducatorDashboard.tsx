import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ScatterChart,
  Scatter,
  ZAxis,
  CartesianGrid,
  Cell,
} from "recharts";
import * as db from "../lib/db";
import { fidelityScore, accuracyScore, levelFromXp } from "../lib/db";
import { CAMPAIGNS } from "../data/lessons";
import type { Lang } from "../i18n";
import Avatar from "./Avatar";
import Icon from "./Icon";
import BadgeModal from "./BadgeModal";
import { FeedTicker, FeedBox } from "./LiveFeed";
import { cn } from "../utils/cn";

const EMBER = "#ff6a2b";
const CYAN = "#22d3ee";
const GREEN = "#3ddc84";
const AMBER = "#fcd34d";

export default function EducatorDashboard({
  user,
  lang,
  onOpenProfile,
}: {
  user: db.User;
  lang: Lang;
  onOpenProfile: (id: string) => void;
}) {
  const players = db.allPlayers();
  const [selected, setSelected] = useState<string[]>([]);
  const [broadcastText, setBroadcastText] = useState("");
  const [sent, setSent] = useState("");
  const [badgeOpen, setBadgeOpen] = useState<string | null>(null);

  // Educators see the FULL feed, including logins/joins.
  const feed = db.getFeed();

  // ---------- aggregate research metrics ----------
  const stats = useMemo(() => {
    const n = players.length || 1;
    const avg = (f: (p: db.User) => number) => Math.round(players.reduce((s, p) => s + f(p), 0) / n);
    return {
      count: players.length,
      avgXp: avg((p) => p.metrics.xp),
      avgFidelity: avg((p) => fidelityScore(p.metrics)),
      avgAccuracy: avg((p) => accuracyScore(p.metrics)),
      avgLevel: avg((p) => levelFromXp(p.metrics.xp).level),
      totalCommands: players.reduce((s, p) => s + p.metrics.commandsRun, 0),
      openTickets: db.getDB().tickets.filter((t) => t.status === "open").length,
    };
  }, [players]);

  // module completion rates (bar chart) across all campaigns
  const moduleData = useMemo(() => {
    const rows: { name: string; completed: number; started: number }[] = [];
    for (const c of CAMPAIGNS) {
      for (const mod of [...c.modules].sort((a, b) => a.order - b.order)) {
        let completed = 0;
        let started = 0;
        for (const p of players) {
          const pr = p.progress[mod.id];
          if (pr?.completed) completed++;
          else if (pr?.done.length) started++;
        }
        rows.push({ name: mod.title[lang].slice(0, 14), completed, started });
      }
    }
    return rows;
  }, [players, lang]);

  // cohort skills radar — averaged competency across domains (derived)
  const radarData = useMemo(() => {
    const dims = [
      { k: "Linux", mods: ["linux-basics", "files", "permissions"] },
      { k: "Network", mods: ["networking", "recon", "raven-recon"] },
      { k: "Scanning", mods: ["scanning", "raven-enum"] },
      { k: "Web", mods: ["sqli", "raven-web"] },
      { k: "Brute-force", mods: ["bruteforce", "raven-foothold"] },
      { k: "Priv-Esc", mods: ["privesc", "raven-root"] },
    ];
    return dims.map((d) => {
      let total = 0;
      let got = 0;
      for (const p of players) {
        for (const mid of d.mods) {
          total++;
          if (p.progress[mid]?.completed) got++;
        }
      }
      return { domain: d.k, value: total ? Math.round((got / total) * 100) : 0 };
    });
  }, [players]);

  // scatter: fidelity (x) vs XP (y), bubble size = commands
  const scatterData = useMemo(
    () =>
      players.map((p) => ({
        x: fidelityScore(p.metrics),
        y: p.metrics.xp,
        z: p.metrics.commandsRun + 10,
        name: p.displayName,
        id: p.id,
      })),
    [players]
  );

  const doBroadcast = () => {
    if (!broadcastText.trim()) return;
    db.sendMessage(user, "broadcast", broadcastText.trim());
    setSent(`Broadcast sent to ${players.length} players.`);
    setBroadcastText("");
    setTimeout(() => setSent(""), 2500);
  };
  const doTargeted = () => {
    if (!broadcastText.trim() || selected.length === 0) return;
    selected.forEach((id) => db.sendMessage(user, id, broadcastText.trim()));
    setSent(`Message sent to ${selected.length} selected player(s).`);
    setBroadcastText("");
    setSelected([]);
    setTimeout(() => setSent(""), 2500);
  };

  return (
    <div className="w-full space-y-7">
      <div className="enter enter-1">
        <div className="font-mono text-xs uppercase tracking-[0.35em] text-ember-500">Educator console</div>
        <h2 className="text-3xl font-black text-shine">Cohort Analytics</h2>
        <p className="text-base text-iron-400">Research metrics across {stats.count} players.</p>
      </div>

      {/* full live ticker (educators see everything, incl. logins) */}
      <div className="enter enter-1">
        <FeedTicker events={feed} />
      </div>

      {/* KPI row */}
      <div className="enter enter-2 grid grid-cols-2 gap-3.5 md:grid-cols-4 lg:grid-cols-7">
        <Kpi label="Players" value={stats.count} tone="cyan" />
        <Kpi label="Avg XP" value={stats.avgXp} tone="ember" />
        <Kpi label="Avg Level" value={stats.avgLevel} tone="ember" />
        <Kpi label="Avg Fidelity" value={stats.avgFidelity} suffix="%" tone={stats.avgFidelity >= 80 ? "green" : "amber"} />
        <Kpi label="Avg Accuracy" value={stats.avgAccuracy} suffix="%" tone={stats.avgAccuracy >= 80 ? "green" : "amber"} />
        <Kpi label="Commands" value={stats.totalCommands} />
        <Kpi label="Open tickets" value={stats.openTickets} tone={stats.openTickets ? "amber" : "green"} />
      </div>

      {/* charts */}
      <div className="grid gap-5 lg:grid-cols-2">
        <ChartCard title="Cohort Skills Radar" sub="Average domain mastery (%)" delay={3}>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={radarData} outerRadius={105}>
              <PolarGrid stroke="#2a2a30" />
              <PolarAngleAxis dataKey="domain" tick={{ fill: "#c4c4cc", fontSize: 13 }} />
              <Radar dataKey="value" stroke={EMBER} strokeWidth={2} fill={EMBER} fillOpacity={0.35} isAnimationActive animationDuration={900} />
              <Tooltip contentStyle={tooltipStyle} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Module Completion" sub="Players completed vs in-progress" delay={4}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={moduleData} margin={{ left: -16, bottom: 44 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c1c21" />
              <XAxis dataKey="name" angle={-35} textAnchor="end" tick={{ fill: "#9a9aa3", fontSize: 11 }} interval={0} height={64} />
              <YAxis allowDecimals={false} tick={{ fill: "#9a9aa3", fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#ffffff08" }} />
              <Bar dataKey="completed" stackId="a" fill={GREEN} radius={[0, 0, 0, 0]} animationDuration={900} />
              <Bar dataKey="started" stackId="a" fill={AMBER} radius={[4, 4, 0, 0]} animationDuration={900} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Fidelity vs XP" sub="Bubble size = commands run" delay={5}>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ left: -6, bottom: 10 }}>
              <CartesianGrid stroke="#1c1c21" />
              <XAxis
                type="number"
                dataKey="x"
                name="Fidelity"
                unit="%"
                domain={[0, 100]}
                tick={{ fill: "#9a9aa3", fontSize: 12 }}
              />
              <YAxis type="number" dataKey="y" name="XP" tick={{ fill: "#9a9aa3", fontSize: 12 }} />
              <ZAxis type="number" dataKey="z" range={[60, 500]} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ strokeDasharray: "3 3" }} />
              <Scatter data={scatterData} animationDuration={900}>
                {scatterData.map((d) => (
                  <Cell key={d.id} fill={d.x >= 80 ? GREEN : d.x >= 60 ? AMBER : EMBER} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="XP Distribution" sub="Per player" delay={6}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={players.map((p) => ({ name: p.displayName.split(" ")[0], xp: p.metrics.xp, id: p.id }))} margin={{ left: -16, bottom: 44 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c1c21" />
              <XAxis dataKey="name" angle={-35} textAnchor="end" tick={{ fill: "#9a9aa3", fontSize: 11 }} interval={0} height={64} />
              <YAxis tick={{ fill: "#9a9aa3", fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "#ffffff08" }} />
              <Bar dataKey="xp" fill={CYAN} radius={[4, 4, 0, 0]} animationDuration={900} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* player table + messaging */}
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="enter enter-7 rounded-2xl border border-forge-border glass p-6 lg:col-span-2">
          <div className="mb-3 flex items-center gap-2">
            <Icon name="terminal" className="h-5 w-5 text-ember-400" />
            <h3 className="font-mono text-base font-bold text-zinc-100">Players</h3>
            <span className="font-mono text-xs text-iron-500">(select to message)</span>
          </div>
          <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
            {players.map((p) => {
              const on = selected.includes(p.id);
              return (
                <div
                  key={p.id}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-3.5 py-2.5 transition hover:border-ember-500/40",
                    on ? "border-ember-500/60 bg-ember-500/5" : "border-forge-border bg-forge-bg"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={on}
                    onChange={() => setSelected((s) => (on ? s.filter((x) => x !== p.id) : [...s, p.id]))}
                    className="h-4 w-4 accent-ember-500"
                  />
                  <button onClick={() => onOpenProfile(p.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <Avatar name={p.displayName} src={p.avatar} size={38} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-base font-bold text-zinc-100">{p.displayName}</div>
                      <div className="font-mono text-xs text-iron-500">
                        Lv {levelFromXp(p.metrics.xp).level} · {p.metrics.xp.toLocaleString()} XP · fid{" "}
                        {fidelityScore(p.metrics)}%
                      </div>
                    </div>
                  </button>
                  <div className="hidden gap-1 sm:flex">
                    {p.badges.slice(0, 3).map((b) => (
                      <button
                        key={b}
                        onClick={() => setBadgeOpen(b)}
                        title={db.BADGES[b]?.name}
                        className="transition hover:scale-125"
                      >
                        <Icon name={db.BADGES[b]?.icon || "medal"} className="h-4 w-4 text-ember-500" />
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="enter enter-8 rounded-2xl border border-forge-border glass p-6">
          <div className="mb-3 flex items-center gap-2">
            <Icon name="radar" className="h-5 w-5 text-ember-400" />
            <h3 className="font-mono text-base font-bold text-zinc-100">Broadcast / Message</h3>
          </div>
          <textarea
            value={broadcastText}
            onChange={(e) => setBroadcastText(e.target.value)}
            rows={5}
            placeholder="Write an announcement or a message to selected players…"
            className="w-full resize-none rounded-lg border border-forge-border bg-forge-bg px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-ember-500"
          />
          {sent && <div className="mt-2 font-mono text-xs text-neon-green">{sent}</div>}
          <div className="mt-3 space-y-2">
            <button
              onClick={doBroadcast}
              className="shimmer-hover w-full overflow-hidden rounded-lg bg-ember-600 py-3 font-mono text-sm font-bold text-white transition hover:bg-ember-500"
            >
              📢 Broadcast to all ({players.length})
            </button>
            <button
              onClick={doTargeted}
              disabled={selected.length === 0}
              className="w-full rounded-lg border border-forge-border py-3 font-mono text-sm font-bold text-iron-300 transition enabled:hover:border-ember-500 enabled:hover:text-ember-400 disabled:opacity-40"
            >
              Send to selected ({selected.length})
            </button>
          </div>
        </div>
      </div>

      {/* Full live feed with filters (educators see login/logout too) */}
      <div className="enter rounded-2xl border border-forge-border glass p-6">
        <div className="mb-4 flex items-center gap-2">
          <Icon name="radar" className="h-5 w-5 text-ember-400" />
          <h3 className="font-mono text-base font-bold text-zinc-100">Live Feed</h3>
          <span className="font-mono text-xs text-iron-500">— full platform activity</span>
        </div>
        <FeedBox events={feed} filterable maxHeight="max-h-96" />
      </div>

      {badgeOpen && (
        <BadgeModal badgeId={badgeOpen} earned onClose={() => setBadgeOpen(null)} />
      )}
    </div>
  );
}

const tooltipStyle = {
  background: "#101012",
  border: "1px solid #26262c",
  borderRadius: 8,
  fontSize: 12,
  color: "#e4e4e7",
};

function ChartCard({
  title,
  sub,
  children,
  delay = 0,
}: {
  title: string;
  sub: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <div className={cn("enter card-hover rounded-2xl border border-forge-border glass p-6", `enter-${Math.min(delay, 8)}`)}>
      <h3 className="font-mono text-base font-bold text-zinc-100">{title}</h3>
      <p className="mb-3 font-mono text-xs text-iron-500">{sub}</p>
      {children}
    </div>
  );
}

function useCountUp(target: number) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 700);
      setVal(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return val;
}

function Kpi({
  label,
  value,
  suffix = "",
  tone,
}: {
  label: string;
  value: number;
  suffix?: string;
  tone?: "ember" | "green" | "amber" | "cyan";
}) {
  const shown = useCountUp(value);
  const color =
    tone === "ember"
      ? "text-ember-400"
      : tone === "green"
        ? "text-neon-green"
        : tone === "amber"
          ? "text-amber-300"
          : tone === "cyan"
            ? "text-neon-cyan"
            : "text-zinc-100";
  return (
    <div className="card-hover rounded-2xl border border-forge-border glass p-3 text-center sm:p-4">
      <div className={cn("font-mono text-2xl font-black tabular-nums sm:text-3xl", color)}>
        {shown.toLocaleString()}
        {suffix}
      </div>
      <div className="mt-1 truncate text-[10px] font-semibold uppercase tracking-wide text-iron-500 sm:text-[11px]">{label}</div>
    </div>
  );
}
