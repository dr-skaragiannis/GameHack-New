import { useState } from "react";
import { RavenSession, resolvePage, RAVEN_NAV, TARGET_IP, type WebPage } from "../lib/raven";
import { cn } from "../utils/cn";
import Icon from "./Icon";

// A simulated web browser. Both the terminal and this browser mutate the same
// RavenSession, so objectives are satisfied no matter which tool the player uses.
export default function RavenBrowser({
  session,
  onAction,
}: {
  session: RavenSession;
  onAction: () => void;
}) {
  const [addr, setAddr] = useState(`http://${TARGET_IP}/`);
  const [current, setCurrent] = useState(`http://${TARGET_IP}/`);
  const [showSource, setShowSource] = useState(false);
  const [history, setHistory] = useState<string[]>([]);

  const { url, page } = resolvePage(current, session);

  const go = (target: string, pushHistory = true) => {
    if (pushHistory) setHistory((h) => [...h, current]);
    setCurrent(target);
    setAddr(target);
    setShowSource(false);
    // navigating marks visited in resolvePage
    setTimeout(onAction, 0);
  };

  const back = () => {
    setHistory((h) => {
      if (!h.length) return h;
      const prev = h[h.length - 1];
      setCurrent(prev);
      setAddr(prev);
      setShowSource(false);
      return h.slice(0, -1);
    });
    setTimeout(onAction, 0);
  };

  const toggleSource = () => {
    const next = !showSource;
    setShowSource(next);
    if (next) {
      session.sawSource.add(new URL(url).pathname);
      if (page.flag) session.capture(page.flag); // viewing source reveals the flag
      onAction();
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-forge-border bg-[#0d0d10]">
      {/* browser chrome */}
      <div className="flex items-center gap-2 border-b border-forge-border bg-forge-panel2 px-3 py-2">
        <button
          onClick={back}
          disabled={!history.length}
          className="rounded-md border border-forge-border px-2 py-1 font-mono text-xs text-iron-400 transition enabled:hover:text-ember-400 disabled:opacity-40"
        >
          ←
        </button>
        <button
          onClick={() => go(current, false)}
          className="rounded-md border border-forge-border px-2 py-1 font-mono text-xs text-iron-400 transition hover:text-ember-400"
          title="Reload"
        >
          ⟳
        </button>
        <form
          className="flex flex-1 items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            go(addr);
          }}
        >
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-forge-border bg-forge-bg px-3 py-1.5">
            <Icon name="globe" className="h-3.5 w-3.5 text-iron-500" />
            <input
              value={addr}
              onChange={(e) => setAddr(e.target.value)}
              spellCheck={false}
              className="flex-1 bg-transparent font-mono text-xs text-zinc-200 outline-none"
              placeholder={`http://${TARGET_IP}/`}
            />
          </div>
        </form>
        <button
          onClick={toggleSource}
          className={cn(
            "flex items-center gap-1 rounded-md border px-2.5 py-1 font-mono text-[11px] transition",
            showSource ? "border-ember-500 text-ember-400" : "border-forge-border text-iron-400 hover:text-zinc-200"
          )}
          title="View page source (Ctrl+U)"
        >
          <Icon name="terminal" className="h-3.5 w-3.5" /> Source
        </button>
      </div>

      {/* quick nav for the Raven Security site */}
      <div className="flex flex-wrap items-center gap-1 border-b border-forge-line bg-forge-panel/60 px-3 py-1.5">
        {RAVEN_NAV.map((n) => (
          <button
            key={n.path}
            onClick={() => go(`http://${TARGET_IP}${n.path}`)}
            className="rounded px-2 py-0.5 font-mono text-[11px] text-iron-400 transition hover:bg-forge-bg hover:text-ember-400"
          >
            {n.label}
          </button>
        ))}
        <span className="mx-1 text-forge-border">|</span>
        <button
          onClick={() => go(`http://${TARGET_IP}/wordpress/`)}
          className="rounded px-2 py-0.5 font-mono text-[11px] text-neon-cyan transition hover:bg-forge-bg"
        >
          Blog
        </button>
      </div>

      {/* viewport */}
      <div className="flex-1 overflow-y-auto">
        {showSource ? (
          <pre className="whitespace-pre-wrap p-4 font-mono text-[12px] leading-relaxed text-zinc-300">
            {colorizeSource(page.source)}
          </pre>
        ) : (
          <PageRender page={page} onNavigate={go} />
        )}
      </div>

      <div className="border-t border-forge-border bg-forge-panel2 px-3 py-1 font-mono text-[10px] text-iron-600">
        Tip: some secrets only appear in the page <span className="text-ember-400">Source</span> — toggle it.
      </div>
    </div>
  );
}

function colorizeSource(src: string) {
  // highlight flag comments
  return src.split("\n").map((ln, i) => {
    const flag = ln.match(/flag\d\{[^}]+\}/);
    if (flag) {
      const [before, after] = ln.split(flag[0]);
      return (
        <div key={i}>
          {before}
          <span className="rounded bg-ember-500/20 px-1 font-bold text-ember-300">{flag[0]}</span>
          {after}
        </div>
      );
    }
    return <div key={i}>{ln || "\u00A0"}</div>;
  });
}

function PageRender({ page, onNavigate }: { page: WebPage; onNavigate: (u: string) => void }) {
  if (page.kind === "notfound") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-10 text-center">
        <div className="font-mono text-5xl font-black text-iron-600">404</div>
        <div className="text-iron-500">This host or page could not be reached.</div>
      </div>
    );
  }

  if (page.kind === "raven-home") {
    return (
      <div className="min-h-full bg-gradient-to-b from-[#11131a] to-[#0d0d10] text-zinc-200">
        <div className="border-b border-white/5 px-8 py-16 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-ember-600/20 text-ember-400">
            <Icon name="crown" className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-black tracking-widest text-white">{page.heading}</h1>
          <p className="mt-3 text-sm text-zinc-400">{page.body?.[0]}</p>
          <p className="text-sm text-zinc-500">{page.body?.[1]}</p>
        </div>
        <div className="grid gap-4 p-8 sm:grid-cols-3">
          {["Penetration Testing", "Incident Response", "Security Training"].map((s) => (
            <div key={s} className="rounded-lg border border-white/5 bg-white/5 p-4">
              <div className="mb-1 font-bold text-ember-300">{s}</div>
              <div className="text-xs text-zinc-500">Enterprise-grade protection for your business.</div>
            </div>
          ))}
        </div>
        <div className="px-8 pb-8 text-center">
          <button
            onClick={() => onNavigate(`http://${TARGET_IP}/services.html`)}
            className="rounded-lg bg-ember-600 px-5 py-2 text-sm font-bold text-white hover:bg-ember-500"
          >
            View our Services →
          </button>
        </div>
      </div>
    );
  }

  if (page.kind === "wp-blog") {
    return (
      <div className="min-h-full bg-[#f4f4f4] p-8 text-zinc-800">
        <div className="mx-auto max-w-xl">
          <h1 className="mb-4 border-b-2 border-zinc-300 pb-2 text-2xl font-black text-zinc-900">
            {page.heading}
          </h1>
          {page.body?.map((b, i) => (
            <p key={i} className="mb-2 text-sm text-zinc-600">
              {b}
            </p>
          ))}
          <button
            onClick={() => onNavigate(`http://${TARGET_IP}/wordpress/wp-login.php`)}
            className="mt-4 rounded bg-zinc-800 px-4 py-2 text-sm font-bold text-white hover:bg-zinc-700"
          >
            Log in
          </button>
          <p className="mt-6 text-xs text-red-500">
            ⚠ Theme assets fail to load — the site keeps requesting <code>raven.local</code>.
          </p>
        </div>
      </div>
    );
  }

  if (page.kind === "wp-login") {
    return (
      <div className="flex min-h-full items-center justify-center bg-[#f1f1f1] p-8">
        <div className="w-72 rounded-lg border border-zinc-300 bg-white p-6 shadow">
          <div className="mb-5 text-center text-3xl">🅦</div>
          <input
            className="mb-3 w-full rounded border border-zinc-300 px-3 py-2 text-sm text-zinc-800"
            placeholder="Username"
          />
          <input
            className="mb-3 w-full rounded border border-zinc-300 px-3 py-2 text-sm text-zinc-800"
            placeholder="Password"
            type="password"
          />
          <button className="w-full rounded bg-blue-600 py-2 text-sm font-bold text-white">Log In</button>
          <p className="mt-4 text-[11px] text-zinc-500">No account lockout — a brute-force target (use the terminal).</p>
        </div>
      </div>
    );
  }

  // generic raven page
  return (
    <div className="min-h-full bg-[#11131a] p-8 text-zinc-200">
      <div className="mx-auto max-w-xl">
        <h1 className="mb-4 text-2xl font-black text-white">{page.heading}</h1>
        {page.body?.map((b, i) => (
          <p key={i} className="mb-2 text-sm text-zinc-400">
            {b}
          </p>
        ))}
      </div>
    </div>
  );
}
