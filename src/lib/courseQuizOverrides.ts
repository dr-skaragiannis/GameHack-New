import { ASSESSMENTS, type AssessmentQ } from "../data/assessments";
import { QUIZZES, type QuizQ } from "../data/quizzes";
import type { ContentOverlay } from "./contentAuthoring";

/**
 * The shipped question banks are static module data read directly by QuizPopup,
 * AssessmentPopup and App. An imported catalogue carries its own questions, and
 * there is nowhere else to put them, so the overlay's banks are applied onto the
 * live maps here.
 *
 * Doing it in one place beats threading an overlay prop through every consumer,
 * and keeping a pristine copy means resetting the overlay puts the shipped
 * questions back exactly as they were rather than leaving imports behind.
 */
const pristineQuizzes: Record<string, QuizQ[]> = structuredClone(QUIZZES);
const pristineAssessments: Record<string, AssessmentQ[]> = structuredClone(ASSESSMENTS);

function replaceAll<T>(target: Record<string, T[]>, pristine: Record<string, T[]>, override?: Record<string, T[]>): void {
  for (const key of Object.keys(target)) delete target[key];
  Object.assign(target, structuredClone(pristine));
  if (override) {
    for (const [id, questions] of Object.entries(override)) {
      if (Array.isArray(questions) && questions.length) target[id] = structuredClone(questions);
    }
  }
}

/** Reset both banks to the shipped questions, then apply any imported ones. */
export function applyCourseQuizOverrides(overlay: ContentOverlay | undefined): void {
  replaceAll(QUIZZES, pristineQuizzes, overlay?.quizzes);
  replaceAll(ASSESSMENTS, pristineAssessments, overlay?.assessments);
}

export function courseQuizOverrideCounts(overlay: ContentOverlay | undefined): { quizzes: number; assessments: number } {
  return {
    quizzes: Object.values(overlay?.quizzes ?? {}).reduce((total, questions) => total + questions.length, 0),
    assessments: Object.values(overlay?.assessments ?? {}).reduce((total, questions) => total + questions.length, 0),
  };
}
