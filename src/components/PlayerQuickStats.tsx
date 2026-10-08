
import { accuracyScore, fidelityScore, levelFromXp, overallScoreboard, type User } from "../lib/db";
import { t, uppercaseLabel, type Lang } from "../i18n";
import Icon from "./Icon";
import { learningPaths } from "../lib/catalog";

export default function PlayerQuickStats({
  user,
  lang,
  onContinue,
  onOpenScoreboard,
}: {
  user: User;
  lang: Lang;
  onContinue: () => void;
  onOpenScoreboard: () => void;
}) {
  const allModules = learningPaths().flatMap((campaign) => campaign.modules);
  const completedModules = allModules.filter((module) => user.progress[module.id]?.completed).length;
  const level = levelFromXp(user.metrics.xp).level;
  const scoreboard = overallScoreboard();
  const rank = scoreboard.find((entry) => entry.user.id === user.id)?.rank;
  const shortLabels = lang === "en"
    ? { modules: "MOD", fidelity: "FID", accuracy: "ACC", streak: "STR" }
    : { modules: "ΕΝΟΤ", fidelity: "ΠΙΣΤ", accuracy: "ΑΚΡ", streak: "ΣΕΡΙ" };

  return (
    <div className="player-quick-stats" role="group" aria-label={lang === "en" ? "Player quick stats" : "Σύντομα στατιστικά παίκτη"}>
      <button
        type="button"
        className="player-quick-stats__item player-quick-stats__continue"
        title={t("continueLearning", lang)}
        aria-label={t("continueLearning", lang)}
        onClick={onContinue}
      >
        <Icon name="chevron" className="h-3 w-3" />
        <span>{uppercaseLabel(t("continue", lang), lang)}</span>
      </button>

      <span
        className="player-quick-stats__item"
        title={`${t("level", lang)} ${level}`}
        aria-label={`${t("level", lang)} ${level}`}
      >
        <b>LVL</b> {level}
      </span>
      <span
        className="player-quick-stats__item"
        title={`${t("xp", lang)}: ${user.metrics.xp}`}
        aria-label={`${t("xp", lang)} ${user.metrics.xp}`}
      >
        <b>{user.metrics.xp}</b> XP
      </span>
      <span
        className="player-quick-stats__item"
        title={`${t("modules", lang)}: ${completedModules}/${allModules.length}`}
        aria-label={`${t("modules", lang)} ${completedModules} of ${allModules.length}`}
      >
        <b>{shortLabels.modules}</b> {completedModules}/{allModules.length}
      </span>
      <span
        className="player-quick-stats__item"
        title={`${t("fidelity", lang)}: ${fidelityScore(user.metrics)}%`}
        aria-label={`${t("fidelity", lang)} ${fidelityScore(user.metrics)}%`}
      >
        <b>{shortLabels.fidelity}</b> {fidelityScore(user.metrics)}%
      </span>
      <span
        className="player-quick-stats__item"
        title={`${t("accuracy", lang)}: ${accuracyScore(user.metrics)}%`}
        aria-label={`${t("accuracy", lang)} ${accuracyScore(user.metrics)}%`}
      >
        <b>{shortLabels.accuracy}</b> {accuracyScore(user.metrics)}%
      </span>
      <span
        className="player-quick-stats__item"
        title={`${t("streak", lang)}: ${user.metrics.streakDays} ${t("days", lang)}`}
        aria-label={`${t("streak", lang)} ${user.metrics.streakDays} ${t("days", lang)}`}
      >
        <b>{shortLabels.streak}</b> {user.metrics.streakDays}
      </span>
      <button
        type="button"
        className="player-quick-stats__item player-quick-stats__rank"
        title={rank
          ? `${t("overallScoreboard", lang)}, ${t("position", lang)} ${rank} / ${scoreboard.length}`
          : `${t("overallScoreboard", lang)}, ${t("unranked", lang)}`}
        aria-label={rank
          ? `${t("position", lang)} ${rank} of ${scoreboard.length} in the ${t("overallScoreboard", lang)}`
          : `${t("overallScoreboard", lang)}, ${t("unranked", lang)}`}
        onClick={onOpenScoreboard}
      >
        <Icon name="crown" className="h-3.5 w-3.5" />
        <span>{rank ? `#${rank}` : t("unranked", lang)}</span>
      </button>
    </div>
  );
}
