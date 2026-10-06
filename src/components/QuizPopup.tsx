import { useState } from "react";
import { QUIZZES } from "../data/quizzes";
import { bi, t, type Lang } from "../i18n";
import { sound } from "../lib/sound";
import Icon from "./Icon";
import { cn } from "../utils/cn";

export default function QuizPopup({
  moduleId,
  lang,
  onDone,
}: {
  moduleId: string;
  lang: Lang;
  onDone: (score: number, total: number) => void;
}) {
  const qs = QUIZZES[moduleId] || [];
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  if (!qs.length) {
    onDone(0, 0);
    return null;
  }

  const q = qs[i];
  const revealed = picked !== null;
  const last = i >= qs.length - 1;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-forge-border bg-forge-panel p-6 scale-in">
        <div className="text-[10px] uppercase tracking-[0.2em] text-ember-400 mb-1">{t("quickQuiz", lang)}</div>
        <div className="text-xs text-iron-400 mb-4">
          {i + 1} {t("of", lang)} {qs.length}
        </div>
        <h3 className="text-lg font-semibold text-zinc-100 mb-4">{bi(q.q, lang)}</h3>
        <div className="space-y-2">
          {q.choices.map((c, idx) => {
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
                    setScore((s) => s + 1);
                    sound.correct();
                  } else sound.wrong();
                }}
                className={cn(
                  "w-full text-left rounded-xl border px-3 py-2.5 text-sm transition",
                  !revealed && "border-forge-border hover:border-ember-500/50",
                  revealed && good && "border-neon-green bg-neon-green/10 text-neon-green",
                  revealed && mine && !good && "border-rose-500 bg-rose-500/10 text-rose-300",
                  revealed && !good && !mine && "border-forge-border opacity-50"
                )}
              >
                {bi(c, lang)}
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
              if (last) onDone(score, qs.length);
              else {
                setI((x) => x + 1);
                setPicked(null);
              }
            }}
            className="mt-5 w-full rounded-xl bg-ember-600 hover:bg-ember-500 py-2.5 font-semibold text-white inline-flex items-center justify-center gap-2"
          >
            {last ? t("finish", lang) : t("next", lang)}
            <Icon name="chevron" className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
