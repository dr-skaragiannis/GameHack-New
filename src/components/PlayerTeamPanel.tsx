import { useState } from "react";
import {
  allTeams,
  applyForTeam,
  teamApplicationsForPlayer,
  teamForPlayer,
  teamMembers,
  withdrawTeamApplication,
  type User,
} from "../lib/db";
import { t, uppercaseLabel, type Lang } from "../i18n";
import Avatar from "./Avatar";
import Icon from "./Icon";

export default function PlayerTeamPanel({ user, lang, onProfile }: { user: User; lang: Lang; onProfile?: (playerId: string) => void }) {
  const [feedback, setFeedback] = useState("");
  const teams = allTeams();
  const team = teamForPlayer(user.id);
  const pending = teamApplicationsForPlayer(user.id)[0];
  const currentMembers = team ? teamMembers(team.id) : [];

  const apply = (teamId: string) => {
    const result = applyForTeam(user.id, teamId);
    if (result.ok) {
      setFeedback(t("applicationSent", lang));
      return;
    }
    const message = result.reason === "alreadyInTeam"
      ? t("alreadyInTeam", lang)
      : result.reason === "pendingElsewhere"
        ? t("requestPendingElsewhere", lang)
        : t("noTeamsAvailable", lang);
    setFeedback(message);
  };

  const withdraw = () => {
    if (!pending) return;
    if (withdrawTeamApplication(user.id, pending.application.id)) setFeedback("");
  };

  return (
    <section className="player-dashboard__card player-team-panel" aria-labelledby="player-team-title">
      <header className="player-team-panel__header">
        <span className="player-team-panel__icon"><Icon name="users" className="h-5 w-5" /></span>
        <div className="min-w-0 flex-1">
          <div className="player-dashboard__eyebrow">{uppercaseLabel(t("teamManagement", lang), lang)}</div>
          <h2 id="player-team-title">{team ? t("currentTeam", lang) : t("teamManagement", lang)}</h2>
        </div>
        {team && <span className="player-team-panel__count">{currentMembers.length} {t("memberCount", lang)}</span>}
      </header>

      {team ? (
        <div className="player-team-panel__current">
          <div className="player-team-panel__team-mark"><Icon name="shield" className="h-6 w-6" /></div>
          <div className="min-w-0 flex-1">
            <h3>{team.name}</h3>
            <p>{team.description || t("researchSubtitle", lang)}</p>
          </div>
          <div className="player-team-panel__members" aria-label={t("teamMembers", lang)}>
            {currentMembers.slice(0, 5).map((member) => (
              <button key={member.id} type="button" className="player-team-panel__avatar" title={`${t("openProfile", lang)}: ${member.displayName}`} aria-label={`${t("openProfile", lang)}: ${member.displayName}`} onClick={() => onProfile?.(member.id)}>
                <Avatar src={member.avatar} name={member.displayName} size={28} />
              </button>
            ))}
            {currentMembers.length > 5 && <small>+{currentMembers.length - 5}</small>}
          </div>
        </div>
      ) : pending ? (
        <div className="player-team-panel__pending">
          <span className="player-team-panel__pending-icon"><Icon name="users" className="h-5 w-5" /></span>
          <div className="min-w-0 flex-1">
            <strong>{pending.team.name}</strong>
            <p>{t("applicationPending", lang)}, {new Date(pending.application.requestedAt).toLocaleDateString(lang === "el" ? "el-GR" : "en-GB")}</p>
          </div>
          <button type="button" onClick={withdraw} className="player-team-panel__withdraw dashboard-action">
            {t("withdrawRequest", lang)}
          </button>
        </div>
      ) : teams.length ? (
        <div className="player-team-panel__options">
          {teams.map((candidate) => {
            const count = teamMembers(candidate.id).length;
            return (
              <article key={candidate.id} className="player-team-panel__option">
                <span className="player-team-panel__team-mark is-small"><Icon name="users" className="h-4 w-4" /></span>
                <div className="min-w-0 flex-1">
                  <strong>{candidate.name}</strong>
                  <p>{candidate.description || `${count} ${t("memberCount", lang)}`}</p>
                </div>
                <button type="button" onClick={() => apply(candidate.id)} className="player-team-panel__apply dashboard-action">
                  <Icon name="plus" className="h-4 w-4" />
                  {t("applyToTeam", lang)}
                </button>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="player-team-panel__empty">
          <Icon name="users" className="h-5 w-5" />
          <p>{t("noTeamsAvailable", lang)}</p>
        </div>
      )}

      {feedback && <p className="player-team-panel__feedback" role="status">{feedback}</p>}
    </section>
  );
}
