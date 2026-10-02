import { SshSession, ATTACKER_IP, TARGET_IP, TARGET_HOST, INTERNAL_PORT } from "../lib/ssh";
import Icon from "./Icon";
import { cn } from "../utils/cn";

// Live network topology for the SSH pentest. Nodes and links light up as the
// shared session changes (scan → crack → shell → tunnel → internal app).
export default function SshTopology({ session }: { session: SshSession }) {
  const s = session;
  const scanned = s.portScanned;
  const owned = s.loggedIn || s.remoteCmdRun || s.hydraCracked;
  const shell = s.loggedIn || s.keyLogin;
  const tunnel = s.tunnelOpen;
  const port = s.portChanged ? "2222" : "22";

  const stage = tunnel ? 4 : shell ? 3 : owned ? 2 : scanned ? 1 : 0;

  return (
    <div className="crt relative flex h-full flex-col overflow-hidden rounded-xl border border-forge-border bg-[#08080a]">
      <div className="flex flex-none items-center gap-2 border-b border-forge-border bg-forge-panel2 px-4 py-2">
        <span className="h-3 w-3 rounded-full bg-red-500/80" />
        <span className="h-3 w-3 rounded-full bg-amber-400/80" />
        <span className="h-3 w-3 rounded-full bg-green-500/80" />
        <span className="ml-3 font-mono text-xs text-iron-400">network topology — live</span>
        <span className="ml-auto font-mono text-[10px] text-iron-600">lab 192.168.1.0/24</span>
      </div>

      <div className="relative flex-1 overflow-hidden p-4">
        {/* connection SVG layer */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full" preserveAspectRatio="none">
          {/* attacker -> server */}
          <Link active={scanned} hot={owned} dashed={!owned} x1="22%" y1="38%" x2="50%" y2="38%" />
          {/* server -> internal app (tunnel) */}
          <Link active={tunnel} hot={tunnel} dashed={!tunnel} x1="72%" y1="38%" x2="72%" y2="72%" />
          {/* tunnel loopback: attacker -> internal (dotted overlay) */}
          {tunnel && <Link active hot tunnel x1="22%" y1="46%" x2="60%" y2="72%" />}
        </svg>

        <div className="relative grid h-full grid-cols-2 grid-rows-2 gap-3">
          {/* Attacker */}
          <Node
            className="col-start-1 row-start-1 self-center"
            icon="terminal"
            tone="cyan"
            active
            title="Attacker · Kali"
            ip={ATTACKER_IP}
            sub="kali@kali"
          />

          {/* SSH server */}
          <Node
            className="col-start-2 row-start-1 self-center"
            icon="lock"
            tone={owned ? "ember" : scanned ? "amber" : "idle"}
            active={scanned}
            pulse={scanned && !owned}
            title={`SSH Server · ${TARGET_HOST}`}
            ip={TARGET_IP}
            sub={`OpenSSH 8.9p1 · :${port}`}
            badge={owned ? (s.remoteUser === "root" ? "ROOT" : "pentest") : scanned ? "open" : undefined}
          />

          {/* Internal web app */}
          <Node
            className="col-start-2 row-start-2 self-center"
            icon="globe"
            tone={tunnel ? "green" : "idle"}
            active={tunnel}
            pulse={tunnel}
            title="Internal Web App"
            ip={`127.0.0.1:${INTERNAL_PORT}`}
            sub={tunnel ? "reachable via tunnel" : "localhost-only"}
            locked={!tunnel}
          />

          {/* stage legend */}
          <div className="col-start-1 row-start-2 flex items-end">
            <div className="w-full rounded-lg border border-forge-border bg-forge-panel/70 p-3">
              <div className="mb-2 font-mono text-[10px] uppercase tracking-wide text-ember-500">Attack path</div>
              <ol className="space-y-1.5">
                {[
                  "Scan & fingerprint SSH",
                  "Recover credentials",
                  "Get an interactive shell",
                  "Tunnel to the internal app",
                ].map((label, i) => {
                  const reached = stage >= i + 1;
                  return (
                    <li key={i} className="flex items-center gap-2 text-[12px]">
                      <span
                        className={cn(
                          "flex h-4 w-4 shrink-0 items-center justify-center rounded-full border font-mono text-[9px]",
                          reached ? "border-neon-green bg-neon-green/20 text-neon-green" : "border-iron-600 text-iron-600"
                        )}
                      >
                        {reached ? "✓" : i + 1}
                      </span>
                      <span className={reached ? "text-zinc-200" : "text-iron-500"}>{label}</span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-none border-t border-forge-border bg-forge-panel2 px-4 py-1.5 font-mono text-[10px] text-iron-600">
        {tunnel
          ? "Tunnel live → open the Browser tab to reach the internal app."
          : shell
            ? "Shell obtained on the target. Enumerate and pivot."
            : scanned
              ? "Service mapped. Move to credential attacks."
              : "Run a scan in the Terminal to begin mapping the target."}
      </div>
    </div>
  );
}

function Link({
  x1,
  y1,
  x2,
  y2,
  active,
  hot,
  dashed,
  tunnel,
}: {
  x1: string;
  y1: string;
  x2: string;
  y2: string;
  active?: boolean;
  hot?: boolean;
  dashed?: boolean;
  tunnel?: boolean;
}) {
  const color = tunnel ? "#3ddc84" : hot ? "#ff6a2b" : active ? "#fcd34d" : "#2a2a30";
  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={color}
      strokeWidth={tunnel ? 2 : 2}
      strokeDasharray={dashed ? "5 5" : tunnel ? "2 6" : undefined}
      opacity={active ? 0.9 : 0.4}
      className={hot ? "animate-pulse" : undefined}
    />
  );
}

function Node({
  icon,
  title,
  ip,
  sub,
  tone,
  active,
  pulse,
  badge,
  locked,
  className,
}: {
  icon: string;
  title: string;
  ip: string;
  sub: string;
  tone: "cyan" | "ember" | "amber" | "green" | "idle";
  active?: boolean;
  pulse?: boolean;
  badge?: string;
  locked?: boolean;
  className?: string;
}) {
  const ring =
    tone === "cyan"
      ? "border-neon-cyan/60 text-neon-cyan"
      : tone === "ember"
        ? "border-ember-500/70 text-ember-400"
        : tone === "amber"
          ? "border-amber-400/60 text-amber-300"
          : tone === "green"
            ? "border-neon-green/60 text-neon-green"
            : "border-forge-border text-iron-600";
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-2 bg-forge-bg transition",
          ring,
          !active && "opacity-60",
          pulse && "pulse-ring"
        )}
      >
        <Icon name={locked ? "lock" : icon} className="h-7 w-7" />
        {badge && (
          <span className="absolute -right-2 -top-2 rounded-full border border-forge-border bg-forge-panel px-1.5 py-0.5 font-mono text-[9px] font-bold text-ember-400">
            {badge}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-bold text-zinc-100">{title}</div>
        <div className="truncate font-mono text-[11px] text-ember-400">{ip}</div>
        <div className="truncate font-mono text-[10px] text-iron-500">{sub}</div>
      </div>
    </div>
  );
}
