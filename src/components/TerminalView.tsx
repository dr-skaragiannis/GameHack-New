import { useEffect, useRef, useState } from "react";
import { type OutLine, type TerminalLike } from "../lib/terminal";
import { sound } from "../lib/sound";
import MuteButton from "./MuteButton";
import { cn } from "../utils/cn";

type Block = { prompt: string; input: string; out: OutLine[] };

export default function TerminalView({
  term,
  onCommand,
  banner,
}: {
  term: TerminalLike;
  onCommand: (raw: string, output?: OutLine[], pasted?: boolean) => void;
  banner?: OutLine[];
}) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  // The block currently being "typed out" (command echo + streaming output).
  const [streaming, setStreaming] = useState<{ prompt: string; input: string; out: OutLine[]; shown: number } | null>(
    null
  );
  const [input, setInput] = useState("");
  const [histIdx, setHistIdx] = useState<number | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const pastedRef = useRef(false);
  const busyRef = useRef(false); // true while output is streaming
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [blocks, streaming]);

  // Stream a finished command's output line-by-line like a real terminal.
  const streamOut = (prompt: string, raw: string, out: OutLine[]) => {
    busyRef.current = true;
    setStreaming({ prompt, input: raw, out, shown: 0 });
    let i = 0;
    const step = () => {
      i++;
      setStreaming((s) => (s ? { ...s, shown: i } : s));
      if (i <= out.length && out[i - 1]?.text) sound.tick();
      if (i < out.length) {
        // pace lines; errors/short lines slightly faster
        const delay = 22 + Math.min(60, (out[i]?.text.length || 0) * 1.2);
        setTimeout(step, delay);
      } else {
        // commit to history blocks
        setStreaming(null);
        setBlocks((b) => [...b, { prompt, input: raw, out }]);
        busyRef.current = false;
      }
    };
    if (out.length === 0) {
      setStreaming(null);
      setBlocks((b) => [...b, { prompt, input: raw, out }]);
      busyRef.current = false;
    } else {
      setTimeout(step, 40);
    }
  };

  const submit = () => {
    if (busyRef.current) return; // ignore input while streaming
    const raw = input;
    const prompt = term.prompt();
    sound.enter();
    const out = term.run(raw);
    setInput("");
    setHistIdx(null);
    setSuggestions([]);
    const isClear = out.length === 1 && out[0].text === "__CLEAR__";
    if (isClear) {
      setBlocks([]);
    } else if (raw.trim()) {
      streamOut(prompt, raw, out);
    } else {
      // blank enter — just echo the prompt line
      setBlocks((b) => [...b, { prompt, input: raw, out: [] }]);
    }
    const wasPasted = pastedRef.current;
    pastedRef.current = false;
    if (raw.trim()) onCommand(raw.trim(), isClear ? [] : out, wasPasted);
  };

  const onKey = (e: React.KeyboardEvent) => {
    sound.unlock();
    if (busyRef.current) {
      e.preventDefault();
      return;
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const { completed, candidates } = term.complete(input);
      setInput(completed);
      setSuggestions(candidates);
      sound.tab();
      return;
    }
    if (suggestions.length && e.key !== "Shift") setSuggestions([]);
    if (e.key === "Enter") {
      submit();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const h = term.history;
      if (!h.length) return;
      const idx = histIdx === null ? h.length - 1 : Math.max(0, histIdx - 1);
      setHistIdx(idx);
      setInput(h[idx]);
      sound.nav();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const h = term.history;
      if (histIdx === null) return;
      const idx = histIdx + 1;
      if (idx >= h.length) {
        setHistIdx(null);
        setInput("");
      } else {
        setHistIdx(idx);
        setInput(h[idx]);
      }
      sound.nav();
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setBlocks([]);
    } else if (e.key === "Backspace") {
      sound.key();
    } else if (e.key === " ") {
      sound.space();
    } else if (e.key.length === 1) {
      sound.key();
    }
  };

  return (
    <div
      className="crt relative flex h-full flex-col overflow-hidden rounded-xl border border-forge-border bg-[#08080a]"
      onClick={() => inputRef.current?.focus()}
    >
      {/* title bar */}
      <div className="flex items-center gap-2 border-b border-forge-border bg-forge-panel2 px-4 py-2">
        <span className="h-3 w-3 rounded-full bg-red-500/80" />
        <span className="h-3 w-3 rounded-full bg-amber-400/80" />
        <span className="h-3 w-3 rounded-full bg-green-500/80" />
        <span className="ml-3 font-mono text-xs text-iron-400">operator@kali — hackforge lab shell</span>
        <MuteButton className="ml-auto h-7 w-7" />
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 font-mono text-[13px] leading-relaxed">
        {banner?.map((b, i) => (
          <div key={"ban" + i} className={cn("whitespace-pre-wrap", b.cls)}>
            {b.text}
          </div>
        ))}
        {blocks.map((blk, i) => (
          <div key={i} className="fadeup">
            <div className="flex flex-wrap gap-2">
              <span className="text-ember-400">{blk.prompt}</span>
              <span className="text-zinc-100">{blk.input}</span>
            </div>
            {blk.out.map((o, j) => (
              <div key={j} className={cn("whitespace-pre-wrap break-words", o.cls || "text-zinc-300")}>
                {o.text}
              </div>
            ))}
          </div>
        ))}

        {/* currently streaming block */}
        {streaming && (
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="text-ember-400">{streaming.prompt}</span>
              <span className="text-zinc-100">{streaming.input}</span>
            </div>
            {streaming.out.slice(0, streaming.shown).map((o, j) => (
              <div key={j} className={cn("whitespace-pre-wrap break-words fadeup", o.cls || "text-zinc-300")}>
                {o.text || "\u00A0"}
              </div>
            ))}
          </div>
        )}

        {/* active input line (hidden while streaming) */}
        {!streaming && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-ember-400">{term.prompt()}</span>
            <div className="relative flex-1 min-w-[120px]">
              <input
                ref={inputRef}
                autoFocus
                spellCheck={false}
                autoComplete="off"
                className="w-full bg-transparent font-mono text-[13px] text-zinc-100 caret-ember-400 outline-none"
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (suggestions.length) setSuggestions([]);
                }}
                onPaste={() => {
                  pastedRef.current = true;
                }}
                onKeyDown={onKey}
              />
            </div>
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 border-t border-forge-line pt-2 text-iron-400">
            {suggestions.map((s, i) => (
              <span key={i} className={cn(s.endsWith("/") ? "text-neon-cyan" : "text-zinc-400")}>
                {s}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="border-t border-forge-border bg-forge-panel2 px-4 py-1.5 font-mono text-[10px] text-iron-600">
        Tab ↹ autocomplete · ↑↓ history · Ctrl+L clear
      </div>
    </div>
  );
}
