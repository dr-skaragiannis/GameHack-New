import { useEffect, useState } from "react";
import { sound } from "../lib/sound";
import { cn } from "../utils/cn";

// Speaker / muted-speaker toggle. Reads & writes the global mute flag.
export default function MuteButton({ className, label }: { className?: string; label?: boolean }) {
  const [muted, setMuted] = useState(sound.isMuted());

  useEffect(() => {
    const off = sound.onChange(setMuted);
    return () => {
      off();
    };
  }, []);

  return (
    <button
      onClick={() => {
        sound.unlock();
        sound.toggle();
        if (sound.isMuted()) {
          /* going silent — no sound */
        } else {
          sound.nav();
        }
      }}
      title={muted ? "Unmute sounds" : "Mute sounds"}
      aria-label={muted ? "Unmute sounds" : "Mute sounds"}
      className={cn(
        "flex items-center justify-center gap-1.5 rounded-lg border border-forge-border text-iron-300 transition hover:border-ember-500 hover:text-ember-400",
        className
      )}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="h-4 w-4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 9v6h4l5 4V5L8 9H4Z" />
        {muted ? (
          <path d="m17 9 4 6M21 9l-4 6" className="text-red-400" />
        ) : (
          <>
            <path d="M16.5 8.5a5 5 0 0 1 0 7" />
            <path d="M19 6a8 8 0 0 1 0 12" />
          </>
        )}
      </svg>
      {label && <span className="font-mono text-xs font-bold">{muted ? "Muted" : "Sound"}</span>}
    </button>
  );
}
