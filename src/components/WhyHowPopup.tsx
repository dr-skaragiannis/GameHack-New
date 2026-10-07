import { useEffect } from "react";
import type { Lang } from "../i18n";
import Icon from "./Icon";

export default function WhyHowPopup({
  moduleTitle,
  objective,
  context,
  details,
  lang,
  onClose,
}: {
  moduleTitle: string;
  objective: string;
  context: string;
  details: string[];
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
        objective: "YOUR OBJECTIVE",
        principle: "THE PRINCIPLE",
        steps: "A SIMPLE WAY TO THINK ABOUT IT",
        why: "WHY",
        how: "HOW IT WORKS",
        verify: "VERIFY",
        close: "Close explanation",
        footer: "Understand the evidence; do not just copy a command.",
        stepOne: "Start with the goal",
        stepTwo: "Apply the idea",
        stepThree: "Check the evidence",
      }
    : {
        eyebrow: "ΟΔΗΓΟΣ ΠΕΔΙΟΥ, ΓΙΑΤΙ & ΠΩΣ",
        title: "Γιατί έχει σημασία",
        objective: "ΣΤΟΧΟΣ",
        principle: "Η ΑΡΧΗ",
        steps: "ΕΝΑΣ ΑΠΛΟΣ ΤΡΟΠΟΣ ΣΚΕΨΗΣ",
        why: "ΓΙΑΤΙ",
        how: "ΠΩΣ ΛΕΙΤΟΥΡΓΕΙ",
        verify: "ΕΠΑΛΗΘΕΥΣΗ",
        close: "Κλείσιμο επεξήγησης",
        footer: "Κατανόησε τα τεκμήρια, μην αντιγράφεις απλώς μια εντολή.",
        stepOne: "Ξεκίνα από τον στόχο",
        stepTwo: "Εφάρμοσε την ιδέα",
        stepThree: "Έλεγξε τα τεκμήρια",
      };

  const why = details[0] || context;
  const how = details.slice(1).filter(Boolean);
  const verification = how[how.length - 1] || context;

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
            <div className="why-how-dialog__context">
              <Icon name="target" className="h-4 w-4" />
              <span>{context}</span>
            </div>
          </section>

          <section aria-label={labels.steps}>
            <div className="why-how-dialog__section-label">{labels.steps}</div>
            <div className="why-how-flow">
              <article className="why-how-flow__step is-goal">
                <span className="why-how-flow__number">01</span>
                <Icon name="target" className="h-5 w-5" />
                <h3>{labels.stepOne}</h3>
                <p>{objective}</p>
              </article>
              <span className="why-how-flow__connector" aria-hidden="true" />
              <article className="why-how-flow__step is-action">
                <span className="why-how-flow__number">02</span>
                <Icon name="terminal" className="h-5 w-5" />
                <h3>{labels.stepTwo}</h3>
                <p>{context}</p>
              </article>
              <span className="why-how-flow__connector" aria-hidden="true" />
              <article className="why-how-flow__step is-evidence">
                <span className="why-how-flow__number">03</span>
                <Icon name="check" className="h-5 w-5" />
                <h3>{labels.stepThree}</h3>
                <p>{verification}</p>
              </article>
            </div>
          </section>

          <div className="why-how-dialog__explanation-grid">
            <article className="why-how-dialog__card is-why">
              <span className="why-how-dialog__card-mark"><Icon name="bulb" className="h-4 w-4" /></span>
              <div>
                <div className="why-how-dialog__section-label">{labels.why}</div>
                <p>{why}</p>
              </div>
            </article>
            <article className="why-how-dialog__card is-how">
              <span className="why-how-dialog__card-mark"><Icon name="layers" className="h-4 w-4" /></span>
              <div>
                <div className="why-how-dialog__section-label">{labels.how}</div>
                {(how.length ? how : [context]).map((paragraph, index) => <p key={`${index}-${paragraph}`}>{paragraph}</p>)}
              </div>
            </article>
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
