import { useState } from "react";
import * as db from "../lib/db";
import { timeAgo } from "./PlayerDashboard";
import Icon from "./Icon";
import { cn } from "../utils/cn";

export function feedColor(kind: db.FeedEvent["kind"]): string {
  return kind === "badge"
    ? "bg-ember-400"
    : kind === "challenge" || kind === "module"
      ? "bg-neon-green"
      : kind === "levelup"
        ? "bg-amber-300"
        : kind === "login" || kind === "join"
          ? "bg-iron-500"
          : "bg-neon-cyan";
}

function feedDot(kind: db.FeedEvent["kind"]): string {
  return kind === "badge"
    ? "text-ember-400"
    : kind === "challenge" || kind === "module"
      ? "text-neon-green"
      : kind === "levelup"
        ? "text-amber-300"
        : kind === "login" || kind === "join"
          ? "text-iron-400"
          : "text-neon-cyan";
}

function kindIcon(kind: db.FeedEvent["kind"]): string {
  switch (kind) {
    case "badge":
      return "medal";
    case "challenge":
      return "sword";
    case "module":
      return "crown";
    case "levelup":
      return "flag";
    case "task":
      return "check";
    case "login":
    case "join":
      return "terminal";
    default:
      return "radar";
  }
}

// Horizontal scrolling ticker — one continuous line sliding across. Pauses on hover.
export function FeedTicker({ events }: { events: db.FeedEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="flex h-9 items-center px-4 font-mono text-xs text-iron-600">No recent activity…</div>
    );
  }
  // duplicate the list so the marquee loops seamlessly (keyframe translates -50%)
  const loop = [...events, ...events];
  return (
    <div className="relative overflow-hidden rounded-xl border border-forge-border bg-forge-bg">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-forge-bg to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-forge-bg to-transparent" />
      <div className="flex items-center gap-2 py-2.5">
        <span className="z-20 ml-3 flex shrink-0 items-center gap-1.5 rounded-md bg-ember-600 px-2 py-0.5 font-mono text-[10px] font-black uppercase text-white">
          <span className="ping-dot h-1.5 w-1.5 rounded-full bg-white" /> Live
        </span>
        <div className="marquee-track">
          {loop.map((f, i) => (
            <span key={i} className="mx-5 inline-flex items-center gap-2 font-mono text-xs">
              <Icon name={kindIcon(f.kind)} className={cn("h-3.5 w-3.5", feedDot(f.kind))} />
              <span className="text-zinc-300">{f.text}</span>
              <span className="text-iron-600">· {timeAgo(f.ts)}</span>
              <span className="text-forge-border">◆</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// Vertical scrollable feed box. For educators, pass `filters` to show the filter bar.
export function FeedBox({
  events,
  filterable,
  maxHeight = "max-h-80",
}: {
  events: db.FeedEvent[];
  filterable?: boolean;
  maxHeight?: string;
}) {
  const [active, setActive] = useState<string>("all");

  const FILTERS: { id: string; label: string; kinds: db.FeedEvent["kind"][] }[] = [
    { id: "all", label: "All", kinds: [] },
    { id: "captures", label: "Captures", kinds: ["task", "challenge"] },
    { id: "campaigns", label: "Campaigns", kinds: ["module"] },
    { id: "badges", label: "Badges", kinds: ["badge"] },
    { id: "levels", label: "Level ups", kinds: ["levelup"] },
    { id: "logins", label: "Logins", kinds: ["login", "join"] },
  ];

  const sel = FILTERS.find((f) => f.id === active) || FILTERS[0];
  const shown = filterable && sel.kinds.length ? events.filter((e) => sel.kinds.includes(e.kind)) : events;

  return (
    <div>
      {filterable && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setActive(f.id)}
              className={cn(
                "rounded-lg px-2.5 py-1 font-mono text-[11px] font-bold transition",
                active === f.id ? "bg-ember-600 text-white" : "border border-forge-border text-iron-400 hover:text-zinc-200"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}
      <div className={cn("space-y-2.5 overflow-y-auto pr-1", maxHeight)}>
        {shown.map((f, i) => (
          <div key={f.id} className={cn("slide-in-right flex gap-2.5 text-sm", `enter-${Math.min(i + 1, 8)}`)}>
            <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", feedColor(f.kind))} />
            <div className="min-w-0">
              <span className="text-zinc-300">{f.text}</span>
              <div className="font-mono text-[11px] text-iron-600">{timeAgo(f.ts)}</div>
            </div>
          </div>
        ))}
        {shown.length === 0 && <div className="text-sm text-iron-500">No activity in this filter.</div>}
      </div>
    </div>
  );
}
