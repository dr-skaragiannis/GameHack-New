import { useEffect, useMemo, useRef, useState } from "react";
import type { Module, Task } from "../data/lessons";
import { bi, t, type Lang } from "../i18n";
import {
  createTerminal,
  defaultFS,
  ravenFS,
  runCommand,
  sshFS,
  type Terminal,
} from "../lib/terminal";
import { sudoRunFS } from "../lib/sudorun";
import { dfirFS } from "../lib/dfir";
import TerminalView from "./TerminalView";
import Icon from "./Icon";
import { cn } from "../utils/cn";
import { contentWidthClass, HINT_XP_PENALTY, type ContentWidth } from "../lib/db";
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
import CommandStudyGuide from "./CommandStudyGuide";
import CommandResultPopup from "./CommandResultPopup";
import DfirVisual from "./DfirVisual";

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

function taskObjectiveContext(task: Task, lang: Lang): string {
  const { lesson, catalog } = taskLearningSources(task);
  if (lesson) {
    return `${lesson.purpose[lang]} ${lesson.mechanics[lang].split(/(?<=[.!?])\s+/, 1)[0]}`;
  }
  if (catalog) {
    return lang === "en"
      ? `${catalog.summary} Syntax: ${catalog.synopsis}.`
      : `${catalog.name}: ${bi(task.instruction, lang)} Η σύνταξη ${catalog.synopsis} δείχνει τη σειρά των ορισμάτων.`;
  }
  return lang === "en"
    ? "Practice the command shown above, then inspect its output as evidence before continuing."
    : "Εξασκήσου στην εντολή που εμφανίζεται και έλεγξε την έξοδό της ως τεκμήριο πριν συνεχίσεις.";
}

function taskWhyHow(task: Task, lang: Lang): string[] {
  const { lesson, catalog } = taskLearningSources(task);
  const details = [bi(task.explain, lang)];
  if (lesson) {
    details.push(lesson.mechanics[lang], lesson.output[lang]);
  } else if (catalog) {
    details.push(lang === "en" ? catalog.summary : `${catalog.name}: ${bi(task.instruction, lang)}`);
    details.push(lang === "en"
      ? `Use ${catalog.synopsis} to structure the arguments; compare the output with the objective.`
      : `Η σύνταξη ${catalog.synopsis} οργανώνει τα ορίσματα· σύγκρινε την έξοδο με τον στόχο.`);
  } else {
    details.push(taskObjectiveContext(task, lang));
    details.push(lang === "en"
      ? "The lab uses virtual evidence, so results stay inside this safe simulation."
      : "Το εργαστήριο χρησιμοποιεί εικονικά τεκμήρια, οπότε τα αποτελέσματα μένουν στην ασφαλή προσομοίωση.");
  }
  return details.filter(Boolean).slice(0, 4);
}

function commandTheoryParagraphs(item: StudyItem, lang: Lang): string[] {
  if (item.guide) {
    return [item.guide.purpose[lang], item.guide.mechanics[lang], item.guide.output[lang]];
  }
  const catalog = findLinuxCommand(firstCommandName(item.cmd));
  if (catalog) {
    return lang === "en"
      ? [catalog.summary, `Syntax: ${catalog.synopsis}.`, `Example: ${catalog.example}.`]
      : [
          bi(item.desc, lang),
          `Η εντολή ${catalog.name} λειτουργεί με τη σύνταξη ${catalog.synopsis}.`,
          `Παράδειγμα: ${catalog.example}. Έλεγξε αν η έξοδος ταιριάζει με τον στόχο του εργαστηρίου.`,
        ];
  }
  return [
    bi(item.desc, lang),
    lang === "en"
      ? "Use this shell shortcut to complete or inspect the current input; it does not run a command by itself."
      : "Χρησιμοποίησε αυτή τη συντόμευση του shell για συμπλήρωση ή έλεγχο της εισόδου· δεν εκτελεί μόνη της εντολή.",
    lang === "en"
      ? "Confirm the resulting command or candidate path before pressing Enter."
      : "Έλεγξε την εντολή ή τη διαδρομή που προέκυψε πριν πατήσεις Enter.",
  ];
}

export default function ModuleView({
  module,
  userId,
  lang,
  initialTab,
  done,
  contentWidth,
  onWidth,
  onTask,
  onCommandMetric,
  onHint,
  onComplete,
  onBack,
}: {
  module: Module;
  userId: string;
  lang: Lang;
  initialTab?: "theory" | "guide" | "lab";
  done: string[];
  contentWidth?: ContentWidth;
  onWidth: (w: ContentWidth) => void;
  onTask: (taskId: string, hintUsed: boolean) => void;
  onCommandMetric: (pasted: boolean, typo: boolean) => void;
  onHint: () => void;
  onComplete: () => void;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<"theory" | "guide" | "lab">(initialTab || (done.length ? "lab" : "theory"));
  const theoryCommands = useMemo(() => theoryItemsForModule(module), [module]);
  const [term, setTerm] = useState<Terminal>(() =>
    createTerminal({
      fs: module.labFS
        ? module.labFS()
        : module.scenario === "raven"
          ? ravenFS()
          : module.scenario === "ssh"
            ? sshFS()
            : module.scenario === "sudorun"
              ? sudoRunFS()
              : module.scenario === "dfir"
                ? dfirFS()
              : defaultFS(),
      user: module.scenario === "sudorun" ? "root" : module.scenario === "dfir" ? "analyst" : "operator",
      host: module.scenario === "dfir" ? "forensics-workstation" : undefined,
      scenario: module.scenario || "lab",
    })
  );
  const hintStorageKey = `hackforge.hints.v1:${userId}:${module.id}`;
  const [hints, setHints] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem(hintStorageKey);
      return stored ? JSON.parse(stored) as Record<string, boolean> : {};
    } catch {
      return {};
    }
  });
  const [explain, setExplain] = useState<string | null>(null);
  const [finished, setFinished] = useState(false);
  const [commandResult, setCommandResult] = useState<CommandExplanation | null>(null);
  const [commandSuggestion, setCommandSuggestion] = useState<string | null>(null);
  const commandPopupStorageKey = `hackforge.command-tutor.v1:${userId}:${module.id}`;
  const [seenPopupFamilies, setSeenPopupFamilies] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(commandPopupStorageKey);
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
    const root = moduleViewRef.current;
    const topbar = moduleTopbarRef.current;
    if (!root || !topbar) return;

    const updateStickyOffset = () => {
      const appHeaderHeight = document.querySelector("main")?.previousElementSibling?.getBoundingClientRect().height ?? 64;
      const topbarGap = 12;
      root.style.setProperty(
        "--terminal-sticky-top",
        `${Math.ceil(appHeaderHeight + topbar.getBoundingClientRect().height + topbarGap)}px`,
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

  const progress = useMemo(() => {
    const total = module.tasks.length + 2;
    const n = (allTasks ? module.tasks.length : tasksDone.length) + (ch1 ? 1 : 0) + (ch2 ? 1 : 0);
    return Math.round((n / total) * 100);
  }, [allTasks, tasksDone.length, ch1, ch2, module.tasks.length]);
  const defaultContentWidth: ContentWidth = tab === "theory" ? "wide" : "full";
  const activeContentWidth = contentWidth ?? defaultContentWidth;

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
    const tasksNow = module.tasks.every((x) => done.includes(x.id) || x.check(t0));
    const c1 = done.includes("ch-0") || module.challenges[0].check(t0);
    const c2 = done.includes("ch-1") || module.challenges[1].check(t0);
    if (tasksNow && c1 && c2 && !finished) {
      setFinished(true);
      sound.moduleComplete();
      onComplete();
    }
  };

  return (
    <div ref={moduleViewRef} className="space-y-3">
      <div ref={moduleTopbarRef} className="module-topbar sticky top-16 z-10 -mx-4 -mt-4 px-4 py-2 sm:-mx-6 sm:-mt-6 sm:px-6 lg:-mx-8 lg:-mt-8 lg:px-8">
        <div className="module-topbar__row">
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

          <div className="module-topbar__difficulty" aria-label={`${t("difficulty", lang)} ${module.difficulty} of 5`}>
            <span>{t("difficulty", lang)}</span>
            <b>{"▲".repeat(module.difficulty)}<i>{"△".repeat(5 - module.difficulty)}</i></b>
          </div>

          <div className="module-topbar__progress-copy">
            <b>{progress}%</b>
            <span>{t("progress", lang)}</span>
          </div>

          <div className="module-topbar__navigation">
            <nav className="module-topbar__tabs" aria-label={lang === "el" ? "Ενότητες μαθήματος" : "Module sections"}>
              {(["theory", "guide", "lab"] as const).map((k) => (
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
            <WidthControl value={activeContentWidth} onChange={onWidth} />
          </div>
        </div>
        <div className="module-topbar__track" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
          <div className="h-full bg-gradient-to-r from-ember-600 to-ember-400 bar-grow" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className={contentWidthClass(activeContentWidth)}>
        {tab === "theory" && (
          <div className="space-y-6 enter">
            {module.theory.map((s, i) => (
              <section key={i} className="glass rounded-2xl border border-forge-border p-5">
                <h2 className="text-lg font-semibold text-zinc-100 mb-2">{bi(s.heading, lang)}</h2>
                <p className="text-sm text-zinc-300 leading-relaxed">{bi(s.body, lang)}</p>
                {s.tip && (
                  <p className="mt-3 text-sm text-neon-cyan/90 border-l-2 border-neon-cyan/40 pl-3">{bi(s.tip, lang)}</p>
                )}
                {s.shots?.map((sh, si) => (
                  <div key={si} className="mt-4 rounded-xl border border-forge-border bg-black/70 overflow-hidden font-mono text-sm">
                    <div className="flex items-center gap-2 px-3 py-1.5 border-b border-white/5 text-sm text-iron-500">
                      <span className="h-2 w-2 rounded-full bg-rose-500/80" />
                      <span className="h-2 w-2 rounded-full bg-amber-400/80" />
                      <span className="h-2 w-2 rounded-full bg-neon-green/80" />
                      <span className="ml-2 tracking-wider text-iron-400">screenshot · HackForge lab</span>
                    </div>
                    <pre className="px-3 py-3 text-zinc-200 whitespace-pre-wrap leading-relaxed">
                      {sh.cmd && <span className="text-ember-400">root@kali:~# {sh.cmd}{"\n"}</span>}
                      {sh.lines.join("\n")}
                    </pre>
                  </div>
                ))}
                {s.visual && <DfirVisual visual={s.visual} lang={lang} />}
              </section>
            ))}
            {theoryCommands.length > 0 && (
              <section className="glass rounded-2xl border border-forge-border p-5">
                <header className="mb-4">
                  <h2 className="text-xl font-semibold text-zinc-100">{t("commandDeepDives", lang)}</h2>
                  <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{t("commandDeepDivesDescription", lang)}</p>
                </header>
                <div className="grid gap-4 md:grid-cols-2">
                  {theoryCommands.map((item, index) => (
                    <article key={`${item.cmd}-${index}`} className="rounded-xl border border-forge-border bg-black/20 p-4">
                      <div className="flex items-start gap-3">
                        <span className="font-mono text-sm text-ember-400">{String(index + 1).padStart(2, "0")}</span>
                        <div className="min-w-0">
                          <h3 className="text-base font-semibold text-zinc-100">
                            {item.guide?.title[lang] || bi(item.desc, lang)}
                          </h3>
                          <code className="mt-1 block whitespace-pre-wrap break-words text-sm text-amber-200">{item.cmd}</code>
                        </div>
                      </div>
                      <div className="mt-3 space-y-2">
                        {commandTheoryParagraphs(item, lang).map((paragraph, paragraphIndex) => (
                          <p key={paragraphIndex} className="text-sm text-zinc-300 leading-relaxed">{paragraph}</p>
                        ))}
                      </div>
                      {item.guide?.syntax && (
                        <div className="mt-3 rounded-lg border border-forge-border bg-black/40 p-3">
                          <div className="text-sm text-iron-400">{t("commandSyntax", lang)}</div>
                          <code className="mt-1 block whitespace-pre-wrap break-words text-sm text-zinc-200">{item.guide.syntax}</code>
                        </div>
                      )}
                      {item.guide?.caution && (
                        <p className="mt-3 text-sm text-amber-200/90 leading-relaxed">{item.guide.caution[lang]}</p>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            )}
            <button
              type="button"
              onClick={() => {
                setTab("lab");
                sound.popup();
              }}
              className="rounded-xl bg-gradient-to-r from-ember-600 to-ember-500 px-5 py-3 font-bold text-white shimmer-hover"
            >
              {t("beginLab", lang)}
            </button>
          </div>
        )}

        {tab === "guide" && (
          <CommandStudyGuide
            module={module}
            lang={lang}
            onTry={(command) => {
              setCommandSuggestion(command);
              setTab("lab");
              sound.popup();
            }}
          />
        )}

        {tab === "lab" && (
          <div className="grid lg:grid-cols-[minmax(0,1fr)_320px] gap-4">
            <TerminalView
              term={term}
              lang={lang}
              suggestion={commandSuggestion}
              onSuggestionConsumed={() => setCommandSuggestion(null)}
              onCommand={(raw, pasted) => {
                if (!raw.trim()) return;
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
                onCommandMetric(pasted, typo);
                applyChecks(term);
                setTerm(term);
                bump((x) => x + 1);
              }}
            />
            <aside className="space-y-4">
              <div className="glass rounded-2xl border border-forge-border p-4">
                <div className="text-sm uppercase tracking-widest text-ember-400 mb-3">{t("objectives", lang)}</div>
                <ol className="space-y-3">
                  {module.tasks.map((task, idx) => {
                    const ok = done.includes(task.id) || task.check(term);
                    return (
                      <li key={task.id} className="text-sm">
                        <div className="flex items-start gap-2">
                          <span className={cn("mt-0.5", ok ? "text-neon-green" : "text-iron-500")}>
                            {ok ? "●" : "○"}
                          </span>
                          <div className="flex-1">
                            <div className={ok ? "text-zinc-500 line-through" : "text-zinc-200"}>
                              {idx + 1}. {bi(task.instruction, lang)}
                            </div>
                            <p className="mt-1 text-sm text-zinc-400 leading-5 line-clamp-3">
                              {taskObjectiveContext(task, lang)}
                            </p>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                              {!ok && (
                                <button
                                  type="button"
                                  onClick={() => revealHint(task.id)}
                                  disabled={hints[task.id]}
                                  className="text-sm text-ember-400 hover:underline disabled:cursor-default disabled:text-amber-300"
                                >
                                  {hints[task.id]
                                    ? t("hintRevealed", lang)
                                    : t("showExactHint", lang).replace("{xp}", String(HINT_XP_PENALTY))}
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setExplain(explain === task.id ? null : task.id)}
                                aria-expanded={explain === task.id}
                                aria-controls={`why-${module.id}-${task.id}`}
                                className="text-sm text-neon-cyan hover:underline"
                              >
                                {t("whyHow", lang)}
                              </button>
                            </div>
                            {hints[task.id] && (
                              <div className="mt-2 rounded-lg border border-amber-400/25 bg-amber-400/5 p-3" role="status">
                                <p className="text-sm text-amber-200 leading-relaxed">
                                  {t("hintPenaltyApplied", lang).replace("{xp}", String(HINT_XP_PENALTY))}
                                </p>
                                <pre className="mt-2 whitespace-pre-wrap break-words font-mono text-sm leading-relaxed text-amber-100">
                                  {task.hint.en.trim()}
                                </pre>
                              </div>
                            )}
                            {explain === task.id && (
                              <div id={`why-${module.id}-${task.id}`} className="mt-2 space-y-2 border-l-2 border-neon-cyan/30 pl-3 text-sm text-zinc-300 leading-relaxed">
                                {taskWhyHow(task, lang).map((paragraph, paragraphIndex) => (
                                  <p key={paragraphIndex}>{paragraph}</p>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>

              <div className="glass rounded-2xl border border-forge-border p-4">
                <div className="text-sm uppercase tracking-widest text-ember-400 mb-2">{t("finalChallenges", lang)}</div>
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
                            <span className={ok ? "text-neon-green" : "text-ember-400"}>{ok ? "✔" : "◆"}</span>
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
    </div>
  );
}
