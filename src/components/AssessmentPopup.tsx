import { useState } from "react";
import { ASSESSMENTS, type AssessmentQ } from "../data/assessments";
import { bi, t, uppercaseLabel, type Lang } from "../i18n";
import { sound } from "../lib/sound";
import { passesQuickQuiz } from "../lib/quizProgress";
import Icon from "./Icon";
import { cn } from "../utils/cn";

function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

function createRound(questions: readonly AssessmentQ[]): AssessmentQ[] {
  return shuffle(questions).map((question) => {
    const choiceOrder = shuffle(question.choices.map((_, index) => index));
    return {
      ...question,
      choices: choiceOrder.map((index) => question.choices[index]),
      answer: choiceOrder.indexOf(question.answer),
    };
  });
}

function roundSignature(questions: readonly AssessmentQ[]): string {
  return questions
    .map((question) => `${question.q.en}:${question.choices.map((choice) => choice.en).join("|")}`)
    .join("|||");
}

/**
 * A scenario-based assessment. Unlike QuizPopup it never asks for a command:
 * every question opens with a situation and asks for a judgement.
 */
export default function AssessmentPopup({
  moduleId,
  lang,
  onDone,
  onCancel,
}: {
  moduleId: string;
  lang: Lang;
  onDone: (score: number, total: number) => void;
  onCancel: () => void;
}) {
  const sourceQuestions = ASSESSMENTS[moduleId] || [];
  const [questions, setQuestions] = useState(() => createRound(sourceQuestions));
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState<"passed" | "failed" | null>(null);

  if (!questions.length) {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-labelledby="assessment-unavailable-title">
        <div className="w-full max-w-lg rounded-2xl border border-gamehack-border bg-gamehack-panel p-6 scale-in">
          <h2 id="assessment-unavailable-title" className="text-lg font-semibold text-zinc-100">{t("labAssessment", lang)}</h2>
          <p className="mt-3 text-sm leading-relaxed text-zinc-300">{t("assessmentUnavailable", lang)}</p>
          <button type="button" onClick={onCancel} className="mt-5 w-full rounded-xl border border-gamehack-border px-4 py-2.5 font-semibold text-zinc-100 hover:border-cyan-500/50">
            {t("returnToLab", lang)}
          </button>
        </div>
      </div>
    );
  }

  const q = questions[i];
  const revealed = picked !== null;
  const last = i >= questions.length - 1;
  const retry = () => {
    let nextQuestions = createRound(sourceQuestions);
    if (roundSignature(nextQuestions) === roundSignature(questions) && nextQuestions.length > 1) {
      nextQuestions = [...nextQuestions];
      [nextQuestions[0], nextQuestions[1]] = [nextQuestions[1], nextQuestions[0]];
    }
    setQuestions(nextQuestions);
    setI(0);
    setPicked(null);
    setScore(0);
    setResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" role="dialog" aria-modal="true" aria-labelledby="assessment-title">
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-gamehack-border bg-gamehack-panel p-6 scale-in">
        <div className="text-sm uppercase tracking-[0.2em] text-violet-400 mb-1">{uppercaseLabel(t("labAssessment", lang), lang)}</div>

        {result ? (
          <section aria-live="polite" className="pt-3">
            <div className={cn(
              "mb-3 grid h-12 w-12 place-items-center rounded-full border text-xl font-bold",
              result === "passed" ? "border-neon-green/40 bg-neon-green/10 text-neon-green" : "border-rose-500/40 bg-rose-500/10 text-rose-300",
            )} aria-hidden="true">
              {result === "passed" ? "✓" : "↻"}
            </div>
            <h2 id="assessment-title" className="text-xl font-semibold text-zinc-100">
              {t(result === "passed" ? "assessmentPassed" : "assessmentFailed", lang)}
            </h2>
            <p className="mt-2 text-3xl font-bold text-violet-300">
              {score}<span className="mx-1 text-base font-medium text-iron-500">/</span>{questions.length}
            </p>
            <p className="mt-1 text-sm text-iron-400">{t(score === 1 ? "correctAnswer" : "correctAnswers", lang)}</p>
            <p className="mt-4 text-sm leading-relaxed text-zinc-300">
              {t(result === "passed" ? "assessmentPassedMessage" : "assessmentFailedMessage", lang)}
            </p>
            {result === "failed" ? (
              <button
                type="button"
                onClick={retry}
                className="mt-5 w-full rounded-xl bg-violet-600 py-2.5 font-semibold text-white transition hover:bg-violet-500 inline-flex items-center justify-center gap-2"
              >
                {t("retryAssessment", lang)}
                <Icon name="chevron" className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onDone(score, questions.length)}
                className="mt-5 w-full rounded-xl bg-violet-600 py-2.5 font-semibold text-white transition hover:bg-violet-500 inline-flex items-center justify-center gap-2"
              >
                {t("returnToLab", lang)}
                <Icon name="chevron" className="h-4 w-4" />
              </button>
            )}
          </section>
        ) : (
          <>
            <div className="text-sm text-iron-400 mb-4">
              {i + 1} {t("of", lang)} {questions.length}
            </div>
            <p className="text-xs uppercase tracking-[0.18em] text-iron-500 mb-1">{uppercaseLabel(t("assessmentScenario", lang), lang)}</p>
            <p className="mb-4 rounded-xl border border-violet-500/25 bg-violet-500/5 px-3 py-2.5 text-sm leading-relaxed text-zinc-300">
              {bi(q.scenario, lang)}
            </p>
            <h2 id="assessment-title" className="text-lg font-semibold text-zinc-100 mb-4">{bi(q.q, lang)}</h2>
            <div className="space-y-2">
              {q.choices.map((choice, idx) => {
                const good = idx === q.answer;
                const mine = idx === picked;
                return (
                  <button
                    key={idx}
                    type="button"
                    disabled={revealed}
                    onClick={() => {
                      setPicked(idx);
                      if (idx === q.answer) {
                        setScore((currentScore) => currentScore + 1);
                        sound.correct();
                      } else sound.wrong();
                    }}
                    className={cn(
                      "w-full text-left rounded-xl border px-3 py-2.5 text-sm transition",
                      !revealed && "border-gamehack-border hover:border-violet-500/50",
                      revealed && good && "border-neon-green bg-neon-green/10 text-neon-green",
                      revealed && mine && !good && "border-rose-500 bg-rose-500/10 text-rose-300",
                      revealed && !good && !mine && "border-gamehack-border opacity-50",
                    )}
                  >
                    {bi(choice, lang)}
                  </button>
                );
              })}
            </div>
            {revealed && (
              <div className="mt-4 text-sm text-zinc-400 leading-relaxed">
                <span className={picked === q.answer ? "text-neon-green font-semibold" : "text-rose-300 font-semibold"}>
                  {picked === q.answer ? t("correctAns", lang) : t("wrongAns", lang)}
                </span>{" "}
                {bi(q.why, lang)}
              </div>
            )}
            {revealed && (
              <button
                type="button"
                onClick={() => {
                  if (last) {
                    setResult(passesQuickQuiz(score, questions.length) ? "passed" : "failed");
                    return;
                  }
                  setI((currentIndex) => currentIndex + 1);
                  setPicked(null);
                }}
                className="mt-5 w-full rounded-xl bg-violet-600 hover:bg-violet-500 py-2.5 font-semibold text-white inline-flex items-center justify-center gap-2"
              >
                {last ? t("seeResults", lang) : t("next", lang)}
                <Icon name="chevron" className="w-4 h-4" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
