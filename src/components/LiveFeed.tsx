import { getFeed, type FeedEvent } from "../lib/db";
import { useMemo } from "react";
import Icon from "./Icon";

const KIND_ICON: Record<FeedEvent["kind"], string> = {
  join: "spark",
  task: "check",
  module: "flag",
  challenge: "target",
  badge: "medal",
  levelup: "crown",
  login: "user",
};

function ago(ts: number) {
  const s = Math.max(1, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.round(s / 60)}m`;
  if (s < 86400) return `${Math.round(s / 3600)}h`;
  return `${Math.round(s / 86400)}d`;
}

export default function LiveFeed({ compact }: { compact?: boolean }) {
  const items = useMemo(() => getFeed().slice(0, compact ? 12 : 24), []);
  if (compact) {
    const loop = [...items, ...items];
    return (
      <div className="overflow-hidden border-y border-forge-border bg-forge-panel/80">
        <div className="marquee-track py-2 gap-8 px-4 text-sm text-iron-400">
          {loop.map((e, i) => (
            <span key={e.id + i} className="inline-flex items-center gap-2">
              <span className="text-ember-400">◆</span>
              {e.text}
              <span className="text-zinc-600">{ago(e.ts)}</span>
            </span>
          ))}
        </div>
      </div>
    );
  }
  return (
    <ul className="space-y-2">
      {items.map((e) => (
        <li key={e.id} className="flex items-start gap-3 text-sm">
          <div className="mt-0.5 text-ember-400">
            <Icon name={KIND_ICON[e.kind]} className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-zinc-300 truncate">{e.text}</div>
            <div className="text-sm text-zinc-600">{ago(e.ts)}</div>
          </div>
        </li>
      ))}
    </ul>
  );
}
