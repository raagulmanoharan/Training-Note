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
  MoreHorizontal,
  Trash2,
  X,
  Search,
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
import SessionCard from "./SessionCard";
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
  generateCustomPlan,
  suggestSwap,
  progression,
  availableTargets,
  makeExercise,
} from "./personalLogic";

type WorkoutAction =
  | { kind: "add"; scope: "plan" | "current" }
  | { kind: "remove-exercise"; exerciseId: string }
  | { kind: "delete-workout"; workoutId: string }
  | { kind: "discard-workout" };
type RemovedItem =
  | {
      kind: "exercise";
      scope: "plan" | "current";
      workoutId: string;
      exercise: PersonalExercise;
      index: number;
    }
  | {
      kind: "workout";
      scope: "current" | "history";
      workout: PersonalWorkout;
      index: number;
    }
  | {
      kind: "history-set";
      workoutId: string;
      exerciseId: string;
      set: PersonalSet;
      index: number;
    };

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
  const [action, setAction] = useState<WorkoutAction | null>(null);
  const [actionSearch, setActionSearch] = useState("");
  const [actionGroup, setActionGroup] = useState<MuscleGroup | "all">("all");
  const [removedItem, setRemovedItem] = useState<RemovedItem | null>(null);
  const [exerciseMenu, setExerciseMenu] = useState<string | null>(null);
  const actionRef = useRef<HTMLDialogElement>(null);
  const actionTrigger = useRef<HTMLElement | null>(null);
  const pendingActionSuccess = useRef<(() => void) | null>(null);
  function openAction(value: WorkoutAction) {
    actionTrigger.current = document.activeElement as HTMLElement | null;
    if (status !== "error") setError("");
    setActionSearch("");
    setActionGroup("all");
    setAction(value);
  }
  function closeAction() {
    setAction(null);
    requestAnimationFrame(() => {
      if (actionTrigger.current?.isConnected) actionTrigger.current.focus();
      else if (overlayRef.current?.open)
        overlayRef.current.querySelector<HTMLElement>("button")?.focus();
      else
        document
          .querySelector<HTMLElement>(
            ".nb-exercise-heading, .personal-brand button",
          )
          ?.focus();
    });
  }
  useEffect(() => {
    if (action && actionRef.current && !actionRef.current.open)
      actionRef.current.showModal();
  }, [action]);
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
  useEffect(() => {
    if (tab === "home") window.scrollTo({ top: 0, behavior: "instant" });
  }, [tab]);
  const [manualSelection, setManualSelection] = useState(false);
  const [pickedExercises, setPickedExercises] = useState<string[]>([]);
  const [exerciseSearch, setExerciseSearch] = useState("");
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
  useEffect(() => {
    if (reviewing && tab === "today" && !state?.current) {
      requestAnimationFrame(() =>
        window.scrollTo({ top: 0, behavior: "instant" }),
      );
    }
  }, [reviewing, tab]);
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
  const previousEditor = useRef<{ set: string; workout?: string } | null>(null);
  useEffect(() => {
    if (edit) {
      previousEditor.current = { set: edit.set, workout: edit.workout };
      const id = edit.set;
      requestAnimationFrame(() => {
        const input = document.querySelector<HTMLInputElement>(
          `[data-set-id="${CSS.escape(id)}"] input`,
        );
        input?.focus();
        input?.select();
      });
    } else if (previousEditor.current) {
      const target = previousEditor.current;
      previousEditor.current = null;
      requestAnimationFrame(() => {
        const row = document.querySelector<HTMLElement>(
          `[data-set-id="${CSS.escape(target.set)}"] button`,
        );
        if (row) row.focus();
        else if (target.workout)
          overlayRef.current?.querySelector<HTMLElement>("button")?.focus();
        else {
          const input = document.querySelector<HTMLElement>(
            ".nb-set-row.is-current input",
          );
          (
            input || document.querySelector<HTMLElement>(".nb-exercise-heading")
          )?.focus();
        }
      });
    }
  }, [edit?.set, edit?.workout]);
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
    effortTrigger = useRef<HTMLElement | null>(null),
    finishTrigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!finishing) return;
    const panel = document.getElementById("finish-confirmation");
    panel?.scrollIntoView({ block: "start" });
    panel?.focus({ preventScroll: true });
  }, [finishing]);
  function installState(s: PersonalState) {
    stateRef.current = s;
    revision.current = s.revision;
    setState(s);
  }
  async function load() {
    setLoadingError("");
    try {
      const loaded = await readState();
      pendingActionSuccess.current = null;
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
    if (busy) return;
    setBusy(true);
    blocked.current = false;
    setError("");
    if (await update((s) => ({ ...s }), false)) {
      const complete = pendingActionSuccess.current;
      pendingActionSuccess.current = null;
      complete?.();
    }
    setBusy(false);
  }
  function makePlan() {
    try {
      setPlan(
        manualSelection
          ? generateCustomPlan(pickedExercises, state!.settings)
          : generatePlan(selected, count, state!.settings),
      );
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
    const performed = previous.exercises.filter((x) => x.sets.length > 0);
    const exercises = (performed.length ? performed : previous.exercises).map(
      (x) => ({
        ...x,
        id: uid(),
        sets: [],
        plannedSets: x.sets.length || x.plannedSets,
        pendingWeight: "",
        pendingReps: "",
      }),
    );
    setPlan({
      id: uid(),
      startedAt: new Date().toISOString(),
      groups: [...previous.groups],
      exercises,
      activeExerciseId: exercises[0]?.id || "",
    });
    setSelected(
      Array.from(
        new Set(
          exercises.map(
            (e) =>
              catalogExercises.find((item) => item.id === e.catalogId)?.group ??
              e.group,
          ),
        ),
      ),
    );
    setPickedExercises(
      Array.from(new Set(exercises.map((e) => e.catalogId))).filter((id) =>
        catalogExercises.some((e) => e.id === id),
      ),
    );
    setManualSelection(true);
    setExerciseSearch("");
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
  async function commitAction(
    change: (s: PersonalState) => PersonalState,
    complete: () => void,
  ) {
    if (busy || blocked.current) return;
    setBusy(true);
    setError("");
    pendingActionSuccess.current = complete;
    if (await update(change, false)) {
      pendingActionSuccess.current = null;
      complete();
    }
    setBusy(false);
  }
  function removeFromPlan(id: string) {
    if (!plan) return;
    const index = plan.exercises.findIndex((item) => item.id === id);
    if (index < 0) return;
    const removed = plan.exercises[index];
    const next = plan.exercises.filter((item) => item.id !== id);
    setPlan({
      ...plan,
      exercises: next,
      groups: [...new Set(next.map((item) => item.group))],
      activeExerciseId: next[0]?.id || "",
    });
    setRemovedItem({
      kind: "exercise",
      scope: "plan",
      workoutId: plan.id,
      exercise: removed,
      index,
    });
    setSwapId(null);
    setCustomize(null);
  }
  async function addExercise(candidate: CatalogExercise) {
    if (action?.kind !== "add" || busy || blocked.current) return;
    const current =
      action.scope === "current" ? stateRef.current?.current : plan;
    if (
      !current ||
      !stateRef.current ||
      current.exercises.some((item) => item.catalogId === candidate.id)
    )
      return;
    if (current.exercises.length >= 100) {
      setError("This workout has reached the 100-exercise limit.");
      return;
    }
    const added = makeExercise(candidate, stateRef.current.settings);
    const next = {
      ...current,
      exercises: [...current.exercises, added],
      groups: [...new Set([...current.groups, added.group])],
      activeExerciseId: added.id,
    };
    if (action.scope === "plan") {
      setPlan(next);
      closeAction();
      return;
    }
    await commitAction(
      (s) => ({ ...s, current: next }),
      () => {
        closeAction();
        setExerciseMenu(null);
        setSwapId(null);
        setEdit(null);
        setEffortEdit(null);
        setExtraRow(null);
        setNotice(`${added.name} added.`);
        requestAnimationFrame(() =>
          document
            .querySelector<HTMLElement>(".nb-exercise-card.is-active")
            ?.scrollIntoView({ block: "start" }),
        );
      },
    );
  }
  async function removeExercise() {
    if (action?.kind !== "remove-exercise") return;
    const current = stateRef.current?.current;
    if (!current) return;
    const index = current.exercises.findIndex(
      (item) => item.id === action.exerciseId,
    );
    if (index < 0) return;
    const removed = current.exercises[index];
    const next = current.exercises.filter((item) => item.id !== removed.id);
    const recovery: RemovedItem = next.length
      ? {
          kind: "exercise",
          scope: "current",
          workoutId: current.id,
          exercise: removed,
          index,
        }
      : { kind: "workout", scope: "current", workout: current, index: 0 };
    await commitAction(
      (s) => ({
        ...s,
        current: next.length
          ? {
              ...current,
              exercises: next,
              groups: [...new Set(next.map((item) => item.group))],
              activeExerciseId:
                current.activeExerciseId === removed.id
                  ? next[Math.min(index, next.length - 1)].id
                  : current.activeExerciseId,
            }
          : null,
      }),
      () => {
        setRemovedItem(recovery);
        setUndo(null);
        setEdit(null);
        setEffortEdit(null);
        setExerciseMenu(null);
        setSwapId(null);
        closeAction();
        if (!next.length) {
          setFinishing(false);
          setTab("home");
        }
      },
    );
  }
  async function deleteWorkout() {
    if (action?.kind !== "delete-workout") return;
    const history = stateRef.current?.history || [];
    const index = history.findIndex((item) => item.id === action.workoutId);
    if (index < 0) return;
    const removed = history[index];
    await commitAction(
      (s) => ({
        ...s,
        history: s.history.filter((item) => item.id !== removed.id),
      }),
      () => {
        setRemovedItem({
          kind: "workout",
          scope: "history",
          workout: removed,
          index,
        });
        if (edit?.workout === removed.id) setEdit(null);
        if (effortEdit?.workout === removed.id) setEffortEdit(null);
        closeAction();
      },
    );
  }
  async function discardCurrentWorkout() {
    const current = stateRef.current?.current;
    if (!current) return;
    await commitAction(
      (s) => ({ ...s, current: null }),
      () => {
        setRemovedItem({
          kind: "workout",
          scope: "current",
          workout: current,
          index: 0,
        });
        setUndo(null);
        setEdit(null);
        setEffortEdit(null);
        setExerciseMenu(null);
        setSwapId(null);
        setFinishing(false);
        setNotice("");
        closeAction();
        setTab("home");
      },
    );
  }
  async function deleteHistorySet(
    workoutId: string,
    exerciseId: string,
    set: PersonalSet,
    index: number,
  ) {
    await commitAction(
      (s) => ({
        ...s,
        history: s.history.map((item) =>
          item.id !== workoutId
            ? item
            : {
                ...item,
                exercises: item.exercises.map((movement) =>
                  movement.id !== exerciseId
                    ? movement
                    : {
                        ...movement,
                        sets: movement.sets.filter(
                          (record) => record.id !== set.id,
                        ),
                      },
                ),
              },
        ),
      }),
      () => {
        setRemovedItem({
          kind: "history-set",
          workoutId,
          exerciseId,
          set,
          index,
        });
        setEdit(null);
        setEffortEdit(null);
      },
    );
  }
  async function restoreRemovedItem() {
    const recovery = removedItem;
    if (!recovery || busy || blocked.current || !stateRef.current) return;
    if (recovery.kind === "exercise" && recovery.scope === "plan") {
      if (!plan || plan.id !== recovery.workoutId) {
        setError(
          "That preview has changed. Add the exercise to your current plan instead.",
        );
        return;
      }
      const exercises = [...plan.exercises];
      if (!exercises.some((item) => item.id === recovery.exercise.id))
        exercises.splice(recovery.index, 0, recovery.exercise);
      setPlan({
        ...plan,
        exercises,
        groups: [...new Set(exercises.map((item) => item.group))],
        activeExerciseId: plan.activeExerciseId || recovery.exercise.id,
      });
      setRemovedItem(null);
      return;
    }
    const latest = stateRef.current;
    if (recovery.kind === "exercise") {
      if (!latest.current || latest.current.id !== recovery.workoutId) {
        setError(
          "That workout is no longer active. Its removed exercise cannot be added to a different session.",
        );
        return;
      }
      const exercises = [...latest.current.exercises];
      if (!exercises.some((item) => item.id === recovery.exercise.id))
        exercises.splice(recovery.index, 0, recovery.exercise);
      await commitAction(
        (s) => ({
          ...s,
          current: {
            ...s.current!,
            exercises,
            groups: [...new Set(exercises.map((item) => item.group))],
          },
        }),
        () => setRemovedItem(null),
      );
    } else if (recovery.kind === "workout") {
      if (
        recovery.scope === "current" &&
        latest.current &&
        latest.current.id !== recovery.workout.id
      ) {
        setError(
          "Another workout is active. Finish or discard it before restoring the removed session.",
        );
        return;
      }
      if (recovery.scope === "current") {
        if (latest.current?.id === recovery.workout.id) {
          setRemovedItem(null);
          setTab("today");
          return;
        }
        await commitAction(
          (s) => ({ ...s, current: recovery.workout }),
          () => {
            setRemovedItem(null);
            setTab("today");
          },
        );
      } else {
        const history = [...latest.history];
        if (!history.some((item) => item.id === recovery.workout.id))
          history.splice(
            Math.min(recovery.index, history.length),
            0,
            recovery.workout,
          );
        await commitAction(
          (s) => ({ ...s, history }),
          () => setRemovedItem(null),
        );
      }
    } else {
      const movement = latest.history
        .find((item) => item.id === recovery.workoutId)
        ?.exercises.find((item) => item.id === recovery.exerciseId);
      if (!movement) {
        setError(
          "The original workout is no longer available to restore this set.",
        );
        return;
      }
      const sets = [...movement.sets];
      if (!sets.some((item) => item.id === recovery.set.id))
        sets.splice(recovery.index, 0, recovery.set);
      await commitAction(
        (s) => ({
          ...s,
          history: s.history.map((item) =>
            item.id !== recovery.workoutId
              ? item
              : {
                  ...item,
                  exercises: item.exercises.map((x) =>
                    x.id !== recovery.exerciseId ? x : { ...x, sets },
                  ),
                },
          ),
        }),
        () => setRemovedItem(null),
      );
    }
  }
  const removedItemNotice = removedItem && (
    <div className="nb-undo-banner" role="status">
      <span>
        {removedItem.kind === "exercise"
          ? `${removedItem.exercise.name} removed.`
          : removedItem.kind === "history-set"
            ? "Set deleted."
            : removedItem.scope === "history"
              ? "Workout deleted."
              : "Workout removed."}
      </span>
      <DSButton
        variant="secondary"
        disabled={busy || status === "error"}
        aria-label={
          removedItem.kind === "exercise"
            ? "Undo removed exercise"
            : removedItem.kind === "history-set"
              ? "Undo deleted history set"
              : removedItem.scope === "history"
                ? "Undo deleted workout"
                : "Undo removed workout"
        }
        onClick={() => void restoreRemovedItem()}
      >
        <RotateCcw size={16} /> Undo
      </DSButton>
      <DSButton
        variant="text"
        aria-label="Dismiss undo"
        onClick={() => setRemovedItem(null)}
      >
        <X size={16} />
      </DSButton>
    </div>
  );
  async function start() {
    if (!plan || !plan.exercises.length) return;
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
    await commitAction(
      (s) => ({
        ...s,
        current: { ...plan, startedAt: new Date().toISOString() },
      }),
      () => {
        setPlan(null);
        setExerciseMenu(null);
        setCustomize(null);
        setSwapId(null);
        setPendingSwap(null);
        if (removedItem?.kind === "exercise" && removedItem.scope === "plan")
          setRemovedItem(null);
        setTab("today");
        setNotice("");
        requestAnimationFrame(() =>
          window.scrollTo({ top: 0, behavior: "instant" }),
        );
      },
    );
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
  async function swap(candidate: CatalogExercise, discardConfirmed = false) {
    if (busy || blocked.current) return;
    const w = stateRef.current?.current || plan;
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
    const next = {
      ...w,
      exercises: list,
      groups: [...new Set(list.map((item) => item.group))],
      activeExerciseId: replacement.id,
    };
    const complete = () => {
      setSwapId(null);
      setNotice(
        old.sets.length
          ? "Previous sets kept under their original exercise."
          : "Exercise replaced.",
      );
    };
    if (workout) await commitAction((s) => ({ ...s, current: next }), complete);
    else {
      setPlan(next);
      complete();
    }
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
    const sets = editedExercise.sets.map((s) =>
      s.id === edit.set ? { ...s, weight: w, reps: r } : s,
    );
    await commitAction(
      (s) =>
        edit.workout
          ? {
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
            }
          : {
              ...s,
              current: s.current
                ? {
                    ...s.current,
                    exercises: s.current.exercises.map((item) =>
                      item.id !== edit.exercise ? item : { ...item, sets },
                    ),
                  }
                : null,
            },
      () => {
        setEdit(null);
        setNotice("Set corrected. Original workout and set identity kept.");
      },
    );
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
    const target = exercise;
    await commitAction(
      (state) => ({
        ...state,
        current: state.current
          ? {
              ...state.current,
              exercises: state.current.exercises.map((item) =>
                item.id !== target.id
                  ? item
                  : {
                      ...item,
                      sets: item.sets.filter((record) => record.id !== s.id),
                    },
              ),
            }
          : null,
      }),
      () => {
        setUndo({ exercise: exercise.id, set: s, index });
        setEdit(null);
      },
    );
  }
  async function restoreSet() {
    if (!undo || !workout || busy || blocked.current) return;
    const x = workout.exercises.find((x) => x.id === undo.exercise);
    if (!x) return;
    const list = [...x.sets];
    list.splice(undo.index, 0, undo.set);
    await commitAction(
      (state) => ({
        ...state,
        current: state.current
          ? {
              ...state.current,
              exercises: state.current.exercises.map((item) =>
                item.id !== x.id ? item : { ...item, sets: list },
              ),
            }
          : null,
      }),
      () => setUndo(null),
    );
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
    const done = {
      ...w,
      finishedAt: new Date().toISOString(),
      exercises: w.exercises.map((x) => ({
        ...x,
        pendingWeight: "",
        pendingReps: "",
      })),
    };
    await commitAction(
      (s) => ({
        ...s,
        current: null,
        history: [done, ...s.history],
      }),
      () => {
        setFinishing(false);
        setTab("home");
        const finishedSets = done.exercises.reduce(
          (total, x) => total + x.sets.length,
          0,
        );
        setNotice(
          `Workout finished · ${finishedSets} ${finishedSets === 1 ? "set" : "sets"} recorded. Export a backup to protect it.`,
        );
        setUndo(null);
      },
    );
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
      <div
        className="personal-inline nb-swap-panel"
        role="group"
        aria-label={`Alternatives for ${x.name}`}
      >
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
              disabled={busy || status === "error"}
              onClick={() => void swap(pendingSwap.candidate, true)}
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
                className="personal-secondary nb-swap-choice"
                key={c.id}
                disabled={busy || status === "error"}
                onClick={() => void swap(c)}
              >
                <span>{c.name}</span>
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
          <div>
            <p>No other movement for this target in the current catalog.</p>
            <DSButton
              variant="secondary"
              onClick={() => {
                setSwapId(null);
                openAction({
                  kind: "add",
                  scope: workout ? "current" : "plan",
                });
              }}
            >
              <Plus size={16} /> Browse all exercises
            </DSButton>
          </div>
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
            <span>Training Note</span>
          )}
        </div>
        <div className="two-header-actions">
          <DSStatus state={status} className={`personal-status ${status}`} />
          {!(workout && tab === "today") && (
            <DSButton
              variant="text"
              aria-label="Settings and backup"
              onClick={() => openOverlay("backup")}
            >
              <Settings size={20} />
              <span className="visually-hidden">Settings</span>
            </DSButton>
          )}
        </div>
      </header>
      {workout && tab === "today" && (
        <SessionCard
          ref={finishTrigger}
          startedAt={workout.startedAt}
          savedSets={recordedCount}
          onFinish={() => setFinishing(true)}
        />
      )}
      <main className="personal-main">
        {error && !overlay && !action && (
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
        {notice && !overlay && !action && (
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
        {!overlay && removedItemNotice}
        {tab === "home" && (
          <TrainingHome
            state={state}
            onPlan={() => {
              setReviewing(Boolean(plan));
              setTab("today");
            }}
            onRepeat={repeatWorkout}
            onResume={() => setTab("today")}
            onEvidence={() => openOverlay("progress")}
          />
        )}
        {tab === "today" && (
          <div
            className={
              !workout
                ? `two-planner ${reviewing ? "nb-plan-preview" : "nb-planning"}`
                : "two-session"
            }
          >
            {!workout && (
              <>
                {!reviewing && (
                  <section className="personal-setup">
                    <DSScreenHeader
                      title="What are you training?"
                      description="Pick one or more muscle groups."
                    />
                    <div className="nb-muscle-grid">
                      {groups
                        .filter((g) => g.id !== "arms")
                        .map((g) => (
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
                              setPickedExercises((ids) =>
                                ids.filter((id) =>
                                  catalogExercises.some(
                                    (e) =>
                                      e.id === id && next.includes(e.group),
                                  ),
                                ),
                              );
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
                    <div
                      className="nb-planning-mode"
                      role="group"
                      aria-label="Workout planning mode"
                    >
                      <DSButton
                        variant={manualSelection ? "secondary" : "primary"}
                        aria-pressed={!manualSelection}
                        onClick={() => {
                          setManualSelection(false);
                          setPlan(null);
                        }}
                      >
                        Suggest exercises
                      </DSButton>
                      <DSButton
                        variant={manualSelection ? "primary" : "secondary"}
                        aria-pressed={manualSelection}
                        onClick={() => {
                          setManualSelection(true);
                          setPlan(null);
                        }}
                      >
                        Pick exercises
                      </DSButton>
                    </div>
                    {manualSelection ? (
                      <div className="nb-exercise-picker">
                        <label>
                          Find an exercise
                          <DSInput
                            type="search"
                            value={exerciseSearch}
                            onChange={(e) => setExerciseSearch(e.target.value)}
                            placeholder="Search exercises"
                          />
                        </label>
                        <p className="personal-muted">
                          {pickedExercises.length} selected · tap in your
                          workout order
                        </p>
                        {!selected.length && (
                          <p className="personal-muted">
                            Choose muscle groups above to see exercises.
                          </p>
                        )}
                        <div className="nb-picker-list">
                          {catalogExercises
                            .filter(
                              (e) =>
                                selected.includes(e.group) &&
                                e.name
                                  .toLowerCase()
                                  .includes(
                                    exerciseSearch.trim().toLowerCase(),
                                  ),
                            )
                            .map((e) => {
                              const index = pickedExercises.indexOf(e.id);
                              return (
                                <DSChoice
                                  key={e.id}
                                  selected={index >= 0}
                                  aria-label={e.name}
                                  disabled={
                                    index < 0 && pickedExercises.length >= 20
                                  }
                                  onClick={() => {
                                    setPickedExercises((ids) =>
                                      index >= 0
                                        ? ids.filter((id) => id !== e.id)
                                        : [...ids, e.id],
                                    );
                                    setPlan(null);
                                  }}
                                >
                                  <span>
                                    {index >= 0 ? `${index + 1}. ` : ""}
                                    {e.name}
                                  </span>
                                  <small>{e.equipment}</small>
                                </DSChoice>
                              );
                            })}
                          {!!selected.length &&
                            !catalogExercises.some(
                              (e) =>
                                selected.includes(e.group) &&
                                e.name
                                  .toLowerCase()
                                  .includes(
                                    exerciseSearch.trim().toLowerCase(),
                                  ),
                            ) && (
                              <p className="personal-muted">
                                No matching exercises. Try another name.
                              </p>
                            )}
                        </div>
                      </div>
                    ) : (
                      <>
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
                                selected.length
                                  ? availableTargets(selected)
                                  : 12,
                                12,
                                Math.max(
                                  1,
                                  selected.length,
                                  Number(value) || 1,
                                ),
                              ),
                            );
                            setPlan(null);
                          }}
                          onDecrement={() => {
                            setCount((c) =>
                              Math.max(1, selected.length, c - 1),
                            );
                            setPlan(null);
                          }}
                          onIncrement={() => {
                            setCount((c) =>
                              Math.min(
                                12,
                                availableTargets(selected) || 12,
                                c + 1,
                              ),
                            );
                            setPlan(null);
                          }}
                          boundaryHint={
                            selected.length
                              ? `${selected.length}–${Math.min(12, availableTargets(selected))} exercises across distinct primary targets.`
                              : "Choose one or more muscle groups."
                          }
                        />
                      </>
                    )}
                    <DSButton
                      variant="primary"
                      className="personal-primary"
                      disabled={
                        !selected.length ||
                        (manualSelection && !pickedExercises.length)
                      }
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
                                {x.plannedSets} sets · {x.repMin}–{x.repMax}{" "}
                                reps · {x.equipment}
                              </p>
                            </div>
                            <DSButton
                              variant="text"
                              className="nb-exercise-more"
                              aria-label={`More options for ${x.name}`}
                              aria-expanded={exerciseMenu === x.id}
                              onClick={() =>
                                setExerciseMenu(
                                  exerciseMenu === x.id ? null : x.id,
                                )
                              }
                            >
                              <MoreHorizontal size={20} />
                            </DSButton>
                          </div>
                          {exerciseMenu === x.id && (
                            <div
                              className="nb-lineup-actions nb-exercise-tools"
                              aria-label={`Options for ${x.name}`}
                            >
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
                              <DSButton
                                variant="text"
                                aria-label={`Remove ${x.name}`}
                                onClick={() => removeFromPlan(x.id)}
                              >
                                <Trash2 size={16} /> Remove
                              </DSButton>
                              <DSButton
                                variant="text"
                                aria-label={`Close options for ${x.name}`}
                                onClick={() => setExerciseMenu(null)}
                              >
                                <X size={16} /> Close
                              </DSButton>
                            </div>
                          )}
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
                    {!plan.exercises.length && (
                      <div className="nb-empty-plan">
                        <Dumbbell size={28} />
                        <h3>Build your workout</h3>
                        <p>
                          Add an exercise to start. Nothing has been logged yet.
                        </p>
                      </div>
                    )}
                    <DSButton
                      variant="secondary"
                      className="nb-add-exercise"
                      onClick={() => openAction({ kind: "add", scope: "plan" })}
                    >
                      <Plus size={18} /> Add exercise
                    </DSButton>
                    <DSDisclosure
                      className="nb-coverage"
                      title="About muscle coverage"
                    >
                      <p className="personal-muted">
                        Suggestions spread movements across primary targets. If
                        you pick exercises yourself, shared targets and
                        variations are allowed. Compound exercises can also
                        overlap. Adjust the editable sets and reps to your own
                        programme.
                      </p>
                    </DSDisclosure>
                    <DSButton
                      variant="primary"
                      className="personal-primary nb-review-start"
                      disabled={
                        busy || status === "error" || !plan.exercises.length
                      }
                      onClick={() => void start()}
                    >
                      Start workout <ChevronRight size={18} />
                    </DSButton>
                    <p className="personal-muted nb-plan-footnote">
                      Saved on this device when you start.
                    </p>
                  </section>
                )}
              </>
            )}
            {workout && exercise && (
              <>
                <div className="personal-exercise-stack">
                  {[
                    exercise,
                    ...workout.exercises.filter(
                      (item) => item.id !== exercise.id,
                    ),
                  ].map((x) => (
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
                            setExerciseMenu(null);
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
                            <span
                              className="nb-exercise-title"
                              role="heading"
                              aria-level={2}
                            >
                              {x.name}
                            </span>
                            {x.id !== exercise.id && (
                              <span className="nb-exercise-meta">
                                {x.sets.length} / {x.plannedSets} sets ·{" "}
                                {x.equipment}
                              </span>
                            )}
                          </span>
                          {x.id !== exercise.id &&
                            (x.sets.length >= x.plannedSets ? (
                              <Check size={20} aria-hidden="true" />
                            ) : (
                              <ChevronRight size={20} aria-hidden="true" />
                            ))}
                        </DSButton>
                        <DSButton
                          variant="text"
                          className="nb-exercise-more"
                          aria-label={`More options for ${x.name}`}
                          aria-expanded={exerciseMenu === x.id}
                          onClick={() =>
                            setExerciseMenu(exerciseMenu === x.id ? null : x.id)
                          }
                        >
                          <MoreHorizontal size={20} />
                        </DSButton>
                      </div>
                      {exerciseMenu === x.id && (
                        <div
                          className="nb-exercise-tools"
                          aria-label={`Options for ${x.name}`}
                        >
                          {x.id !== exercise.id && (
                            <DSButton
                              variant="secondary"
                              aria-label={`Swap ${x.name}`}
                              disabled={busy || status === "error"}
                              onClick={() => {
                                void update((s) => ({
                                  ...s,
                                  current: {
                                    ...s.current!,
                                    activeExerciseId: x.id,
                                  },
                                }));
                                setExerciseMenu(null);
                                setSwapId(x.id);
                                setEdit(null);
                              }}
                            >
                              <ArrowLeftRight size={16} /> Swap
                            </DSButton>
                          )}
                          <DSButton
                            variant="danger"
                            disabled={busy || status === "error"}
                            aria-label={`Remove ${x.name}`}
                            onClick={() =>
                              openAction({
                                kind: "remove-exercise",
                                exerciseId: x.id,
                              })
                            }
                          >
                            <Trash2 size={16} /> Remove exercise
                          </DSButton>
                          <DSButton
                            variant="text"
                            aria-label={`Close options for ${x.name}`}
                            onClick={() => setExerciseMenu(null)}
                          >
                            <X size={16} /> Close
                          </DSButton>
                        </div>
                      )}
                      {x.id === exercise.id && (
                        <>
                          <div className="nb-exercise-summary">
                            <p className="nb-target">
                              {x.equipment} · {x.plannedSets} sets · {x.repMin}–
                              {x.repMax} reps
                            </p>
                            <DSButton
                              variant="secondary"
                              className="nb-swapbutton"
                              aria-label={`Swap ${x.name}`}
                              disabled={busy || status === "error"}
                              onClick={() => {
                                setEdit(null);
                                setExerciseMenu(null);
                                setSwapId((current) =>
                                  current === x.id ? null : x.id,
                                );
                              }}
                            >
                              <ArrowLeftRight size={16} /> Swap
                            </DSButton>
                          </div>
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
                          {x.equipment.toLowerCase().includes("dumbbell") && (
                            <p className="nb-weight-convention">
                              Keep the same weight convention each visit: per
                              dumbbell or combined.
                            </p>
                          )}
                          {hint?.kind === "increase" && (
                            <p className="nb-progression">{hint.message}</p>
                          )}
                          {swapId === x.id && swapOptions(workout)}
                          {x.sets.length > 0 && (
                            <DSSetColumnLabels unit={x.unit} />
                          )}
                          <div className="personal-sets">
                            <div
                              className="nb-saved-ledger"
                              aria-label="Recorded sets, latest first"
                            >
                              {x.sets
                                .map((s, index) => ({ s, index }))
                                .reverse()
                                .map(({ s, index }) =>
                                  edit?.set === s.id ? (
                                    <div
                                      className="nb-set-editor"
                                      data-set-id={s.id}
                                      key={s.id}
                                    >
                                      <p className="nb-editing-label">
                                        Editing set {index + 1}
                                      </p>
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
                                        onDelete={() =>
                                          void removeSet(s, index)
                                        }
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
                                    <div
                                      className="nb-saved-set"
                                      data-set-id={s.id}
                                      key={s.id}
                                    >
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
                            </div>
                            {!(
                              edit &&
                              !edit.workout &&
                              edit.exercise === x.id
                            ) &&
                              (x.sets.length < x.plannedSets ||
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
                          </div>
                          {!(
                            edit &&
                            !edit.workout &&
                            edit.exercise === x.id
                          ) && (
                            <div className="nb-set-actions">
                              {x.sets.length >= x.plannedSets &&
                                extraRow !== x.id &&
                                !x.pendingWeight &&
                                !x.pendingReps && (
                                  <DSButton
                                    variant="secondary"
                                    className="personal-secondary nb-add-set"
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
                                    x.pendingWeight.trim() ||
                                    x.pendingReps.trim()
                                      ? "Log or clear your current entry before repeating a set."
                                      : "Record one more set at these exact values"
                                  }
                                  onClick={() => void log(x.sets.at(-1))}
                                >
                                  Log {actual(x.sets.at(-1)!, x.unit)} again
                                </DSButton>
                              )}
                              {workout.exercises.length > 1 && (
                                <DSButton
                                  variant="secondary"
                                  className="personal-secondary nb-next-exercise"
                                  onClick={() => {
                                    const i = workout.exercises.findIndex(
                                      (x) => x.id === exercise.id,
                                    );
                                    const next =
                                      workout.exercises[
                                        (i + 1) % workout.exercises.length
                                      ];
                                    setEdit(null);
                                    setSwapId(null);
                                    void update((s) => ({
                                      ...s,
                                      current: {
                                        ...s.current!,
                                        activeExerciseId: next.id,
                                      },
                                    }));
                                  }}
                                >
                                  Next exercise <ChevronRight size={18} />
                                </DSButton>
                              )}
                            </div>
                          )}
                          {x.sets.length > 0 &&
                            !(
                              edit &&
                              !edit.workout &&
                              edit.exercise === x.id
                            ) &&
                            x.sets.at(-1)!.repsInReserve === undefined &&
                            !effortEdit && (
                              <DSButton
                                variant="text"
                                className="personal-text-button nb-effort-entry"
                                endIcon={<Plus size={16} aria-hidden="true" />}
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
                <div className="nb-session-tools">
                  <DSButton
                    variant="secondary"
                    className="nb-add-exercise"
                    disabled={busy || status === "error"}
                    onClick={() =>
                      openAction({ kind: "add", scope: "current" })
                    }
                  >
                    <Plus size={18} /> Add exercise
                  </DSButton>
                  <DSDisclosure title="Workout options">
                    <DSButton
                      variant="danger"
                      disabled={busy || status === "error"}
                      onClick={() => openAction({ kind: "discard-workout" })}
                    >
                      <Trash2 size={16} /> Discard current workout
                    </DSButton>
                  </DSDisclosure>
                </div>
                {finishing && (
                  <section
                    className="personal-inline"
                    id="finish-confirmation"
                    tabIndex={-1}
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
                      {workout.exercises.reduce(
                        (a, x) => a + x.sets.length,
                        0,
                      ) === 1
                        ? "recorded set"
                        : "recorded sets"}{" "}
                      will be kept. Unfinished exercises stay visible as
                      partial.
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
                        disabled={busy || status === "error"}
                        onClick={() => void discardCurrentWorkout()}
                      >
                        Discard empty draft
                      </DSButton>
                    )}
                    <DSButton
                      variant="text"
                      onClick={() => {
                        setFinishing(false);
                        finishTrigger.current?.focus();
                      }}
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
            className={`two-sheet ds-theme ${overlay === "backup" ? "nb-settings" : "nb-history"}`}
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
                <X size={22} />
              </DSButton>
            </div>
            {error && !action && (
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
            {removedItemNotice}
            {overlay === "progress" && (
              <>
                {!state.history.length && (
                  <DSSurface
                    as="section"
                    variant="utility"
                    className="personal-card"
                  >
                    <Dumbbell />
                    <h2>No workouts recorded yet.</h2>
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
                  <DSDisclosure
                    title="Lift comparisons"
                    className="nb-history-comparisons"
                  >
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
                  </DSDisclosure>
                )}
                {state.history.map((w) => (
                  <article className="personal-progress-card" key={w.id}>
                    <div className="nb-history-header">
                      <h2>
                        {date(w.finishedAt || w.startedAt)}{" "}
                        <small>{w.groups.join(" + ")}</small>
                      </h2>
                      <DSButton
                        variant="text"
                        disabled={busy || status === "error"}
                        aria-label={`Delete workout from ${date(w.finishedAt || w.startedAt)}`}
                        onClick={() =>
                          openAction({
                            kind: "delete-workout",
                            workoutId: w.id,
                          })
                        }
                      >
                        <Trash2 size={18} />
                      </DSButton>
                    </div>
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
                              <div
                                className="personal-receipt"
                                data-set-id={set.id}
                                key={set.id}
                              >
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
                                    onDelete={() =>
                                      void deleteHistorySet(
                                        w.id,
                                        x.id,
                                        set,
                                        index,
                                      )
                                    }
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
        {action && (
          <dialog
            ref={actionRef}
            className="nb-action-sheet ds-theme"
            aria-label={
              action.kind === "add"
                ? "Add exercise"
                : action.kind === "remove-exercise"
                  ? "Remove exercise"
                  : action.kind === "discard-workout"
                    ? "Discard workout"
                    : "Delete workout"
            }
            onCancel={(event) => {
              event.preventDefault();
              if (!busy) closeAction();
            }}
          >
            <div className="nb-action-sheet-header">
              <h2>
                {action.kind === "add"
                  ? "Add exercise"
                  : action.kind === "remove-exercise"
                    ? "Remove exercise"
                    : action.kind === "discard-workout"
                      ? "Discard workout"
                      : "Delete workout"}
              </h2>
              <DSButton
                variant="text"
                disabled={busy}
                aria-label="Close dialog"
                onClick={closeAction}
              >
                <X size={22} />
              </DSButton>
            </div>
            {error && (
              <DSInlineNotice tone="error" title="Changes need attention">
                {error}
                {status === "error" && (
                  <DSButton
                    variant="secondary"
                    disabled={busy}
                    onClick={() => void retry()}
                  >
                    Retry save
                  </DSButton>
                )}
              </DSInlineNotice>
            )}
            {action.kind === "add" &&
              (() => {
                const target = action.scope === "plan" ? plan : workout;
                if (!target) return <p>This workout is no longer available.</p>;
                const query = actionSearch.trim().toLowerCase();
                const candidates = catalogExercises
                  .filter(
                    (item) =>
                      (actionGroup === "all" || item.group === actionGroup) &&
                      (!query ||
                        `${item.name} ${item.equipment} ${item.target} ${item.group}`
                          .toLowerCase()
                          .includes(query)),
                  )
                  .sort(
                    (a, b) =>
                      Number(target.groups.includes(b.group)) -
                      Number(target.groups.includes(a.group)),
                  );
                return (
                  <>
                    <label className="nb-catalog-search">
                      <Search size={18} aria-hidden="true" />
                      <span className="visually-hidden">Find an exercise</span>
                      <DSInput
                        autoFocus
                        type="search"
                        placeholder="Search exercises or equipment"
                        value={actionSearch}
                        onChange={(event) =>
                          setActionSearch(event.target.value)
                        }
                      />
                    </label>
                    <div
                      className="nb-catalog-filters"
                      aria-label="Filter exercises by muscle"
                    >
                      <DSChoice
                        selected={actionGroup === "all"}
                        onClick={() => setActionGroup("all")}
                      >
                        All
                      </DSChoice>
                      {groups
                        .filter((item) => item.id !== "arms")
                        .map((group) => (
                          <DSChoice
                            key={group.id}
                            selected={actionGroup === group.id}
                            onClick={() => setActionGroup(group.id)}
                          >
                            {group.name}
                          </DSChoice>
                        ))}
                    </div>
                    <div className="nb-exercise-catalog">
                      {busy && (
                        <p role="status" className="personal-muted">
                          Adding exercise…
                        </p>
                      )}
                      {candidates.map((candidate) => {
                        const exists = target.exercises.some(
                          (item) => item.catalogId === candidate.id,
                        );
                        return (
                          <DSButton
                            key={candidate.id}
                            variant="secondary"
                            className="nb-catalog-choice"
                            disabled={exists || busy || status === "error"}
                            aria-label={
                              exists
                                ? `${candidate.name} is already in this workout`
                                : `Add ${candidate.name}`
                            }
                            onClick={() => void addExercise(candidate)}
                          >
                            <MuscleGlyph group={candidate.group} />
                            <span>
                              <strong>{candidate.name}</strong>
                              <small>
                                {candidate.equipment} ·{" "}
                                {
                                  groups.find(
                                    (item) => item.id === candidate.group,
                                  )?.name
                                }
                              </small>
                            </span>
                            {exists ? (
                              <span className="nb-catalog-added">
                                <Check size={16} /> In workout
                              </span>
                            ) : (
                              <Plus size={20} />
                            )}
                          </DSButton>
                        );
                      })}
                      {!candidates.length && (
                        <div className="nb-catalog-empty">
                          <Search size={26} />
                          <h3>No exercises found</h3>
                          <p>
                            Try a movement, a piece of equipment or another
                            muscle group.
                          </p>
                          <DSButton
                            variant="secondary"
                            onClick={() => {
                              setActionSearch("");
                              setActionGroup("all");
                            }}
                          >
                            Clear filters
                          </DSButton>
                        </div>
                      )}
                    </div>
                    <DSButton
                      variant="text"
                      disabled={busy}
                      onClick={closeAction}
                    >
                      Cancel
                    </DSButton>
                  </>
                );
              })()}
            {action.kind === "remove-exercise" &&
              (() => {
                const target = workout?.exercises.find(
                  (item) => item.id === action.exerciseId,
                );
                if (!target)
                  return <p>This exercise is no longer in the workout.</p>;
                return (
                  <section className="nb-inline-confirm">
                    <h3>Remove {target.name}?</h3>
                    <p>
                      {target.sets.length
                        ? `${target.sets.length} recorded ${target.sets.length === 1 ? "set will" : "sets will"} be removed from this workout.`
                        : "This removes the exercise from today’s workout. No sets have been logged for it."}
                    </p>
                    {(target.pendingWeight.trim() ||
                      target.pendingReps.trim()) && (
                      <p>
                        Your unlogged {target.pendingWeight || "—"}{" "}
                        {target.unit} × {target.pendingReps || "—"} reps will
                        also be removed.
                      </p>
                    )}
                    {workout?.exercises.length === 1 && (
                      <p>
                        This is the last exercise, so the session will close.
                      </p>
                    )}
                    <p>You can undo this while the app stays open.</p>
                    <div className="nb-confirm-actions">
                      <DSButton
                        variant="secondary"
                        disabled={busy}
                        onClick={closeAction}
                      >
                        Keep exercise
                      </DSButton>
                      <DSButton
                        variant="danger"
                        disabled={busy || status === "error"}
                        onClick={() => void removeExercise()}
                      >
                        <Trash2 size={16} />
                        {busy ? "Removing…" : "Remove exercise"}
                      </DSButton>
                    </div>
                  </section>
                );
              })()}
            {action.kind === "delete-workout" &&
              (() => {
                const target = state.history.find(
                  (item) => item.id === action.workoutId,
                );
                if (!target)
                  return <p>This workout is no longer in your history.</p>;
                const sets = target.exercises.reduce(
                  (sum, item) => sum + item.sets.length,
                  0,
                );
                return (
                  <section className="nb-inline-confirm">
                    <h3>Delete this workout?</h3>
                    <p>
                      {date(target.finishedAt || target.startedAt)} ·{" "}
                      {target.groups
                        .map(
                          (group) =>
                            groups.find((item) => item.id === group)?.name,
                        )
                        .join(" + ")}{" "}
                      · {sets} recorded {sets === 1 ? "set" : "sets"}
                    </p>
                    <p>
                      It will be removed from your history and progress. You can
                      undo this while the app stays open.
                    </p>
                    <div className="nb-confirm-actions">
                      <DSButton
                        variant="secondary"
                        disabled={busy}
                        onClick={closeAction}
                      >
                        Keep workout
                      </DSButton>
                      <DSButton
                        variant="danger"
                        disabled={busy || status === "error"}
                        onClick={() => void deleteWorkout()}
                      >
                        <Trash2 size={16} />
                        {busy ? "Deleting…" : "Delete workout"}
                      </DSButton>
                    </div>
                  </section>
                );
              })()}
            {action.kind === "discard-workout" && workout && (
              <section className="nb-inline-confirm">
                <h3>Discard this workout?</h3>
                <p>
                  {workout.exercises.reduce(
                    (sum, item) => sum + item.sets.length,
                    0,
                  )}{" "}
                  recorded sets across {workout.exercises.length}{" "}
                  {workout.exercises.length === 1 ? "exercise" : "exercises"}{" "}
                  will be removed from this session.
                </p>
                {workout.exercises.some(
                  (item) =>
                    item.pendingWeight.trim() || item.pendingReps.trim(),
                ) && (
                  <p>
                    {
                      workout.exercises.filter(
                        (item) =>
                          item.pendingWeight.trim() || item.pendingReps.trim(),
                      ).length
                    }{" "}
                    unlogged{" "}
                    {workout.exercises.filter(
                      (item) =>
                        item.pendingWeight.trim() || item.pendingReps.trim(),
                    ).length === 1
                      ? "entry will"
                      : "entries will"}{" "}
                    also be removed.
                  </p>
                )}
                <p>
                  Nothing from this session will be added to your history. You
                  can undo this while the app stays open.
                </p>
                <div className="nb-confirm-actions">
                  <DSButton
                    variant="secondary"
                    disabled={busy}
                    onClick={closeAction}
                  >
                    Keep workout
                  </DSButton>
                  <DSButton
                    variant="danger"
                    disabled={busy || status === "error"}
                    onClick={() => void discardCurrentWorkout()}
                  >
                    <Trash2 size={16} />
                    {busy ? "Discarding…" : "Discard workout"}
                  </DSButton>
                </div>
              </section>
            )}
          </dialog>
        )}
      </main>
    </div>
  );
}
