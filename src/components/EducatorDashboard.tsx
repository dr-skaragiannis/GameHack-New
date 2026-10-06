import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  accuracyScore,
  allPlayers,
  assignPlayerToTeam,
  commandExecutions,
  createTeam,
  fidelityScore,
  isOnline,
  levelFromXp,
  overallScoreboard,
  pendingTeamApplications,
  reviewTeamApplication,
  teamsForEducator,
  ticketsFor,
  type Team,
  type User,
} from "../lib/db";
import { LEARNING_PATHS } from "../data/lessons";
import { bi, t, uppercaseLabel, type Lang } from "../i18n";
import Avatar from "./Avatar";
import LiveFeed from "./LiveFeed";
import Icon from "./Icon";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

type EducatorTab = "overview" | "players" | "teams" | "commands";
type TeamAnalytics = {
  team: Team;
  members: User[];
  avgXp: number;
  completion: number;
  accuracy: number;
  fidelity: number;
  commandCount: number;
  challengeSuccess: number;
};

const CHART_COLORS = ["#fb8043", "#22d3ee", "#a78bfa", "#3ddc84"];
const TOTAL_MODULES = LEARNING_PATHS.reduce((total, campaign) => total + campaign.modules.length, 0);
const ALL_MODULES = LEARNING_PATHS.flatMap((campaign) => campaign.modules);
const TOOLTIP_STYLE = {
  background: "#101012",
  border: "1px solid #33333a",
  borderRadius: 12,
  color: "#f4f4f5",
  fontSize: 12,
};

function average(values: number[]) {
  return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
}

function completedModuleCount(player: User) {
  return ALL_MODULES.filter((module) => player.progress[module.id]?.completed).length;
}

function completionPercent(player: User) {
  return Math.round((completedModuleCount(player) / Math.max(1, TOTAL_MODULES)) * 100);
}

function teamAnalytics(team: Team, players: User[]): TeamAnalytics {
  const members = players.filter((player) => player.teamId === team.id);
  const challengeAttempts = members.reduce((sum, player) => sum + player.metrics.challengeAttempts, 0);
  const challengeSolves = members.reduce((sum, player) => sum + player.metrics.challengeSolves, 0);
  return {
    team,
    members,
    avgXp: Math.round(average(members.map((player) => player.metrics.xp))),
    completion: Math.round(average(members.map(completionPercent))),
    accuracy: Math.round(average(members.map((player) => accuracyScore(player.metrics)))),
    fidelity: Math.round(average(members.map((player) => fidelityScore(player.metrics)))),
    commandCount: members.reduce((sum, player) => sum + player.metrics.commandsRun, 0),
    challengeSuccess: challengeAttempts ? Math.round((challengeSolves / challengeAttempts) * 100) : 0,
  };
}

function localizedDate(timestamp: number, lang: Lang) {
  return new Date(timestamp).toLocaleString(lang === "el" ? "el-GR" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function activeDuration(seconds: number, lang: Lang) {
  const minutes = Math.floor(Math.max(0, seconds) / 60);
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return lang === "en" ? `${hours}h ${remainingMinutes}m` : `${hours}ω ${remainingMinutes}λ`;
}

function campaignName(campaignId: string, lang: Lang) {
  const campaign = LEARNING_PATHS.find((item) => item.id === campaignId);
  return campaign ? bi(campaign.title, lang) : campaignId || "—";
}

function moduleName(campaignId: string, moduleId: string, lang: Lang) {
  const campaign = LEARNING_PATHS.find((item) => item.id === campaignId);
  const module = campaign?.modules.find((item) => item.id === moduleId)
    || ALL_MODULES.find((item) => item.id === moduleId);
  return module ? bi(module.title, lang) : moduleId || "—";
}

function MetricCard({
  label,
  value,
  detail,
  icon,
  tone = "ember",
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: string;
  tone?: "ember" | "cyan" | "violet" | "green";
}) {
  return (
    <article className={`educator-stat educator-stat--${tone}`}>
      <span className="educator-stat__icon"><Icon name={icon} className="h-5 w-5" /></span>
      <div className="min-w-0">
        <div className="educator-stat__label">{label}</div>
        <strong>{value}</strong>
        <small>{detail}</small>
      </div>
    </article>
  );
}

function ChartCard({ title, eyebrow, children, className = "" }: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`educator-card educator-chart-card ${className}`}>
      <header className="educator-card__header">
        <div>
          {eyebrow && <div className="educator-eyebrow">{eyebrow}</div>}
          <h2>{title}</h2>
        </div>
      </header>
      {children}
    </section>
  );
}

export default function EducatorDashboard({
  user,
  lang,
  onProfile,
}: {
  user: User;
  lang: Lang;
  onProfile: (id: string) => void;
}) {
  const [activeTab, setActiveTab] = useState<EducatorTab>("overview");
  const [teamFilter, setTeamFilter] = useState("all");
  const [selectedPlayerIds, setSelectedPlayerIds] = useState<string[] | null>(null);
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[] | null>(null);
  const [playerSearch, setPlayerSearch] = useState("");
  const [commandPlayerFilter, setCommandPlayerFilter] = useState("all");
  const [commandSearch, setCommandSearch] = useState("");
  const [selectedCommandId, setSelectedCommandId] = useState<string | null>(null);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDescription, setNewTeamDescription] = useState("");
  const [teamFeedback, setTeamFeedback] = useState("");
  const [assignTargets, setAssignTargets] = useState<Record<string, string>>({});

  const players = allPlayers();
  const scoreboard = overallScoreboard();
  const teams = teamsForEducator(user.id);
  const applications = pendingTeamApplications(user.id);
  const tickets = ticketsFor(user).filter((ticket) => ticket.status === "open");
  const allCommands = commandExecutions();
  const filteredPlayers = players.filter((player) => {
    if (teamFilter === "unassigned") return !player.teamId;
    if (teamFilter === "all") return true;
    return player.teamId === teamFilter;
  });
  const scopedPlayerIds = new Set(filteredPlayers.map((player) => player.id));
  const scopedCommands = allCommands.filter((entry) => scopedPlayerIds.has(entry.userId));
  const onlineCount = filteredPlayers.filter((player) => isOnline(player)).length;
  const avgXp = Math.round(average(filteredPlayers.map((player) => player.metrics.xp)));
  const avgCompletion = Math.round(average(filteredPlayers.map(completionPercent)));
  const avgAccuracy = Math.round(average(filteredPlayers.map((player) => accuracyScore(player.metrics))));
  const avgFidelity = Math.round(average(filteredPlayers.map((player) => fidelityScore(player.metrics))));
  const commandCount = filteredPlayers.reduce((sum, player) => sum + player.metrics.commandsRun, 0);
  const filteredScoreboard = scoreboard.filter(({ user: player }) => scopedPlayerIds.has(player.id));
  const teamStats = teams.map((team) => teamAnalytics(team, players));
  const unassignedPlayers = players.filter((player) => !player.teamId);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const commandErrors = scopedCommands.filter((entry) => entry.exitCode !== 0).length;
  const commandsToday = scopedCommands.filter((entry) => entry.ts >= todayStart.getTime()).length;
  const commandPlayer = (playerId: string) => players.find((player) => player.id === playerId);

  const defaultPlayerIds = filteredScoreboard.slice(0, 3).map((entry) => entry.user.id);
  const comparedPlayerIds = (selectedPlayerIds ?? defaultPlayerIds).filter((id) => filteredPlayers.some((player) => player.id === id));
  const comparedPlayers = comparedPlayerIds.map((id) => players.find((player) => player.id === id)).filter((player): player is User => !!player);
  const maxXp = Math.max(1, ...filteredPlayers.map((player) => player.metrics.xp));
  const playerRadarMetrics = [
    { key: "xp", label: "XP" },
    { key: "completion", label: t("completion", lang) },
    { key: "accuracy", label: t("accuracy", lang) },
    { key: "fidelity", label: t("fidelity", lang) },
    { key: "challenge", label: t("challengeSuccess", lang) },
    { key: "streak", label: t("learningStreak", lang) },
  ];
  const playerRadarData = playerRadarMetrics.map((metric) => {
    const row: Record<string, string | number> = { metric: metric.label };
    comparedPlayers.forEach((player) => {
      const value = metric.key === "xp" ? Math.round((player.metrics.xp / maxXp) * 100)
        : metric.key === "completion" ? completionPercent(player)
          : metric.key === "accuracy" ? accuracyScore(player.metrics)
            : metric.key === "fidelity" ? fidelityScore(player.metrics)
              : metric.key === "challenge" ? player.metrics.challengeAttempts
                ? Math.round((player.metrics.challengeSolves / player.metrics.challengeAttempts) * 100) : 0
                : Math.min(100, Math.round((player.metrics.streakDays / 14) * 100));
      row[player.id] = value;
    });
    return row;
  });
  const maxTeamXp = Math.max(1, ...teamStats.map((stat) => stat.avgXp));
  const maxTeamActivity = Math.max(1, ...teamStats.map((stat) => stat.commandCount));
  const defaultTeamIds = teamStats.slice(0, 3).map((stat) => stat.team.id);
  const comparedTeamIds = selectedTeamIds ?? defaultTeamIds;
  const comparedTeams = teamStats.filter((stat) => comparedTeamIds.includes(stat.team.id));
  const teamRadarMetrics = [
    { key: "xp", label: t("averageXp", lang) },
    { key: "completion", label: t("completion", lang) },
    { key: "accuracy", label: t("accuracy", lang) },
    { key: "fidelity", label: t("fidelity", lang) },
    { key: "activity", label: t("cliCommands", lang) },
    { key: "challenge", label: t("challengeSuccess", lang) },
  ];
  const teamRadarData = teamRadarMetrics.map((metric) => {
    const row: Record<string, string | number> = { metric: metric.label };
    comparedTeams.forEach((stat) => {
      row[stat.team.id] = metric.key === "xp" ? Math.round((stat.avgXp / maxTeamXp) * 100)
        : metric.key === "activity" ? Math.round((stat.commandCount / maxTeamActivity) * 100)
          : metric.key === "challenge" ? stat.challengeSuccess
            : stat[metric.key as keyof TeamAnalytics] as number;
    });
    return row;
  });
  const scatterData = filteredPlayers.map((player) => ({
    id: player.id,
    name: player.displayName,
    team: teams.find((team) => team.id === player.teamId)?.name || t("unassigned", lang),
    xp: player.metrics.xp,
    completion: completionPercent(player),
    commands: player.metrics.commandsRun,
  }));
  const xpBars = filteredScoreboard.slice(0, 12).map(({ user: player, rank }) => ({
    id: player.id,
    name: player.displayName,
    rank,
    xp: player.metrics.xp,
  }));
  const commandLogs = useMemo(() => {
    const query = commandSearch.trim().toLowerCase();
    return scopedCommands.filter((entry) => {
      if (commandPlayerFilter !== "all" && entry.userId !== commandPlayerFilter) return false;
      if (!query) return true;
      const playerName = commandPlayer(entry.userId)?.displayName || "";
      return `${entry.command} ${playerName} ${entry.moduleId} ${entry.campaignId}`.toLowerCase().includes(query);
    });
  }, [scopedCommands, commandPlayerFilter, commandSearch, players]);
  const matchingPlayers = players.filter((player) => {
    const query = playerSearch.trim().toLowerCase();
    if (query && !`${player.displayName} ${player.username} ${player.id}`.toLowerCase().includes(query)) return false;
    return filteredPlayers.some((item) => item.id === player.id);
  });
  const selectedCommand = selectedCommandId ? allCommands.find((entry) => entry.id === selectedCommandId) || null : null;
  const selectedCommandPlayer = selectedCommand ? commandPlayer(selectedCommand.userId) : undefined;
  const totalTickets = tickets.length;

  useEffect(() => {
    if (!selectedCommand) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedCommandId(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [selectedCommand]);

  const togglePlayerCompare = (playerId: string) => {
    const current = selectedPlayerIds ?? defaultPlayerIds;
    setSelectedPlayerIds(current.includes(playerId)
      ? current.filter((id) => id !== playerId)
      : current.length < 3 ? [...current, playerId] : [...current.slice(1), playerId]);
  };

  const toggleTeamCompare = (teamId: string) => {
    const current = selectedTeamIds ?? defaultTeamIds;
    setSelectedTeamIds(current.includes(teamId)
      ? current.filter((id) => id !== teamId)
      : current.length < 3 ? [...current, teamId] : [...current.slice(1), teamId]);
  };

  const submitTeam = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const created = createTeam(user.id, newTeamName, newTeamDescription);
    if (!created) {
      setTeamFeedback(t("teamNameRequired", lang));
      return;
    }
    setTeamFeedback(t("teamCreated", lang));
    setNewTeamName("");
    setNewTeamDescription("");
  };

  const assignMember = (teamId: string) => {
    const playerId = assignTargets[teamId];
    if (!playerId || !assignPlayerToTeam(user.id, playerId, teamId)) return;
    setAssignTargets((targets) => ({ ...targets, [teamId]: "" }));
  };

  const reviewApplication = (applicationId: string, accept: boolean) => {
    const changed = reviewTeamApplication(user.id, applicationId, accept);
    if (!changed && accept) setTeamFeedback(t("alreadyInTeam", lang));
    else setTeamFeedback("");
  };

  const tabs: { id: EducatorTab; icon: string; label: string }[] = [
    { id: "overview", icon: "chart", label: t("overview", lang) },
    { id: "players", icon: "users", label: t("playerAnalytics", lang) },
    { id: "teams", icon: "shield", label: t("teamManagement", lang) },
    { id: "commands", icon: "terminal", label: t("commandActivity", lang) },
  ];

  return (
    <div className="educator-dashboard">
      <header className="educator-dashboard__hero">
        <div>
          <div className="educator-eyebrow">{uppercaseLabel(t("researchWorkspace", lang), lang)}</div>
          <h1>{t("educator", lang)} <span>{lang === "en" ? "Research" : "Έρευνα"}</span></h1>
          <p>{t("researchSubtitle", lang)}</p>
        </div>
        <div className="educator-dashboard__hero-mark"><Icon name="chart" className="h-6 w-6" /><span>HF / LAB</span></div>
      </header>

      <div className="educator-dashboard__toolbar">
        <nav className="educator-tabs" aria-label={t("researchWorkspace", lang)}>
          {tabs.map((tab) => (
            <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={activeTab === tab.id ? "is-active" : ""} aria-current={activeTab === tab.id ? "page" : undefined}>
              <Icon name={tab.icon} className="h-4 w-4" />{tab.label}
              {tab.id === "teams" && applications.length > 0 && <span className="educator-tabs__badge">{applications.length}</span>}
            </button>
          ))}
        </nav>
        <label className="educator-scope">
          <span>{t("assignedTeam", lang)}</span>
          <select value={teamFilter} onChange={(event) => { setTeamFilter(event.target.value); setSelectedPlayerIds(null); }}>
            <option value="all">{t("allTeams", lang)}</option>
            <option value="unassigned">{t("unassigned", lang)}</option>
            {teams.map((team) => <option key={team.id} value={team.id}>{team.name}</option>)}
          </select>
        </label>
      </div>

      {activeTab === "overview" && (
        <div className="educator-dashboard__content">
          <section className="educator-stat-grid" aria-label={t("playerStatistics", lang)}>
            <MetricCard label={t("totalPlayers", lang)} value={filteredPlayers.length} detail={`${onlineCount} ${t("activeNow", lang).toLowerCase()}`} icon="users" tone="cyan" />
            <MetricCard label={t("averageXp", lang)} value={avgXp.toLocaleString()} detail={t("overallScoreboard", lang)} icon="spark" tone="ember" />
            <MetricCard label={t("completion", lang)} value={`${avgCompletion}%`} detail={t("progress", lang)} icon="target" tone="green" />
            <MetricCard label={t("averageAccuracy", lang)} value={`${avgAccuracy}%`} detail={`${t("averageFidelity", lang)} ${avgFidelity}%`} icon="check" tone="violet" />
            <MetricCard label={t("cliCommands", lang)} value={commandCount.toLocaleString()} detail={`${scopedCommands.length} ${t("recentExecutions", lang).toLowerCase()}`} icon="terminal" tone="cyan" />
            <MetricCard label={t("pendingApplications", lang)} value={applications.length} detail={`${teams.length} ${t("teamCount", lang).toLowerCase()}`} icon="users" tone="ember" />
          </section>

          <div className="educator-dashboard__overview-grid">
            <section className="educator-card educator-mvp">
              <header className="educator-card__header">
                <div><div className="educator-eyebrow">{uppercaseLabel(t("leaderboard", lang), lang)}</div><h2>{t("mvpSpotlight", lang)}</h2></div>
                <span className="educator-card__header-icon is-gold"><Icon name="crown" className="h-5 w-5" /></span>
              </header>
              {filteredScoreboard.slice(0, 5).map(({ user: player, rank }) => (
                <button key={player.id} type="button" className={`educator-mvp__row${rank === 1 ? " is-first" : ""}`} onClick={() => onProfile(player.id)}>
                  <span className="educator-mvp__rank">{rank === 1 ? <Icon name="crown" className="h-4 w-4" /> : `#${rank}`}</span>
                  <Avatar src={player.avatar} name={player.displayName} size={34} />
                  <span className="educator-mvp__name"><strong>{player.displayName}</strong><small>{teams.find((team) => team.id === player.teamId)?.name || t("unassigned", lang)}</small></span>
                  <span className="educator-mvp__xp">{player.metrics.xp.toLocaleString()} <small>XP</small></span>
                </button>
              ))}
              {filteredScoreboard.length === 0 && <p className="educator-empty">{t("noPlayers", lang)}</p>}
              <button type="button" className="educator-link-button" onClick={() => setActiveTab("players")}>
                {t("playerAnalytics", lang)} <Icon name="chevron" className="h-4 w-4" />
              </button>
            </section>

            <ChartCard title={t("progressActivityScatter", lang)} eyebrow="SCATTER / XP × PROGRESS">
              <div className="educator-chart educator-chart--tall">
                {scatterData.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 14, right: 20, bottom: 8, left: 0 }}>
                      <CartesianGrid stroke="#29292f" strokeDasharray="3 3" />
                      <XAxis type="number" dataKey="completion" name={t("completion", lang)} unit="%" domain={[0, 100]} stroke="#777780" tick={{ fill: "#909099", fontSize: 10 }} />
                      <YAxis type="number" dataKey="xp" name="XP" stroke="#777780" tick={{ fill: "#909099", fontSize: 10 }} />
                      <ZAxis type="number" dataKey="commands" range={[55, 420]} name={t("commandsPerPlayer", lang)} />
                      <Tooltip cursor={{ strokeDasharray: "3 3", stroke: "#5b5b65" }} contentStyle={TOOLTIP_STYLE} formatter={(value, name) => [value, name]} />
                      <Scatter name={t("player", lang)} data={scatterData} fill="#fb8043" fillOpacity={0.82} />
                    </ScatterChart>
                  </ResponsiveContainer>
                ) : <div className="educator-chart-empty">{t("noPlayers", lang)}</div>}
              </div>
              <div className="educator-chart-caption"><span><i className="is-ember" />{t("player", lang)}</span><span>{t("commandsPerPlayer", lang)} · bubble size</span></div>
            </ChartCard>
          </div>

          <div className="educator-dashboard__overview-grid">
            <ChartCard title={t("xpByPlayer", lang)} eyebrow="BAR / EXPERIENCE">
              <div className="educator-chart educator-chart--bar">
                {xpBars.length ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={xpBars} margin={{ top: 8, right: 8, bottom: 32, left: 0 }}>
                      <CartesianGrid stroke="#29292f" vertical={false} />
                      <XAxis dataKey="name" stroke="#777780" tick={{ fill: "#a0a0a8", fontSize: 10 }} interval={0} angle={-18} textAnchor="end" height={48} />
                      <YAxis stroke="#777780" tick={{ fill: "#909099", fontSize: 10 }} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(value) => [`${value} XP`, t("averageXp", lang)]} />
                      <Bar dataKey="xp" name="XP" fill="#fb8043" radius={[6, 6, 0, 0]} maxBarSize={42} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : <div className="educator-chart-empty">{t("noPlayers", lang)}</div>}
              </div>
            </ChartCard>

            <section className="educator-card educator-activity-card">
              <header className="educator-card__header">
                <div><div className="educator-eyebrow">{uppercaseLabel(t("liveFeed", lang), lang)}</div><h2>{t("liveFeed", lang)}</h2></div>
                <span className="educator-live-dot" />
              </header>
              <div className="educator-activity-card__feed"><LiveFeed /></div>
              <div className="educator-ticket-note"><Icon name="ticket" className="h-4 w-4" />{totalTickets} {t("tickets", lang).toLowerCase()} {t("open", lang).toLowerCase()}</div>
            </section>
          </div>

          {teamStats.length > 0 && (
            <ChartCard title={t("teamProgressComparison", lang)} eyebrow="TEAM / PROGRESS & OUTCOMES">
              <div className="educator-chart educator-chart--team">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={teamStats} margin={{ top: 8, right: 12, bottom: 28, left: 0 }}>
                    <CartesianGrid stroke="#29292f" vertical={false} />
                    <XAxis dataKey={(item: TeamAnalytics) => item.team.name} stroke="#777780" tick={{ fill: "#a0a0a8", fontSize: 10 }} interval={0} angle={-8} textAnchor="end" height={42} />
                    <YAxis domain={[0, 100]} stroke="#777780" tick={{ fill: "#909099", fontSize: 10 }} unit="%" />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend />
                    <Bar dataKey="completion" name={t("completion", lang)} fill="#3ddc84" radius={[5, 5, 0, 0]} />
                    <Bar dataKey="accuracy" name={t("accuracy", lang)} fill="#22d3ee" radius={[5, 5, 0, 0]} />
                    <Bar dataKey="fidelity" name={t("fidelity", lang)} fill="#a78bfa" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          )}
        </div>
      )}

      {activeTab === "players" && (
        <div className="educator-dashboard__content">
          <section className="educator-card educator-comparison-card">
            <header className="educator-card__header">
              <div><div className="educator-eyebrow">{uppercaseLabel(t("playerAnalytics", lang), lang)}</div><h2>{t("comparePlayers", lang)}</h2><p>{t("selectUpToThree", lang)}</p></div>
              <span className="educator-card__header-icon is-cyan"><Icon name="radar" className="h-5 w-5" /></span>
            </header>
            <div className="educator-compare-picks">
              {filteredPlayers.map((player) => (
                <label key={player.id} className="educator-compare-pick">
                  <input type="checkbox" checked={comparedPlayerIds.includes(player.id)} onChange={() => togglePlayerCompare(player.id)} />
                  <Avatar src={player.avatar} name={player.displayName} size={27} />
                  <span>{player.displayName}</span>
                </label>
              ))}
            </div>
            <div className="educator-chart educator-chart--radar">
              {comparedPlayers.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={playerRadarData} outerRadius="70%">
                    <PolarGrid stroke="#35353c" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: "#b4b4bd", fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#777780", fontSize: 9 }} />
                    {comparedPlayers.map((player, index) => (
                      <Radar key={player.id} name={player.displayName} dataKey={player.id} stroke={CHART_COLORS[index % CHART_COLORS.length]} fill={CHART_COLORS[index % CHART_COLORS.length]} fillOpacity={0.11} strokeWidth={2} />
                    ))}
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              ) : <div className="educator-chart-empty">{t("selectUpToThree", lang)}</div>}
            </div>
          </section>

          <section className="educator-card educator-player-list">
            <header className="educator-card__header educator-player-list__header">
              <div><div className="educator-eyebrow">{uppercaseLabel(t("overallScoreboard", lang), lang)}</div><h2>{t("playerAnalytics", lang)}</h2></div>
              <label className="educator-search"><Icon name="radar" className="h-4 w-4" /><input value={playerSearch} onChange={(event) => setPlayerSearch(event.target.value)} placeholder={t("commandSearch", lang)} /></label>
            </header>
            <div className="educator-table-scroll">
              <table className="educator-table">
                <thead><tr>
                  <th>{t("position", lang)}</th><th>{t("player", lang)}</th><th>{t("assignedTeam", lang)}</th><th>{t("level", lang)}</th><th>XP</th><th>{t("progress", lang)}</th><th>{t("accuracy", lang)}</th><th>{t("fidelity", lang)}</th><th>{t("cliCommands", lang)}</th><th>{t("challenges", lang)}</th><th>{t("hintsUsed", lang)}</th><th>{t("timeActive", lang)}</th><th>{t("learningStreak", lang)}</th><th>{t("profile", lang)}</th>
                </tr></thead>
                <tbody>
                  {matchingPlayers.sort((a, b) => b.metrics.xp - a.metrics.xp).map((player, index) => {
                    const team = teams.find((item) => item.id === player.teamId);
                    const totalRank = scoreboard.find((entry) => entry.user.id === player.id)?.rank;
                    const level = levelFromXp(player.metrics.xp).level;
                    return (
                      <tr key={player.id}>
                        <td className="educator-table__rank">#{totalRank ?? index + 1}</td>
                        <td><div className="educator-table__player"><Avatar src={player.avatar} name={player.displayName} size={31} /><span><strong>{player.displayName}</strong><small>{isOnline(player) ? t("online", lang) : t("offline", lang)}</small></span></div></td>
                        <td>{team?.name || t("unassigned", lang)}</td>
                        <td>{level}</td>
                        <td className="is-ember">{player.metrics.xp.toLocaleString()}</td>
                        <td>{completedModuleCount(player)}/{TOTAL_MODULES} · {completionPercent(player)}%</td>
                        <td>{accuracyScore(player.metrics)}%</td>
                        <td>{fidelityScore(player.metrics)}%</td>
                        <td>{player.metrics.commandsRun}</td>
                        <td>{player.metrics.challengeSolves}/{player.metrics.challengeAttempts}</td>
                        <td>{player.metrics.hintsUsed}</td>
                        <td>{activeDuration(player.metrics.secondsActive, lang)}</td>
                        <td>{player.metrics.streakDays}d</td>
                        <td><div className="educator-table__actions">
                          <button type="button" onClick={() => onProfile(player.id)}>{t("profile", lang)}</button>
                          <button type="button" onClick={() => { setCommandPlayerFilter(player.id); setActiveTab("commands"); }}>{t("openCommands", lang)}</button>
                        </div></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {matchingPlayers.length === 0 && <div className="educator-empty educator-empty--padded">{t("noPlayers", lang)}</div>}
            </div>
          </section>
        </div>
      )}

      {activeTab === "teams" && (
        <div className="educator-dashboard__content">
          <section className="educator-card educator-create-team">
            <header className="educator-card__header">
              <div><div className="educator-eyebrow">{uppercaseLabel(t("teamDesign", lang), lang)}</div><h2>{t("createTeam", lang)}</h2></div>
              <span className="educator-card__header-icon is-green"><Icon name="plus" className="h-5 w-5" /></span>
            </header>
            <form className="educator-team-form" onSubmit={submitTeam}>
              <label><span>{t("teamName", lang)}</span><input value={newTeamName} onChange={(event) => setNewTeamName(event.target.value)} maxLength={40} required placeholder={t("teamNameExample", lang)} /></label>
              <label><span>{t("teamDescription", lang)}</span><input value={newTeamDescription} onChange={(event) => setNewTeamDescription(event.target.value)} maxLength={180} placeholder={t("teamDescription", lang)} /></label>
              <button type="submit" className="educator-primary-button dashboard-action"><Icon name="plus" className="h-4 w-4" />{t("createTeam", lang)}</button>
            </form>
            {teamFeedback && <p className="educator-form-feedback" role="status">{teamFeedback}</p>}
          </section>

          <section className="educator-card educator-requests">
            <header className="educator-card__header">
              <div><div className="educator-eyebrow">{uppercaseLabel(t("pendingApplications", lang), lang)}</div><h2>{t("teamApplications", lang)}</h2></div>
              <span className="educator-card__header-icon is-amber"><Icon name="users" className="h-5 w-5" /></span>
            </header>
            {applications.length ? (
              <div className="educator-request-list">
                {applications.map(({ application, player, team }) => (
                  <article className="educator-request" key={application.id}>
                    <Avatar src={player.avatar} name={player.displayName} size={38} />
                    <div className="min-w-0 flex-1"><strong>{player.displayName}</strong><p>{team.name} · {localizedDate(application.requestedAt, lang)}</p></div>
                    <button type="button" onClick={() => reviewApplication(application.id, false)} className="educator-request__decline dashboard-action">{t("declineRequest", lang)}</button>
                    <button type="button" onClick={() => reviewApplication(application.id, true)} className="educator-request__accept dashboard-action">{t("acceptRequest", lang)}</button>
                  </article>
                ))}
              </div>
            ) : <p className="educator-empty">{t("noPendingApplications", lang)}</p>}
          </section>

          <section className="educator-team-grid">
            {teamStats.map((stat) => (
              <article key={stat.team.id} className="educator-card educator-team-card">
                <header className="educator-team-card__header">
                  <span className="educator-card__header-icon is-cyan"><Icon name="shield" className="h-5 w-5" /></span>
                  <div className="min-w-0 flex-1"><h2>{stat.team.name}</h2><p>{stat.team.description || t("researchSubtitle", lang)}</p></div>
                  <span className="educator-team-card__members">{stat.members.length} {t("memberCount", lang)}</span>
                </header>
                <div className="educator-team-card__metrics">
                  <span><small>{t("averageXp", lang)}</small><strong>{stat.avgXp.toLocaleString()}</strong></span>
                  <span><small>{t("completion", lang)}</small><strong>{stat.completion}%</strong></span>
                  <span><small>{t("cliCommands", lang)}</small><strong>{stat.commandCount}</strong></span>
                </div>
                <div className="educator-team-card__roster-label">{uppercaseLabel(t("teamMembers", lang), lang)}</div>
                <div className="educator-team-card__roster">
                  {stat.members.map((member) => (
                    <div key={member.id} className="educator-team-member">
                      <Avatar src={member.avatar} name={member.displayName} size={29} />
                      <span className="min-w-0 flex-1"><strong>{member.displayName}</strong><small>{member.metrics.xp.toLocaleString()} XP · {completionPercent(member)}%</small></span>
                      <button type="button" aria-label={`${t("removeFromTeam", lang)}: ${member.displayName}`} title={t("removeFromTeam", lang)} onClick={() => assignPlayerToTeam(user.id, member.id, null)}><Icon name="close" className="h-4 w-4" /></button>
                    </div>
                  ))}
                  {stat.members.length === 0 && <p className="educator-empty">{t("noPlayers", lang)}</p>}
                </div>
                <div className="educator-team-card__assign">
                  <select value={assignTargets[stat.team.id] || ""} onChange={(event) => setAssignTargets((targets) => ({ ...targets, [stat.team.id]: event.target.value }))} disabled={unassignedPlayers.length === 0}>
                    <option value="">{unassignedPlayers.length ? t("choosePlayer", lang) : t("noUnassignedPlayers", lang)}</option>
                    {unassignedPlayers.map((player) => <option key={player.id} value={player.id}>{player.displayName}</option>)}
                  </select>
                  <button type="button" onClick={() => assignMember(stat.team.id)} disabled={!assignTargets[stat.team.id]} className="educator-primary-button dashboard-action"><Icon name="plus" className="h-4 w-4" />{t("addToTeam", lang)}</button>
                </div>
              </article>
            ))}
            {teamStats.length === 0 && <div className="educator-card educator-empty educator-empty--padded">{t("noTeamsAvailable", lang)}</div>}
          </section>

          {teamStats.length > 0 && (
            <div className="educator-dashboard__overview-grid">
              <ChartCard title={t("teamProgressComparison", lang)} eyebrow="BAR / COMPLETION · ACCURACY · FIDELITY">
                <div className="educator-chart educator-chart--team">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={teamStats} margin={{ top: 8, right: 12, bottom: 30, left: 0 }}>
                      <CartesianGrid stroke="#29292f" vertical={false} />
                      <XAxis dataKey={(item: TeamAnalytics) => item.team.name} stroke="#777780" tick={{ fill: "#a0a0a8", fontSize: 10 }} interval={0} angle={-8} textAnchor="end" height={42} />
                      <YAxis domain={[0, 100]} stroke="#777780" tick={{ fill: "#909099", fontSize: 10 }} unit="%" />
                      <Tooltip contentStyle={TOOLTIP_STYLE} /><Legend />
                      <Bar dataKey="completion" name={t("completion", lang)} fill="#3ddc84" radius={[5, 5, 0, 0]} />
                      <Bar dataKey="accuracy" name={t("accuracy", lang)} fill="#22d3ee" radius={[5, 5, 0, 0]} />
                      <Bar dataKey="fidelity" name={t("fidelity", lang)} fill="#a78bfa" radius={[5, 5, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <section className="educator-card educator-comparison-card">
                <header className="educator-card__header"><div><div className="educator-eyebrow">{uppercaseLabel(t("teamComparison", lang), lang)}</div><h2>{t("spiderProfile", lang)}</h2></div><span className="educator-card__header-icon is-violet"><Icon name="radar" className="h-5 w-5" /></span></header>
                <div className="educator-compare-picks educator-compare-picks--teams">
                  {teamStats.map((stat) => <label key={stat.team.id} className="educator-compare-pick"><input type="checkbox" checked={comparedTeamIds.includes(stat.team.id)} onChange={() => toggleTeamCompare(stat.team.id)} /><span>{stat.team.name}</span></label>)}
                </div>
                <div className="educator-chart educator-chart--radar">
                  {comparedTeams.length ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={teamRadarData} outerRadius="68%">
                        <PolarGrid stroke="#35353c" /><PolarAngleAxis dataKey="metric" tick={{ fill: "#b4b4bd", fontSize: 10 }} /><PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#777780", fontSize: 9 }} />
                        {comparedTeams.map((stat, index) => <Radar key={stat.team.id} name={stat.team.name} dataKey={stat.team.id} stroke={CHART_COLORS[index % CHART_COLORS.length]} fill={CHART_COLORS[index % CHART_COLORS.length]} fillOpacity={0.1} strokeWidth={2} />)}
                        <Tooltip contentStyle={TOOLTIP_STYLE} /><Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  ) : <div className="educator-chart-empty">{t("noTeamsAvailable", lang)}</div>}
                </div>
              </section>
            </div>
          )}
        </div>
      )}

      {activeTab === "commands" && (
        <div className="educator-dashboard__content">
          <section className="educator-stat-grid educator-stat-grid--compact">
            <MetricCard label={t("cliCommands", lang)} value={scopedCommands.length} detail={t("recentExecutions", lang)} icon="terminal" tone="cyan" />
            <MetricCard label={t("commandsPerPlayer", lang)} value={filteredPlayers.length ? Math.round(scopedCommands.length / filteredPlayers.length) : 0} detail={t("totalPlayers", lang)} icon="users" tone="ember" />
            <MetricCard label={t("exitCode", lang)} value={commandErrors} detail={lang === "en" ? "non-zero results" : "μη μηδενικά αποτελέσματα"} icon="warning" tone="violet" />
            <MetricCard label={t("executedAt", lang)} value={commandsToday} detail={lang === "en" ? "today" : "σήμερα"} icon="radar" tone="green" />
          </section>

          <section className="educator-card educator-command-log">
            <header className="educator-card__header educator-command-log__header">
              <div><div className="educator-eyebrow">{uppercaseLabel(t("commandActivity", lang), lang)}</div><h2>{t("recentExecutions", lang)}</h2></div>
              <span className="educator-card__header-icon is-cyan"><Icon name="terminal" className="h-5 w-5" /></span>
            </header>
            <div className="educator-command-filters">
              <label className="educator-command-filter"><span>{t("filterByPlayer", lang)}</span><select value={commandPlayerFilter} onChange={(event) => setCommandPlayerFilter(event.target.value)}><option value="all">{t("allPlayers", lang)}</option>{filteredPlayers.map((player) => <option key={player.id} value={player.id}>{player.displayName}</option>)}</select></label>
              <label className="educator-search"><Icon name="radar" className="h-4 w-4" /><input value={commandSearch} onChange={(event) => setCommandSearch(event.target.value)} placeholder={t("commandSearch", lang)} /></label>
              <span className="educator-command-filters__count">{commandLogs.length} / {scopedCommands.length}</span>
            </div>
            <p className="educator-command-log__privacy">{t("redactedSecrets", lang)}</p>
            <div className="educator-table-scroll educator-command-table-scroll">
              <table className="educator-table educator-command-table">
                <thead><tr><th>{t("executedAt", lang)}</th><th>{t("player", lang)}</th><th>{t("command", lang)}</th><th>{t("module", lang)}</th><th>{t("exitCode", lang)}</th><th>{t("typed", lang)} / {t("pasted", lang)}</th><th></th></tr></thead>
                <tbody>
                  {commandLogs.slice(0, 200).map((entry) => {
                    const player = commandPlayer(entry.userId);
                    return (
                      <tr key={entry.id}>
                        <td>{localizedDate(entry.ts, lang)}</td>
                        <td><button type="button" className="educator-table__inline-link" onClick={() => player && onProfile(player.id)}>{player?.displayName || entry.userId}</button></td>
                        <td><code className="educator-command-inline">{entry.command}</code></td>
                        <td>{moduleName(entry.campaignId, entry.moduleId, lang)}</td>
                        <td><span className={`educator-exit-code${entry.exitCode === 0 ? " is-success" : " is-error"}`}>{entry.exitCode}</span></td>
                        <td>{entry.pasted ? t("pasted", lang) : t("typed", lang)}</td>
                        <td><button type="button" className="educator-table__details dashboard-action" onClick={() => setSelectedCommandId(entry.id)}>{t("viewDetails", lang)}</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {commandLogs.length === 0 && <div className="educator-empty educator-empty--padded">{t("noCommandExecutions", lang)}</div>}
            </div>
            {commandLogs.length > 200 && <p className="educator-command-log__footnote">{t("showingRecentExecutions", lang)}</p>}
          </section>
        </div>
      )}

      {selectedCommand && (
        <div className="dashboard-modal-backdrop educator-command-modal" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedCommandId(null); }}>
          <section className="educator-command-detail dashboard-modal-surface" role="dialog" aria-modal="true" aria-labelledby="educator-command-title">
            <header className="educator-command-detail__header">
              <div><div className="educator-eyebrow">{t("commandActivity", lang)}</div><h2 id="educator-command-title">{t("viewDetails", lang)}</h2></div>
              <button type="button" onClick={() => setSelectedCommandId(null)} aria-label={t("close", lang)} className="educator-command-detail__close dashboard-action"><Icon name="close" className="h-4 w-4" /></button>
            </header>
            <div className="educator-command-detail__body">
              <div className="educator-command-detail__player"><Avatar src={selectedCommandPlayer?.avatar} name={selectedCommandPlayer?.displayName || selectedCommand.userId} size={40} /><span><strong>{selectedCommandPlayer?.displayName || selectedCommand.userId}</strong><small>{localizedDate(selectedCommand.ts, lang)}</small></span></div>
              <div className="educator-command-detail__grid">
                <span><small>{t("campaign", lang)}</small><strong>{campaignName(selectedCommand.campaignId, lang)}</strong></span>
                <span><small>{t("module", lang)}</small><strong>{moduleName(selectedCommand.campaignId, selectedCommand.moduleId, lang)}</strong></span>
                <span><small>{t("workingDirectory", lang)}</small><strong><code>{selectedCommand.cwd}</code></strong></span>
                <span><small>{t("exitCode", lang)}</small><strong className={selectedCommand.exitCode === 0 ? "is-success" : "is-error"}>{selectedCommand.exitCode}</strong></span>
                <span><small>{t("command", lang)}</small><strong><code>{selectedCommand.command}</code></strong></span>
                <span><small>{t("typed", lang)} / {t("pasted", lang)}</small><strong>{selectedCommand.pasted ? t("pasted", lang) : t("typed", lang)}{selectedCommand.typo ? " · 127" : ""}</strong></span>
              </div>
              <div className="educator-command-detail__output-heading">{t("output", lang)}</div>
              <pre className="educator-command-detail__output">{selectedCommand.output || "(no output)"}</pre>
              {selectedCommand.outputTruncated && <p className="educator-command-log__footnote">{t("outputTruncated", lang)}</p>}
              <p className="educator-command-log__privacy">{t("redactedSecrets", lang)}</p>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
