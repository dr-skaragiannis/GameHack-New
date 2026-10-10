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

const CAROUSEL_MS = 4200;

function ago(ts: number) {
  const s = Math.max(1, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.round(s / 60)}m`;
  if (s < 86400) return `${Math.round(s / 3600)}h`;
  return `${Math.round(s / 86400)}d`;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);
  return reduced;
}

function eventAction(event: FeedEvent) {
  return event.username && event.text.toLocaleLowerCase().startsWith(event.username.toLocaleLowerCase())
    ? event.text.slice(event.username.length).trim()
    : event.text;
}

function FeedCarousel({ items, lang }: { items: FeedEvent[]; lang: Lang }) {
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = items.length;
  const safeIndex = count ? index % count : 0;
  const event = items[safeIndex];

  useEffect(() => {
    setIndex(0);
  }, [items.map((item) => item.id).join("|")]);

  useEffect(() => {
    if (paused || reduced || count < 2) return;
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % count), CAROUSEL_MS);
    return () => window.clearInterval(timer);
  }, [paused, reduced, count]);

  if (!event) return null;

  return (
    <div
      className="live-feed__carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label={t("feedCarousel", lang)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <article key={`${event.id}-${safeIndex}`} className="live-feed__slide" aria-live="polite">
        <span className="live-feed__event-icon ui-live-icon"><Icon name={KIND_ICON[event.kind]} className="h-4 w-4" /></span>
        <div className="live-feed__event-copy">
          <strong>{event.username}</strong>
          <p title={event.text}>{eventAction(event)}</p>
          <time dateTime={new Date(event.ts).toISOString()}>{ago(event.ts)}</time>
        </div>
      </article>
      {count > 1 && (
        <div className="live-feed__carousel-bar">
          <span key={paused || reduced ? "hold" : safeIndex} className={paused || reduced ? "is-paused" : ""} />
          <button type="button" onClick={() => setPaused((value) => !value)} aria-pressed={paused}>
            {paused ? t("feedPlay", lang) : t("feedPause", lang)}
          </button>
          <span className="live-feed__carousel-count">{safeIndex + 1}/{count}</span>
        </div>
      )}
    </div>
  );
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

  if (!items.length) {
    if (compact) {
      const emptyMessage = excludeUserId || excludeUsername ? "noOtherPlayerActivity" : "noPlayerActivity";
      return (
        <div className="live-feed__ticker-empty">
          <span className="ui-live-icon"><Icon name="wifi" className="h-4 w-4" /></span>
          <p>{t(emptyMessage, lang)}</p>
        </div>
      );
    }
    return <p className="live-feed__empty">{t("noLiveActivity", lang)}</p>;
  }

  if (compact) {
    const copyCount = Math.max(1, Math.ceil(12 / items.length));
    const loop = Array.from({ length: copyCount * 2 }, () => items).flat();
    return (
      <div className="live-feed__ticker" role="region" aria-label={t("liveFeed", lang)}>
        <div className="live-feed__ticker-track marquee-track">
          {loop.map((event, index) => (
            <span key={`${event.id}-${index}`} className="live-feed__ticker-item" title={event.text} aria-hidden={index >= items.length}>
              <span className="live-feed__ticker-icon ui-live-icon"><Icon name={KIND_ICON[event.kind]} className="h-3.5 w-3.5" /></span>
              <strong>{event.username}</strong>
              <span>{eventAction(event)}</span>
              <time>{ago(event.ts)}</time>
            </span>
          ))}
        </div>
      </div>
    );
  }

  return <FeedCarousel items={items} lang={lang} />;
}
