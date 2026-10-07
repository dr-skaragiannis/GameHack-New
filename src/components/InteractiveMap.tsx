import { useEffect, useMemo, useRef, useState } from "react";
import { CAMPAIGNS, LEARNING_PATHS, type Campaign, type Module } from "../data/lessons";
import {
  allPlayers,
  isOnline,
  subscribeDB,
  userById,
  type User,
} from "../lib/db";
import { bi, t, uppercaseLabel, type Lang } from "../i18n";
import Icon, { MODULE_ICON } from "./Icon";
import Avatar from "./Avatar";
import { cn } from "../utils/cn";

type PlayerFilter = "all" | "online" | "offline";
type MapLocation = { campaignId: string; moduleId: string };

const PRESENCE_FILTERS: PlayerFilter[] = ["all", "online", "offline"];

function orderedModules(campaign: Campaign) {
  return [...campaign.modules].sort((a, b) => a.order - b.order);
}

function progressState(module: Module, index: number, ordered: Module[], progress: User["progress"]) {
  const saved = progress[module.id];
  const unlocked = index === 0 || !!progress[ordered[index - 1].id]?.completed;
  if (saved?.completed) return "done" as const;
  if (saved?.done.length) return "progress" as const;
  if (unlocked) return "open" as const;
  return "locked" as const;
}

function resolveLocation(player: User): MapLocation {
  const activeCampaign = CAMPAIGNS.find((campaign) => campaign.id === player.activeCampaignId);
  const activeModule = activeCampaign?.modules.find((module) => module.id === player.activeModuleId);

  if (activeCampaign && activeModule) {
    const ordered = orderedModules(activeCampaign);
    const currentIndex = ordered.findIndex((module) => module.id === activeModule.id);
    if (!player.progress[activeModule.id]?.completed) {
      return { campaignId: activeCampaign.id, moduleId: activeModule.id };
    }
    const next = ordered.slice(currentIndex + 1).find((module) => !player.progress[module.id]?.completed);
    return { campaignId: activeCampaign.id, moduleId: (next || ordered.at(-1) || activeModule).id };
  }

  const started = LEARNING_PATHS.map((campaign) => {
    const ordered = orderedModules(campaign);
    const touched = ordered.filter((module) => player.progress[module.id]);
    const complete = touched.filter((module) => player.progress[module.id]?.completed).length;
    const partial = touched.filter((module) => (player.progress[module.id]?.done.length || 0) > 0).length;
    return { campaign, ordered, touched, score: complete * 10 + partial };
  })
    .filter((entry) => entry.touched.length > 0)
    .sort((a, b) => b.score - a.score);

  if (started.length) {
    const { campaign, ordered } = started[0];
    const next = ordered.find((module) => !player.progress[module.id]?.completed) || ordered.at(-1);
    if (next) return { campaignId: campaign.id, moduleId: next.id };
  }

  const firstCampaign = LEARNING_PATHS[0];
  return { campaignId: firstCampaign.id, moduleId: orderedModules(firstCampaign)[0].id };
}

function modulePercent(module: Module, player: User) {
  const saved = player.progress[module.id];
  if (saved?.completed) return 100;
  return Math.min(99, Math.round(((saved?.done.length || 0) / (module.tasks.length + 2)) * 100));
}

export default function InteractiveMap({
  lang,
  user,
  onOpen,
  embedded = false,
  selectedCampaignId,
}: {
  lang: Lang;
  user: User;
  onOpen: (campaignId: string, moduleId: string) => void;
  embedded?: boolean;
  selectedCampaignId?: string;
}) {
  const [revision, setRevision] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [filter, setFilter] = useState<PlayerFilter>("all");
  const [playerMenuOpen, setPlayerMenuOpen] = useState(false);
  const [focusedPlayerId, setFocusedPlayerId] = useState<string | null>(null);
  const playerMenu = useRef<HTMLDivElement>(null);

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(LEARNING_PATHS.map((campaign) => [campaign.id, false]))
  );

  useEffect(() => {
    const unsubscribe = subscribeDB(() => setRevision((value) => value + 1));
    const timer = window.setInterval(() => setNow(Date.now()), 10_000);
    return () => {
      unsubscribe();
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!playerMenuOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!playerMenu.current?.contains(event.target as Node)) setPlayerMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPlayerMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [playerMenuOpen]);

  useEffect(() => {
    if (!selectedCampaignId || embedded) return;
    window.requestAnimationFrame(() => {
      document
        .getElementById(`map-campaign-card-${selectedCampaignId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
    });
  }, [embedded, selectedCampaignId]);

  const liveViewer = userById(user.id) || user;
  const players = useMemo(
    () => allPlayers().slice().sort((a, b) => a.displayName.localeCompare(b.displayName)),
    [now, revision, user.id]
  );
  const locations = useMemo(
    () =>
      players.map((player) => ({
        player,
        ...resolveLocation(player),
        online: isOnline(player, now),
      })),
    [players, now]
  );
  const onlineCount = locations.filter((entry) => entry.online).length;
  const visibleLocations = locations.filter((entry) =>
    filter === "all" ? true : filter === "online" ? entry.online : !entry.online
  );

  const choosePlayer = (playerId: string, location: MapLocation) => {
    setFocusedPlayerId(playerId);
    setCollapsed((value) => ({ ...value, [location.campaignId]: false }));
    setPlayerMenuOpen(false);
    window.setTimeout(() => {
      document
        .getElementById(`map-node-${location.campaignId}-${location.moduleId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    }, 80);
  };

  const toggleCampaign = (campaignId: string) => {
    setCollapsed((value) => ({ ...value, [campaignId]: !value[campaignId] }));
  };

  return (
    <section className={cn("interactive-map", embedded && "interactive-map--embedded")} aria-label={t("map", lang)}>
      <header className="interactive-map__header">
        <div className="interactive-map__title">
          <div className="map-eyebrow">{uppercaseLabel(t("map", lang), lang)}</div>
          <h2>{t("map", lang)}</h2>
          <p>{t("mapExplore", lang)}</p>
        </div>

        <div className="map-presence-toolbar">
          <span className="map-live-caption">
            <span className="map-live-indicator" />
            {t("mapUpdated", lang)}
          </span>
          <div className="map-player-menu" ref={playerMenu}>
            <button
              type="button"
              className="map-player-toggle"
              aria-expanded={playerMenuOpen}
              onClick={() => setPlayerMenuOpen((open) => !open)}
            >
              <Icon name="users" className="h-4 w-4" />
              <span>{t("mapPlayers", lang)}: {onlineCount} {t("online", lang).toLowerCase()}</span>
              <Icon name="chevron" className={cn("h-4 w-4 map-chevron", playerMenuOpen && "is-open")} />
            </button>
            {playerMenuOpen && (
              <div className="map-player-dropdown scale-in">
                <div className="map-player-filter" role="group" aria-label={t("mapPlayers", lang)}>
                  {PRESENCE_FILTERS.map((key) => {
                    const count = key === "all" ? players.length : locations.filter((entry) => key === "online" ? entry.online : !entry.online).length;
                    const label = key === "all" ? t("mapFilterAll", lang) : key === "online" ? t("mapOnlineOnly", lang) : t("mapOfflineOnly", lang);
                    return (
                      <button
                        key={key}
                        type="button"
                        aria-pressed={filter === key}
                        className={cn("map-filter-button", filter === key && "is-active", `filter-${key}`)}
                        onClick={() => setFilter(key)}
                      >
                        {label}<span>{count}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="map-player-list">
                  {visibleLocations.length === 0 && <div className="map-empty-players">{t("mapNoPlayers", lang)}</div>}
                  {visibleLocations.map((entry) => {
                    const campaign = CAMPAIGNS.find((item) => item.id === entry.campaignId)!;
                    const module = campaign.modules.find((item) => item.id === entry.moduleId)!;
                    return (
                      <button
                        key={entry.player.id}
                        type="button"
                        className={cn("map-player-row", focusedPlayerId === entry.player.id && "is-focused")}
                        onClick={() => choosePlayer(entry.player.id, entry)}
                      >
                        <span className={cn("map-player-avatar-wrap", entry.online ? "is-online" : "is-offline")}>
                          <Avatar src={entry.player.avatar} name={entry.player.displayName} size={34} />
                          <span className={cn("map-status-dot", entry.online ? "is-online" : "is-offline")} />
                        </span>
                        <span className="map-player-row__details">
                          <span className="map-player-row__name">{entry.player.displayName}</span>
                          <span className="map-player-row__location">
                            {bi(campaign.title, lang)}, {bi(module.title, lang)}
                          </span>
                        </span>
                        <span className={cn("map-presence-label", entry.online ? "is-online" : "is-offline")}>
                          {uppercaseLabel(entry.online ? t("online", lang) : t("offline", lang), lang)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      <CampaignUniverse
        campaigns={LEARNING_PATHS}
        locations={visibleLocations}
        viewer={liveViewer}
        lang={lang}
        collapsed={collapsed}
        focusedPlayerId={focusedPlayerId}
        selectedCampaignId={selectedCampaignId}
        onToggle={toggleCampaign}
        onOpen={onOpen}
      />

      <footer className="map-legend">
        <span><i className="map-status-dot is-online" />{t("online", lang)}</span>
        <span><i className="map-status-dot is-offline" />{t("offline", lang)}</span>
        <span><i className="map-legend-node is-complete"><Icon name="check" className="h-3 w-3" /></i>{t("completed", lang)}</span>
        <span><i className="map-legend-node is-locked"><Icon name="lock" className="h-3 w-3" /></i>{t("locked", lang)}</span>
        <span className="map-scroll-hint"><Icon name="share" className="h-3 w-3" />{t("mapScrollHint", lang)}</span>
      </footer>
    </section>
  );
}

function CampaignUniverse({
  campaigns,
  locations,
  viewer,
  lang,
  collapsed,
  focusedPlayerId,
  selectedCampaignId,
  onToggle,
  onOpen,
}: {
  campaigns: Campaign[];
  locations: { player: User; campaignId: string; moduleId: string; online: boolean }[];
  viewer: User;
  lang: Lang;
  collapsed: Record<string, boolean>;
  focusedPlayerId: string | null;
  selectedCampaignId?: string;
  onToggle: (campaignId: string) => void;
  onOpen: (campaignId: string, moduleId: string) => void;
}) {
  const cardCenterX = 184;
  const cardRight = 352;
  const firstNodeX = 442;
  const nodeSpacing = 168;
  const nodeWidth = 148;
  const rowHeight = 214;
  const topPadding = 28;
  const maxModules = Math.max(1, ...campaigns.map((campaign) => campaign.modules.length));
  const width = Math.max(1500, firstNodeX + (maxModules - 1) * nodeSpacing + nodeWidth / 2 + 24);
  const height = topPadding + campaigns.length * rowHeight + 28;

  const lanes = campaigns.map((campaign, campaignIndex) => {
    const ordered = orderedModules(campaign);
    const layoutY = topPadding + (campaignIndex + 0.5) * rowHeight;
    const modules = ordered.map((module, index) => ({
      x: firstNodeX + index * nodeSpacing,
      y: layoutY,
      module,
      state: progressState(module, index, ordered, viewer.progress),
    }));
    return {
      campaign,
      ordered,
      modules,
      campaignIndex,
      y: layoutY,
      isCollapsed: !!collapsed[campaign.id],
    };
  });

  const campaignAccent = (campaign: Campaign) =>
    campaign.scenario === "raven" ? "raven"
      : campaign.scenario === "ssh" ? "wirewalk"
        : campaign.scenario === "sudorun" ? "sudorun"
          : campaign.scenario === "dfir" ? "dfir" : "gamehack";
  const campaignIcon = (campaign: Campaign) =>
    campaign.scenario === "raven" ? "crown"
      : campaign.scenario === "ssh" ? "key"
        : campaign.scenario === "dfir" ? "shield" : "terminal";
  const campaignKicker = (campaign: Campaign) =>
    campaign.scenario === "sudorun" ? "LINUX FOR BEGINNERS"
      : campaign.scenario === "raven" ? "CTF CAMPAIGN"
        : campaign.scenario === "ssh" ? "SSH CAMPAIGN"
          : campaign.scenario === "dfir" ? "INCIDENT RESPONSE" : "FOUNDATION CAMPAIGN";

  return (
    <div className="map-universe-scroll" aria-label={t("mapCampaigns", lang)}>
      <div className="map-universe" style={{ width, height }}>
        <div className="map-universe-stars" />
        {lanes.map(({ campaign, campaignIndex, y }) => (
          <div
            key={`lane-backdrop-${campaign.id}`}
            className={cn("map-lane-backdrop", campaignIndex % 2 === 1 && "is-alternate", `map-lane-backdrop--${campaignAccent(campaign)}`)}
            style={{ left: 10, top: y - rowHeight / 2 + 8, width: width - 20, height: rowHeight - 16 }}
            aria-hidden="true"
          />
        ))}

        <svg className="map-universe-svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
          {lanes.map(({ campaign, modules, isCollapsed, y }) => {
            const segments: { fromX: number; toX: number; done: boolean; current: boolean; delay: number }[] = [];
            if (!isCollapsed && modules.length > 0) {
              segments.push({
                fromX: cardRight,
                toX: modules[0].x - 35,
                done: false,
                current: viewer.activeCampaignId === campaign.id && viewer.activeModuleId === modules[0].module.id,
                delay: 0,
              });
              for (let index = 0; index < modules.length - 1; index += 1) {
                const from = modules[index];
                const to = modules[index + 1];
                segments.push({
                  fromX: from.x + 35,
                  toX: to.x - 35,
                  done: from.state === "done",
                  current: viewer.activeCampaignId === campaign.id &&
                    (viewer.activeModuleId === from.module.id || viewer.activeModuleId === to.module.id),
                  delay: index + 1,
                });
              }
            }
            return (
              <g key={`route-${campaign.id}`} className={`map-path-group map-path-group--${campaignAccent(campaign)}`}>
                {segments.map((segment, index) => {
                  const d = `M ${segment.fromX} ${y} L ${segment.toX} ${y}`;
                  return (
                    <g key={`${campaign.id}-segment-${index}`}>
                      <path d={d} className="map-route-underlay" />
                      <path d={d} className={cn("map-route-segment", segment.done && "is-done", segment.current && "is-current")} />
                      <path d={d} className="map-route-energy" style={{ animationDelay: `${(segment.delay % 5) * -0.72}s` }} />
                    </g>
                  );
                })}
              </g>
            );
          })}
        </svg>

        {lanes.map(({ campaign, ordered, modules, campaignIndex, y, isCollapsed }) => {
          const completed = ordered.filter((module) => viewer.progress[module.id]?.completed).length;
          const percent = Math.round((completed / Math.max(1, ordered.length)) * 100);
          const routePlayers = locations.filter((entry) => entry.campaignId === campaign.id);
          const routeOnline = routePlayers.filter((entry) => entry.online).length;
          const accent = campaignAccent(campaign);
          const selected = selectedCampaignId === campaign.id;
          return (
            <div key={campaign.id} className={cn("map-universe-lane", `map-universe-lane--${accent}`)}>
              <button
                id={`map-campaign-card-${campaign.id}`}
                type="button"
                className={cn("map-campaign-card map-campaign-card--linear", selected && "is-selected", `map-campaign-card-enter-${campaignIndex + 1}`)}
                aria-expanded={!isCollapsed}
                aria-label={`${isCollapsed ? t("mapExpand", lang) : t("mapCollapse", lang)}: ${String(campaign.pathNumber).padStart(2, "0")}. ${bi(campaign.title, lang)}`}
                onClick={() => onToggle(campaign.id)}
                style={{ left: cardCenterX, top: y }}
              >
                <span className="map-campaign-card__icon"><Icon name={campaignIcon(campaign)} className="h-5 w-5" /></span>
                <span className="map-campaign-card__copy">
                  <span className="map-campaign-card__kicker">{campaignKicker(campaign)}</span>
                  <span className="map-campaign-card__name">{String(campaign.pathNumber).padStart(2, "0")}. {bi(campaign.title, lang)}</span>
                  <span className="map-campaign-card__progress">{completed}/{ordered.length} labs, {percent}%</span>
                  <span className="map-campaign-card__bar"><i style={{ width: `${percent}%` }} /></span>
                </span>
                <span className="map-campaign-card__presence" aria-label={`${routeOnline} online, ${routePlayers.length - routeOnline} offline`}>
                  <i className="map-status-dot is-online" />{routeOnline}
                  <i className="map-status-dot is-offline" />{routePlayers.length - routeOnline}
                </span>
                <Icon name="chevron" className={cn("map-campaign-card__chevron h-4 w-4", !isCollapsed && "is-open")} />
              </button>

              {!isCollapsed && modules.map(({ x, y: nodeY, module, state }, index) => {
                const nodePlayers = locations.filter((entry) => entry.campaignId === campaign.id && entry.moduleId === module.id);
                const current = viewer.activeCampaignId === campaign.id && viewer.activeModuleId === module.id;
                const clickable = state !== "locked";
                const shownPlayers = nodePlayers.slice(0, 2);
                const morePlayers = nodePlayers.length - shownPlayers.length;
                const percentDone = modulePercent(module, viewer);
                const stateText = state === "done" ? t("completed", lang) : state === "progress" ? t("inProgress", lang) : state === "locked" ? t("locked", lang) : t("start_module", lang);

                return (
                  <div
                    key={module.id}
                    id={`map-node-${campaign.id}-${module.id}`}
                    className={cn("map-node", `map-node--${state}`, `map-node--${accent}`, current && "is-current", `map-node-enter-${Math.min(index + 1, 8)}`)}
                    style={{ left: x, top: nodeY, width: nodeWidth }}
                  >
                    <button
                      type="button"
                      disabled={!clickable}
                      aria-label={`${bi(module.title, lang)} — ${stateText}${current ? ` — ${t("mapYourPosition", lang)}` : ""}`}
                      title={clickable ? `${bi(module.title, lang)}, ${stateText}` : t("moduleLocked", lang)}
                      className={cn("map-node-button", `is-${state}`, current && "is-viewer-node")}
                      onClick={() => clickable && onOpen(campaign.id, module.id)}
                    >
                      {state === "done" ? <Icon name="check" className="h-6 w-6" /> : <Icon name={state === "locked" ? "lock" : MODULE_ICON[module.id] || module.icon} className="h-6 w-6" />}
                      <span className="map-node-progress">{percentDone}%</span>
                    </button>
                    <button type="button" disabled={!clickable} title={bi(module.title, lang)} className="map-node-label" onClick={() => clickable && onOpen(campaign.id, module.id)}>
                      <span className="map-node-label__state">{uppercaseLabel(stateText, lang)}</span>
                      <span className="map-node-label__name">{bi(module.title, lang)}</span>
                      <span className="map-node-label__tasks">{module.tasks.length} {t("objectives", lang).toLowerCase()}</span>
                    </button>
                    {nodePlayers.length > 0 && (
                      <div className="map-node-players">
                        {shownPlayers.map((entry) => (
                          <button
                            key={entry.player.id}
                            type="button"
                            className={cn("map-player-pin", entry.online ? "is-online" : "is-offline", entry.player.id === viewer.id && "is-self", entry.player.id === focusedPlayerId && "is-focused")}
                            title={`${entry.player.displayName}, ${uppercaseLabel(entry.online ? t("online", lang) : t("offline", lang), lang)}, ${bi(module.title, lang)}`}
                            onClick={() => onOpen(campaign.id, module.id)}
                          >
                            <span className="map-pin-avatar"><Avatar src={entry.player.avatar} name={entry.player.displayName} size={22} /><i className={cn("map-status-dot", entry.online ? "is-online" : "is-offline")} /></span>
                            <span className="map-pin-name">{entry.player.displayName.split(" ")[0]}</span>
                          </button>
                        ))}
                        {morePlayers > 0 && <span className="map-more-players">+{morePlayers}</span>}
                      </div>
                    )}
                  </div>
                );
              })}

              {isCollapsed && (
                <button type="button" className="map-collapsed-route" onClick={() => onToggle(campaign.id)} style={{ left: firstNodeX, top: y }}>
                  <span className="map-collapsed-route__dots">{ordered.slice(0, 8).map((module) => <i key={module.id} className={viewer.progress[module.id]?.completed ? "is-complete" : ""} />)}</span>
                  <span>{t("mapExpand", lang)}, {ordered.length} labs</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
