import type { ContentWidth } from "../lib/db";
import { cn } from "../utils/cn";

const OPTS: { id: ContentWidth; label: string }[] = [
  { id: "centered", label: "S" },
  { id: "wide", label: "M" },
  { id: "full", label: "L" },
];

export default function WidthControl({
  value,
  onChange,
}: {
  value?: ContentWidth;
  onChange: (w: ContentWidth) => void;
}) {
  const cur = value || "wide";
  return (
    <div className="inline-flex rounded-lg border border-forge-border bg-forge-panel2 p-0.5">
      {OPTS.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => onChange(o.id)}
          className={cn(
            "h-7 min-w-7 px-2 rounded-md text-[11px] font-bold tracking-wide",
            cur === o.id ? "bg-ember-600/90 text-white" : "text-iron-400 hover:text-zinc-200"
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
