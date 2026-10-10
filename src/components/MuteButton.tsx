import { useEffect, useState } from "react";
import { sound } from "../lib/sound";
import Icon from "./Icon";
import { t, type Lang } from "../i18n";

export default function MuteButton({ lang }: { lang: Lang }) {
  const [muted, setMuted] = useState(sound.isMuted());
  useEffect(() => {
    const off = sound.onChange(setMuted);
    return () => {
      off();
    };
  }, []);
  return (
    <button
      type="button"
      onClick={() => {
        sound.unlock();
        sound.toggle();
      }}
      title={muted ? t("muted", lang) : t("soundOn", lang)}
      className="grid h-9 w-9 place-items-center rounded-lg border border-gamehack-border bg-gamehack-panel2 text-iron-400 hover:text-cyan-400 hover:border-cyan-600/40 transition"
    >
      <Icon name={muted ? "mute" : "volume"} className="w-4 h-4" />
    </button>
  );
}
