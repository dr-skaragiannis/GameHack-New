import { useEffect } from "react";
import { LEARNING_PATHS } from "../data/lessons";
import { levelFromXp, overallScoreboard } from "../lib/db";
import { t, type Lang } from "../i18n";
import Avatar from "./Avatar";
import Icon from "./Icon";

export default function OverallScoreboardPopup({
  viewerId,
  lang,
  onClose,
}: {
  viewerId: string;
  lang: Lang;
  onClose: () => void;
}) {
  const entries = overallScoreboard();
  const totalModules = LEARNING_PATHS.reduce((total, campaign) => total + campaign.modules.length, 0);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[60] grid place-items-center bg-black/75 p-3 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="overall-scoreboard-title"
        className="glass flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-forge-border shadow-2xl"
      >
        <header className="flex items-start justify-between gap-4 border-b border-forge-border px-4 py-4 sm:px-6">
          <div>
            <div className="flex items-center gap-2 text-ember-400">
              <Icon name="crown" className="h-5 w-5" />
              <h2 id="overall-scoreboard-title" className="text-lg font-bold text-zinc-100">
                {t("overallScoreboard", lang)}
              </h2>
            </div>
            <p className="mt-1 text-sm text-iron-400">
              {lang === "en" ? "Player positions are sorted by total XP." : "Η κατάταξη των παικτών βασίζεται στα συνολικά XP."}
            </p>
          </div>
          <button
            type="button"
            aria-label={t("close", lang)}
            onClick={onClose}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-forge-border text-iron-300 hover:bg-white/5"
          >
            <Icon name="close" className="h-4 w-4" />
          </button>
        </header>

        <div className="overflow-auto">
          {entries.length ? (
            <table className="w-full min-w-[520px] text-left text-sm">
              <thead className="sticky top-0 bg-forge-panel text-iron-400">
                <tr>
                  <th className="px-4 py-3 font-semibold">{t("position", lang)}</th>
                  <th className="px-4 py-3 font-semibold">{t("player", lang)}</th>
                  <th className="px-4 py-3 font-semibold">{t("level", lang)}</th>
                  <th className="px-4 py-3 text-right font-semibold">XP</th>
                  <th className="px-4 py-3 text-right font-semibold">{t("modules", lang)}</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(({ user, rank }) => {
                  const completedModules = LEARNING_PATHS
                    .flatMap((campaign) => campaign.modules)
                    .filter((module) => user.progress[module.id]?.completed).length;
                  const ownRow = user.id === viewerId;
                  return (
                    <tr
                      key={user.id}
                      className={ownRow ? "border-t border-ember-500/30 bg-ember-500/10" : "border-t border-forge-line"}
                      aria-current={ownRow ? "true" : undefined}
                    >
                      <td className="px-4 py-2.5 font-mono font-bold text-ember-400">#{rank}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <Avatar src={user.avatar} name={user.displayName} size={28} />
                          <span className="font-medium text-zinc-100">{user.displayName}</span>
                          {ownRow && <span className="text-xs text-ember-300">{lang === "en" ? "You" : "Εσύ"}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-zinc-300">{levelFromXp(user.metrics.xp).level}</td>
                      <td className="px-4 py-2.5 text-right font-semibold text-amber-300">{user.metrics.xp}</td>
                      <td className="px-4 py-2.5 text-right text-zinc-300">{completedModules}/{totalModules}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p className="px-6 py-10 text-center text-sm text-iron-400">
              {lang === "en" ? "No players are on the scoreboard yet." : "Δεν υπάρχουν ακόμη παίκτες στον πίνακα κατάταξης."}
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
