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
  RotateCcw,
  ArrowLeft,
  Settings,
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
import MuscleGlyph from "./MuscleGlyph";
import TrainingHome from "./TrainingHome";
import { effortLabel, groupInsights } from "./personalInsights";
import {
  DSButton,
  DSChoice,
  DSStepper,
  DSInput,
  DSSurface,
  DSScreenHeader,
  DSStatus,
  DSInlineNotice,
  DSSetRow,
  DSSetColumnLabels,
  DSEffortChoices,
  DSDisclosure,
  DSComparisonEvidence,
} from "./design-system";
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
const draftError = (x: PersonalExercise) => {
  if (
    x.pendingWeight.trim() &&
    (!Number.isFinite(Number(x.pendingWeight)) ||
      Number(x.pendingWeight) < 0 ||
      Number(x.pendingWeight) > 2000)
  )
    return "Use a weight from 0 to 2000. Use a decimal point if needed.";
  if (
    x.pendingReps.trim() &&
    (!Number.isInteger(Number(x.pendingReps)) ||
      Number(x.pendingReps) < 1 ||
      Number(x.pendingReps) > 1000)
  )
    return "Use whole reps from 1 to 1000.";
  return "";
};
export default function PersonalApp() {
  const [state, setState] = useState<PersonalState | null>(null),
    [loadingError, setLoadingError] = useState(""),
    [tab, setTab] = useState<"home" | "today">("home");
  const [overlay, setOverlay] = useState<"progress" | "backup" | null>(null);
  const overlayRef = useRef<HTMLDialogElement>(null);
  const firstLoad = useRef(true);
  const overlayTrigger = useRef<HTMLElement | null>(null);
  function openOverlay(value: "progress" | "backup") {
    overlayTrigger.current = document.activeElement as HTMLElement | null;
    setOverlay(value);
  }
  function closeOverlay() {
    setOverlay(null);
    requestAnimationFrame(() => overlayTrigger.current?.focus());
  }
  useEffect(() => {
    const dialog = overlayRef.current;
    if (overlay && dialog && !dialog.open) dialog.showModal();
  }, [overlay]);
  const [selected, setSelected] = useState<MuscleGroup[]>([]),
    [count, setCount] = useState(4),
    [plan, setPlan] = useState<PersonalWorkout | null>(null),
    [swapId, setSwapId] = useState<string | null>(null),
    [reviewing, setReviewing] = useState(false),
    [customize, setCustomize] = useState<string | null>(null),
    [extraRow, setExtraRow] = useState<string | null>(null),
    [pendingSwap, setPendingSwap] = useState<{
      exercise: string;
      candidate: CatalogExercise;
    } | null>(null);
  const [status, setStatus] = useState<"saved" | "saving" | "error">("saved"),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [busy, setBusy] = useState(false),
    [recording, setRecording] = useState(false),
    [savingEffort, setSavingEffort] = useState(false),
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
  const [effortEdit, setEffortEdit] = useState<{
    exercise: string;
    set: string;
    workout?: string;
    value: PersonalSet["repsInReserve"];
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
    repsRef = useRef<HTMLInputElement>(null),
    effortTrigger = useRef<HTMLElement | null>(null);
  function installState(s: PersonalState) {
    stateRef.current = s;
    revision.current = s.revision;
    setState(s);
  }
  async function load() {
    setLoadingError("");
    try {
      const loaded = await readState();
      installState(loaded);
      if (firstLoad.current) {
        setTab(loaded.current ? "today" : "home");
        firstLoad.current = false;
      }
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
      setReviewing(true);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Choose fewer exercises.");
    }
  }
  function repeatWorkout(previous: PersonalWorkout) {
    if (stateRef.current?.current) {
      setTab("today");
      return;
    }
    const exercises = previous.exercises.map((x) => ({
      ...x,
      id: uid(),
      sets: [],
      pendingWeight: "",
      pendingReps: "",
    }));
    setPlan({
      id: uid(),
      startedAt: new Date().toISOString(),
      groups: [...previous.groups],
      exercises,
      activeExerciseId: exercises[0]?.id || "",
    });
    setSelected([...previous.groups]);
    setCount(exercises.length);
    setReviewing(true);
    setTab("today");
    setError("");
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
    const invalid = plan.exercises.find(
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
      setCustomize(invalid.id);
      requestAnimationFrame(() =>
        document.getElementById(`plan-sets-${invalid.id}`)?.focus(),
      );
      setError(
        "Use 1–20 sets, a valid 1–100 rep range, and an increment from 0.1 to 50.",
      );
      return;
    }
    setBusy(true);
    const ok = await update(
      (s) => ({
        ...s,
        current: { ...plan, startedAt: new Date().toISOString() },
      }),
      false,
    );
    if (ok) {
      setPlan(null);
      setTab("today");
      setNotice("");
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
    setRecording(true);
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
      setNotice("");
      setExtraRow(null);
    }
    setRecording(false);
    setBusy(false);
    return ok;
  }
  function swap(candidate: CatalogExercise, discardConfirmed = false) {
    if (busy || blocked.current) return;
    const w = workout || plan;
    if (!w || !swapId) return;
    const old = w.exercises.find((x) => x.id === swapId);
    if (!old) return;
    if (
      !discardConfirmed &&
      !old.sets.length &&
      (old.pendingWeight.trim() || old.pendingReps.trim())
    ) {
      setPendingSwap({ exercise: old.id, candidate });
      return;
    }
    setPendingSwap(null);
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
  function closeEffort() {
    setEffortEdit(null);
    requestAnimationFrame(() => {
      if (effortTrigger.current?.isConnected) effortTrigger.current.focus();
    });
  }
  function openEffort(
    x: PersonalExercise,
    set: PersonalSet,
    workoutId?: string,
  ) {
    effortTrigger.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setEffortEdit({
      exercise: x.id,
      set: set.id,
      workout: workoutId,
      value: set.repsInReserve,
    });
  }
  async function saveEffort(value: PersonalSet["repsInReserve"]) {
    if (!effortEdit || busy || blocked.current) return;
    const target = effortEdit;
    setEffortEdit({ ...target, value });
    setBusy(true);
    setSavingEffort(true);
    const change = (x: PersonalExercise): PersonalExercise =>
      x.id !== target.exercise
        ? x
        : {
            ...x,
            sets: x.sets.map((set) => {
              if (set.id !== target.set) return set;
              const { repsInReserve: removed, ...withoutEffort } = set;
              return value === undefined
                ? withoutEffort
                : { ...withoutEffort, repsInReserve: value };
            }),
          };
    const ok = await update(
      (s) =>
        target.workout
          ? {
              ...s,
              history: s.history.map((w) =>
                w.id === target.workout
                  ? { ...w, exercises: w.exercises.map(change) }
                  : w,
              ),
            }
          : {
              ...s,
              current: s.current
                ? { ...s.current, exercises: s.current.exercises.map(change) }
                : null,
            },
      false,
    );
    if (ok) {
      closeEffort();
      setNotice("");
    }
    setSavingEffort(false);
    setBusy(false);
  }
  function effortPanel(x: PersonalExercise, workoutId?: string) {
    if (
      !effortEdit ||
      effortEdit.exercise !== x.id ||
      effortEdit.workout !== workoutId
    )
      return null;
    const index = x.sets.findIndex((set) => set.id === effortEdit.set);
    if (index < 0) return null;
    return (
      <section
        className="nb-effort-picker"
        aria-label={`Effort for set ${index + 1} of ${x.name}`}
      >
        <p className="personal-muted">
          Set {index + 1} · {x.name}
        </p>
        <DSEffortChoices
          value={effortEdit.value}
          onChange={(value) => void saveEffort(value)}
          onClose={closeEffort}
          loading={savingEffort}
          disabled={busy || status === "error"}
          error={
            status === "error"
              ? "Your proposed estimate is still here. Retry the pending save above before making another change."
              : undefined
          }
        />
      </section>
    );
  }
  async function removeSet(s: PersonalSet, index: number) {
    if (!exercise || busy || blocked.current) return;
    setBusy(true);
    if (
      await patchExercise(
        exercise.id,
        { sets: exercise.sets.filter((x) => x.id !== s.id) },
        false,
      )
    ) {
      setUndo({ exercise: exercise.id, set: s, index });
      setEdit(null);
    }
    setBusy(false);
  }
  async function restoreSet() {
    if (!undo || !workout || busy || blocked.current) return;
    const x = workout.exercises.find((x) => x.id === undo.exercise);
    if (!x) return;
    const list = [...x.sets];
    list.splice(undo.index, 0, undo.set);
    setBusy(true);
    if (await patchExercise(x.id, { sets: list }, false)) setUndo(null);
    setBusy(false);
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
      setTab("home");
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
        {pendingSwap?.exercise === x.id ? (
          <div
            className="nb-swap-confirm"
            role="group"
            aria-label="Confirm exercise swap"
          >
            <h3>Discard unlogged entry and swap?</h3>
            <p>
              Your typed {x.pendingWeight || "—"} {x.unit} ×{" "}
              {x.pendingReps || "—"} reps for {x.name} is not logged. Replace it
              with {pendingSwap.candidate.name}?
            </p>
            <DSButton
              variant="primary"
              className="personal-primary"
              onClick={() => swap(pendingSwap.candidate, true)}
            >
              Discard entry and swap
            </DSButton>
            <DSButton
              variant="text"
              onClick={() => {
                setPendingSwap(null);
                setSwapId(null);
              }}
            >
              Keep entry
            </DSButton>
          </div>
        ) : (
          <>
            {candidates.map((c) => (
              <DSButton
                variant="secondary"
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
              </DSButton>
            ))}
          </>
        )}
        {!candidates.length && (
          <p>No other movement for this target in the current catalog.</p>
        )}
        <DSButton
          variant="text"
          onClick={() => {
            setSwapId(null);
            setPendingSwap(null);
          }}
        >
          Cancel swap
        </DSButton>
      </div>
    );
  };
  if (!state)
    return (
      <div className="personal-app ds-theme">
        <main className="personal-main">
          <h1>Your gym notebook</h1>
          {loadingError ? (
            <>
              <p role="alert">{loadingError}</p>
              <p>
                Your saved data has not been cleared. Allow browser storage and
                try again.
              </p>
              <DSButton variant="text" onClick={() => void load()}>
                Retry opening storage
              </DSButton>
            </>
          ) : (
            <p>Opening your notebook…</p>
          )}
        </main>
      </div>
    );
  const recordedCount =
    workout?.exercises.reduce(
      (sum, movement) => sum + movement.sets.length,
      0,
    ) ?? 0;
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
    <div
      className={`personal-app ds-theme ${tab === "today" ? "two-workout" : "two-home"} ${workout && tab === "today" ? "is-session" : ""}`}
    >
      <header className="personal-header">
        <div className="personal-brand">
          {tab === "today" ? (
            <DSButton
              variant="text"
              aria-label="Back to Home"
              onClick={() => setTab("home")}
            >
              <ArrowLeft size={20} /> Home
            </DSButton>
          ) : (
            <span>Gym notebook</span>
          )}
        </div>
        <div className="two-header-actions">
          <DSStatus state={status} className={`personal-status ${status}`} />
          <DSButton
            variant="text"
            aria-label="Settings and backup"
            onClick={() => openOverlay("backup")}
          >
            <Settings size={20} /> <span>Settings</span>
          </DSButton>
        </div>
      </header>
      <main className="personal-main">
        {error && (
          <DSInlineNotice
            tone="error"
            title="Changes need attention"
            className="personal-error"
          >
            {error}
            {status === "error" && (
              <div className="personal-actions">
                <DSButton variant="text" onClick={() => void retry()}>
                  Retry save
                </DSButton>
                <DSButton
                  variant="text"
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
                </DSButton>
                <DSButton variant="text" onClick={() => void download()}>
                  Export on-screen data
                </DSButton>
              </div>
            )}
            <DSButton
              variant="text"
              aria-label="Dismiss error"
              onClick={() => setError("")}
            >
              ×
            </DSButton>
          </DSInlineNotice>
        )}
        {notice && (
          <DSInlineNotice
            tone="info"
            title="Notebook update"
            className="personal-notice"
          >
            {notice}
            {notice.startsWith("Workout saved.") && (
              <DSButton variant="text" onClick={() => openOverlay("backup")}>
                Back up now
              </DSButton>
            )}
            <DSButton
              variant="text"
              aria-label="Dismiss notice"
              onClick={() => setNotice("")}
            >
              ×
            </DSButton>
          </DSInlineNotice>
        )}
        {tab === "home" && (
          <TrainingHome
            state={state}
            onPlan={() => {
              setReviewing(false);
              setPlan(null);
              setTab("today");
            }}
            onRepeat={repeatWorkout}
            onResume={() => setTab("today")}
            onEvidence={() => openOverlay("progress")}
          />
        )}
        {tab === "today" && (
          <div className={!workout ? "two-planner" : "two-session"}>
            {!workout && (
              <>
                {!reviewing && (
                  <section className="personal-setup">
                    <DSScreenHeader
                      title="What are you training?"
                      description="Choose your focus. Build a session, then record the work."
                    />
                    <div className="nb-muscle-grid">
                      {groups.map((g) => (
                        <DSChoice
                          selected={selected.includes(g.id)}
                          icon={
                            <MuscleGlyph
                              group={g.id}
                              selected={selected.includes(g.id)}
                            />
                          }
                          key={g.id}
                          className={`nb-muscle-card ${selected.includes(g.id) ? "selected" : ""}`}
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
                          {g.name}
                        </DSChoice>
                      ))}
                    </div>
                    <DSStepper
                      label="Exercises"
                      value={String(count)}
                      min={Math.max(1, selected.length)}
                      max={
                        selected.length
                          ? Math.min(12, availableTargets(selected))
                          : 12
                      }
                      onChange={(value) => {
                        setCount(
                          Math.min(
                            selected.length ? availableTargets(selected) : 12,
                            12,
                            Math.max(1, selected.length, Number(value) || 1),
                          ),
                        );
                        setPlan(null);
                      }}
                      onDecrement={() => {
                        setCount((c) => Math.max(1, selected.length, c - 1));
                        setPlan(null);
                      }}
                      onIncrement={() => {
                        setCount((c) =>
                          Math.min(12, availableTargets(selected) || 12, c + 1),
                        );
                        setPlan(null);
                      }}
                      boundaryHint={
                        selected.length
                          ? `${selected.length}–${Math.min(12, availableTargets(selected))} exercises across distinct primary targets.`
                          : "Choose one or more muscle groups."
                      }
                    />
                    <DSButton
                      variant="primary"
                      className="personal-primary"
                      disabled={!selected.length}
                      onClick={() => (plan ? setReviewing(true) : makePlan())}
                    >
                      Build my workout <ChevronRight size={18} />
                    </DSButton>
                  </section>
                )}
                {reviewing && plan && (
                  <section className="personal-lineup">
                    <DSScreenHeader
                      title="Today’s workout"
                      register="Session draft · not saved until you start"
                      description={`${plan.groups.map((g) => groups.find((x) => x.id === g)?.name).join(" + ")} · ${plan.exercises.length} exercises`}
                      action={
                        <DSButton
                          variant="text"
                          onClick={() => {
                            setReviewing(false);
                            setSwapId(null);
                          }}
                        >
                          Change muscles
                        </DSButton>
                      }
                    />
                    <div className="nb-lineup">
                      {plan.exercises.map((x, i) => (
                        <article className="nb-lineup-row" key={x.id}>
                          <div className="personal-row">
                            <span className="nb-lineup-number">{i + 1}</span>
                            <div className="nb-lineup-info">
                              <h3>{x.name}</h3>
                              <p className="personal-muted">
                                {x.equipment} · {x.target}
                              </p>
                            </div>
                            <span className="nb-lineup-prescription">
                              {x.plannedSets} sets · {x.repMin}–{x.repMax} reps
                            </span>
                          </div>
                          <div className="nb-lineup-actions">
                            <DSButton
                              variant="text"
                              aria-label={`Customize ${x.name}`}
                              onClick={() =>
                                setCustomize(customize === x.id ? null : x.id)
                              }
                            >
                              Customize
                            </DSButton>
                            <DSButton
                              variant="text"
                              aria-label={`Swap ${x.name}`}
                              onClick={() =>
                                setSwapId((s) => (s === x.id ? null : x.id))
                              }
                            >
                              <ArrowLeftRight size={15} /> Swap
                            </DSButton>
                          </div>
                          {customize === x.id && (
                            <div className="personal-grid">
                              <label>
                                Sets
                                <DSInput
                                  id={`plan-sets-${x.id}`}
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
                                <DSInput
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
                                <DSInput
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
                          )}
                          {swapId === x.id && swapOptions(plan)}
                        </article>
                      ))}
                    </div>
                    <DSDisclosure
                      className="nb-coverage"
                      title="About muscle coverage"
                    >
                      <p className="personal-muted">
                        Each movement has a different primary target. Compound
                        exercises also use secondary muscles, so some overlap is
                        normal. This is a starting point, not a prescription.
                      </p>
                    </DSDisclosure>
                    <DSButton
                      variant="primary"
                      className="personal-primary"
                      disabled={busy || status === "error"}
                      onClick={() => void start()}
                    >
                      Start workout <ChevronRight size={18} />
                    </DSButton>
                  </section>
                )}
              </>
            )}
            {workout && exercise && (
              <>
                <DSScreenHeader
                  className="personal-session-heading"
                  title={workout.groups
                    .map((g) => groups.find((x) => x.id === g)?.name)
                    .join(" + ")}
                  register={`${date(workout.startedAt)} · ${recordedCount} ${recordedCount === 1 ? "set" : "sets"} recorded`}
                  action={
                    <DSButton variant="text" onClick={() => setFinishing(true)}>
                      Finish
                    </DSButton>
                  }
                />
                <div className="personal-exercise-stack">
                  {workout.exercises.map((x, i) => (
                    <DSSurface
                      as="article"
                      variant={x.id === exercise.id ? "worksheet" : "plain"}
                      className={`nb-exercise-card ${x.id === exercise.id ? "is-active" : "is-collapsed"}`}
                      key={x.id}
                    >
                      <div className="personal-row nb-exercise-top">
                        <DSButton
                          variant="text"
                          className="nb-exercise-heading"
                          aria-expanded={x.id === exercise.id}
                          onClick={() => {
                            setEdit(null);
                            setSwapId(null);
                            void update((s) => ({
                              ...s,
                              current: {
                                ...s.current!,
                                activeExerciseId: x.id,
                              },
                            }));
                          }}
                        >
                          <span className="nb-exercise-label">
                            <span className="nb-exercise-meta">
                              {i + 1} · {x.equipment} · {x.target}
                            </span>
                            <span
                              className="nb-exercise-title"
                              role="heading"
                              aria-level={2}
                            >
                              {x.name}
                            </span>
                            <span className="nb-exercise-meta">
                              {x.sets.length} / {x.plannedSets} sets recorded
                            </span>
                          </span>
                        </DSButton>
                        <DSButton
                          variant="text"
                          className="nb-swapbutton"
                          aria-label={`Swap ${x.name}`}
                          onClick={() => {
                            if (x.id !== exercise.id)
                              void update((s) => ({
                                ...s,
                                current: {
                                  ...s.current!,
                                  activeExerciseId: x.id,
                                },
                              }));
                            setSwapId((s) => (s === x.id ? null : x.id));
                          }}
                        >
                          <ArrowLeftRight size={18} /> Swap
                        </DSButton>
                      </div>
                      {x.id === exercise.id && (
                        <>
                          <p className="nb-target">
                            {x.plannedSets} sets · {x.repMin}–{x.repMax} reps
                          </p>
                          {hint?.previous && (
                            <p className="nb-last-time">
                              Last time:{" "}
                              {hint.previous.sets
                                .map((s) => actual(s, hint.previous!.unit))
                                .join(" · ")}
                              {x.sets.length === 0 &&
                                !x.pendingWeight.trim() &&
                                !x.pendingReps.trim() &&
                                hint.previous.sets[0] && (
                                  <DSButton
                                    variant="text"
                                    disabled={busy || status === "error"}
                                    onClick={() => {
                                      const previous = hint.previous?.sets[0];
                                      if (!previous || busy || blocked.current)
                                        return;
                                      void patchExercise(x.id, {
                                        pendingWeight: String(previous.weight),
                                        pendingReps: String(previous.reps),
                                      });
                                    }}
                                  >
                                    Use last time
                                  </DSButton>
                                )}
                            </p>
                          )}
                          {hint?.kind === "increase" && (
                            <p className="nb-progression">{hint.message}</p>
                          )}
                          {swapId === x.id && swapOptions(workout)}
                          <DSSetColumnLabels unit={x.unit} />
                          <div className="personal-sets">
                            {x.sets.map((s, index) =>
                              edit?.set === s.id ? (
                                <div className="nb-set-editor" key={s.id}>
                                  <DSSetRow
                                    state="editing"
                                    className="nb-set-row is-editing"
                                    number={index + 1}
                                    name={x.name}
                                    unit={x.unit}
                                    weight={edit.weight}
                                    reps={edit.reps}
                                    weightLabel="Edit weight"
                                    repsLabel="Edit reps"
                                    commitLabel="Save changes"
                                    onWeightChange={(weight) =>
                                      setEdit({ ...edit, weight })
                                    }
                                    onRepsChange={(reps) =>
                                      setEdit({ ...edit, reps })
                                    }
                                    onCommit={() => void saveEdit()}
                                    onCancel={() => setEdit(null)}
                                    onDelete={() => void removeSet(s, index)}
                                    disabled={busy || status === "error"}
                                  />
                                  <DSButton
                                    variant="text"
                                    disabled={busy || status === "error"}
                                    aria-label={`${s.repsInReserve === undefined ? "Add" : "Change"} effort for set ${index + 1} of ${x.name}`}
                                    onClick={() => openEffort(x, s)}
                                  >
                                    {s.repsInReserve === undefined
                                      ? "Add effort"
                                      : "Change effort"}
                                  </DSButton>
                                </div>
                              ) : (
                                <div className="nb-saved-set" key={s.id}>
                                  <DSSetRow
                                    state="saved"
                                    className="nb-set-row is-saved"
                                    number={index + 1}
                                    name={x.name}
                                    unit={x.unit}
                                    weight={s.weight}
                                    reps={s.reps}
                                    onEdit={() =>
                                      setEdit({
                                        exercise: x.id,
                                        set: s.id,
                                        weight: String(s.weight),
                                        reps: String(s.reps),
                                      })
                                    }
                                    editLabel={`Edit set ${index + 1}`}
                                    disabled={busy || status === "error"}
                                  />
                                  {s.repsInReserve !== undefined && (
                                    <DSButton
                                      variant="text"
                                      className="nb-effort-caption"
                                      aria-label={`Change effort for set ${index + 1} of ${x.name}`}
                                      onClick={() => openEffort(x, s)}
                                    >
                                      Set {index + 1} ·{" "}
                                      {effortLabel(s.repsInReserve)}
                                    </DSButton>
                                  )}
                                </div>
                              ),
                            )}
                            {(x.sets.length < x.plannedSets ||
                              extraRow === x.id ||
                              !!x.pendingWeight ||
                              !!x.pendingReps) && (
                              <DSSetRow
                                state={
                                  recording
                                    ? "saving"
                                    : status === "error" || !!draftError(x)
                                      ? "error"
                                      : "draft"
                                }
                                className="nb-set-row is-current"
                                number={x.sets.length + 1}
                                name={x.name}
                                unit={x.unit}
                                weight={x.pendingWeight}
                                reps={x.pendingReps}
                                weightLabel={`Weight (${x.unit})`}
                                repsLabel="Reps"
                                commitLabel={
                                  recording
                                    ? "Saving set"
                                    : `Log set ${x.sets.length + 1} for ${x.name}`
                                }
                                repsRef={repsRef}
                                onWeightChange={(pendingWeight) =>
                                  void patchExercise(x.id, { pendingWeight })
                                }
                                onRepsChange={(pendingReps) =>
                                  void patchExercise(x.id, { pendingReps })
                                }
                                onCommit={() => void log()}
                                disabled={busy}
                                commitDisabled={
                                  busy ||
                                  status === "error" ||
                                  !x.pendingWeight.trim() ||
                                  !x.pendingReps.trim() ||
                                  !!draftError(x)
                                }
                                error={draftError(x) || undefined}
                                onWeightKeyDown={(e) => {
                                  if (e.key === "Enter")
                                    repsRef.current?.focus();
                                }}
                                onRepsKeyDown={(e) => {
                                  if (e.key === "Enter") void log();
                                }}
                              />
                            )}
                            {Array.from(
                              {
                                length: Math.max(
                                  0,
                                  x.plannedSets - x.sets.length - 1,
                                ),
                              },
                              (_, n) => (
                                <DSSetRow
                                  key={`future-${n}`}
                                  state="future"
                                  className="nb-set-row is-future"
                                  number={x.sets.length + n + 2}
                                  name={x.name}
                                  unit={x.unit}
                                />
                              ),
                            )}
                          </div>
                          <div className="nb-set-actions">
                            {x.sets.length >= x.plannedSets &&
                              extraRow !== x.id &&
                              !x.pendingWeight &&
                              !x.pendingReps && (
                                <DSButton
                                  variant="secondary"
                                  className="personal-secondary"
                                  onClick={() => setExtraRow(x.id)}
                                >
                                  <Plus size={15} /> Add set
                                </DSButton>
                              )}
                            {x.sets.length > 0 && (
                              <DSButton
                                variant="secondary"
                                className="personal-secondary"
                                disabled={
                                  busy ||
                                  status === "error" ||
                                  !!x.pendingWeight.trim() ||
                                  !!x.pendingReps.trim()
                                }
                                title={
                                  x.pendingWeight.trim() || x.pendingReps.trim()
                                    ? "Log or clear your current entry before repeating a set."
                                    : "Record one more set at these exact values"
                                }
                                onClick={() => void log(x.sets.at(-1))}
                              >
                                Repeat {actual(x.sets.at(-1)!, x.unit)}
                              </DSButton>
                            )}
                          </div>
                          {x.sets.length > 0 &&
                            x.sets.at(-1)!.repsInReserve === undefined &&
                            !effortEdit && (
                              <DSButton
                                variant="text"
                                className="personal-text-button nb-effort-entry"
                                disabled={busy || status === "error"}
                                onClick={() => openEffort(x, x.sets.at(-1)!)}
                              >
                                How did that set feel?
                              </DSButton>
                            )}
                          {effortPanel(x)}
                          {comparison !== null && (
                            <p className="personal-muted">
                              Across {x.sets.length} recorded sets:{" "}
                              {comparison > 0 ? "+" : ""}
                              {comparison} reps at the same loads as last time.
                            </p>
                          )}
                          {undo && (
                            <DSButton
                              variant="secondary"
                              className="personal-secondary"
                              onClick={() => void restoreSet()}
                            >
                              <RotateCcw size={16} /> Undo deleted set
                            </DSButton>
                          )}
                          <DSDisclosure title="Setup & next-time settings">
                            <p className="personal-muted">
                              0 weight = bodyweight or no added load. Actuals
                              are never filled from your plan.
                            </p>
                            {hint?.message && (
                              <p className="personal-muted">{hint.message}</p>
                            )}
                            {hint?.previous && (
                              <small className="personal-muted">
                                Previous setup:{" "}
                                {hint.previous.gym || "Unspecified gym"} ·{" "}
                                {hint.previous.equipment} · {hint.previous.unit}
                              </small>
                            )}
                            <p className="personal-muted">
                              Comparisons use this exact movement, gym,
                              equipment and unit.
                            </p>
                            <label>
                              Gym / setup label
                              <DSInput
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
                              <DSInput
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
                                <DSInput
                                  aria-label="Working sets target"
                                  type="number"
                                  min="1"
                                  max="20"
                                  defaultValue={exercise.plannedSets}
                                  key={"sets" + exercise.id}
                                  onBlur={(e) => {
                                    const n = Number(e.target.value);
                                    if (
                                      Number.isInteger(n) &&
                                      n >= 1 &&
                                      n <= 20
                                    )
                                      void patchExercise(exercise.id, {
                                        plannedSets: n,
                                      });
                                    else {
                                      e.target.value = String(
                                        exercise.plannedSets,
                                      );
                                      setError("Use 1–20 planned sets.");
                                    }
                                  }}
                                />
                              </label>
                              <label>
                                Min reps
                                <DSInput
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
                                      void patchExercise(exercise.id, {
                                        repMin: n,
                                      });
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
                                <DSInput
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
                                      void patchExercise(exercise.id, {
                                        repMax: n,
                                      });
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
                              <DSInput
                                type="number"
                                min="0.1"
                                max="50"
                                step="0.1"
                                defaultValue={exercise.increment}
                                key={"increment" + exercise.id}
                                onBlur={(e) => {
                                  const n = Number(e.target.value);
                                  if (Number.isFinite(n) && n >= 0.1 && n <= 50)
                                    void patchExercise(exercise.id, {
                                      increment: n,
                                    });
                                  else {
                                    e.target.value = String(exercise.increment);
                                    setError(
                                      "Use a load increment from 0.1 to 50.",
                                    );
                                  }
                                }}
                              />
                            </label>
                          </DSDisclosure>
                        </>
                      )}
                    </DSSurface>
                  ))}
                </div>
                {workout.exercises.length > 1 && (
                  <DSButton
                    variant="secondary"
                    className="personal-secondary nb-next-exercise"
                    onClick={() => {
                      const i = workout.exercises.findIndex(
                        (x) => x.id === exercise.id,
                      );
                      const next =
                        workout.exercises[(i + 1) % workout.exercises.length];
                      setEdit(null);
                      setSwapId(null);
                      void update((s) => ({
                        ...s,
                        current: { ...s.current!, activeExerciseId: next.id },
                      }));
                    }}
                  >
                    Next exercise <ChevronRight size={18} />
                  </DSButton>
                )}
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
                      <DSButton
                        variant="primary"
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
                      </DSButton>
                    ) : (
                      <DSButton
                        variant="danger"
                        className="personal-danger"
                        onClick={() => {
                          void update((s) => ({ ...s, current: null })).then(
                            (saved) => {
                              if (saved) {
                                setFinishing(false);
                                setTab("home");
                              }
                            },
                          );
                        }}
                      >
                        Discard empty draft
                      </DSButton>
                    )}
                    <DSButton
                      variant="text"
                      onClick={() => setFinishing(false)}
                    >
                      Keep logging
                    </DSButton>
                  </section>
                )}
              </>
            )}
          </div>
        )}
        {overlay && (
          <dialog
            ref={overlayRef}
            className="two-sheet ds-theme"
            aria-label={
              overlay === "progress"
                ? "Training history and evidence"
                : "Settings and backup"
            }
            onCancel={(event) => {
              event.preventDefault();
              closeOverlay();
            }}
          >
            <div className="two-sheet-header">
              <h2>
                {overlay === "progress"
                  ? "Training history"
                  : "Settings & backup"}
              </h2>
              <DSButton
                variant="text"
                onClick={closeOverlay}
                aria-label="Close panel"
              >
                Close
              </DSButton>
            </div>
            {error && (
              <DSInlineNotice tone="error" title="Changes need attention">
                {error}
                {status === "error" && (
                  <DSButton variant="text" onClick={() => void retry()}>
                    Retry save
                  </DSButton>
                )}
                <DSButton variant="text" onClick={() => void download()}>
                  Export on-screen data
                </DSButton>
              </DSInlineNotice>
            )}
            {notice && (
              <DSInlineNotice tone="info" title="Notebook update">
                {notice}
              </DSInlineNotice>
            )}
            {overlay === "progress" && (
              <>
                <DSScreenHeader
                  title="Your training record"
                  description="Actual sets and comparable performance, in context."
                />
                {!state.history.length && (
                  <DSSurface
                    as="section"
                    variant="utility"
                    className="personal-card"
                  >
                    <Dumbbell />
                    <h2>Your first page is waiting.</h2>
                    <p>
                      Finish a workout and its actual sets will appear here.
                    </p>
                    <DSButton
                      variant="text"
                      onClick={() => {
                        closeOverlay();
                        setTab("today");
                      }}
                    >
                      Plan a workout
                    </DSButton>
                  </DSSurface>
                )}
                {state.history.length > 0 && (
                  <section aria-label="Muscle-group performance">
                    <h2>Performance by muscle group</h2>
                    <p className="personal-muted">
                      Based on comparable recorded lifts, not a measurement of
                      muscle growth.
                    </p>
                    <div className="nb-muscle-insights">
                      {groupInsights(state.history).map((group) => (
                        <article
                          className="nb-muscle-insight"
                          key={group.group}
                        >
                          <div className="personal-row">
                            <MuscleGlyph group={group.group} />
                            <h3>
                              {groups.find((g) => g.id === group.group)?.name}
                            </h3>
                          </div>
                          <DSComparisonEvidence
                            title={
                              group.improved
                                ? "Performance improving"
                                : group.comparable
                                  ? "No clear increase in comparable records"
                                  : "No comparable sessions yet"
                            }
                            summary={
                              group.comparable > 0
                                ? `${group.improved} of ${group.comparable} exercise comparisons improved`
                                : "Two matching sessions with complete sets will unlock comparisons."
                            }
                            qualification={
                              group.movements.some(
                                (m) =>
                                  m.summary.includes("effort was harder") ||
                                  m.summary.includes("felt harder"),
                              )
                                ? "Some work felt harder. Effort is subjective; inspect the matched records."
                                : group.movements.some(
                                      (m) =>
                                        m.comparable && !m.effortComparable,
                                    )
                                  ? "Effort not compared for every matched set. These are recorded performance changes, not measured muscle growth."
                                  : "Comparisons require matching movement, setup, unit and prescription. Effort is a subjective estimate."
                            }
                            evidence={
                              <>
                                {group.movements.map((movement) => (
                                  <div
                                    className="nb-insight-evidence"
                                    key={movement.key}
                                  >
                                    <h4>{movement.name}</h4>
                                    <p>{movement.summary}</p>
                                    {movement.previous && (
                                      <p className="nb-insight-date">
                                        Previous ·{" "}
                                        {date(movement.previous.date)} ·{" "}
                                        {movement.previous.exercise.gym ||
                                          "Unspecified gym"}{" "}
                                        · {movement.previous.exercise.equipment}
                                        <br />
                                        {movement.previous.exercise.sets
                                          .map((set) =>
                                            actual(
                                              set,
                                              movement.previous!.exercise.unit,
                                            ),
                                          )
                                          .join(" · ")}
                                      </p>
                                    )}
                                    {movement.current && (
                                      <p className="nb-insight-date">
                                        Latest · {date(movement.current.date)} ·{" "}
                                        {movement.current.exercise.gym ||
                                          "Unspecified gym"}{" "}
                                        · {movement.current.exercise.equipment}
                                        <br />
                                        {movement.current.exercise.sets
                                          .map((set) =>
                                            actual(
                                              set,
                                              movement.current!.exercise.unit,
                                            ),
                                          )
                                          .join(" · ")}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </>
                            }
                          />
                        </article>
                      ))}
                    </div>
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
                            ? x.sets
                                .map(
                                  (s) =>
                                    `${actual(s, x.unit)}${s.repsInReserve !== undefined ? ` (${effortLabel(s.repsInReserve)})` : ""}`,
                                )
                                .join(" · ")
                            : "No sets logged"}
                        </p>
                        <small className="personal-muted">
                          {x.gym || "Unspecified gym"} · {x.equipment}
                        </small>
                        {x.sets.length > 0 && (
                          <DSDisclosure title="Correct a set">
                            {x.sets.map((set, index) => (
                              <div className="personal-receipt" key={set.id}>
                                {edit?.set === set.id &&
                                edit.workout === w.id ? (
                                  <DSSetRow
                                    state="editing"
                                    className="nb-history-correction"
                                    number={index + 1}
                                    name={x.name}
                                    unit={x.unit}
                                    weight={edit.weight}
                                    reps={edit.reps}
                                    weightLabel="Correct history weight"
                                    repsLabel="Correct history reps"
                                    commitLabel="Save correction"
                                    onWeightChange={(weight) =>
                                      setEdit({ ...edit, weight })
                                    }
                                    onRepsChange={(reps) =>
                                      setEdit({ ...edit, reps })
                                    }
                                    onCommit={() => void saveEdit()}
                                    onCancel={() => setEdit(null)}
                                    disabled={busy || status === "error"}
                                  />
                                ) : (
                                  <>
                                    <span>Set {index + 1}</span>
                                    <strong>{actual(set, x.unit)}</strong>
                                    <DSButton
                                      variant="text"
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
                                    </DSButton>
                                  </>
                                )}
                                <DSButton
                                  variant="text"
                                  className="nb-effort-history"
                                  disabled={busy || status === "error"}
                                  aria-label={`${set.repsInReserve === undefined ? "Add" : "Change"} effort for set ${index + 1} of ${x.name}`}
                                  onClick={() => openEffort(x, set, w.id)}
                                >
                                  {set.repsInReserve === undefined
                                    ? "Add effort"
                                    : effortLabel(set.repsInReserve)}
                                </DSButton>
                              </div>
                            ))}
                            {effortPanel(x, w.id)}
                          </DSDisclosure>
                        )}
                      </div>
                    ))}
                  </article>
                ))}
              </>
            )}
            {overlay === "backup" && (
              <>
                <DSScreenHeader
                  title="Protect your notebook"
                  description="On this device. Available offline. Recoverable with an external backup."
                />
                <DSSurface
                  as="section"
                  variant="utility"
                  className="personal-card"
                >
                  <ShieldCheck />
                  <h2>Saved locally, not in an account.</h2>
                  <p>
                    Your workouts survive sessions and browser restarts on this
                    device and this site. Clearing site data, private browsing,
                    or losing your device can erase them. Download regular
                    backups.
                  </p>
                  <div className="personal-row">
                    <span>Browser storage protection</span>
                    <strong>{persistence}</strong>
                  </div>
                  <DSButton
                    variant="secondary"
                    className="personal-secondary"
                    onClick={() =>
                      void requestPersistence()
                        .then((p) =>
                          setPersistence(p ? "Granted" : "Not granted"),
                        )
                        .catch(() => setPersistence("Unsupported"))
                    }
                  >
                    Protect local storage
                  </DSButton>
                  <p className="personal-muted">
                    {offline
                      ? "Offline app available in this browser."
                      : "Offline assets are not confirmed yet. Reopen after installation."}
                  </p>
                  <p className="personal-muted">
                    Pin this site: iPhone Safari → Share → Add to Home Screen.
                    Android Chrome → menu → Install / Add to Home screen.
                  </p>
                </DSSurface>
                <DSSurface
                  as="section"
                  variant="utility"
                  className="personal-card"
                >
                  <h2>Backup & restore</h2>
                  <p>
                    Last download started:{" "}
                    {state.lastExportAt
                      ? new Date(state.lastExportAt).toLocaleString()
                      : "No backup yet"}
                  </p>
                  <DSButton
                    variant="primary"
                    className="personal-primary"
                    disabled={busy}
                    onClick={() => void download()}
                  >
                    <Download size={18} /> Export backup
                  </DSButton>
                  <label className="personal-secondary">
                    <Upload size={18} /> Choose backup file
                    <DSInput
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
                        {backupPreview?.draft ? " and an unfinished draft" : ""}
                        . Merge into your notebook? Existing records are kept.
                        Conflicting records are rejected rather than
                        overwritten.
                      </p>
                      <DSButton
                        variant="primary"
                        disabled={busy}
                        className="personal-primary"
                        onClick={() => void restore()}
                      >
                        Validate & merge backup
                      </DSButton>
                      <DSButton
                        variant="text"
                        onClick={() => setBackupText("")}
                      >
                        Cancel import
                      </DSButton>
                    </div>
                  )}
                </DSSurface>
                <DSSurface
                  as="section"
                  variant="utility"
                  className="personal-card"
                >
                  <h2>My defaults</h2>
                  <label>
                    Weight unit
                    <select
                      value={state.settings.unit}
                      onChange={(e) =>
                        void update((s) => ({
                          ...s,
                          settings: {
                            ...s.settings,
                            unit: e.target.value as Unit,
                          },
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
                    <DSInput
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
                    considered only after all intended sets reach the rep
                    ceiling in the same setup. Never auto-logs sets.
                  </p>
                </DSSurface>
              </>
            )}
          </dialog>
        )}
      </main>
    </div>
  );
}
