import { useEffect, useState } from "react";
import { CAMPAIGNS, LEARNING_PATHS, campaignById, moduleById } from "./data/lessons";
import { t, type Lang } from "./i18n";
import * as db from "./lib/db";
import { useAuth } from "./lib/useAuth";
import { sound } from "./lib/sound";
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


type View = "dashboard" | "educator" | "campaigns" | "map" | "module" | "messages" | "tickets" | "profile";

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

function EthicsGate({ lang, onAccept }: { lang: Lang; onAccept: () => void }) {
  return (
    <div className="forge-grid min-h-full grid place-items-center p-4">
      <div className="relative z-10 max-w-lg glass rounded-2xl border border-ember-600/40 p-8 forge-glow scale-in">
        <div className="text-[10px] uppercase tracking-[0.3em] text-ember-400 mb-2">{t("appName", lang)}</div>
        <h1 className="text-2xl font-bold text-shine mb-4">{t("ethicsTitle", lang)}</h1>
        <p className="text-zinc-300 leading-relaxed text-sm">{t("ethicsBody", lang)}</p>
        <button
          type="button"
          onClick={() => {
            sound.unlock();
            sound.enter();
            onAccept();
          }}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-ember-600 to-ember-500 py-3 font-bold text-white"
        >
          {t("agree", lang)}
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const { user, logout, refresh } = useAuth();
  const [view, setView] = useState<View>("dashboard");
  const [campaignId, setCampaignId] = useState(LEARNING_PATHS[0].id);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const [chatWith, setChatWith] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const [badgeId, setBadgeId] = useState<string | null>(null);
  const [quizFor, setQuizFor] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const id = setInterval(() => db.heartbeat(user.id), 15000);
    db.heartbeat(user.id);
    return () => clearInterval(id);
  }, [user?.id]);

  useEffect(() => db.subscribeDB(refresh), [refresh]);

  if (!user) return <AuthScreen />;

  const lang: Lang = user.lang || "en";
  const setLang = (l: Lang) => {
    db.updateUser(user.id, { lang: l });
    refresh();
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
  const ordered = [...campaign.modules].sort((a, b) => a.order - b.order);
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

  const openModule = (cid: string, mid: string) => {
    db.updateUser(user.id, { activeCampaignId: cid, activeModuleId: mid });
    setCampaignId(cid);
    setActiveId(mid);
    setView("module");
    window.scrollTo(0, 0);
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

  const markTaskDone = (moduleId: string, taskId: string) => {
    const u = db.userById(user.id)!;
    const mp = u.progress[moduleId] || { completed: false, done: [] };
    if (mp.done.includes(taskId)) return;
    const firstEver = Object.values(u.progress).every((p) => p.done.length === 0);
    db.updateUser(user.id, {
      progress: { ...u.progress, [moduleId]: { ...mp, done: [...mp.done, taskId] } },
    });
    const { gained, leveledUp } = db.awardXp(user.id, 5);
    db.pushFeed(db.userById(user.id)!, "task", `${u.displayName} solved an objective (+${gained} XP)`);
    if (leveledUp) {
      db.pushFeed(db.userById(user.id)!, "levelup", `${u.displayName} reached a new level!`);
      setTimeout(() => sound.levelUp(), 700);
    }
    if (firstEver) maybeBadge("firstblood");
    awardMetricBadges();
    refresh();
  };

  const markComplete = (moduleId: string) => {
    const u = db.userById(user.id)!;
    const mp = u.progress[moduleId] || { completed: false, done: [] };
    if (mp.completed) {
      setQuizFor(moduleId);
      return;
    }
    const nextProgress = { ...u.progress, [moduleId]: { ...mp, completed: true } };
    db.updateUser(user.id, { progress: nextProgress });
    const currentCampaign = CAMPAIGNS.find((item) => item.modules.some((module) => module.id === moduleId));
    const orderedModules = currentCampaign ? [...currentCampaign.modules].sort((a, b) => a.order - b.order) : [];
    const currentIndex = orderedModules.findIndex((module) => module.id === moduleId);
    const nextModule = orderedModules.slice(currentIndex + 1).find((module) => !u.progress[module.id]?.completed);
    if (currentCampaign) {
      db.updateUser(user.id, {
        activeCampaignId: currentCampaign.id,
        activeModuleId: nextModule?.id || moduleId,
      });
    }
    const { gained } = db.awardXp(user.id, 15);
    db.pushFeed(db.userById(user.id)!, "module", `${u.displayName} completed a module (+${gained} XP)`);
    const badge = MODULE_BADGE[moduleId];
    if (badge) maybeBadge(badge);
    if (
      currentCampaign?.id === "dfir-fieldwork" &&
      currentCampaign.modules.every((module) => nextProgress[module.id]?.completed)
    ) {
      maybeBadge("incident_reporter");
    }
    awardMetricBadges();
    refresh();
    setQuizFor(moduleId);
  };

  const nav: { id: View; icon: string; label: string; show: boolean; badge?: number }[] = [
    { id: "dashboard", icon: "home", label: t("dashboard", lang), show: user.role === "player" },
    { id: "educator", icon: "chart", label: t("educator", lang), show: user.role === "educator" },
    { id: "map", icon: "map", label: t("map", lang), show: true },
    { id: "campaigns", icon: "flag", label: t("campaigns", lang), show: true },
    { id: "messages", icon: "mail", label: t("messages", lang), show: true, badge: unread },
    { id: "tickets", icon: "ticket", label: t("tickets", lang), show: true, badge: openTickets },
    { id: "profile", icon: "user", label: t("profile", lang), show: true },
  ];

  return (
    <div className="forge-grid min-h-full flex">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-30 flex flex-col border-r border-forge-border bg-forge-panel/95 backdrop-blur-md transition-all lg:static",
          collapsed ? "w-[72px]" : "w-60",
          mobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className={cn("flex items-center gap-2 px-3 h-16 border-b border-forge-border", collapsed && "justify-center")}>
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-ember-500 to-ember-700 grid place-items-center shrink-0">
            <Icon name="hammer" className="w-4 h-4 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <div className="font-extrabold tracking-[0.18em] text-xs text-shine">{t("appName", lang)}</div>
              <div className="text-[10px] text-iron-500 truncate">{t("tagline", lang)}</div>
            </div>
          )}
        </div>
        <nav className="flex-1 p-2 space-y-1">
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
                  view === n.id ? "bg-ember-600/20 text-ember-300" : "text-iron-400 hover:bg-white/5 hover:text-zinc-200",
                  collapsed && "justify-center px-0"
                )}
              >
                <span className="relative">
                  <Icon name={n.icon} className="w-5 h-5" />
                  {!!n.badge && n.badge > 0 && (
                    <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-ember-500" />
                  )}
                </span>
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left">{n.label}</span>
                    {!!n.badge && n.badge > 0 && (
                      <span className="text-[10px] bg-ember-600 text-white rounded-full px-1.5">{n.badge}</span>
                    )}
                  </>
                )}
              </button>
            ))}
        </nav>
        <div className="p-2 border-t border-forge-border space-y-2">
          <button
            type="button"
            onClick={() => {
              db.updateUser(user.id, { sidebarCollapsed: !collapsed });
              refresh();
            }}
            className="w-full text-[11px] text-iron-500 hover:text-iron-300 py-1"
          >
            {collapsed ? "»" : "«"}
          </button>
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
        <header className="sticky top-0 z-20 flex items-center gap-3 h-16 px-4 border-b border-forge-border bg-forge-bg/80 backdrop-blur">
          <button type="button" className="lg:hidden text-iron-300" onClick={() => setMobile(true)}>
            <Icon name="git" className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <button
            type="button"
            onClick={() => setLang(lang === "en" ? "el" : "en")}
            className="h-9 px-3 rounded-lg border border-forge-border text-xs font-bold tracking-widest text-iron-400 hover:text-ember-400"
          >
            {t("langLabel", lang)}
          </button>
          <MuteButton lang={lang} />
          <button type="button" onClick={() => { setProfileId(user.id); go("profile"); }} className="flex items-center gap-2">
            <Avatar src={user.avatar} name={user.displayName} size={32} />
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {view === "dashboard" && user.role === "player" && (
            <PlayerDashboard
              user={db.userById(user.id)!}
              lang={lang}
              onOpen={openModule}
              onMap={(selectedPathId) => {
                setCampaignId(selectedPathId);
                go("map");
              }}
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
                <div className="text-[10px] uppercase tracking-[0.25em] text-ember-400">{t("campaigns", lang)}</div>
                <h1 className="text-3xl font-bold mt-1">{t("chooseCampaign", lang)}</h1>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {LEARNING_PATHS.map((c, i) => {
                  const n = c.modules.filter((m) => user.progress[m.id]?.completed).length;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setCampaignId(c.id);
                        go("map");
                      }}
                      className={cn("text-left glass rounded-2xl border border-forge-border p-5 card-hover enter", `enter-${i + 1}`)}
                    >
                      <div className="h-1.5 rounded-full bg-gradient-to-r from-ember-500 via-amber-300 to-ember-700 strip-anim mb-4" />
                      <div className="text-[10px] uppercase tracking-widest text-ember-400">
                        {c.scenario === "lab" || c.scenario === "sudorun" ? t("courseLabel", lang) : t("ctfLabel", lang)}
                      </div>
                      <h2 className="flex items-baseline gap-2 text-xl font-bold mt-1">
                        <span className="font-mono text-sm tracking-widest text-ember-400">{String(c.pathNumber).padStart(2, "0")}.</span>
                        <span>{c.title[lang]}</span>
                      </h2>
                      <p className="text-sm text-iron-400 mt-1">{c.subtitle[lang]}</p>
                      <p className="text-sm text-zinc-400 mt-3 leading-relaxed">{c.blurb[lang]}</p>
                      <div className="mt-4 h-1.5 rounded-full bg-forge-bg overflow-hidden">
                        <div className="h-full bg-ember-500" style={{ width: `${(n / c.modules.length) * 100}%` }} />
                      </div>
                      <div className="text-xs text-iron-500 mt-1">
                        {n}/{c.modules.length} {t("modules", lang)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {view === "module" && active && (
            <ModuleView
              key={`${user.id}:${active.id}`}
              module={active}
              userId={user.id}
              lang={lang}
              done={user.progress[active.id]?.done || []}
              contentWidth={user.contentWidth}
              onWidth={(w) => {
                db.updateUser(user.id, { contentWidth: w });
                refresh();
              }}
              onTask={(taskId) => markTaskDone(active.id, taskId)}
              onCommandMetric={(pasted, typo) => {
                db.recordCommand(user.id, { pasted, typo });
              }}
              onHint={() => {
                const u = db.userById(user.id)!;
                db.updateUser(user.id, { metrics: { ...u.metrics, hintsUsed: u.metrics.hintsUsed + 1 } });
              }}
              onComplete={() => markComplete(active.id)}
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

      {badgeId && <BadgeModal badgeId={badgeId} lang={lang} onClose={() => setBadgeId(null)} />}
      {quizFor && (
        <QuizPopup
          moduleId={quizFor}
          lang={lang}
          onDone={() => {
            setQuizFor(null);
            const idx = ordered.findIndex((m) => m.id === quizFor);
            if (idx >= 0 && idx < ordered.length - 1) {
              setActiveId(ordered[idx + 1].id);
            } else {
              go("map");
            }
          }}
        />
      )}
    </div>
  );
}
