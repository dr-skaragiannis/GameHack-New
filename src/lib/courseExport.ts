import { ASSESSMENTS, type AssessmentQ } from "../data/assessments";
import { QUIZZES, type QuizQ } from "../data/quizzes";
import { LEARNING_PATHS, moduleById, type Bi, type Campaign, type Challenge, type Module, type Task } from "../data/lessons";
import type { LabFileSeed } from "./terminal";
import {
  effectiveLearningPaths,
  type AuthoredModule,
  type AuthoredPath,
  type AuthoredTask,
  type ContentOverlay,
} from "./contentAuthoring";

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
  /** Structure documentation, first in the file. JSON has no comments, so this
   *  is how the export explains itself. Ignored by the importer. */
  readme?: unknown;
  format: typeof COURSE_EXPORT_FORMAT;
  version: typeof COURSE_EXPORT_VERSION;
  exportedAt: string;
  note: string;
  paths: ExportedPath[];
  /**
   * The shared player filesystem every lab runs against, flattened to one
   * record per file. The player tree is shared rather than per-lab, so this is
   * a property of the catalogue and not of any single lab; a lab adds to it
   * through its own `files`.
   */
  filesystem?: LabFileSeed[];
};

const NOTE =
  "The full catalogue a player sees: built-in learning paths merged with any authored edits. " +
  'Objective and challenge tests are closures in the running app and appear as {"builtin":true} here; ' +
  "authored tests round-trip through the content overlay. Everything else is verbatim.";

/**
 * JSON has no comment syntax — anything starting with // would make the file
 * unparseable and break the import. So the structure documentation travels as a
 * `readme` object placed first in the file, which is the closest thing to a
 * header comment that still round-trips.
 */
export const COURSE_EXPORT_README = {
  what: {
    en: "A GameHack course catalogue. Exported from the educator dashboard and re-importable from the same place.",
    el: "Κατάλογος μαθημάτων του GameHack. Εξάγεται από τον πίνακα εκπαιδευτή και εισάγεται ξανά από το ίδιο σημείο.",
  },
  howToRead: {
    en: "JSON has no comment syntax, so this readme is the file's own documentation: a data field the importer ignores. It sits first so it reads like a header. Every human-facing label elsewhere is a {en, el} pair; both languages are always present, and arrays are ordered exactly as they appear to the player. Delete this block if you prefer a smaller file - the import still works, but the file no longer explains itself.",
    el: "Η JSON δεν έχει σύνταξη σχολίων, οπότε αυτό το readme είναι η τεκμηρίωση του ίδιου του αρχείου: ένα πεδίο δεδομένων που ο εισαγωγέας αγνοεί. Μπαίνει πρώτο ώστε να διαβάζεται σαν επικεφαλίδα. Κάθε ετικέτα που βλέπει άνθρωπος παρακάτω είναι ζεύγος {en, el}· και οι δύο γλώσσες υπάρχουν πάντα, και οι πίνακες είναι ταξινομημένοι ακριβώς όπως τα βλέπει ο παίκτης. Διέγραψε αυτό το μπλοκ αν προτιμάς μικρότερο αρχείο - η εισαγωγή δουλεύει κανονικά, αλλά το αρχείο δεν εξηγεί πια τον εαυτό του.",
  },
  fields: {
    format: { en: "Always 'gamehack-learning-paths'. The importer rejects any other value.", el: "Πάντα 'gamehack-learning-paths'. Ο εισαγωγέας απορρίπτει οποιαδήποτε άλλη τιμή." },
    version: { en: "Schema version, currently 1. A file with a higher version is refused rather than half-parsed.", el: "Έκδοση σχήματος, αυτή τη στιγμή 1. Ένα αρχείο με μεγαλύτερη έκδοση απορρίπτεται αντί να αναλυθεί μισό." },
    exportedAt: { en: "ISO-8601 timestamp of the export.", el: "Χρονοσήμανση ISO-8601 της εξαγωγής." },
    readme: { en: "This documentation. Ignored by the importer.", el: "Αυτή η τεκμηρίωση. Ο εισαγωγέας την αγνοεί." },
    note: { en: "One-line summary of what the file contains and what is marked rather than serialised.", el: "Σύνοψη μιας γραμμής: τι περιέχει το αρχείο και τι σημειώνεται αντί να σειριοποιηθεί." },
    paths: { en: "The learning paths, in display order. Each is one row on the platform's home screen.", el: "Τα μονοπάτια εκμάθησης, με τη σειρά εμφάνισης. Το καθένα είναι μία γραμμή στην αρχική οθόνη." },
    filesystem: { en: "The shared simulated filesystem every lab runs against, one record per file. The player tree is shared rather than per-lab, so this describes the sandbox as a whole; a lab adds to it through its own files. Omit it to keep whatever baseline is already in place.", el: "Το κοινό προσομοιωμένο filesystem στο οποίο τρέχουν όλα τα εργαστήρια, μία εγγραφή ανά αρχείο. Το δέντρο του παίκτη είναι κοινό και όχι ανά εργαστήριο, οπότε αυτό περιγράφει το sandbox συνολικά· ένα εργαστήριο προσθέτει σε αυτό μέσω των δικών του files. Παράλειψέ το για να κρατήσεις όποιο baseline υπάρχει ήδη." },
  },
  path: {
    id: { en: "Stable identifier. Importing a path whose id already exists replaces it; a new id creates a new path.", el: "Σταθερό αναγνωριστικό. Η εισαγωγή μονοπατιού με id που υπάρχει ήδη το αντικαθιστά· ένα νέο id δημιουργεί νέο μονοπάτι." },
    pathNumber: { en: "Display order and numbering, assigned at compile time.", el: "Σειρά εμφάνισης και αρίθμηση, που αποδίδεται κατά τη μεταγλώττιση." },
    title: { en: "{en, el} path name.", el: "Όνομα μονοπατιού {en, el}." },
    subtitle: { en: "{en, el} one-line description under the name.", el: "Περιγραφή μιας γραμμής κάτω από το όνομα {en, el}." },
    blurb: { en: "{en, el} longer description shown on the path card.", el: "Εκτενέστερη περιγραφή στην κάρτα του μονοπατιού {en, el}." },
    scenario: { en: "Which simulated environment the labs run in: lab, raven, ssh, sudorun or dfir.", el: "Σε ποιο προσομοιωμένο περιβάλλον τρέχουν τα εργαστήρια: lab, raven, ssh, sudorun ή dfir." },
    accent: { en: "Tailwind gradient classes used for the path's colour.", el: "Κλάσεις Tailwind για το χρώμα του μονοπατιού." },
    modules: { en: "The labs belonging to this path, in order.", el: "Τα εργαστήρια αυτού του μονοπατιού, με τη σειρά." },
  },
  module: {
    id: { en: "Stable lab identifier. If it matches a built-in lab, that lab's real objective tests are restored on import.", el: "Σταθερό αναγνωριστικό εργαστηρίου. Αν ταιριάζει με ενσωματωμένο εργαστήριο, κατά την εισαγωγή επανέρχονται οι πραγματικοί έλεγχοι των στόχων του." },
    order: { en: "Position within the path.", el: "Θέση μέσα στο μονοπάτι." },
    icon: { en: "Icon key used in the lab card.", el: "Κλειδί εικονιδίου για την κάρτα του εργαστηρίου." },
    color: { en: "Tailwind gradient classes for the lab card.", el: "Κλάσεις Tailwind για την κάρτα του εργαστηρίου." },
    difficulty: { en: "1 to 5, shown as the difficulty rating.", el: "1 έως 5, εμφανίζεται ως βαθμός δυσκολίας." },
    title: { en: "{en, el} lab name.", el: "Όνομα εργαστηρίου {en, el}." },
    subtitle: { en: "{en, el} lab summary.", el: "Σύνοψη εργαστηρίου {en, el}." },
    badge: { en: "{en, el} name of the badge awarded on completion.", el: "Όνομα του σήματος που απονέμεται με την ολοκλήρωση {en, el}." },
    theory: { en: "Prose sections shown on the Theory tab, in reading order.", el: "Ενότητες κειμένου στην καρτέλα Θεωρία, με τη σειρά ανάγνωσης." },
    cheats: { en: "Command-sheet rows: a command plus a one-line {en, el} description.", el: "Γραμμές του φύλλου εντολών: μία εντολή και μια περιγραφή μιας γραμμής {en, el}." },
    tasks: { en: "Objectives the player completes in the terminal, each worth XP.", el: "Στόχοι που ολοκληρώνει ο παίκτης στο τερματικό, ο καθένας με XP." },
    challenges: { en: "The final challenges that gate lab completion.", el: "Οι τελικές προκλήσεις που ξεκλειδώνουν την ολοκλήρωση του εργαστηρίου." },
    files: { en: "Files this lab places into the sandbox, each described by labFile below. Without them the lab's objectives point at files that do not exist.", el: "Αρχεία που τοποθετεί αυτό το εργαστήριο στο sandbox, το καθένα περιγράφεται από το labFile παρακάτω. Χωρίς αυτά, οι στόχοι του εργαστηρίου δείχνουν σε αρχεία που δεν υπάρχουν." },
    commands: { en: "Canned results for exact command lines, each described by commandFixture below. Empty for shipped labs, whose outputs the simulator computes.", el: "Έτοιμα αποτελέσματα για ακριβείς γραμμές εντολών, το καθένα περιγράφεται από το commandFixture παρακάτω. Άδειο για τα ενσωματωμένα εργαστήρια, των οποίων τα αποτελέσματα τα υπολογίζει ο προσομοιωτής." },
    quiz: { en: "Quick quiz asked before the lab counts as complete.", el: "Γρήγορο κουίζ που τίθεται πριν το εργαστήριο μετρήσει ως ολοκληρωμένο." },
    assessment: { en: "Scenario assessment asked after it.", el: "Αξιολόγηση σεναρίου που τίθεται μετά." },
  },
  theorySection: {
    heading: { en: "{en, el} section title.", el: "Τίτλος ενότητας {en, el}." },
    body: { en: "{en, el} prose. Blank lines separate paragraphs; the platform needs at least two.", el: "Κείμενο {en, el}. Οι κενές γραμμές χωρίζουν παραγράφους· η πλατφόρμα απαιτεί τουλάχιστον δύο." },
    tip: { en: "{en, el} optional highlighted note.", el: "Προαιρετική σημείωση που ξεχωρίζει {en, el}." },
    shots: { en: "Terminal transcripts: the command that was run plus the exact lines it printed.", el: "Απομαγνητοφώνηση τερματικού: η εντολή που έτρεξε και οι ακριβείς γραμμές που τύπωσε." },
    visual: { en: "Optional diagram attached to the section.", el: "Προαιρετικό διάγραμμα που συνοδεύει την ενότητα." },
  },
  task: {
    id: { en: "Stable objective identifier, used to track completion and XP.", el: "Σταθερό αναγνωριστικό στόχου, για την παρακολούθηση ολοκλήρωσης και XP." },
    instruction: { en: "{en, el} what the player is asked to do.", el: "Τι ζητείται από τον παίκτη {en, el}." },
    hint: { en: "{en, el} the command lines to run. Parsed as commands, one per line.", el: "Οι εντολές που πρέπει να τρέξουν {en, el}. Αναλύονται ως εντολές, μία ανά γραμμή." },
    explain: { en: "{en, el} why and how. The platform splits it on 'Why:'/'Γιατί:' and 'How:'/'Πώς:'.", el: "Γιατί και πώς {en, el}. Η πλατφόρμα το χωρίζει στα 'Why:'/'Γιατί:' και 'How:'/'Πώς:'." },
    reward: { en: "XP awarded on completion.", el: "XP που απονέμονται με την ολοκλήρωση." },
    material: { en: "{en, el} optional additional reading shown under the objective.", el: "Προαιρετικό επιπλέον υλικό κάτω από τον στόχο {en, el}." },
    check: { en: 'Completion test. {"builtin":true} means the test is a closure in the running app and cannot be serialised; on import the built-in lab of the same id supplies the real test.', el: 'Έλεγχος ολοκλήρωσης. Το {"builtin":true} σημαίνει ότι ο έλεγχος είναι κλειστότητα μέσα στην εφαρμογή και δεν σειριοποιείται· κατά την εισαγωγή, το ενσωματωμένο εργαστήριο με το ίδιο id παρέχει τον πραγματικό έλεγχο.' },
  },
  challenge: {
    title: { en: "{en, el} challenge name.", el: "Όνομα πρόκλησης {en, el}." },
    brief: { en: "{en, el} what the player must achieve.", el: "Τι πρέπει να πετύχει ο παίκτης {en, el}." },
    success: { en: "{en, el} the condition that proves it.", el: "Η συνθήκη που το αποδεικνύει {en, el}." },
    check: { en: "As on tasks: the completion test, or the builtin marker.", el: "Όπως και στους στόχους: ο έλεγχος ολοκλήρωσης, ή ο δείκτης builtin." },
  },
  quizQuestion: {
    q: { en: "{en, el} question text.", el: "Κείμενο ερώτησης {en, el}." },
    choices: { en: "Four {en, el} answer options.", el: "Τέσσερις επιλογές απάντησης {en, el}." },
    answer: { en: "Zero-based index of the correct choice.", el: "Δείκτης της σωστής επιλογής, με αρίθμηση από το μηδέν." },
    why: { en: "{en, el} explanation shown after answering.", el: "Εξήγηση που εμφανίζεται μετά την απάντηση {en, el}." },
  },
  assessmentQuestion: {
    scenario: { en: "{en, el} situation the judgement call is made about.", el: "Η περίσταση πάνω στην οποία παίρνεται η κρίση {en, el}." },
    q: { en: "{en, el} the question asked about that scenario.", el: "Η ερώτηση για αυτό το σενάριο {en, el}." },
    choices: { en: "Four {en, el} answer options.", el: "Τέσσερις επιλογές απάντησης {en, el}." },
    answer: { en: "Zero-based index of the correct choice.", el: "Δείκτης της σωστής επιλογής, με αρίθμηση από το μηδέν." },
    why: { en: "{en, el} reasoning behind the correct answer.", el: "Η αιτιολόγηση πίσω από τη σωστή απάντηση {en, el}." },
  },
  labFile: {
    path: { en: "Absolute path in the lab filesystem. Parent directories are created automatically.", el: "Απόλυτη διαδρομή στο filesystem του εργαστηρίου. Οι γονικοί φάκελοι δημιουργούνται αυτόματα." },
    content: { en: "The file's contents, exactly as `cat` will print them.", el: "Τα περιεχόμενα του αρχείου, ακριβώς όπως θα τα τυπώσει η cat." },
    mode: { en: "Optional permission string as shown by `ls -l`, for example -rw-r--r--.", el: "Προαιρετικό string δικαιωμάτων όπως το δείχνει η ls -l, π.χ. -rw-r--r--." },
    owner: { en: "Optional owner name.", el: "Προαιρετικό όνομα κατόχου." },
    group: { en: "Optional group name.", el: "Προαιρετικό όνομα ομάδας." },
    note: { en: "Files already present are never overwritten, so a player's edits survive reopening the lab. Revert lab restores the pristine tree.", el: "Τα αρχεία που υπάρχουν ήδη δεν αντικαθίστανται ποτέ, οπότε οι αλλαγές του παίκτη επιβιώνουν όταν ξανανοίξει το εργαστήριο. Το Revert lab επαναφέρει το αρχικό δέντρο." },
  },
  commandFixture: {
    command: { en: "The exact command line to match, as the player would type it. Matching is exact, not a prefix or a pattern, so a fixture never fires on a command the author did not write out in full.", el: "Η ακριβής γραμμή εντολής προς ταίριασμα, όπως θα την πληκτρολογούσε ο παίκτης. Το ταίριασμα είναι ακριβές, όχι πρόθεμα ή pattern, οπότε ένα fixture δεν ενεργοποιείται ποτέ σε εντολή που ο συγγραφέας δεν έγραψε ολόκληρη." },
    output: { en: "What the command prints. Newlines become separate output lines.", el: "Τι τυπώνει η εντολή. Οι αλλαγές γραμμής γίνονται ξεχωριστές γραμμές εξόδου." },
    exit: { en: "Optional exit code, default 0. A non-zero code makes the command read as failed.", el: "Προαιρετικός κωδικός εξόδου, προεπιλογή 0. Ένας μη μηδενικός κωδικάς κάνει την εντολή να φαίνεται ως αποτυχημένη." },
    flag: { en: "Optional flag name recorded when the command runs, so a completion test can require it.", el: "Προαιρετικό όνομα flag που καταγράφεται όταν τρέξει η εντολή, ώστε ένας έλεγχος ολοκλήρωσης να μπορεί να την απαιτεί." },
    note: { en: "A fixture answers before the shared simulator, so it can also restate what a built-in tool prints inside this lab only.", el: "Ένα fixture απαντά πριν από τον κοινό προσομοιωτή, οπότε μπορεί και να διατυπώσει εκ νέου τι τυπώνει ένα ενσωματωμένο εργαλείο, μόνο μέσα σε αυτό το εργαστήριο." },
  },
  importing: {
    en: "Educator dashboard -> Learning paths (JSON) -> Import. Labs whose id matches a built-in lab are edited in place and keep their real tests; unknown ids become new authored content, so one file can also add whole new learning paths. Objective tests cannot be imported, so a brand-new lab needs its tests written in the content editor before its objectives can be completed.",
    el: "Πίνακας εκπαιδευτή -> Μονοπάτια εκμάθησης (JSON) -> Εισαγωγή. Τα εργαστήρια με id που ταιριάζει με ενσωματωμένο εργαστήριο επεξεργάζονται επί τόπου και κρατούν τους πραγματικούς ελέγχους τους· τα άγνωστα id γίνονται νέο περιεχόμενο συγγραφέα, οπότε ένα αρχείο μπορεί και να προσθέσει ολόκληρα νέα μονοπάτια. Οι έλεγχοι των στόχων δεν εισάγονται, οπότε ένα ολοκαίνουργιο εργαστήριο χρειάζεται τους ελέγχους του γραμμένους στον επεξεργαστή περιεχομένου πριν ολοκληρωθούν οι στόχοι του.",
  },
} as const;

/**
 * The effective catalogue — what a player actually sees — as plain JSON data.
 *
 * The filesystem is passed in rather than read here: the fixture tree lives in
 * the player-terminal module, which depends on the database layer, and this
 * module is imported by that same layer. Components sit above both, so they
 * supply the snapshot.
 */
export function buildCourseExport(
  overlay: ContentOverlay,
  now = new Date(),
  filesystem?: LabFileSeed[],
): CourseExport {
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
    // readme first so the file explains itself before any data.
    readme: COURSE_EXPORT_README,
    format: COURSE_EXPORT_FORMAT,
    version: COURSE_EXPORT_VERSION,
    exportedAt: now.toISOString(),
    note: NOTE,
    paths,
    // The sandbox the labs run in, so an imported file is playable on its own.
    ...(filesystem?.length ? { filesystem } : {}),
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

// ── Import ──────────────────────────────────────────────────────────────────
//
// An exported file is plain data; the overlay the app runs on is also plain
// data, so importing is a conversion rather than an evaluation. Nothing here
// executes code from the file.
//
// Objective tests are the one thing that cannot travel: they are closures. They
// come back as {kind:"builtin"}, which compileModule resolves by borrowing the
// real test from the shipped lab of the same id. That makes re-importing the
// built-in catalogue lossless, and makes a genuinely new lab's objectives
// never-complete until an educator writes their tests — which overlayIssues
// then reports.

const asBi = (value: unknown): Bi =>
  isRecord(value) && typeof value.en === "string" && typeof value.el === "string"
    ? { en: value.en, el: value.el }
    : { en: "", el: "" };

function authoredTaskFromExported(task: ExportedTask): AuthoredTask {
  return {
    id: task.id,
    instruction: task.instruction,
    hint: task.hint,
    explain: task.explain,
    reward: typeof task.reward === "number" ? task.reward : 5,
    ...(task.material ? { material: task.material } : {}),
    check: { kind: "builtin" },
  };
}

export function authoredModuleFromExported(module: ExportedModule): AuthoredModule {
  return {
    id: module.id,
    order: module.order,
    icon: module.icon,
    color: module.color,
    difficulty: module.difficulty,
    scenario: module.scenario ?? "lab",
    title: asBi(module.title),
    subtitle: asBi(module.subtitle),
    badge: asBi(module.badge),
    theory: module.theory.map((section, index) => ({
      id: `${module.id}-theory-${index}`,
      heading: asBi(section.heading),
      body: asBi(section.body),
      ...(section.tip ? { tip: asBi(section.tip) } : {}),
      ...(section.shots?.length ? { shots: section.shots.map((shot) => ({ ...shot })) } : {}),
      ...(section.visual ? { visual: structuredClone(section.visual) } : {}),
    })),
    cheats: module.cheats.map((cheat) => ({ cmd: cheat.cmd, desc: asBi(cheat.desc) })),
    tasks: module.tasks.map(authoredTaskFromExported),
    challenges: module.challenges.map((challenge, index) => ({
      id: `${module.id}-challenge-${index}`,
      title: asBi(challenge.title),
      brief: asBi(challenge.brief),
      success: asBi(challenge.success),
      check: { kind: "builtin" } as const,
    })),
    ...(module.files?.length
      ? {
          files: module.files.map((seed) => ({
            path: String(seed.path ?? ""),
            content: typeof seed.content === "string" ? seed.content : "",
            ...(seed.mode ? { mode: String(seed.mode) } : {}),
            ...(seed.owner ? { owner: String(seed.owner) } : {}),
            ...(seed.group ? { group: String(seed.group) } : {}),
          })),
        }
      : {}),
    ...(module.commands?.length
      ? {
          commands: module.commands.map((fixture) => ({
            command: String(fixture.command ?? ""),
            output: typeof fixture.output === "string" ? fixture.output : "",
            ...(Number.isFinite(Number(fixture.exit)) ? { exit: Number(fixture.exit) } : {}),
            ...(fixture.flag ? { flag: String(fixture.flag) } : {}),
          })),
        }
      : {}),
  };
}

export type CourseImportSummary = {
  paths: number;
  newPaths: number;
  labs: number;
  newLabs: number;
  /** Lab files carried into the sandbox, and command results carried with them. */
  files: number;
  commands: number;
  /** Files in the shared filesystem baseline the import replaces. */
  baselineFiles: number;
  objectives: number;
  /** Objectives on labs that do not exist in the shipped catalogue, so their
   *  tests could not be borrowed and must be authored before they can complete. */
  objectivesNeedingTests: number;
  quiz: number;
  assessment: number;
};

/**
 * Merge an exported catalogue into an overlay.
 *
 * A lab whose id matches a shipped lab is edited in place and keeps its real
 * objective tests. An unknown id becomes new authored content. A path whose id
 * is not one of the shipped paths is added to the overlay, so a file can
 * introduce whole new learning paths.
 */
export function buildOverlayFromCourseExport(
  exported: CourseExport,
  base: ContentOverlay,
): { overlay: ContentOverlay; summary: CourseImportSummary } {
  const modules: Record<string, AuthoredModule> = { ...base.modules };
  const paths: AuthoredPath[] = base.paths.map((path) => ({ ...path, moduleIds: [...path.moduleIds] }));
  const quiz: Record<string, QuizQ[]> = { ...(base.quizzes ?? {}) };
  const assessment: Record<string, AssessmentQ[]> = { ...(base.assessments ?? {}) };

  const summary: CourseImportSummary = {
    paths: 0, newPaths: 0, labs: 0, newLabs: 0, objectives: 0, objectivesNeedingTests: 0, quiz: 0, assessment: 0,
    files: 0, commands: 0, baselineFiles: 0,
  };

  for (const path of exported.paths) {
    summary.paths += 1;
    const shippedPath = LEARNING_PATHS.some((candidate) => candidate.id === path.id);

    for (const module of path.modules) {
      modules[module.id] = authoredModuleFromExported(module);
      summary.labs += 1;
      summary.objectives += module.tasks.length;
      if (!moduleById(module.id)) {
        summary.newLabs += 1;
        summary.objectivesNeedingTests += module.tasks.length;
      }
      if (module.quiz.length) {
        quiz[module.id] = module.quiz;
        summary.quiz += module.quiz.length;
      }
      if (module.assessment.length) {
        assessment[module.id] = module.assessment;
        summary.assessment += module.assessment.length;
      }
      summary.files += module.files?.length ?? 0;
      summary.commands += module.commands?.length ?? 0;
    }

    if (shippedPath) continue;
    const authoredPath: AuthoredPath = {
      id: path.id,
      title: asBi(path.title),
      subtitle: asBi(path.subtitle),
      blurb: asBi(path.blurb),
      scenario: path.scenario,
      accent: path.accent,
      moduleIds: path.modules.map((module) => module.id),
    };
    const existing = paths.findIndex((candidate) => candidate.id === authoredPath.id);
    if (existing >= 0) paths[existing] = authoredPath;
    else {
      paths.push(authoredPath);
      summary.newPaths += 1;
    }
  }

  // The baseline sandbox travels with the catalogue. A file that omits it
  // leaves the previous baseline in place rather than wiping it.
  const filesystem = Array.isArray(exported.filesystem)
    ? exported.filesystem.filter((seed) => seed && typeof seed.path === "string" && seed.path.startsWith("/"))
    : undefined;
  if (filesystem?.length) summary.baselineFiles = filesystem.length;

  return {
    overlay: {
      modules,
      paths,
      quizzes: quiz,
      assessments: assessment,
      ...(base.filesystem ? { filesystem: base.filesystem } : {}),
      ...(filesystem?.length ? { filesystem } : {}),
    },
    summary,
  };
}
