import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as db from "../lib/db";
import { CAMPAIGNS } from "../data/lessons";
import Icon, { MODULE_ICON } from "./Icon";
import Avatar from "./Avatar";
import type { Lang } from "../i18n";
import { cn } from "../utils/cn";

/**
 * LearningMap — an interactive constellation map of every campaign & lab.
 *
 * • Each campaign is a hub; its labs chain outward along glowing paths.
 * • Every player is pinned at the lab they are currently on (first
 *   incomplete module). Online players glow green/ember; offline players
 *   are dimmed with a red presence ring at their last known position.
 * • Wheel / buttons zoom, drag pans, hubs collapse their lab chains.
 */

// ---- world geometry (SVG coordinate space) --------------------------------
const W = 1280;
const H = 760;
const HUB_R = 42;
const NODE_R = 20;
const ONLINE_WINDOW = 5 * 60_000; // presence considered fresh within 5 min

type HubCfg = { x: number; y: number; a0: number; a1: number; r0: number; r1: number };
const HUB_CFG: Record<string, HubCfg> = {
  intro: { x: 215, y: 330, a0: -78, a1: 76, r0: 160, r1: 235 },
  raven: { x: 1075, y: 290, a0: 158, a1: 270, r0: 150, r1: 215 },
  ssh: { x: 640, y: 585, a0: -168, a1: -12, r0: 140, r1: 205 },
};
const FALLBACK_HUB: HubCfg = { x: 640, y: 140, a0: 20, a1: 160, r0: 150, r1: 215 };
const HUB_ICON: Record<string, string> = { lab: "terminal", raven: "crown", ssh: "network" };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const short = (s: string, n = 18) => (s.length > n ? s.slice(0, n - 1) + "…" : s);

// Quadratic bezier between two points, bent sideways for an organic weave.
function curvePath(x1: number, y1: number, x2: number, y2: number, bend: number): string {
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.hypot(dx, dy) || 1;
  const k = len * 0.16 * bend;
  return `M ${x1} ${y1} Q ${mx + (-dy / len) * k} ${my + (dx / len) * k} ${x2} ${y2}`;
}

type GameModule = (typeof CAMPAIGNS)[number]["modules"][number];

type NodeGeom = { m: GameModule; x: number; y: number };
type CampaignGeom = { id: string; title: string; scenario: string; hub: { x: number; y: number }; mods: NodeGeom[] };

type Tooltip = { x: number; y: number; title: string; lines: string[] } | null;
type PFilter = "all" | "online" | "offline";

type CamCtx = {
  id: string;
  title: string;
  scenario: string;
  hub: { x: number; y: number };
  mods: NodeGeom[];
  pct: number;
  doneCount: number;
  collapsed: boolean;
};

export default function LearningMap({
  user,
  lang,
  onOpenModule,
  onOpenProfile,
}: {
  user: db.User;
  lang: Lang;
  onOpenModule: (campaignId: string, moduleId: string) => void;
  onOpenProfile: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [t, setT] = useState({ k: 1, x: 0, y: 0 });
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<PFilter>("all");
  const [tooltip, setTooltip] = useState<Tooltip>(null);
  const drag = useRef<{ sx: number; sy: number; x: number; y: number; captured: boolean } | null>(null);
  const dragMoved = useRef(false);
  const interacted = useRef(false);

  // Presence heartbeat: stamp ourselves online and re-render periodically so
  // other players' online window (5 min) decays live.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const beat = () => {
      try {
        db.updateUser(user.id, { lastSeen: Date.now() });
      } catch {
        /* ignore */
      }
    };
    beat();
    const iv = setInterval(() => {
      beat();
      setTick((x) => x + 1);
    }, 30_000);
    return () => clearInterval(iv);
  }, [user.id]);

  // ---- geometry -------------------------------------------------------------
  const geoms: CampaignGeom[] = useMemo(
    () =>
      CAMPAIGNS.map((c) => {
        const cfg = HUB_CFG[c.id] || FALLBACK_HUB;
        const mods = [...c.modules].sort((a, b) => a.order - b.order);
        return {
          id: c.id,
          title: c.title[lang],
          scenario: c.scenario,
          hub: { x: cfg.x, y: cfg.y },
          mods: mods.map((m, i) => {
            const tt = mods.length === 1 ? 0.5 : i / (mods.length - 1);
            const ang = ((cfg.a0 + (cfg.a1 - cfg.a0) * tt) * Math.PI) / 180;
            const rad = i % 2 ? cfg.r1 : cfg.r0;
            return { m, x: cfg.x + Math.cos(ang) * rad, y: cfg.y + Math.sin(ang) * rad };
          }),
        };
      }),
    [lang]
  );

  // ---- current user's per-campaign state ------------------------------------
  const myState = useMemo(() => {
    const map = new Map<string, { doneCount: number; pct: number; firstOpenIdx: number }>();
    for (const g of geoms) {
      const doneCount = g.mods.filter((n) => user.progress[n.m.id]?.completed).length;
      const firstOpenIdx = g.mods.findIndex((n) => !user.progress[n.m.id]?.completed);
      map.set(g.id, {
        doneCount,
        pct: g.mods.length ? Math.round((doneCount / g.mods.length) * 100) : 100,
        firstOpenIdx: firstOpenIdx === -1 ? g.mods.length : firstOpenIdx,
      });
    }
    return map;
  }, [geoms, user.progress]);

  // ---- player markers ---------------------------------------------------------
  type Mark = {
    u: db.User;
    anchor: string;
    x: number; // anchor (world)
    y: number; // anchor (world)
    hub: boolean;
    place: string;
    online: boolean;
    isMe: boolean;
    angle: number; // orbit angle — rendered at a constant screen-space distance
  };

  const marks = useMemo<Mark[]>(() => {
    const now = Date.now();
    const out: Mark[] = [];
    for (const p of db.allPlayers()) {
      // first incomplete lab across all campaigns (catalog order)
      let g: CampaignGeom | null = null;
      let node: NodeGeom | null = null;
      for (const gg of geoms) {
        const idx = gg.mods.findIndex((n) => !p.progress[n.m.id]?.completed);
        if (idx !== -1) {
          g = gg;
          node = gg.mods[idx];
          break;
        }
      }
      if (!g || !node) {
        // finished everything — park them at the final campaign hub
        g = geoms[geoms.length - 1];
        node = null;
      }
      const atHub = !node || collapsed[g.id];
      const ax = atHub ? g.hub.x : node!.x;
      const ay = atHub ? g.hub.y : node!.y;
      const place = node ? node.m.title[lang] : g.title;
      out.push({
        u: p,
        anchor: atHub ? `${g.id}:hub` : node!.m.id,
        x: ax,
        y: ay,
        hub: atHub,
        place,
        online: p.id === user.id || (!!p.lastSeen && now - p.lastSeen < ONLINE_WINDOW),
        isMe: p.id === user.id,
        angle: -Math.PI / 2,
      });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoms, collapsed, lang, user.id, user.progress, filter, tick]);

  // filter → then assign orbit angles to players sharing the same anchor
  const visibleMarks = useMemo(() => {
    const list = marks.filter((mk) => (filter === "all" ? true : filter === "online" ? mk.online : !mk.online));
    const groups = new Map<string, Mark[]>();
    for (const mk of list) {
      const arr = groups.get(mk.anchor) || [];
      arr.push(mk);
      groups.set(mk.anchor, arr);
    }
    for (const arr of groups.values()) {
      arr.forEach((mk, i) => {
        mk.angle = arr.length === 1 ? -Math.PI / 2 : (i / arr.length) * Math.PI * 2 - Math.PI / 2;
      });
    }
    return list;
  }, [marks, filter]);

  const onlineCount = marks.filter((mk) => mk.online).length;
  const offlineCount = marks.length - onlineCount;
  const allCollapsed = geoms.every((g) => collapsed[g.id]);

  // ---- pan & zoom --------------------------------------------------------------
  const fitView = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const k = Math.min(r.width / W, r.height / H) * 0.98;
    setT({ k, x: (r.width - W * k) / 2, y: (r.height - H * k) / 2 });
  }, []);

  useEffect(() => {
    fitView();
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => {
      if (!interacted.current) fitView();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [fitView]);

  const zoomAt = useCallback((f: number, cx: number, cy: number) => {
    setT((prev) => {
      const k = clamp(prev.k * f, 0.45, 3);
      const s = k / prev.k;
      return { k, x: cx - (cx - prev.x) * s, y: cy - (cy - prev.y) * s };
    });
  }, []);

  // native wheel listener — React's synthetic wheel is passive, so preventDefault needs this
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      interacted.current = true;
      const r = el.getBoundingClientRect();
      zoomAt(e.deltaY < 0 ? 1.13 : 1 / 1.13, e.clientX - r.left, e.clientY - r.top);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  const zoomBtn = (f: number) => {
    interacted.current = true;
    const r = ref.current?.getBoundingClientRect();
    zoomAt(f, r ? r.width / 2 : 0, r ? r.height / 2 : 0);
  };
  const resetView = () => {
    interacted.current = false;
    fitView();
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === "mouse") return;
    drag.current = { sx: e.clientX, sy: e.clientY, x: t.x, y: t.y, captured: false };
    dragMoved.current = false;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.sx;
    const dy = e.clientY - d.sy;
    if (Math.abs(dx) + Math.abs(dy) > 4) {
      dragMoved.current = true;
      interacted.current = true;
      // capture lazily — capturing on pointerdown would retarget click events
      // to the container, making nodes/markers/buttons inside unclickable
      if (!d.captured) {
        d.captured = true;
        try {
          (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
        } catch {
          /* ignore */
        }
      }
    }
    // compute now — never read `drag.current` inside a setState updater:
    // it is nulled by pointerup/leave and updaters run asynchronously
    const nx = d.x + dx;
    const ny = d.y + dy;
    setT((prev) => ({ ...prev, x: nx, y: ny }));
  };
  const onPointerUp = () => (drag.current = null);

  // ---- tooltip helpers -----------------------------------------------------------
  const showTip = (wx: number, wy: number, title: string, lines: string[], lift = 30) => {
    const r = ref.current?.getBoundingClientRect();
    const x = wx * t.k + t.x;
    const y = wy * t.k + t.y;
    const pad = r ? Math.min(110, Math.max(48, r.width * 0.3)) : 90;
    setTooltip({
      x: r ? clamp(x, pad, r.width - pad) : x,
      y: y - lift,
      title,
      lines,
    });
  };
  const hideTip = () => setTooltip(null);

  // ---- render helpers -----------------------------------------------------------
  const toggleCollapse = (id: string) => setCollapsed((c) => ({ ...c, [id]: !c[id] }));

  const nodeStatus = (g: CampaignGeom, idx: number): "done" | "current" | "locked" => {
    const st = myState.get(g.id)!;
    if (idx < st.firstOpenIdx) return "done";
    if (idx === st.firstOpenIdx) return "current";
    return "locked";
  };

  const openNode = (g: CampaignGeom, n: NodeGeom, idx: number) => {
    if (dragMoved.current) return;
    if (nodeStatus(g, idx) === "locked") return;
    onOpenModule(g.id, n.m.id);
  };

  const edgeColor = (done: boolean, active: boolean) =>
    done ? "#ff6a2b" : active ? "#f5c04a" : "#3f3f46";

  return (
    <div className="overflow-hidden rounded-3xl border border-forge-border glass">
      {/* header strip */}
      <div className="flex flex-wrap items-center gap-2 border-b border-forge-border px-3.5 py-3 sm:gap-3 sm:px-5">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-ember-500/15 text-ember-400">
            <Icon name="radar" className="h-5 w-5 glow-pulse" />
          </span>
          <div className="min-w-0">
            <h3 className="truncate font-mono text-sm font-bold leading-tight text-zinc-100 sm:text-base">Learning Map</h3>
            <p className="hidden font-mono text-[11px] text-iron-500 sm:block">Explore the cybersecurity landscape</p>
          </div>
        </div>

        {/* presence filter */}
        <div className="ml-auto flex flex-wrap items-center justify-end gap-1.5">
          {(
            [
              ["all", `All · ${marks.length}`],
              ["online", `● Online · ${onlineCount}`],
              ["offline", `● Offline · ${offlineCount}`],
            ] as [PFilter, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                "rounded-lg border px-2 py-1 font-mono text-[10px] font-bold transition sm:px-2.5 sm:text-[11px]",
                filter === key
                  ? key === "online"
                    ? "border-emerald-500/60 bg-emerald-500/15 text-emerald-300"
                    : key === "offline"
                      ? "border-red-500/60 bg-red-500/15 text-red-300"
                      : "border-ember-500/60 bg-ember-500/15 text-ember-300"
                  : "border-forge-border bg-forge-bg text-iron-500 hover:text-zinc-300"
              )}
            >
              {label}
            </button>
          ))}

          <button
            onClick={() => {
              const next = !allCollapsed;
              setCollapsed(Object.fromEntries(geoms.map((g) => [g.id, next])));
            }}
            className="rounded-lg border border-forge-border bg-forge-bg px-2 py-1 font-mono text-[10px] font-bold text-iron-400 transition hover:border-ember-500/50 hover:text-ember-300 sm:px-2.5 sm:text-[11px]"
            title={allCollapsed ? "Expand all labs" : "Hide all labs"}
          >
            {allCollapsed ? "⊕ Expand" : "⊖ Hide"}
            <span className="hidden sm:inline"> labs</span>
          </button>

          <div className="flex items-center overflow-hidden rounded-lg border border-forge-border">
            <button onClick={() => zoomBtn(1 / 1.25)} title="Zoom out" aria-label="Zoom out" className="bg-forge-bg px-2 py-1 font-mono text-sm font-bold text-iron-400 transition hover:text-ember-300 sm:px-2.5">
              −
            </button>
            <span className="hidden bg-forge-bg px-1.5 py-1 font-mono text-[10px] text-iron-600 sm:inline">{Math.round(t.k * 100)}%</span>
            <button onClick={() => zoomBtn(1.25)} title="Zoom in" aria-label="Zoom in" className="bg-forge-bg px-2 py-1 font-mono text-sm font-bold text-iron-400 transition hover:text-ember-300 sm:px-2.5">
              +
            </button>
            <button onClick={resetView} title="Reset view" className="bg-forge-bg px-2 py-1 font-mono text-[11px] font-bold text-iron-400 transition hover:text-ember-300 sm:px-2.5">
              ⤾<span className="hidden sm:inline"> fit</span>
            </button>
          </div>
        </div>
      </div>

      {/* the map itself */}
      <div
        ref={ref}
        className="relative h-[400px] w-full cursor-grab touch-none select-none overflow-hidden bg-[#0a0a0d] active:cursor-grabbing sm:h-[540px]"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onMouseLeave={hideTip}
      >
        {/* faint dotted backdrop */}
        <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
          <defs>
            <pattern id="mapdots" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1.2" cy="1.2" r="1.2" fill="#232329" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mapdots)" />
        </svg>

        {/* world layer */}
        <svg className="absolute inset-0 h-full w-full">
          <g transform={`translate(${t.x} ${t.y}) scale(${t.k})`}>
            {geoms.map((g) => {
              const isCollapsed = !!collapsed[g.id];
              const ctx: CamCtx = { ...g, pct: myState.get(g.id)!.pct, doneCount: myState.get(g.id)!.doneCount, collapsed: isCollapsed };
              return (
                <g key={g.id}>
                  {!isCollapsed && <CampaignEdges g={ctx} status={(idx) => nodeStatus(g, idx)} edgeColor={edgeColor} />}
                  {!isCollapsed &&
                    g.mods.map((n, idx) => (
                      <ModuleNode
                        key={n.m.id}
                        n={n}
                        status={nodeStatus(g, idx)}
                        lang={lang}
                        onClick={() => openNode(g, n, idx)}
                        onEnter={() => {
                          const st = nodeStatus(g, idx);
                          showTip(n.x, n.y, n.m.title[lang], [
                            `${"★".repeat(n.m.difficulty)}${"☆".repeat(5 - n.m.difficulty)} · ${n.m.tasks.length} objectives`,
                            st === "done" ? "✓ Completed" : st === "current" ? "▸ Your current lab — click to open" : "🔒 Locked — finish the previous lab",
                          ]);
                        }}
                        onLeave={hideTip}
                      />
                    ))}
                  <HubNode
                    g={ctx}
                    lang={lang}
                    onEnter={() =>
                      showTip(g.hub.x, g.hub.y, g.title, [
                        `${ctx.doneCount}/${g.mods.length} labs completed`,
                        isCollapsed ? "Click ⊕ to expand its labs" : "Click ⊖ to hide its labs",
                      ], 58)
                    }
                    onLeave={hideTip}
                  />
                </g>
              );
            })}
          </g>
        </svg>

        {/* player markers — HTML overlay so avatars/rings stay crisp */}
        <div className="pointer-events-none absolute inset-0">
          {visibleMarks.map((mk) => {
            // constant screen-space orbit so markers never cover their node,
            // no matter the zoom level
            const rad = mk.hub ? 66 : 36;
            const left = mk.x * t.k + t.x + Math.cos(mk.angle) * rad;
            const top = mk.y * t.k + t.y + Math.sin(mk.angle) * rad;
            return (
              <div key={mk.u.id} className="pointer-events-auto absolute" style={{ left, top }}>
                <button
                  onClick={() => !dragMoved.current && onOpenProfile(mk.u.id)}
                  onMouseEnter={() =>
                    showTip(mk.x, mk.y, `${mk.u.displayName}${mk.isMe ? " (you)" : ""}`, [
                      mk.online ? "● Online now" : "● Offline — last position",
                      `at: ${short(mk.place, 26)}`,
                      `Lv ${db.levelFromXp(mk.u.metrics.xp).level} · ${mk.u.metrics.xp} XP`,
                    ], 22)
                  }
                  onMouseLeave={hideTip}
                  className="relative block -translate-x-1/2 -translate-y-1/2 rounded-full transition hover:scale-110"
                  style={{ transform: "translate(-50%,-50%)" }}
                >
                  <span
                    className={cn(
                      "absolute -inset-[3px] rounded-full ring-2",
                      mk.isMe ? "ring-ember-400" : mk.online ? "ring-emerald-400" : "ring-red-500/90"
                    )}
                  />
                  <Avatar
                    name={mk.u.displayName}
                    src={mk.u.avatar}
                    size={26}
                    className={cn(!mk.online && !mk.isMe && "opacity-75 saturate-[0.35]")}
                  />
                  <span
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border border-black",
                      mk.online ? "bg-emerald-400" : "bg-red-500"
                    )}
                  >
                    {mk.online && <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400" />}
                  </span>
                </button>
                {(t.k >= 0.6 || mk.isMe) && (
                  <div
                    className={cn(
                      "pointer-events-none absolute left-1/2 top-1/2 z-10 mt-[17px] -translate-x-1/2 whitespace-nowrap rounded px-1 py-px font-mono text-[9px]",
                      mk.isMe
                        ? "bg-ember-600/85 font-bold text-white"
                        : mk.online
                          ? "bg-black/70 text-zinc-300"
                          : "bg-black/60 text-red-300/80"
                    )}
                  >
                    {mk.isMe ? "YOU" : `@${mk.u.username}`}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* hub collapse/expand buttons — real clickable controls, above markers */}
        <div className="pointer-events-none absolute inset-0 z-20">
          {geoms.map((g) => {
            const c = !!collapsed[g.id];
            const left = (g.hub.x + HUB_R - 8) * t.k + t.x;
            const top = (g.hub.y - HUB_R + 8) * t.k + t.y;
            return (
              <button
                key={`tg-${g.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!dragMoved.current) toggleCollapse(g.id);
                }}
                onMouseEnter={() =>
                  showTip(g.hub.x, g.hub.y, g.title, [
                    `${myState.get(g.id)!.doneCount}/${g.mods.length} labs completed`,
                    c ? "Click ⊕ to expand its labs" : "Click ⊖ to hide its labs",
                  ], 58)
                }
                onMouseLeave={hideTip}
                title={c ? "Expand labs" : "Hide labs"}
                className="pointer-events-auto absolute flex h-[22px] w-[22px] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-ember-500 bg-[#1c1c22] font-mono text-[13px] font-bold leading-none text-ember-300 transition hover:scale-110 hover:bg-ember-500/25"
                style={{ left, top }}
              >
                {c ? "+" : "−"}
              </button>
            );
          })}
        </div>

        {/* legend */}
        <div className="pointer-events-none absolute bottom-2.5 left-2.5 z-10 rounded-xl border border-forge-border bg-black/70 px-2.5 py-1.5 font-mono text-[9px] text-iron-400 backdrop-blur-sm sm:bottom-3 sm:left-3 sm:px-3 sm:py-2 sm:text-[10px]">
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            <span className="flex items-center gap-1.5"><i className="inline-block h-2 w-2 rounded-full bg-ember-500 shadow-[0_0_6px_#ff6a2b]" />Completed</span>
            <span className="flex items-center gap-1.5"><i className="inline-block h-2 w-2 rounded-full border border-ember-400" />Current lab</span>
            <span className="flex items-center gap-1.5"><i className="inline-block h-2 w-2 rounded-full bg-zinc-700" />Locked</span>
            <span className="flex items-center gap-1.5"><i className="inline-block h-2 w-2 rounded-full bg-emerald-400" />Online</span>
            <span className="flex items-center gap-1.5"><i className="inline-block h-2 w-2 rounded-full bg-red-500" />Offline</span>
          </div>
          <div className="mt-1 hidden text-[9px] text-iron-600 sm:block">scroll to zoom · drag to pan · click a lab to open it</div>
        </div>

        {/* players panel (like the reference screenshot) */}
        <div className="absolute right-3 top-3 z-10 hidden w-52 rounded-xl border border-forge-border bg-black/70 backdrop-blur-sm md:block">
          <div className="flex items-center justify-between border-b border-forge-border px-3 py-2">
            <span className="font-mono text-[11px] font-bold text-zinc-200">Players: {onlineCount} Online</span>
            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-emerald-400 opacity-75" /><span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" /></span>
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {[...marks]
              .sort((a, b) => Number(b.online) - Number(a.online) || b.u.metrics.xp - a.u.metrics.xp)
              .map((mk) => (
                <button
                  key={mk.u.id}
                  onClick={() => onOpenProfile(mk.u.id)}
                  className="flex w-full items-center gap-2 px-3 py-1.5 text-left transition hover:bg-white/5"
                >
                  <span className="relative">
                    <Avatar name={mk.u.displayName} src={mk.u.avatar} size={22} className={cn(!mk.online && "opacity-75 saturate-[0.35]")} />
                    <span className={cn("absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-black", mk.online ? "bg-emerald-400" : "bg-red-500")} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-mono text-[11px] font-bold text-zinc-200">
                      @{mk.u.username}
                      {mk.isMe && <span className="ml-1 text-ember-400">·you</span>}
                    </span>
                    <span className="block truncate font-mono text-[9px] text-iron-500">{short(mk.place, 24)}</span>
                  </span>
                </button>
              ))}
          </div>
        </div>

        {/* tooltip */}
        {tooltip && (
          <div
            className="pointer-events-none absolute z-20 max-w-[72vw] -translate-x-1/2 -translate-y-full rounded-xl border border-forge-border bg-black/90 px-3 py-2 shadow-xl"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            <div className="truncate font-mono text-xs font-bold text-zinc-100">{tooltip.title}</div>
            {tooltip.lines.map((l, i) => (
              <div key={i} className="whitespace-normal font-mono text-[10px] leading-snug text-iron-400">{l}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---- sub-renderers (pure) -----------------------------------------------------

function CampaignEdges({
  g,
  status,
  edgeColor,
}: {
  g: CamCtx;
  status: (idx: number) => "done" | "current" | "locked";
  edgeColor: (done: boolean, active: boolean) => string;
}) {
  const pts = [{ x: g.hub.x, y: g.hub.y }, ...g.mods.map((n) => ({ x: n.x, y: n.y }))];
  return (
    <g fill="none" strokeLinecap="round">
      {g.mods.map((_, i) => {
        const a = pts[i];
        const b = pts[i + 1];
        const done = i === 0 ? status(0) === "done" : status(i - 1) === "done" && status(i) === "done";
        const active = !done && (i === 0 || status(i - 1) === "done");
        const color = edgeColor(done, active);
        return (
          <path
            key={i}
            d={curvePath(a.x, a.y, b.x, b.y, i % 2 ? 1 : -1)}
            stroke={color}
            strokeWidth={done ? 2.4 : 2}
            strokeDasharray={done ? undefined : "7 7"}
            opacity={done ? 0.95 : active ? 0.9 : 0.5}
            style={done ? { filter: "drop-shadow(0 0 6px rgba(255,106,43,0.45))" } : undefined}
          >
            {!done && <animate attributeName="stroke-dashoffset" from="28" to="0" dur="1.4s" repeatCount="indefinite" />}
          </path>
        );
      })}
    </g>
  );
}

function ModuleNode({
  n,
  status,
  lang,
  onClick,
  onEnter,
  onLeave,
}: {
  n: NodeGeom;
  status: "done" | "current" | "locked";
  lang: Lang;
  onClick: () => void;
  onEnter: () => void;
  onLeave: () => void;
}) {
  const done = status === "done";
  const current = status === "current";
  const locked = status === "locked";
  return (
    <g
      transform={`translate(${n.x} ${n.y})`}
      onClick={onClick}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={cn(!locked && "cursor-pointer")}
      opacity={locked ? 0.65 : 1}
    >
      {current && (
        <circle r={NODE_R + 4} fill="none" stroke="#ff6a2b" strokeWidth={2}>
          <animate attributeName="r" values={`${NODE_R + 3};${NODE_R + 12}`} dur="1.6s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.9;0" dur="1.6s" repeatCount="indefinite" />
        </circle>
      )}
      <circle
        r={NODE_R}
        fill={done ? "#ff6a2b" : current ? "#2a1a10" : "#17171c"}
        stroke={done ? "#ffb28a" : current ? "#ff6a2b" : "#3f3f46"}
        strokeWidth={done ? 1.6 : 2}
        style={done || current ? { filter: "drop-shadow(0 0 8px rgba(255,106,43,0.55))" } : undefined}
      />
      <foreignObject x={-10} y={-10} width={20} height={20} pointerEvents="none">
        <div style={{ width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon
            name={locked ? "lock" : MODULE_ICON[n.m.id] || "terminal"}
            className={cn("h-4 w-4", done ? "text-white" : current ? "text-ember-300" : "text-iron-600")}
          />
        </div>
      </foreignObject>
      {done && (
        <g transform="translate(14 -14)" pointerEvents="none">
          <circle r={6.5} fill="#22c55e" stroke="#0a0a0d" strokeWidth={1.6} />
          <path d="m-2.6 0 1.9 1.9 3.4-3.6" stroke="#052e12" strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      )}
      <text y={NODE_R + 14} textAnchor="middle" fontSize={11} fontFamily="ui-monospace, monospace" fill={locked ? "#52525b" : "#a1a1aa"} pointerEvents="none">
        {short(n.m.title[lang])}
      </text>
    </g>
  );
}

function HubNode({
  g,
  onEnter,
  onLeave,
}: {
  g: CamCtx;
  lang: Lang;
  onToggle?: () => void;
  onEnter: () => void;
  onLeave: () => void;
}) {
  return (
    <g transform={`translate(${g.hub.x} ${g.hub.y})`} onMouseEnter={onEnter} onMouseLeave={onLeave}>
      <circle r={HUB_R + 10} fill="none" stroke="#ff6a2b" strokeWidth={1} opacity={0.25} strokeDasharray="3 6" />
      <circle
        r={HUB_R}
        fill="#0d0d10"
        stroke="#ff6a2b"
        strokeWidth={2.5}
        style={{ filter: "drop-shadow(0 0 14px rgba(255,106,43,0.5))" }}
      />
      <foreignObject x={-13} y={-13} width={26} height={26} pointerEvents="none">
        <div style={{ width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name={HUB_ICON[g.scenario] || "terminal"} className="h-5 w-5 text-ember-400" />
        </div>
      </foreignObject>
      <text
        y={HUB_R + 20}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        fontFamily="ui-monospace, monospace"
        fill="#e4e4e7"
        pointerEvents="none"
      >
        {short(g.title, 20)} · {g.pct}%
      </text>
      {g.collapsed && (
        <text y={HUB_R + 36} textAnchor="middle" fontSize={10.5} fontFamily="ui-monospace, monospace" fill="#71717a" pointerEvents="none">
          {g.mods.length} labs hidden — click ⊕
        </text>
      )}
      {/* collapse / expand button — visual only; the real clickable button is the
          HTML overlay in LearningMap so it always sits above player markers */}
      <g transform={`translate(${HUB_R - 8} ${-HUB_R + 8})`} pointerEvents="none">
        <circle r={11} fill="#1c1c22" stroke="#ff6a2b" strokeWidth={1.4} />
        <text
          y={4}
          textAnchor="middle"
          fontSize={13}
          fontWeight={700}
          fontFamily="ui-monospace, monospace"
          fill="#ffb28a"
          pointerEvents="none"
        >
          {g.collapsed ? "+" : "−"}
        </text>
      </g>
    </g>
  );
}
