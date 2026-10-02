import { Component, useMemo, useState, type ReactNode } from "react";
import { CAMPAIGNS } from "./data/lessons";
import { t, type Lang } from "./i18n";
import * as db from "./lib/db";
import { useAuth } from "./lib/useAuth";
import ModuleView from "./components/ModuleView";
import AuthScreen from "./components/AuthScreen";
import PlayerDashboard from "./components/PlayerDashboard";
import EducatorDashboard from "./components/EducatorDashboard";
import ProfileView from "./components/ProfileView";
import Tickets from "./components/Tickets";
import Messages from "./components/Messages";
import Avatar from "./components/Avatar";
import WidthControl from "./components/WidthControl";
import MuteButton from "./components/MuteButton";
import Icon, { MODULE_ICON } from "./components/Icon";
import { sound } from "./lib/sound";
import { cn } from "./utils/cn";

type View = "dashboard" | "educator" | "campaigns" | "map" | "module" | "messages" | "tickets" | "profile";

// module id -> badge id awarded on completion
const MODULE_BADGE: Record<string, string> = {
  "linux-basics": "shell_initiate",
  recon: "recon_scout",
  scanning: "port_mapper",
  bruteforce: "lockbreaker",
  sqli: "query_bender",
  privesc: "root",
  "raven-recon": "recon_scout",
  "raven-foothold": "lockbreaker",
  "raven-web": "query_bender",
  "raven-root": "raven",
};

export default function App() {
  const { user, logout, refresh } = useAuth();
  const [view, setView] = useState<View>("dashboard");
  const [campaignId, setCampaignId] = useState<string>(CAMPAIGNS[0].id);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [chatWith, setChatWith] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [, bump] = useState(0);
  const forceUpdate = () => bump((x) => x + 1);

  const lang: Lang = user?.lang || "en";
  const setLang = (l: Lang) => {
    if (user) {
      db.updateUser(user.id, { lang: l });
      refresh();
    }
  };
  const setContentWidth = (w: db.ContentWidth) => {
    if (user) {
      db.updateUser(user.id, { contentWidth: w });
      refresh();
    }
  };
  const toggleSidebar = () => {
    if (user) {
      db.updateUser(user.id, { sidebarCollapsed: !user.sidebarCollapsed });
      refresh();
    }
  };

  // ---- not logged in ----
  if (!user) return <AuthScreen />;

  // ---- ethics gate for new accounts ----
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

  const campaign = CAMPAIGNS.find((c) => c.id === campaignId) || CAMPAIGNS[0];
  const ordered = [...campaign.modules].sort((a, b) => a.order - b.order);
  const active = ordered.find((m) => m.id === activeId) || null;
  const activeIdx = active ? ordered.findIndex((m) => m.id === active.id) : -1;

  const progress = user.progress;
  const isUnlocked = (i: number) => i === 0 || !!progress[ordered[i - 1].id]?.completed;

  const openModule = (cid: string, mid: string) => {
    setCampaignId(cid);
    setActiveId(mid);
    setView("module");
    window.scrollTo(0, 0);
  };
  const openProfile = (id: string) => {
    setProfileId(id);
    setView("profile");
    window.scrollTo(0, 0);
  };

  // ---- progress + gamification writes ----
  const markTaskDone = (moduleId: string, taskId: string) => {
    const u = db.userById(user.id)!;
    const mp = u.progress[moduleId] || { completed: false, done: [] };
    if (mp.done.includes(taskId)) return;
    const firstEver = Object.values(u.progress).every((p) => p.done.length === 0);
    db.updateUser(user.id, {
      progress: { ...u.progress, [moduleId]: { ...mp, done: [...mp.done, taskId] } },
    });
    const beforeBadges = u.badges.length;
    const { gained, leveledUp } = db.awardXp(user.id, 5);
    db.pushFeed(db.userById(user.id)!, "task", `${u.displayName} solved an objective (+${gained} XP)`);
    if (leveledUp) {
      db.pushFeed(db.userById(user.id)!, "levelup", `${u.displayName} reached a new level!`);
      setTimeout(() => sound.levelUp(), 700);
    }
    if (firstEver) db.grantBadge(user.id, "firstblood");
    awardMetricBadges();
    if (db.userById(user.id)!.badges.length > beforeBadges) setTimeout(() => sound.badge(), 900);
    refresh();
  };

  const markComplete = (moduleId: string) => {
    const u = db.userById(user.id)!;
    const mp = u.progress[moduleId] || { completed: false, done: [] };
    db.updateUser(user.id, { progress: { ...u.progress, [moduleId]: { ...mp, completed: true } } });
    const { gained } = db.awardXp(user.id, 15);
    db.pushFeed(db.userById(user.id)!, "module", `${u.displayName} completed a module (+${gained} XP)`);
    const badge = MODULE_BADGE[moduleId];
    if (badge) db.grantBadge(user.id, badge);
    awardMetricBadges();
    refresh();
  };

  const awardMetricBadges = () => {
    const u = db.userById(user.id)!;
    const m = u.metrics;
    if (db.fidelityScore(m) >= 90 && m.commandsRun >= 10) db.grantBadge(user.id, "high_fidelity");
    if (m.commandsRun >= 10 && m.typoCount === 0) db.grantBadge(user.id, "flawless");
    if (m.streakDays >= 3) db.grantBadge(user.id, "dedicated");
  };

  const onCommandMetric = (pasted: boolean, typo: boolean) => {
    db.recordCommand(user.id, { pasted, typo });
    awardMetricBadges();
    refresh();
  };

  const onChallengeSolveBonus = () => {
    const u = db.userById(user.id)!;
    u.metrics.challengeSolves++;
    const { gained } = db.awardXp(user.id, 12);
    db.pushFeed(db.userById(user.id)!, "challenge", `${u.displayName} cleared a final challenge (+${gained} XP)`);
    db.saveDB();
    refresh();
  };

  // ---------------- MODULE (fullscreen lab) ----------------
  if (view === "module" && active) {
    return (
      <ModuleView
        key={active.id}
        module={active}
        lang={lang}
        scenario={campaign.scenario}
        savedDone={progress[active.id]?.done || []}
        savedCompleted={!!progress[active.id]?.completed}
        onTaskDone={(tid) => markTaskDone(active.id, tid)}
        onComplete={() => {
          markComplete(active.id);
          onChallengeSolveBonus();
        }}
        onHint={() => {
          const u = db.userById(user.id)!;
          u.metrics.hintsUsed++;
          db.saveDB();
        }}
        onCommandMetric={onCommandMetric}
        onChallengeAttempt={() => {
          const u = db.userById(user.id)!;
          u.metrics.challengeAttempts++;
          db.saveDB();
        }}
        onBack={() => setView("map")}
        onNext={() => {
          const next = ordered[activeIdx + 1];
          if (next) openModule(campaign.id, next.id);
          else setView("map");
        }}
        hasNext={activeIdx < ordered.length - 1}
        contentWidth={user.contentWidth || "wide"}
        onContentWidth={setContentWidth}
      />
    );
  }

  // ---------------- SHELL (sidebar + content) ----------------
  const collapsed = !!user.sidebarCollapsed;
  // Profile, dashboards and campaign views flow inside the width container;
  // messages/tickets have their own internal full-height layouts.
  const widthWrap = db.contentWidthClass(user.contentWidth);

  const navTo = (v: View) => {
    setView(v);
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  };

  return (
    <div className="forge-grid flex h-screen overflow-hidden bg-forge-bg">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar
          user={user}
          view={view}
          lang={lang}
          collapsed={collapsed}
          contentWidth={user.contentWidth || "wide"}
          onToggle={toggleSidebar}
          onNav={navTo}
          onProfile={() => openProfile(user.id)}
          onLogout={() => {
            logout();
            setView("dashboard");
          }}
          setLang={setLang}
          setContentWidth={setContentWidth}
        />
      </div>

      {/* Mobile menu — fullscreen dark overlay */}
      {mobileMenuOpen && (
        <div className="forge-grid fixed inset-0 z-50 bg-forge-bg/95 backdrop-blur-md lg:hidden">
          <div className="slide-in-right h-full w-full overflow-y-auto">
            <Sidebar
              mobile
              user={user}
              view={view}
              lang={lang}
              collapsed={false}
              contentWidth={user.contentWidth || "wide"}
              onToggle={toggleSidebar}
              onRequestClose={() => setMobileMenuOpen(false)}
              onNav={navTo}
              onProfile={() => {
                openProfile(user.id);
                setMobileMenuOpen(false);
              }}
              onLogout={() => {
                logout();
                setView("dashboard");
                setMobileMenuOpen(false);
              }}
              setLang={setLang}
              setContentWidth={setContentWidth}
            />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar with hamburger */}
        <header className="flex flex-none items-center gap-3 border-b border-forge-border glass px-4 py-3 lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-forge-border text-iron-200 transition hover:border-ember-500 hover:text-ember-400"
            aria-label="Open menu"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            </svg>
          </button>
          <h1 className="font-mono text-lg font-black text-ember-400">
            HACK<span className="text-zinc-100">FORGE</span>
          </h1>
          <MuteButton className="ml-auto h-9 w-9" />
          <button onClick={() => openProfile(user.id)} aria-label="Profile">
            <Avatar name={user.displayName} src={user.avatar} size={34} ring />
          </button>
        </header>

        <main className="relative flex-1 overflow-y-auto">
          <div className={cn("px-4 py-6 sm:px-5 md:px-8", widthWrap)}>
          <ErrorBoundary onReset={() => setView("dashboard")}>
          {view === "dashboard" && user.role === "player" && (
            <PlayerDashboard
              key={"dash" + user.metrics.xp}
              user={user}
              lang={lang}
              onOpenCampaigns={() => setView("campaigns")}
              onOpenModule={openModule}
              onOpenProfile={openProfile}
            />
          )}

          {((view === "dashboard" && user.role === "educator") || view === "educator") && (
            <EducatorDashboard user={user} lang={lang} onOpenProfile={openProfile} />
          )}

          {view === "campaigns" && (
            <CampaignSelect
              lang={lang}
              progress={progress}
              onPick={(id) => {
                setCampaignId(id);
                setView("map");
                window.scrollTo(0, 0);
              }}
            />
          )}

          {view === "map" && (
            <CampaignMap
              campaign={campaign}
              lang={lang}
              progress={progress}
              isUnlocked={isUnlocked}
              onBack={() => setView("campaigns")}
              onOpen={(mid) => openModule(campaign.id, mid)}
            />
          )}

          {view === "messages" && (
            <Messages key={chatWith || "inbox"} user={user} initialChatId={chatWith} onOpenProfile={openProfile} />
          )}

          {view === "tickets" && <Tickets user={user} lang={lang} />}

          {view === "profile" && profileId && (
            <ProfileView
              key={profileId}
              profileId={profileId}
              viewer={user}
              onBack={() => setView(user.role === "educator" ? "educator" : "dashboard")}
              onChat={(id) => {
                setChatWith(id);
                setView("messages");
              }}
              onChanged={() => {
                refresh();
                forceUpdate();
              }}
            />
          )}
          </ErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
}

// ------------------------- Navigation bar -------------------------

function Sidebar({
  user,
  view,
  lang,
  collapsed,
  contentWidth,
  mobile,
  onToggle,
  onRequestClose,
  onNav,
  onProfile,
  onLogout,
  setLang,
  setContentWidth,
}: {
  user: db.User;
  view: View;
  lang: Lang;
  collapsed: boolean;
  contentWidth: db.ContentWidth;
  mobile?: boolean;
  onToggle: () => void;
  onRequestClose?: () => void;
  onNav: (v: View) => void;
  onProfile: () => void;
  onLogout: () => void;
  setLang: (l: Lang) => void;
  setContentWidth: (w: db.ContentWidth) => void;
}) {
  // On mobile the drawer is always fully expanded.
  const expanded = mobile ? true : !collapsed;
  const unread = db.inboxFor(user.id).filter((m) => !m.read).length;
  const openTk =
    user.role === "educator"
      ? db.getDB().tickets.filter((t) => t.status === "open").length
      : db.ticketsFor(user).filter((t) => t.status !== "closed").length;

  const items: { v: View; label: string; icon: string; badge?: number }[] =
    user.role === "educator"
      ? [
          { v: "educator", label: "Analytics", icon: "scan" },
          { v: "campaigns", label: "Labs", icon: "terminal" },
          { v: "tickets", label: "Tickets", icon: "flag", badge: openTk },
          { v: "messages", label: "Messages", icon: "radar", badge: unread },
        ]
      : [
          { v: "dashboard", label: "Dashboard", icon: "crown" },
          { v: "campaigns", label: "Campaigns", icon: "terminal" },
          { v: "tickets", label: "Tickets", icon: "flag", badge: openTk },
          { v: "messages", label: "Messages", icon: "radar", badge: unread },
        ];

  const activeMatch = (v: View) =>
    view === v ||
    (v === "dashboard" && view === "profile") ||
    (v === "campaigns" && (view === "map" || view === "module")) ||
    (v === "educator" && view === "dashboard");

  const cycleWidth = () => {
    const order: db.ContentWidth[] = ["centered", "wide", "full"];
    const next = order[(order.indexOf(contentWidth) + 1) % order.length];
    setContentWidth(next);
  };
  const widthLabel = contentWidth === "centered" ? "Centered" : contentWidth === "full" ? "Full width" : "75% width";

  return (
    <aside
      className={cn(
        "relative z-30 flex h-screen flex-none flex-col transition-[width] duration-300",
        mobile
          ? "mx-auto w-full max-w-2xl border-0 px-2"
          : cn("border-r border-forge-border glass", collapsed ? "w-[72px]" : "w-60")
      )}
    >
      {/* brand + collapse toggle */}
      <div className={cn("flex items-center gap-2 px-4 py-4", mobile && "px-3 py-5", !expanded && "flex-col px-0")}>
        {!expanded ? (
          <span className="font-mono text-xl font-black text-ember-400">
            H<span className="text-zinc-100">F</span>
          </span>
        ) : (
          <h1 className="font-mono text-xl font-black text-ember-400">
            HACK<span className="text-zinc-100">FORGE</span>
          </h1>
        )}
        {mobile ? (
          <button
            onClick={onRequestClose}
            aria-label="Close menu"
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-lg border border-forge-border text-iron-300 transition hover:border-red-500 hover:text-red-400"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
              <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
            </svg>
          </button>
        ) : (
          <button
            onClick={onToggle}
            title={collapsed ? "Expand menu" : "Minimize menu"}
            aria-label={collapsed ? "Expand menu" : "Minimize menu"}
            className={cn(
              "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-forge-border bg-forge-bg text-iron-300 transition hover:border-ember-500 hover:text-ember-400",
              expanded ? "ml-auto" : "mt-1"
            )}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} className="h-4 w-4" strokeLinecap="round" strokeLinejoin="round">
              {collapsed ? <path d="M9 6l6 6-6 6" /> : <path d="M15 6l-6 6 6 6" />}
            </svg>
          </button>
        )}
      </div>

      {/* nav */}
      <nav className={cn("mt-2 flex flex-1 flex-col gap-1 overflow-y-auto px-2.5", mobile && "mt-4 gap-2 px-3")}>
        {items.map((it) => (
          <button
            key={it.v}
            onClick={() => onNav(it.v)}
            title={!expanded ? it.label : undefined}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 font-mono text-sm font-bold transition",
              mobile && "gap-4 rounded-2xl border border-forge-border/60 px-4 py-4 text-base",
              !expanded && !mobile && "justify-center px-0",
              activeMatch(it.v)
                ? "bg-ember-600 text-white shadow-[0_6px_20px_-8px_rgba(255,106,43,0.8)]"
                : "text-iron-400 hover:bg-forge-panel hover:text-zinc-100"
            )}
          >
            <span className="relative shrink-0">
              <Icon name={it.icon} className={mobile ? "h-6 w-6" : "h-5 w-5"} />
              {!!it.badge && it.badge > 0 && !expanded && (
                <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white">
                  {it.badge}
                </span>
              )}
            </span>
            {expanded && <span className="flex-1 truncate text-left">{it.label}</span>}
            {expanded && !!it.badge && it.badge > 0 && (
              <span className="flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {it.badge}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* footer controls */}
      <div
        className={cn(
          "flex flex-none flex-col gap-2 border-t border-forge-border p-2.5",
          mobile && "gap-3 p-4 pb-6",
          !expanded && "items-center"
        )}
      >
        {expanded && (
          <div className="w-full">
            <div className="mb-1 px-1 font-mono text-[10px] uppercase tracking-wide text-iron-500">Content width</div>
            <WidthControl value={contentWidth} onChange={setContentWidth} />
          </div>
        )}
        {!expanded && (
          <button
            onClick={cycleWidth}
            title={`Content width: ${widthLabel}`}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-forge-border text-iron-300 transition hover:border-ember-500 hover:text-ember-400"
          >
            <Icon name="scan" className="h-4 w-4" />
          </button>
        )}

        <div className={cn("flex w-full items-center gap-2", !expanded && "flex-col")}>
          <button
            onClick={() => setLang(lang === "en" ? "el" : "en")}
            className={cn(
              "flex h-9 items-center justify-center rounded-lg border border-forge-border px-2 font-mono text-xs font-bold text-iron-300 transition hover:border-ember-500 hover:text-ember-400",
              expanded ? "flex-1" : "w-9"
            )}
            title="Language"
          >
            {lang.toUpperCase()}
          </button>
          <MuteButton className="h-9 w-9 shrink-0" />
          <button
            onClick={onLogout}
            title="Logout"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-forge-border text-iron-500 transition hover:border-red-500 hover:text-red-400"
          >
            <Icon name="lock" className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={onProfile}
          className={cn(
            "flex w-full items-center gap-2.5 rounded-xl border border-forge-border p-2 transition hover:border-ember-500/60",
            !expanded && "w-auto justify-center border-0 p-0"
          )}
          title="My profile"
        >
          <Avatar name={user.displayName} src={user.avatar} size={!expanded ? 34 : 32} ring />
          {expanded && (
            <div className="min-w-0 flex-1 text-left">
              <div className="truncate text-xs font-bold text-zinc-100">{user.displayName}</div>
              <div className="font-mono text-[10px] text-iron-500">
                {user.role === "educator" ? "Educator" : "Operator"}
              </div>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}

// ------------------------- Error boundary -------------------------
// Catches unexpected render errors anywhere in the main content area and shows
// a recovery panel instead of a blank/black screen.
class ErrorBoundary extends Component<
  { children: ReactNode; onReset: () => void },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: unknown) {
    console.error("HACKFORGE render error:", error, info);
  }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="mx-auto mt-16 max-w-lg rounded-3xl border border-red-500/40 bg-red-500/5 p-8 text-center">
        <Icon name="ban" className="mx-auto mb-3 h-10 w-10 text-red-400" />
        <h2 className="font-mono text-lg font-black text-red-300">Something glitched in the lab</h2>
        <p className="mt-2 break-words font-mono text-xs leading-relaxed text-iron-400">
          {String(this.state.error?.message || this.state.error)}
        </p>
        <button
          onClick={() => {
            this.setState({ error: null });
            this.props.onReset();
          }}
          className="mt-5 rounded-xl bg-ember-600 px-5 py-2.5 font-mono text-sm font-bold text-white transition hover:bg-ember-500"
        >
          ← Back to dashboard
        </button>
      </div>
    );
  }
}

// ------------------------- Ethics gate -------------------------

function EthicsGate({ lang, onAccept }: { lang: Lang; onAccept: () => void }) {
  return (
    <div className="forge-grid relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-forge-bg px-6 py-12">
      <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-ember-600/20 blur-[120px]" />
      <div className="relative z-10 w-full max-w-2xl text-center">
        <h1 className="text-glow mb-3 font-mono text-5xl font-black tracking-tight text-ember-400">
          HACK<span className="text-zinc-100">FORGE</span>
        </h1>
        <p className="mx-auto mb-10 max-w-lg text-iron-400">{t("heroLine", lang)}</p>
        <div className="mb-8 rounded-2xl border border-ember-500/30 bg-forge-panel p-6 text-left forge-glow">
          <h2 className="mb-3 flex items-center gap-2 font-mono text-lg font-bold text-ember-400">
            <Icon name="scale" className="h-5 w-5" /> {t("ethicsTitle", lang)}
          </h2>
          <p className="text-sm leading-relaxed text-iron-300">{t("ethicsBody", lang)}</p>
        </div>
        <button
          onClick={onAccept}
          className="forge-glow pulse-ring inline-flex items-center gap-3 rounded-xl bg-ember-600 px-8 py-4 font-mono text-base font-bold text-white transition hover:bg-ember-500"
        >
          <Icon name="flame" className="h-5 w-5" />
          {t("agree", lang)}
        </button>
      </div>
    </div>
  );
}

// ------------------------- Campaign select -------------------------

function CampaignSelect({
  lang,
  progress,
  onPick,
}: {
  lang: Lang;
  progress: Record<string, db.ModProgress>;
  onPick: (id: string) => void;
}) {
  return (
    <main className="w-full">
      <div className="enter enter-1 mb-8">
        <div className="font-mono text-xs uppercase tracking-[0.35em] text-ember-500">{t("chooseCampaign", lang)}</div>
        <h2 className="mt-1 text-3xl font-black text-shine">{t("campaigns", lang)}</h2>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {CAMPAIGNS.map((cmp, i) => {
          const mods = [...cmp.modules].sort((a, b) => a.order - b.order);
          const doneN = mods.filter((m) => progress[m.id]?.completed).length;
          const cp = Math.round((doneN / mods.length) * 100);
          return (
            <button
              key={cmp.id}
              onClick={() => onPick(cmp.id)}
              className={cn(
                "enter card-hover group relative overflow-hidden rounded-3xl border border-forge-border glass p-7 text-left",
                `enter-${i + 2}`
              )}
            >
              <div className="absolute inset-x-0 top-0 h-1 strip-anim bg-gradient-to-r from-ember-700 via-ember-400 to-ember-700" />
              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-ember-600/10 blur-2xl" />
              <div className="relative mb-5 flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-forge-border bg-forge-bg text-ember-400 transition group-hover:scale-110">
                  <Icon name={cmp.scenario === "raven" ? "crown" : "terminal"} className="h-7 w-7 glow-pulse" />
                </span>
                <div>
                  <div className="font-mono text-xs uppercase tracking-wide text-iron-500">
                    {cmp.scenario === "raven" ? t("ctfLabel", lang) : t("courseLabel", lang)}
                  </div>
                  <h3 className="text-xl font-black text-zinc-100">{cmp.title[lang]}</h3>
                </div>
              </div>
              <p className="relative mb-6 text-[15px] text-iron-400">{cmp.subtitle[lang]}</p>
              <div className="relative flex items-center justify-between">
                <span className="font-mono text-xs text-iron-500">
                  {mods.length} {t("modules", lang)} · {doneN}/{mods.length} {t("done", lang)}
                </span>
                <span className="font-mono text-lg font-black text-ember-400">{cp}%</span>
              </div>
              <div className="relative mt-2 h-2 overflow-hidden rounded-full bg-forge-bg">
                <div className="bar-grow h-full rounded-full bg-gradient-to-r from-ember-500 to-ember-300" style={{ width: `${cp}%` }} />
              </div>
            </button>
          );
        })}
      </div>
    </main>
  );
}

// ------------------------- Campaign map -------------------------

function CampaignMap({
  campaign,
  lang,
  progress,
  isUnlocked,
  onBack,
  onOpen,
}: {
  campaign: (typeof CAMPAIGNS)[number];
  lang: Lang;
  progress: Record<string, db.ModProgress>;
  isUnlocked: (i: number) => boolean;
  onBack: () => void;
  onOpen: (mid: string) => void;
}) {
  const ordered = useMemo(() => [...campaign.modules].sort((a, b) => a.order - b.order), [campaign]);
  const completedCount = ordered.filter((m) => progress[m.id]?.completed).length;
  const totalTasks = ordered.reduce((n, m) => n + m.tasks.length, 0);
  const doneTasks = ordered.reduce((n, m) => n + (progress[m.id]?.done.length || 0), 0);
  const pct = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  return (
    <main className="w-full">
      <div className="enter enter-1 mb-6 flex items-center gap-3">
        <button
          onClick={onBack}
          className="rounded-lg border border-forge-border px-3 py-2 font-mono text-sm text-iron-400 transition hover:border-ember-500 hover:text-ember-400"
        >
          ←
        </button>
        <h2 className="text-2xl font-black text-zinc-100">{campaign.title[lang]}</h2>
        <span className="ml-auto font-mono text-lg font-black text-ember-400">{pct}%</span>
      </div>

      <div className="enter enter-2 mb-6 rounded-2xl border border-forge-border glass p-6">
        <div className="mb-2 flex justify-between font-mono text-xs text-iron-500">
          <span>{t("overallProgress", lang)}</span>
          <span>
            {completedCount}/{ordered.length} {t("modules", lang)}
          </span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full border border-forge-border bg-forge-bg">
          <div className="bar-grow h-full rounded-full bg-gradient-to-r from-ember-600 to-ember-300 shadow-[0_0_12px_rgba(255,106,43,0.5)]" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ordered.map((m, i) => {
          const prog = progress[m.id];
          const unlocked = isUnlocked(i);
          const status = prog?.completed ? "done" : prog?.done.length ? "prog" : unlocked ? "open" : "locked";
          return (
            <button
              key={m.id}
              disabled={!unlocked}
              onClick={() => unlocked && onOpen(m.id)}
              className={cn(
                "enter group relative overflow-hidden rounded-2xl border p-5 text-left transition",
                `enter-${Math.min(i + 1, 8)}`,
                unlocked
                  ? "card-hover border-forge-border glass hover:border-ember-500/60"
                  : "cursor-not-allowed border-forge-line bg-forge-panel/40 opacity-60"
              )}
            >
              <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r", m.color)} />
              <div className="mb-3 flex items-start justify-between">
                <span
                  className={cn(
                    "flex h-14 w-14 items-center justify-center rounded-2xl border bg-forge-bg transition group-hover:scale-110",
                    unlocked ? "border-forge-border text-ember-400" : "border-forge-line text-iron-500"
                  )}
                >
                  <Icon name={unlocked ? MODULE_ICON[m.id] || "terminal" : "lock"} className={cn("h-7 w-7", unlocked && "glow-pulse")} />
                </span>
                <span
                  className={cn(
                    "rounded-full px-3 py-1 font-mono text-[11px] font-bold uppercase",
                    status === "done"
                      ? "bg-neon-green/15 text-neon-green"
                      : status === "prog"
                        ? "bg-ember-500/15 text-ember-400"
                        : status === "open"
                          ? "bg-forge-bg text-iron-400"
                          : "bg-forge-bg text-iron-500"
                  )}
                >
                  {status === "done"
                    ? t("completed", lang)
                    : status === "prog"
                      ? t("inProgress", lang)
                      : status === "open"
                        ? t("start_module", lang)
                        : t("locked", lang)}
                </span>
              </div>
              <div className="mb-1 flex items-center gap-2">
                <span className="font-mono text-xs text-iron-500">{String(m.order).padStart(2, "0")}</span>
                <span className="font-mono text-xs text-ember-500">{"◆".repeat(m.difficulty)}</span>
              </div>
              <h3 className="text-xl font-bold text-zinc-100">{m.title[lang]}</h3>
              <p className="mt-1 text-sm text-iron-400">{m.subtitle[lang]}</p>
              {prog && !prog.completed && (
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-forge-bg">
                  <div
                    className="bar-grow h-full bg-ember-500"
                    style={{ width: `${((prog.done.length || 0) / m.tasks.length) * 100}%` }}
                  />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </main>
  );
}
