import { useMemo, useState } from "react";
import { LEARNING_PATHS } from "../data/lessons";
import {
  emptyBi,
  emptyModule,
  emptyPath,
  emptySection,
  emptyTask,
  overlayIssues,
  snapshotModule,
  type AuthoredChallenge,
  type AuthoredCheck,
  type AuthoredModule,
  type AuthoredPath,
  type AuthoredSection,
  type AuthoredTask,
  type ContentOverlay,
} from "../lib/contentAuthoring";
import { t, type Lang } from "../i18n";
import { moduleById } from "../data/lessons";

const ICONS = ["terminal", "cpu", "lock", "key", "share", "hard-drive", "folder", "shield", "radar", "scan", "globe", "layers", "database", "book", "settings", "file-text"];
const COLORS = ["from-cyan-400 to-sky-900", "from-emerald-400 to-green-900", "from-violet-400 to-purple-900", "from-amber-400 to-orange-900", "from-rose-400 to-red-900", "from-lime-400 to-teal-900"];
const SCENARIOS = ["lab", "raven", "ssh", "sudorun", "dfir"] as const;

function Field({ label, value, onChange, placeholder, type = "text" }: {
  label: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="content-field">
      <span>{label}</span>
      <input type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Area({ label, value, onChange, rows = 3 }: { label: string; value: string; onChange: (next: string) => void; rows?: number }) {
  return (
    <label className="content-field">
      <span>{label}</span>
      <textarea rows={rows} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

/** English + Greek pair, so authored content stays bilingual like the shipped lessons. */
function BiField({ label, value, onChange, rows = 2 }: {
  label: string;
  value: { en: string; el: string };
  onChange: (next: { en: string; el: string }) => void;
  rows?: number;
}) {
  return (
    <div className="content-bi">
      <Area label={`${label} — EN`} value={value.en} rows={rows} onChange={(next) => onChange({ ...value, en: next })} />
      <Area label={`${label} — EL`} value={value.el} rows={rows} onChange={(next) => onChange({ ...value, el: next })} />
    </div>
  );
}

function CheckEditor({ lang, label, value, onChange, allowBuiltin }: {
  lang: Lang;
  label: string;
  value: AuthoredCheck;
  onChange: (next: AuthoredCheck) => void;
  allowBuiltin: boolean;
}) {
  const kinds = allowBuiltin
    ? ["builtin", "command", "flag", "fileRead", "commandAndFile", "unset"]
    : ["command", "flag", "fileRead", "commandAndFile", "unset"];
  return (
    <div className="content-field">
      <span>{label}</span>
      <div className="content-check">
        <select
          value={kinds.includes(value.kind) ? value.kind : "unset"}
          onChange={(event) => {
            const kind = event.target.value as AuthoredCheck["kind"];
            if (kind === "command") onChange({ kind, pattern: "" });
            else if (kind === "commandAndFile") onChange({ kind, pattern: "", path: "" });
            else if (kind === "flag") onChange({ kind, name: "" });
            else if (kind === "fileRead") onChange({ kind, path: "" });
            else onChange({ kind } as AuthoredCheck);
          }}
        >
          {kinds.map((kind) => (
            <option key={kind} value={kind}>{t(`checkKind_${kind}`, lang)}</option>
          ))}
        </select>
        {value.kind === "command" && (
          <input value={value.pattern} placeholder="^\\s*nmap\\s+-sV" onChange={(event) => onChange({ kind: "command", pattern: event.target.value })} />
        )}
        {value.kind === "commandAndFile" && (
          <>
            <input value={value.pattern} placeholder="^\\s*cat\\s+" onChange={(event) => onChange({ ...value, pattern: event.target.value })} />
            <input value={value.path} placeholder="/etc/exports" onChange={(event) => onChange({ ...value, path: event.target.value })} />
          </>
        )}
        {value.kind === "flag" && (
          <input value={value.name} placeholder="nmap-ssh" onChange={(event) => onChange({ kind: "flag", name: event.target.value })} />
        )}
        {value.kind === "fileRead" && (
          <input value={value.path} placeholder="sshd_config" onChange={(event) => onChange({ kind: "fileRead", path: event.target.value })} />
        )}
        {value.kind === "builtin" && <p className="content-note">{t("checkBuiltinNote", lang)}</p>}
        {value.kind === "unset" && <p className="content-note content-note--warn">{t("checkUnsetNote", lang)}</p>}
      </div>
    </div>
  );
}

export default function ContentEditor({ lang, overlay, onCommit }: {
  lang: Lang;
  overlay: ContentOverlay;
  onCommit: (next: ContentOverlay, message: string) => void;
}) {
  const [pathId, setPathId] = useState<string | null>(null);
  const [moduleId, setModuleId] = useState<string | null>(null);
  const [draft, setDraft] = useState<AuthoredModule | null>(null);
  const [pathDraft, setPathDraft] = useState<AuthoredPath | null>(null);

  const issues = useMemo(() => overlayIssues(overlay), [overlay]);
  const issueFor = (id: string) => issues.find((entry) => entry.moduleId === id)?.issues || [];

  const authoredPath = overlay.paths.find((path) => path.id === pathId) || null;

  /** Open a lab for editing: the authored copy if there is one, else a snapshot of the shipped lab. */
  const openModule = (id: string) => {
    setModuleId(id);
    setDraft(overlay.modules[id] ? structuredClone(overlay.modules[id]) : (() => {
      const shipped = moduleById(id);
      return shipped ? snapshotModule(shipped) : emptyModule(1);
    })());
  };

  const saveDraft = () => {
    if (!draft) return;
    onCommit({ ...overlay, modules: { ...overlay.modules, [draft.id]: structuredClone(draft) } }, t("saved", lang));
  };

  const revertDraft = () => {
    if (!moduleId) return;
    setDraft(overlay.modules[moduleId] ? structuredClone(overlay.modules[moduleId]) : (() => {
      const shipped = moduleById(moduleId);
      return shipped ? snapshotModule(shipped) : null;
    })());
  };

  const discardDraft = () => {
    if (!draft) return;
    const rest = { ...overlay.modules };
    delete rest[draft.id];
    // Drop the lab from any path that listed it, so no path keeps a dead id.
    const paths = overlay.paths.map((path) =>
      path.moduleIds.includes(draft.id)
        ? { ...path, moduleIds: path.moduleIds.filter((id) => id !== draft.id) }
        : path,
    );
    if (pathDraft?.moduleIds.includes(draft.id)) {
      setPathDraft({ ...pathDraft, moduleIds: pathDraft.moduleIds.filter((id) => id !== draft.id) });
    }
    onCommit({ modules: rest, paths }, t("saved", lang));
    setDraft(null);
    setModuleId(null);
  };

  const addLab = () => {
    if (!authoredPath) return;
    const created = emptyModule(authoredPath.moduleIds.length + 1);
    const moduleIds = [...authoredPath.moduleIds, created.id];
    // The lab has to be listed on the path in the same commit, otherwise the
    // player-facing catalog compiles the path without it.
    onCommit(
      {
        modules: { ...overlay.modules, [created.id]: created },
        paths: overlay.paths.map((path) => (path.id === authoredPath.id ? { ...path, moduleIds } : path)),
      },
      t("saved", lang),
    );
    setPathDraft({ ...authoredPath, moduleIds });
    // Open the lab that was just committed, not a re-derived one: openModule
    // reads the overlay prop, which is still the pre-commit copy here, so it
    // would mint a second lab the path never lists.
    setModuleId(created.id);
    setDraft(structuredClone(created));
  };

  const addPath = () => {
    const created = emptyPath();
    onCommit({ ...overlay, paths: [...overlay.paths, created] }, t("saved", lang));
    setPathId(created.id);
    setPathDraft(created);
    setModuleId(null);
    setDraft(null);
  };

  const savePathDraft = () => {
    if (!pathDraft) return;
    onCommit({ ...overlay, paths: overlay.paths.map((path) => (path.id === pathDraft.id ? { ...pathDraft } : path)) }, t("saved", lang));
  };

  const removePath = () => {
    if (!authoredPath) return;
    const rest = { ...overlay.modules };
    for (const id of authoredPath.moduleIds) delete rest[id];
    onCommit({ ...overlay, modules: rest, paths: overlay.paths.filter((path) => path.id !== authoredPath.id) }, t("saved", lang));
    setPathId(null);
    setPathDraft(null);
    setModuleId(null);
    setDraft(null);
  };

  const patchDraft = (patch: Partial<AuthoredModule>) => setDraft((current) => (current ? { ...current, ...patch } : current));

  const patchTask = (index: number, patch: Partial<AuthoredTask>) =>
    setDraft((current) => current && { ...current, tasks: current.tasks.map((task, i) => (i === index ? { ...task, ...patch } : task)) });

  const patchSection = (index: number, patch: Partial<AuthoredSection>) =>
    setDraft((current) => current && { ...current, theory: current.theory.map((section, i) => (i === index ? { ...section, ...patch } : section)) });

  const patchChallenge = (index: number, patch: Partial<AuthoredChallenge>) =>
    setDraft((current) => current && { ...current, challenges: current.challenges.map((challenge, i) => (i === index ? { ...challenge, ...patch } : challenge)) });

  return (
    <section className="educator-card content-editor" aria-labelledby="content-editor-title">
      <div className="educator-card__head">
        <div>
          <div className="educator-eyebrow">{t("courseAuthoringEyebrow", lang)}</div>
          <h2 id="content-editor-title">{t("courseAuthoring", lang)}</h2>
          <p className="content-lede">{t("courseAuthoringLede", lang)}</p>
        </div>
      </div>

      {issues.length > 0 && (
        <div className="content-issues" role="status">
          <strong>{t("contentIssues", lang)}</strong>
          <ul>
            {issues.flatMap((entry) => entry.issues.map((issue) => <li key={`${entry.moduleId}-${issue}`}>{entry.moduleId}: {issue}</li>))}
          </ul>
        </div>
      )}

      <div className="content-columns">
        <div className="content-pane">
          <h3>{t("learningPaths", lang)}</h3>
          <ul className="content-list">
            {LEARNING_PATHS.map((path) => (
              <li key={path.id}>
                <button
                  type="button"
                  className={pathId === path.id ? "is-active" : ""}
                  onClick={() => { setPathId(path.id); setPathDraft(null); setModuleId(null); setDraft(null); }}
                >
                  {path.pathNumber}. {path.title[lang] || path.title.en}
                </button>
              </li>
            ))}
            {overlay.paths.map((path, index) => (
              <li key={path.id}>
                <button
                  type="button"
                  className={pathId === path.id ? "is-active" : ""}
                  onClick={() => { setPathId(path.id); setPathDraft(path); setModuleId(null); setDraft(null); }}
                >
                  {LEARNING_PATHS.length + index + 1}. {path.title[lang] || path.title.en || t("untitledPath", lang)}
                  <span className="content-tag">{t("authored", lang)}</span>
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className="educator-primary-button" onClick={addPath}>{t("newLearningPath", lang)}</button>
        </div>

        <div className="content-pane">
          {authoredPath && pathDraft ? (
            <>
              <h3>{t("editPath", lang)}</h3>
              <BiField label={t("pathTitle", lang)} value={pathDraft.title} onChange={(title) => setPathDraft({ ...pathDraft, title })} />
              <BiField label={t("pathSubtitle", lang)} value={pathDraft.subtitle} onChange={(subtitle) => setPathDraft({ ...pathDraft, subtitle })} />
              <BiField label={t("pathBlurb", lang)} value={pathDraft.blurb} rows={3} onChange={(blurb) => setPathDraft({ ...pathDraft, blurb })} />
              <div className="content-row">
                <label className="content-field">
                  <span>{t("scenario", lang)}</span>
                  <select value={pathDraft.scenario} onChange={(event) => setPathDraft({ ...pathDraft, scenario: event.target.value as AuthoredPath["scenario"] })}>
                    {SCENARIOS.map((scenario) => <option key={scenario} value={scenario}>{scenario}</option>)}
                  </select>
                </label>
                <Field label={t("accent", lang)} value={pathDraft.accent} onChange={(accent) => setPathDraft({ ...pathDraft, accent })} />
              </div>
              <div className="content-actions">
                <button type="button" className="educator-primary-button" onClick={savePathDraft}>{t("savePath", lang)}</button>
                <button type="button" className="content-danger" onClick={removePath}>{t("deletePath", lang)}</button>
              </div>

              <h3>{t("labsInPath", lang)}</h3>
              <ul className="content-list">
                {pathDraft.moduleIds.map((id) => {
                  const authored = overlay.modules[id];
                  return (
                    <li key={id}>
                      <button type="button" className={moduleId === id ? "is-active" : ""} onClick={() => openModule(id)}>
                        {authored?.title[lang] || authored?.title.en || id}
                        {issueFor(id).length > 0 && <span className="content-tag content-tag--warn">{issueFor(id).length}</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <button type="button" className="educator-primary-button" onClick={addLab}>{t("newLab", lang)}</button>
            </>
          ) : pathId ? (
            <>
              <h3>{t("labsInPath", lang)}</h3>
              <p className="content-lede">{t("shippedPathNote", lang)}</p>
              <ul className="content-list">
                {(LEARNING_PATHS.find((path) => path.id === pathId)?.modules || []).map((module) => (
                  <li key={module.id}>
                    <button type="button" className={moduleId === module.id ? "is-active" : ""} onClick={() => openModule(module.id)}>
                      {module.title[lang] || module.title.en}
                      {overlay.modules[module.id] && <span className="content-tag">{t("edited", lang)}</span>}
                      {issueFor(module.id).length > 0 && <span className="content-tag content-tag--warn">{issueFor(module.id).length}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="content-lede">{t("pickAPath", lang)}</p>
          )}
        </div>
      </div>

      {draft && (
        <div className="content-lab">
          <h3>{t("editLab", lang)} — {draft.title[lang] || draft.title.en || draft.id}</h3>
          <div className="content-row">
            <BiField label={t("labTitle", lang)} value={draft.title} onChange={(title) => patchDraft({ title })} />
            <BiField label={t("labSubtitle", lang)} value={draft.subtitle} onChange={(subtitle) => patchDraft({ subtitle })} />
            <BiField label={t("labBadge", lang)} value={draft.badge} onChange={(badge) => patchDraft({ badge })} />
          </div>
          <div className="content-row">
            <label className="content-field">
              <span>{t("icon", lang)}</span>
              <select value={draft.icon} onChange={(event) => patchDraft({ icon: event.target.value })}>
                {ICONS.map((icon) => <option key={icon} value={icon}>{icon}</option>)}
              </select>
            </label>
            <label className="content-field">
              <span>{t("colour", lang)}</span>
              <select value={draft.color} onChange={(event) => patchDraft({ color: event.target.value })}>
                {COLORS.map((color) => <option key={color} value={color}>{color}</option>)}
              </select>
            </label>
            <label className="content-field">
              <span>{t("difficulty", lang)}</span>
              <select value={draft.difficulty} onChange={(event) => patchDraft({ difficulty: Number(event.target.value) as AuthoredModule["difficulty"] })}>
                {[1, 2, 3, 4, 5].map((level) => <option key={level} value={level}>{level}</option>)}
              </select>
            </label>
            <label className="content-field">
              <span>{t("scenario", lang)}</span>
              <select value={draft.scenario} onChange={(event) => patchDraft({ scenario: event.target.value as AuthoredModule["scenario"] })}>
                {SCENARIOS.map((scenario) => <option key={scenario} value={scenario}>{scenario}</option>)}
              </select>
            </label>
          </div>

          <h3>{t("theory", lang)}</h3>
          {draft.theory.map((section, index) => (
            <div key={section.id} className="content-block">
              <div className="content-block__head">
                <strong>{t("theorySection", lang)} {index + 1}</strong>
                <button type="button" className="content-danger" onClick={() => patchDraft({ theory: draft.theory.filter((_, i) => i !== index) })}>
                  {t("remove", lang)}
                </button>
              </div>
              <BiField label={t("heading", lang)} value={section.heading} onChange={(heading) => patchSection(index, { heading })} />
              <BiField label={t("body", lang)} value={section.body} rows={6} onChange={(body) => patchSection(index, { body })} />
              <BiField label={t("tip", lang)} value={section.tip || emptyBi()} rows={2} onChange={(tip) => patchSection(index, { tip })} />
            </div>
          ))}
          <button type="button" className="educator-primary-button" onClick={() => patchDraft({ theory: [...draft.theory, emptySection()] })}>
            {t("addTheorySection", lang)}
          </button>

          <h3>{t("cheats", lang)}</h3>
          {draft.cheats.map((cheat, index) => (
            <div key={`${cheat.cmd}-${index}`} className="content-row content-row--tight">
              <Field label={t("command", lang)} value={cheat.cmd} onChange={(cmd) => patchDraft({ cheats: draft.cheats.map((entry, i) => (i === index ? { ...entry, cmd } : entry)) })} />
              <BiField label={t("description", lang)} value={cheat.desc} rows={1} onChange={(desc) => patchDraft({ cheats: draft.cheats.map((entry, i) => (i === index ? { ...entry, desc } : entry)) })} />
              <button type="button" className="content-danger" onClick={() => patchDraft({ cheats: draft.cheats.filter((_, i) => i !== index) })}>
                {t("remove", lang)}
              </button>
            </div>
          ))}
          <button
            type="button"
            className="educator-primary-button"
            onClick={() => patchDraft({ cheats: [...draft.cheats, { cmd: "", desc: emptyBi() }] })}
          >
            {t("addCommand", lang)}
          </button>

          <h3>{t("objectives", lang)}</h3>
          {draft.tasks.map((task, index) => (
            <div key={task.id} className="content-block">
              <div className="content-block__head">
                <strong>{t("objective", lang)} {index + 1}</strong>
                <span className="content-xp">{t("xp", lang)}: {task.reward}</span>
                <button type="button" className="content-danger" onClick={() => patchDraft({ tasks: draft.tasks.filter((_, i) => i !== index) })}>
                  {t("remove", lang)}
                </button>
              </div>
              <BiField label={t("instruction", lang)} value={task.instruction} onChange={(instruction) => patchTask(index, { instruction })} />
              <BiField label={t("hint", lang)} value={task.hint} onChange={(hint) => patchTask(index, { hint })} />
              <BiField label={t("whyHow", lang)} value={task.explain} rows={3} onChange={(explain) => patchTask(index, { explain })} />
              <BiField label={t("additionalMaterial", lang)} value={task.material || emptyBi()} rows={3} onChange={(material) => patchTask(index, { material })} />
              <div className="content-row">
                <label className="content-field content-field--narrow">
                  <span>{t("xpReward", lang)}</span>
                  <input
                    type="number"
                    min={0}
                    max={999}
                    value={task.reward}
                    onChange={(event) => patchTask(index, { reward: Math.max(0, Math.min(999, Number(event.target.value) || 0)) })}
                  />
                </label>
                <CheckEditor
                  lang={lang}
                  label={t("completionTest", lang)}
                  value={task.check}
                  allowBuiltin={!!moduleById(draft.id)?.tasks.some((candidate) => candidate.id === task.id)}
                  onChange={(check) => patchTask(index, { check })}
                />
              </div>
            </div>
          ))}
          <button type="button" className="educator-primary-button" onClick={() => patchDraft({ tasks: [...draft.tasks, emptyTask()] })}>
            {t("addObjective", lang)}
          </button>

          <h3>{t("finalChallenges", lang)}</h3>
          {draft.challenges.slice(0, 2).map((challenge, index) => (
            <div key={challenge.id} className="content-block">
              <div className="content-block__head"><strong>{t("challenge", lang)} {index + 1}</strong></div>
              <BiField label={t("challengeTitle", lang)} value={challenge.title} onChange={(title) => patchChallenge(index, { title })} />
              <BiField label={t("challengeBrief", lang)} value={challenge.brief} rows={3} onChange={(brief) => patchChallenge(index, { brief })} />
              <BiField label={t("challengeSuccess", lang)} value={challenge.success} rows={2} onChange={(success) => patchChallenge(index, { success })} />
              <CheckEditor
                lang={lang}
                label={t("completionTest", lang)}
                value={challenge.check}
                allowBuiltin={index < (moduleById(draft.id)?.challenges.length || 0)}
                onChange={(check) => patchChallenge(index, { check })}
              />
            </div>
          ))}

          <div className="content-actions content-actions--sticky">
            <button type="button" className="educator-primary-button" onClick={saveDraft}>{t("saveLab", lang)}</button>
            <button type="button" onClick={revertDraft}>{t("revert", lang)}</button>
            {overlay.modules[draft.id] && (
              <button type="button" className="content-danger" onClick={discardDraft}>{t("deleteLab", lang)}</button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
