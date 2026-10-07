import { AVATAR_COLORS, AVATAR_ICONS } from "./Avatar";
import Icon from "./Icon";
import { cn } from "../utils/cn";
import { t, type Lang } from "../i18n";

export default function AvatarPicker({
  value,
  onChange,
  lang,
  onClose,
}: {
  value: string;
  onChange: (v: string) => void;
  lang: Lang;
  onClose: () => void;
}) {
  const parts = (value || "ic:skull:#06b6d4").split(":");
  const name = parts[1] || "skull";
  const color = parts[2] || "#06b6d4";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="w-full max-w-lg rounded-2xl border border-gamehack-border bg-gamehack-panel p-5 scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-zinc-100">{t("chooseAvatar", lang)}</h3>
          <button type="button" onClick={onClose} className="text-iron-400 hover:text-white">
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>
        <div className="flex gap-2 mb-4">
          {AVATAR_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => onChange(`ic:${name}:${c}`)}
              className={cn("h-7 w-7 rounded-full ring-2", color === c ? "ring-white" : "ring-transparent")}
              style={{ background: c }}
            />
          ))}
        </div>
        <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
          {AVATAR_ICONS.map((ic) => (
            <button
              key={ic}
              type="button"
              onClick={() => onChange(`ic:${ic}:${color}`)}
              className={cn(
                "aspect-square rounded-xl grid place-items-center border transition",
                name === ic ? "border-cyan-500 bg-cyan-500/15" : "border-gamehack-border hover:border-cyan-500/40"
              )}
              style={{ color }}
            >
              <Icon name={ic} className="w-6 h-6" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
