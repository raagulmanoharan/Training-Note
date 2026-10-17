import { useEffect, useRef, useState } from "react";
import {
  Dumbbell,
  Check,
  ChevronRight,
  Download,
  Upload,
  ShieldCheck,
  ArrowLeftRight,
  Plus,
  Minus,
  RotateCcw,
} from "lucide-react";
import {
  readState,
  saveState,
  exportBackup,
  importBackup,
  requestPersistence,
  inspectBackup,
  type PersonalState,
  type PersonalExercise,
  type PersonalWorkout,
  type PersonalSet,
  type MuscleGroup,
  type Unit,
} from "./personalStore";
import "./personal.css";
import {
  groups,
  exercises as catalogExercises,
  type CatalogExercise,
} from "./personalCatalog";
import {
  generatePlan,
  suggestSwap,
  progression,
  availableTargets,
} from "./personalLogic";

const uid = () => crypto.randomUUID();
const date = (v: string) =>
  new Date(v).toLocaleDateString(undefined, { month: "short", day: "numeric" });
const actual = (s: PersonalSet, u: Unit) => `${s.weight} ${u} × ${s.reps}`;
export default function PersonalApp() {
  const [state, setState] = useState<PersonalState | null>(null),
    [loadingError, setLoadingError] = useState(""),
    [tab, setTab] = useState<"today" | "progress" | "backup">("today");
  const [selected, setSelected] = useState<MuscleGroup[]>([]),
    [count, setCount] = useState(4),
    [plan, setPlan] = useState<PersonalWorkout | null>(null),
    [swapId, setSwapId] = useState<string | null>(null);
  const [status, setStatus] = useState<"saved" | "saving" | "error">("saved"),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [finishing, setFinishing] = useState(false);
  const [edit, setEdit] = useState<{
      exercise: string;
      set: string;
      workout?: string;
      weight: string;
      reps: string;
    } | null>(null),
    [undo, setUndo] = useState<{
      exercise: string;
      set: PersonalSet;
      index: number;
    } | null>(null);
  const [backupText, setBackupText] = useState(""),
    [persistence, setPersistence] = useState("Not requested"),
    [offline, setOffline] = useState(false),
    [backupPreview, setBackupPreview] = useState<{
      workouts: number;
      draft: boolean;
    } | null>(null);
  const stateRef = useRef<PersonalState | null>(null),
    revision = useRef(0),
    queue = useRef(Promise.resolve(true)),
    writeSerial = useRef(0),
    blocked = useRef(false),
    repsRef = useRef<HTMLInputElement>(null);
  function installState(s: PersonalState) {
    stateRef.current = s;
    revision.current = s.revision;
    setState(s);
  }
  async function load() {
    setLoadingError("");
    try {
      installState(await readState());
      blocked.current = false;
      setStatus("saved");
      setError("");
    } catch (e) {
      setLoadingError(
        e instanceof Error ? e.message : "Could not open local storage.",
      );
    }
  }
  useEffect(() => {
    void load();
    if ("storage" in navigator && navigator.storage.persisted)
      void navigator.storage
        .persisted()
        .then((p) => setPersistence(p ? "Granted" : "Not granted"))
        .catch(() => setPersistence("Unknown / unavailable"));
    setOffline(document.documentElement.dataset.offlineReady === "true");
    const f = () => setOffline(true);
    window.addEventListener("personal-offline-ready", f);
    return () => window.removeEventListener("personal-offline-ready", f);
  }, []);
  function update(
    fn: (s: PersonalState) => PersonalState,
    publish = true,
  ): Promise<boolean> {
    const current = stateRef.current;
    if (!current || busy) return Promise.resolve(false);
    if (blocked.current) {
      setStatus("error");
      setError(
        "Saving is paused. Retry the pending save or export your on-screen data before making more changes.",
      );
      return Promise.resolve(false);
    }
    const serial = ++writeSerial.current;
    const next = fn(current);
    stateRef.current = next;
    if (publish) setState(next);
    setStatus("saving");
    const job = queue.current.then(async () => {
      if (blocked.current) {
        setStatus("error");
        return false;
      }
      try {
        const saved = await saveState(next, revision.current);
        revision.current = saved.revision;
        const latest = { ...stateRef.current!, revision: saved.revision };
        stateRef.current = latest;
        // An earlier queued draft write must not reveal a later actual set
        // until that set's own transaction has committed.
        if (serial === writeSerial.current) setState(latest);
        else
          setState((visible) =>
            visible ? { ...visible, revision: saved.revision } : visible,
          );
        setStatus(serial === writeSerial.current ? "saved" : "saving");
        return true;
      } catch (e) {
        blocked.current = true;
        setStatus("error");
        setError(
          e instanceof Error
            ? e.message
            : "Could not save. Your entries are still here.",
        );
        return false;
      }
    });
    queue.current = job;
    return job;
  }
  function patchExercise(
    id: string,
    patch: Partial<PersonalExercise>,
    publish = true,
  ) {
    return update(
      (s) => ({
        ...s,
        current: s.current
          ? {
              ...s.current,
              exercises: s.current.exercises.map((x) =>
                x.id === id ? { ...x, ...patch } : x,
              ),
            }
          : null,
      }),
      publish,
    );
  }
  async function retry() {
    blocked.current = false;
    setError("");
    await update((s) => ({ ...s }), false);
  }
  function makePlan() {
    try {
      setPlan(generatePlan(selected, count, state!.settings));
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Choose fewer exercises.");
    }
  }
  function patchPlan(id: string, p: Partial<PersonalExercise>) {
    setPlan((current) =>
      current
        ? {
            ...current,
            exercises: current.exercises.map((x) =>
              x.id === id ? { ...x, ...p } : x,
            ),
          }
        : current,
    );
  }
  async function start() {
    if (!plan) return;
    const invalid = plan.exercises.some(
      (x) =>
        !Number.isInteger(x.plannedSets) ||
        x.plannedSets < 1 ||
        x.plannedSets > 20 ||
        !Number.isInteger(x.repMin) ||
        !Number.isInteger(x.repMax) ||
        x.repMin < 1 ||
        x.repMax < x.repMin ||
        x.repMax > 100 ||
        !Number.isFinite(x.increment) ||
        x.increment < 0.1 ||
        x.increment > 50,
    );
    if (invalid) {
      setError(
        "Use 1–20 sets, a valid 1–100 rep range, and an increment from 0.1 to 50.",
      );
      return;
    }
    setBusy(true);
    const ok = await update((s) => ({ ...s, current: plan }), false);
    if (ok) {
      setPlan(null);
      setNotice("Workout started. Each set stays on this device.");
    }
    setBusy(false);
  }
  const workout = state?.current,
    exercise =
      workout?.exercises.find((x) => x.id === workout.activeExerciseId) ||
      workout?.exercises[0];
  async function log(source?: PersonalSet) {
    if (!exercise || busy || blocked.current) return false;
    if (exercise.sets.length >= 500) {
      setError(
        "This exercise has reached the 500-set storage limit. Start a separate workout.",
      );
      return false;
    }
    const weight = source ? source.weight : Number(exercise.pendingWeight),
      reps = source ? source.reps : Number(exercise.pendingReps);
    if (
      (!source &&
        (!exercise.pendingWeight.trim() || !exercise.pendingReps.trim())) ||
      !Number.isFinite(weight) ||
      weight < 0 ||
      weight > 2000 ||
      !Number.isInteger(reps) ||
      reps < 1 ||
      reps > 1000
    ) {
      setError(
        "Enter a weight (0 for bodyweight) and whole reps from 1 to 1000.",
      );
      return false;
    }
    setError("");
    setBusy(true);
    const receipt = {
      id: uid(),
      weight,
      reps,
      loggedAt: new Date().toISOString(),
    };
    const ok = await patchExercise(
      exercise.id,
      { sets: [...exercise.sets, receipt], pendingWeight: "", pendingReps: "" },
      false,
    );
    if (ok) {
      setNotice(`Set ${exercise.sets.length + 1} saved on this device.`);
      repsRef.current?.focus();
    }
    setBusy(false);
    return ok;
  }
  function swap(candidate: CatalogExercise) {
    if (busy || blocked.current) return;
    const w = workout || plan;
    if (!w || !swapId) return;
    const old = w.exercises.find((x) => x.id === swapId);
    if (!old) return;
    const replacement: PersonalExercise = {
      ...old,
      id: uid(),
      catalogId: candidate.id,
      name: candidate.name,
      group: candidate.group,
      target: candidate.target,
      equipment: candidate.equipment,
      sets: [],
      plannedSets: old.sets.length
        ? Math.max(1, old.plannedSets - old.sets.length)
        : old.plannedSets,
      pendingWeight: "",
      pendingReps: "",
    };
    const list = w.exercises.flatMap((x) =>
      x.id !== old.id
        ? [x]
        : old.sets.length
          ? [x, replacement]
          : [replacement],
    );
    if (list.length > 100) {
      setError(
        "This workout has reached the 100-exercise limit. Finish it before starting another.",
      );
      return;
    }
    const next = { ...w, exercises: list, activeExerciseId: replacement.id };
    if (workout) void update((s) => ({ ...s, current: next }));
    else setPlan(next);
    setSwapId(null);
    setNotice(
      old.sets.length
        ? "Previous sets kept under their original exercise."
        : "Exercise replaced.",
    );
  }
  async function saveEdit() {
    if (!edit) return;
    const editedExercise = edit.workout
      ? stateRef.current?.history
          .find((w) => w.id === edit.workout)
          ?.exercises.find((x) => x.id === edit.exercise)
      : exercise;
    if (!editedExercise) return;
    const w = Number(edit.weight),
      r = Number(edit.reps);
    if (
      !edit.weight.trim() ||
      !edit.reps.trim() ||
      !Number.isFinite(w) ||
      w < 0 ||
      w > 2000 ||
      !Number.isInteger(r) ||
      r < 1 ||
      r > 1000
    ) {
      setError("Enter a valid weight and whole reps.");
      return;
    }
    setBusy(true);
    const sets = editedExercise.sets.map((s) =>
      s.id === edit.set ? { ...s, weight: w, reps: r } : s,
    );
    const ok = edit.workout
      ? await update(
          (s) => ({
            ...s,
            history: s.history.map((workout) =>
              workout.id === edit.workout
                ? {
                    ...workout,
                    exercises: workout.exercises.map((x) =>
                      x.id === edit.exercise ? { ...x, sets } : x,
                    ),
                  }
                : workout,
            ),
          }),
          false,
        )
      : await patchExercise(edit.exercise, { sets }, false);
    if (ok) {
      setEdit(null);
      setNotice("Set corrected. Original workout and set identity kept.");
    }
    setBusy(false);
  }
  async function removeSet(s: PersonalSet, index: number) {
    if (!exercise) return;
    if (
      await patchExercise(exercise.id, {
        sets: exercise.sets.filter((x) => x.id !== s.id),
      })
    )
      setUndo({ exercise: exercise.id, set: s, index });
  }
  async function restoreSet() {
    if (!undo || !workout) return;
    const x = workout.exercises.find((x) => x.id === undo.exercise);
    if (!x) return;
    const list = [...x.sets];
    list.splice(undo.index, 0, undo.set);
    if (await patchExercise(x.id, { sets: list })) setUndo(null);
  }
  async function finish(discardTyped = false) {
    const w = stateRef.current?.current;
    if (!w) return;
    const pending = w.exercises.some(
      (x) => x.pendingWeight.trim() || x.pendingReps.trim(),
    );
    if (pending && !discardTyped) {
      setFinishing(true);
      return;
    }
    if (!w.exercises.some((x) => x.sets.length)) {
      setFinishing(true);
      return;
    }
    setBusy(true);
    const done = {
      ...w,
      finishedAt: new Date().toISOString(),
      exercises: w.exercises.map((x) => ({
        ...x,
        pendingWeight: "",
        pendingReps: "",
      })),
    };
    if (
      await update(
        (s) => ({
          ...s,
          current: null,
          history: [done, ...s.history],
        }),
        false,
      )
    ) {
      setFinishing(false);
      setNotice("Workout saved. Export a backup to protect this session.");
      setUndo(null);
    }
    setBusy(false);
  }
  async function download() {
    if (!state) return;
    try {
      setBusy(true);
      const content = await exportBackup(stateRef.current || state),
        blob = new Blob([content], { type: "application/json" }),
        url = URL.createObjectURL(blob),
        a = document.createElement("a");
      a.href = url;
      a.download = `gym-notebook-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      await update((s) => ({ ...s, lastExportAt: new Date().toISOString() }));
      setNotice(
        "Download started. Keep the file somewhere safe; its contents have not been verified externally.",
      );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Backup could not be exported.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function restore() {
    if (!state || !backupText) return;
    setBusy(true);
    try {
      await queue.current;
      const merged = await importBackup(backupText, stateRef.current!);
      installState(merged);
      blocked.current = false;
      setStatus("saved");
      setBackupText("");
      setNotice("Backup merged. Existing records kept.");
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Could not import this backup. Existing records were kept.",
      );
    }
    setBusy(false);
  }
  const swapOptions = (w: PersonalWorkout) => {
    const x = w.exercises.find((x) => x.id === swapId);
    if (!x) return null;
    const candidates = suggestSwap(x, w);
    return (
      <div className="personal-inline">
        <strong>Swap {x.name}</strong>
        <p className="personal-muted">
          Choose a different machine or movement. Logged sets keep their
          original name.
        </p>
        {candidates.map((c) => (
          <button
            className="personal-secondary"
            key={c.id}
            onClick={() => swap(c)}
          >
            {c.name}
            <small>
              {c.target} · {c.equipment}
              {c.secondary.length
                ? ` · Also uses ${c.secondary.join(", ")}`
                : ""}
            </small>
          </button>
        ))}
        {!candidates.length && (
          <p>No other movement for this target in the current catalog.</p>
        )}
        <button onClick={() => setSwapId(null)}>Cancel swap</button>
      </div>
    );
  };
  if (!state)
    return (
      <div className="personal-app">
        <main className="personal-main">
          <h1>Your gym notebook</h1>
          {loadingError ? (
            <>
              <p role="alert">{loadingError}</p>
              <p>
                Your saved data has not been cleared. Allow browser storage and
                try again.
              </p>
              <button onClick={() => void load()}>Retry opening storage</button>
            </>
          ) : (
            <p>Opening your notebook…</p>
          )}
        </main>
      </div>
    );
  const hint = exercise
    ? progression(exercise, state.history, state.settings.progressionEnabled)
    : null;
  const comparison =
    exercise &&
    hint?.previous &&
    exercise.gym.trim() &&
    exercise.equipment.trim() &&
    exercise.sets.length > 0 &&
    exercise.sets.length === hint.previous.sets.length &&
    exercise.sets.every(
      (set, i) => set.weight === hint.previous!.sets[i].weight,
    )
      ? exercise.sets.reduce(
          (sum, set, i) => sum + set.reps - hint.previous!.sets[i].reps,
          0,
        )
      : null;
  return (
    <div className="personal-app">
      <header className="personal-header">
        <div className="personal-brand">
          <Dumbbell size={22} />
          <span>Gym notebook</span>
        </div>
        <span className={`personal-status ${status}`} role="status">
          {status === "saving"
            ? "Saving…"
            : status === "error"
              ? "Not saved"
              : "Saved on device"}
        </span>
      </header>
      <main className="personal-main">
        {error && (
          <div className="personal-error" role="alert">
            {error}
            {status === "error" && (
              <div className="personal-actions">
                <button onClick={() => void retry()}>Retry save</button>
                <button
                  onClick={() => {
                    if (
                      confirm(
                        "Reload the saved copy? Your unsaved on-screen changes will be lost. Export them first if needed.",
                      )
                    )
                      void load();
                  }}
                >
                  Reload saved copy
                </button>
                <button onClick={() => void download()}>
                  Export on-screen data
                </button>
              </div>
            )}
            <button aria-label="Dismiss error" onClick={() => setError("")}>
              ×
            </button>
          </div>
        )}
        {notice && (
          <div className="personal-notice" role="status">
            {notice}
            {notice.startsWith("Workout saved.") && (
              <button onClick={() => setTab("backup")}>Back up now</button>
            )}
            <button aria-label="Dismiss notice" onClick={() => setNotice("")}>
              ×
            </button>
          </div>
        )}
        {tab === "today" && (
          <>
            {!workout && (
              <>
                <div className="personal-eyebrow">Your time. Your pace.</div>
                <h1 className="personal-title">What are we training?</h1>
                <p className="personal-muted">
                  Pick your muscles. We’ll give each primary target its own
                  place.
                </p>
                <div className="personal-chips">
                  {groups.map((g) => (
                    <button
                      aria-pressed={selected.includes(g.id)}
                      className={`personal-chip ${selected.includes(g.id) ? "selected" : ""}`}
                      key={g.id}
                      onClick={() => {
                        const next = selected.includes(g.id)
                          ? selected.filter((x) => x !== g.id)
                          : [...selected, g.id];
                        setSelected(next);
                        setCount((c) =>
                          Math.min(
                            12,
                            availableTargets(next) || 12,
                            Math.max(c, next.length || 1),
                          ),
                        );
                        setPlan(null);
                      }}
                    >
                      {selected.includes(g.id) && <Check size={16} />} {g.name}
                    </button>
                  ))}
                </div>
                <div className="personal-row">
                  <label htmlFor="exercise-count">Number of exercises</label>
                  <div className="personal-actions">
                    <button
                      aria-label="Fewer exercises"
                      disabled={count <= Math.max(1, selected.length)}
                      onClick={() =>
                        setCount((c) => Math.max(1, selected.length, c - 1))
                      }
                    >
                      <Minus size={16} />
                    </button>
                    <input
                      id="exercise-count"
                      type="number"
                      min={Math.max(1, selected.length)}
                      max={
                        selected.length
                          ? Math.min(12, availableTargets(selected))
                          : 12
                      }
                      value={count}
                      onChange={(e) =>
                        setCount(
                          Math.min(
                            12,
                            Math.max(
                              1,
                              selected.length,
                              Number(e.target.value) || 1,
                            ),
                          ),
                        )
                      }
                    />
                    <button
                      aria-label="More exercises"
                      disabled={count >= 12}
                      onClick={() => setCount((c) => Math.min(12, c + 1))}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                <small className="personal-muted">
                  {selected.length
                    ? `${selected.length}–${Math.min(12, availableTargets(selected))} exercises across distinct primary targets. Secondary muscles can overlap.`
                    : "Select muscles to see available coverage."}
                </small>
                <button
                  className="personal-primary"
                  disabled={!selected.length}
                  onClick={makePlan}
                >
                  Build my workout <ChevronRight size={18} />
                </button>
                {!selected.length && (
                  <p className="personal-muted">For example, Chest + Back.</p>
                )}
                {plan && (
                  <section className="personal-panel">
                    <h2>Today’s lineup</h2>
                    <p className="personal-muted">
                      A starting point, not a prescription. Adjust it before you
                      begin.
                    </p>
                    {plan.exercises.map((x, i) => (
                      <article className="personal-plan-card" key={x.id}>
                        <div className="personal-row">
                          <div>
                            <small>
                              {i + 1} · {x.target}
                            </small>
                            <h3>{x.name}</h3>
                            <p className="personal-muted">{x.equipment}</p>
                            <small className="personal-muted">
                              {catalogExercises.find(
                                (c) => c.id === x.catalogId,
                              )?.secondary.length
                                ? `Also uses ${catalogExercises.find((c) => c.id === x.catalogId)!.secondary.join(", ")}. Primary targets differ; some overlap is normal.`
                                : "Primary target listed; no claim of complete isolation."}
                            </small>
                          </div>
                          <button
                            aria-label={`Swap ${x.name}`}
                            onClick={() => setSwapId(x.id)}
                          >
                            <ArrowLeftRight size={18} />
                          </button>
                        </div>
                        <div className="personal-grid">
                          <label>
                            Sets
                            <input
                              aria-label={`${x.name} planned sets`}
                              type="number"
                              min="1"
                              max="20"
                              value={x.plannedSets}
                              onChange={(e) =>
                                patchPlan(x.id, {
                                  plannedSets: Number(e.target.value),
                                })
                              }
                            />
                          </label>
                          <label>
                            Min reps
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={x.repMin}
                              onChange={(e) =>
                                patchPlan(x.id, {
                                  repMin: Number(e.target.value),
                                })
                              }
                            />
                          </label>
                          <label>
                            Max reps
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={x.repMax}
                              onChange={(e) =>
                                patchPlan(x.id, {
                                  repMax: Number(e.target.value),
                                })
                              }
                            />
                          </label>
                        </div>
                      </article>
                    ))}
                    {swapOptions(plan)}
                    <button
                      className="personal-primary"
                      disabled={busy || status === "error"}
                      onClick={() => void start()}
                    >
                      Start workout
                    </button>
                  </section>
                )}
              </>
            )}
            {workout && exercise && (
              <>
                <div className="personal-row personal-session-bar">
                  <div>
                    <span className="personal-eyebrow">
                      Today · {date(workout.startedAt)}
                    </span>
                  </div>
                  <button
                    className="personal-secondary"
                    onClick={() => setFinishing(true)}
                  >
                    Finish
                  </button>
                </div>
                <div className="personal-exercise-nav" aria-label="Exercises">
                  {workout.exercises.map((x, i) => (
                    <button
                      key={x.id}
                      aria-pressed={x.id === exercise.id}
                      className={x.id === exercise.id ? "active" : ""}
                      onClick={() => {
                        setEdit(null);
                        setSwapId(null);
                        void update((s) => ({
                          ...s,
                          current: { ...s.current!, activeExerciseId: x.id },
                        }));
                      }}
                    >
                      <span>{i + 1}</span>
                      {x.name}
                      <small>{x.sets.length} sets</small>
                    </button>
                  ))}
                </div>
                <section className="personal-workbench personal-logger">
                  <div className="personal-row">
                    <div>
                      <span className="personal-eyebrow">
                        {exercise.target} · {exercise.equipment}
                      </span>
                      <h2>{exercise.name}</h2>
                    </div>
                    <button
                      aria-label={`Swap ${exercise.name}`}
                      onClick={() =>
                        setSwapId((s) =>
                          s === exercise.id ? null : exercise.id,
                        )
                      }
                    >
                      <ArrowLeftRight size={19} />
                    </button>
                  </div>
                  <div className="personal-context">
                    <div>
                      <small>
                        Last time{" "}
                        {hint?.previous
                          ? date(
                              state.history.find((w) =>
                                w.exercises.some(
                                  (x) => x.id === hint.previous!.id,
                                ),
                              )!.startedAt,
                            )
                          : ""}
                      </small>
                      <p>
                        {hint?.previous
                          ? `${hint.previous.sets.map((s) => actual(s, hint.previous!.unit)).join(" · ")}`
                          : "No previous sets for this setup."}
                      </p>
                    </div>
                    <div>
                      <small>Target</small>
                      <p>
                        {exercise.plannedSets} sets · {exercise.repMin}–
                        {exercise.repMax} reps
                      </p>
                    </div>
                  </div>
                  {hint?.kind === "increase" && (
                    <p className="personal-muted">{hint.message}</p>
                  )}
                  {swapOptions(workout)}
                  <div className="personal-inputs">
                    <label>
                      Weight ({exercise.unit})
                      <input
                        aria-label={`Weight (${exercise.unit})`}
                        maxLength={30}
                        inputMode="decimal"
                        enterKeyHint="next"
                        disabled={busy}
                        value={exercise.pendingWeight}
                        placeholder="0"
                        onChange={(e) =>
                          void patchExercise(exercise.id, {
                            pendingWeight: e.target.value,
                          })
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") repsRef.current?.focus();
                        }}
                      />
                    </label>
                    <label>
                      Reps
                      <input
                        aria-label="Reps"
                        maxLength={30}
                        ref={repsRef}
                        inputMode="numeric"
                        enterKeyHint="done"
                        disabled={busy}
                        value={exercise.pendingReps}
                        placeholder="—"
                        onChange={(e) =>
                          void patchExercise(exercise.id, {
                            pendingReps: e.target.value,
                          })
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") void log();
                        }}
                      />
                    </label>
                  </div>
                  <button
                    className="personal-primary"
                    disabled={busy || status === "error"}
                    onClick={() => void log()}
                  >
                    <Check size={20} /> {busy ? "Saving set…" : "Log set"}
                  </button>
                  {exercise.sets.length > 0 && (
                    <button
                      className="personal-secondary"
                      disabled={busy || status === "error"}
                      onClick={() => void log(exercise.sets.at(-1))}
                    >
                      Repeat {actual(exercise.sets.at(-1)!, exercise.unit)}
                    </button>
                  )}
                  <div className="personal-sets">
                    {exercise.sets.map((s, i) => (
                      <div key={s.id} className="personal-receipt">
                        {edit?.set === s.id ? (
                          <>
                            <div className="personal-inputs">
                              <label>
                                Weight ({exercise.unit})
                                <input
                                  aria-label="Edit weight"
                                  inputMode="decimal"
                                  value={edit.weight}
                                  onChange={(e) =>
                                    setEdit({ ...edit, weight: e.target.value })
                                  }
                                />
                              </label>
                              <label>
                                Reps
                                <input
                                  aria-label="Edit reps"
                                  inputMode="numeric"
                                  value={edit.reps}
                                  onChange={(e) =>
                                    setEdit({ ...edit, reps: e.target.value })
                                  }
                                />
                              </label>
                            </div>
                            <div className="personal-actions">
                              <button
                                disabled={busy}
                                onClick={() => void saveEdit()}
                              >
                                Save changes
                              </button>
                              <button onClick={() => setEdit(null)}>
                                Cancel
                              </button>
                              <button
                                className="personal-danger"
                                onClick={() => {
                                  void removeSet(s, i);
                                  setEdit(null);
                                }}
                              >
                                Delete set
                              </button>
                            </div>
                          </>
                        ) : (
                          <>
                            <span>{i + 1}</span>
                            <strong>{actual(s, exercise.unit)}</strong>
                            <Check size={16} />
                            <button
                              aria-label={`Edit set ${i + 1}`}
                              onClick={() =>
                                setEdit({
                                  exercise: exercise.id,
                                  set: s.id,
                                  weight: String(s.weight),
                                  reps: String(s.reps),
                                })
                              }
                            >
                              Edit
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                  {comparison !== null && (
                    <p className="personal-muted">
                      Across {exercise.sets.length} recorded sets:{" "}
                      {comparison > 0 ? "+" : ""}
                      {comparison} reps at the same loads as last time.
                    </p>
                  )}
                  {undo && (
                    <button
                      className="personal-secondary"
                      onClick={() => void restoreSet()}
                    >
                      <RotateCcw size={16} /> Undo deleted set
                    </button>
                  )}
                  <details>
                    <summary>Setup & next-time settings</summary>
                    <p className="personal-muted">
                      0 weight = bodyweight or no added load. Actuals are never
                      filled from your plan.
                    </p>
                    {hint?.message && (
                      <p className="personal-muted">{hint.message}</p>
                    )}
                    {hint?.previous && (
                      <small className="personal-muted">
                        Previous setup: {hint.previous.gym || "Unspecified gym"}{" "}
                        · {hint.previous.equipment} · {hint.previous.unit}
                      </small>
                    )}
                    <p className="personal-muted">
                      Comparisons use this exact movement, gym, equipment and
                      unit.
                    </p>
                    <label>
                      Gym / setup label
                      <input
                        value={exercise.gym}
                        maxLength={120}
                        placeholder="My gym"
                        onChange={(e) =>
                          void patchExercise(exercise.id, {
                            gym: e.target.value,
                          })
                        }
                      />
                    </label>
                    <label>
                      Equipment label
                      <input
                        value={exercise.equipment}
                        maxLength={120}
                        onChange={(e) =>
                          void patchExercise(exercise.id, {
                            equipment: e.target.value,
                          })
                        }
                      />
                    </label>
                    <div className="personal-grid">
                      <label>
                        Planned sets
                        <input
                          aria-label="Working sets target"
                          type="number"
                          min="1"
                          max="20"
                          defaultValue={exercise.plannedSets}
                          key={"sets" + exercise.id}
                          onBlur={(e) => {
                            const n = Number(e.target.value);
                            if (Number.isInteger(n) && n >= 1 && n <= 20)
                              void patchExercise(exercise.id, {
                                plannedSets: n,
                              });
                            else {
                              e.target.value = String(exercise.plannedSets);
                              setError("Use 1–20 planned sets.");
                            }
                          }}
                        />
                      </label>
                      <label>
                        Min reps
                        <input
                          aria-label="Lower rep target"
                          type="number"
                          min="1"
                          max={exercise.repMax}
                          defaultValue={exercise.repMin}
                          key={"min" + exercise.id}
                          onBlur={(e) => {
                            const n = Number(e.target.value);
                            if (
                              Number.isInteger(n) &&
                              n >= 1 &&
                              n <= exercise.repMax
                            )
                              void patchExercise(exercise.id, { repMin: n });
                            else {
                              e.target.value = String(exercise.repMin);
                              setError(
                                "Lower rep target must be positive and no greater than the upper target.",
                              );
                            }
                          }}
                        />
                      </label>
                      <label>
                        Max reps
                        <input
                          aria-label="Upper rep target"
                          type="number"
                          min={exercise.repMin}
                          max="100"
                          defaultValue={exercise.repMax}
                          key={"max" + exercise.id}
                          onBlur={(e) => {
                            const n = Number(e.target.value);
                            if (
                              Number.isInteger(n) &&
                              n >= exercise.repMin &&
                              n <= 100
                            )
                              void patchExercise(exercise.id, { repMax: n });
                            else {
                              e.target.value = String(exercise.repMax);
                              setError(
                                "Upper rep target must be at least the lower target and no greater than 100.",
                              );
                            }
                          }}
                        />
                      </label>
                    </div>
                    <label>
                      Available weight increment ({exercise.unit})
                      <input
                        type="number"
                        min="0.1"
                        max="50"
                        step="0.1"
                        defaultValue={exercise.increment}
                        key={"increment" + exercise.id}
                        onBlur={(e) => {
                          const n = Number(e.target.value);
                          if (Number.isFinite(n) && n >= 0.1 && n <= 50)
                            void patchExercise(exercise.id, { increment: n });
                          else {
                            e.target.value = String(exercise.increment);
                            setError("Use a load increment from 0.1 to 50.");
                          }
                        }}
                      />
                    </label>
                  </details>
                </section>
                <button
                  className="personal-secondary"
                  onClick={() => {
                    const i = workout.exercises.findIndex(
                        (x) => x.id === exercise.id,
                      ),
                      next =
                        workout.exercises[(i + 1) % workout.exercises.length];
                    void update((s) => ({
                      ...s,
                      current: { ...s.current!, activeExerciseId: next.id },
                    }));
                  }}
                >
                  Next exercise <ChevronRight size={18} />
                </button>
                {finishing && (
                  <section
                    className="personal-inline"
                    aria-label="Finish workout"
                  >
                    <h2>Finish this workout?</h2>
                    {workout.exercises.some(
                      (x) => x.pendingWeight.trim() || x.pendingReps.trim(),
                    ) && (
                      <p>
                        You have unlogged input. Go back and log it, or
                        explicitly finish without those entries.
                      </p>
                    )}
                    <p>
                      {workout.exercises.reduce((a, x) => a + x.sets.length, 0)}{" "}
                      actual sets will be kept. Unfinished exercises stay
                      visible as partial.
                    </p>
                    {workout.exercises.some((x) => x.sets.length) ? (
                      <button
                        className="personal-primary"
                        disabled={busy || status === "error"}
                        onClick={() => void finish(true)}
                      >
                        Save workout
                        {workout.exercises.some(
                          (x) => x.pendingWeight.trim() || x.pendingReps.trim(),
                        )
                          ? " without unlogged input"
                          : ""}
                      </button>
                    ) : (
                      <button
                        className="personal-danger"
                        onClick={() => {
                          void update((s) => ({ ...s, current: null }));
                          setFinishing(false);
                        }}
                      >
                        Discard empty draft
                      </button>
                    )}
                    <button onClick={() => setFinishing(false)}>
                      Keep logging
                    </button>
                  </section>
                )}
              </>
            )}
          </>
        )}
        {tab === "progress" && (
          <>
            <div className="personal-eyebrow">Your own record</div>
            <h1 className="personal-title">Progress, in plain sight.</h1>
            <p className="personal-muted">
              Every recorded set. No streaks, scores or pressure.
            </p>
            {!state.history.length && (
              <section className="personal-card">
                <Dumbbell />
                <h2>Your first page is waiting.</h2>
                <p>Finish a workout and its actual sets will appear here.</p>
                <button onClick={() => setTab("today")}>Go to Today</button>
              </section>
            )}
            {state.history.map((w) => (
              <article className="personal-progress-card" key={w.id}>
                <h2>
                  {date(w.finishedAt || w.startedAt)}{" "}
                  <small>{w.groups.join(" + ")}</small>
                </h2>
                {w.exercises.map((x) => (
                  <div key={x.id}>
                    <h3>
                      {x.name}{" "}
                      <small>
                        {x.sets.length < x.plannedSets ? "Partial" : ""}
                      </small>
                    </h3>
                    <p>
                      {x.sets.length
                        ? x.sets.map((s) => actual(s, x.unit)).join(" · ")
                        : "No sets logged"}
                    </p>
                    <small className="personal-muted">
                      {x.gym || "Unspecified gym"} · {x.equipment}
                    </small>
                    {x.sets.length > 0 && (
                      <details>
                        <summary>Correct a set</summary>
                        {x.sets.map((set, index) => (
                          <div className="personal-receipt" key={set.id}>
                            {edit?.set === set.id && edit.workout === w.id ? (
                              <>
                                <div className="personal-inputs">
                                  <label>
                                    Weight ({x.unit})
                                    <input
                                      aria-label="Correct history weight"
                                      inputMode="decimal"
                                      value={edit.weight}
                                      onChange={(e) =>
                                        setEdit({
                                          ...edit,
                                          weight: e.target.value,
                                        })
                                      }
                                    />
                                  </label>
                                  <label>
                                    Reps
                                    <input
                                      aria-label="Correct history reps"
                                      inputMode="numeric"
                                      value={edit.reps}
                                      onChange={(e) =>
                                        setEdit({
                                          ...edit,
                                          reps: e.target.value,
                                        })
                                      }
                                    />
                                  </label>
                                </div>
                                <button
                                  disabled={busy || status === "error"}
                                  onClick={() => void saveEdit()}
                                >
                                  Save correction
                                </button>
                                <button onClick={() => setEdit(null)}>
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <>
                                <span>Set {index + 1}</span>
                                <strong>{actual(set, x.unit)}</strong>
                                <button
                                  disabled={busy || status === "error"}
                                  aria-label={`Correct ${x.name} set ${index + 1}`}
                                  onClick={() =>
                                    setEdit({
                                      workout: w.id,
                                      exercise: x.id,
                                      set: set.id,
                                      weight: String(set.weight),
                                      reps: String(set.reps),
                                    })
                                  }
                                >
                                  Edit
                                </button>
                              </>
                            )}
                          </div>
                        ))}
                      </details>
                    )}
                  </div>
                ))}
              </article>
            ))}
          </>
        )}
        {tab === "backup" && (
          <>
            <div className="personal-eyebrow">Your data belongs to you</div>
            <h1 className="personal-title">Keep your notebook safe.</h1>
            <section className="personal-card">
              <ShieldCheck />
              <h2>Saved locally, not in an account.</h2>
              <p>
                Your workouts survive sessions and browser restarts on this
                device and this site. Clearing site data, private browsing, or
                losing your device can erase them. Download regular backups.
              </p>
              <div className="personal-row">
                <span>Browser storage protection</span>
                <strong>{persistence}</strong>
              </div>
              <button
                className="personal-secondary"
                onClick={() =>
                  void requestPersistence()
                    .then((p) => setPersistence(p ? "Granted" : "Not granted"))
                    .catch(() => setPersistence("Unsupported"))
                }
              >
                Protect local storage
              </button>
              <p className="personal-muted">
                {offline
                  ? "Offline app available in this browser."
                  : "Offline assets are not confirmed yet. Reopen after installation."}
              </p>
              <p className="personal-muted">
                Pin this site: iPhone Safari → Share → Add to Home Screen.
                Android Chrome → menu → Install / Add to Home screen.
              </p>
            </section>
            <section className="personal-card">
              <h2>Backup & restore</h2>
              <p>
                Last download started:{" "}
                {state.lastExportAt
                  ? new Date(state.lastExportAt).toLocaleString()
                  : "No backup yet"}
              </p>
              <button
                className="personal-primary"
                disabled={busy}
                onClick={() => void download()}
              >
                <Download size={18} /> Export backup
              </button>
              <label className="personal-secondary">
                <Upload size={18} /> Choose backup file
                <input
                  aria-label="Choose backup file"
                  type="file"
                  accept="application/json,.json"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    if (f.size > 30000000) {
                      setError("This backup is too large (maximum 30 MB).");
                      return;
                    }
                    void f.text().then(async (t) => {
                      try {
                        const preview = await inspectBackup(t);
                        setBackupText(t);
                        setBackupPreview({
                          workouts: preview.state.history.length,
                          draft: !!preview.state.current,
                        });
                        setError("");
                      } catch (e) {
                        setBackupText("");
                        setBackupPreview(null);
                        setError(
                          e instanceof Error
                            ? e.message
                            : "Invalid backup. Existing records were kept.",
                        );
                      }
                    });
                  }}
                />
              </label>
              {backupText && (
                <div className="personal-inline">
                  <p>
                    This backup has {backupPreview?.workouts ?? 0} finished
                    workouts
                    {backupPreview?.draft ? " and an unfinished draft" : ""}.
                    Merge into your notebook? Existing records are kept.
                    Conflicting records are rejected rather than overwritten.
                  </p>
                  <button
                    disabled={busy}
                    className="personal-primary"
                    onClick={() => void restore()}
                  >
                    Validate & merge backup
                  </button>
                  <button onClick={() => setBackupText("")}>
                    Cancel import
                  </button>
                </div>
              )}
            </section>
            <section className="personal-card">
              <h2>My defaults</h2>
              <label>
                Weight unit
                <select
                  value={state.settings.unit}
                  onChange={(e) =>
                    void update((s) => ({
                      ...s,
                      settings: { ...s.settings, unit: e.target.value as Unit },
                    }))
                  }
                >
                  <option value="kg">kg</option>
                  <option value="lb">lb</option>
                </select>
              </label>
              <p className="personal-muted">
                Applies to new workouts. Old values are never relabeled or
                converted.
              </p>
              <label>
                Gym label
                <input
                  value={state.settings.gym}
                  maxLength={120}
                  placeholder="My gym"
                  onChange={(e) =>
                    void update((s) => ({
                      ...s,
                      settings: { ...s.settings, gym: e.target.value },
                    }))
                  }
                />
              </label>
              <label className="personal-row">
                <span>Show double-progression hints</span>
                <input
                  type="checkbox"
                  checked={state.settings.progressionEnabled}
                  onChange={(e) =>
                    void update((s) => ({
                      ...s,
                      settings: {
                        ...s.settings,
                        progressionEnabled: e.target.checked,
                      },
                    }))
                  }
                />
              </label>
              <p className="personal-muted">
                Optional context, not a command. A small load increase is
                considered only after all intended sets reach the rep ceiling in
                the same setup. Never auto-logs sets.
              </p>
            </section>
          </>
        )}
      </main>
      <nav className="personal-tabs" aria-label="Main navigation">
        {(["today", "progress", "backup"] as const).map((t) => (
          <button
            key={t}
            className={`personal-tab ${tab === t ? "active" : ""}`}
            aria-current={tab === t ? "page" : undefined}
            onClick={() => setTab(t)}
          >
            {t === "today" ? (
              <Dumbbell size={20} />
            ) : t === "progress" ? (
              <Check size={20} />
            ) : (
              <ShieldCheck size={20} />
            )}
            <span>{t[0].toUpperCase() + t.slice(1)}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
