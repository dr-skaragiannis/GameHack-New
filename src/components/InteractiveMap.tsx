import { useEffect, useMemo, useRef, useState } from "react";
import { CAMPAIGNS, type Campaign, type Module } from "../data/lessons";
import {
  allPlayers,
  isOnline,
  subscribeDB,
  userById,
  type User,
} from "../lib/db";
import { bi, t, type Lang } from "../i18n";
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

  const started = CAMPAIGNS.map((campaign) => {
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

  const firstCampaign = CAMPAIGNS[0];
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
}: {
  lang: Lang;
  user: User;
  onOpen: (campaignId: string, moduleId: string) => void;
  embedded?: boolean;
}) {
  const [revision, setRevision] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [filter, setFilter] = useState<PlayerFilter>("all");
  const [playerMenuOpen, setPlayerMenuOpen] = useState(false);
  const [focusedPlayerId, setFocusedPlayerId] = useState<string | null>(null);
  const playerMenu = useRef<HTMLDivElement>(null);

  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(CAMPAIGNS.map((campaign) => [campaign.id, false]))
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
          <div className="map-eyebrow">{t("map", lang)}</div>
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
                            {bi(campaign.title, lang)} <span>·</span> {bi(module.title, lang)}
                          </span>
                        </span>
                        <span className={cn("map-presence-label", entry.online ? "is-online" : "is-offline")}>
                          {entry.online ? t("online", lang) : t("offline", lang)}
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
        campaigns={CAMPAIGNS}
        locations={visibleLocations}
        viewer={liveViewer}
        lang={lang}
        collapsed={collapsed}
        focusedPlayerId={focusedPlayerId}
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
  onToggle,
  onOpen,
}: {
  campaigns: Campaign[];
  locations: { player: User; campaignId: string; moduleId: string; online: boolean }[];
  viewer: User;
  lang: Lang;
  collapsed: Record<string, boolean>;
  focusedPlayerId: string | null;
  onToggle: (campaignId: string) => void;
  onOpen: (campaignId: string, moduleId: string) => void;
}) {
  const width = 1600;
  const height = 1120;
  const core = { x: 800, y: 545 };
  const routeLayouts: Record<string, { hub: { x: number; y: number }; nodes: { x: number; y: number }[] }> = {
    forge: {
      hub: { x: 470, y: 265 },
      nodes: [
        { x: 135, y: 200 }, { x: 280, y: 105 }, { x: 450, y: 95 },
        { x: 620, y: 135 }, { x: 735, y: 245 }, { x: 700, y: 380 },
        { x: 550, y: 430 }, { x: 380, y: 410 }, { x: 235, y: 335 },
      ],
    },
    raven: {
      hub: { x: 1115, y: 290 },
      nodes: [
        { x: 1010, y: 125 }, { x: 1190, y: 105 },
        { x: 1380, y: 190 }, { x: 1355, y: 410 },
      ],
    },
    wirewalk: {
      hub: { x: 1115, y: 695 },
      nodes: [
        { x: 1000, y: 510 }, { x: 1210, y: 525 }, { x: 1390, y: 665 },
      ],
    },
    sudorun: {
      hub: { x: 470, y: 690 },
      nodes: [
        { x: 125, y: 825 }, { x: 315, y: 825 }, { x: 505, y: 825 },
        { x: 695, y: 825 }, { x: 885, y: 825 }, { x: 1075, y: 825 },
        { x: 1265, y: 825 }, { x: 1455, y: 825 }, { x: 1455, y: 1010 },
        { x: 1265, y: 1010 }, { x: 1075, y: 1010 }, { x: 885, y: 1010 },
        { x: 695, y: 1010 },
      ],
    },
    "dfir-fieldwork": {
      hub: { x: 355, y: 830 },
      nodes: [
        { x: 520, y: 880 }, { x: 640, y: 760 }, { x: 760, y: 880 },
        { x: 880, y: 760 }, { x: 1000, y: 880 }, { x: 1120, y: 760 },
        { x: 1240, y: 880 }, { x: 1360, y: 760 }, { x: 1470, y: 880 },
        { x: 1450, y: 1015 },
      ],
    },
  };
  const lanes = campaigns.map((campaign, campaignIndex) => {
    const ordered = orderedModules(campaign);
    const layout = routeLayouts[campaign.id] || { hub: { x: 800, y: 300 + campaignIndex * 150 }, nodes: [] };
    const modules = ordered.map((module, index) => ({
      x: layout.nodes[index]?.x ?? layout.hub.x + 160 + index * 150,
      y: layout.nodes[index]?.y ?? layout.hub.y,
      module,
      state: progressState(module, index, ordered, viewer.progress),
    }));
    return {
      campaign,
      ordered,
      hub: layout.hub,
      modules,
      campaignIndex,
      isCollapsed: !!collapsed[campaign.id],
    };
  });

  const curveBetween = (from: { x: number; y: number }, to: { x: number; y: number }, radius = 34) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.max(1, Math.hypot(dx, dy));
    const sx = from.x + (dx / distance) * radius;
    const sy = from.y + (dy / distance) * radius;
    const ex = to.x - (dx / distance) * radius;
    const ey = to.y - (dy / distance) * radius;
    const bend = dx * 0.38;
    return `M ${sx} ${sy} C ${sx + bend} ${sy + dy * 0.08}, ${ex - bend} ${ey - dy * 0.08}, ${ex} ${ey}`;
  };

  return (
    <div className="map-universe-scroll" aria-label={t("mapCampaigns", lang)}>
      <div className="map-universe" style={{ width, height }}>
        <div className="map-universe-stars" />
        <svg className="map-universe-svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <radialGradient id="map-core-gradient">
              <stop offset="0%" stopColor="#ff8a4c" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#ff6a2b" stopOpacity="0" />
            </radialGradient>
          </defs>
          {lanes.map(({ campaign, hub, modules, isCollapsed, campaignIndex }) => {
            const accent = campaign.scenario === "raven" ? "raven" : campaign.scenario === "ssh" ? "wirewalk" : campaign.scenario === "sudorun" ? "sudorun" : campaign.scenario === "dfir" ? "dfir" : "forge";
            const routeNodes = isCollapsed ? [] : modules;
            const routePoints = [
              { ...hub, state: "open", id: `hub-${campaign.id}` },
              ...routeNodes.map((node) => ({ x: node.x, y: node.y, state: node.state, id: node.module.id })),
            ];
            const branch = curveBetween(core, hub, 42);
            return (
              <g key={`route-${campaign.id}`} className={`map-path-group map-path-group--${accent}`}>
                <path d={branch} className="map-network-branch" />
                <path d={branch} className="map-network-energy" style={{ animationDelay: `${campaignIndex * -0.8}s` }} />
                {routePoints.slice(0, -1).map((point, index) => {
                  const next = routePoints[index + 1];
                  const d = curveBetween(point, next, 35);
                  const done = point.state === "done";
                  const active = point.id === viewer.activeModuleId && campaign.id === viewer.activeCampaignId;
                  return (
                    <g key={`${campaign.id}-${point.id}-${next.id}`}>
                      <path d={d} className="map-route-underlay" />
                      <path d={d} className={cn("map-route-segment", done && "is-done", active && "is-current")} />
                      <path d={d} className="map-route-energy" style={{ animationDelay: `${(index % 5) * -0.72}s` }} />
                    </g>
                  );
                })}
              </g>
            );
          })}
          <circle cx={core.x} cy={core.y} r="76" fill="url(#map-core-gradient)" />
          {lanes.map(({ hub, campaign }, index) => (
            <circle key={`pulse-${campaign.id}`} cx={hub.x} cy={hub.y} r="17" className={`map-hub-signal map-hub-signal--${index}`} />
          ))}
        </svg>

        <div className="map-network-core" style={{ left: core.x - 30, top: core.y - 30 }} aria-hidden="true">
          <span className="map-core-orbit map-core-orbit--outer" />
          <span className="map-core-orbit map-core-orbit--inner" />
          <span className="map-core-center"><Icon name="hammer" className="h-5 w-5" /></span>
          <span className="map-core-label">HACKFORGE<br />NETWORK</span>
        </div>

        {lanes.map(({ campaign, ordered, hub, modules, campaignIndex, isCollapsed }) => {
          const completed = ordered.filter((module) => viewer.progress[module.id]?.completed).length;
          const percent = Math.round((completed / Math.max(1, ordered.length)) * 100);
          const routePlayers = locations.filter((entry) => entry.campaignId === campaign.id);
          const routeOnline = routePlayers.filter((entry) => entry.online).length;
          const accent = campaign.scenario === "raven" ? "raven" : campaign.scenario === "ssh" ? "wirewalk" : campaign.scenario === "sudorun" ? "sudorun" : campaign.scenario === "dfir" ? "dfir" : "forge";
          return (
            <div key={campaign.id} className={cn("map-universe-lane", `map-universe-lane--${accent}`, `map-universe-lane-enter-${campaignIndex + 1}`)}>
              <button
                type="button"
                className="map-campaign-card"
                aria-expanded={!isCollapsed}
                aria-label={`${isCollapsed ? t("mapExpand", lang) : t("mapCollapse", lang)}: ${bi(campaign.title, lang)}`}
                onClick={() => onToggle(campaign.id)}
                style={{ left: hub.x - 137, top: hub.y }}
              >
                <span className="map-campaign-card__icon"><Icon name={campaign.scenario === "raven" ? "crown" : campaign.scenario === "ssh" ? "key" : campaign.scenario === "dfir" ? "shield" : "terminal"} className="h-5 w-5" /></span>
                <span className="map-campaign-card__copy">
                  <span className="map-campaign-card__kicker">{campaign.scenario === "sudorun" ? "LINUX FOR BEGINNERS" : campaign.scenario === "raven" ? "CTF CAMPAIGN" : campaign.scenario === "ssh" ? "SSH CAMPAIGN" : campaign.scenario === "dfir" ? "INCIDENT RESPONSE" : "FOUNDATION CAMPAIGN"}</span>
                  <span className="map-campaign-card__name">{bi(campaign.title, lang)}</span>
                  <span className="map-campaign-card__progress">{completed}/{ordered.length} labs <i>·</i> {percent}%</span>
                  <span className="map-campaign-card__bar"><i style={{ width: `${percent}%` }} /></span>
                </span>
                <span className="map-campaign-card__presence"><i className="map-status-dot is-online" />{routeOnline}<i className="map-status-dot is-offline" />{routePlayers.length - routeOnline}</span>
                <Icon name="chevron" className={cn("map-campaign-card__chevron h-4 w-4", !isCollapsed && "is-open")} />
              </button>

              <button
                type="button"
                className={cn("map-campaign-hub", `map-campaign-hub--${accent}`, isCollapsed && "is-collapsed")}
                aria-label={`${bi(campaign.title, lang)} ${isCollapsed ? t("mapExpand", lang) : t("mapCollapse", lang)}`}
                title={`${bi(campaign.title, lang)} · ${completed}/${ordered.length}`}
                onClick={() => onToggle(campaign.id)}
                style={{ left: hub.x, top: hub.y }}
              >
                <span className="map-hub-aura" />
                <span className="map-hub-icon"><Icon name={campaign.scenario === "raven" ? "crown" : campaign.scenario === "ssh" ? "key" : campaign.scenario === "dfir" ? "shield" : "terminal"} className="h-5 w-5" /></span>
                <span className="map-hub-label">{isCollapsed ? `${ordered.length} LABS` : "ROUTE"}</span>
              </button>

              {!isCollapsed && modules.map(({ x, y, module, state }, index) => {
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
                    style={{ left: x, top: y, width: 134 }}
                  >
                    <button
                      type="button"
                      disabled={!clickable}
                      aria-label={`${bi(module.title, lang)} — ${stateText}${current ? ` — ${t("mapYourPosition", lang)}` : ""}`}
                      title={clickable ? `${bi(module.title, lang)} · ${stateText}` : t("moduleLocked", lang)}
                      className={cn("map-node-button", `is-${state}`, current && "is-viewer-node")}
                      onClick={() => clickable && onOpen(campaign.id, module.id)}
                    >
                      {state === "done" ? <Icon name="check" className="h-6 w-6" /> : <Icon name={state === "locked" ? "lock" : MODULE_ICON[module.id] || module.icon} className="h-6 w-6" />}
                      <span className="map-node-progress">{percentDone}%</span>
                    </button>
                    <button type="button" disabled={!clickable} className="map-node-label" onClick={() => clickable && onOpen(campaign.id, module.id)}>
                      <span className="map-node-label__state">{stateText}</span>
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
                            title={`${entry.player.displayName} · ${entry.online ? t("online", lang) : t("offline", lang)} · ${bi(module.title, lang)}`}
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
                <button type="button" className="map-collapsed-route" onClick={() => onToggle(campaign.id)} style={{ left: hub.x + 78, top: hub.y + 57 }}>
                  <span className="map-collapsed-route__dots">{ordered.slice(0, 8).map((module) => <i key={module.id} className={viewer.progress[module.id]?.completed ? "is-complete" : ""} />)}</span>
                  <span>{t("mapExpand", lang)} · {ordered.length} labs</span>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}