import Icon from "./Icon";
import { AVATAR_CATEGORIES, AVATAR_COLOR, AVATAR_COLORS, AVATAR_ICONS } from "../lib/avatarCatalog";
import { cn } from "../utils/cn";

const ICON_FALLBACK = "skull";

export { AVATAR_CATEGORIES, AVATAR_COLORS, AVATAR_ICONS };

export function parseAvatar(src: string): { kind: "icon"; name: string; color: string } | { kind: "img"; url: string } {
  if (src?.startsWith("ic:")) {
    const parts = src.split(":");
    return { kind: "icon", name: parts[1] || ICON_FALLBACK, color: parts[2] || AVATAR_COLOR };
  }
  if (src?.startsWith("data:") || src?.startsWith("http")) return { kind: "img", url: src };
  return { kind: "icon", name: ICON_FALLBACK, color: AVATAR_COLOR };
}

export default function Avatar({
  src,
  name,
  size = 36,
  className,
}: {
  src?: string;
  name?: string;
  size?: number;
  className?: string;
}) {
  const a = parseAvatar(src || "");
  const initials = (name || "?")
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
    .normalize("NFD")
    .replace(/([\u0370-\u03ff\u1f00-\u1fff]\u0308?)[\u0301\u0341]/gu, "$1")
    .normalize("NFC");

  if (a.kind === "img") {
    return (
      <img
        src={a.url}
        alt={name || "avatar"}
        width={size}
        height={size}
        className={cn("rounded-full object-cover ring-1 ring-white/10", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={cn("rounded-full grid place-items-center ring-1 ring-white/15 shrink-0", className)}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle at 34% 28%, ${a.color}66, ${a.color}1c 70%)`,
        color: a.color,
        boxShadow: `inset 0 0 0 1.5px ${a.color}80`,
      }}
      title={name}
    >
      {src ? (
        <Icon name={a.name} variant="glyph" className="w-[64%] h-[64%]" />
      ) : (
        <span className="font-bold tracking-wide" style={{ fontSize: Math.max(14, Math.round(size * 0.32)) }}>{initials}</span>
      )}
    </div>
  );
}


