import type { ContentWidth } from "../lib/db";
import { cn } from "../utils/cn";

const OPTS: { id: ContentWidth; label: string; title: string; glyph: React.ReactNode }[] = [
  {
    id: "centered",
    label: "Center",
    title: "Centered column with padding",
    glyph: (
      <svg viewBox="0 0 24 16" className="h-4 w-6" fill="none">
        <rect x="1" y="1" width="22" height="14" rx="1.5" className="stroke-current opacity-30" />
        <rect x="8" y="3" width="8" height="10" rx="1" className="fill-current" />
      </svg>
    ),
  },
  {
    id: "wide",
    label: "75%",
    title: "75% width",
    glyph: (
      <svg viewBox="0 0 24 16" className="h-4 w-6" fill="none">
        <rect x="1" y="1" width="22" height="14" rx="1.5" className="stroke-current opacity-30" />
        <rect x="4" y="3" width="16" height="10" rx="1" className="fill-current" />
      </svg>
    ),
  },
  {
    id: "full",
    label: "Full",
    title: "Full width",
    glyph: (
      <svg viewBox="0 0 24 16" className="h-4 w-6" fill="none">
        <rect x="1" y="3" width="22" height="10" rx="1" className="fill-current" />
      </svg>
    ),
  },
];

export default function WidthControl({
  value,
  onChange,
  compact,
}: {
  value: ContentWidth;
  onChange: (w: ContentWidth) => void;
  compact?: boolean;
}) {
  return (
    <div className="flex w-full gap-1 rounded-lg border border-forge-border bg-forge-bg p-1">
      {OPTS.map((o) => (
        <button
          key={o.id}
          title={o.title}
          onClick={() => onChange(o.id)}
          className={cn(
            "flex min-w-0 flex-1 items-center justify-center gap-1.5 rounded-md px-1.5 py-1.5 font-mono text-[11px] font-bold transition",
            value === o.id ? "bg-ember-600 text-white" : "text-iron-400 hover:bg-forge-panel hover:text-zinc-200"
          )}
        >
          <span className="shrink-0">{o.glyph}</span>
          {!compact && <span className="truncate">{o.label}</span>}
        </button>
      ))}
    </div>
  );
}
