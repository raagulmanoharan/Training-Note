import type { PersonalExercise, PersonalRestTimer } from "./personalStore";

export const MAX_REST_SECONDS = 3600;

/** A missing preference is off; old notebooks keep their existing behavior. */
export function createRestTimer(
  exercise: Pick<PersonalExercise, "id" | "restSeconds">,
  now = Date.now(),
): PersonalRestTimer | undefined {
  const durationSeconds = exercise.restSeconds ?? 0;
  if (
    !Number.isInteger(durationSeconds) ||
    durationSeconds <= 0 ||
    durationSeconds > MAX_REST_SECONDS
  )
    return undefined;
  return {
    exerciseId: exercise.id,
    endsAt: now + durationSeconds * 1000,
    durationSeconds,
  };
}

/** Derive elapsed time; a backgrounded tab never leaves the counter behind. */
export function remainingRestSeconds(
  timer: PersonalRestTimer,
  now = Date.now(),
): number {
  return Math.max(0, Math.ceil((timer.endsAt - now) / 1000));
}

export function extendRestTimer(
  timer: PersonalRestTimer,
  seconds = 30,
  now = Date.now(),
): PersonalRestTimer {
  const extension = Math.max(0, Math.floor(seconds));
  return {
    ...timer,
    endsAt: Math.min(
      Math.max(timer.endsAt, now) + extension * 1000,
      now + MAX_REST_SECONDS * 1000,
    ),
    durationSeconds: Math.min(
      MAX_REST_SECONDS,
      timer.durationSeconds + extension,
    ),
  };
}

export function formatRestTime(seconds: number): string {
  const whole = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
}
