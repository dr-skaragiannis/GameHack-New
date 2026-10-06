import { useEffect, useMemo, useState } from "react";
import { allPlayers, getFeed, subscribeDB, type FeedEvent } from "../lib/db";
import { t, type Lang } from "../i18n";
import Icon from "./Icon";

const KIND_ICON: Record<FeedEvent["kind"], string> = {
  join: "spark",
  task: "check",
  module: "flag",
  challenge: "target",
  badge: "medal",
  levelup: "crown",
  login: "user",
  broadcast: "mail",
};

function ago(ts: number) {
  const s = Math.max(1, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.round(s / 60)}m`;
  if (s < 86400) return `${Math.round(s / 3600)}h`;
  return `${Math.round(s / 86400)}d`;
}

export default function LiveFeed({
  compact,
  excludeUserId,
  excludeUsername,
  playersOnly = false,
  lang = "en",
}: {
  compact?: boolean;
  excludeUserId?: string;
  excludeUsername?: string;
  playersOnly?: boolean;
  lang?: Lang;
}) {
  const [revision, setRevision] = useState(0);

  useEffect(() => subscribeDB(() => setRevision((value) => value + 1)), []);

  const items = useMemo(() => {
    const players = playersOnly ? allPlayers() : [];
    const playerIds = new Set(players.map((player) => player.id));
    const playerNames = new Set(players.map((player) => player.displayName.trim().toLocaleLowerCase()));
    return getFeed()
      .slice()
      .sort((a, b) => b.ts - a.ts)
      .filter((event) =>
        (!excludeUserId || event.userId !== excludeUserId) &&
        (!excludeUsername || event.username.trim().toLocaleLowerCase() !== excludeUsername.trim().toLocaleLowerCase())
      )
      .filter((event) => !playersOnly || playerIds.has(event.userId) || playerNames.has(event.username.trim().toLocaleLowerCase()))
      .slice(0, compact ? 12 : 24);
  }, [revision, compact, excludeUserId, excludeUsername, playersOnly]);

  if (compact) {
    if (!items.length) {
      return (
        <div className="live-feed__ticker-empty">
          <span><Icon name="wifi" className="h-4 w-4" /></span>
          <p>{t("noOtherPlayerActivity", lang)}</p>
        </div>
      );
    }
    const copyCount = Math.max(1, Math.ceil(12 / items.length));
    const loop = Array.from({ length: copyCount * 2 }, () => items).flat();
    return (
      <div className="live-feed__ticker" role="region" aria-label={t("liveFeed", lang)}>
        <div className="live-feed__ticker-track marquee-track">
          {loop.map((event, index) => {
            const action = event.username && event.text.toLocaleLowerCase().startsWith(event.username.toLocaleLowerCase())
              ? event.text.slice(event.username.length).trim()
              : event.text;
            return (
              <span key={`${event.id}-${index}`} className="live-feed__ticker-item" title={event.text} aria-hidden={index >= items.length}>
                <span className="live-feed__ticker-icon"><Icon name={KIND_ICON[event.kind]} className="h-3.5 w-3.5" /></span>
                <strong>{event.username}</strong>
                <span>{action}</span>
                <time>{ago(event.ts)}</time>
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <ul className="live-feed__list space-y-2">
      {items.map((event) => (
        <li key={event.id} className="live-feed__event flex items-start gap-3 text-sm">
          <span className="live-feed__event-icon mt-0.5 text-ember-400"><Icon name={KIND_ICON[event.kind]} className="w-4 h-4" /></span>
          <div className="live-feed__event-copy flex-1 min-w-0">
            <div className="text-zinc-300 truncate" title={event.text}>{event.text}</div>
            <time className="text-sm text-zinc-600">{ago(event.ts)}</time>
          </div>
        </li>
      ))}
      {!items.length && <li className="live-feed__empty">{t("noLiveActivity", lang)}</li>}
    </ul>
  );
}
