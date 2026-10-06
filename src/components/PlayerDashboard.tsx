import { useEffect, useState } from "react";
import { LEARNING_PATHS } from "../data/lessons";
import {
  accuracyScore,
  BADGES,
  fidelityScore,
  levelFromXp,
  overallScoreboard,
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
  if (campaign.scenario === "raven") return "crown";
  if (campaign.scenario === "ssh") return "key";
  if (campaign.scenario === "dfir") return "shield";
  if (campaign.scenario === "sudorun") return "book";
  return "terminal";
}

function DashboardEye({ lang }: { lang: Lang }) {
  return (
    <figure className="player-dashboard__hero-eye" aria-label={t("dashboardEyeLabel", lang)}>
      <svg className="player-dashboard__eye-blueprint" viewBox="0 0 420 270" aria-hidden="true">
        <defs>
          <radialGradient id="dashboard-eye-iris">
            <stop offset="0%" stopColor="#0b1720" />
            <stop offset="36%" stopColor="#2dbbd4" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#1d596d" stopOpacity="0.12" />
          </radialGradient>
          <linearGradient id="dashboard-eye-stroke" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#e4fdff" stopOpacity="0.9" />
            <stop offset="52%" stopColor="#6ad9ee" stopOpacity="0.64" />
            <stop offset="100%" stopColor="#4b7e96" stopOpacity="0.16" />
          </linearGradient>
          <filter id="dashboard-eye-soft-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <g className="player-dashboard__eye-grid">
          <path d="M17 135H403M210 12V258M45 50 375 220M45 220 375 50" />
          <circle cx="210" cy="135" r="111" />
          <circle cx="210" cy="135" r="87" />
          <path d="M210 24v24M210 222v24M99 135h24M297 135h24M131 56l17 17M272 197l17 17M289 56l-17 17M148 197l-17 17" />
        </g>
        <g className="player-dashboard__eye-circuits">
          <path d="M94 135H50l-15-15H8M326 135h42l17-17h24M120 77 91 48H61l-13-13M301 77l31-31h26l13-13M119 193 91 222H58l-14 14M301 193l30 30h31l13 13" />
          <path d="M50 120V92l-15-15M370 118V90l16-16M50 150v28l-15 15M370 152v29l16 16" />
          <circle cx="8" cy="120" r="3" /><circle cx="395" cy="118" r="3" /><circle cx="44" cy="236" r="3" /><circle cx="375" cy="236" r="3" />
          <circle cx="61" cy="35" r="2.5" /><circle cx="377" cy="33" r="2.5" />
        </g>
        <g className="player-dashboard__eye-lens" filter="url(#dashboard-eye-soft-glow)">
          <path d="M67 135c36-56 94-78 143-78s107 22 143 78c-36 56-94 78-143 78S103 191 67 135Z" />
          <path d="M111 135c22-35 57-50 99-50s77 15 99 50c-22 35-57 50-99 50s-77-15-99-50Z" />
          <circle className="player-dashboard__eye-orbit" cx="210" cy="135" r="51" />
          <circle className="player-dashboard__eye-iris" cx="210" cy="135" r="38" />
          <circle className="player-dashboard__eye-pupil" cx="210" cy="135" r="18" />
          <circle cx="210" cy="135" r="6" className="player-dashboard__eye-core" />
          <path d="M210 80v17M210 173v17M155 135h17M248 135h17M171 96l12 12M237 162l12 12M249 96l-12 12M183 162l-12 12" />
        </g>
        <g className="player-dashboard__eye-reticle">
          <path d="M210 113v44M188 135h44" />
          <circle cx="210" cy="135" r="68" />
          <circle cx="210" cy="135" r="99" />
          <path d="M333 66h19l11-11h23M86 200H63l-10 10H32M336 203h20l10 10h22" />
        </g>
      </svg>
      <figcaption className="player-dashboard__eye-caption">
        <span>{uppercaseLabel(t("dashboardEyeLabel", lang), lang)}</span>
        <strong><i />{uppercaseLabel(t("dashboardEyeLock", lang), lang)}</strong>
      </figcaption>
    </figure>
  );
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
                <span className="player-dashboard__map-route-meta">{completed}/{ordered.length} {t("modules", lang)} · {percent}%</span>
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
  onClose,
}: {
  user: User;
  lang: Lang;
  selectedCampaignId: string;
  onOpen: (campaignId: string, moduleId: string) => void;
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
            selectedCampaignId={selectedCampaignId}
          />
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
}: {
  user: User;
  lang: Lang;
  onOpen: (cid: string, mid: string) => void;
  onCampaign: (campaignId: string) => void;
  onOpenScoreboard: () => void;
  onBadge: (badgeId: string) => void;
}) {
  const [mapExpanded, setMapExpanded] = useState(false);
  const lv = levelFromXp(user.metrics.xp);
  const allMods = LEARNING_PATHS.flatMap((campaign) => campaign.modules);
  const completedModules = allMods.filter((module) => user.progress[module.id]?.completed).length;
  const scoreboard = overallScoreboard();
  const myStanding = scoreboard.find((entry) => entry.user.id === user.id);
  const mvpEntries = scoreboard.slice(0, 3);

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
          <p>{t("forgeReady", lang)}</p>
          <div className="player-dashboard__hero-route">
            <span className="player-dashboard__hero-route-icon"><Icon name={campaignIcon(currentCampaign)} className="h-4 w-4" /></span>
            <span>
              <small>{uppercaseLabel(t("currentLearningPath", lang), lang)}</small>
              <strong>{String(currentCampaign.pathNumber).padStart(2, "0")} · {bi(currentCampaign.title, lang)}</strong>
            </span>
          </div>
        </div>

        <section className="player-dashboard__transmission" aria-label={t("dashboardUplink", lang)}>
          <div className="player-dashboard__transmission-heading">
            <span><i />{uppercaseLabel(t("dashboardUplink", lang), lang)}</span>
            <b>{uppercaseLabel(t("dashboardLive", lang), lang)}</b>
          </div>
          <div className="player-dashboard__transmission-copy">
            <p>{t("dashboardMissionLine1", lang)}</p>
            <p>{t("dashboardMissionLine2", lang)}</p>
          </div>
          <div className="player-dashboard__transmission-focus">
            <Icon name={currentModule?.icon || campaignIcon(currentCampaign)} className="h-4 w-4" />
            <span>
              <small>{uppercaseLabel(t("continueLearning", lang), lang)}</small>
              <strong>{currentModule ? bi(currentModule.title, lang) : t("pathCompleted", lang)}</strong>
            </span>
            <span className="player-dashboard__transmission-arrow"><Icon name="chevron" className="h-4 w-4" /></span>
          </div>
        </section>

        <DashboardEye lang={lang} />

        <div className="player-dashboard__hero-level">
          <Avatar src={user.avatar} name={user.displayName} size={36} />
          <div className="player-dashboard__hero-level-copy">
            <span>{t("level", lang)} {lv.level} · #{myStanding?.rank ?? "—"}</span>
            <strong>{user.metrics.xp.toLocaleString()} XP</strong>
            <div className="player-dashboard__hero-progress" aria-label={`${lv.pct}% to next level`}>
              <span style={{ width: `${lv.pct}%` }} />
            </div>
          </div>
        </div>
      </header>

      <section className="player-dashboard__feed-ticker" aria-label={t("liveFeed", lang)}>
        <div className="player-dashboard__feed-ticker-label">
          <span><i /><Icon name="wifi" className="h-4 w-4" /></span>
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
                  <div key={player.id} className={cn("player-dashboard__leader-row", rank === 1 && "is-mvp", player.id === user.id && "is-self")}>
                    <span className="player-dashboard__leader-rank">{rank === 1 ? <Icon name="crown" className="h-4 w-4" /> : `#${rank}`}</span>
                    <Avatar src={player.avatar} name={player.displayName} size={34} />
                    <span className="player-dashboard__leader-info">
                      <strong>{player.displayName}</strong>
                      <small>LVL {levelFromXp(player.metrics.xp).level}{player.id === user.id ? ` · ${lang === "en" ? "You" : "Εσύ"}` : ""}</small>
                    </span>
                    <span className="player-dashboard__leader-xp">{player.metrics.xp.toLocaleString()} <small>XP</small></span>
                  </div>
                ))}
                {mvpEntries.length === 0 && <p className="player-dashboard__empty">{lang === "en" ? "No players on the leaderboard yet." : "Δεν υπάρχουν ακόμη παίκτες στην κατάταξη."}</p>}
              </div>
            </section>

            <section className="player-dashboard__card player-dashboard__scoreboard-card" aria-labelledby="dashboard-scoreboard-title">
              <div className="player-dashboard__section-heading">
                <div>
                  <div className="player-dashboard__eyebrow">{uppercaseLabel(t("position", lang), lang)}</div>
                  <h2 id="dashboard-scoreboard-title">{t("scoreboard", lang)}</h2>
                </div>
                <span className="player-dashboard__scoreboard-icon"><Icon name="chart" className="h-5 w-5" /></span>
              </div>
              <div className="player-dashboard__standing">
                <span className="player-dashboard__rank-cube" aria-hidden="true">
                  <i>#{myStanding?.rank ?? "—"}</i>
                  <b>#{myStanding?.rank ?? "—"}</b>
                  <em><Icon name="crown" className="h-4 w-4" /></em>
                </span>
                <span className="player-dashboard__standing-copy">
                  <strong>#{myStanding?.rank ?? "—"}</strong>
                  <small>{t("position", lang)} / {scoreboard.length}</small>
                </span>
              </div>
              <div className="player-dashboard__scoreboard-xp">
                <span>{lang === "en" ? "Your total XP" : "Τα συνολικά XP σου"}</span>
                <strong>{user.metrics.xp.toLocaleString()} <small>XP</small></strong>
              </div>
              <button type="button" className="player-dashboard__scoreboard-button dashboard-action" onClick={onOpenScoreboard}>
                <span>{t("viewFullScoreboard", lang)}</span><Icon name="chevron" className="h-4 w-4" />
              </button>
            </section>
          </div>
          <section className="player-dashboard__card player-dashboard__stats-card" aria-labelledby="player-statistics-title">
            <div className="player-dashboard__section-heading">
              <div>
                <div className="player-dashboard__eyebrow">{uppercaseLabel(t("playerStatistics", lang), lang)}</div>
                <h2 id="player-statistics-title">{t("playerStatistics", lang)}</h2>
              </div>
              <span className="player-dashboard__live-status"><i />{lang === "en" ? "YOUR PROGRESS" : "Η ΠΡΟΟΔΟΣ ΣΟΥ"}</span>
            </div>
            <div className="player-dashboard__stats-grid">
              {stats.map((stat, index) => (
                <article key={stat.label} className="player-dashboard__stat dashboard-stagger" style={{ animationDelay: `${index * 45}ms` }}>
                  <span className="player-dashboard__stat-icon"><Icon name={stat.icon} className="h-4 w-4" /></span>
                  <span className="player-dashboard__stat-copy">
                    <span>{uppercaseLabel(stat.label, lang)}</span>
                    <strong>{stat.value}</strong>
                    <small>{stat.detail}</small>
                  </span>
                </article>
              ))}
            </div>
          </section>

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

        </div>

        <aside className="player-dashboard__map-aside">
          <DashboardMapPreview
            user={user}
            lang={lang}
            currentCampaignId={currentCampaign.id}
            onExpand={openMap}
          />
          <PlayerConstellation user={user} lang={lang} compact />
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
              {user.badges.map((id, index) => {
                const badge = BADGES[id];
                if (!badge) return null;
                return (
                  <button
                    key={id}
                    type="button"
                    className="player-dashboard__badge-card dashboard-action dashboard-stagger"
                    data-tier={badge.tier}
                    style={{ animationDelay: `${index * 45}ms` }}
                    title={`${badge.name} — ${badge.desc}`}
                    aria-label={`${badge.name}. ${badge.desc}. ${lang === "en" ? "Open certificate" : "Άνοιγμα πιστοποιητικού"}`}
                    onClick={() => onBadge(id)}
                  >
                    <span className="player-dashboard__badge-medallion"><Icon name={badge.icon} className="h-6 w-6" /></span>
                    <span className="player-dashboard__badge-copy">
                      <strong>{badge.name}</strong>
                      <small>{badge.desc}</small>
                    </span>
                    <Icon name="chevron" className="player-dashboard__badge-chevron h-4 w-4" />
                  </button>
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

        <PlayerTeamPanel user={user} lang={lang} />

        <section className="player-dashboard__card player-dashboard__activity player-dashboard__support-feed" aria-labelledby="player-activity-title">
          <div className="player-dashboard__section-heading">
            <div>
              <div className="player-dashboard__eyebrow">{uppercaseLabel(t("liveFeed", lang), lang)}</div>
              <h2 id="player-activity-title">{t("liveFeed", lang)}</h2>
            </div>
            <span className="player-dashboard__activity-pulse"><i /></span>
          </div>
          <div className="player-dashboard__activity-list"><LiveFeed lang={lang} /></div>
        </section>
      </div>

      {mapExpanded && (
        <DashboardMapDialog
          user={user}
          lang={lang}
          selectedCampaignId={selectedMapCampaign}
          onOpen={onOpen}
          onClose={() => setMapExpanded(false)}
        />
      )}
    </div>
  );
}
