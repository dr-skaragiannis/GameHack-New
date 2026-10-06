import { useEffect, useRef, useState } from "react";
import { complete, prompt, type Terminal, type TermLine } from "../lib/terminal";
import { sound } from "../lib/sound";
import { t, type Lang } from "../i18n";
import { cn } from "../utils/cn";

export default function TerminalView({
  term,
  lang,
  onCommand,
  suggestion,
  onSuggestionConsumed,
}: {
  term: Terminal;
  lang: Lang;
  onCommand: (raw: string, pasted: boolean) => void;
  suggestion?: string | null;
  onSuggestionConsumed?: () => void;
}) {
  const [buf, setBuf] = useState("");
  const [histIdx, setHistIdx] = useState(-1);
  const [, bumpScreen] = useState(0);
  const scroller = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const pasteRef = useRef(false);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [term.lines.length]);

  useEffect(() => {
    if (!suggestion) return;
    setBuf(suggestion);
    input.current?.focus();
    onSuggestionConsumed?.();
  }, [suggestion, onSuggestionConsumed]);

  const color = (l: TermLine) => {
    switch (l.kind) {
      case "in":
        return "text-zinc-400";
      case "err":
        return "text-rose-400";
      case "ok":
        return "text-neon-green";
      case "sys":
        return "text-neon-cyan/80";
      default:
        return "text-zinc-200";
    }
  };

  const submit = (raw: string) => {
    const pasted = pasteRef.current;
    pasteRef.current = false;
    sound.enter();
    onCommand(raw, pasted);
    setBuf("");
    setHistIdx(-1);
  };

  return (
    <div
      className="terminal-window relative flex min-h-0 flex-col rounded-xl border border-forge-border bg-black/80 crt overflow-hidden font-mono text-sm"
      onClick={() => input.current?.focus()}
    >
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5 bg-zinc-900/80 text-sm text-iron-400">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-neon-green/80" />
        <span className="ml-2 min-w-0 truncate tracking-wider">
          {term.user}@{term.host} — HACKFORGE
        </span>
        <button
          type="button"
          aria-label="Show the shared 100-command Linux reference in this terminal"
          title="Show the shared 100-command Linux reference"
          onClick={(event) => {
            event.stopPropagation();
            sound.enter();
            onCommand("help", false);
          }}
          className="ml-auto shrink-0 rounded-md border border-neon-cyan/30 bg-neon-cyan/10 px-2 py-1.5 text-sm font-semibold text-neon-cyan hover:bg-neon-cyan/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-neon-cyan sm:px-3"
        >
          Top 100
        </button>
      </div>
      <div ref={scroller} className="terminal-window__scroll flex-1 px-3 py-3 space-y-0.5 leading-relaxed">
        {term.lines.map((l, i) => (
          <div key={i} className={cn("whitespace-pre-wrap break-all", color(l))}>
            {l.text}
          </div>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(buf);
        }}
        className="terminal-window__input flex shrink-0 items-center gap-2 border-t border-white/5 bg-zinc-950/80 px-3 py-3"
      >
        <span className="text-ember-400 shrink-0">{prompt(term)}</span>
        <input
          ref={input}
          value={buf}
          autoFocus
          autoComplete="off"
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          aria-label={t("typeCommand", lang)}
          onChange={(e) => setBuf(e.target.value)}
          onPaste={() => {
            pasteRef.current = true;
          }}
          onKeyDown={(e) => {
            if (e.key === " ") sound.space();
            else if (e.key === "Tab") {
              e.preventDefault();
              sound.tab();
              const hits = complete(term, buf);
              if (hits.length === 1) {
                const parts = buf.split(/\s+/);
                parts[parts.length - 1] = hits[0];
                setBuf(parts.join(" "));
              } else if (hits.length > 1) {
                term.lines.push({ kind: "sys", text: hits.join("  ") });
                bumpScreen((n) => n + 1);
              }
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              const h = term.history;
              if (!h.length) return;
              const ni = histIdx < 0 ? h.length - 1 : Math.max(0, histIdx - 1);
              setHistIdx(ni);
              setBuf(h[ni]);
            } else if (e.key === "ArrowDown") {
              e.preventDefault();
              const h = term.history;
              if (histIdx < 0) return;
              const ni = histIdx + 1;
              if (ni >= h.length) {
                setHistIdx(-1);
                setBuf("");
              } else {
                setHistIdx(ni);
                setBuf(h[ni]);
              }
            } else if (e.key.length === 1) sound.key();
          }}
          className="flex-1 bg-transparent outline-none text-zinc-100 placeholder:text-zinc-600 caret-ember-400"
        />
      </form>
    </div>
  );
}
