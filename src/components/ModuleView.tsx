import { useMemo, useState } from "react";
import type { Module } from "../data/lessons";
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
import { contentWidthClass, type ContentWidth } from "../lib/db";
import WidthControl from "./WidthControl";
import { sound } from "../lib/sound";
import {
  explainCommandResult,
  relevantCommandFamiliesForModule,
  type CommandExplanation,
} from "../data/commandGuide";
import CommandStudyGuide from "./CommandStudyGuide";
import CommandResultPopup from "./CommandResultPopup";
import DfirVisual from "./DfirVisual";

export default function ModuleView({
  module,
  userId,
  lang,
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
  done: string[];
  contentWidth?: ContentWidth;
  onWidth: (w: ContentWidth) => void;
  onTask: (taskId: string) => void;
  onCommandMetric: (pasted: boolean, typo: boolean) => void;
  onHint: () => void;
  onComplete: () => void;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<"theory" | "guide" | "lab">(done.length ? "lab" : "theory");
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
  const [hints, setHints] = useState<Record<string, boolean>>({});
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

  const applyChecks = (t0: Terminal) => {
    for (const task of module.tasks) {
      if (!done.includes(task.id) && task.check(t0)) {
        onTask(task.id);
        sound.taskDone();
      }
    }
    if (allTasks || module.tasks.every((x) => done.includes(x.id) || x.check(t0))) {
      if (!done.includes("ch-0") && module.challenges[0].check(t0)) {
        onTask("ch-0");
        sound.challengeDone();
      }
      if (!done.includes("ch-1") && module.challenges[1].check(t0)) {
        onTask("ch-1");
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
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <button type="button" onClick={onBack} className="text-sm text-iron-400 hover:text-ember-400">
          ← {t("backToMap", lang)}
        </button>
        <div className="flex-1" />
        <WidthControl value={activeContentWidth} onChange={onWidth} />
      </div>

      <div className={contentWidthClass(activeContentWidth)}>
        <div className="flex items-start gap-4 mb-4">
          <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${module.color} grid place-items-center forge-glow`}>
            <Icon name={module.icon} className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm uppercase tracking-[0.2em] text-ember-400">
              {t("difficulty", lang)} {"▲".repeat(module.difficulty)}
              {"△".repeat(5 - module.difficulty)}
            </div>
            <h1 className="text-2xl font-bold text-zinc-100">{bi(module.title, lang)}</h1>
            <p className="text-sm text-iron-400">{bi(module.subtitle, lang)}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-ember-400">{progress}%</div>
            <div className="text-sm text-iron-500">{t("progress", lang)}</div>
          </div>
        </div>
        <div className="h-1.5 rounded-full bg-forge-panel2 overflow-hidden mb-6">
          <div className="h-full bg-gradient-to-r from-ember-600 to-ember-400 bar-grow" style={{ width: `${progress}%` }} />
        </div>

        <div className="flex rounded-xl bg-forge-panel border border-forge-border p-1 mb-6 w-fit">
          {(["theory", "guide", "lab"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setTab(k)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-semibold",
                tab === k ? "bg-ember-600 text-white" : "text-iron-400"
              )}
            >
              {t(k, lang)}
            </button>
          ))}
        </div>

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
                            <div className="flex gap-2 mt-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setHints((h) => ({ ...h, [task.id]: true }));
                                  onHint();
                                }}
                                className="text-sm text-ember-400 hover:underline"
                              >
                                {t("showHint", lang)}
                              </button>
                              <button
                                type="button"
                                onClick={() => setExplain(explain === task.id ? null : task.id)}
                                className="text-sm text-neon-cyan hover:underline"
                              >
                                {t("whyHow", lang)}
                              </button>
                            </div>
                            {hints[task.id] && <div className="mt-1 font-mono text-sm text-amber-300">{bi(task.hint, lang)}</div>}
                            {explain === task.id && (
                              <div className="mt-1 text-sm text-zinc-400 leading-relaxed">{bi(task.explain, lang)}</div>
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

              <details className="glass rounded-2xl border border-forge-border p-4">
                <summary className="text-sm uppercase tracking-widest text-iron-400 cursor-pointer">
                  {t("cheatsheet", lang)}
                </summary>
                <ul className="mt-3 space-y-1 font-mono text-sm">
                  {module.cheats.map((c) => (
                    <li key={c.cmd} className="flex justify-between gap-2">
                      <span className="text-ember-300">{c.cmd}</span>
                      <span className="text-zinc-500 text-right">{bi(c.desc, lang)}</span>
                    </li>
                  ))}
                </ul>
              </details>
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
