import { useRef, useState } from "react";
import Avatar, { AVATAR_CATEGORIES, AVATAR_COLORS } from "./Avatar";
import { AVATAR_COLOR } from "../lib/avatarCatalog";
import Icon from "./Icon";
import { cn } from "../utils/cn";
import { t, uppercaseLabel, type Lang } from "../i18n";

const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;
const AVATAR_SQUARE = 256;

function fileToSquareDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      try {
        const side = Math.min(img.naturalWidth, img.naturalHeight);
        if (!side) {
          reject(new Error("empty"));
          return;
        }
        const canvas = document.createElement("canvas");
        canvas.width = AVATAR_SQUARE;
        canvas.height = AVATAR_SQUARE;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("canvas"));
          return;
        }
        ctx.drawImage(
          img,
          (img.naturalWidth - side) / 2,
          (img.naturalHeight - side) / 2,
          side,
          side,
          0,
          0,
          AVATAR_SQUARE,
          AVATAR_SQUARE,
        );
        resolve(canvas.toDataURL("image/png"));
      } catch {
        reject(new Error("draw"));
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("load"));
    };
    img.src = url;
  });
}

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
  const isUploaded = value.startsWith("data:") || value.startsWith("http");
  const parts = (value || `ic:skull:${AVATAR_COLOR}`).split(":");
  const [iconName, setIconName] = useState(parts[1] || "skull");
  const [iconColor, setIconColor] = useState(parts[2] || AVATAR_COLOR);
  const [category, setCategory] = useState(
    () => AVATAR_CATEGORIES.find((c) => c.icons.includes(parts[1]))?.id ?? AVATAR_CATEGORIES[0].id,
  );
  const [uploadError, setUploadError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const pickColor = (c: string) => {
    setIconColor(c);
    if (!isUploaded) onChange(`ic:${iconName}:${c}`);
  };

  const pickIcon = (ic: string) => {
    setIconName(ic);
    onChange(`ic:${ic}:${iconColor}`);
  };

  const onFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    setUploadError("");
    if (!file) return;
    if (!/^image\/(png|jpe?g)$/i.test(file.type)) {
      setUploadError(t("avatarInvalidFile", lang));
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setUploadError(t("avatarFileTooBig", lang));
      return;
    }
    try {
      onChange(await fileToSquareDataUrl(file));
    } catch {
      setUploadError(t("avatarInvalidFile", lang));
    }
  };

  const activeIcons = AVATAR_CATEGORIES.find((c) => c.id === category)?.icons ?? [];

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4" onClick={onClose}>
      <div
        className="max-h-[min(92vh,760px)] w-full max-w-xl overflow-y-auto rounded-2xl border border-gamehack-border bg-gamehack-panel p-5 scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-zinc-100">{t("chooseAvatar", lang)}</h3>
            <p className="mt-0.5 text-xs text-iron-400">{t("avatarGlyphStyle", lang)}</p>
          </div>
          <button type="button" onClick={onClose} className="text-iron-400 hover:text-white">
            <Icon name="close" className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4 flex items-center gap-3 rounded-xl border border-gamehack-border bg-gamehack-bg/60 p-3">
          <Avatar src={value} name={t("avatarCurrent", lang)} size={52} />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold uppercase tracking-widest text-iron-400">{uppercaseLabel(t("avatarCurrent", lang), lang)}</div>
            <div className="mt-0.5 truncate text-xs text-iron-500">{t("avatarUploadHint", lang)}</div>
            {uploadError && <div role="alert" className="mt-1 text-xs text-rose-400">{uploadError}</div>}
          </div>
          <input ref={fileRef} type="file" accept=".png,.jpg,.jpeg,image/png,image/jpeg" onChange={onFile} className="hidden" />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-2 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20"
          >
            <Icon name="download" className="h-4 w-4 rotate-180" />
            {t("avatarUpload", lang)}
          </button>
        </div>

        <div className="mb-1 text-xs font-bold uppercase tracking-widest text-iron-400">{uppercaseLabel(t("avatarCustomColor", lang), lang)}</div>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {AVATAR_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => pickColor(c)}
              title={c}
              aria-label={c}
              className={cn("h-7 w-7 rounded-full ring-2", iconColor === c ? "ring-white" : "ring-transparent")}
              style={{ background: c }}
            />
          ))}
          <label
            className="inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-full border border-dashed border-iron-500/60 px-2.5 text-xs font-bold text-iron-300 hover:border-cyan-400/60 hover:text-cyan-300"
            title={t("avatarCustomColor", lang)}
          >
            <input
              type="color"
              value={iconColor}
              onChange={(event) => pickColor(event.currentTarget.value)}
              className="h-4 w-6 cursor-pointer border-0 bg-transparent p-0"
            />
            {t("avatarCustomColor", lang)}
          </label>
        </div>

        <div className="mb-3 flex flex-wrap gap-1.5" role="tablist" aria-label={t("chooseAvatar", lang)}>
          {AVATAR_CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              role="tab"
              aria-selected={category === c.id}
              onClick={() => setCategory(c.id)}
              className={cn(
                "rounded-lg px-2.5 py-1.5 text-xs font-bold transition",
                category === c.id
                  ? "bg-cyan-600 text-white shadow-lg shadow-cyan-900/50"
                  : "text-iron-400 hover:bg-white/5 hover:text-zinc-200",
              )}
            >
              {t(c.labelKey, lang)}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-5 gap-2">
          {activeIcons.map((ic) => (
            <button
              key={ic}
              type="button"
              onClick={() => pickIcon(ic)}
              title={ic}
              aria-pressed={!isUploaded && iconName === ic}
              className={cn(
                "aspect-square rounded-xl grid place-items-center border transition",
                !isUploaded && iconName === ic ? "border-orange-400 bg-orange-500/15" : "border-gamehack-border hover:border-orange-400/50",
              )}
              style={{ color: iconColor }}
            >
              <Icon name={ic} variant="glyph" className="h-7 w-7" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
