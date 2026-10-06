import type { Module } from "../data/lessons";
import { studyItemsForModule } from "../data/commandGuide";
import { bi, t, type Lang } from "../i18n";
import Icon from "./Icon";

export default function CommandStudyGuide({
  module,
  lang,
  onTry,
}: {
  module: Module;
  lang: Lang;
  onTry: (command: string) => void;
}) {
  const items = studyItemsForModule(module);

  return (
    <div className="command-study-guide enter">
      <header className="command-study-guide__header">
        <div>
          <div className="command-study-guide__eyebrow">{t("studyGuide", lang)}</div>
          <h2>{bi(module.title, lang)}</h2>
          <p>{t("studyGuideDescription", lang)}</p>
        </div>
        <span className="command-study-guide__count">{items.length} {t("commands", lang)}</span>
      </header>

      <div className="command-study-guide__list">
        {items.map((item, index) => {
          const lesson = item.guide;
          return (
            <article key={`${item.cmd}-${index}`} className="command-study-entry">
              <div className="command-study-entry__top">
                <code>{item.cmd}</code>
                <span>{bi(item.desc, lang)}</span>
              </div>
              {lesson ? (
                <div className="command-study-entry__content">
                  <div className="command-study-entry__definition">
                    <h3>{lesson.title[lang]}</h3>
                    <p>{lesson.purpose[lang]}</p>
                  </div>
                  <div className="command-study-entry__detail">
                    <span>{t("commandMechanics", lang)}</span>
                    <p>{lesson.mechanics[lang]}</p>
                  </div>
                  <div className="command-study-entry__detail">
                    <span>{t("commandOutput", lang)}</span>
                    <p>{lesson.output[lang]}</p>
                  </div>
                  <div className="command-study-entry__detail command-study-entry__syntax">
                    <span>{t("commandSyntax", lang)}</span>
                    <code>{lesson.syntax}</code>
                  </div>
                  <div className="command-study-entry__example">
                    <span>{t("commandExample", lang)}</span>
                    <code>{lesson.example}</code>
                    <button
                      type="button"
                      onClick={() => onTry(lesson.example)}
                      aria-label={`${t("tryInTerminal", lang)}: ${lesson.example}`}
                    >
                      <Icon name="terminal" className="h-3.5 w-3.5" />
                      {t("tryInTerminal", lang)}
                    </button>
                  </div>
                  {lesson.caution && (
                    <p className="command-study-entry__caution">
                      <Icon name="shield" className="h-4 w-4" />
                      {lesson.caution[lang]}
                    </p>
                  )}
                </div>
              ) : (
                <p className="command-study-entry__fallback">{t("noGuideEntry", lang)}</p>
              )}
            </article>
          );
        })}
      </div>

      <footer className="command-study-guide__footer">
        <Icon name="shield" className="h-4 w-4" />
        {t("educationalNote", lang)}
      </footer>
    </div>
  );
}