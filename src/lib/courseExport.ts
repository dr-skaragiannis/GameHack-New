import { ASSESSMENTS, type AssessmentQ } from "../data/assessments";
import { QUIZZES, type QuizQ } from "../data/quizzes";
import type { Campaign, Challenge, Module, Task } from "../data/lessons";
import { effectiveLearningPaths, type ContentOverlay } from "./contentAuthoring";

export const COURSE_EXPORT_FORMAT = "gamehack-learning-paths";
export const COURSE_EXPORT_VERSION = 1;

/**
 * An objective's completion test is a closure over the terminal, so it cannot
 * survive JSON. `JSON.stringify` would drop the key entirely and the file would
 * look complete while silently missing every test, so each one is replaced by
 * this marker instead. Authored tests still round-trip through the content
 * overlay, which stores them as data.
 */
export const BUILTIN_CHECK = { builtin: true } as const;
export type ExportedCheck = typeof BUILTIN_CHECK;

export type ExportedTask = Omit<Task, "check"> & { check: ExportedCheck };
export type ExportedChallenge = Omit<Challenge, "check"> & { check: ExportedCheck };
export type ExportedModule = Omit<Module, "tasks" | "challenges"> & {
  tasks: ExportedTask[];
  challenges: ExportedChallenge[];
  quiz: QuizQ[];
  assessment: AssessmentQ[];
};
export type ExportedPath = Omit<Campaign, "modules"> & { modules: ExportedModule[] };

export type CourseExport = {
  format: typeof COURSE_EXPORT_FORMAT;
  version: typeof COURSE_EXPORT_VERSION;
  exportedAt: string;
  note: string;
  paths: ExportedPath[];
};

const NOTE =
  "The full catalogue a player sees: built-in learning paths merged with any authored edits. " +
  'Objective and challenge tests are closures in the running app and appear as {"builtin":true} here; ' +
  "authored tests round-trip through the content overlay. Everything else is verbatim.";

/** The effective catalogue — what a player actually sees — as plain JSON data. */
export function buildCourseExport(overlay: ContentOverlay, now = new Date()): CourseExport {
  const paths: ExportedPath[] = effectiveLearningPaths(overlay).map((path) => ({
    ...path,
    modules: path.modules.map((module) => ({
      ...module,
      tasks: module.tasks.map(({ check: _check, ...task }): ExportedTask => ({ ...task, check: BUILTIN_CHECK })),
      challenges: module.challenges.map(
        ({ check: _check, ...challenge }): ExportedChallenge => ({ ...challenge, check: BUILTIN_CHECK }),
      ),
      quiz: QUIZZES[module.id] ?? [],
      assessment: ASSESSMENTS[module.id] ?? [],
    })),
  }));
  return {
    format: COURSE_EXPORT_FORMAT,
    version: COURSE_EXPORT_VERSION,
    exportedAt: now.toISOString(),
    note: NOTE,
    paths,
  };
}

export function serialiseCourseExport(exported: CourseExport): string {
  return `${JSON.stringify(exported, null, 2)}\n`;
}

export function courseExportFilename(now = new Date()): string {
  const stamp = now.toISOString().slice(0, 10);
  return `gamehack-learning-paths-${stamp}.json`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Validate an uploaded catalogue. Returns null rather than throwing so the
 *  caller can show one message for every kind of bad file. */
export function parseCourseExport(contents: string): CourseExport | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(contents);
  } catch {
    return null;
  }
  if (!isRecord(parsed)) return null;
  if (parsed.format !== COURSE_EXPORT_FORMAT || parsed.version !== COURSE_EXPORT_VERSION) return null;
  if (!Array.isArray(parsed.paths)) return null;
  for (const path of parsed.paths) {
    if (!isRecord(path) || typeof path.id !== "string" || !Array.isArray(path.modules)) return null;
    for (const module of path.modules) {
      if (!isRecord(module) || typeof module.id !== "string") return null;
      if (!Array.isArray(module.theory) || !Array.isArray(module.tasks) || !Array.isArray(module.challenges)) return null;
    }
  }
  return parsed as unknown as CourseExport;
}

export type CourseExportCounts = {
  paths: number;
  labs: number;
  objectives: number;
  theory: number;
  commandRows: number;
  quiz: number;
  assessment: number;
};

export function courseExportCounts(exported: CourseExport): CourseExportCounts {
  const labs = exported.paths.flatMap((path) => path.modules);
  const sum = (pick: (module: ExportedModule) => number) => labs.reduce((total, module) => total + pick(module), 0);
  return {
    paths: exported.paths.length,
    labs: labs.length,
    objectives: sum((module) => module.tasks.length),
    theory: sum((module) => module.theory.length),
    commandRows: sum((module) => module.cheats.length),
    quiz: sum((module) => module.quiz.length),
    assessment: sum((module) => module.assessment.length),
  };
}

/** Trigger a browser download. Shared by the profile and the educator dashboard
 *  so both name and stamp their files the same way. */
export function downloadJsonFile(filename: string, contents: string): void {
  const blob = new Blob([contents], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
