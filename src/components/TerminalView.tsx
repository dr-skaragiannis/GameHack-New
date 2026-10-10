import { useEffect, useRef, useState } from "react";
import { complete, prompt, type Terminal, type TermLine } from "../lib/terminal";
import { sound } from "../lib/sound";
import { t, type Lang } from "../i18n";
import { cn } from "../utils/cn";
import Icon from "./Icon";

export default function TerminalView({
  term,
  lang,
  onCommand,
  suggestion,
  onSuggestionConsumed,
  onRevert,
}: {
  term: Terminal;
  lang: Lang;
  onCommand: (raw: string, pasted: boolean) => void;
  suggestion?: string | null;
  onSuggestionConsumed?: () => void;
  onRevert?: () => void;
}) {
  const [buf, setBuf] = useState("");
  const [histIdx, setHistIdx] = useState(-1);
  const [inputFocused, setInputFocused] = useState(false);
  const [revertArmed, setRevertArmed] = useState(false);
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
      className="terminal-window relative flex min-h-0 flex-col rounded-xl border border-gamehack-border bg-black/80 crt overflow-hidden font-mono text-sm"
      onClick={() => input.current?.focus()}
    >
      <div className="terminal-window__bar relative flex items-center gap-2 px-3 py-2 border-b border-white/5 bg-zinc-900/80 text-sm text-iron-400">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-cyan-400/80" />
        <span className="h-2.5 w-2.5 rounded-full bg-neon-green/80" />
        <span className="ml-2 min-w-0 truncate tracking-wider">
          {term.user}@{term.host} — GameHack
        </span>
        <button
          type="button"
          aria-expanded={revertArmed}
          aria-label={t("revertLabTitle", lang)}
          title={t("revertLabTitle", lang)}
          onClick={(event) => {
            event.stopPropagation();
            sound.nav();
            setRevertArmed((open) => !open);
          }}
          className="terminal-revert ml-auto shrink-0"
        >
          <Icon name="revert" className="h-3.5 w-3.5" />
          <span>{t("revertLab", lang)}</span>
        </button>
        {revertArmed && (
          <div
            className="terminal-revert__confirm"
            role="dialog"
            aria-label={t("revertLabConfirm", lang)}
            onClick={(event) => event.stopPropagation()}
          >
            <strong>{t("revertLabConfirm", lang)}</strong>
            <p>{t("revertLabBody", lang)}</p>
            <div>
              <button
                type="button"
                onClick={() => {
                  sound.enter();
                  setRevertArmed(false);
                  onRevert?.();
                }}
              >
                {t("revertLabYes", lang)}
              </button>
              <button type="button" onClick={() => setRevertArmed(false)}>
                {t("revertLabCancel", lang)}
              </button>
            </div>
          </div>
        )}
      </div>
      <div ref={scroller} className="terminal-window__scroll min-w-0 flex-1 px-3 py-3 space-y-0.5 leading-relaxed">
        {term.lines.map((l, i) => (
          <div key={i} className={cn("whitespace-pre-wrap break-all", color(l))}>
            {l.text}
          </div>
        ))}
        <form
          key="terminal-command-line"
          onSubmit={(e) => {
            e.preventDefault();
            submit(buf);
          }}
          className="terminal-window__command flex min-w-0 items-center gap-2 leading-relaxed"
        >
          <span className="min-w-0 max-w-[55%] shrink truncate text-cyan-400" title={prompt(term)}>{prompt(term)}</span>
          {!inputFocused && !buf && (
            <span className="inline-block h-[1.1em] w-[0.55em] shrink-0 bg-cyan-400 cursor-blink" aria-hidden="true" />
          )}
          <input
            ref={input}
            type="text"
            value={buf}
            autoFocus
            autoComplete="off"
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            aria-label={t("typeCommand", lang)}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
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
            className="min-w-0 flex-1 bg-transparent p-0 font-mono text-sm leading-relaxed text-zinc-100 outline-none caret-cyan-400"
          />
        </form>
      </div>
    </div>
  );
}
