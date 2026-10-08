import { usedCmd, type Terminal } from "./terminal";
import {
  LEARNING_PATHS,
  moduleById,
  type Bi,
  type Campaign,
  type Challenge,
  type Module,
  type Section,
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
    })),
    cheats: module.cheats.map((cheat) => ({ cmd: cheat.cmd, desc: { ...cheat.desc } })),
    tasks: module.tasks.map((task) => ({
      id: task.id,
      instruction: { ...task.instruction },
      hint: { ...task.hint },
      explain: { ...task.explain },
      reward: task.reward ?? 5,
      check: { kind: "builtin" } as AuthoredCheck,
    })),
    challenges: module.challenges.map((challenge, index) => ({
      id: `${module.id}-challenge-${index}`,
      title: { ...challenge.title },
      brief: { ...challenge.brief },
      success: { ...challenge.success },
      check: { kind: "builtin" } as AuthoredCheck,
    })),
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
export function effectiveLearningPaths(overlay: ContentOverlay): Campaign[] {
  const base = LEARNING_PATHS.map((path) => {
    if (!path.modules.some((module) => overlay.modules[module.id])) return path;
    return { ...path, modules: path.modules.map((module) => (overlay.modules[module.id] ? compileModule(overlay.modules[module.id]) : module)) };
  });
  const authored = overlay.paths.map((path, index) => compilePath(path, base.length + index + 1, overlay));
  return [...base, ...authored];
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
