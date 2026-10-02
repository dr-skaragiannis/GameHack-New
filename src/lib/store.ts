import type { Lang } from "../i18n";

export type ModProgress = { completed: boolean; done: string[] };
export type Save = {
  lang: Lang;
  accepted: boolean;
  hintsUsed: number;
  progress: Record<string, ModProgress>;
};

const KEY = "hackforge.save.v1";

export function load(): Save {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* ignore */
  }
  return { lang: "en", accepted: false, hintsUsed: 0, progress: {} };
}

export function save(s: Save) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* ignore */
  }
}

export function clearSave() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
