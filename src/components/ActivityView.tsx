import { t, uppercaseLabel, type Lang } from "../i18n";
import LiveFeed from "./LiveFeed";

export default function ActivityView({ lang }: { lang: Lang }) {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div>
        <div className="text-sm uppercase tracking-[0.25em] text-cyan-400">
          {uppercaseLabel(t("community", lang), lang)}
        </div>
        <h1 className="mt-1 text-3xl font-bold">{t("activityNav", lang)}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-iron-400">{t("activityIntro", lang)}</p>
      </div>
      <section className="glass rounded-2xl border border-gamehack-border p-5" aria-label={t("activityNav", lang)}>
        <LiveFeed lang={lang} />
      </section>
    </div>
  );
}
