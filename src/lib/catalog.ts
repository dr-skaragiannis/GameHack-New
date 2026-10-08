import { LEARNING_PATHS, moduleById as shippedModuleById, type Campaign, type Module } from "../data/lessons";
import { effectiveLearningPaths, isModuleRemoved } from "./contentAuthoring";
import { getContentOverlay } from "./db";

/**
 * The catalog every screen renders from: the shipped learning paths merged with
 * whatever the educator authored. Building it clones the shipped labs, so the
 * result is memoised and only rebuilt after {@link invalidateCatalog}.
 */
let cache: { paths: Campaign[]; byId: Map<string, Module> } | null = null;

function build() {
  if (cache) return cache;
  const paths = effectiveLearningPaths(getContentOverlay());
  const byId = new Map<string, Module>();
  for (const path of paths) for (const module of path.modules) byId.set(module.id, module);
  cache = { paths, byId };
  return cache;
}

export function invalidateCatalog() {
  cache = null;
}

export function learningPaths(): Campaign[] {
  return build().paths;
}

export function moduleById(id: string): Module | undefined {
  const found = build().byId.get(id);
  if (found) return found;
  // The shipped fallback must not resurrect a lab the educator removed, or a
  // stale id would still open it after it left the catalogue.
  if (isModuleRemoved(getContentOverlay(), id)) return undefined;
  return shippedModuleById(id);
}

/** The shipped catalog only, for screens that must ignore authored edits. */
export const SHIPPED_PATHS = LEARNING_PATHS;
