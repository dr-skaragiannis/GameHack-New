import { useEffect } from "react";
import type { Lang } from "../i18n";
import Icon from "./Icon";

export default function WhyHowPopup({
  moduleTitle,
  objective,
  why,
  how,
  verify,
  lang,
  onClose,
}: {
  moduleTitle: string;
  objective: string;
  why: string;
  how: string[];
  verify: string;
  lang: Lang;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const labels = lang === "en"
    ? {
        eyebrow: "FIELD GUIDE, WHY & HOW",
        title: "Why this matters",
        objective: "OBJECTIVE",
        why: "WHY",
        how: "HOW IT WORKS",
        verify: "VERIFY",
        close: "Close explanation",
        footer: "Understand the evidence; do not just copy a command.",
      }
    : {
        eyebrow: "ΟΔΗΓΟΣ ΠΕΔΙΟΥ, ΓΙΑΤΙ & ΠΩΣ",
        title: "Γιατί έχει σημασία",
        objective: "ΣΤΟΧΟΣ",
        why: "ΓΙΑΤΙ",
        how: "ΠΩΣ ΛΕΙΤΟΥΡΓΕΙ",
        verify: "ΕΠΑΛΗΘΕΥΣΗ",
        close: "Κλείσιμο επεξήγησης",
        footer: "Κατανόησε τα τεκμήρια, μην αντιγράφεις απλώς μια εντολή.",
      };

  return (
    <div
      className="why-how-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        id="why-how-popup"
        className="why-how-dialog scale-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="why-how-title"
        aria-describedby="why-how-objective"
        tabIndex={-1}
      >
        <header className="why-how-dialog__header">
          <div className="why-how-dialog__heading">
            <span className="why-how-dialog__icon"><Icon name="bulb" className="h-5 w-5" /></span>
            <div className="min-w-0">
              <span className="why-how-dialog__eyebrow">{labels.eyebrow}</span>
              <h2 id="why-how-title">{labels.title}</h2>
              <p>{moduleTitle}</p>
            </div>
          </div>
          <button type="button" className="why-how-dialog__close" aria-label={labels.close} onClick={onClose}>
            <Icon name="close" className="h-4 w-4" />
          </button>
        </header>

        <div className="why-how-dialog__body">
          <section className="why-how-dialog__objective">
            <div className="why-how-dialog__section-label">{labels.objective}</div>
            <p id="why-how-objective">{objective}</p>
          </section>

          <div className="why-how-dialog__explanation-grid">
            {why && (
              <article className="why-how-dialog__card is-why">
                <span className="why-how-dialog__card-mark"><Icon name="bulb" className="h-4 w-4" /></span>
                <div>
                  <div className="why-how-dialog__section-label">{labels.why}</div>
                  <p>{why}</p>
                </div>
              </article>
            )}
            {how.length > 0 && (
              <article className="why-how-dialog__card is-how">
                <span className="why-how-dialog__card-mark"><Icon name="layers" className="h-4 w-4" /></span>
                <div>
                  <div className="why-how-dialog__section-label">{labels.how}</div>
                  {how.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                </div>
              </article>
            )}
            {verify && (
              <article className="why-how-dialog__card is-verify">
                <span className="why-how-dialog__card-mark"><Icon name="check" className="h-4 w-4" /></span>
                <div>
                  <div className="why-how-dialog__section-label">{labels.verify}</div>
                  <p>{verify}</p>
                </div>
              </article>
            )}
          </div>
        </div>

        <footer className="why-how-dialog__footer">
          <span>{labels.footer}</span>
          <button type="button" onClick={onClose}>
            {lang === "en" ? "Got it" : "Κατάλαβα"}
            <Icon name="check" className="h-4 w-4" />
          </button>
        </footer>
      </section>
    </div>
  );
}
