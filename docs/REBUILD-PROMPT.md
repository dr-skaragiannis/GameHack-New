# Rebuild Prompt — GameHack-style bilingual lab platform

Paste everything below the line into an LLM. It rebuilds the **platform** — the engine,
the data contracts, the authoring tools, the test harness — and deliberately ships **no
course content**. Sections 5–8 define exactly how learning paths, labs, quizzes and
assessments must be laid out so that content authored later drops straight in.

---

## 1. What you are building

A single-page, bilingual (English + Greek) cybersecurity training platform. Students work
inside a **simulated Linux terminal in the browser**; educators author and edit course
content from the web UI. There is no real shell and no real network — every command runs
against an in-memory virtual filesystem.

Two hard product rules:

1. **Nothing a student must read is English-only.** Every user-facing string is a
   `Bi = { en, el }` pair. Greek must be native-quality prose, not a literal translation.
2. **A lab is only "complete" when the student actually did the work.** Completion is a
   predicate over terminal state, never a button press.

## 2. Stack and constraints

- Node >= 22, React 19, Vite 7, TypeScript 5.9 (strict), Tailwind 4.
- `vite-plugin-singlefile` — the production build is **one self-contained `dist/index.html`**.
- State lives in `localStorage`, not a database. No server required for the app to run.
- Password hashing with `@noble/hashes` scrypt (N=16384, r=8, p=1, dkLen=64), stored as
  `scrypt$<32 hex salt>$<128 hex digest>`. Never store a password in clear.
- Charts via `recharts`. Optional server (`server/index.mjs`) only for email-backed
  registration/recovery; the client must work fully offline without it.

## 3. File layout

```
src/
  main.tsx                     React root
  App.tsx                      shell, navigation, view routing, role gating
  i18n.ts                      Lang, the flat UI dictionary, t(), bi(), uppercaseLabel()
  index.css                    Tailwind entry + component classes
  data/
    lessons.ts                 Bi + the shipped type contracts + LEARNING_PATHS
    quizzes.ts                 QUIZZES: Record<moduleId, QuizQ[]>
    assessments.ts             ASSESSMENTS: Record<moduleId, AssessmentQ[]>
    commandGuide.ts            CommandLesson[] — the in-app command library
    <topic>-lessons.ts         one file per authored topic, exporting Module[]
  lib/
    terminal.ts                the simulator: FileNode, Terminal, runCommand, usedCmd
    linuxCommandCatalog.ts     LinuxCommandInfo[] — name/category/summary/synopsis/example
    linuxCommandRuntime.ts     shared command implementations
    contentAuthoring.ts        serialisable authored-content model + compiler + validator
    catalog.ts                 memoised merge of shipped + authored content
    db.ts                      localStorage schema, auth, progress, metrics, badges
    passwordHash.ts            hashPassword / verifyPassword / isScryptHash
    quizProgress.ts            passesQuickQuiz
    useAuth.tsx                AuthProvider + useAuth
    playerTerminal.ts          per-player terminal persistence
  components/
    AuthScreen, HomePage, InteractiveMap, LearningMap, ModuleView, TerminalView,
    QuizPopup, AssessmentPopup, CommandResultPopup,
    ContentEditor, EducatorDashboard, PlayerDashboard, ProfileView, SettingsView,
    TeamsView, ActivityView, Tickets, Messages, BadgeModal, OverallScoreboardPopup, ...
scripts/
  test-*.mjs                   nine node test suites (section 9)
```

## 4. Core data contracts (authoritative — do not deviate)

```ts
export type Bi = { en: string; el: string };

export type Task = {
  id: string;
  instruction: Bi;      // what to achieve, never the command itself
  hint: Bi;             // may contain the exact command lines
  explain: Bi;          // why it worked, shown after completion
  check: (ctx: Terminal) => boolean;
  reward?: number;      // XP; a revealed hint subtracts HINT_XP_PENALTY (= 2)
  material?: Bi;        // optional extra reading an educator attaches
};

export type Section = {
  heading: Bi; body: Bi; tip?: Bi;
  shots?: Shot[]; visual?: SectionVisual;
};
export type Shot = { cmd?: string; caption?: Bi; lines: string[] };
export type SectionVisual = {
  kind: "chain" | "timeline" | "tree" | "table" | "network" | "hash"
      | "hex" | "layers" | "memory" | "document" | "spectrum" | "report";
  title: Bi; caption?: Bi; items: VisualItem[];
};

export type Challenge = {
  title: Bi; brief: Bi; success: Bi;
  check: (ctx: Terminal) => boolean;
};

export type Module = {                    // "Module" == one lab
  id: string; order: number; icon: string; color: string;
  title: Bi; subtitle: Bi;
  difficulty: 1 | 2 | 3 | 4 | 5;
  badge: Bi;
  theory: Section[];
  cheats: { cmd: string; desc: Bi }[];    // the lab's command sheet
  tasks: Task[];                          // the objectives
  challenges: [Challenge, Challenge];     // exactly two — the tuple type is deliberate
  tool?: "terminal" | "browser" | "both";
  scenario?: "lab" | "raven" | "ssh" | "sudorun" | "dfir";
};

export type Campaign = {                  // "Campaign" == one learning path
  id: string;
  pathNumber: number;                     // 1-based; see §5 for the uniqueness rules
  title: Bi; subtitle: Bi; blurb: Bi;
  scenario: "lab" | "raven" | "ssh" | "sudorun" | "dfir";
  accent: string;
  modules: Module[];
};
```

`scenario` selects the terminal fixture (filesystem, users, services, network) the lab
starts from. Adding a scenario means adding a fixture builder in `terminal.ts` and
registering it in `setTerminalScenario`.

## 5. How learning paths are laid out

- A learning path is a `Campaign` in the exported `LEARNING_PATHS: Campaign[]` array.
- The **visible** array must be dense and ascending: `LEARNING_PATHS.map(p => p.pathNumber)`
  is asserted to equal `[1, 2, 3, …n]`, so a gap or an out-of-order entry fails the build.
  Archived/off-map campaigns are a separate list and **may reuse numbers** — `pathNumber`
  is not globally unique across all campaigns, only within the visible array.
- Path `id`s are stable slugs (`linux-part-01`, `ssh-port-22`, `file-shares`). They are
  persisted in player progress and in `PATH_CERTIFICATION`, so **never rename an id** —
  add a new one instead.
- Each path owns an ordered `modules: Module[]`. Authored paths renumber `Module.order`
  from 1 inside the path (`[1, 2, …]`), and that is asserted — but nothing enforces that a
  given lab id appears on only one path, so keep lab ids unique yourself.
- Keep topic content in its own `src/data/<topic>-lessons.ts` exporting `Module[]`, and
  import it into `lessons.ts`. Never inline a whole topic into `lessons.ts`.
- Every path maps to a certification badge through `PATH_CERTIFICATION: Record<pathId, badgeId>`.
  Add the badge to `BADGES` with `category: "certification"`.

**Do not generate course content.** Ship `LEARNING_PATHS = []` (or one trivial sample lab
used only by the test harness) and make everything downstream tolerate an empty catalog.

## 6. How a lab (Module) is laid out

A lab is four fields on the `Module` plus two sibling records keyed by its id. Every
visible lab has all six:

| Part | Field | Minimum |
|---|---|---|
| Theory | `theory: Section[]` | ≥ 1 section; each needs a non-empty `heading` **and** `body` |
| Command sheet | `cheats` | every `cmd` must resolve in the command library (section 10) |
| Objectives | `tasks: Task[]` | ≥ 1; each with `instruction`, `hint`, `explain`, `check` |
| Final challenges | `challenges` | **exactly two**, both with a real `check` |
| Quiz | `QUIZZES[moduleId]` | exactly 3 questions **if an entry exists** (see §7) |
| Assessment | `ASSESSMENTS[moduleId]` | exactly 3 scenarios — **mandatory for every visible lab** |

Rules the harness enforces:

- **`instruction` states a goal; `hint` may contain the literal command.** A student who
  never opens the hint should still be able to finish. The harness replays *every line* of
  `hint.en` against a fresh terminal and asserts the objective's `check` passes — so a hint
  that does not actually complete its own objective is a build failure.
- **The two challenges must be completable.** The harness replays them the same way. If a
  challenge needs more than the objectives give, write the extra commands into
  `brief`/`success` so the replay can find them.
- **A finished objective collapses** behind a "Show objective" control instead of staying
  expanded.
- **No accented Greek capital, anywhere in a label.** The harness runs
  `assert.doesNotMatch(label, /[ΆΈΉΊΌΎΏΪΫ]/)` over each module's `title.el`,
  `subtitle.el`, `badge.el` and every theory `heading.el`. Greek capitals conventionally
  drop the tonos (see `uppercaseLabel`), so `Άσκηση` is wrong and `Ασκηση` is right. Note
  this is a whole-string scan, not a leading-character check.
- **Every theory section body needs at least two paragraphs** in each language, split on a
  blank line. A one-paragraph section fails the build.

## 7. How quizzes are laid out

```ts
export type QuizQ = {
  q: Bi;
  choices: Bi[];      // exactly 4
  answer: number;     // index into choices
  why: Bi;            // the explanation shown after answering
};
export const QUIZZES: Record<string, QuizQ[]> = {};   // keyed by module id
```

- Keyed by that lab's `Module.id`. If an entry exists it must hold exactly **3 questions**;
  unlike assessments, a lab with no quiz entry is legal (an educator-authored lab typically
  has none) — see the completion rule below.
- 4 choices, all bilingual, `answer` a valid index.
- Quizzes test **recall of what the lab taught**. They are allowed to name commands.
- Passing threshold is `passesQuickQuiz(score, total) === score >= ceil(2 * total / 3)`,
  i.e. 2 of 3. Out-of-range or non-integer input returns `false`.
- A lab with **no quiz** must still be completable: when `total === 0`,
  `passesQuickQuiz(0, 0)` is `false`, so completion must fall through to a direct
  "Mark lab complete" path rather than dead-ending on an empty quiz.

## 8. How assessments are laid out

```ts
export type AssessmentQ = {
  scenario: Bi;       // the situation — this field is what makes it an assessment
  q: Bi;
  choices: Bi[];      // exactly 4
  answer: number;
  why: Bi;
};
export const ASSESSMENTS: Record<string, AssessmentQ[]> = {};   // keyed by module id
```

- Exactly **3 scenarios per lab**, keyed by `Module.id`.
- **An assessment is never a command exercise.** The lab's hints already tell the student
  what to type; an assessment asks what they would *decide* with no terminal in front of
  them — audit findings, conflicting evidence, pressure to cut a corner, the boundary of
  what they are authorised to touch.
- Two mechanical rules, both enforced:
  1. An assessment `q` must **not** duplicate any quiz `q` in the same lab (compared
     per language).
  2. Assessment text must **not** contain any multi-token command (≥ 5 chars) drawn from
     that lab's `cheats[].cmd` or task hints. Describing an action in prose is fine;
     reproducing the incantation is not.
- The correct answer should be the *defensible* one, and the distractors should be
  plausible professional shortcuts, not jokes. `why` states the principle, not the rule.

## 9. Authoring model (educators edit content in the app)

Shipped `check`s are real functions and cannot be serialised. Authored content is
therefore **plain data**, compiled at load time. No `eval`, no code strings from storage.

```ts
export type AuthoredCheck =
  | { kind: "command"; pattern: string }                        // regex over commands run
  | { kind: "flag"; name: string }                              // simulator set a flag
  | { kind: "fileRead"; path: string }                          // student read this file
  | { kind: "commandAndFile"; pattern: string; path: string }
  | { kind: "builtin" }                                         // keep the shipped test
  | { kind: "unset" };                                          // never completes; flagged

export type AuthoredTask = {
  id: string; instruction: Bi; hint: Bi; explain: Bi;
  reward: number; material?: Bi; check: AuthoredCheck;
};
export type AuthoredModule = {
  id: string; order: number; icon: string; color: string;
  difficulty: 1|2|3|4|5; scenario: Module["scenario"];
  title: Bi; subtitle: Bi; badge: Bi;
  theory: AuthoredSection[]; cheats: AuthoredCheat[];
  tasks: AuthoredTask[]; challenges: AuthoredChallenge[];
};
export type AuthoredPath = {
  id: string; title: Bi; subtitle: Bi; blurb: Bi;
  scenario: Campaign["scenario"]; accent: string; moduleIds: string[];
};
export type ContentOverlay = {
  modules: Record<string, AuthoredModule>;   // authored replacement, keyed by module id
  paths: AuthoredPath[];                     // educator-created paths, display order
};
```

Requirements:

- `compileCheck(spec, fallback?)` turns a spec into a predicate. `unset` returns
  `() => false`; `builtin` falls back to the shipped test or `() => false`.
- `overlayIssues(overlay)` returns per-lab problems the educator must fix. Emit **codes**,
  never English sentences, and render them through i18n so both languages get real prose:
  `noTitle`, `noTheory`, `theoryNoHeading`, `theoryNoBody`, `noObjectives`,
  `objectiveNoInstruction`, `objectiveNoTest`, `objectiveBadBuiltin`, `objectiveBadXp`,
  `needsTwoChallenges`, `challengeNoTest`, `challengeBadBuiltin`.
- `catalog.ts` exposes `learningPaths()`, `moduleById()`, `invalidateCatalog()` and merges
  shipped + authored content. **Every screen renders from the catalog, never from the
  shipped constant.** Memoise the merge and invalidate on save.
- Guard the three ways authored content silently disappears: a new lab must be listed on
  its path; committing a lab must not re-derive the draft from the pre-commit overlay and
  mint an orphan; deleting a lab must remove its id from every path that listed it.
- The overlay is stored inside the DB record and sanitised on read: clamp XP, default an
  unrecognised check to `unset`, drop a corrupt path list. Corrupt storage must degrade to
  the shipped catalog, never crash.

## 10. The simulator

`terminal.ts` owns the virtual machine. The `Terminal` object is the single source of
truth for completion checks:

```ts
export type Terminal = {
  user: string; host: string; cwd: string;
  ran: string[];            // raw commands, in order
  history: string[]; lines: TermLine[];
  fs: FileNode;             // the virtual filesystem
  env: Record<string,string>; shellVars: Record<string,string>;
  flags: Set<string>;       // simulators signal progress by setting a named flag
  filesRead: string[];      // resolved paths the student actually read
  hosts: HostInfo[]; creds: {user,pass,service}[];
  isRoot: boolean; lastExit: number; scenario: string;
  net: { ip; mask; bcast; mac; up };
  procs: Proc[]; jobs: {pid,cmd}[]; atQueue: {id,time,command}[];
  services: Record<string, "running"|"stopped"|"inactive">;
  bootServices: Record<string, "enabled"|"disabled">;
  packages: Set<string>; crontab: string[];
  ftp: {...} | null; smb: {...} | null; sshReturn: {...} | null;
  activeModuleId?: string;
};
```

- `runCommand(t, raw, inner?)` returns `TermLine[]` where
  `TermLine = { kind: "in"|"out"|"err"|"ok"|"sys"; text: string }`.
- `usedCmd(t, re)` tests whether a matching command was run — the basis of the
  `command` check flavour.
- Unknown commands must exit non-zero with a shell-like message, **never throw**.
- Every command advertised in `linuxCommandCatalog.ts` must produce output in every
  scenario fixture, must not exit 127, and must not emit an `err` line for its advertised
  `example`. A test walks the whole catalog and asserts this, so an advertised-but-
  unimplemented command is a build failure.
- Permission checks are real: a non-root user cannot read `-rw-------` or enter
  `drwx------`. Path traversal outside the simulated roots is blocked.

The **command library** (`commandGuide.ts`) is separate from the simulator:

```ts
export type CommandLesson = {
  key: string; aliases: string[];
  title: Bi; purpose: Bi; mechanics: Bi; output: Bi;
  syntax: string; example: string; caution?: Bi;
};
```

Every `cmd` in every lab's `cheats` must resolve through `commandLessonForLabel`, so that
running a command the course teaches never yields "no entry yet". Cover the awkward label
shapes explicitly: running a script by path, `COMMAND &`, subcommand-style tools,
environment-variable prefixes, and pipelines.

## 11. Storage, auth, roles

- One `localStorage` key, versioned (e.g. `gamehack.platform.v1`), plus a legacy key the
  loader migrates from. All reads go through `normalizeStoredDB`, which repairs partial or
  corrupt records.
- `Role = "player" | "educator"`. `User` carries `progress: Record<moduleId, ModProgress>`,
  `metrics`, `badges`, `lang`, and UI preferences.
- `ModProgress = { completed, done: string[], startedAt?, completedAt?, hinted?, assessed? }`.
  `done` holds objective ids; `assessed` flips when the student passes the lab assessment.
- **Two logins must always work**, on every load, whether the DB is freshly seeded or
  restored: a demo player and an instructor. A missing account is recreated and a password
  that no longer verifies is reset, so a shared classroom login cannot be locked out. Store
  both as scrypt hashes. The login screen advertises **only** the player demo; the
  instructor credential is never rendered anywhere in `src/`.
- Educators get teams, applications, approvals, analytics, and the authoring tab.
- The command audit log is capped (500 entries, 2400 output chars each) and run through
  `redactCommandSecrets`, which rewrites `--password`, `--token`, `--secret`, `--api-key`,
  `key=value` forms and `sshpass -p` to `[REDACTED]`. Note this redacts **secrets in the
  command text**, not student identity — educator analytics show real names and usernames.

## 12. i18n

- `Lang = "en" | "el"`. One **flat** dictionary object keyed by string; `t(key, lang)`
  returns the key itself when a key is missing — which means a typo is silent, so every
  `t("...")` call must be cross-checked against the defined keys.
- `bi(v, lang)` returns `v[lang] || v.en` — English is the fallback for an empty string.
- `uppercaseLabel(text, lang)` is misnamed: **it does not uppercase.** For `el` it strips
  the tonos while keeping the dialytika (`Συνέχεια μάθησης` → `Συνεχεια μαθησης`,
  `ΐδιο` → `ϊδιο`); for `en` it returns the text unchanged. The actual capitalisation comes
  from a CSS `uppercase` class applied alongside it. This pairing is the whole point: CSS
  uppercasing `Άσκηση` yields `ΆΣΚΗΣΗ`, and a tonos on a Greek capital is a typographic
  error, so the tonos must be removed *before* CSS transforms the string.
- Duplicate keys in a flat object silently win-last. Scan for duplicates before adding.

## 13. Test harness — nine suites, all must pass

Write these as plain `node scripts/test-*.mjs` using `node:assert/strict`. Load app code
with Vite's SSR API so the real modules are exercised, never a re-implementation:

```js
const server = await createServer({
  configFile: false, logLevel: "silent",
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true }, appType: "custom",
});
const mod = await server.ssrLoadModule("/src/data/lessons.ts");
```

For DOM tests use `jsdom` + `createRoot` + `act`, and stub `matchMedia`,
`ResizeObserver`, `scrollTo`, `scrollIntoView`, and `fetch`. **Never assign
`globalThis.navigator`** — it is a read-only getter in Node 22.

| Suite | Must prove |
|---|---|
| `test:linux` | every advertised command example runs in every scenario, no 127, no `err`; path ids dense 1..n; every task hint completes its own check; every `cheats[].cmd` resolves in the command library |
| `test:progression` | every quiz entry holds exactly 3 questions; **every visible lab** has exactly 3 assessment scenarios; both bilingual with 4 choices and a valid answer; no assessment `q` reuses a quiz `q`; no assessment text contains a lab command; level curve; Greek uppercase rules |
| `test:challenges` | every final challenge completes, replayed from its own brief |
| `test:completion` | a lab with no quiz completes directly; a quiz-backed lab still routes through its quiz |
| `test:authoring` | snapshot → compile round-trip for a shipped lab; edits take effect; every check flavour resolves against a real terminal; new path gets the next `pathNumber`; corrupt storage sanitises safely |
| `test:editor` | drives the real editor in jsdom: create a path, write a lab, reach the player catalog, delete without dangling refs, bilingual warnings |
| `test:educator` | teams, applications, approvals, secret redaction in the command audit log, storage migration, saved-path continuity |
| `test:demo` | both guaranteed logins work and are hashed; deleting them from storage restores them; a drifted password heals; a real `AuthScreen` render shows the player demo and no trace of the instructor credential |
| `test:auth` | registration, recovery-key login and rotation, password changes |

## 14. Definition of done

1. `npx tsc --noEmit` exits 0.
2. All nine suites pass.
3. `npm run build` produces a single self-contained `dist/index.html`.
4. The app boots with an **empty catalog** and every screen tolerates it.
5. Dropping a well-formed `Campaign` into `LEARNING_PATHS`, plus matching `QUIZZES` and
   `ASSESSMENTS` entries keyed by each `Module.id`, makes it appear in the map, the
   dashboard and the scoreboard with no further code changes.

That last point is the real acceptance test: **the platform is correct when content is
purely additive.**
