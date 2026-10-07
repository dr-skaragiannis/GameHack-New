import { useEffect, useState } from "react";
import { BADGES } from "../lib/db";
import Icon from "./Icon";
import { t, uppercaseLabel, type Lang } from "../i18n";

const TIER: Record<string, string> = {
  bronze: "from-cyan-700 to-cyan-500",
  silver: "from-zinc-400 to-slate-200",
  gold: "from-yellow-500 to-cyan-300",
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
  const badge = BADGES[badgeId];
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (!badge) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsClosing(true);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [badge]);

  useEffect(() => {
    if (!isClosing) return;
    const timer = window.setTimeout(onClose, 190);
    return () => window.clearTimeout(timer);
  }, [isClosing, onClose]);

  if (!badge) return null;

  const closeWithAnimation = () => setIsClosing(true);
  const certificateTitle = lang === "en" ? "Certificate of achievement" : "Πιστοποιητικό διάκρισης";
  return (
    <div
      className={`dashboard-modal-backdrop badge-certificate-backdrop${isClosing ? " is-closing" : ""}`}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) closeWithAnimation();
      }}
    >
      <section className="badge-certificate dashboard-modal-surface" role="dialog" aria-modal="true" aria-labelledby="badge-certificate-title">
        <button
          type="button"
          className="badge-certificate__close dashboard-action"
          aria-label={t("close", lang)}
          title={t("close", lang)}
          onClick={closeWithAnimation}
        >
          <Icon name="close" className="h-4 w-4" />
        </button>

        <div className="badge-certificate__seal" aria-hidden="true">
          <span className="badge-certificate__orbit" />
          <span className={`badge-certificate__medallion bg-gradient-to-br ${TIER[badge.tier] || TIER.bronze}`}>
            <Icon name={badge.icon} className="h-10 w-10" />
          </span>
          <span className={`badge-certificate__tier is-${badge.tier}`}>{uppercaseLabel(badge.tier, lang)}</span>
        </div>

        <div className="badge-certificate__issuer">GameHack, {uppercaseLabel(certificateTitle, lang)}</div>
        <h2 id="badge-certificate-title">{badge.name}</h2>
        <p className="badge-certificate__description">{badge.desc}</p>
        <div className="badge-certificate__divider"><span /><Icon name="spark" className="h-4 w-4" /><span /></div>
        <p className="badge-certificate__blurb">{badge.blurb}</p>
        <div className="badge-certificate__signature">
          <span className="badge-certificate__signature-mark"><Icon name="shield" className="h-4 w-4" /></span>
          <span>
            <strong>{lang === "en" ? "GameHack Learning Lab" : "Εργαστήριο μάθησης GameHack"}</strong>
            <small>{lang === "en" ? "Verified achievement" : "Επιβεβαιωμένο επίτευγμα"}</small>
          </span>
          <span className="badge-certificate__seal-mark">GH</span>
        </div>
        <button type="button" onClick={closeWithAnimation} className="badge-certificate__action dashboard-action">
          {t("close", lang)}
        </button>
      </section>
    </div>
  );
}
