import { useEffect, useRef, useState } from "react";
import { LEARNING_PATHS } from "../data/lessons";
import {
  accuracyScore,
  BADGES,
  fidelityScore,
  levelFromXp,
  overallScoreboard,
  type Badge,
  type BadgeCategory,
  type User,
} from "../lib/db";
import { bi, t, uppercaseLabel, type Lang } from "../i18n";
import Icon from "./Icon";
import LiveFeed from "./LiveFeed";
import Avatar from "./Avatar";
import { cn } from "../utils/cn";
import InteractiveMap from "./InteractiveMap";
import PlayerTeamPanel from "./PlayerTeamPanel";
import PlayerConstellation from "./PlayerConstellation";

const BADGE_CATEGORY_RANK: Record<BadgeCategory, number> = { certification: 0, achievement: 1, legacy: 2 };

function badgeCategoryLabel(category: BadgeCategory, lang: Lang) {
  if (category === "certification") return t("badgeCategoryCertification", lang);
  if (category === "achievement") return t("badgeCategoryAchievement", lang);
  return t("badgeCategoryLegacy", lang);
}

function badgeName(badge: Badge, lang: Lang) {
  return bi(badge.name, lang);
}

function badgeDesc(badge: Badge, lang: Lang) {
  return bi(badge.desc, lang);
}

function visibleBadgeEntries(earnedIds: string[]) {
  return Object.entries(BADGES)
    .filter(([id, badge]) => badge.category !== "legacy" || earnedIds.includes(id))
    .sort(([idA, badgeA], [idB, badgeB]) => {
      const byCategory = BADGE_CATEGORY_RANK[badgeA.category] - BADGE_CATEGORY_RANK[badgeB.category];
      if (byCategory) return byCategory;
      return Number(!earnedIds.includes(idA)) - Number(!earnedIds.includes(idB));
    });
}

function nextUnlockedModule(campaign: (typeof LEARNING_PATHS)[number], user: User, preferActive: boolean) {
  const ordered = [...campaign.modules].sort((a, b) => a.order - b.order);
  if (preferActive) {
    const active = ordered.find((module) => module.id === user.activeModuleId && !user.progress[module.id]?.completed);
    if (active) return active;
  }
  return ordered.find((module, index) =>
    !user.progress[module.id]?.completed &&
    (index === 0 || !!user.progress[ordered[index - 1].id]?.completed)
  ) || null;
}

function campaignIcon(campaign: (typeof LEARNING_PATHS)[number]) {
  if (campaign.id === "ssh-service") return "lock";
  if (campaign.scenario === "raven") return "crown";
  if (campaign.scenario === "ssh") return "key";
  if (campaign.scenario === "dfir") return "shield";
  if (campaign.scenario === "sudorun") return "book";
  return "terminal";
}

function DashboardMapPreview({
  user,
  lang,
  currentCampaignId,
  onExpand,
}: {
  user: User;
  lang: Lang;
  currentCampaignId: string;
  onExpand: (campaignId: string) => void;
}) {
  return (
    <section className="player-dashboard__card player-dashboard__map-panel" aria-labelledby="dashboard-map-title">
      <header className="player-dashboard__section-heading player-dashboard__map-heading">
        <div>
          <div className="player-dashboard__eyebrow">{uppercaseLabel(t("map", lang), lang)}</div>
          <h2 id="dashboard-map-title">{t("map", lang)}</h2>
        </div>
        <button
          type="button"
          className="player-dashboard__expand-map dashboard-action"
          onClick={() => onExpand(currentCampaignId)}
          aria-label={t("expandMap", lang)}
          title={t("expandMap", lang)}
        >
          <Icon name="maximize" className="h-4 w-4" />
          <span>{t("expandMap", lang)}</span>
        </button>
      </header>

      <p className="player-dashboard__map-intro">{t("mapExplore", lang)}</p>

      <div className="player-dashboard__map-routes" role="group" aria-label={t("mapCampaigns", lang)}>
        {LEARNING_PATHS.map((campaign, index) => {
          const ordered = [...campaign.modules].sort((a, b) => a.order - b.order);
          const completed = ordered.filter((module) => user.progress[module.id]?.completed).length;
          const percent = Math.round((completed / Math.max(1, ordered.length)) * 100);
          const isCurrent = campaign.id === currentCampaignId;
          return (
            <button
              key={campaign.id}
              type="button"
              className={cn("player-dashboard__map-route dashboard-action", isCurrent && "is-current")}
              onClick={() => onExpand(campaign.id)}
              aria-label={`${String(campaign.pathNumber).padStart(2, "0")}. ${bi(campaign.title, lang)} — ${completed} of ${ordered.length} modules, ${percent}%`}
            >
              <span className="player-dashboard__map-route-number">{String(campaign.pathNumber).padStart(2, "0")}</span>
              <span className="player-dashboard__map-route-copy">
                <span className="player-dashboard__map-route-title">{bi(campaign.title, lang)}</span>
                <span className="player-dashboard__map-route-meta">{completed}/{ordered.length} {t("modules", lang)}, {percent}%</span>
                <span className="player-dashboard__map-route-track" aria-hidden="true">
                  <span style={{ width: `${percent}%` }} />
                </span>
                <span className="player-dashboard__map-route-nodes" aria-hidden="true">
                  {ordered.slice(0, 8).map((module) => {
                    const progress = user.progress[module.id];
                    return (
                      <i
                        key={module.id}
                        className={cn(progress?.completed && "is-complete", !progress?.completed && !!progress?.done.length && "is-in-progress")}
                      />
                    );
                  })}
                  {ordered.length > 8 && <b>+{ordered.length - 8}</b>}
                </span>
              </span>
              <span className="player-dashboard__map-route-icon"><Icon name={campaignIcon(campaign)} className="h-4 w-4" /></span>
              {isCurrent && <span className="player-dashboard__map-current">{index + 1}</span>}
            </button>
          );
        })}
      </div>

      <button type="button" className="player-dashboard__map-open-link dashboard-action" onClick={() => onExpand(currentCampaignId)}>
        <span>{lang === "en" ? "Open interactive map" : "Άνοιγμα διαδραστικού χάρτη"}</span>
        <Icon name="chevron" className="h-4 w-4" />
      </button>
    </section>
  );
}

function DashboardMapDialog({
  user,
  lang,
  selectedCampaignId,
  onOpen,
  onProfile,
  onClose,
}: {
  user: User;
  lang: Lang;
  selectedCampaignId: string;
  onOpen: (campaignId: string, moduleId: string) => void;
  onProfile: (playerId: string) => void;
  onClose: () => void;
}) {
  const [isMinimizing, setIsMinimizing] = useState(false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsMinimizing(true);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  useEffect(() => {
    if (!isMinimizing) return;
    const timer = window.setTimeout(onClose, 190);
    return () => window.clearTimeout(timer);
  }, [isMinimizing, onClose]);

  const minimizeMap = () => setIsMinimizing(true);
  return (
    <div
      className={`dashboard-modal-backdrop player-dashboard__map-backdrop${isMinimizing ? " is-closing" : ""}`}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) minimizeMap();
      }}
    >
      <section className="player-dashboard__map-dialog dashboard-modal-surface" role="dialog" aria-modal="true" aria-labelledby="dashboard-map-dialog-title">
        <header className="player-dashboard__map-dialog-header">
          <div>
            <div className="player-dashboard__eyebrow">{uppercaseLabel(t("mapExpanded", lang), lang)}</div>
            <h2 id="dashboard-map-dialog-title">{t("map", lang)}</h2>
          </div>
          <button
            type="button"
            className="player-dashboard__icon-button dashboard-action"
            onClick={minimizeMap}
            aria-label={t("minimizeMap", lang)}
            title={t("minimizeMap", lang)}
          >
            <Icon name="minimize" className="h-4 w-4" />
          </button>
        </header>
        <div className="player-dashboard__map-dialog-body">
          <InteractiveMap
            user={user}
            lang={lang}
            onOpen={onOpen}
            onProfile={onProfile}
            selectedCampaignId={selectedCampaignId}
          />
        </div>
      </section>
    </div>
  );
}

function LeaderRow({ player, rank, selfId, lang, onProfile }: {
  player: User;
  rank: number;
  selfId: string;
  lang: Lang;
  onProfile: (playerId: string) => void;
}) {
  return (
    <button type="button" className={cn("player-dashboard__leader-row", rank === 1 && "is-mvp", player.id === selfId && "is-self")} onClick={() => onProfile(player.id)} aria-label={`${t("openProfile", lang)}: ${player.displayName}`}>
      <span className="player-dashboard__leader-rank">{rank === 1 ? <Icon name="crown" className="h-4 w-4" /> : `#${rank}`}</span>
      <Avatar src={player.avatar} name={player.displayName} size={34} />
      <span className="player-dashboard__leader-info">
        <strong>{player.displayName}</strong>
        <small>LVL {levelFromXp(player.metrics.xp).level}{player.id === selfId ? `, ${lang === "en" ? "You" : "Εσύ"}` : ""}</small>
      </span>
      <span className="player-dashboard__leader-xp">{player.metrics.xp.toLocaleString()} <small>XP</small></span>
    </button>
  );
}

function BadgesDialog({
  user,
  lang,
  onBadge,
  onClose,
}: {
  user: User;
  lang: Lang;
  onBadge: (badgeId: string) => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const entries = visibleBadgeEntries(user.badges);
  let previousCategory: BadgeCategory | null = null;

  return (
    <div
      className="dashboard-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section className="badges-dialog dashboard-modal-surface" role="dialog" aria-modal="true" aria-labelledby="badges-dialog-title">
        <header className="badges-dialog__header">
          <div>
            <div className="player-dashboard__eyebrow">{uppercaseLabel(t("earnedBadges", lang), lang)}</div>
            <h2 id="badges-dialog-title">{t("allBadges", lang)} ({user.badges.length}/{entries.length})</h2>
          </div>
          <button
            type="button"
            className="player-dashboard__icon-button dashboard-action"
            onClick={onClose}
            aria-label={t("close", lang)}
            title={t("close", lang)}
          >
            <Icon name="close" className="h-4 w-4" />
          </button>
        </header>
        <div className="badges-dialog__grid">
          {entries.map(([id, badge]) => {
            const earned = user.badges.includes(id);
            const showCategory = badge.category !== previousCategory;
            previousCategory = badge.category;
            const heading = showCategory ? (
              <div key={`${badge.category}-heading`} className="badges-dialog__category">
                {uppercaseLabel(badgeCategoryLabel(badge.category, lang), lang)}
              </div>
            ) : null;
            if (!earned) {
              return (
                <div key={id} className="badges-dialog__group">
                  {heading}
                  <div className="badges-dialog__item is-locked" title={`${badgeName(badge, lang)} — ${badgeDesc(badge, lang)}`}>
                    <span className="badges-dialog__medallion">
                      <Icon name={badge.icon} className="h-5 w-5" />
                      <i className="badges-dialog__lock"><Icon name="lock" className="h-3 w-3" /></i>
                    </span>
                    <span className="badges-dialog__copy">
                      <strong>{badgeName(badge, lang)}</strong>
                      <small>{badgeDesc(badge, lang)}</small>
                    </span>
                    <span className="badges-dialog__state">{uppercaseLabel(t("locked", lang), lang)}</span>
                  </div>
                </div>
              );
            }
            return (
              <div key={id} className="badges-dialog__group">
                {heading}
                <button
                  type="button"
                  data-tier={badge.tier}
                  className="badges-dialog__item dashboard-action"
                  title={`${badgeName(badge, lang)} — ${badgeDesc(badge, lang)}`}
                  aria-label={`${badgeName(badge, lang)}. ${badgeDesc(badge, lang)}`}
                  onClick={() => {
                    onBadge(id);
                    onClose();
                  }}
                >
                  <span className="badges-dialog__medallion"><Icon name={badge.icon} className="h-5 w-5" /></span>
                  <span className="badges-dialog__copy">
                    <strong>{badgeName(badge, lang)}</strong>
                    <small>{badgeDesc(badge, lang)}</small>
                  </span>
                  <Icon name="chevron" className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default function PlayerDashboard({
  user,
  lang,
  onOpen,
  onCampaign,
  onOpenScoreboard,
  onBadge,
  onProfile,
}: {
  user: User;
  lang: Lang;
  onOpen: (cid: string, mid: string) => void;
  onCampaign: (campaignId: string) => void;
  onOpenScoreboard: () => void;
  onBadge: (badgeId: string) => void;
  onProfile: (playerId: string) => void;
}) {
  const [mapExpanded, setMapExpanded] = useState(false);
  const [badgesOpen, setBadgesOpen] = useState(false);
  const lv = levelFromXp(user.metrics.xp);
  const allMods = LEARNING_PATHS.flatMap((campaign) => campaign.modules);
  const completedModules = allMods.filter((module) => user.progress[module.id]?.completed).length;
  const scoreboard = overallScoreboard();
  const myStanding = scoreboard.find((entry) => entry.user.id === user.id);
  const mvpEntries = scoreboard.slice(0, 10);
  const scoreboardListRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const list = scoreboardListRef.current;
    const selfRow = list?.querySelector<HTMLElement>(".player-dashboard__leader-row.is-self");
    if (list && selfRow) {
      list.scrollTop = Math.max(0, selfRow.offsetTop - list.clientHeight / 2 + selfRow.clientHeight / 2);
    }
  }, [user.id]);

  const savedCampaign = LEARNING_PATHS.find((campaign) => campaign.id === user.activeCampaignId);
  const savedModule = savedCampaign ? nextUnlockedModule(savedCampaign, user, true) : null;
  const nextByPath = LEARNING_PATHS
    .map((campaign) => ({ campaign, module: nextUnlockedModule(campaign, user, false) }))
    .find((entry) => entry.module) || null;
  const currentCampaign = (savedModule ? savedCampaign : nextByPath?.campaign) || savedCampaign || LEARNING_PATHS[0];
  const currentModule = savedModule || (nextByPath?.campaign.id === currentCampaign.id ? nextByPath.module : null);
  const currentPathCompleted = currentCampaign.modules.filter((module) => user.progress[module.id]?.completed).length;
  const currentPathPercent = Math.round((currentPathCompleted / Math.max(1, currentCampaign.modules.length)) * 100);
  const [selectedMapCampaign, setSelectedMapCampaign] = useState(currentCampaign.id);
  const openMap = (campaignId: string) => {
    setSelectedMapCampaign(campaignId);
    setMapExpanded(true);
  };

  const stats = [
    { label: t("level", lang), value: `LVL ${lv.level}`, icon: "crown", detail: `${lv.into}/${lv.span} XP` },
    { label: t("xp", lang), value: user.metrics.xp.toLocaleString(), icon: "spark", detail: lang === "en" ? "total experience" : "συνολική εμπειρία" },
    { label: t("modules", lang), value: `${completedModules}/${allMods.length}`, icon: "flag", detail: lang === "en" ? "completed" : "ολοκληρωμένες" },
    { label: t("fidelity", lang), value: `${fidelityScore(user.metrics)}%`, icon: "check", detail: lang === "en" ? "commands typed" : "εντολές πληκτρολογημένες" },
    { label: t("accuracy", lang), value: `${accuracyScore(user.metrics)}%`, icon: "target", detail: lang === "en" ? "command accuracy" : "ακρίβεια εντολών" },
    { label: t("streak", lang), value: `${user.metrics.streakDays}`, icon: "medal", detail: `${t("days", lang)} ${lang === "en" ? "in a row" : "σερί"}` },
  ];

  return (
    <div className="player-dashboard space-y-4">
      <header className="player-dashboard__hero dashboard-enter">
        <div className="player-dashboard__hero-copy">
          <div className="player-dashboard__hero-status"><i />{uppercaseLabel(t("dashboardSession", lang), lang)}</div>
          <div className="player-dashboard__eyebrow">{uppercaseLabel(t("dashboard", lang), lang)}</div>
          <h1>
            {t("welcomeBack", lang)},<br />
            <span>{user.displayName.split(" ")[0]}</span>
          </h1>
          <p>{t("trainingReady", lang)}</p>
          <button
            type="button"
            onClick={() => onCampaign(currentCampaign.id)}
            className="player-dashboard__hero-route"
            title={`${String(currentCampaign.pathNumber).padStart(2, "0")}, ${bi(currentCampaign.title, lang)}`}
          >
            <span className="player-dashboard__hero-route-icon"><Icon name={campaignIcon(currentCampaign)} className="h-4 w-4" /></span>
            <span>
              <small>{uppercaseLabel(t("currentLearningPath", lang), lang)}</small>
              <strong>{String(currentCampaign.pathNumber).padStart(2, "0")}, {bi(currentCampaign.title, lang)}</strong>
            </span>
          </button>
        </div>

        <div className="player-dashboard__hero-level">
          <Avatar src={user.avatar} name={user.displayName} size={36} />
          <div className="player-dashboard__hero-level-copy">
            <span>{t("level", lang)} {lv.level}, {myStanding ? `#${myStanding.rank}` : t("unranked", lang)}</span>
            <strong>{user.metrics.xp.toLocaleString()} XP</strong>
            <div className="player-dashboard__hero-progress" aria-label={`${lv.pct}% to next level`}>
              <span style={{ width: `${lv.pct}%` }} />
            </div>
          </div>
        </div>

        <div className="player-dashboard__hero-strip">
          <div className="player-dashboard__hero-chips" role="list" aria-label={t("playerStatistics", lang)}>
            {stats.map((stat) => (
              <div key={stat.label} className="player-dashboard__hero-chip" role="listitem" title={`${stat.label}, ${stat.value}`}>
                <Icon name={stat.icon} className="h-4 w-4" />
                <span>
                  <strong>{stat.value}</strong>
                  <small>{uppercaseLabel(stat.label, lang)}</small>
                </span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={onOpenScoreboard}
            className="player-dashboard__hero-rank"
            title={t("overallScoreboard", lang)}
          >
            <Icon name="crown" className="h-4 w-4" />
            <span>
              <strong>{myStanding ? `#${myStanding.rank}/${scoreboard.length}` : t("unranked", lang)}</strong>
              <small>{uppercaseLabel(t("leaderboard", lang), lang)}</small>
            </span>
            <Icon name="chevron" className="h-4 w-4" />
          </button>
          <div className="player-dashboard__hero-badges">
            <span className="player-dashboard__hero-badges-label">{uppercaseLabel(t("badges", lang), lang)} ({user.badges.length})</span>
            {user.badges.length ? (
              <span className="player-dashboard__hero-medallions">
                {[...user.badges].sort((a, b) => BADGE_CATEGORY_RANK[BADGES[a]?.category || "legacy"] - BADGE_CATEGORY_RANK[BADGES[b]?.category || "legacy"]).slice(0, 5).map((id) => {
                  const badge = BADGES[id];
                  if (!badge) return null;
                  return (
                    <button
                      key={id}
                      type="button"
                      data-tier={badge.tier}
                      title={`${badgeName(badge, lang)} — ${badgeDesc(badge, lang)}`}
                      aria-label={`${badgeName(badge, lang)}. ${badgeDesc(badge, lang)}`}
                      onClick={() => onBadge(id)}
                    >
                      <Icon name={badge.icon} className="h-4 w-4" />
                    </button>
                  );
                })}
                <button
                  type="button"
                  className="player-dashboard__hero-medallions-more"
                  title={t("allBadges", lang)}
                  aria-label={`${t("badgesMore", lang)}, ${t("allBadges", lang)}`}
                  onClick={() => setBadgesOpen(true)}
                >
                  {user.badges.length > 5 ? `+${user.badges.length - 5}` : <Icon name="plus" className="h-4 w-4" />}
                </button>
              </span>
            ) : (
              <span className="player-dashboard__hero-badges-empty">
                <Icon name="medal" className="h-4 w-4" />
                {t("noBadgesYet", lang)}
                <button
                  type="button"
                  className="player-dashboard__hero-medallions-more"
                  title={t("allBadges", lang)}
                  aria-label={`${t("badgesMore", lang)}, ${t("allBadges", lang)}`}
                  onClick={() => setBadgesOpen(true)}
                >
                  {t("badgesMore", lang)}
                </button>
              </span>
            )}
          </div>
        </div>
      </header>

      <section className="player-dashboard__feed-ticker" aria-label={t("liveFeed", lang)}>
        <div className="player-dashboard__feed-ticker-label">
          <span className="ui-live-icon"><i /><Icon name="wifi" className="h-4 w-4" /></span>
          <div>
            <small>{uppercaseLabel(t("liveFeed", lang), lang)}</small>
            <strong>{t("networkActivity", lang)}</strong>
          </div>
        </div>
        <div className="player-dashboard__feed-ticker-window">
          <LiveFeed compact excludeUserId={user.id} excludeUsername={user.displayName} playersOnly lang={lang} />
        </div>
      </section>

      <div className="player-dashboard__layout">
        <div className="player-dashboard__main">
          <section className="player-dashboard__card player-dashboard__current-path" aria-labelledby="current-learning-path-title">
            <div className="player-dashboard__path-heading">
              <span className="player-dashboard__path-icon"><Icon name={campaignIcon(currentCampaign)} className="h-5 w-5" /></span>
              <div className="player-dashboard__path-copy">
                <div className="player-dashboard__eyebrow">{uppercaseLabel(t("currentLearningPath", lang), lang)}</div>
                <h2 id="current-learning-path-title">
                  <span>{String(currentCampaign.pathNumber).padStart(2, "0")}.</span> {bi(currentCampaign.title, lang)}
                </h2>
                <p>{bi(currentCampaign.subtitle, lang)}</p>
              </div>
              <div className="player-dashboard__path-percent">{currentPathPercent}%</div>
            </div>
            <div className="player-dashboard__path-progress" role="progressbar" aria-label={`${t("pathProgress", lang)}: ${currentPathPercent}%`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={currentPathPercent}>
              <span style={{ width: `${currentPathPercent}%` }} />
            </div>
            <div className="player-dashboard__path-footer">
              <div className="player-dashboard__path-next">
                {currentModule ? (
                  <>
                    <span>{t("continueLearning", lang)}</span>
                    <strong>{bi(currentModule.title, lang)}</strong>
                  </>
                ) : (
                  <>
                    <span>{t("pathCompleted", lang)}</span>
                    <strong>{currentPathCompleted}/{currentCampaign.modules.length} {t("modules", lang)}</strong>
                  </>
                )}
              </div>
              {currentModule ? (
                <button type="button" className="player-dashboard__primary-button dashboard-action" onClick={() => onOpen(currentCampaign.id, currentModule.id)}>
                  <span>{t("continueLearning", lang)}</span><Icon name="chevron" className="h-4 w-4" />
                </button>
              ) : (
                <button type="button" className="player-dashboard__secondary-button dashboard-action" onClick={() => onCampaign(currentCampaign.id)}>
                  <span>{t("reviewPath", lang)}</span><Icon name="chevron" className="h-4 w-4" />
                </button>
              )}
            </div>
          </section>

          <div className="player-dashboard__leaderboards">
            <section className="player-dashboard__card player-dashboard__mvp-card" aria-labelledby="mvp-leaderboard-title">
              <div className="player-dashboard__section-heading">
                <div>
                  <div className="player-dashboard__eyebrow">{uppercaseLabel(t("leaderboard", lang), lang)}</div>
                  <h2 id="mvp-leaderboard-title">{t("mvpLeaderboard", lang)}</h2>
                </div>
                <span className="player-dashboard__mvp-crown"><Icon name="crown" className="h-5 w-5" /></span>
              </div>
              <div className="player-dashboard__leader-list">
                {mvpEntries.map(({ user: player, rank }) => (
                  <LeaderRow key={player.id} player={player} rank={rank} selfId={user.id} lang={lang} onProfile={onProfile} />
                ))}
                {mvpEntries.length === 0 && <p className="player-dashboard__empty">{lang === "en" ? "No players on the leaderboard yet." : "Δεν υπάρχουν ακόμη παίκτες στην κατάταξη."}</p>}
              </div>
            </section>

            <section className="player-dashboard__card player-dashboard__scoreboard-card" aria-labelledby="dashboard-scoreboard-title">
              <div className="player-dashboard__section-heading">
                <div>
                  <div className="player-dashboard__eyebrow">{uppercaseLabel(t("position", lang), lang)}</div>
                  <h2 id="dashboard-scoreboard-title">{t("overallScoreboard", lang)}</h2>
                </div>
                <span className="player-dashboard__scoreboard-icon"><Icon name="chart" className="h-5 w-5" /></span>
              </div>
              <div ref={scoreboardListRef} className="player-dashboard__leader-list player-dashboard__scoreboard-list">
                {scoreboard.map(({ user: player, rank }) => (
                  <LeaderRow key={player.id} player={player} rank={rank} selfId={user.id} lang={lang} onProfile={onProfile} />
                ))}
                {scoreboard.length === 0 && <p className="player-dashboard__empty">{lang === "en" ? "No players on the leaderboard yet." : "Δεν υπάρχουν ακόμη παίκτες στην κατάταξη."}</p>}
              </div>
            </section>
          </div>

        </div>

        <aside className="player-dashboard__map-aside">
          <DashboardMapPreview
            user={user}
            lang={lang}
            currentCampaignId={currentCampaign.id}
            onExpand={openMap}
          />
          <PlayerConstellation user={user} lang={lang} compact onProfile={onProfile} />
        </aside>
      </div>

      <div className="player-dashboard__support-grid">
        <section className="player-dashboard__card player-dashboard__badges" aria-labelledby="player-badges-title">
          <div className="player-dashboard__section-heading">
            <div>
              <div className="player-dashboard__eyebrow">{uppercaseLabel(t("earnedBadges", lang), lang)}</div>
              <h2 id="player-badges-title">{t("badges", lang)}</h2>
            </div>
            <span className="player-dashboard__badge-count">{user.badges.length}</span>
          </div>
          {user.badges.length ? (
            <div className="player-dashboard__badge-grid">
              {visibleBadgeEntries(user.badges).filter(([id]) => user.badges.includes(id)).map(([id, badge], index, earned) => {
                const previous = index > 0 ? earned[index - 1][1].category : null;
                return (
                  <div key={id} className="badges-dialog__group">
                    {badge.category !== previous ? (
                      <div className="player-dashboard__badge-category">{uppercaseLabel(badgeCategoryLabel(badge.category, lang), lang)}</div>
                    ) : null}
                    <button
                      type="button"
                      className="player-dashboard__badge-card dashboard-action dashboard-stagger"
                      data-tier={badge.tier}
                      style={{ animationDelay: `${index * 45}ms` }}
                      title={`${badgeName(badge, lang)} — ${badgeDesc(badge, lang)}`}
                      aria-label={`${badgeName(badge, lang)}. ${badgeDesc(badge, lang)}. ${lang === "en" ? "Open certificate" : "Άνοιγμα πιστοποιητικού"}`}
                      onClick={() => onBadge(id)}
                    >
                      <span className="player-dashboard__badge-medallion"><Icon name={badge.icon} className="h-6 w-6" /></span>
                      <span className="player-dashboard__badge-copy">
                        <strong>{badgeName(badge, lang)}</strong>
                        <small>{badgeDesc(badge, lang)}</small>
                      </span>
                      <Icon name="chevron" className="player-dashboard__badge-chevron h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="player-dashboard__badge-empty">
              <span className="player-dashboard__badge-empty-icon"><Icon name="medal" className="h-6 w-6" /></span>
              <div>
                <strong>{t("noBadgesYet", lang)}</strong>
                <p>{lang === "en" ? "Your certificates will appear here as you progress." : "Τα πιστοποιητικά σου θα εμφανίζονται εδώ καθώς προχωράς."}</p>
              </div>
            </div>
          )}
        </section>

        <PlayerTeamPanel user={user} lang={lang} onProfile={onProfile} />

        <section className="player-dashboard__card player-dashboard__activity player-dashboard__support-feed" aria-labelledby="player-activity-title">
          <div className="player-dashboard__section-heading">
            <div>
              <div className="player-dashboard__eyebrow">{uppercaseLabel(t("liveFeed", lang), lang)}</div>
              <h2 id="player-activity-title">{t("liveFeed", lang)}</h2>
            </div>
            <span className="player-dashboard__activity-pulse"><i /></span>
          </div>
          <div className="player-dashboard__activity-list"><LiveFeed playersOnly lang={lang} /></div>
        </section>
      </div>

      {mapExpanded && (
        <DashboardMapDialog
          user={user}
          lang={lang}
          selectedCampaignId={selectedMapCampaign}
          onOpen={onOpen}
          onProfile={onProfile}
          onClose={() => setMapExpanded(false)}
        />
      )}

      {badgesOpen && (
        <BadgesDialog
          user={user}
          lang={lang}
          onBadge={onBadge}
          onClose={() => setBadgesOpen(false)}
        />
      )}
    </div>
  );
}
