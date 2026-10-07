import { useEffect, useRef, useState } from "react";
import { CAMPAIGNS, LEARNING_PATHS, campaignById, moduleById } from "./data/lessons";
import { t, uppercaseLabel, type Lang } from "./i18n";
import * as db from "./lib/db";
import { useAuth } from "./lib/useAuth";
import { sound } from "./lib/sound";
import { passesQuickQuiz } from "./lib/quizProgress";
import { cn } from "./utils/cn";
import AuthScreen from "./components/AuthScreen";
import PlayerDashboard from "./components/PlayerDashboard";
import EducatorDashboard from "./components/EducatorDashboard";
import InteractiveMap from "./components/InteractiveMap";
import ModuleView from "./components/ModuleView";
import ProfileView from "./components/ProfileView";
import Tickets from "./components/Tickets";
import Messages from "./components/Messages";
import MuteButton from "./components/MuteButton";
import Icon from "./components/Icon";
import Avatar from "./components/Avatar";
import BadgeModal from "./components/BadgeModal";
import QuizPopup from "./components/QuizPopup";
import PlayerQuickStats from "./components/PlayerQuickStats";
import OverallScoreboardPopup from "./components/OverallScoreboardPopup";
import type { User } from "./lib/db";


type View = "dashboard" | "educator" | "campaigns" | "map" | "module" | "messages" | "tickets" | "profile";
type ModuleTab = "theory" | "guide" | "lab";
type ThemeName = "cyan" | "warm";

const THEME_STORAGE_KEY = "gamehack.theme";

function readThemePreference(): ThemeName {
  let theme: ThemeName = "cyan";
  if (typeof window !== "undefined") {
    try {
      theme = window.localStorage.getItem(THEME_STORAGE_KEY) === "warm" ? "warm" : "cyan";
    } catch {
      // Keep the default palette when browser storage is unavailable.
    }
  }
  if (typeof document !== "undefined") document.documentElement.dataset.theme = theme;
  return theme;
}

const MODULE_BADGE: Record<string, string> = {
  "linux-basics": "shell_initiate",
  recon: "recon_scout",
  scanning: "port_mapper",
  bruteforce: "lockbreaker",
  sqli: "query_bender",
  privesc: "root",
  "raven-root": "raven",
  "ssh-tunnel": "ssh_walker",
  "sr-intro": "shell_initiate",
  "sr-perms": "sudo_run",
  "sr-svc": "sudo_run",
  "dfir-intake": "evidence_custodian",
  "dfir-windows": "artifact_mapper",
  "dfir-documents": "document_analyst",
  "dfir-web": "web_correlator",
  "dfir-network": "packet_analyst",
  "dfir-disk": "disk_examiner",
  "dfir-malware": "static_analyst",
  "dfir-memory": "memory_analyst",
  "dfir-container": "container_examiner",
  "dfir-passwords": "hash_examiner",
};

type LearningTarget = { campaignId: string; moduleId: string };

function continueLearningTarget(user: User): LearningTarget {
  const activeCampaign = campaignById(user.activeCampaignId || "");
  if (activeCampaign) {
    const ordered = [...activeCampaign.modules].sort((a, b) => a.order - b.order);
    const activeIndex = ordered.findIndex((module) => module.id === user.activeModuleId);
    const activeModule = activeIndex >= 0 ? ordered[activeIndex] : null;
    if (activeModule && !user.progress[activeModule.id]?.completed) {
      return { campaignId: activeCampaign.id, moduleId: activeModule.id };
    }
    const next = ordered.slice(Math.max(0, activeIndex + 1)).find((module, offset) => {
      const index = Math.max(0, activeIndex + 1) + offset;
      return !user.progress[module.id]?.completed && (index === 0 || !!user.progress[ordered[index - 1]?.id]?.completed);
    });
    if (next) return { campaignId: activeCampaign.id, moduleId: next.id };
  }

  for (const campaign of LEARNING_PATHS) {
    const ordered = [...campaign.modules].sort((a, b) => a.order - b.order);
    const next = ordered.find((module, index) =>
      !user.progress[module.id]?.completed &&
      (index === 0 || !!user.progress[ordered[index - 1].id]?.completed)
    );
    if (next) return { campaignId: campaign.id, moduleId: next.id };
  }

  const fallbackCampaign = activeCampaign || LEARNING_PATHS[0];
  const fallbackModule = [...fallbackCampaign.modules].sort((a, b) => a.order - b.order).at(-1);
  return { campaignId: fallbackCampaign.id, moduleId: fallbackModule?.id || LEARNING_PATHS[0].modules[0].id };
}

function EthicsGate({ lang, onAccept }: { lang: Lang; onAccept: () => void }) {
  return (
    <div className="gamehack-grid min-h-full grid place-items-center p-4">
      <div className="relative z-10 max-w-lg glass rounded-2xl border border-cyan-600/40 p-8 gamehack-glow scale-in">
        <div className="text-sm uppercase tracking-[0.3em] text-cyan-400 mb-2">{t("appName", lang)}</div>
        <h1 className="text-2xl font-bold text-shine mb-4">{t("ethicsTitle", lang)}</h1>
        <p className="text-zinc-300 leading-relaxed text-sm">{t("ethicsBody", lang)}</p>
        <button
          type="button"
          onClick={() => {
            sound.unlock();
            sound.enter();
            onAccept();
          }}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 py-3 font-bold text-white"
        >
          {t("agree", lang)}
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const { user, logout, refresh, authReady } = useAuth();
  const [view, setView] = useState<View>("dashboard");
  const previousUserId = useRef<string | null>(user?.id ?? null);
  const [theme, setTheme] = useState<ThemeName>(readThemePreference);
  const [campaignId, setCampaignId] = useState(LEARNING_PATHS[0].id);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [moduleInitialTab, setModuleInitialTab] = useState<ModuleTab | undefined>();
  const [profileId, setProfileId] = useState<string | null>(null);
  const [chatWith, setChatWith] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const [badgeId, setBadgeId] = useState<string | null>(null);
  const [quizFor, setQuizFor] = useState<string | null>(null);
  const [scoreboardOpen, setScoreboardOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const nextUserId = user?.id ?? null;
    if (nextUserId && nextUserId !== previousUserId.current) setView("dashboard");
    previousUserId.current = nextUserId;
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    const id = setInterval(() => db.heartbeat(user.id), 15000);
    db.heartbeat(user.id);
    return () => clearInterval(id);
  }, [user?.id]);

  useEffect(() => db.subscribeDB(refresh), [refresh]);

  useEffect(() => {
    if (!accountMenuOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountMenuOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setAccountMenuOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [accountMenuOpen]);

  if (!authReady) {
    return <div className="gamehack-grid min-h-screen grid place-items-center text-sm text-iron-300">Checking session…</div>;
  }
  if (!user) return <AuthScreen />;

  const lang: Lang = user.lang || "en";
  const setLang = (l: Lang) => {
    db.updateUser(user.id, { lang: l });
    refresh();
  };
  const toggleTheme = () => {
    const nextTheme: ThemeName = theme === "cyan" ? "warm" : "cyan";
    document.documentElement.dataset.theme = nextTheme;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // The switch still works for this session when browser storage is unavailable.
    }
    setTheme(nextTheme);
  };

  if (!user.accepted) {
    return (
      <EthicsGate
        lang={lang}
        onAccept={() => {
          db.updateUser(user.id, { accepted: true });
          refresh();
        }}
      />
    );
  }

  const campaign = campaignById(campaignId) || LEARNING_PATHS[0];
  const active = activeId ? moduleById(activeId) : null;
  const collapsed = !!user.sidebarCollapsed;
  const unread = db.inboxFor(user.id).filter((m) => !m.read).length;
  const openTickets = db.ticketsFor(user).filter((x) => x.status === "open").length;

  const go = (v: View) => {
    sound.nav();
    setView(v);
    setMobile(false);
    window.scrollTo(0, 0);
  };

  const openModule = (cid: string, mid: string, initialTab?: ModuleTab) => {
    db.updateUser(user.id, { activeCampaignId: cid, activeModuleId: mid });
    setCampaignId(cid);
    setActiveId(mid);
    setModuleInitialTab(initialTab);
    setView("module");
    setMobile(false);
    window.scrollTo(0, 0);
  };

  const openCampaign = (cid: string) => {
    const selectedCampaign = campaignById(cid);
    if (!selectedCampaign) return;
    const modules = [...selectedCampaign.modules].sort((a, b) => a.order - b.order);
    const firstAvailable = modules.find((module, index) =>
      !user.progress[module.id]?.completed &&
      (index === 0 || !!user.progress[modules[index - 1].id]?.completed)
    );
    const selectedModule = firstAvailable || modules[0];
    if (selectedModule) openModule(cid, selectedModule.id, "theory");
  };

  const awardMetricBadges = () => {
    const u = db.userById(user.id)!;
    const m = u.metrics;
    if (db.fidelityScore(m) >= 90 && m.commandsRun >= 10) maybeBadge("high_fidelity");
    if (m.commandsRun >= 10 && m.typoCount === 0) maybeBadge("flawless");
    if (m.streakDays >= 3) maybeBadge("dedicated");
  };

  const maybeBadge = (id: string) => {
    if (db.grantBadge(user.id, id)) {
      setTimeout(() => {
        sound.badge();
        setBadgeId(id);
      }, 400);
    }
  };

  const markTaskDone = (moduleId: string, taskId: string, hintUsed = false) => {
    const u = db.userById(user.id)!;
    const mp = u.progress[moduleId] || { completed: false, done: [] };
    if (mp.done.includes(taskId)) return;
    const firstEver = Object.values(u.progress).every((p) => p.done.length === 0);
    db.updateUser(user.id, {
      progress: { ...u.progress, [moduleId]: { ...mp, done: [...mp.done, taskId] } },
    });
    const objectiveModule = moduleById(moduleId);
    const objective = objectiveModule?.tasks.find((task) => task.id === taskId);
    const objectiveCampaign = CAMPAIGNS.find((campaign) => campaign.modules.some((module) => module.id === moduleId));
    const baseReward = objective?.reward ?? 5;
    const hintPenalty = hintUsed && objective ? Math.min(db.HINT_XP_PENALTY, baseReward) : 0;
    const { gained, leveledUp } = db.awardXp(user.id, Math.max(0, baseReward - hintPenalty));
    const rewardNote = hintPenalty > 0
      ? `(+${gained} XP after -${hintPenalty} XP hint penalty)`
      : `(+${gained} XP)`;
    db.pushFeed(db.userById(user.id)!, "task", `${u.displayName} solved an objective ${rewardNote}`, {
      campaignId: objectiveCampaign?.id,
      moduleId,
      objectiveId: taskId,
    });
    if (leveledUp) {
      db.pushFeed(db.userById(user.id)!, "levelup", `${u.displayName} reached a new level!`);
      setTimeout(() => sound.levelUp(), 700);
    }
    if (firstEver) maybeBadge("firstblood");
    awardMetricBadges();
    db.saveDB();
    refresh();
  };

  const completeModuleAfterQuiz = (moduleId: string) => {
    const u = db.userById(user.id)!;
    const mp = u.progress[moduleId] || { completed: false, done: [] };
    if (mp.completed) return;

    const nextProgress = { ...u.progress, [moduleId]: { ...mp, completed: true } };
    const currentCampaign = CAMPAIGNS.find((item) => item.modules.some((module) => module.id === moduleId));
    db.updateUser(user.id, { progress: nextProgress });

    const { gained } = db.awardXp(user.id, 15);
    const pathCompleted = !!currentCampaign && currentCampaign.modules.every((module) => nextProgress[module.id]?.completed);
    db.pushFeed(db.userById(user.id)!, "module", `${u.displayName} completed a module (+${gained} XP)`, {
      campaignId: currentCampaign?.id,
      moduleId,
      pathCompleted,
    });
    const badge = MODULE_BADGE[moduleId];
    if (badge) maybeBadge(badge);
    if (
      currentCampaign?.id === "dfir-fieldwork" &&
      currentCampaign.modules.every((module) => nextProgress[module.id]?.completed)
    ) {
      maybeBadge("incident_reporter");
    }
    awardMetricBadges();
    db.saveDB();
    sound.moduleComplete();
    refresh();
  };

  const nav: { id: View; icon: string; label: string; show: boolean; badge?: number }[] = [
    { id: "dashboard", icon: "home", label: t("homeNav", lang), show: user.role === "player" },
    { id: "profile", icon: "user", label: t("profileNav", lang), show: true },
    { id: "map", icon: "map", label: t("learningMapNav", lang), show: true },
    { id: "campaigns", icon: "flag", label: t("challengesNav", lang), show: true },
    { id: "messages", icon: "mail", label: t("messagesNav", lang), show: true, badge: unread },
    { id: "tickets", icon: "ticket", label: t("ticketsNav", lang), show: true, badge: openTickets },
    { id: "educator", icon: "chart", label: t("educator", lang), show: user.role === "educator" },
  ];
  const mobileMenuButton = (
    <button
      type="button"
      aria-label="Open navigation"
      className="app-topbar__menu lg:hidden text-iron-300"
      onClick={() => setMobile(true)}
    >
      <Icon name="git" className="w-5 h-5" />
    </button>
  );
  const accountTools = (
    <div className="module-topbar__account-tools">
      <button
        type="button"
        className="gamehack-theme-toggle"
        onClick={toggleTheme}
        aria-label={t(theme === "cyan" ? "switchToWarmTheme" : "switchToCyanTheme", lang)}
        title={t(theme === "cyan" ? "switchToWarmTheme" : "switchToCyanTheme", lang)}
        aria-pressed={theme === "warm"}
      >
        <Icon name="palette" className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => setLang(lang === "en" ? "el" : "en")}
        className="h-9 px-3 rounded-lg border border-gamehack-border text-sm font-bold tracking-widest text-iron-400 hover:text-cyan-400"
      >
        {t("langLabel", lang)}
      </button>
      <MuteButton lang={lang} />
      <div ref={accountMenuRef} className="relative">
        <button
          type="button"
          onClick={() => {
            sound.nav();
            setAccountMenuOpen((open) => !open);
          }}
          className="flex items-center gap-1 rounded-full border border-transparent p-0.5 transition hover:border-gamehack-border hover:bg-white/5"
          aria-haspopup="menu"
          aria-expanded={accountMenuOpen}
          aria-label={t("accountMenu", lang)}
          title={user.displayName}
        >
          <Avatar src={user.avatar} name={user.displayName} size={32} />
          <Icon
            name="chevron"
            className={cn("h-3.5 w-3.5 text-iron-500 transition-transform", accountMenuOpen ? "-rotate-90" : "rotate-90")}
          />
        </button>
        {accountMenuOpen && (
          <div
            role="menu"
            aria-label={t("accountMenu", lang)}
            className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-gamehack-border bg-gamehack-panel/95 shadow-xl backdrop-blur-md"
          >
            <div className="flex items-center gap-3 border-b border-gamehack-border px-4 py-3">
              <Avatar src={user.avatar} name={user.displayName} size={40} />
              <div className="min-w-0">
                <div className="truncate text-sm font-bold text-zinc-100">{user.displayName}</div>
                <div className="truncate text-xs text-iron-500">{user.username}</div>
                <div className="mt-0.5 text-xs font-semibold text-cyan-300">
                  LVL {db.levelFromXp(user.metrics.xp).level}, {user.metrics.xp.toLocaleString()} XP
                </div>
              </div>
            </div>
            <div className="p-1.5">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setAccountMenuOpen(false);
                  setProfileId(user.id);
                  go("profile");
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-iron-300 transition hover:bg-white/5 hover:text-zinc-100"
              >
                <Icon name="user" className="h-4 w-4 text-cyan-400" />
                {t("profileNav", lang)}
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setAccountMenuOpen(false);
                  sound.popup();
                  setScoreboardOpen(true);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-iron-300 transition hover:bg-white/5 hover:text-zinc-100"
              >
                <Icon name="crown" className="h-4 w-4 text-amber-400" />
                {t("overallScoreboard", lang)}
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setAccountMenuOpen(false);
                  go("messages");
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-iron-300 transition hover:bg-white/5 hover:text-zinc-100"
              >
                <Icon name="mail" className="h-4 w-4 text-cyan-400" />
                {t("messagesNav", lang)}
                {unread > 0 && (
                  <span className="ml-auto rounded-full bg-cyan-600 px-1.5 text-xs text-white">{unread}</span>
                )}
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setAccountMenuOpen(false);
                  go("map");
                }}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-iron-300 transition hover:bg-white/5 hover:text-zinc-100"
              >
                <Icon name="chart" className="h-4 w-4 text-emerald-400" />
                {t("progress", lang)}
              </button>
              {user.role === "educator" && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setAccountMenuOpen(false);
                    go("educator");
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-iron-300 transition hover:bg-white/5 hover:text-zinc-100"
                >
                  <Icon name="users" className="h-4 w-4 text-violet-400" />
                  {t("educator", lang)}
                </button>
              )}
            </div>
            <div className="border-t border-gamehack-border p-1.5">
              <button
                type="button"
                role="menuitem"
                onClick={logout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-rose-300 transition hover:bg-rose-500/10 hover:text-rose-200"
              >
                <Icon name="logout" className="h-4 w-4" />
                {t("logout", lang)}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
  const continueTarget = continueLearningTarget(user);
  const quizCampaign = quizFor ? CAMPAIGNS.find((item) => item.modules.some((module) => module.id === quizFor)) : undefined;
  const quizModules = quizCampaign ? [...quizCampaign.modules].sort((a, b) => a.order - b.order) : [];
  const quizModuleIndex = quizModules.findIndex((module) => module.id === quizFor);
  const quizNextLab = quizModuleIndex >= 0
    ? quizModules.slice(quizModuleIndex + 1).find((module, offset) => {
        const previousModule = quizModules[quizModuleIndex + offset];
        return !user.progress[module.id]?.completed && !!previousModule &&
          (previousModule.id === quizFor || !!user.progress[previousModule.id]?.completed);
      })
    : undefined;
  const quizContinueLabel = t(quizNextLab ? "continueToNextLab" : "backToMap", lang);
  const quickStats = (
    <PlayerQuickStats
      user={user}
      lang={lang}
      onContinue={() => openModule(continueTarget.campaignId, continueTarget.moduleId)}
      onOpenScoreboard={() => setScoreboardOpen(true)}
    />
  );
  const moduleTopbarTools = (
    <div className="module-topbar__meta-row">
      {quickStats}
      <div className="module-topbar__app-tools">
        {mobileMenuButton}
        {accountTools}
      </div>
    </div>
  );

  return (
    <div className="gamehack-grid min-h-full flex">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex flex-col border-r border-gamehack-border bg-gamehack-panel/95 backdrop-blur-md transition-all lg:sticky lg:top-0 lg:bottom-auto lg:h-screen lg:self-start",
          collapsed ? "w-[72px]" : "w-60",
          mobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className={cn("relative flex h-16 items-center border-b border-gamehack-border", collapsed ? "justify-center px-2 pt-5" : "gap-2 px-3")}>
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-cyan-500 to-cyan-700 grid place-items-center shrink-0">
            <Icon name="terminal" className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="font-extrabold tracking-[0.18em] text-sm text-shine">{t("appName", lang)}</div>
              <div className="text-sm text-iron-500 truncate">{t("tagline", lang)}</div>
            </div>
          )}
          <button
            type="button"
            onClick={() => {
              db.updateUser(user.id, { sidebarCollapsed: !collapsed });
              refresh();
            }}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "grid shrink-0 place-items-center rounded-lg text-iron-500 hover:bg-white/5 hover:text-iron-200 transition",
              collapsed ? "absolute right-1 top-1 h-5 w-5 text-sm" : "ml-auto h-8 w-8 text-lg"
            )}
          >
            {collapsed ? "»" : "«"}
          </button>
        </div>
        <nav className="min-h-0 flex-1 overflow-y-auto p-2 space-y-1">
          {nav
            .filter((n) => n.show)
            .map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => {
                  if (n.id === "profile") setProfileId(user.id);
                  go(n.id);
                }}
                className={cn(
                  "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition",
                  view === n.id ? "bg-cyan-600/20 text-cyan-300" : "text-iron-400 hover:bg-white/5 hover:text-zinc-200",
                  collapsed && "justify-center px-0"
                )}
              >
                <span className="relative">
                  <Icon name={n.icon} className="w-5 h-5" />
                  {!!n.badge && n.badge > 0 && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-cyan-500" />
                  )}
                </span>
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{n.label}</span>
                    {!!n.badge && n.badge > 0 && (
                      <span className="text-sm bg-cyan-600 text-white rounded-full px-1.5">{n.badge}</span>
                    )}
                  </>
                )}
              </button>
            ))}
        </nav>
        <div className="mt-auto p-2 border-t border-gamehack-border">
          <button
            type="button"
            onClick={logout}
            className={cn("w-full flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-iron-400 hover:text-rose-300", collapsed && "justify-center")}
          >
            <Icon name="logout" className="w-4 h-4" />
            {!collapsed && t("logout", lang)}
          </button>
        </div>
      </aside>

      {mobile && <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setMobile(false)} />}

      <div className="flex-1 min-w-0 flex flex-col relative z-10">
        {view !== "module" && (
          <header className="app-topbar sticky top-0 z-20 flex min-h-16 items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4 border-b border-gamehack-border bg-gamehack-bg/80 backdrop-blur">
            {mobileMenuButton}
            {quickStats}
            {accountTools}
          </header>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {view === "dashboard" && user.role === "player" && (
            <PlayerDashboard
              user={db.userById(user.id)!}
              lang={lang}
              onOpen={openModule}
              onCampaign={openCampaign}
              onOpenScoreboard={() => setScoreboardOpen(true)}
              onBadge={setBadgeId}
            />
          )}
          {view === "dashboard" && user.role === "educator" && (
            <EducatorDashboard
              user={db.userById(user.id)!}
              lang={lang}
              onProfile={(id) => {
                setProfileId(id);
                go("profile");
              }}
            />
          )}
          {view === "educator" && (
            <EducatorDashboard
              user={db.userById(user.id)!}
              lang={lang}
              onProfile={(id) => {
                setProfileId(id);
                go("profile");
              }}
            />
          )}
          {view === "map" && (
            <InteractiveMap lang={lang} user={db.userById(user.id)!} onOpen={openModule} selectedCampaignId={campaignId} />
          )}
          {view === "campaigns" && (
            <div className="space-y-6">
              <div>
                <div className="text-sm uppercase tracking-[0.25em] text-cyan-400">{uppercaseLabel(t("campaigns", lang), lang)}</div>
                <h1 className="text-3xl font-bold mt-1">{t("chooseCampaign", lang)}</h1>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {LEARNING_PATHS.map((c, i) => {
                  const n = c.modules.filter((m) => user.progress[m.id]?.completed).length;
                  const pct = c.modules.length ? Math.round((n / c.modules.length) * 100) : 0;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => openCampaign(c.id)}
                      className={cn("text-left glass rounded-2xl border border-gamehack-border p-5 card-hover enter", `enter-${i + 1}`)}
                    >
                      <div className="h-1.5 rounded-full bg-gradient-to-r from-cyan-500 via-cyan-300 to-cyan-700 strip-anim mb-4" />
                      <div className="text-sm uppercase tracking-widest text-cyan-400">
                        {uppercaseLabel(c.scenario === "lab" || c.scenario === "sudorun" ? t("courseLabel", lang) : t("ctfLabel", lang), lang)}
                      </div>
                      <h2 className="flex items-baseline gap-2 text-xl font-bold mt-1">
                        <span className="font-mono text-sm tracking-widest text-cyan-400">{String(c.pathNumber).padStart(2, "0")}.</span>
                        <span>{c.title[lang]}</span>
                      </h2>
                      <p className="text-sm text-iron-400 mt-1">{c.subtitle[lang]}</p>
                      <p className="text-sm text-zinc-400 mt-3 leading-relaxed">{c.blurb[lang]}</p>
                      <div className="mt-4 flex items-center justify-between gap-3 text-sm text-iron-400">
                        <span>{n}/{c.modules.length} {t("modules", lang)}</span>
                        <span className="font-mono font-semibold text-cyan-300" aria-label={`${t("overallProgress", lang)} ${pct}%`}>
                          {pct}%
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 rounded-full bg-gamehack-bg overflow-hidden" aria-hidden="true">
                        <div className="h-full bg-cyan-500" style={{ width: `${pct}%` }} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {view === "module" && active && (
            <ModuleView
              key={`${user.id}:${active.id}:${moduleInitialTab || "auto"}`}
              module={active}
              userId={user.id}
              campaignId={campaign.id}
              lang={lang}
              initialTab={moduleInitialTab}
              topbarTools={moduleTopbarTools}
              done={user.progress[active.id]?.done || []}
              moduleCompleted={!!user.progress[active.id]?.completed}
              contentWidth={user.contentWidth}
              onWidth={(w) => {
                db.updateUser(user.id, { contentWidth: w });
                refresh();
              }}
              onTask={(taskId, hintUsed) => markTaskDone(active.id, taskId, hintUsed)}
              onCommandMetric={(pasted, typo, execution) => {
                db.recordCommand(user.id, { pasted, typo }, execution);
              }}
              onHint={() => {
                const u = db.userById(user.id)!;
                db.updateUser(user.id, { metrics: { ...u.metrics, hintsUsed: u.metrics.hintsUsed + 1 } });
              }}
              onStartQuiz={() => {
                setQuizFor(active.id);
                sound.popup();
              }}
              onBack={() => go("map")}
            />
          )}
          {view === "profile" && (
            <ProfileView
              user={db.userById(profileId || user.id) || user}
              viewer={db.userById(user.id)!}
              lang={lang}
              onChange={refresh}
              onChat={(id) => {
                setChatWith(id);
                go("messages");
              }}
            />
          )}
          {view === "messages" && (
            <Messages user={db.userById(user.id)!} lang={lang} withId={chatWith} onChange={refresh} />
          )}
          {view === "tickets" && <Tickets user={db.userById(user.id)!} lang={lang} onChange={refresh} />}
        </main>
      </div>

      {scoreboardOpen && (
        <OverallScoreboardPopup
          viewerId={user.id}
          lang={lang}
          onClose={() => setScoreboardOpen(false)}
        />
      )}
      {badgeId && <BadgeModal badgeId={badgeId} lang={lang} onClose={() => setBadgeId(null)} />}
      {quizFor && (
        <QuizPopup
          key={quizFor}
          moduleId={quizFor}
          lang={lang}
          continueLabel={quizContinueLabel}
          onCancel={() => setQuizFor(null)}
          onDone={(score, total) => {
            const moduleId = quizFor;
            if (!moduleId || !passesQuickQuiz(score, total)) return;

            const currentCampaign = CAMPAIGNS.find((item) => item.modules.some((module) => module.id === moduleId));
            const orderedModules = currentCampaign ? [...currentCampaign.modules].sort((a, b) => a.order - b.order) : [];
            const currentIndex = orderedModules.findIndex((module) => module.id === moduleId);
            completeModuleAfterQuiz(moduleId);
            setQuizFor(null);

            if (currentCampaign && currentIndex >= 0) {
              const progress = db.userById(user.id)!.progress;
              const nextModule = orderedModules.slice(currentIndex + 1).find((module, offset) => {
                const previousModule = orderedModules[currentIndex + offset];
                return !progress[module.id]?.completed && !!previousModule &&
                  (previousModule.id === moduleId || !!progress[previousModule.id]?.completed);
              });
              if (nextModule) {
                openModule(currentCampaign.id, nextModule.id, "lab");
                return;
              }
            }
            go("map");
          }}
        />
      )}
    </div>
  );
}
