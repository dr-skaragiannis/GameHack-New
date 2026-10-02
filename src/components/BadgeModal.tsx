import { useEffect } from "react";
import * as db from "../lib/db";
import { sound } from "../lib/sound";
import Icon from "./Icon";
import { cn } from "../utils/cn";

// A certification-style popup for a badge: large medallion artwork, tier ribbon,
// name, description and (optionally) who earned it / when.
export default function BadgeModal({
  badgeId,
  earned = true,
  holderName,
  onClose,
}: {
  badgeId: string;
  earned?: boolean;
  holderName?: string;
  onClose: () => void;
}) {
  const b = db.BADGES[badgeId];
  useEffect(() => {
    if (earned) sound.badge();
    else sound.popup();
  }, [earned]);

  if (!b) return null;

  const tier = b.tier;
  const ring =
    tier === "gold"
      ? { from: "#fde68a", to: "#d97706", glow: "rgba(217,119,6,0.55)", label: "GOLD" }
      : tier === "silver"
        ? { from: "#e5e7eb", to: "#64748b", glow: "rgba(148,163,184,0.5)", label: "SILVER" }
        : { from: "#fdba74", to: "#9a3412", glow: "rgba(234,88,12,0.5)", label: "BRONZE" };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="scale-in relative w-full max-w-sm overflow-hidden rounded-3xl border border-forge-border bg-forge-panel text-center"
        onClick={(e) => e.stopPropagation()}
        style={{ boxShadow: `0 0 60px -10px ${ring.glow}` }}
      >
        {/* top certificate band */}
        <div className="relative overflow-hidden px-6 pb-2 pt-7">
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              background: `radial-gradient(400px 160px at 50% -20%, ${ring.glow}, transparent 70%)`,
            }}
          />
          {/* rotating conic rays behind the medallion */}
          <div className="relative mx-auto h-40 w-40">
            <div
              className="absolute inset-0 rounded-full opacity-25"
              style={{
                background: `conic-gradient(from 0deg, transparent 0 18deg, ${ring.to} 18deg 20deg, transparent 20deg 38deg)`,
                animation: earned ? "spin 14s linear infinite" : undefined,
              }}
            />
            {/* medallion */}
            <div
              className={cn(
                "absolute inset-5 flex items-center justify-center rounded-full border-4",
                !earned && "grayscale"
              )}
              style={{
                borderColor: ring.to,
                background: `radial-gradient(circle at 50% 35%, ${ring.from}22, #0d0d10 72%)`,
                color: ring.from,
                boxShadow: `inset 0 0 24px ${ring.glow}, 0 0 20px ${ring.glow}`,
              }}
            >
              <Icon name={b.icon} className="h-16 w-16" />
            </div>
            {/* notches */}
            <div className="absolute inset-0 rounded-full border border-white/5" />
          </div>

          {/* tier ribbon */}
          <div
            className="mx-auto mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-[11px] font-black tracking-widest text-black"
            style={{ background: `linear-gradient(90deg, ${ring.from}, ${ring.to})` }}
          >
            <Icon name="medal" className="h-3.5 w-3.5" />
            {ring.label} TIER
          </div>
        </div>

        {/* body */}
        <div className="px-7 pb-7 pt-3">
          <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-iron-500">
            {earned ? "Certification earned" : "Locked certification"}
          </div>
          <h3 className="mt-1 text-2xl font-black text-zinc-50">{b.name}</h3>
          <p className="mt-3 text-sm leading-relaxed text-iron-300">{b.blurb}</p>

          {earned && holderName && (
            <div className="mt-4 rounded-xl border border-forge-border bg-forge-bg px-4 py-2.5">
              <div className="font-mono text-[10px] uppercase tracking-wide text-iron-500">Awarded to</div>
              <div className="text-sm font-bold text-ember-400">{holderName}</div>
            </div>
          )}

          {!earned && (
            <div className="mt-4 flex items-center justify-center gap-2 rounded-lg bg-forge-bg px-3 py-2 font-mono text-xs text-iron-500">
              <Icon name="lock" className="h-4 w-4" /> Not yet earned
            </div>
          )}

          <button
            onClick={onClose}
            className="mt-5 w-full rounded-xl bg-ember-600 py-2.5 font-mono text-sm font-bold text-white transition hover:bg-ember-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
