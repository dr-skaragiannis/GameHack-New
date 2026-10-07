import Icon from "./Icon";
import { cn } from "../utils/cn";

const ICON_FALLBACK = "skull";

export function parseAvatar(src: string): { kind: "icon"; name: string; color: string } | { kind: "img"; url: string } {
  if (src?.startsWith("ic:")) {
    const parts = src.split(":");
    return { kind: "icon", name: parts[1] || ICON_FALLBACK, color: parts[2] || "#06b6d4" };
  }
  if (src?.startsWith("data:") || src?.startsWith("http")) return { kind: "img", url: src };
  return { kind: "icon", name: ICON_FALLBACK, color: "#06b6d4" };
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
      className={cn("rounded-full grid place-items-center ring-1 ring-white/10 shrink-0", className)}
      style={{ width: size, height: size, background: `${a.color}22`, color: a.color }}
      title={name}
    >
      {src ? (
        <Icon name={a.name} className="w-[58%] h-[58%]" />
      ) : (
        <span className="font-bold tracking-wide" style={{ fontSize: Math.max(14, Math.round(size * 0.32)) }}>{initials}</span>
      )}
    </div>
  );
}

export const AVATAR_CATEGORIES: { id: string; labelKey: string; icons: string[] }[] = [
  { id: "cyberpunk", labelKey: "avatarCatCyberpunk", icons: ["cybereye", "cpu", "qubit", "atom", "radar", "terminal"] },
  { id: "vampire", labelKey: "avatarCatVampire", icons: ["vampire", "skull", "bat", "ghost", "raven", "wolf"] },
  { id: "nordic", labelKey: "avatarCatNordic", icons: ["rune", "hammer", "shield", "owl", "crown", "wolf"] },
  { id: "fantasy", labelKey: "avatarCatFantasy", icons: ["dragon", "phoenix", "wyvern", "wand", "crown", "spark"] },
  { id: "cute", labelKey: "avatarCatCute", icons: ["cat", "ghost", "owl", "spark", "bulb", "bug"] },
  { id: "halloween", labelKey: "avatarCatHalloween", icons: ["pumpkin", "bat", "vampire", "skull", "ghost", "raven"] },
];

export const AVATAR_ICONS = [
  "skull",
  "terminal",
  "ghost",
  "dragon",
  "bug",
  "shield",
  "radar",
  "wolf",
  "owl",
  "raven",
  "phoenix",
  "atom",
  "cpu",
  "qubit",
  "cybereye",
  "wyvern",
  "crown",
  "hammer",
  "target",
  "spark",
];

export const AVATAR_COLORS = ["#06b6d4", "#22d3ee", "#3ddc84", "#a78bfa", "#fcd34d", "#f472b6", "#38bdf8", "#fb7185"];
