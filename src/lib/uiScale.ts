export const UI_SCALE_KEY = "gamehack.uiScale.v1";
export const UI_SCALE_OPTIONS = [0.9, 1, 1.1, 1.25];
export const UI_SCALE_BASE_PX = 17;

export function normalizeUiScale(value: unknown): number {
  const option = typeof value === "number" ? value : Number(value);
  return UI_SCALE_OPTIONS.includes(option) ? option : 1;
}

export function readStoredUiScale(): number {
  try {
    const raw = window.localStorage.getItem(UI_SCALE_KEY);
    if (raw === null) return 1;
    return normalizeUiScale(Number(raw));
  } catch {
    return 1;
  }
}

export function applyUiScale(scale: number): void {
  if (typeof document === "undefined") return;
  const normalized = normalizeUiScale(scale);
  // A 100% zoom clears the override so the stylesheet default (including the
  // large-screen adjustment) applies; other levels set an explicit root size
  // that scales every rem-based measurement in the interface.
  document.documentElement.style.fontSize = normalized === 1
    ? ""
    : `${UI_SCALE_BASE_PX * normalized}px`;
  try {
    window.localStorage.setItem(UI_SCALE_KEY, String(normalized));
  } catch {
    // The zoom still applies for this session when storage is unavailable.
  }
}
