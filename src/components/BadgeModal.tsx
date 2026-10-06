import { BADGES } from "../lib/db";
import Icon from "./Icon";
import { t, uppercaseLabel, type Lang } from "../i18n";

const TIER: Record<string, string> = {
  bronze: "from-amber-700 to-amber-500",
  silver: "from-zinc-400 to-slate-200",
  gold: "from-yellow-500 to-amber-300",
};

export default function BadgeModal({
  badgeId,
  lang,
  onClose,
}: {
  badgeId: string;
  lang: Lang;
  onClose: () => void;
}) {
  const b = BADGES[badgeId];
  if (!b) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="w-full max-w-sm rounded-2xl border border-ember-600/40 bg-forge-panel p-6 text-center scale-in forge-glow"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative mx-auto mb-4 h-24 w-24">
          <div
            className="absolute inset-0 rounded-full opacity-40"
            style={{ animation: "spin 8s linear infinite", background: "conic-gradient(from 0deg, #ff6a2b, transparent, #22d3ee, transparent, #ff6a2b)" }}
          />
          <div className={`absolute inset-2 rounded-full bg-gradient-to-br ${TIER[b.tier]} grid place-items-center text-forge-bg`}>
            <Icon name={b.icon} className="w-10 h-10" />
          </div>
        </div>
        <div className="text-sm uppercase tracking-[0.25em] text-ember-400 mb-1">{uppercaseLabel(b.tier, lang)}</div>
        <h3 className="text-xl font-bold text-shine mb-1">{b.name}</h3>
        <p className="text-sm text-iron-400 mb-3">{b.desc}</p>
        <p className="text-sm text-zinc-300 leading-relaxed">{b.blurb}</p>
        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-xl bg-ember-600 hover:bg-ember-500 py-2.5 font-semibold text-white"
        >
          {t("close", lang)}
        </button>
      </div>
    </div>
  );
}
