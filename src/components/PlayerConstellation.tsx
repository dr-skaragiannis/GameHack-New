import { useEffect, useMemo, useRef, useState } from "react";
import { LEARNING_PATHS, moduleById } from "../data/lessons";
import {
  getFeed,
  isOnline,
  levelFromXp,
  overallScoreboard,
  subscribeDB,
  type FeedEvent,
  type User,
} from "../lib/db";
import { bi, t, uppercaseLabel, type Lang } from "../i18n";
import { cn } from "../utils/cn";
import Avatar from "./Avatar";
import Icon from "./Icon";

type PlayerFilter = "all" | "online" | "offline" | "top10";
type RankDelta = { direction: "up" | "down"; places: number; token: number };
type PlayerEntry = { user: User; rank: number; online: boolean; x: number; y: number };
type GraphLink = { from: PlayerEntry; to: PlayerEntry; online: boolean; index: number };

const MAX_VISIBLE_PLAYERS = 32;

function arrangePlayers(players: { user: User; rank: number; online: boolean }[], compact: boolean, top10: boolean): PlayerEntry[] {
  if (!players.length) return [];
  const columns = Math.min(compact ? (top10 ? 5 : 4) : 8, players.length);
  const rows = Math.ceil(players.length / columns);
  return players.map((player, index) => {
    const row = Math.floor(index / columns);
    const firstInRow = row * columns;
    const rowLength = Math.min(columns, players.length - firstInRow);
    const column = index - firstInRow;
    const x = compact
      ? (rowLength === 1 ? 50 : (top10 ? 12 : 13) + (column * (top10 ? 76 : 74)) / (rowLength - 1))
      : (rowLength === 1 ? 50 : 8.5 + (column * 83) / (rowLength - 1));
    const y = compact
      ? (rows === 1 ? 67 : (top10 ? 50 + row * 32 : 48 + row * 36))
      : (rows === 1 ? 64 : 38 + (row * 43) / (rows - 1));
    const jitterX = Math.sin(index * 2.17) * (compact ? 0.7 : 1.1);
    const jitterY = Math.cos(index * 1.43) * (compact ? 0.8 : 1.5);
    return { ...player, x: x + jitterX, y: y + jitterY };
  });
}

function buildLinks(players: PlayerEntry[]): GraphLink[] {
  const seen = new Set<string>();
  const links: GraphLink[] = [];
  for (const player of players) {
    const closest = players
      .filter((candidate) => candidate.user.id !== player.user.id)
      .map((candidate) => ({
        candidate,
        distance: (candidate.x - player.x) ** 2 + (candidate.y - player.y) ** 2,
      }))
      .sort((a, b) => a.distance - b.distance)
      .slice(0, Math.min(2, Math.max(0, players.length - 1)));
    for (const { candidate } of closest) {
      const key = [player.user.id, candidate.user.id].sort().join(":");
      if (seen.has(key)) continue;
      seen.add(key);
      links.push({ from: player, to: candidate, online: player.online && candidate.online, index: links.length });
    }
  }
  return links;
}

function makeRankMessage(delta: RankDelta, lang: Lang, isSelf: boolean) {
  if (lang === "en") {
    const subject = isSelf ? "You" : "A player";
    const place = delta.places === 1 ? "place" : "places";
    return `${subject} moved ${delta.direction} ${delta.places} ${place} in the rankings`;
  }
  const subject = isSelf
    ? (delta.direction === "up" ? "Ανέβηκες" : "Έπεσες")
    : "Άλλαξε θέση παίκτη";
  return `${subject} ${delta.direction === "up" ? "↑" : "↓"} ${delta.places} ${delta.places === 1 ? "θέση" : "θέσεις"} στην κατάταξη`;
}

function relativeTime(ts: number, lang: Lang) {
  const seconds = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (seconds < 60) return lang === "en" ? `${seconds}s ago` : `πριν από ${seconds} δευτ.`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return lang === "en" ? `${minutes}m ago` : `πριν από ${minutes} λεπ.`;
  const hours = Math.floor(minutes / 60);
  return lang === "en" ? `${hours}h ago` : `πριν από ${hours} ώρ.`;
}

function objectiveLabel(event: FeedEvent, lang: Lang) {
  if (!event.moduleId || !event.objectiveId) return event.text;
  const objective = moduleById(event.moduleId)?.tasks.find((task) => task.id === event.objectiveId);
  return objective ? bi(objective.instruction, lang) : event.text;
}

export default function PlayerConstellation({ user, lang, compact = false }: { user: User; lang: Lang; compact?: boolean }) {
  const [revision, setRevision] = useState(0);
  const [filter, setFilter] = useState<PlayerFilter>("all");
  const [interestFilter, setInterestFilter] = useState<string | null>(null);
  const [interestOpen, setInterestOpen] = useState(false);
  const [rankDeltas, setRankDeltas] = useState<Record<string, RankDelta>>({});
  const [rankAnnouncement, setRankAnnouncement] = useState("");
  const previousRanks = useRef<Map<string, number> | null>(null);
  const rankTimer = useRef<number | null>(null);
  const rankToken = useRef(0);

  useEffect(() => {
    const unsubscribe = subscribeDB(() => setRevision((value) => value + 1));
    const presenceTimer = window.setInterval(() => setRevision((value) => value + 1), 12_000);
    return () => {
      unsubscribe();
      window.clearInterval(presenceTimer);
    };
  }, []);

  useEffect(() => () => {
    if (rankTimer.current !== null) window.clearTimeout(rankTimer.current);
  }, []);

  useEffect(() => {
    if (!interestOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setInterestOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [interestOpen]);

  const ranked = useMemo(() => overallScoreboard().map(({ user: player, rank }) => ({
    user: player,
    rank,
    online: isOnline(player),
  })), [revision]);
  const rankSignature = ranked.map(({ user: player, rank }) => `${player.id}:${rank}:${player.metrics.xp}`).join("|");

  useEffect(() => {
    const nextRanks = new Map(ranked.map(({ user: player, rank }) => [player.id, rank]));
    const oldRanks = previousRanks.current;
    previousRanks.current = nextRanks;
    if (!oldRanks) return;

    const changes: { id: string; delta: RankDelta }[] = [];
    for (const [id, nextRank] of nextRanks) {
      const oldRank = oldRanks.get(id);
      if (oldRank === undefined || oldRank === nextRank) continue;
      changes.push({
        id,
        delta: {
          direction: nextRank < oldRank ? "up" : "down",
          places: Math.abs(oldRank - nextRank),
          token: ++rankToken.current,
        },
      });
    }
    if (!changes.length) return;

    const deltas = Object.fromEntries(changes.map(({ id, delta }) => [id, delta]));
    setRankDeltas(deltas);
    const selfChange = changes.find(({ id }) => id === user.id);
    const announcement = selfChange
      ? makeRankMessage(selfChange.delta, lang, true)
      : lang === "en"
        ? `${changes.length} players shifted in the rankings`
        : `Άλλαξαν θέση ${changes.length} παίκτες στην κατάταξη`;
    setRankAnnouncement(announcement);
    if (rankTimer.current !== null) window.clearTimeout(rankTimer.current);
    rankTimer.current = window.setTimeout(() => {
      setRankDeltas({});
      setRankAnnouncement("");
      rankTimer.current = null;
    }, 1000);
  // rankSignature is the stable snapshot of every player's rank and XP.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rankSignature, lang, user.id]);

  const now = Date.now();
  const onlineCount = ranked.filter((player) => player.online).length;
  const filteredPlayers = ranked.filter(({ user: player, rank, online }) => {
    if (filter === "online" && !online) return false;
    if (filter === "offline" && online) return false;
    if (filter === "top10" && rank > 10) return false;
    if (interestFilter && !player.interests.includes(interestFilter)) return false;
    return true;
  });
  const visibleLimit = compact ? (filter === "top10" ? 10 : 8) : (filter === "top10" ? 10 : MAX_VISIBLE_PLAYERS);
  const visiblePlayers = filteredPlayers.slice(0, visibleLimit);
  const graphPlayers = useMemo(() => arrangePlayers(visiblePlayers, compact, compact && filter === "top10"), [visiblePlayers, compact, filter]);
  const links = useMemo(() => buildLinks(graphPlayers), [graphPlayers]);
  const feed = useMemo(() => getFeed().slice().sort((a, b) => b.ts - a.ts), [revision]);
  const allInterests = useMemo(() => [...new Set(ranked.flatMap(({ user: player }) => player.interests))].sort((a, b) => a.localeCompare(b)), [ranked]);

  const broadcast = feed.find((event) => event.kind === "broadcast");
  const completedPath = feed.find((event) => event.kind === "module" && event.pathCompleted);
  const path = completedPath?.campaignId ? LEARNING_PATHS.find((campaign) => campaign.id === completedPath.campaignId) : undefined;
  const events = [
    broadcast && {
      id: broadcast.id,
      kind: "broadcast" as const,
      author: broadcast.username,
      text: broadcast.text,
      ts: broadcast.ts,
    },
    completedPath && {
      id: completedPath.id,
      kind: "path" as const,
      author: completedPath.username,
      text: path ? bi(path.title, lang) : (lang === "en" ? "A learning path has been completed" : "Ολοκληρώθηκε μια διαδρομή μάθησης"),
      ts: completedPath.ts,
    },
  ].filter((event): event is NonNullable<typeof event> => !!event).sort((a, b) => a.ts - b.ts);

  const recentObjectives = feed
    .filter((event) => event.kind === "task" && event.objectiveId)
    .slice(0, compact ? 2 : 5)
    .map((event) => {
      const player = ranked.find(({ user: candidate }) => candidate.id === event.userId)?.user;
      return {
        event,
        playerName: player?.displayName || event.username,
        level: levelFromXp(player?.metrics.xp || 0).level,
        objective: objectiveLabel(event, lang),
      };
    });

  const filters: { id: PlayerFilter; label: string; icon: string; count?: number }[] = [
    { id: "all", label: lang === "en" ? "All" : "Όλοι", icon: "users", count: ranked.length },
    { id: "online", label: t("online", lang), icon: "wifi", count: onlineCount },
    { id: "offline", label: t("offline", lang), icon: "user", count: ranked.length - onlineCount },
    { id: "top10", label: t("constellationTop10", lang), icon: "crown", count: Math.min(10, ranked.length) },
  ];
  const shownRange = visiblePlayers.length < filteredPlayers.length
    ? `${visiblePlayers.length} / ${filteredPlayers.length} · ${ranked.length} ${t("constellationTotal", lang)}`
    : `${visiblePlayers.length} / ${ranked.length}`;

  return (
    <section className={cn("player-constellation player-dashboard__card", compact && "player-constellation--compact", compact && filter === "top10" && "player-constellation--top10")} aria-labelledby="player-constellation-title">
      <header className="player-constellation__header">
        <div className="player-constellation__title-group">
          <span className="player-constellation__title-icon"><Icon name="radar" className="h-5 w-5" /></span>
          <div>
            <div className="player-dashboard__eyebrow">{uppercaseLabel(t("constellationEyebrow", lang), lang)}</div>
            <h2 id="player-constellation-title">{t("playerConstellation", lang)}</h2>
            <p>{t("constellationSubtitle", lang)}</p>
          </div>
        </div>
        <div className="player-constellation__header-status">
          <span className="player-constellation__online-count"><i />{onlineCount} {t("online", lang)}</span>
          <span className="player-constellation__player-count">{ranked.length} {t("constellationPlayers", lang)}</span>
        </div>
      </header>

      <div className="player-constellation__toolbar">
        <div className="player-constellation__filters" role="group" aria-label={t("constellationFilters", lang)}>
          {filters.map((item) => (
            <button
              key={item.id}
              type="button"
              className={cn("player-constellation__filter dashboard-action", filter === item.id && "is-active")}
              onClick={() => setFilter(item.id)}
              aria-pressed={filter === item.id}
            >
              <Icon name={item.icon} className="h-3.5 w-3.5" />
              <span>{item.label}</span>
              <small>{item.count}</small>
            </button>
          ))}
          <div className="player-constellation__interest-control">
            <button
              type="button"
              className={cn("player-constellation__filter player-constellation__interest-toggle dashboard-action", (interestOpen || interestFilter) && "is-active")}
              onClick={() => setInterestOpen((open) => !open)}
              aria-expanded={interestOpen}
              aria-haspopup="true"
            >
              <Icon name="spark" className="h-3.5 w-3.5" />
              <span>{interestFilter || t("interests", lang)}</span>
              <Icon name="chevron" className={cn("h-3 w-3 transition-transform", interestOpen && "rotate-90")} />
            </button>
            {interestOpen && (
              <div className="player-constellation__interest-menu" role="group" aria-label={t("constellationInterestFilter", lang)}>
                <div className="player-constellation__interest-menu-heading">{t("constellationInterestFilter", lang)}</div>
                <button
                  type="button"
                  className={cn("player-constellation__interest-option", !interestFilter && "is-selected")}
                  onClick={() => { setInterestFilter(null); setInterestOpen(false); }}
                  aria-pressed={!interestFilter}
                >
                  {t("constellationAnyInterest", lang)}
                  {!interestFilter && <Icon name="check" className="h-3.5 w-3.5" />}
                </button>
                {allInterests.map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    className={cn("player-constellation__interest-option", interestFilter === interest && "is-selected")}
                    onClick={() => { setInterestFilter(interestFilter === interest ? null : interest); setInterestOpen(false); }}
                    aria-pressed={interestFilter === interest}
                  >
                    <span>{interest}</span>
                    <small>{ranked.filter(({ user: player }) => player.interests.includes(interest)).length}</small>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className={cn("player-constellation__rank-update", rankAnnouncement && "is-shaking")} role="status" aria-live="polite">
          {rankAnnouncement ? (
            <><Icon name="chart" className="h-3.5 w-3.5" /><span>{rankAnnouncement}</span></>
          ) : (
            <><span className="player-constellation__signal-dot" /><span>{shownRange} {t("constellationShowing", lang)}</span></>
          )}
        </div>
      </div>

      <div className="player-constellation__viewport" onClick={(event) => {
        if (event.target === event.currentTarget) setInterestOpen(false);
      }}>
        <div className="player-constellation__stage">
          <svg className="player-constellation__svg" viewBox="0 0 1200 560" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <pattern id="player-constellation-grid" width="42" height="42" patternUnits="userSpaceOnUse">
                <path d="M 42 0 L 0 0 0 42" fill="none" stroke="rgba(114, 177, 197, 0.14)" strokeWidth="1" />
                <circle cx="0" cy="0" r="1.4" fill="rgba(119, 214, 232, 0.38)" />
              </pattern>
              <radialGradient id="player-constellation-halo">
                <stop offset="0%" stopColor="#173443" stopOpacity="0.62" />
                <stop offset="100%" stopColor="#0a0e13" stopOpacity="0" />
              </radialGradient>
              <filter id="player-constellation-glow" x="-40%" y="-40%" width="180%" height="180%">
                <feGaussianBlur stdDeviation="2.4" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>
            <rect width="1200" height="560" fill="url(#player-constellation-grid)" />
            <ellipse cx="600" cy="324" rx="520" ry="286" fill="url(#player-constellation-halo)" />
            {links.map((link) => (
              <line
                key={`${link.from.user.id}-${link.to.user.id}`}
                x1={link.from.x * 12}
                y1={link.from.y * 5.6}
                x2={link.to.x * 12}
                y2={link.to.y * 5.6}
                className={cn("player-constellation__link", link.online && "is-online")}
                style={{ animationDelay: `${(link.index % 9) * 180}ms` }}
              />
            ))}
            {graphPlayers.map((player, index) => (
              <g key={`point-${player.user.id}`} filter="url(#player-constellation-glow)">
                <circle cx={player.x * 12} cy={player.y * 5.6} r={index % 3 === 0 ? 3.6 : 2.4} className="player-constellation__point" />
                <circle cx={player.x * 12} cy={player.y * 5.6} r="10" className="player-constellation__point-halo" />
              </g>
            ))}
          </svg>

          {events.length ? (
            <div className="player-constellation__bubbles" aria-label={t("constellationSignals", lang)}>
              {events.map((event) => (
                <article key={event.id} className={cn("player-constellation__bubble", event.kind === "broadcast" ? "is-broadcast" : "is-path")}>
                  <div className="player-constellation__bubble-heading">
                    <Icon name={event.kind === "broadcast" ? "mail" : "flag"} className="h-3.5 w-3.5" />
                    <span>{uppercaseLabel(event.kind === "broadcast" ? t("broadcast", lang) : t("constellationPathComplete", lang), lang)}</span>
                    <time dateTime={new Date(event.ts).toISOString()}>{relativeTime(event.ts, lang)}</time>
                  </div>
                  <strong>{event.author}</strong>
                  <p>{event.text}</p>
                </article>
              ))}
            </div>
          ) : (
            <div className="player-constellation__idle-bubble">
              <span className="player-constellation__idle-orbit"><Icon name="wifi" className="h-4 w-4" /></span>
              <span><strong>{t("constellationAwaitingSignal", lang)}</strong><small>{t("constellationNoSignal", lang)}</small></span>
            </div>
          )}

          {graphPlayers.map((player) => {
            const delta = rankDeltas[player.user.id];
            const level = levelFromXp(player.user.metrics.xp).level;
            const status = player.online ? t("online", lang) : t("offline", lang);
            const accessibleName = lang === "en"
              ? `Rank ${player.rank}, ${player.user.displayName}, level ${level}, ${status}`
              : `Θέση ${player.rank}, ${player.user.displayName}, επίπεδο ${level}, ${status}`;
            return (
              <div
                key={player.user.id}
                role="img"
                aria-label={accessibleName}
                title={`${accessibleName} · ${player.user.metrics.xp.toLocaleString()} XP${player.user.interests.length ? ` · ${player.user.interests.join(", ")}` : ""}`}
                className={cn("player-constellation__node", player.online && "is-online", player.user.id === user.id && "is-self")}
                style={{ left: `${player.x}%`, top: `${player.y}%` }}
              >
                <div key={`${player.user.id}-${delta?.token || "stable"}`} className={cn("player-constellation__node-content", delta && "is-rank-shaking")}>
                  <span className="player-constellation__node-rank">#{String(player.rank).padStart(2, "0")}</span>
                  <div className="player-constellation__avatar-orbit">
                    {player.online && <i className="player-constellation__node-pulse" />}
                    <Avatar src={player.user.avatar} name={player.user.displayName} size={compact ? 30 : 42} className="player-constellation__avatar" />
                    <span className="player-constellation__status-dot" />
                  </div>
                  <span className="player-constellation__node-name">{player.user.displayName}</span>
                  <span className="player-constellation__node-meta">LVL {level}<i />{player.user.metrics.xp.toLocaleString()} XP</span>
                  {delta && (
                    <span className={cn("player-constellation__rank-delta", delta.direction === "up" ? "is-up" : "is-down")}>
                      <b aria-hidden="true">{delta.direction === "up" ? "↑" : "↓"}</b>{delta.places}
                    </span>
                  )}
                </div>
              </div>
            );
          })}

          {!visiblePlayers.length && (
            <div className="player-constellation__empty-state">
              <Icon name="users" className="h-6 w-6" />
              <strong>{t("mapNoPlayers", lang)}</strong>
              {interestFilter && <button type="button" onClick={() => setInterestFilter(null)}>{t("constellationClearFilter", lang)}</button>}
            </div>
          )}

          <div className="player-constellation__stage-coordinates" aria-hidden="true">
            <span>HF-NET / 01</span><span>{new Date(now).toLocaleTimeString(lang === "el" ? "el-GR" : "en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
          </div>
        </div>
        <div className="player-constellation__scroll-hint"><Icon name="chevron" className="h-3.5 w-3.5" />{t("constellationScrollHint", lang)}<Icon name="chevron" className="h-3.5 w-3.5" /></div>
      </div>

      <footer className="player-constellation__objectives">
        <div className="player-constellation__objectives-heading">
          <div>
            <span className="player-dashboard__eyebrow">{uppercaseLabel(t("constellationObjectiveLog", lang), lang)}</span>
            <h3>{t("constellationRecentObjectives", lang)}</h3>
          </div>
          {recentObjectives.length > 0 && <span className="player-constellation__objective-count">{String(recentObjectives.length).padStart(2, "0")}</span>}
        </div>
        {recentObjectives.length ? (
          <div className="player-constellation__objective-strip">
            {recentObjectives.map(({ event, playerName, level: playerLevel, objective }) => (
              <article key={event.id} className="player-constellation__objective-card">
                <span className="player-constellation__objective-mark"><Icon name="check" className="h-4 w-4" /></span>
                <div className="player-constellation__objective-copy">
                  <p>{objective}</p>
                  <div><strong>{playerName}</strong><span>LVL {playerLevel}</span></div>
                </div>
                <time dateTime={new Date(event.ts).toISOString()}>{relativeTime(event.ts, lang)}</time>
              </article>
            ))}
          </div>
        ) : (
          <div className="player-constellation__objective-empty">
            <span className="player-constellation__objective-mark"><Icon name="target" className="h-4 w-4" /></span>
            <span>{t("constellationNoObjectives", lang)}</span>
          </div>
        )}
      </footer>
    </section>
  );
}
