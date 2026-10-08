import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import type { Module, Task } from "../data/lessons";
import { bi, t, uppercaseLabel, type Lang } from "../i18n";
import { runCommand, type Terminal } from "../lib/terminal";
import { activateTerminalForModule, loadPlayerTerminal, resetPlayerTerminal, savePlayerTerminal } from "../lib/playerTerminal";
import TerminalView from "./TerminalView";
import Icon from "./Icon";
import { cn } from "../utils/cn";
import { contentWidthClass, HINT_XP_PENALTY, type CommandExecutionInput, type ContentWidth } from "../lib/db";
import WidthControl from "./WidthControl";
import { sound } from "../lib/sound";
import {
  commandLessonForLabel,
  explainCommandResult,
  relevantCommandFamiliesForModule,
  studyItemsForModule,
  type CommandExplanation,
} from "../data/commandGuide";
import { findLinuxCommand } from "../lib/linuxCommandCatalog";
import { theoryBlocksForCommand } from "../data/commandTheory";
import CommandResultPopup from "./CommandResultPopup";
import DfirVisual from "./DfirVisual";
import WhyHowPopup from "./WhyHowPopup";

type StudyItem = ReturnType<typeof studyItemsForModule>[number];

function firstCommandName(command: string): string {
  const token = command.trim().split(/\s+/, 1)[0] || "";
  if (token.startsWith("./")) return "bash";
  if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(token)) return "env";
  return token.split("/").pop()?.toLowerCase() || token.toLowerCase();
}

function theoryItemsForModule(module: Module): StudyItem[] {
  const items = studyItemsForModule(module);
  const covered = new Set(items.map((item) => firstCommandName(item.cmd)));
  const additions: StudyItem[] = [];

  for (const task of module.tasks) {
    for (const rawCommand of task.hint.en.split(/\r?\n/)) {
      const command = rawCommand.trim();
      if (!command) continue;
      const name = firstCommandName(command);
      if (covered.has(name)) continue;
      const guide = commandLessonForLabel(command);
      const catalog = findLinuxCommand(name);
      if (!guide && !catalog) continue;
      const desc = guide?.purpose || {
        en: catalog?.summary || `Practice ${name} in this objective.`,
        el: catalog ? `${catalog.name}: ${task.instruction.el}` : `${name}: ${task.instruction.el}`,
      };
      additions.push({ cmd: command, desc, guide });
      covered.add(name);
    }
  }

  return [...items, ...additions];
}

function taskLearningSources(task: Task) {
  const lines = task.hint.en.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const lesson = lines.map(commandLessonForLabel).find((item) => item !== undefined)
    || commandLessonForLabel(task.instruction.en);
  const catalog = lines.map((line) => findLinuxCommand(firstCommandName(line))).find((item) => item !== undefined);
  return { lesson, catalog };
}

function normalizeCopy(text: string): string {
  return text.replace(/\s+/g, " ").trim().toLocaleLowerCase("el");
}

function overlapsCopy(candidate: string, existing: string[]): boolean {
  const next = normalizeCopy(candidate);
  if (!next) return true;
  return existing.some((item) => {
    const prior = normalizeCopy(item);
    if (!prior) return false;
    if (prior === next) return true;
    const shorter = prior.length <= next.length ? prior : next;
    const longer = prior.length <= next.length ? next : prior;
    return shorter.length >= 18 && longer.includes(shorter);
  });
}

function markerAt(lower: string, markers: string[]): { index: number; length: number } | null {
  let best: { index: number; length: number } | null = null;
  for (const marker of markers) {
    const index = lower.indexOf(marker);
    if (index === -1) continue;
    if (!best || index < best.index) best = { index, length: marker.length };
  }
  return best;
}

/** Keep the reason separate from a trailing how-clause so the popup does not print both. */
function splitExplain(text: string): { why: string; howHint: string } {
  const source = text.trim();
  const lower = source.toLocaleLowerCase("el");
  const why = markerAt(lower, ["why:", "γιατί:", "γιατι:"]);
  const how = markerAt(lower, ["how:", "πώς:", "πως:"]);
  if (why && why.index <= 2 && how && how.index > why.index) {
    return {
      why: source.slice(why.index + why.length, how.index).trim(),
      howHint: source.slice(how.index + how.length).trim(),
    };
  }
  if (why && why.index <= 2) return { why: source.slice(why.index + why.length).trim(), howHint: "" };
  return { why: source, howHint: "" };
}

function fieldGuideForTask(task: Task, lang: Lang): { why: string; how: string[]; verify: string } {
  const { lesson, catalog } = taskLearningSources(task);
  const objective = bi(task.instruction, lang);
  const { why, howHint } = splitExplain(bi(task.explain, lang));
  const kept = [objective, why];
  const how: string[] = [];
  const push = (text: string) => {
    const clean = text.trim();
    if (!clean || overlapsCopy(clean, [...kept, ...how])) return;
    how.push(clean);
  };

  // Short how-clauses only restate the command already shown as the objective.
  if (howHint.length > 80) {
    const sentence = howHint.charAt(0).toLocaleUpperCase("el") + howHint.slice(1);
    push(sentence);
  }
  if (lesson) push(lesson.mechanics[lang]);
  else if (catalog) {
    push(catalog.summary);
    push(lang === "en" ? `Syntax: ${catalog.synopsis}.` : `Σύνταξη: ${catalog.synopsis}.`);
  }

  const output = lesson?.output[lang].trim() || "";
  const verify = output && !overlapsCopy(output, [...kept, ...how]) ? output : "";
  return { why: why || bi(task.explain, lang), how, verify };
}

export default function ModuleView({
  module,
  userId,
  campaignId,
  lang,
  initialTab,
  topbarTools,
  done,
  moduleCompleted,
  contentWidth,
  onWidth,
  onTask,
  onCommandMetric,
  onHint,
  onStartQuiz,
  onStartAssessment,
  assessmentTaken,
  hasQuiz,
  hasAssessment,
  onCompleteLab,
  onBack,
}: {
  module: Module;
  userId: string;
  campaignId: string;
  lang: Lang;
  initialTab?: "lab" | "theory";
  topbarTools: ReactNode;
  done: string[];
  moduleCompleted: boolean;
  contentWidth?: ContentWidth;
  onWidth: (w: ContentWidth) => void;
  onTask: (taskId: string, hintUsed: boolean) => void;
  onCommandMetric: (pasted: boolean, typo: boolean, execution: CommandExecutionInput) => void;
  onHint: () => void;
  onStartQuiz: () => void;
  onStartAssessment: () => void;
  assessmentTaken?: boolean;
  /** False for an authored lab: the educator wrote no quiz for it yet. */
  hasQuiz?: boolean;
  hasAssessment?: boolean;
  /** Marks the lab complete without a quiz. */
  onCompleteLab: () => void;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<"lab" | "theory">(initialTab || "lab");
  // Finished objectives collapse; this holds the ones the player opened again.
  const [shown, setShown] = useState<Record<string, boolean>>({});
  const theoryCommands = useMemo(() => theoryItemsForModule(module), [module]);
  const [term, setTerm] = useState<Terminal>(() =>
    activateTerminalForModule(loadPlayerTerminal(userId), module.id, module.scenario || "lab")
  );
  const hintStorageKey = `gamehack.hints.v1:${userId}:${module.id}`;
  const legacyHintStorageKey = `hackforge.hints.v1:${userId}:${module.id}`;
  const [hints, setHints] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(hintStorageKey) ?? localStorage.getItem(legacyHintStorageKey);
      if (stored !== null && localStorage.getItem(hintStorageKey) === null) localStorage.setItem(hintStorageKey, stored);
      localStorage.removeItem(legacyHintStorageKey);
      return stored ? JSON.parse(stored) as Record<string, boolean> : {};
    } catch {
      return {};
    }
  });
  const [explain, setExplain] = useState<string | null>(null);
  const [commandResult, setCommandResult] = useState<CommandExplanation | null>(null);
  const [commandSuggestion, setCommandSuggestion] = useState<string | null>(null);
  const commandPopupStorageKey = `gamehack.command-tutor.v1:${userId}:${module.id}`;
  const legacyCommandPopupStorageKey = `hackforge.command-tutor.v1:${userId}:${module.id}`;
  const [seenPopupFamilies, setSeenPopupFamilies] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(commandPopupStorageKey) ?? localStorage.getItem(legacyCommandPopupStorageKey);
      if (stored !== null && localStorage.getItem(commandPopupStorageKey) === null) localStorage.setItem(commandPopupStorageKey, stored);
      localStorage.removeItem(legacyCommandPopupStorageKey);
      const parsed: unknown = stored ? JSON.parse(stored) : [];
      return new Set(Array.isArray(parsed) ? parsed.filter((value): value is string => typeof value === "string") : []);
    } catch {
      return new Set();
    }
  });
  const [, bump] = useState(0);
  const moduleViewRef = useRef<HTMLDivElement>(null);
  const moduleTopbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    savePlayerTerminal(userId, term);
  }, [userId]);

  useEffect(() => {
    const root = moduleViewRef.current;
    const topbar = moduleTopbarRef.current;
    if (!root || !topbar) return;

    const updateStickyOffset = () => {
      const topbarStickyInset = Number.parseFloat(getComputedStyle(topbar).top) || 0;
      const topbarGap = 12;
      root.style.setProperty(
        "--terminal-sticky-top",
        `${Math.ceil(topbarStickyInset + topbar.getBoundingClientRect().height + topbarGap)}px`,
      );
    };

    updateStickyOffset();
    const observer = new ResizeObserver(updateStickyOffset);
    observer.observe(topbar);
    window.addEventListener("resize", updateStickyOffset);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateStickyOffset);
    };
  }, []);

  const tasksDone = module.tasks.filter((x) => done.includes(x.id) || x.check(term));
  const allTasks = tasksDone.length >= module.tasks.length;
  const ch1 = done.includes("ch-0") || module.challenges[0].check(term);
  const ch2 = done.includes("ch-1") || module.challenges[1].check(term);
  const moduleComplete = allTasks && ch1 && ch2;

  const progress = useMemo(() => {
    const total = module.tasks.length + 2;
    const n = (allTasks ? module.tasks.length : tasksDone.length) + (ch1 ? 1 : 0) + (ch2 ? 1 : 0);
    return Math.round((n / total) * 100);
  }, [allTasks, tasksDone.length, ch1, ch2, module.tasks.length]);
  const defaultContentWidth: ContentWidth = tab === "theory" ? "wide" : "full";
  const activeContentWidth = contentWidth ?? defaultContentWidth;
  const whyHowTask = module.tasks.find((task) => task.id === explain) || null;

  const revealHint = (taskId: string) => {
    if (hints[taskId]) return;
    const nextHints = { ...hints, [taskId]: true };
    setHints(nextHints);
    try {
      localStorage.setItem(hintStorageKey, JSON.stringify(nextHints));
    } catch {
      // The hint remains available for this mounted lab if storage is unavailable.
    }
    onHint();
  };

  const applyChecks = (t0: Terminal) => {
    for (const task of module.tasks) {
      if (!done.includes(task.id) && task.check(t0)) {
        onTask(task.id, Boolean(hints[task.id]));
        sound.taskDone();
      }
    }
    if (allTasks || module.tasks.every((x) => done.includes(x.id) || x.check(t0))) {
      if (!done.includes("ch-0") && module.challenges[0].check(t0)) {
        onTask("ch-0", false);
        sound.challengeDone();
      }
      if (!done.includes("ch-1") && module.challenges[1].check(t0)) {
        onTask("ch-1", false);
        sound.challengeDone();
      }
    }
  };

  return (
    <div ref={moduleViewRef} className="space-y-3">
      <div ref={moduleTopbarRef} className="module-topbar sticky top-0 z-10 -mx-4 -mt-4 px-4 py-2 sm:-mx-6 sm:-mt-6 sm:px-6 lg:-mx-8 lg:-mt-8 lg:px-8">
        <div className="module-topbar__row">
          <div className="module-topbar__identity">
            <button type="button" onClick={onBack} className="module-topbar__back">
              ← {t("backToMap", lang)}
            </button>

            <div className="module-topbar__lab">
              <div className={`module-topbar__icon bg-gradient-to-br ${module.color}`}>
                <Icon name={module.icon} className="w-5 h-5 text-white" />
              </div>
              <div className="module-topbar__copy">
                <h1 className="module-topbar__title">{bi(module.title, lang)}</h1>
                <p className="module-topbar__subtitle">{bi(module.subtitle, lang)}</p>
              </div>
            </div>
          </div>

          {topbarTools}
        </div>

        <div className="module-topbar__controls" role="group" aria-label={lang === "el" ? "Πλοήγηση μαθήματος" : "Lesson navigation"}>
          <div className="module-topbar__difficulty" aria-label={`${t("difficulty", lang)} ${module.difficulty} of 5`}>
            <span>{t("difficulty", lang)}</span>
            <b aria-hidden="true">{"▲".repeat(module.difficulty)}<i>{"△".repeat(5 - module.difficulty)}</i></b>
          </div>

          <div className="module-topbar__progress-copy" aria-label={`${t("progress", lang)} ${progress}%`}>
            <b>{progress}%</b>
            <span>{t("progress", lang)}</span>
          </div>

          <nav className="module-topbar__tabs" aria-label={lang === "el" ? "Ενότητες μαθήματος" : "Module sections"}>
            {(["lab", "theory"] as const).map((k) => (
              <button
                key={k}
                type="button"
                aria-current={tab === k ? "page" : undefined}
                onClick={() => setTab(k)}
                className={cn("module-topbar__tab", tab === k && "is-active")}
              >
                {t(k, lang)}
              </button>
            ))}
          </nav>

          <div className="module-topbar__width-control" title={lang === "el" ? "Πλάτος περιεχομένου" : "Content width"}>
            <WidthControl value={activeContentWidth} onChange={onWidth} />
          </div>
        </div>

        <div className="module-topbar__track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
          <div className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 bar-grow" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className={contentWidthClass(activeContentWidth)}>
        {tab === "theory" && (
          <div className="space-y-6 enter">
            {theoryCommands.length > 0 && (
              <section className="glass rounded-2xl border border-gamehack-border p-5">
                <header className="mb-4">
                  <h2 className="text-xl font-semibold text-zinc-100">{t("commandDeepDives", lang)}</h2>
                  <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{t("commandDeepDivesDescription", lang)}</p>
                </header>
                <div className="grid gap-4 md:grid-cols-2">
                  {theoryCommands.map((item, index) => (
                    <article key={`${item.cmd}-${index}`} className="rounded-xl border border-gamehack-border bg-black/20 p-4">
                      <div className="flex items-start gap-3">
                        <span className="font-mono text-sm text-cyan-400">{String(index + 1).padStart(2, "0")}</span>
                        <div className="min-w-0">
                          <h3 className="text-base font-semibold text-zinc-100">
                            {item.guide?.title[lang] || bi(item.desc, lang)}
                          </h3>
                          <code className="mt-1 block whitespace-pre-wrap break-words text-sm text-cyan-200">{item.cmd}</code>
                        </div>
                      </div>
                      <div className="mt-3 space-y-3">
                        {theoryBlocksForCommand(item.cmd, item.guide).map((block, paragraphIndex) => (
                          <p key={paragraphIndex} className="text-sm text-zinc-300 leading-relaxed">
                            <span className="mb-1 block text-xs font-medium text-iron-400">{t(block.labelKey, lang)}</span>
                            {block.text[lang]}
                          </p>
                        ))}
                      </div>
                      {item.guide?.syntax && (
                        <div className="mt-3 rounded-lg border border-gamehack-border bg-black/40 p-3">
                          <div className="text-sm text-iron-400">{t("commandSyntax", lang)}</div>
                          <code className="mt-1 block whitespace-pre-wrap break-words text-sm text-zinc-200">{item.guide.syntax}</code>
                        </div>
                      )}
                      {item.guide?.example && (
                        <div className="mt-3 rounded-lg border border-gamehack-border bg-black/40 p-3">
                          <div className="text-sm text-iron-400">{t("commandExample", lang)}</div>
                          <code className="mt-1 block whitespace-pre-wrap break-words text-sm text-zinc-200">{item.guide.example}</code>
                          <button
                            type="button"
                            aria-label={`${t("tryInTerminal", lang)}: ${item.guide.example}`}
                            onClick={() => {
                              const example = item.guide?.example;
                              if (!example) return;
                              setCommandSuggestion(example);
                              setTab("lab");
                              sound.popup();
                            }}
                            className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-cyan-500/40 px-2.5 py-1.5 text-xs font-semibold text-cyan-200 transition-colors hover:border-cyan-400 hover:bg-cyan-500/10"
                          >
                            <Icon name="terminal" className="h-3.5 w-3.5" />
                            {t("tryInTerminal", lang)}
                          </button>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            )}
            {module.theory.map((s, i) => (
              <section key={i} className="glass rounded-2xl border border-gamehack-border p-5">
                <h2 className="text-lg font-semibold text-zinc-100 mb-2">{bi(s.heading, lang)}</h2>
                <div className="space-y-3">
                  {bi(s.body, lang).split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean).map((paragraph, paragraphIndex) => (
                    <p key={paragraphIndex} className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">{paragraph}</p>
                  ))}
                </div>
                {s.tip && (
                  <p className="mt-3 text-sm text-neon-cyan/90 border-l-2 border-neon-cyan/40 pl-3">{bi(s.tip, lang)}</p>
                )}
                {s.shots?.map((sh, si) => (
                  <div key={si} className="mt-4 rounded-xl border border-gamehack-border bg-black/70 overflow-hidden font-mono text-sm">
                    <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/5 text-sm text-iron-500">
                      <span className="h-2 w-2 rounded-full bg-rose-500/80" />
                      <span className="h-2 w-2 rounded-full bg-cyan-400/80" />
                      <span className="h-2 w-2 rounded-full bg-neon-green/80" />
                      <span className="ml-2 tracking-wider text-iron-400">screenshot, GameHack lab</span>
                    </div>
                    <pre className="px-3 py-3 text-zinc-200 whitespace-pre-wrap leading-relaxed">
                      {sh.cmd && <span className="text-cyan-400">root@kali:~# {sh.cmd}{"\n"}</span>}
                      {sh.lines.join("\n")}
                    </pre>
                  </div>
                ))}
                {s.visual && <DfirVisual visual={s.visual} lang={lang} />}
              </section>
            ))}
            <button
              type="button"
              onClick={() => {
                setTab("lab");
                sound.popup();
              }}
              className="rounded-xl bg-gradient-to-r from-cyan-600 to-cyan-500 px-5 py-3 font-bold text-white shimmer-hover"
            >
              {t("beginLab", lang)}
            </button>
          </div>
        )}

        {tab === "lab" && (
          <div className="module-lab-layout grid lg:grid-cols-[320px_minmax(0,1fr)] gap-4">
            <TerminalView
              term={term}
              lang={lang}
              suggestion={commandSuggestion}
              onSuggestionConsumed={() => setCommandSuggestion(null)}
              onRevert={() => {
                const restored = resetPlayerTerminal(userId, {
                  moduleId: module.id,
                  scenario: module.scenario || "lab",
                  notice: t("labRestored", lang),
                });
                setCommandResult(null);
                setCommandSuggestion(null);
                setTerm(restored);
                bump((x) => x + 1);
              }}
              onCommand={(raw, pasted) => {
                if (!raw.trim()) return;
                const cwd = term.cwd;
                const lines = runCommand(term, raw);
                if (raw.trim() === "clear") {
                  term.lines = [];
                } else {
                  term.lines = [...term.lines, ...lines];
                }
                for (const line of lines) {
                  const flags = line.text.match(/FLAG\{[^}]+\}/g) || [];
                  flags.forEach((flag) => term.flags.add(`saw:${flag}`));
                }
                const relevantFamilies = relevantCommandFamiliesForModule(module, raw, term);
                const firstRunFamilies = relevantFamilies.filter((family) => !seenPopupFamilies.has(family));
                if (firstRunFamilies.length > 0) {
                  const nextSeen = new Set(seenPopupFamilies);
                  relevantFamilies.forEach((family) => nextSeen.add(family));
                  setSeenPopupFamilies(nextSeen);
                  try {
                    localStorage.setItem(commandPopupStorageKey, JSON.stringify([...nextSeen]));
                  } catch {
                    // Popup remains one-time for the current mounted lab if storage is unavailable.
                  }
                  setCommandResult(explainCommandResult(raw, lines, term, lang));
                } else {
                  setCommandResult(null);
                }
                const typo = term.lastExit === 127;
                onCommandMetric(pasted, typo, {
                  command: raw,
                  campaignId,
                  moduleId: module.id,
                  cwd,
                  exitCode: term.lastExit,
                  output: lines.filter((line) => line.kind !== "in").map((line) => line.text).join("\n"),
                });
                applyChecks(term);
                savePlayerTerminal(userId, term);
                setTerm(term);
                bump((x) => x + 1);
              }}
            />
            <aside className="module-objectives space-y-4">
              <div className="glass rounded-2xl border border-gamehack-border p-4">
                <div className="text-sm uppercase tracking-widest text-cyan-400 mb-3">{uppercaseLabel(t("objectives", lang), lang)}</div>
                <ol className="space-y-3">
                  {module.tasks.map((task, idx) => {
                    const ok = done.includes(task.id) || task.check(term);
                    const collapsed = ok && !shown[task.id];
                    return (
                      <li key={task.id} className="text-sm">
                        <div className="flex items-start gap-2">
                          <span className={cn("mt-0.5", ok ? "text-neon-green" : "text-iron-500")}>
                            {ok ? "●" : "○"}
                          </span>
                          <div className="flex-1">
                            {collapsed ? (
                              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                                <span className="text-zinc-500 line-through">
                                  {idx + 1}. {bi(task.instruction, lang)}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setShown((current) => ({ ...current, [task.id]: true }))}
                                  aria-expanded={false}
                                  className="text-sm text-cyan-400 hover:underline"
                                >
                                  {t("showObjective", lang)}
                                </button>
                              </div>
                            ) : (
                              <>
                            <div className={ok ? "text-zinc-500 line-through" : "text-zinc-200"}>
                              {idx + 1}. {bi(task.instruction, lang)}
                              <span className="ml-2 rounded-full border border-cyan-400/30 px-2 py-0.5 text-xs text-cyan-300">
                                +{task.reward ?? 5} {t("xp", lang)}
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-zinc-400 leading-5 line-clamp-3">
                              {splitExplain(bi(task.explain, lang)).why}
                            </p>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                              {!ok && (
                                <button
                                  type="button"
                                  onClick={() => revealHint(task.id)}
                                  disabled={hints[task.id]}
                                  className="text-sm text-cyan-400 hover:underline disabled:cursor-default disabled:text-cyan-300"
                                >
                                  {hints[task.id]
                                    ? t("hintRevealed", lang)
                                    : t("showExactHint", lang).replace("{xp}", String(HINT_XP_PENALTY))}
                                </button>
                              )}
                              {ok && (
                                <button
                                  type="button"
                                  onClick={() => setShown((current) => ({ ...current, [task.id]: false }))}
                                  aria-expanded
                                  className="text-sm text-cyan-400 hover:underline"
                                >
                                  {t("hideObjective", lang)}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setExplain(explain === task.id ? null : task.id)}
                                aria-expanded={explain === task.id}
                                aria-controls="why-how-popup"
                                className="text-sm text-neon-cyan hover:underline"
                              >
                                {t("whyHow", lang)}
                              </button>
                            </div>
                            {hints[task.id] && (
                              <div className="mt-2 rounded-lg border border-cyan-400/25 bg-cyan-400/5 p-3" role="status">
                                <p className="text-sm text-cyan-200 leading-relaxed">
                                  {t("hintPenaltyApplied", lang).replace("{xp}", String(HINT_XP_PENALTY))}
                                </p>
                                <pre className="mt-2 whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-cyan-100">
                                  {bi(task.hint, lang).trim()}
                                </pre>
                              </div>
                            )}
                            {task.material && bi(task.material, lang).trim() && (
                              <div className="mt-2 rounded-lg border border-gamehack-border bg-black/20 p-3">
                                <div className="text-xs uppercase tracking-widest text-iron-400">
                                  {t("additionalMaterial", lang)}
                                </div>
                                <p className="mt-1 whitespace-pre-wrap break-words text-sm leading-6 text-zinc-300">
                                  {bi(task.material, lang).trim()}
                                </p>
                              </div>
                            )}
                              </>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>

              <div className="glass rounded-2xl border border-gamehack-border p-4">
                <div className="text-sm uppercase tracking-widest text-cyan-400 mb-2">{uppercaseLabel(t("finalChallenges", lang), lang)}</div>
                {!allTasks ? (
                  <p className="text-sm text-iron-500">{t("challengeLocked", lang)}</p>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-iron-400">{t("solveBothToProceed", lang)}</p>
                    {module.challenges.map((ch, i) => {
                      const ok = i === 0 ? ch1 : ch2;
                      return (
                        <div key={i} className="text-sm">
                          <div className="flex items-center gap-2">
                            <span className={ok ? "text-neon-green" : "text-cyan-400"}>{ok ? "✔" : "◆"}</span>
                            <span className="font-semibold text-zinc-100">{bi(ch.title, lang)}</span>
                          </div>
                          <p className="text-sm text-zinc-400 mt-1 ml-5">{bi(ch.brief, lang)}</p>
                          <p className="text-sm text-zinc-600 ml-5">{t("noHints", lang)}</p>
                          {ok && <p className="text-sm text-neon-green ml-5 mt-1">{bi(ch.success, lang)}</p>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </aside>
            {moduleComplete && !moduleCompleted && (
              <section className="glass flex flex-col gap-4 rounded-2xl border border-neon-green/25 p-4 sm:flex-row sm:items-center sm:justify-between lg:col-span-2" aria-labelledby="lab-quiz-prompt-title">
                <div>
                  <h2 id="lab-quiz-prompt-title" className="text-base font-semibold text-zinc-100">{t("labComplete", lang)}</h2>
                  {hasQuiz
                    ? <p className="mt-1 text-sm leading-relaxed text-zinc-400">{t("quizPassRequirement", lang)}</p>
                    : <p className="mt-1 text-sm leading-relaxed text-zinc-400">{t("noQuizForLab", lang)}</p>}
                  {hasAssessment && <p className="mt-1 text-sm leading-relaxed text-iron-500">{t("assessmentPrompt", lang)}</p>}
                </div>
                <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                  {hasAssessment && (
                    <button
                      type="button"
                      onClick={onStartAssessment}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-violet-500/50 px-4 py-2.5 font-semibold text-violet-200 transition hover:border-violet-400 hover:text-violet-100"
                    >
                      {assessmentTaken ? t("assessmentTaken", lang) : t("startAssessment", lang)}
                    </button>
                  )}
                  {hasQuiz ? (
                    <button
                      type="button"
                      onClick={onStartQuiz}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 font-semibold text-white transition hover:bg-cyan-500"
                    >
                      {t("startQuickQuiz", lang)}
                      <Icon name="chevron" className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={onCompleteLab}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 font-semibold text-white transition hover:bg-cyan-500"
                    >
                      {t("markLabComplete", lang)}
                      <Icon name="chevron" className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
      {commandResult && (
        <CommandResultPopup
          result={commandResult}
          lang={lang}
          onClose={() => setCommandResult(null)}
        />
      )}
      {whyHowTask && (
        <WhyHowPopup
          moduleTitle={bi(module.title, lang)}
          objective={bi(whyHowTask.instruction, lang)}
          {...fieldGuideForTask(whyHowTask, lang)}
          lang={lang}
          onClose={() => setExplain(null)}
        />
      )}
    </div>
  );
}
