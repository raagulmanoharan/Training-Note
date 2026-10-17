export type MuscleGroup =
  "chest" | "back" | "shoulders" | "legs" | "arms" | "core";
export type Unit = "kg" | "lb";
export interface PersonalSet {
  id: string;
  weight: number;
  reps: number;
  loggedAt: string;
  repsInReserve?: 0 | 1 | 2 | 3 | 4;
}
export interface PersonalExercise {
  id: string;
  catalogId: string;
  name: string;
  group: MuscleGroup;
  target: string;
  equipment: string;
  gym: string;
  unit: Unit;
  sets: PersonalSet[];
  plannedSets: number;
  repMin: number;
  repMax: number;
  increment: number;
  pendingWeight: string;
  pendingReps: string;
}
export interface PersonalWorkout {
  id: string;
  startedAt: string;
  finishedAt?: string;
  groups: MuscleGroup[];
  exercises: PersonalExercise[];
  activeExerciseId: string;
}
export interface PersonalState {
  schemaVersion: 1;
  revision: number;
  current: PersonalWorkout | null;
  history: PersonalWorkout[];
  settings: { unit: Unit; gym: string; progressionEnabled: boolean };
  lastExportAt: string | null;
}
export const defaultState = (): PersonalState => ({
  schemaVersion: 1,
  revision: 0,
  current: null,
  history: [],
  settings: { unit: "kg", gym: "", progressionEnabled: false },
  lastExportAt: null,
});
const DB_NAME = "personal-gym-notebook";
function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore("state");
    let blocked = false;
    request.onblocked = () => {
      blocked = true;
      reject(
        new Error(
          "Notebook storage is waiting for another tab. Close other notebook tabs, then reload this page. Existing progress has not been replaced.",
        ),
      );
    };
    request.onsuccess = () => {
      if (blocked) request.result.close();
      else {
        request.result.onversionchange = () => request.result.close();
        resolve(request.result);
      }
    };
    request.onerror = () =>
      reject(
        new Error(
          "Local storage could not open. Your existing data has not been replaced.",
        ),
      );
  });
}
export async function readState(): Promise<PersonalState> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("state", "readonly");
    const request = tx.objectStore("state").get("main");
    let result = defaultState();
    request.onsuccess = () => {
      result = request.result ?? defaultState();
    };
    tx.oncomplete = () => {
      db.close();
      try {
        validateState(result);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    tx.onerror = () => {
      db.close();
      reject(new Error("Could not read saved progress."));
    };
  });
}
export async function saveState(
  next: PersonalState,
  expectedRevision: number,
): Promise<PersonalState> {
  validateState(next);
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction("state", "readwrite");
    const store = tx.objectStore("state");
    const get = store.get("main");
    let saved: PersonalState;
    let conflict = false;
    get.onsuccess = () => {
      const revision = get.result?.revision ?? 0;
      if (revision !== expectedRevision) {
        conflict = true;
        tx.abort();
        return;
      }
      saved = structuredClone({ ...next, revision: revision + 1 });
      store.put(saved, "main");
    };
    tx.oncomplete = () => {
      db.close();
      resolve(saved);
    };
    tx.onabort = tx.onerror = () => {
      db.close();
      reject(
        new Error(
          conflict
            ? "Another tab changed your notebook. Reload the latest saved version before continuing. Your unsaved entries are still on this screen."
            : "Could not save to this device. Keep this page open and try again; download a backup when possible.",
        ),
      );
    };
  });
}
export async function requestPersistence(): Promise<boolean> {
  return navigator.storage?.persist ? navigator.storage.persist() : false;
}
const validGroups = new Set([
  "chest",
  "back",
  "shoulders",
  "legs",
  "arms",
  "core",
]);
function fail(): never {
  throw new Error(
    "This notebook or backup is invalid or uses an unsupported version. Nothing was imported.",
  );
}
function string(value: unknown, max = 500): value is string {
  return typeof value === "string" && value.length <= max;
}
function date(value: unknown): value is string {
  return string(value, 50) && Number.isFinite(Date.parse(value));
}
function finite(value: unknown, min: number, max: number) {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    value >= min &&
    value <= max
  );
}
function integer(value: unknown, min: number, max: number) {
  return finite(value, min, max) && Number.isInteger(value);
}
export function validateState(input: unknown): asserts input is PersonalState {
  const s = input as PersonalState;
  if (
    !s ||
    s.schemaVersion !== 1 ||
    !(
      s.current === null ||
      (typeof s.current === "object" &&
        s.current !== null &&
        !Array.isArray(s.current))
    ) ||
    !integer(s.revision, 0, Number.MAX_SAFE_INTEGER) ||
    !s.settings ||
    !["kg", "lb"].includes(s.settings.unit) ||
    !string(s.settings.gym, 120) ||
    typeof s.settings.progressionEnabled !== "boolean" ||
    !(s.lastExportAt === null || date(s.lastExportAt)) ||
    !Array.isArray(s.history) ||
    s.history.length > 50000
  )
    fail();
  const workoutIds = new Set<string>();
  const exerciseIds = new Set<string>();
  const setIds = new Set<string>();
  for (const w of [...s.history, ...(s.current ? [s.current] : [])]) {
    if (
      !w ||
      !string(w.id, 100) ||
      !w.id ||
      workoutIds.has(w.id) ||
      !date(w.startedAt) ||
      !(w.finishedAt === undefined || date(w.finishedAt)) ||
      !Array.isArray(w.groups) ||
      !w.groups.length ||
      !w.groups.every((g) => validGroups.has(g)) ||
      !Array.isArray(w.exercises) ||
      !w.exercises.length ||
      w.exercises.length > 100 ||
      !string(w.activeExerciseId, 100)
    )
      fail();
    workoutIds.add(w.id);
    for (const e of w.exercises) {
      if (
        !e ||
        !string(e.id, 100) ||
        !e.id ||
        exerciseIds.has(e.id) ||
        !string(e.catalogId, 100) ||
        !string(e.name, 150) ||
        !e.name ||
        !validGroups.has(e.group) ||
        !string(e.target, 100) ||
        !string(e.equipment, 120) ||
        !string(e.gym, 120) ||
        !["kg", "lb"].includes(e.unit) ||
        !integer(e.plannedSets, 1, 30) ||
        !integer(e.repMin, 1, 100) ||
        !integer(e.repMax, e.repMin, 100) ||
        !finite(e.increment, 0.1, 50) ||
        !string(e.pendingWeight, 30) ||
        !string(e.pendingReps, 30) ||
        !Array.isArray(e.sets) ||
        e.sets.length > 500
      )
        fail();
      exerciseIds.add(e.id);
      for (const set of e.sets) {
        if (
          !set ||
          !string(set.id, 100) ||
          !set.id ||
          setIds.has(set.id) ||
          !finite(set.weight, 0, 2000) ||
          !integer(set.reps, 1, 1000) ||
          !date(set.loggedAt) ||
          (Object.prototype.hasOwnProperty.call(set, "repsInReserve") &&
            !integer(set.repsInReserve, 0, 4))
        )
          fail();
        setIds.add(set.id);
      }
    }
    if (!w.exercises.some((e) => e.id === w.activeExerciseId)) fail();
  }
  if (s.history.some((w) => !w.finishedAt) || s.current?.finishedAt) fail();
}
function canonical(value: unknown): string {
  if (Array.isArray(value)) return "[" + value.map(canonical).join(",") + "]";
  if (value !== null && typeof value === "object")
    return (
      "{" +
      Object.keys(value)
        .sort()
        .map(
          (key) =>
            JSON.stringify(key) +
            ":" +
            canonical((value as Record<string, unknown>)[key]),
        )
        .join(",") +
      "}"
    );
  return JSON.stringify(value);
}
async function checksum(value: unknown): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(canonical(value)),
  );
  return Array.from(new Uint8Array(digest), (x) =>
    x.toString(16).padStart(2, "0"),
  ).join("");
}
export async function exportBackup(state: PersonalState): Promise<string> {
  validateState(state);
  const payload = {
    format: "personal-gym-notebook",
    version: 1,
    exportedAt: new Date().toISOString(),
    state,
  };
  return JSON.stringify(
    { ...payload, checksum: await checksum(payload) },
    null,
    2,
  );
}
export async function inspectBackup(
  text: string,
): Promise<{ state: PersonalState; exportedAt: string }> {
  if (text.length > 30_000_000) fail();
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    fail();
  }
  if (
    !parsed ||
    parsed.format !== "personal-gym-notebook" ||
    parsed.version !== 1 ||
    !date(parsed.exportedAt) ||
    !string(parsed.checksum, 64)
  )
    fail();
  const { checksum: given, ...payload } = parsed;
  if ((await checksum(payload)) !== given)
    throw new Error(
      "Backup verification failed. The file is damaged or changed. Nothing was imported.",
    );
  validateState(parsed.state);
  return { state: parsed.state, exportedAt: parsed.exportedAt };
}
export async function importBackup(
  text: string,
  current: PersonalState,
): Promise<PersonalState> {
  const { state: incoming } = await inspectBackup(text);
  const local = new Map(current.history.map((w) => [w.id, w]));
  for (const workout of incoming.history) {
    if (workout.id === current.current?.id)
      throw new Error(
        "This backup conflicts with your active workout. Finish or discard that draft before importing.",
      );
    const existing = local.get(workout.id);
    if (existing && canonical(existing) !== canonical(workout))
      throw new Error(
        "This backup contains a different version of an existing workout. Nothing was imported.",
      );
    local.set(workout.id, workout);
  }
  let active = current.current;
  if (incoming.current) {
    if (local.has(incoming.current.id))
      throw new Error(
        "The backup draft conflicts with a finished workout. Nothing was imported.",
      );
    if (active && canonical(active) !== canonical(incoming.current))
      throw new Error(
        "Both this device and the backup have unfinished workouts. Finish or discard your draft before importing.",
      );
    active = active ?? incoming.current;
  }
  const merged = {
    ...current,
    current: active,
    history: Array.from(local.values()).sort((a, b) =>
      b.startedAt.localeCompare(a.startedAt),
    ),
    settings:
      current.history.length || current.current
        ? current.settings
        : incoming.settings,
  };
  validateState(merged);
  return saveState(merged, current.revision);
}
