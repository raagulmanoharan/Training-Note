import type {
  MuscleGroup,
  PersonalExercise,
  PersonalWorkout,
  PersonalState,
} from "./personalStore";
import { exercises, type CatalogExercise } from "./personalCatalog";
export function makeExercise(
  item: CatalogExercise,
  settings: PersonalState["settings"],
): PersonalExercise {
  return {
    id: crypto.randomUUID(),
    catalogId: item.id,
    name: item.name,
    group: item.group,
    target: item.target,
    equipment: item.equipment,
    gym: settings.gym,
    unit: settings.unit,
    sets: [],
    plannedSets: 3,
    repMin: 8,
    repMax: 12,
    increment: settings.unit === "kg" ? 2.5 : 5,
    pendingWeight: "",
    pendingReps: "",
  };
}
export function availableTargets(selected: MuscleGroup[]): number {
  return new Set(
    exercises
      .filter(
        (e) =>
          selected.includes(e.group) ||
          (selected.includes("arms") &&
            (e.group === "biceps" || e.group === "triceps")),
      )
      .map((e) => e.group + ":" + e.target),
  ).size;
}
export function generatePlan(
  selected: MuscleGroup[],
  count: number,
  settings: PersonalState["settings"],
): PersonalWorkout {
  if (
    !selected.length ||
    !Number.isInteger(count) ||
    count < new Set(selected).size ||
    count > availableTargets(selected)
  )
    throw new Error(
      "Choose muscle groups and a number within the available distinct movement targets.",
    );
  const uniqueGroups = Array.from(new Set(selected));
  const pools = uniqueGroups.map((group) =>
    exercises.filter(
      (e) =>
        e.group === group ||
        (group === "arms" && (e.group === "biceps" || e.group === "triceps")),
    ),
  );
  const chosen: CatalogExercise[] = [];
  const used = new Set<string>();
  while (chosen.length < count) {
    let added = false;
    for (const pool of pools) {
      const next = pool.find((e) => !used.has(e.group + ":" + e.target));
      if (next) {
        chosen.push(next);
        used.add(next.group + ":" + next.target);
        added = true;
        if (chosen.length === count) break;
      }
    }
    if (!added) break;
  }
  const planned = chosen.map((e) => makeExercise(e, settings));
  return {
    id: crypto.randomUUID(),
    startedAt: new Date().toISOString(),
    groups: Array.from(new Set(planned.map((e) => e.group))),
    exercises: planned,
    activeExerciseId: planned[0].id,
  };
}
/** Explicit exercise choices may share targets; suggestions keep their existing coverage rule. */
export function generateCustomPlan(
  ids: string[],
  settings: PersonalState["settings"],
): PersonalWorkout {
  if (!ids.length || ids.length > 20 || new Set(ids).size !== ids.length)
    throw new Error("Choose 1–20 different exercises.");
  const chosen = ids.map((id) => exercises.find((e) => e.id === id));
  if (chosen.some((e) => !e))
    throw new Error(
      "One of the selected exercises is unavailable. Choose it again.",
    );
  const planned = chosen.map((e) => makeExercise(e!, settings));
  return {
    id: crypto.randomUUID(),
    startedAt: new Date().toISOString(),
    groups: Array.from(new Set(planned.map((e) => e.group))),
    exercises: planned,
    activeExerciseId: planned[0].id,
  };
}
export function suggestSwap(
  exercise: PersonalExercise,
  workout: PersonalWorkout,
): CatalogExercise[] {
  const canonical = exercises.find((item) => item.id === exercise.catalogId);
  const primaryGroup = canonical?.group ?? exercise.group;
  const primaryTarget = canonical?.target ?? exercise.target;
  return exercises.filter(
    (candidate) =>
      candidate.target === primaryTarget &&
      candidate.group === primaryGroup &&
      candidate.id !== exercise.catalogId &&
      !workout.exercises.some(
        (e) => e.id !== exercise.id && e.catalogId === candidate.id,
      ),
  );
}
export interface Progression {
  kind: "none" | "hold" | "increase" | "review";
  message: string;
  previous: PersonalExercise | null;
  suggestedWeight?: number;
}
export function progression(
  exercise: PersonalExercise,
  history: PersonalWorkout[],
  enabled: boolean,
): Progression {
  const identity = (e: PersonalExercise) =>
    e.catalogId === exercise.catalogId &&
    e.equipment.trim().toLowerCase() ===
      exercise.equipment.trim().toLowerCase() &&
    e.unit === exercise.unit &&
    e.gym.trim().toLowerCase() === exercise.gym.trim().toLowerCase();
  const previous =
    history
      .filter((w) => w.finishedAt)
      .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
      .flatMap((w) => w.exercises)
      .find((e) => identity(e) && e.sets.length > 0) ?? null;
  if (!previous)
    return {
      kind: "none",
      message:
        "First record for this exercise and setup. Choose a comfortable working load.",
      previous: null,
    };
  if (!enabled)
    return {
      kind: "hold",
      message: "Last time shown as a reference. Progression hints are off.",
      previous,
    };
  if (!exercise.gym.trim() || !exercise.equipment.trim())
    return {
      kind: "review",
      message:
        "Add a gym/setup label before comparing loads. Machines and setups can differ.",
      previous,
    };
  if (exercise.catalogId === "assisted-pullup")
    return {
      kind: "review",
      message:
        "This machine records assistance: a larger number makes the movement easier. Review controlled reps and assistance together; automatic load increases are disabled.",
      previous,
    };
  if (
    exercise.repMin !== previous.repMin ||
    exercise.repMax !== previous.repMax
  )
    return {
      kind: "review",
      message:
        "Your rep range changed. Review the previous sets against this new plan before changing load.",
      previous,
    };
  if (exercise.equipment === "Bodyweight")
    return {
      kind: "hold",
      message:
        "Build comfortable reps with consistent form. Bodyweight load is not comparable to added weight.",
      previous,
    };
  if (previous.sets.length !== exercise.plannedSets)
    return {
      kind: "review",
      message:
        "Previous set count differs from this plan. Review the full record before changing load.",
      previous,
    };
  const sameLoad = previous.sets.every(
    (s) => s.weight === previous.sets[0].weight,
  );
  if (!sameLoad)
    return {
      kind: "review",
      message:
        "Previous loads varied between sets. Review each set before choosing today’s load.",
      previous,
    };
  if (previous.sets.every((s) => s.reps >= exercise.repMax)) {
    const weight = previous.sets[0].weight + exercise.increment;
    if (!Number.isFinite(weight) || weight > 2000)
      return {
        kind: "review",
        message:
          "The calculated load is outside the supported range. Review the plan and equipment before changing weight.",
        previous,
      };
    return {
      kind: "increase",
      message: `You logged all ${previous.sets.length} sets at ${exercise.repMax}+ reps. If form was controlled and it felt appropriate, consider ${weight} ${exercise.unit}; otherwise repeat.`,
      previous,
      suggestedWeight: weight,
    };
  }
  return {
    kind: "hold",
    message: `Repeat a manageable load and build toward ${exercise.repMax} controlled reps on every planned set. No increase is required.`,
    previous,
  };
}
