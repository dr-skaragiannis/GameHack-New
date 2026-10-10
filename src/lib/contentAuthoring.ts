import { usedCmd, type LabCommandFixture, type LabFileSeed, type Terminal } from "./terminal";
import type { AssessmentQ } from "../data/assessments";
import type { QuizQ } from "../data/quizzes";
import {
  LEARNING_PATHS,
  moduleById,
  type Bi,
  type Campaign,
  type Challenge,
  type Module,
  type Section,
  type SectionVisual,
  type Shot,
  type Task,
} from "../data/lessons";

/**
 * Educator-authored course content.
 *
 * The shipped lessons live in TypeScript and their objectives carry real
 * functions, which cannot be stored. Everything here is plain data instead:
 * an objective's completion test is a small declarative spec that this module
 * compiles into a function at load time. That keeps authored content
 * serialisable, auditable and safe — no eval, no code strings from storage.
 */

export type AuthoredCheck =
  | { kind: "command"; pattern: string }
  | { kind: "flag"; name: string }
  | { kind: "fileRead"; path: string }
  | { kind: "commandAndFile"; pattern: string; path: string }
  // Keeps the check the shipped lesson already has. Only meaningful for an
  // objective that exists in the built-in content.
  | { kind: "builtin" }
  // A new objective with no test defined yet: never completes, and the editor
  // flags it so the educator cannot ship an objective nobody can finish.
  | { kind: "unset" };

export type AuthoredSection = {
  id: string;
  heading: Bi;
  body: Bi;
  tip?: Bi;
  /**
   * Terminal transcripts and diagrams are plain data, so they are carried here
   * rather than dropped. Without them, editing or importing a lab silently
   * deleted every screenshot the shipped lesson had.
   */
  shots?: Shot[];
  visual?: SectionVisual;
};

export type AuthoredCheat = { cmd: string; desc: Bi };

export type AuthoredTask = {
  id: string;
  instruction: Bi;
  hint: Bi;
  explain: Bi;
  reward: number;
  material?: Bi;
  check: AuthoredCheck;
};

export type AuthoredChallenge = {
  id: string;
  title: Bi;
  brief: Bi;
  success: Bi;
  check: AuthoredCheck;
};

export type AuthoredModule = {
  id: string;
  order: number;
  icon: string;
  color: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  scenario: NonNullable<Module["scenario"]>;
  title: Bi;
  subtitle: Bi;
  badge: Bi;
  theory: AuthoredSection[];
  cheats: AuthoredCheat[];
  tasks: AuthoredTask[];
  challenges: AuthoredChallenge[];
  /**
   * The lab's slice of the sandbox: files with their contents, and canned
   * results for exact command lines. Without these an authored or imported lab
   * cannot be completed, because its objectives refer to files the shipped
   * fixtures do not contain.
   */
  files?: LabFileSeed[];
  commands?: LabCommandFixture[];
};

export type AuthoredPath = {
  id: string;
  title: Bi;
  subtitle: Bi;
  blurb: Bi;
  scenario: Campaign["scenario"];
  accent: string;
  moduleIds: string[];
};

export type ContentOverlay = {
  /** Authored replacement for a module id — built-in or newly created. */
  modules: Record<string, AuthoredModule>;
  /** Educator-created learning paths, in display order. */
  paths: AuthoredPath[];
  /**
   * Per-lab quiz and assessment overrides. The shipped question banks are
   * static module data, so an imported catalogue has nowhere else to put its
   * questions; without these an import would accept the file and silently
   * discard every question in it.
   */
  quizzes?: Record<string, QuizQ[]>;
  assessments?: Record<string, AssessmentQ[]>;
  /**
   * Edits to a shipped learning path, keyed by its built-in id. Shipped paths
   * are source data, so "editing" one means storing a replacement here; the
   * catalogue applies it on every compile.
   */
  pathEdits?: Record<string, AuthoredPath>;
  /**
   * Shipped path ids the educator removed from the catalogue. Deletion cannot
   * be a hard delete for source data, so removal is a reversible hide and the
   * editor offers a restore.
   */
  hiddenPaths?: string[];
  /** Lab ids removed from whichever path lists them. */
  hiddenModules?: string[];
  /**
   * Replacement for the shared player filesystem baseline. A full catalogue
   * export carries the whole fixture tree here, so an imported file describes
   * the sandbox the labs run in and not just their prose.
   */
  filesystem?: LabFileSeed[];
};

export const emptyOverlay = (): ContentOverlay => ({ modules: {}, paths: [] });

export const emptyBi = (): Bi => ({ en: "", el: "" });

let sequence = 0;
export function newId(prefix: string): string {
  sequence += 1;
  return `${prefix}-${Date.now().toString(36)}-${sequence.toString(36)}`;
}

export const emptyTask = (): AuthoredTask => ({
  id: newId("task"),
  instruction: emptyBi(),
  hint: emptyBi(),
  explain: emptyBi(),
  reward: 5,
  check: { kind: "unset" },
});

export const emptySection = (): AuthoredSection => ({
  id: newId("section"),
  heading: emptyBi(),
  body: emptyBi(),
});

export const emptyChallenge = (): AuthoredChallenge => ({
  id: newId("challenge"),
  title: emptyBi(),
  brief: emptyBi(),
  success: emptyBi(),
  check: { kind: "unset" },
});

export const emptyModule = (order: number): AuthoredModule => ({
  id: newId("lab"),
  order,
  icon: "terminal",
  color: "from-cyan-400 to-sky-900",
  difficulty: 2,
  scenario: "lab",
  title: emptyBi(),
  subtitle: emptyBi(),
  badge: emptyBi(),
  theory: [emptySection()],
  cheats: [],
  tasks: [emptyTask()],
  challenges: [emptyChallenge(), emptyChallenge()],
});

export const emptyPath = (): AuthoredPath => ({
  id: newId("path"),
  title: emptyBi(),
  subtitle: emptyBi(),
  blurb: emptyBi(),
  scenario: "lab",
  accent: "cyan",
  moduleIds: [],
});

function safeRegex(pattern: string): RegExp | null {
  try {
    return new RegExp(pattern);
  } catch {
    return null;
  }
}

/** Turn a declarative spec into the predicate the lab engine calls. */
export function compileCheck(spec: AuthoredCheck, fallback?: (ctx: Terminal) => boolean) {
  switch (spec.kind) {
    case "builtin":
      return fallback || (() => false);
    case "unset":
      return () => false;
    case "flag": {
      const name = spec.name.trim();
      return (ctx: Terminal) => (name ? ctx.flags.has(name) : false);
    }
    case "fileRead": {
      const path = spec.path.trim();
      return (ctx: Terminal) => (path ? ctx.filesRead.some((read) => read.includes(path)) : false);
    }
    case "command": {
      const re = safeRegex(spec.pattern);
      return (ctx: Terminal) => (re ? usedCmd(ctx, re) : false);
    }
    case "commandAndFile": {
      const re = safeRegex(spec.pattern);
      const path = spec.path.trim();
      return (ctx: Terminal) =>
        (re ? usedCmd(ctx, re) : false) && (path ? ctx.filesRead.some((read) => read.includes(path)) : false);
    }
    default:
      return () => false;
  }
}

/** A built-in objective's test cannot be serialised, so it stays behind a marker. */
/** The editable form of a shipped learning path. */
export function snapshotPath(path: Campaign): AuthoredPath {
  return {
    id: path.id,
    title: { ...path.title },
    subtitle: { ...path.subtitle },
    blurb: { ...path.blurb },
    scenario: path.scenario,
    accent: path.accent,
    moduleIds: path.modules.map((module) => module.id),
  };
}

export function snapshotModule(module: Module): AuthoredModule {
  return {
    id: module.id,
    order: module.order,
    icon: module.icon,
    color: module.color,
    difficulty: module.difficulty,
    scenario: module.scenario || "lab",
    title: { ...module.title },
    subtitle: { ...module.subtitle },
    badge: { ...module.badge },
    theory: module.theory.map((section, index) => ({
      id: `${module.id}-theory-${index}`,
      heading: { ...section.heading },
      body: { ...section.body },
      ...(section.tip ? { tip: { ...section.tip } } : {}),
      ...(section.shots?.length ? { shots: section.shots.map((shot) => ({ ...shot })) } : {}),
      ...(section.visual ? { visual: structuredClone(section.visual) } : {}),
    })),
    cheats: module.cheats.map((cheat) => ({ cmd: cheat.cmd, desc: { ...cheat.desc } })),
    tasks: module.tasks.map((task) => ({
      id: task.id,
      instruction: { ...task.instruction },
      hint: { ...task.hint },
      explain: { ...task.explain },
      reward: task.reward ?? 5,
      ...(task.material ? { material: { ...task.material } } : {}),
      check: { kind: "builtin" } as AuthoredCheck,
    })),
    challenges: module.challenges.map((challenge, index) => ({
      id: `${module.id}-challenge-${index}`,
      title: { ...challenge.title },
      brief: { ...challenge.brief },
      success: { ...challenge.success },
      check: { kind: "builtin" } as AuthoredCheck,
    })),
    ...(module.files?.length ? { files: module.files.map((seed) => ({ ...seed })) } : {}),
    ...(module.commands?.length ? { commands: module.commands.map((fixture) => ({ ...fixture })) } : {}),
  };
}

function compileTask(task: AuthoredTask, original?: Task): Task {
  return {
    id: task.id,
    instruction: task.instruction,
    hint: task.hint,
    explain: task.explain,
    reward: task.reward,
    ...(task.material && (task.material.en.trim() || task.material.el.trim()) ? { material: task.material } : {}),
    check: compileCheck(task.check, original?.check),
  };
}

function compileChallenge(challenge: AuthoredChallenge, original?: Challenge): Challenge {
  return {
    title: challenge.title,
    brief: challenge.brief,
    success: challenge.success,
    check: compileCheck(challenge.check, original?.check),
  };
}

function compileSection(section: AuthoredSection): Section {
  return {
    heading: section.heading,
    body: section.body,
    ...(section.tip ? { tip: section.tip } : {}),
    ...(section.shots?.length ? { shots: section.shots } : {}),
    ...(section.visual ? { visual: section.visual } : {}),
  };
}

/** Compile one authored lab, borrowing checks from the shipped lab it replaces. */
export function compileModule(authored: AuthoredModule): Module {
  const original = moduleById(authored.id);
  const challenges = [
    compileChallenge(authored.challenges[0] || emptyChallenge(), original?.challenges[0]),
    compileChallenge(authored.challenges[1] || emptyChallenge(), original?.challenges[1]),
  ] as [Challenge, Challenge];
  return {
    id: authored.id,
    order: authored.order,
    icon: authored.icon,
    color: authored.color,
    title: authored.title,
    subtitle: authored.subtitle,
    difficulty: authored.difficulty,
    badge: authored.badge,
    theory: authored.theory.map(compileSection),
    cheats: authored.cheats.map((cheat) => ({ cmd: cheat.cmd, desc: cheat.desc })),
    tasks: authored.tasks.map((task) =>
      compileTask(task, original?.tasks.find((candidate) => candidate.id === task.id)),
    ),
    challenges,
    scenario: authored.scenario,
    ...(authored.files?.length ? { files: authored.files.map((seed) => ({ ...seed })) } : {}),
    ...(authored.commands?.length ? { commands: authored.commands.map((fixture) => ({ ...fixture })) } : {}),
  };
}

export function compilePath(authored: AuthoredPath, pathNumber: number, overlay: ContentOverlay): Campaign {
  const modules = authored.moduleIds
    .map((id, index) => {
      const source = overlay.modules[id];
      return source ? compileModule({ ...source, order: index + 1 }) : undefined;
    })
    .filter((module): module is Module => !!module);
  return {
    id: authored.id,
    pathNumber,
    title: authored.title,
    subtitle: authored.subtitle,
    blurb: authored.blurb,
    scenario: authored.scenario,
    accent: authored.accent,
    modules,
  };
}

/**
 * The list the player-facing app renders: the shipped paths with any authored
 * replacement applied, followed by the paths the educator created.
 */
export function isPathHidden(overlay: ContentOverlay, id: string): boolean {
  return (overlay.hiddenPaths || []).includes(id);
}

export function isModuleHidden(overlay: ContentOverlay, id: string): boolean {
  return (overlay.hiddenModules || []).includes(id);
}

/**
 * Whether the educator has taken a lab out of the catalogue, either directly or
 * by removing the path that carried it. Shipped labs stay resolvable by id
 * otherwise, so a removed lab would still open through any stale link.
 */
export function isModuleRemoved(overlay: ContentOverlay, id: string): boolean {
  if (isModuleHidden(overlay, id)) return true;
  return LEARNING_PATHS.some((path) => isPathHidden(overlay, path.id) && path.modules.some((module) => module.id === id));
}

export function effectiveLearningPaths(overlay: ContentOverlay): Campaign[] {
  const hiddenModules = new Set(overlay.hiddenModules || []);
  const base = LEARNING_PATHS.filter((path) => !isPathHidden(overlay, path.id)).map((path) => {
    const edit = overlay.pathEdits?.[path.id];
    // An edit replaces the lab list; without one the shipped list stands.
    const ids = edit ? edit.moduleIds : path.modules.map((module) => module.id);
    const modules = ids
      .filter((id) => !hiddenModules.has(id))
      .map((id, index) => {
        const authored = overlay.modules[id];
        if (authored) return compileModule({ ...authored, order: index + 1 });
        const shipped = path.modules.find((candidate) => candidate.id === id);
        return shipped ? { ...shipped, order: index + 1 } : undefined;
      })
      .filter((module): module is Module => !!module);
    return {
      ...path,
      ...(edit
        ? { title: edit.title, subtitle: edit.subtitle, blurb: edit.blurb, scenario: edit.scenario, accent: edit.accent }
        : {}),
      modules,
    };
  });
  const authored = overlay.paths
    .filter((path) => !isPathHidden(overlay, path.id))
    .map((path) => ({
      ...path,
      moduleIds: path.moduleIds.filter((id) => !hiddenModules.has(id)),
    }))
    .map((path, index) => compilePath(path, base.length + index + 1, overlay));
  // Numbering is positional: removing a path must not leave the rest wearing
  // the numbers of paths that are no longer there.
  return [...base, ...authored].map((path, index) => ({ ...path, pathNumber: index + 1 }));
}

/** Every lab the app can open, authored ones included. */
export function effectiveModules(overlay: ContentOverlay): Module[] {
  return effectiveLearningPaths(overlay).flatMap((path) => path.modules);
}

export function effectiveModuleById(overlay: ContentOverlay, id: string): Module | undefined {
  return effectiveModules(overlay).find((module) => module.id === id);
}

/**
 * A blocking problem in an authored lab, as a code plus the position it refers
 * to. Codes rather than prose so the editor can render them in either language.
 */
export type AuthoredIssue =
  | { code: "noTitle" }
  | { code: "noTheory" }
  | { code: "theoryNoHeading"; index: number }
  | { code: "theoryNoBody"; index: number }
  | { code: "noObjectives" }
  | { code: "objectiveNoInstruction"; index: number }
  | { code: "objectiveNoTest"; index: number }
  | { code: "objectiveBadBuiltin"; index: number }
  | { code: "objectiveBadXp"; index: number }
  | { code: "needsTwoChallenges" }
  | { code: "challengeNoTest"; index: number }
  | { code: "challengeBadBuiltin"; index: number };

/** Problems an educator should fix before publishing; keyed by lab id. */
export function overlayIssues(overlay: ContentOverlay): { moduleId: string; issues: AuthoredIssue[] }[] {
  const out: { moduleId: string; issues: AuthoredIssue[] }[] = [];
  for (const [id, authored] of Object.entries(overlay.modules)) {
    const issues: AuthoredIssue[] = [];
    const shipped = moduleById(id);
    if (!authored.title.en.trim() && !authored.title.el.trim()) issues.push({ code: "noTitle" });
    if (authored.theory.length === 0) issues.push({ code: "noTheory" });
    authored.theory.forEach((section, index) => {
      if (!section.heading.en.trim() && !section.heading.el.trim()) issues.push({ code: "theoryNoHeading", index });
      if (!section.body.en.trim() && !section.body.el.trim()) issues.push({ code: "theoryNoBody", index });
    });
    if (authored.tasks.length === 0) issues.push({ code: "noObjectives" });
    authored.tasks.forEach((task, index) => {
      if (!task.instruction.en.trim() && !task.instruction.el.trim()) issues.push({ code: "objectiveNoInstruction", index });
      if (task.check.kind === "unset") issues.push({ code: "objectiveNoTest", index });
      if (task.check.kind === "builtin" && !shipped) issues.push({ code: "objectiveBadBuiltin", index });
      if (!Number.isFinite(task.reward) || task.reward < 0) issues.push({ code: "objectiveBadXp", index });
    });
    if (authored.challenges.length < 2) issues.push({ code: "needsTwoChallenges" });
    authored.challenges.forEach((challenge, index) => {
      // A challenge nobody can pass locks the lab, so it is an error too.
      if (challenge.check.kind === "unset") issues.push({ code: "challengeNoTest", index });
      if (challenge.check.kind === "builtin" && !shipped) issues.push({ code: "challengeBadBuiltin", index });
    });
    if (issues.length) out.push({ moduleId: id, issues });
  }
  return out;
}
