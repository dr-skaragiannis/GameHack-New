import { useState } from "react";
import { SshSession, SSH_FLAGS } from "../lib/ssh";
import Icon from "./Icon";

// A minimal virtual browser for the internal web app that is only reachable once
// a local SSH port-forward (ssh -L) is open. Before the tunnel exists, the
// request "fails" — teaching why localhost-bound services need pivoting.
export default function SshBrowser({ session, onAction }: { session: SshSession; onAction: () => void }) {
  const [addr, setAddr] = useState("http://localhost:8080/");
  const [loaded, setLoaded] = useState(false);
  const [err, setErr] = useState(false);

  const go = () => {
    const isLocal = /localhost:8080|127\.0\.0\.1:8080/.test(addr);
    if (isLocal && session.tunnelOpen) {
      session.visitedInternal = true;
      session.capture(SSH_FLAGS.tunnel);
      setLoaded(true);
      setErr(false);
      setTimeout(onAction, 0);
    } else {
      setLoaded(false);
      setErr(true);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-forge-border bg-[#0d0d10]">
      {/* chrome */}
      <div className="flex flex-none items-center gap-2 border-b border-forge-border bg-forge-panel2 px-3 py-2">
        <div className="flex gap-1.5">
          <span className="h-3 w-3 rounded-full bg-red-500/80" />
          <span className="h-3 w-3 rounded-full bg-amber-400/80" />
          <span className="h-3 w-3 rounded-full bg-green-500/80" />
        </div>
        <form
          className="flex flex-1 items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            go();
          }}
        >
          <div className="flex flex-1 items-center gap-2 rounded-lg border border-forge-border bg-forge-bg px-3 py-1.5">
            <Icon name="globe" className="h-3.5 w-3.5 text-iron-500" />
            <input
              value={addr}
              onChange={(e) => setAddr(e.target.value)}
              spellCheck={false}
              className="flex-1 bg-transparent font-mono text-xs text-zinc-200 outline-none"
              placeholder="http://localhost:8080/"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-ember-600 px-3 py-1.5 font-mono text-xs font-bold text-white transition hover:bg-ember-500"
          >
            Go
          </button>
        </form>
      </div>

      {/* viewport */}
      <div className="flex-1 overflow-y-auto">
        {loaded ? (
          <InternalApp />
        ) : err ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-red-500/50 text-red-400">
              <Icon name="ban" className="h-7 w-7" />
            </div>
            <div className="font-mono text-sm font-bold text-red-300">Unable to connect</div>
            <p className="max-w-xs text-sm text-iron-400">
              The app is bound to <code className="text-ember-400">127.0.0.1:8080</code> on the target — it isn't exposed
              to the network. Open an SSH local port-forward
              (<code className="text-ember-400">ssh -L 8080:127.0.0.1:8080 …</code>) in the Terminal, then reload.
            </p>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
            <Icon name="globe" className="h-10 w-10 text-iron-600" />
            <p className="max-w-xs text-sm text-iron-500">
              Enter <code className="text-ember-400">http://localhost:8080/</code> and press Go. It only loads once your
              SSH tunnel is live.
            </p>
          </div>
        )}
      </div>

      <div className="flex-none border-t border-forge-border bg-forge-panel2 px-3 py-1 font-mono text-[10px] text-iron-600">
        {session.tunnelOpen ? "Tunnel active — localhost:8080 is forwarded to the target." : "No tunnel — reachable only after ssh -L."}
      </div>
    </div>
  );
}

function InternalApp() {
  return (
    <div className="min-h-full bg-gradient-to-b from-[#0f1117] to-[#0d0d10] p-6 text-zinc-200">
      <div className="mx-auto max-w-md">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neon-green/15 text-neon-green">
            <Icon name="lock" className="h-6 w-6" />
          </div>
          <div>
            <div className="text-lg font-black text-zinc-50">Ignite Internal Console</div>
            <div className="font-mono text-[11px] text-iron-500">127.0.0.1:8080 · staff only</div>
          </div>
        </div>

        <div className="mb-4 rounded-lg border border-neon-green/30 bg-neon-green/5 p-3 text-sm text-neon-green">
          ✓ You reached a localhost-bound service through an SSH tunnel.
        </div>

        <div className="space-y-3">
          <div className="rounded-lg border border-forge-border bg-forge-panel p-4">
            <div className="mb-1 font-mono text-[11px] uppercase tracking-wide text-ember-500">Service status</div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-iron-400">Deploy pipeline</span>
              <span className="rounded bg-neon-green/15 px-2 py-0.5 font-mono text-[11px] text-neon-green">healthy</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-iron-400">Secrets vault</span>
              <span className="rounded bg-amber-500/15 px-2 py-0.5 font-mono text-[11px] text-amber-300">unlocked</span>
            </div>
          </div>

          <div className="rounded-lg border border-ember-500/40 bg-ember-500/5 p-4">
            <div className="mb-1 font-mono text-[11px] uppercase tracking-wide text-ember-400">Captured flag</div>
            <code className="break-all font-mono text-sm text-ember-300">{SSH_FLAGS.tunnel}</code>
          </div>
        </div>
      </div>
    </div>
  );
}
