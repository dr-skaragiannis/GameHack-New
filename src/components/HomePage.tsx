import { useEffect, useRef, useState } from "react";
import { LEARNING_PATHS } from "../data/lessons";
import { BADGES } from "../lib/db";
import { t, uppercaseLabel, type Lang } from "../i18n";
import Icon from "./Icon";

type CliLine = { text: string; kind: "cmd" | "out" | "ok" };

const CLI_SCRIPT: { cmd: string; out: string[] }[] = [
  { cmd: "whoami", out: ["nova@gamelab"] },
  { cmd: "ls ~/labs", out: ["raven/  wirewalk/  dfir-case-07/  flag.txt"] },
  {
    cmd: "nmap -sn 10.13.37.0/24",
    out: ["Host 10.13.37.4 is up (web.lab)", "Host 10.13.37.9 is up (db.lab)", "Scan complete: 2 hosts up"],
  },
  { cmd: "cat ~/labs/flag.txt", out: ["GH{first_blood_nova}"] },
  { cmd: "gamehack --rank", out: ["#3 of 128 players, keep pushing!"] },
];

const CHAR_MS = 34;
const LINE_MS = 170;
const STEP_PAUSE_MS = 900;
const LOOP_PAUSE_MS = 2600;
const MAX_LINES = 60;

function CliWindow() {
  const [lines, setLines] = useState<CliLine[]>([]);
  const [typing, setTyping] = useState("");
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const later = (fn: () => void, ms: number) => {
      const id = setTimeout(() => {
        if (!cancelled) fn();
      }, ms);
      timers.push(id);
    };

    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setLines(
        CLI_SCRIPT.flatMap((step): CliLine[] => [
          { text: step.cmd, kind: "cmd" },
          ...step.out.map((text): CliLine => ({ text, kind: "out" })),
        ]),
      );
      return () => {
        cancelled = true;
      };
    }

    const pushLines = (next: CliLine[]) =>
      setLines((prev) => [...prev, ...next].slice(-MAX_LINES));

    const runStep = (index: number) => {
      const step = CLI_SCRIPT[index];
      let char = 0;
      const typeChar = () => {
        char += 1;
        setTyping(step.cmd.slice(0, char));
        if (char < step.cmd.length) {
          later(typeChar, CHAR_MS);
        } else {
          later(() => {
            setTyping("");
            pushLines([
              { text: step.cmd, kind: "cmd" },
              ...step.out.map((text): CliLine => ({ text, kind: "out" })),
            ]);
            later(() => {
              if (index + 1 < CLI_SCRIPT.length) runStep(index + 1);
              else {
                later(() => {
                  setLines([]);
                  runStep(0);
                }, LOOP_PAUSE_MS);
              }
            }, STEP_PAUSE_MS + step.out.length * LINE_MS);
          }, LINE_MS);
        }
      };
      typeChar();
    };
    runStep(0);

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    const body = bodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  }, [lines, typing]);

  return (
    <div className="landing-cli" role="img" aria-label="Animated terminal demo">
      <div className="landing-cli__bar">
        <span className="landing-cli__dots" aria-hidden="true">
          <i /><i /><i />
        </span>
        <span className="landing-cli__title">nova@gamelab: ~</span>
        <span className="landing-cli__live" aria-hidden="true"><i />REC</span>
      </div>
      <div ref={bodyRef} className="landing-cli__body">
        {lines.map((line, index) =>
          line.kind === "cmd" ? (
            <div key={index} className="landing-cli__cmd">
              <span className="landing-cli__prompt">nova@gamelab:~$</span> {line.text}
            </div>
          ) : (
            <div key={index} className="landing-cli__out">{line.text}</div>
          ),
        )}
        <div className="landing-cli__cmd">
          <span className="landing-cli__prompt">nova@gamelab:~$</span> {typing}
          <span className="landing-cli__cursor" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}

export default function HomePage({
  lang,
  onLangChange,
  onLogin,
  onRegister,
}: {
  lang: Lang;
  onLangChange: (next: Lang) => void;
  onLogin: () => void;
  onRegister: () => void;
}) {
  const labCount = LEARNING_PATHS.reduce((total, campaign) => total + campaign.modules.length, 0);
  const badgeCount = Object.keys(BADGES).length;
  const steps = [1, 2, 3, 4].map((n) => ({
    title: t(`landingStep${n}T`, lang),
    desc: t(`landingStep${n}D`, lang),
  }));
  const features = [
    { icon: "map", title: t("landingFeat1T", lang), desc: t("landingFeat1D", lang) },
    { icon: "terminal", title: t("landingFeat2T", lang), desc: t("landingFeat2D", lang) },
    { icon: "target", title: t("landingFeat3T", lang), desc: t("landingFeat3D", lang) },
    { icon: "crown", title: t("landingFeat4T", lang), desc: t("landingFeat4D", lang) },
    { icon: "users", title: t("landingFeat5T", lang), desc: t("landingFeat5D", lang) },
    { icon: "medal", title: t("landingFeat6T", lang), desc: t("landingFeat6D", lang) },
  ];

  return (
    <div className="landing gamehack-grid">
      <a className="landing-skip" href="#landing-main">{lang === "en" ? "Skip to content" : "Μετάβαση στο περιεχόμενο"}</a>
      <header className="landing-nav">
        <a className="landing-brand" href="#landing-top" aria-label={t("appName", lang)}>
          <span className="landing-brand__mark"><Icon name="atom" className="h-5 w-5" /></span>
          <span className="landing-brand__name">{t("appName", lang)}</span>
        </a>
        <nav className="landing-links" aria-label={lang === "en" ? "Sections" : "Ενότητες"}>
          <a href="#landing-how">{t("landingNavHow", lang)}</a>
          <a href="#landing-features">{t("landingNavFeatures", lang)}</a>
          <a href="#landing-cli">{t("landingNavLabs", lang)}</a>
        </nav>
        <div className="landing-nav__actions">
          <button
            type="button"
            onClick={() => onLangChange(lang === "en" ? "el" : "en")}
            className="landing-lang"
            aria-label={lang === "en" ? "Switch to Greek" : "Switch to English"}
          >
            {t("langLabel", lang)}
          </button>
          <button type="button" onClick={onLogin} className="landing-btn landing-btn--ghost">
            {t("signIn", lang)}
          </button>
          <button type="button" onClick={onRegister} className="landing-btn landing-btn--primary">
            {t("register", lang)}
          </button>
        </div>
      </header>

      <main id="landing-main" className="landing-main">
        <section id="landing-top" className="landing-hero">
          <div className="landing-hero__copy">
            <div className="landing-eyebrow"><i />{uppercaseLabel(t("landingEyebrow", lang), lang)}</div>
            <h1>
              {t("landingTitleA", lang)}
              <br />
              <span>{t("landingTitleB", lang)}</span>
            </h1>
            <p>{t("landingSubtitle", lang)}</p>
            <div className="landing-cta">
              <button type="button" onClick={onRegister} className="landing-btn landing-btn--primary landing-btn--lg">
                {t("landingCtaPrimary", lang)}<Icon name="chevron" className="h-4 w-4" />
              </button>
              <button type="button" onClick={onLogin} className="landing-btn landing-btn--ghost landing-btn--lg">
                {t("landingHaveAccount", lang)}
              </button>
            </div>
            <dl className="landing-stats">
              <div>
                <dt>{uppercaseLabel(t("landingStatsPaths", lang), lang)}</dt>
                <dd>{LEARNING_PATHS.length}</dd>
              </div>
              <div>
                <dt>{uppercaseLabel(t("landingStatsLabs", lang), lang)}</dt>
                <dd>{labCount}</dd>
              </div>
              <div>
                <dt>{uppercaseLabel(t("landingStatsBadges", lang), lang)}</dt>
                <dd>{badgeCount}</dd>
              </div>
            </dl>
          </div>
          <div id="landing-cli" className="landing-hero__cli">
            <div className="landing-cli__heading">
              <strong>{t("landingCliTitle", lang)}</strong>
              <small>{t("landingCliHint", lang)}</small>
            </div>
            <CliWindow />
          </div>
        </section>

        <section id="landing-how" className="landing-section">
          <h2>{t("landingStepsTitle", lang)}</h2>
          <ol className="landing-steps">
            {steps.map((step, index) => (
              <li key={step.title}>
                <span className="landing-steps__num">{String(index + 1).padStart(2, "0")}</span>
                <strong>{step.title}</strong>
                <p>{step.desc}</p>
              </li>
            ))}
          </ol>
        </section>

        <section id="landing-features" className="landing-section">
          <h2>{t("landingFeatTitle", lang)}</h2>
          <div className="landing-features">
            {features.map((feature) => (
              <article key={feature.title}>
                <span className="landing-features__icon"><Icon name={feature.icon} className="h-5 w-5" /></span>
                <strong>{feature.title}</strong>
                <p>{feature.desc}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-cta-band">
          <h2>{t("landingCtaTitle", lang)}</h2>
          <p>{t("landingCtaSub", lang)}</p>
          <div className="landing-cta landing-cta--center">
            <button type="button" onClick={onRegister} className="landing-btn landing-btn--primary landing-btn--lg">
              {t("landingCtaPrimary", lang)}<Icon name="chevron" className="h-4 w-4" />
            </button>
            <button type="button" onClick={onLogin} className="landing-btn landing-btn--ghost landing-btn--lg">
              {t("signIn", lang)}
            </button>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <span className="landing-brand landing-brand--sm">
          <span className="landing-brand__mark"><Icon name="atom" className="h-4 w-4" /></span>
          <span className="landing-brand__name">{t("appName", lang)}</span>
        </span>
        <p>{t("landingFooter", lang)}</p>
        <p className="landing-footer__tag">{t("tagline", lang)}</p>
      </footer>
    </div>
  );
}
