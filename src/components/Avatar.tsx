import { cn } from "../utils/cn";
import { AVATAR_ICONS, parseIconAvatar } from "../data/avatarIcons";

// Deterministic color from a string so each user gets a stable identity color.
function hue(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
  return h;
}

export default function Avatar({
  name,
  src,
  size = 40,
  className,
  ring,
}: {
  name: string;
  src?: string;
  size?: number;
  className?: string;
  ring?: boolean;
}) {
  // 1) Chosen icon avatar — "ic:<key>:<hex>"
  const icon = parseIconAvatar(src);
  if (icon) {
    return (
      <div
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle at 50% 35%, ${icon.hex}22, #0d0d10 72%)`,
          boxShadow: `inset 0 0 0 1px ${icon.hex}55`,
          color: icon.hex,
        }}
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full",
          ring && "ring-2 ring-ember-500/60",
          className
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.7}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ width: size * 0.6, height: size * 0.6, filter: `drop-shadow(0 0 ${size * 0.05}px ${icon.hex}88)` }}
          aria-hidden="true"
        >
          {AVATAR_ICONS[icon.key]}
        </svg>
      </div>
    );
  }

  // 2) Uploaded / external image
  if (src && (src.startsWith("data:") || src.startsWith("http") || src.startsWith("blob:"))) {
    return (
      <img
        src={src}
        alt={name}
        style={{ width: size, height: size }}
        className={cn("shrink-0 rounded-full object-cover", ring && "ring-2 ring-ember-500/60", className)}
      />
    );
  }

  // 3) Initials fallback
  const initials = name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const h = hue(name);
  return (
    <div
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, hsl(${h} 60% 35%), hsl(${(h + 40) % 360} 65% 25%))`,
        fontSize: size * 0.38,
      }}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full font-bold text-white",
        ring && "ring-2 ring-ember-500/60",
        className
      )}
    >
      {initials}
    </div>
  );
}
