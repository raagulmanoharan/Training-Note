import type {
  MuscleGroup,
  PersonalExercise,
  PersonalSet,
  PersonalWorkout,
} from "./personalStore";
export const effortLabels: ReadonlyArray<{
  value: 0 | 1 | 2 | 3 | 4;
  label: string;
  rpe: string;
}> = [
  { value: 4, label: "4+ more", rpe: "About RPE 6 or less" },
  { value: 3, label: "3 more", rpe: "About RPE 7" },
  { value: 2, label: "2 more", rpe: "About RPE 8" },
  { value: 1, label: "1 more", rpe: "About RPE 9" },
  { value: 0, label: "No more", rpe: "About RPE 10" },
];
export function effortLabel(rir?: PersonalSet["repsInReserve"]): string {
  return rir === undefined
    ? ""
    : rir === 0
      ? "No reps left"
      : rir === 4
        ? "4+ reps left"
        : `${rir} ${rir === 1 ? "rep" : "reps"} left`;
}
export interface InsightRecord {
  workoutId: string;
  date: string;
  exercise: PersonalExercise;
}
export interface MovementInsight {
  key: string;
  name: string;
  group: MuscleGroup;
  status: "improved" | "steady" | "review" | "needs-history";
  summary: string;
  previous?: InsightRecord;
  current?: InsightRecord;
  effortComparable: boolean;
  comparable: boolean;
}
export interface GroupInsight {
  group: MuscleGroup;
  improved: number;
  comparable: number;
  movements: MovementInsight[];
}
function normalized(text: string): string {
  return text.trim().toLowerCase();
}
function identity(exercise: PersonalExercise): string {
  return JSON.stringify([
    exercise.catalogId,
    normalized(exercise.equipment),
    normalized(exercise.gym),
    exercise.unit,
  ]);
}
function occurrence(
  workout: PersonalWorkout,
  exercise: PersonalExercise,
): InsightRecord {
  return { workoutId: workout.id, date: workout.finishedAt!, exercise };
}
function setText(exercise: PersonalExercise): string {
  return exercise.sets
    .map((set) => `${set.weight} ${exercise.unit} × ${set.reps}`)
    .join(" / ");
}
export function movementInsights(
  history: PersonalWorkout[],
): MovementInsight[] {
  const buckets = new Map<
    string,
    Array<{ record: InsightRecord; ambiguous: boolean }>
  >();
  const finished = history
    .filter((workout) => Boolean(workout.finishedAt))
    .slice()
    .sort((a, b) => Date.parse(b.finishedAt!) - Date.parse(a.finishedAt!));
  for (const workout of finished) {
    const inSession = new Map<string, PersonalExercise[]>();
    for (const exercise of workout.exercises) {
      const key = identity(exercise);
      const existing = inSession.get(key) ?? [];
      existing.push(exercise);
      inSession.set(key, existing);
    }
    for (const [key, entries] of inSession) {
      const records = buckets.get(key) ?? [];
      records.push({
        record: occurrence(workout, entries[0]),
        ambiguous: entries.length !== 1,
      });
      buckets.set(key, records);
    }
  }
  return Array.from(buckets, ([key, records]) => {
    const current = records[0].record;
    const previous = records[1]?.record;
    const exercise = current.exercise;
    const base: MovementInsight = {
      key,
      name: exercise.name,
      group: exercise.group,
      status: "needs-history",
      summary:
        "Record this movement in the same gym, equipment and unit in two finished sessions to compare.",
      current,
      previous,
      effortComparable: false,
      comparable: false,
    };
    const review = (summary: string, comparable = false): MovementInsight => ({
      ...base,
      status: "review",
      summary,
      comparable,
    });
    if (!normalized(exercise.gym) || !normalized(exercise.equipment))
      return review(
        "Gym or equipment context is missing. Recorded loads are not compared across unknown setups.",
      );
    if (!previous) return base;
    const prior = previous.exercise;
    if (records[0].ambiguous || records[1].ambiguous)
      return review(
        "This movement appears more than once in a compared session. Review the original records; no block was chosen as the best result.",
      );
    if (
      exercise.catalogId === "assisted-pullup" ||
      normalized(exercise.equipment) === "bodyweight"
    )
      return review(
        exercise.catalogId === "assisted-pullup"
          ? "Assistance works in the opposite direction to added load. Review reps and assistance in the original records."
          : "Bodyweight records need additional context to compare difficulty. No automatic improvement claim.",
      );
    if (
      exercise.plannedSets !== prior.plannedSets ||
      exercise.repMin !== prior.repMin ||
      exercise.repMax !== prior.repMax
    )
      return review(
        "The set count or rep-range prescription changed. Review both sessions rather than treating the numbers as directly comparable.",
      );
    if (
      exercise.sets.length !== exercise.plannedSets ||
      prior.sets.length !== prior.plannedSets
    )
      return review(
        "One of the latest two occurrences has fewer or more recorded sets than planned. No older complete result was substituted.",
      );
    if (!exercise.sets.length)
      return review("No recorded working sets to compare.");
    const paired = exercise.sets.map((set, index) => ({
      now: set,
      before: prior.sets[index],
    }));
    const harder = paired.some(
      ({ now, before }) =>
        now.repsInReserve !== undefined &&
        before.repsInReserve !== undefined &&
        now.repsInReserve < before.repsInReserve,
    );
    const known = paired.every(
      ({ now, before }) =>
        now.repsInReserve !== undefined && before.repsInReserve !== undefined,
    );
    const nondecreasing = paired.every(
      ({ now, before }) =>
        now.weight >= before.weight && now.reps >= before.reps,
    );
    const increased = paired.some(
      ({ now, before }) => now.weight > before.weight || now.reps > before.reps,
    );
    const equal = paired.every(
      ({ now, before }) =>
        now.weight === before.weight && now.reps === before.reps,
    );
    const evidence = `${setText(prior)} → ${setText(exercise)}.`;
    if (nondecreasing && increased) {
      if (harder)
        return review(
          `Higher recorded performance; effort was harder on at least one matched set. ${evidence} This is not counted as a clear improvement at comparable effort.`,
          true,
        );
      return {
        ...base,
        status: "improved",
        comparable: true,
        effortComparable: known,
        summary: `Recorded load/reps improved across ordered sets. ${evidence} ${known ? "Estimated reps left were the same or greater on every set; effort is subjective." : "Effort not compared: some effort entries were not recorded."}`,
      };
    }
    if (equal)
      return {
        ...base,
        status: "steady",
        comparable: true,
        effortComparable: known && !harder,
        summary: `The recorded weights and reps were unchanged. ${evidence} ${harder ? "The latest work felt harder on at least one matched set." : known ? "Estimated effort is available for every matched set." : "Effort not compared: some effort entries were not recorded."}`,
      };
    return review(
      `No clear increase across all ordered sets; results were mixed or lower. ${evidence} Technique, fatigue and recovery are not measured here.`,
      true,
    );
  });
}
export function groupInsights(history: PersonalWorkout[]): GroupInsight[] {
  const groups = new Map<MuscleGroup, MovementInsight[]>();
  for (const movement of movementInsights(history)) {
    const list = groups.get(movement.group) ?? [];
    list.push(movement);
    groups.set(movement.group, list);
  }
  return Array.from(groups, ([group, movements]) => ({
    group,
    movements,
    improved: movements.filter((m) => m.status === "improved").length,
    comparable: movements.filter((m) => m.comparable).length,
  }));
}
