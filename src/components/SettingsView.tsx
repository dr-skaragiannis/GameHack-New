import { useEffect, useState, type ReactNode } from "react";
import type { ContentWidth, User } from "../lib/db";
import { sound } from "../lib/sound";
import { UI_SCALE_OPTIONS } from "../lib/uiScale";
import { t, uppercaseLabel, type Lang } from "../i18n";
import { cn } from "../utils/cn";
import Icon from "./Icon";
import WidthControl from "./WidthControl";

function SettingCard({
  icon,
  title,
  children,
}: {
  icon: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="glass rounded-2xl border border-gamehack-border p-5">
      <header className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-600/20 text-cyan-300">
          <Icon name={icon} className="h-5 w-5" />
        </span>
        <h2 className="text-lg font-bold text-zinc-100">{title}</h2>
      </header>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export default function SettingsView({
  user,
  lang,
  theme,
  uiScale,
  onToggleTheme,
  onLang,
  onWidth,
  onZoom,
  onOpenProfile,
}: {
  user: User;
  lang: Lang;
  theme: "cyan" | "warm";
  uiScale: number;
  onToggleTheme: () => void;
  onLang: (next: Lang) => void;
  onWidth: (next: ContentWidth) => void;
  onZoom: (next: number) => void;
  onOpenProfile: () => void;
}) {
  const [muted, setMuted] = useState(sound.isMuted());
  useEffect(() => {
    const off = sound.onChange(setMuted);
    return () => {
      off();
    };
  }, []);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div>
        <div className="text-sm uppercase tracking-[0.25em] text-cyan-400">
          {uppercaseLabel(t("yourAccount", lang), lang)}
        </div>
        <h1 className="mt-1 text-3xl font-bold">{t("settingsNav", lang)}</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <SettingCard icon="palette" title={t("settingsAppearance", lang)}>
          <p className="text-sm text-iron-400">
            {t("currentPalette", lang)}:{" "}
            <strong className="text-zinc-200">{t(theme === "cyan" ? "paletteCyan" : "paletteWarm", lang)}</strong>
          </p>
          <button
            type="button"
            onClick={onToggleTheme}
            className="mt-3 flex items-center gap-2 rounded-xl border border-gamehack-border bg-gamehack-panel2 px-4 py-2 text-sm font-bold text-iron-300 transition hover:border-cyan-600/40 hover:text-cyan-300"
          >
            <Icon name="palette" className="h-4 w-4" />
            {t(theme === "cyan" ? "switchToWarmTheme" : "switchToCyanTheme", lang)}
          </button>
        </SettingCard>

        <SettingCard icon="maximize" title={t("settingsDisplay", lang)}>
          <div className="inline-flex rounded-lg border border-gamehack-border bg-gamehack-panel2 p-0.5" role="group" aria-label={t("settingsDisplay", lang)}>
            {UI_SCALE_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => onZoom(option)}
                aria-pressed={uiScale === option}
                className={cn(
                  "h-8 rounded-md px-4 text-sm font-bold tracking-wide",
                  uiScale === option ? "bg-cyan-600/90 text-white" : "text-iron-400 hover:text-zinc-200"
                )}
              >
                {Math.round(option * 100)}%
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-iron-500">{t("uiZoomNote", lang)}</p>
        </SettingCard>

        <SettingCard icon="globe" title={t("settingsLanguage", lang)}>
          <div className="inline-flex rounded-lg border border-gamehack-border bg-gamehack-panel2 p-0.5">
            {(
              [
                { id: "el", label: "Ελληνικά" },
                { id: "en", label: "English" },
              ] as { id: Lang; label: string }[]
            ).map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => onLang(option.id)}
                aria-pressed={lang === option.id}
                className={cn(
                  "h-8 rounded-md px-4 text-sm font-bold tracking-wide",
                  lang === option.id ? "bg-cyan-600/90 text-white" : "text-iron-400 hover:text-zinc-200"
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </SettingCard>

        <SettingCard icon="layers" title={t("settingsLabWidth", lang)}>
          <WidthControl value={user.contentWidth} onChange={onWidth} />
        </SettingCard>

        <SettingCard icon={muted ? "mute" : "volume"} title={t("settingsSound", lang)}>
          <button
            type="button"
            onClick={() => {
              sound.unlock();
              sound.toggle();
            }}
            aria-pressed={!muted}
            className="flex items-center gap-2 rounded-xl border border-gamehack-border bg-gamehack-panel2 px-4 py-2 text-sm font-bold text-iron-300 transition hover:border-cyan-600/40 hover:text-cyan-300"
          >
            <Icon name={muted ? "mute" : "volume"} className="h-4 w-4" />
            {t(muted ? "muted" : "soundOn", lang)}
          </button>
        </SettingCard>
      </div>

      <SettingCard icon="user" title={t("settingsAccount", lang)}>
        <p className="text-sm leading-relaxed text-iron-400">{t("settingsSecurityHint", lang)}</p>
        <button
          type="button"
          onClick={onOpenProfile}
          className="mt-3 flex items-center gap-2 rounded-xl border border-gamehack-border bg-gamehack-panel2 px-4 py-2 text-sm font-bold text-iron-300 transition hover:border-cyan-600/40 hover:text-cyan-300"
        >
          <Icon name="user" className="h-4 w-4" />
          {t("profileNav", lang)}
        </button>
      </SettingCard>
    </div>
  );
}
