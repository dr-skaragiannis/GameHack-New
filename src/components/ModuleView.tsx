import { useMemo, useRef, useState } from "react";
import type { Module } from "../data/lessons";
import type { Lang } from "../i18n";
import { t } from "../i18n";
import { Terminal, type OutLine, type TerminalLike } from "../lib/terminal";
import { RavenSession, RavenTerminal } from "../lib/raven";
import { SshSession, SshTerminal } from "../lib/ssh";
import { getQuiz, type QuizEntry } from "../data/quizzes";
import { contentWidthClass, type ContentWidth } from "../lib/db";
import { sound } from "../lib/sound";
import TerminalView from "./TerminalView";
import RavenBrowser from "./RavenBrowser";
import SshBrowser from "./SshBrowser";
import SshTopology from "./SshTopology";
import QuizPopup from "./QuizPopup";
import WidthControl from "./WidthControl";
import Icon, { MODULE_ICON } from "./Icon";
import { cn } from "../utils/cn";

export default function ModuleView({
  module,
  lang,
  scenario,
  savedDone,
  savedCompleted,
  onTaskDone,
  onComplete,
  onHint,
  onBack,
  onNext,
  hasNext,
  onCommandMetric,
  onChallengeAttempt,
  contentWidth = "wide",
  onContentWidth,
}: {
  module: Module;
  lang: Lang;
  scenario: "lab" | "raven" | "ssh";
  savedDone: string[];
  savedCompleted: boolean;
  onTaskDone: (taskId: string) => void;
  onComplete: () => void;
  onHint: () => void;
  onBack: () => void;
  onNext: () => void;
  hasNext: boolean;
  onCommandMetric?: (pasted: boolean, typo: boolean) => void;
  onChallengeAttempt?: () => void;
  contentWidth?: ContentWidth;
  onContentWidth?: (w: ContentWidth) => void;
}) {
  const isSsh = scenario === "ssh";
  const showBrowser = module.tool === "browser" || module.tool === "both";
  const showTerminal = module.tool !== "browser";
  // SSH campaign adds a live Topology view alongside Terminal/Browser.
  const showTopology = isSsh;
  const [tab, setTab] = useState<"theory" | "lab">("theory");
  const [labTool, setLabTool] = useState<"terminal" | "browser" | "topology">(
    showTerminal ? "terminal" : "browser"
  );
  const [done, setDone] = useState<Set<string>>(new Set(savedDone));
  const [openHints, setOpenHints] = useState<Set<string>>(new Set());
  const [justDone, setJustDone] = useState<string | null>(null);
  const [showComplete, setShowComplete] = useState(false);
  // Two gated final challenges — track each one's solved state.
  const [chalSolved, setChalSolved] = useState<boolean[]>(
    module.challenges.map(() => savedCompleted)
  );
  const challengeDone = chalSolved.every(Boolean);
  const [justSolvedChallenge, setJustSolvedChallenge] = useState(false);
  const [explainTask, setExplainTask] = useState<(typeof module.tasks)[number] | null>(null);
  // Queue of educational quiz popups, one per just-completed task.
  const [quizQueue, setQuizQueue] = useState<{ label: string; entry: QuizEntry; result?: OutLine[] }[]>([]);

  // Create the right engine(s) once. The terminal + browser + topology all share
  // one session object which is also the objective-check context.
  const engineRef = useRef<{
    term: TerminalLike;
    ctx: any;
    ravenSession?: RavenSession;
    sshSession?: SshSession;
  } | null>(null);
  if (!engineRef.current) {
    if (scenario === "raven") {
      const session = new RavenSession();
      const rt = new RavenTerminal(session);
      module.ravenInit?.(rt);
      engineRef.current = { term: rt, ctx: session, ravenSession: session };
    } else if (scenario === "ssh") {
      const session = new SshSession();
      const st = new SshTerminal(session);
      module.sshInit?.(st);
      engineRef.current = { term: st, ctx: session, sshSession: session };
    } else {
      // Campaigns can ship their own virtual filesystem (Sudo_Run does).
      const t = new Terminal(module.labFS ? module.labFS() : undefined);
      engineRef.current = { term: t, ctx: t };
    }
  }
  const engine = engineRef.current;

  const banner: OutLine[] = useMemo(() => {
    const tag = scenario === "raven" ? "RAVEN // BOOT2ROOT" : scenario === "ssh" ? "SSH // PORT 22" : "HACKFORGE";
    return [
      { text: `╔════════════════════════════════════════════╗`, cls: "text-ember-500" },
      { text: `  ${tag} // ${module.title.en.toUpperCase()}`, cls: "text-ember-400" },
      { text: `  ${module.subtitle[lang]}`, cls: "text-iron-400" },
      { text: `╚════════════════════════════════════════════╝`, cls: "text-ember-500" },
      { text: `Type 'help' for commands. Complete the objectives on the right →`, cls: "text-neon-cyan" },
      { text: "" },
    ];
  }, [module, lang, scenario]);

  const tasksDone = done.size >= module.tasks.length;

  // Re-evaluate objectives after any action. `output` is the terminal result the
  // player just saw (undefined for browser actions). The result is shown FIRST in
  // the terminal; the quiz popup appears shortly after and repeats the result.
  const handleAction = (output?: OutLine[], pasted?: boolean) => {
    // Record gamification metrics for real terminal commands (output defined).
    if (output !== undefined && onCommandMetric) {
      const typo = output.some((l) => /command not found|not found|No such file/i.test(l.text));
      onCommandMetric(!!pasted, typo);
      if (typo) setTimeout(() => sound.error(), 200);
      // a captured flag in the output gets its own little chime
      if (output.some((l) => /flag\d?\{/.test(l.text))) setTimeout(() => sound.flag(), 500);
    }
    const ctx = engine.ctx;
    const newly: typeof module.tasks = [];
    for (const task of module.tasks) {
      if (!done.has(task.id) && task.check(ctx)) {
        done.add(task.id);
        onTaskDone(task.id);
        newly.push(task);
      }
    }
    if (newly.length) {
      setDone(new Set(done));
      setJustDone(newly[newly.length - 1].id);
      setTimeout(() => sound.taskDone(), 350);
      setTimeout(() => setJustDone(null), 1500);
      // Queue an educational result + explanation + quiz for each completed task.
      const popups: { label: string; entry: QuizEntry; result?: OutLine[] }[] = [];
      for (const task of newly) {
        const entry = getQuiz(task.id);
        if (entry) popups.push({ label: task.instruction[lang], entry, result: output });
      }
      // Small delay so the player reads the terminal result before the popup.
      if (popups.length) setTimeout(() => setQuizQueue((q) => [...q, ...popups]), 650);
    }
    // The two final challenges only count once every objective is cleared.
    const allTasksDone = done.size >= module.tasks.length;
    if (allTasksDone && !challengeDone && output !== undefined) {
      onChallengeAttempt?.(); // a command run during the challenge phase = an attempt
    }
    if (allTasksDone && !challengeDone) {
      let anyNew = false;
      const nextSolved = module.challenges.map((ch, i) => {
        if (chalSolved[i]) return true;
        if (ch.check(ctx)) {
          anyNew = true;
          return true;
        }
        return false;
      });
      if (anyNew) {
        setChalSolved(nextSolved);
        setJustSolvedChallenge(true);
        setTimeout(() => setJustSolvedChallenge(false), 1200);
        if (nextSolved.every(Boolean)) {
          setTimeout(() => sound.moduleComplete(), 400);
          onComplete();
        } else {
          setTimeout(() => sound.challengeDone(), 400);
        }
        // Assessment is opened by the player via the "See the results" button.
      }
    }
  };

  const toggleHint = (id: string) => {
    setOpenHints((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else {
        n.add(id);
        onHint();
      }
      return n;
    });
  };

  return (
    <div className="relative flex h-screen flex-col overflow-hidden">
      {/* header */}
      <header className="flex flex-none items-center justify-between gap-3 border-b border-forge-border bg-forge-panel/80 px-3 py-3 backdrop-blur sm:px-5">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <button
            onClick={onBack}
            title={t("backToMap", lang)}
            className="flex shrink-0 items-center gap-1 rounded-lg border border-forge-border px-2.5 py-1.5 font-mono text-xs text-iron-400 transition hover:border-ember-500 hover:text-ember-400"
          >
            ← <span className="hidden sm:inline">{t("backToMap", lang)}</span>
          </button>
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-forge-border bg-forge-bg text-ember-400">
              <Icon name={MODULE_ICON[module.id]} className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <div className="truncate text-sm font-bold text-zinc-100">{module.title[lang]}</div>
              <div className="truncate font-mono text-[11px] text-iron-500">
                {t("level", lang)} {module.order} · {"◆".repeat(module.difficulty)}
              </div>
            </div>
          </div>
        </div>
        {/* tabs */}
        <div className="flex shrink-0 rounded-lg border border-forge-border bg-forge-bg p-1">
          {(["theory", "lab"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={cn(
                "rounded-md px-3 py-1.5 font-mono text-xs font-semibold transition sm:px-4",
                tab === k ? "bg-ember-600 text-white" : "text-iron-400 hover:text-zinc-200"
              )}
            >
              {t(k, lang)}
            </button>
          ))}
        </div>
      </header>

      {tab === "theory" ? (
        <div className="flex-1 overflow-y-auto px-5 py-8">
          <div className={cn("flex-1", contentWidthClass(contentWidth))}>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <span className="rounded-full bg-ember-500/10 px-3 py-1 font-mono text-xs text-ember-400">
              {t("briefing", lang)}
            </span>
            {onContentWidth && (
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] uppercase tracking-wide text-iron-500">Reading width</span>
                <WidthControl value={contentWidth} onChange={onContentWidth} />
              </div>
            )}
          </div>

          <div className="space-y-7">
            {module.theory.map((s, i) => (
              <section key={i} className="fadeup rounded-xl border border-forge-border bg-forge-panel p-5">
                <h3 className="mb-2 flex items-center gap-2 text-lg font-bold text-zinc-100">
                  <span className="text-ember-500">{String(i + 1).padStart(2, "0")}</span>
                  {s.heading[lang]}
                </h3>
                <p className="text-[15px] leading-relaxed text-zinc-300">{s.body[lang]}</p>
                {s.tip && (
                  <div className="mt-4 flex items-start gap-2 rounded-lg bg-ember-500/10 p-3 text-[13px] text-ember-300">
                    <Icon name="bulb" className="mt-0.5 h-4 w-4 shrink-0" />
                    <span>{s.tip[lang]}</span>
                  </div>
                )}
              </section>
            ))}
          </div>

          {/* cheat sheet */}
          <div className="mt-8 rounded-xl border border-forge-border bg-forge-panel p-5">
            <h4 className="mb-3 font-mono text-sm font-bold text-neon-cyan">$ {t("cheatsheet", lang)}</h4>
            <div className="grid gap-2 sm:grid-cols-2">
              {module.cheats.map((c, i) => (
                <div key={i} className="flex flex-col rounded-lg bg-forge-bg px-3 py-2">
                  <code className="font-mono text-[13px] text-ember-400">{c.cmd}</code>
                  <span className="text-xs text-iron-500">{c.desc[lang]}</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => setTab("lab")}
            className="forge-glow mt-8 w-full rounded-xl bg-ember-600 py-4 font-mono text-sm font-bold text-white transition hover:bg-ember-500"
          >
            {t("beginLab", lang)} →
          </button>
          </div>
        </div>
      ) : (
        <div className="grid min-h-0 flex-1 gap-4 overflow-y-auto p-4 lg:grid-cols-[1fr_360px] lg:overflow-hidden">
          <div className="flex min-h-[440px] flex-col gap-2 lg:min-h-0">
            {(() => {
              const tabs: { k: "terminal" | "browser" | "topology"; label: string; icon: string }[] = [];
              if (showTerminal) tabs.push({ k: "terminal", label: "Terminal", icon: "terminal" });
              if (showTopology) tabs.push({ k: "topology", label: "Topology", icon: "network" });
              if (showBrowser) tabs.push({ k: "browser", label: "Browser", icon: "globe" });
              if (tabs.length < 2) return null;
              return (
                <div className="flex flex-none gap-1 rounded-lg border border-forge-border bg-forge-bg p-1">
                  {tabs.map((tb) => (
                    <button
                      key={tb.k}
                      onClick={() => setLabTool(tb.k)}
                      className={cn(
                        "flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-xs font-semibold transition",
                        labTool === tb.k ? "bg-ember-600 text-white" : "text-iron-400 hover:text-zinc-200"
                      )}
                    >
                      <Icon name={tb.icon} className="h-3.5 w-3.5" />
                      {tb.label}
                    </button>
                  ))}
                </div>
              );
            })()}
            <div className="min-h-0 flex-1">
              {labTool === "topology" && engine.sshSession ? (
                <SshTopology session={engine.sshSession} />
              ) : labTool === "browser" && engine.ravenSession ? (
                <RavenBrowser session={engine.ravenSession} onAction={() => handleAction()} />
              ) : labTool === "browser" && engine.sshSession ? (
                <SshBrowser session={engine.sshSession} onAction={() => handleAction()} />
              ) : (
                <TerminalView
                  term={engine.term}
                  onCommand={(_raw, output) => handleAction(output)}
                  banner={banner}
                />
              )}
            </div>
          </div>

          {/* objectives */}
          <aside className="flex min-h-0 flex-col gap-3 overflow-y-auto">
            <div className="rounded-xl border border-forge-border bg-forge-panel p-4">
              <div className="mb-3 flex items-center justify-between">
                <h4 className="font-mono text-sm font-bold text-ember-400">{t("objectives", lang)}</h4>
                <span className="font-mono text-xs text-iron-500">
                  {done.size}/{module.tasks.length}
                </span>
              </div>
              <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-forge-bg">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-ember-500 to-ember-400 transition-all"
                  style={{ width: `${(done.size / module.tasks.length) * 100}%` }}
                />
              </div>
              <ol className="space-y-3">
                {module.tasks.map((task, i) => {
                  const isDone = done.has(task.id);
                  return (
                    <li
                      key={task.id}
                      className={cn(
                        "rounded-lg border p-3 transition",
                        isDone
                          ? "border-neon-green/40 bg-neon-green/5"
                          : justDone === task.id
                            ? "border-ember-500"
                            : "border-forge-border bg-forge-bg"
                      )}
                    >
                      <div className="flex items-start gap-2">
                        <span
                          className={cn(
                            "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border font-mono text-[11px]",
                            isDone ? "border-neon-green bg-neon-green/20 text-neon-green" : "border-iron-500 text-iron-500"
                          )}
                        >
                          {isDone ? "✓" : i + 1}
                        </span>
                        <span className={cn("flex-1 text-[13px]", isDone ? "text-iron-400 line-through" : "text-zinc-200")}>
                          {task.instruction[lang]}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setExplainTask(task);
                          }}
                          title={t("whyHow", lang)}
                          className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-neon-cyan/50 font-mono text-[11px] font-bold text-neon-cyan transition hover:bg-neon-cyan/15"
                        >
                          ?
                        </button>
                      </div>
                      {!isDone && (
                        <div className="mt-2 pl-7">
                          <button
                            onClick={() => toggleHint(task.id)}
                            className="font-mono text-[11px] text-neon-cyan hover:underline"
                          >
                            {openHints.has(task.id) ? "▾" : "▸"} {t("showHint", lang)}
                          </button>
                          {openHints.has(task.id) && (
                            <code className="mt-1 block rounded bg-forge-panel2 px-2 py-1 font-mono text-[12px] text-ember-300">
                              {task.hint[lang]}
                            </code>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* FINAL CHALLENGES — two gated tasks, no hints, no solution shown */}
            <div
              className={cn(
                "relative overflow-hidden rounded-xl border p-4 transition",
                challengeDone
                  ? "border-neon-green/50 bg-neon-green/5"
                  : tasksDone
                    ? "border-ember-500/70 bg-ember-500/5 forge-glow"
                    : "border-forge-line bg-forge-panel/40"
              )}
            >
              <div className="mb-3 flex items-center justify-between">
                <h4 className="flex items-center gap-2 font-mono text-sm font-bold text-ember-400">
                  <Icon
                    name={challengeDone ? "flag" : tasksDone ? "sword" : "lock"}
                    className="h-4 w-4"
                  />
                  {t("finalChallenges", lang)}
                </h4>
                <span className="font-mono text-[11px] text-iron-500">
                  {chalSolved.filter(Boolean).length}/{module.challenges.length}
                </span>
              </div>

              {!tasksDone ? (
                <p className="text-[13px] leading-relaxed text-iron-500">{t("challengeLocked", lang)}</p>
              ) : (
                <div className="space-y-3">
                  {module.challenges.map((ch, i) => {
                    const solved = chalSolved[i];
                    return (
                      <div
                        key={i}
                        className={cn(
                          "rounded-lg border p-3 transition",
                          solved ? "border-neon-green/40 bg-neon-green/5" : "border-forge-border bg-forge-bg"
                        )}
                      >
                        <div className="mb-1 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-[13px] font-bold text-zinc-100">
                            <span
                              className={cn(
                                "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border font-mono text-[10px]",
                                solved ? "border-neon-green text-neon-green" : "border-ember-500 text-ember-400"
                              )}
                            >
                              {solved ? "✓" : i + 1}
                            </span>
                            {ch.title[lang]}
                          </div>
                          <span className="rounded-full bg-red-500/15 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-red-400">
                            {"◆".repeat(module.difficulty)}
                          </span>
                        </div>
                        {solved ? (
                          <p className="pl-6.5 text-[12px] leading-relaxed text-iron-400">{ch.success[lang]}</p>
                        ) : (
                          <p className="text-[12px] leading-relaxed text-zinc-300">{ch.brief[lang]}</p>
                        )}
                      </div>
                    );
                  })}

                  {!challengeDone && (
                    <>
                      <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-[12px] text-red-300">
                        <Icon name="ban" className="h-4 w-4 shrink-0" />
                        <span>{t("noHints", lang)}</span>
                      </div>
                      <p className="font-mono text-[11px] text-ember-400">{t("solveBothToProceed", lang)}</p>
                    </>
                  )}

                  {challengeDone && (
                    <button
                      onClick={() => setShowComplete(true)}
                      className="forge-glow flex w-full items-center justify-center gap-2 rounded-lg bg-ember-600 py-2.5 font-mono text-xs font-bold text-white transition hover:bg-ember-500"
                    >
                      <Icon name="medal" className="h-4 w-4" />
                      {t("seeResults", lang)}
                    </button>
                  )}
                </div>
              )}
              {justSolvedChallenge && (
                <div className="pointer-events-none absolute inset-0 animate-pulse rounded-xl border-2 border-neon-green/60" />
              )}
            </div>
          </aside>
        </div>
      )}

      {/* "why & how" explanation popup */}
      {explainTask && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm"
          onClick={() => setExplainTask(null)}
        >
          <div
            className="fadeup w-full max-w-lg rounded-2xl border border-neon-cyan/40 bg-forge-panel p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-full border border-neon-cyan/50 font-mono text-sm font-bold text-neon-cyan">
                  ?
                </span>
                <h3 className="font-mono text-sm font-bold text-neon-cyan">{t("whyHow", lang)}</h3>
              </div>
              <button
                onClick={() => setExplainTask(null)}
                className="rounded-lg border border-forge-border px-2 py-1 font-mono text-xs text-iron-400 transition hover:border-ember-500 hover:text-ember-400"
              >
                ✕
              </button>
            </div>
            <p className="mb-4 rounded-lg bg-forge-bg px-3 py-2 text-[13px] text-zinc-200">
              {explainTask.instruction[lang]}
            </p>
            <p className="whitespace-pre-line text-[14px] leading-relaxed text-iron-300">
              {explainTask.explain[lang]}
            </p>
            <button
              onClick={() => setExplainTask(null)}
              className="mt-6 w-full rounded-xl bg-neon-cyan/15 py-3 font-mono text-sm font-bold text-neon-cyan transition hover:bg-neon-cyan/25"
            >
              {t("close", lang)}
            </button>
          </div>
        </div>
      )}

      {/* educational output explanation + quiz, shown per completed objective */}
      {quizQueue.length > 0 && (
        <QuizPopup
          entry={quizQueue[0].entry}
          taskLabel={quizQueue[0].label}
          result={quizQueue[0].result}
          lang={lang}
          onClose={() => setQuizQueue((q) => q.slice(1))}
        />
      )}

      {/* completion overlay */}
      {showComplete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-6 backdrop-blur-sm">
          <div className="fadeup w-full max-w-md rounded-2xl border border-ember-500/40 bg-forge-panel p-8 text-center forge-glow">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-ember-500/40 bg-ember-500/10 text-ember-400 forge-glow">
              <Icon name={MODULE_ICON[module.id]} className="h-8 w-8" />
            </div>
            <h2 className="text-glow mb-1 text-2xl font-black text-ember-400">{t("moduleComplete", lang)}</h2>
            <p className="mb-4 text-sm text-iron-400">{module.title[lang]}</p>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-ember-500/40 bg-ember-500/10 px-4 py-2 text-ember-300">
              <Icon name="medal" className="h-4 w-4" />
              <span className="font-mono text-sm font-bold text-ember-300">{module.badge[lang]}</span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onBack}
                className="flex-1 rounded-xl border border-forge-border py-3 font-mono text-sm text-iron-300 transition hover:border-ember-500 hover:text-ember-400"
              >
                {t("backToMap", lang)}
              </button>
              {hasNext && (
                <button
                  onClick={onNext}
                  className="flex-1 rounded-xl bg-ember-600 py-3 font-mono text-sm font-bold text-white transition hover:bg-ember-500"
                >
                  {t("nextModule", lang)} →
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
