import { useEffect } from "react";
import type { CommandExplanation } from "../data/commandGuide";
import { t, uppercaseLabel, type Lang } from "../i18n";
import Icon from "./Icon";
import { cn } from "../utils/cn";

export default function CommandResultPopup({
  result,
  lang,
  onClose,
}: {
  result: CommandExplanation;
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

  const hasError = result.exitCode !== 0 || result.output.some((line) => line.kind === "err");
  const visibleOutput = result.output.filter((line) => line.text.length > 0);
  const title = result.lesson.title[lang];

  return (
    <div
      className="command-explanation-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="command-explanation scale-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="command-explanation-title"
        aria-describedby="command-explanation-reading"
      >
        <header className="command-explanation__header">
          <div className="command-explanation__heading">
            <span className={cn("command-explanation__icon", hasError && "has-error")}>
              <Icon name={hasError ? "warning" : "book"} className="h-5 w-5" />
            </span>
            <span>
              <span className="command-explanation__eyebrow">
                {hasError ? (lang === "en" ? "LAB RESULT, REVIEW" : "ΑΠΟΤΕΛΕΣΜΑ LAB, ΕΛΕΓΧΟΣ") : (lang === "en" ? "LAB RESULT, EXPLAINED" : "ΑΠΟΤΕΛΕΣΜΑ LAB, ΕΠΕΞΗΓΗΣΗ")}
              </span>
              <h2 id="command-explanation-title">{title}</h2>
            </span>
          </div>
          <button type="button" className="command-explanation__close" aria-label={t("close", lang)} onClick={onClose}>
            <Icon name="close" className="h-4 w-4" />
          </button>
        </header>

        <div className="command-explanation__body">
          <section className="command-explanation__command">
            <div className="command-explanation__section-label">{lang === "en" ? "COMMAND" : "ΕΝΤΟΛΗ"}</div>
            <code>{result.command}</code>
          </section>

          <div className="command-explanation__grid">
            <section>
              <div className="command-explanation__section-label">{lang === "en" ? "WHAT IT DOES" : "ΤΙ ΚΑΝΕΙ"}</div>
              <p>{result.lesson.purpose[lang]}</p>
            </section>
            <section>
              <div className="command-explanation__section-label">{lang === "en" ? "HOW TO READ IT" : "ΠΩΣ ΔΙΑΒΑΖΕΤΑΙ"}</div>
              <p id="command-explanation-reading">{result.reading}</p>
            </section>
            <section>
              <div className="command-explanation__section-label">{t("commandSyntax", lang)}</div>
              <code className="command-explanation__inline-code">{result.lesson.syntax}</code>
            </section>
            <section>
              <div className="command-explanation__section-label">{t("commandExample", lang)}</div>
              <code className="command-explanation__inline-code">{result.lesson.example}</code>
            </section>
          </div>

          <section>
            <div className="command-explanation__section-label">{lang === "en" ? "WHY THIS OUTPUT" : "ΓΙΑΤΙ ΑΥΤΗ Η ΕΞΟΔΟΣ"}</div>
            <p>{result.lesson.output[lang]}</p>
          </section>

          <section className="command-explanation__output-section">
            <div className="command-explanation__output-heading">
              <div className="command-explanation__section-label">{lang === "en" ? "TERMINAL OUTPUT" : "ΕΞΟΔΟΣ ΤΕΡΜΑΤΙΚΟΥ"}</div>
              <span className={cn("command-explanation__exit", hasError && "has-error")}>
                {hasError ? `exit ${result.exitCode || 1}` : (lang === "en" ? "completed" : uppercaseLabel("ολοκληρώθηκε", lang))}
              </span>
            </div>
            <pre className="command-explanation__output" aria-label={lang === "en" ? "Command output" : "Έξοδος εντολής"}>
              {visibleOutput.length > 0 ? (
                visibleOutput.map((line, index) => (
                  <span key={`${index}-${line.text}`} className={cn("command-output-line", `is-${line.kind}`)}>
                    {line.text || " "}
                    {index < visibleOutput.length - 1 ? "\n" : ""}
                  </span>
                ))
              ) : (
                <span className="command-output-empty">
                  {lang === "en" ? "(no text output)" : "(χωρίς έξοδο κειμένου)"}
                </span>
              )}
            </pre>
          </section>

          <section className="command-explanation__mechanics">
            <div className="command-explanation__section-label">{lang === "en" ? "THE CONCEPT" : "Η ΕΝΝΟΙΑ"}</div>
            <p>{result.lesson.mechanics[lang]}</p>
            {result.lesson.caution && (
              <p className="command-explanation__caution">
                <Icon name="shield" className="h-4 w-4" />
                <span>{result.lesson.caution[lang]}</span>
              </p>
            )}
          </section>
        </div>

        <footer className="command-explanation__footer">
          <span>{lang === "en" ? "Output is from the isolated GameHack virtual lab." : "Η έξοδος προέρχεται από το απομονωμένο εικονικό εργαστήριο του GameHack."}</span>
          <button type="button" onClick={onClose} autoFocus>
            {lang === "en" ? "Back to terminal" : "Πίσω στο τερματικό"}
            <Icon name="chevron" className="h-4 w-4" />
          </button>
        </footer>
      </section>
    </div>
  );
}