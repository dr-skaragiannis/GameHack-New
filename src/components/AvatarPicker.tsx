import { useRef, useState } from "react";
import {
  AVATAR_CATEGORIES,
  AVATAR_COLORS,
  encodeIconAvatar,
  parseIconAvatar,
} from "../data/avatarIcons";
import Avatar from "./Avatar";
import Icon from "./Icon";
import { cn } from "../utils/cn";

// Modal picker: browse themed glyph categories, recolor, or upload a custom image.
export default function AvatarPicker({
  current,
  name,
  onSelect,
  onClose,
}: {
  current?: string;
  name: string;
  onSelect: (value: string) => void;
  onClose: () => void;
}) {
  const parsed = parseIconAvatar(current);
  const initialCat =
    AVATAR_CATEGORIES.find((c) => parsed && c.items[parsed.key]) || AVATAR_CATEGORIES[0];

  const [catId, setCatId] = useState(initialCat.id);
  const [color, setColor] = useState(parsed?.hex || AVATAR_COLORS[0].hex);
  const [iconKey, setIconKey] = useState<string | null>(parsed?.key || Object.keys(initialCat.items)[0]);
  const [upload, setUpload] = useState<string | null>(
    current && (current.startsWith("data:") || current.startsWith("http")) ? current : null
  );
  const fileRef = useRef<HTMLInputElement>(null);

  const cat = AVATAR_CATEGORIES.find((c) => c.id === catId) || AVATAR_CATEGORIES[0];
  const keys = Object.keys(cat.items);
  const preview = upload ? upload : iconKey ? encodeIconAvatar(iconKey, color) : current;

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      setUpload(String(reader.result));
      setIconKey(null);
    };
    reader.readAsDataURL(f);
  };

  const save = () => {
    if (upload) onSelect(upload);
    else if (iconKey) onSelect(encodeIconAvatar(iconKey, color));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={onClose}>
      <div
        className="scale-in flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-forge-border glass forge-glow"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header + live preview */}
        <div className="flex items-center gap-4 border-b border-forge-border bg-forge-panel2/70 px-6 py-5">
          <Avatar name={name} src={preview} size={64} ring />
          <div>
            <h3 className="text-xl font-black text-zinc-50">Choose your avatar</h3>
            <p className="font-mono text-xs text-iron-500">
              {AVATAR_ICON_TOTAL} glyphs · {AVATAR_CATEGORIES.length} categories · recolor or upload
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto rounded-lg border border-forge-border px-2.5 py-1.5 font-mono text-xs text-iron-400 transition hover:border-red-500 hover:text-red-400"
          >
            ✕
          </button>
        </div>

        {/* category tabs */}
        <div className="flex gap-1.5 overflow-x-auto border-b border-forge-border px-4 py-2.5">
          {AVATAR_CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => {
                setCatId(c.id);
                setUpload(null);
                setIconKey(Object.keys(c.items)[0]);
              }}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition",
                catId === c.id && !upload
                  ? "bg-ember-600 text-white"
                  : "text-iron-400 hover:bg-forge-panel hover:text-zinc-200"
              )}
            >
              <Icon name={c.tabIcon} className="h-3.5 w-3.5" />
              {c.name}
              <span className="rounded bg-black/25 px-1 text-[10px]">{Object.keys(c.items).length}</span>
            </button>
          ))}
        </div>

        {/* color palette */}
        <div className="flex flex-wrap items-center gap-2 border-b border-forge-border px-6 py-3">
          <span className="mr-1 font-mono text-[11px] uppercase tracking-wide text-iron-500">Color</span>
          {AVATAR_COLORS.map((c) => (
            <button
              key={c.hex}
              title={c.name}
              onClick={() => {
                setColor(c.hex);
                if (!iconKey) setIconKey(keys[0]);
                setUpload(null);
              }}
              style={{ background: c.hex }}
              className={cn(
                "h-7 w-7 rounded-full transition hover:scale-110",
                color === c.hex && !upload ? "ring-2 ring-white ring-offset-2 ring-offset-forge-panel" : ""
              )}
            />
          ))}
          <input
            type="color"
            value={color}
            onChange={(e) => {
              setColor(e.target.value);
              if (!iconKey) setIconKey(keys[0]);
              setUpload(null);
            }}
            title="Custom color"
            className="h-7 w-9 cursor-pointer rounded-md border border-forge-border bg-transparent"
          />
        </div>

        {/* icon grid */}
        <div className="grid flex-1 grid-cols-6 gap-2.5 overflow-y-auto p-5 sm:grid-cols-8 md:grid-cols-10">
          {keys.map((key, i) => {
            const sel = iconKey === key && !upload;
            return (
              <button
                key={key}
                onClick={() => {
                  setIconKey(key);
                  setUpload(null);
                }}
                className={cn(
                  "enter flex aspect-square items-center justify-center rounded-xl border transition hover:scale-110",
                  `enter-${Math.min((i % 8) + 1, 8)}`,
                  sel ? "border-ember-500 bg-ember-500/10" : "border-forge-border bg-forge-bg hover:border-ember-500/50"
                )}
                style={{ color: sel ? color : "#8a8a93" }}
                title={key}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.7}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                  style={sel ? { filter: `drop-shadow(0 0 5px ${color}99)` } : undefined}
                >
                  {cat.items[key]}
                </svg>
              </button>
            );
          })}
        </div>

        {/* footer actions */}
        <div className="flex items-center gap-3 border-t border-forge-border bg-forge-panel2/70 px-6 py-4">
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={onFile} />
          <button
            onClick={() => fileRef.current?.click()}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-4 py-2.5 font-mono text-xs font-bold transition",
              upload
                ? "border-ember-500 bg-ember-500/10 text-ember-400"
                : "border-forge-border text-iron-300 hover:border-ember-500 hover:text-ember-400"
            )}
          >
            <Icon name="bulb" className="h-4 w-4" />
            {upload ? "Custom image selected" : "Upload custom image"}
          </button>
          <div className="ml-auto flex gap-2">
            <button
              onClick={onClose}
              className="rounded-lg border border-forge-border px-4 py-2.5 font-mono text-xs text-iron-400 transition hover:text-zinc-200"
            >
              Cancel
            </button>
            <button
              onClick={save}
              className="shimmer-hover overflow-hidden rounded-lg bg-ember-600 px-5 py-2.5 font-mono text-xs font-bold text-white transition hover:bg-ember-500"
            >
              Save avatar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const AVATAR_ICON_TOTAL = AVATAR_CATEGORIES.reduce((n, c) => n + Object.keys(c.items).length, 0);
