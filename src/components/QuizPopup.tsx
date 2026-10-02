import { useEffect, useState } from "react";
import type { QuizEntry } from "../data/quizzes";
import type { Lang } from "../i18n";
import { t } from "../i18n";
import type { OutLine } from "../lib/terminal";
import { sound } from "../lib/sound";
import { cn } from "../utils/cn";
import Icon from "./Icon";

// Shown each time a command/task succeeds: the captured result, an educational
// "what happened" explanation, then a quick 3-question quiz.
export default function QuizPopup({
  entry,
  taskLabel,
  result,
  lang,
  onClose,
}: {
  entry: QuizEntry;
  taskLabel: string;
  result?: OutLine[];
  lang: Lang;
  onClose: () => void;
}) {
  const [answers, setAnswers] = useState<(number | null)[]>(entry.questions.map(() => null));

  useEffect(() => {
    sound.popup();
  }, []);

  const answeredAll = answers.every((a) => a !== null);
  const score = answers.reduce<number>((n, a, i) => n + (a === entry.questions[i].answer ? 1 : 0), 0);

  const pick = (qi: number, oi: number) => {
    setAnswers((prev) => {
      if (prev[qi] !== null) return prev; // lock once answered
      if (oi === entry.questions[qi].answer) sound.correct();
      else sound.wrong();
      const next = [...prev];
      next[qi] = oi;
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="fadeup flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-neon-green/40 bg-forge-panel">
        {/* header: command success + output explained */}
        <div className="flex-none border-b border-forge-border bg-forge-panel2 px-6 py-4">
          <div className="flex items-center gap-2 text-neon-green">
            <Icon name="check" className="h-5 w-5" />
            <span className="font-mono text-sm font-bold">{t("commandSuccess", lang)}</span>
          </div>
          <p className="mt-1 font-mono text-[11px] text-iron-500">{taskLabel}</p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {/* the actual result the player saw in the terminal */}
          {result && result.length > 0 && (
            <div className="mb-5 overflow-hidden rounded-xl border border-forge-border bg-[#08080a]">
              <div className="flex items-center gap-2 border-b border-forge-border bg-forge-panel2 px-3 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wide text-iron-400">
                <Icon name="terminal" className="h-3.5 w-3.5" />
                {t("theResult", lang)}
              </div>
              <pre className="max-h-40 overflow-y-auto px-3 py-2 font-mono text-[12px] leading-relaxed">
                {result.map((l, i) => (
                  <div key={i} className={cn("whitespace-pre-wrap break-words", l.cls || "text-zinc-300")}>
                    {l.text || "\u00A0"}
                  </div>
                ))}
              </pre>
            </div>
          )}

          {/* output explanation */}
          <div className="mb-6 rounded-xl border border-neon-cyan/30 bg-neon-cyan/5 p-4">
            <div className="mb-1.5 flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-wide text-neon-cyan">
              <Icon name="terminal" className="h-4 w-4" />
              {t("whatHappened", lang)}
            </div>
            <p className="text-[14px] leading-relaxed text-zinc-200">{entry.info[lang]}</p>
          </div>

          {/* quiz */}
          <div className="mb-3 flex items-center gap-2 font-mono text-sm font-bold text-ember-400">
            <Icon name="bulb" className="h-4 w-4" />
            {t("quickQuiz", lang)}
          </div>

          <div className="space-y-4">
            {entry.questions.map((question, qi) => {
              const chosen = answers[qi];
              const answered = chosen !== null;
              return (
                <div key={qi} className="rounded-xl border border-forge-border bg-forge-bg p-4">
                  <div className="mb-3 flex gap-2 text-[14px] font-semibold text-zinc-100">
                    <span className="text-ember-500">{qi + 1}.</span>
                    <span>{question.q[lang]}</span>
                  </div>
                  <div className="space-y-2">
                    {question.options.map((opt, oi) => {
                      const isCorrect = oi === question.answer;
                      const isChosen = chosen === oi;
                      return (
                        <button
                          key={oi}
                          disabled={answered}
                          onClick={() => pick(qi, oi)}
                          className={cn(
                            "flex w-full items-center gap-2 rounded-lg border px-3 py-2 text-left text-[13px] transition",
                            !answered && "border-forge-border text-zinc-300 hover:border-ember-500/60 hover:text-zinc-100",
                            answered && isCorrect && "border-neon-green/60 bg-neon-green/10 text-neon-green",
                            answered && isChosen && !isCorrect && "border-red-500/60 bg-red-500/10 text-red-300",
                            answered && !isChosen && !isCorrect && "border-forge-line text-iron-500"
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border font-mono text-[10px]",
                              answered && isCorrect
                                ? "border-neon-green text-neon-green"
                                : answered && isChosen
                                  ? "border-red-500 text-red-400"
                                  : "border-iron-500 text-iron-500"
                            )}
                          >
                            {answered && isCorrect ? "✓" : answered && isChosen ? "✕" : String.fromCharCode(65 + oi)}
                          </span>
                          {opt[lang]}
                        </button>
                      );
                    })}
                  </div>
                  {answered && (
                    <div
                      className={cn(
                        "mt-2 font-mono text-[11px] font-bold",
                        chosen === question.answer ? "text-neon-green" : "text-amber-300"
                      )}
                    >
                      {chosen === question.answer ? t("correctAns", lang) : t("wrongAns", lang)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* footer */}
        <div className="flex flex-none items-center justify-between gap-3 border-t border-forge-border bg-forge-panel2 px-6 py-4">
          <span className="font-mono text-xs text-iron-400">
            {t("youScored", lang)}{" "}
            <span className={cn("font-bold", score === entry.questions.length ? "text-neon-green" : "text-ember-400")}>
              {score}/{entry.questions.length}
            </span>
          </span>
          <button
            onClick={onClose}
            className={cn(
              "rounded-xl px-5 py-2.5 font-mono text-sm font-bold transition",
              answeredAll
                ? "bg-ember-600 text-white hover:bg-ember-500"
                : "border border-forge-border text-iron-400 hover:text-zinc-200"
            )}
          >
            {t("continueLabel", lang)} →
          </button>
        </div>
      </div>
    </div>
  );
}
