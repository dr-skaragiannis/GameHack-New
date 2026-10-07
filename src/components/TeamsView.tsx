import { allTeams, levelFromXp, teamForPlayer, teamMembers, type User } from "../lib/db";
import { t, uppercaseLabel, type Lang } from "../i18n";
import Avatar from "./Avatar";
import Icon from "./Icon";
import PlayerTeamPanel from "./PlayerTeamPanel";

function isOnline(user: User): boolean {
  return !!user.lastSeen && Date.now() - user.lastSeen < 120000;
}

function MemberRow({ member, lang, onProfile }: { member: User; lang: Lang; onProfile?: (id: string) => void }) {
  return (
    <button
      type="button"
      onClick={() => onProfile?.(member.id)}
      className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition hover:bg-white/5"
    >
      <span className="relative shrink-0">
        <Avatar src={member.avatar} name={member.displayName} size={36} />
        <span
          className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-gamehack-panel ${
            isOnline(member) ? "bg-emerald-400" : "bg-zinc-600"
          }`}
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-zinc-100">{member.displayName}</span>
        <span className="block text-xs text-iron-500">
          {t("level", lang)} {levelFromXp(member.metrics.xp).level}, {member.metrics.xp.toLocaleString()} XP
        </span>
      </span>
      <Icon name="chevron" className="h-4 w-4 shrink-0 text-iron-500" />
    </button>
  );
}

export default function TeamsView({
  user,
  lang,
  onProfile,
}: {
  user: User;
  lang: Lang;
  onProfile?: (id: string) => void;
}) {
  const isEducator = user.role === "educator";
  const team = teamForPlayer(user.id);
  const roster = team ? teamMembers(team.id) : [];
  const teams = allTeams();

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div>
        <div className="text-sm uppercase tracking-[0.25em] text-cyan-400">
          {uppercaseLabel(t("community", lang), lang)}
        </div>
        <h1 className="mt-1 text-3xl font-bold">{t("teamsNav", lang)}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-iron-400">
          {t(isEducator ? "teamsIntroEducator" : "teamsIntro", lang)}
        </p>
      </div>

      {isEducator ? (
        <div className="space-y-4">
          {teams.map((candidate) => {
            const members = teamMembers(candidate.id);
            return (
              <section key={candidate.id} className="glass rounded-2xl border border-gamehack-border p-5">
                <header className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan-600/20 text-cyan-300">
                    <Icon name="shield" className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-lg font-bold text-zinc-100">{candidate.name}</h2>
                    <p className="truncate text-xs text-iron-500">
                      {members.length} {t("memberCount", lang)}
                    </p>
                  </div>
                </header>
                {candidate.description && (
                  <p className="mt-3 text-sm leading-relaxed text-iron-400">{candidate.description}</p>
                )}
                {members.length > 0 && (
                  <div className="mt-3 divide-y divide-white/5 rounded-xl border border-gamehack-border bg-gamehack-bg/40 p-1.5">
                    {members.map((member) => (
                      <MemberRow key={member.id} member={member} lang={lang} onProfile={onProfile} />
                    ))}
                  </div>
                )}
              </section>
            );
          })}
          {!teams.length && (
            <div className="glass rounded-2xl border border-gamehack-border p-8 text-center text-sm text-iron-400">
              {t("noTeamsAvailable", lang)}
            </div>
          )}
        </div>
      ) : (
        <>
          <PlayerTeamPanel user={user} lang={lang} />
          {team && roster.length > 0 && (
            <section
              className="glass rounded-2xl border border-gamehack-border p-5"
              aria-label={t("teamMembers", lang)}
            >
              <h2 className="text-lg font-bold text-zinc-100">{t("teamMembers", lang)}</h2>
              <p className="mt-1 text-xs text-iron-500">
                {roster.length} {t("memberCount", lang)}
              </p>
              <div className="mt-3 divide-y divide-white/5">
                {roster.map((member) => (
                  <MemberRow key={member.id} member={member} lang={lang} onProfile={onProfile} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
