import { expect, test } from "@playwright/test";

test("rest: older signed backups and optional timer fields round-trip without mutation", async ({
  page,
}) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const store = await import("/frontend/src/personalStore.ts");
    const { generatePlan } = await import("/frontend/src/personalLogic.ts");
    const { createRestTimer } = await import("/frontend/src/restLogic.ts");
    const state = store.defaultState();
    state.current = generatePlan(["chest", "back"], 4, state.settings);
    const original = structuredClone(state);
    // Reproduce the pre-rest export algorithm to prove backward compatibility.
    const oldCanonical = (value: any): string => {
      if (Array.isArray(value))
        return "[" + value.map(oldCanonical).join(",") + "]";
      if (value !== null && typeof value === "object")
        return (
          "{" +
          Object.keys(value)
            .sort()
            .map((key) => JSON.stringify(key) + ":" + oldCanonical(value[key]))
            .join(",") +
          "}"
        );
      return JSON.stringify(value);
    };
    const payload = {
      format: "personal-gym-notebook",
      version: 1,
      exportedAt: new Date().toISOString(),
      state,
    };
    const digest = await crypto.subtle.digest(
      "SHA-256",
      new TextEncoder().encode(oldCanonical(payload)),
    );
    const checksum = Array.from(new Uint8Array(digest), (x) =>
      x.toString(16).padStart(2, "0"),
    ).join("");
    const legacy = await store.inspectBackup(
      JSON.stringify({ ...payload, checksum }),
    );
    const exercise = state.current.exercises[0];
    exercise.restSeconds = 90;
    state.current.restTimer = createRestTimer(exercise, 1_800_000_000_000);
    const saved = await store.saveState(state, 0);
    const actual = await store.readState();
    const modern = await store.inspectBackup(await store.exportBackup(saved));
    saved.current!.restTimer = undefined;
    saved.current!.exercises[0].restSeconds = undefined;
    const without = await store.inspectBackup(await store.exportBackup(saved));
    return {
      legacy: legacy.state,
      original,
      actual,
      modern: modern.state,
      without: without.state,
    };
  });
  expect(result.legacy).toEqual(result.original);
  expect(result.legacy.current).not.toHaveProperty("restTimer");
  expect(result.legacy.current!.exercises[0]).not.toHaveProperty("restSeconds");
  expect(result.modern).toEqual(result.actual);
  expect(result.modern.current!.restTimer).toEqual({
    exerciseId: result.modern.current!.exercises[0].id,
    endsAt: 1_800_000_090_000,
    durationSeconds: 90,
  });
  expect(result.without.current).not.toHaveProperty("restTimer");
  expect(result.without.current!.exercises[0]).not.toHaveProperty(
    "restSeconds",
  );
});

test("rest: invalid preferences and deadlines are rejected, missing exercise references stay safe", async ({
  page,
}) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const store = await import("/frontend/src/personalStore.ts");
    const { generatePlan } = await import("/frontend/src/personalLogic.ts");
    const state = store.defaultState();
    state.current = generatePlan(["chest", "back"], 4, state.settings);
    const saved = await store.saveState(state, 0);
    const check = (value: any) => {
      try {
        store.validateState(value);
        return true;
      } catch {
        return false;
      }
    };
    const preferences = [-1, 1.5, 3601, NaN, Infinity, "90", null].map(
      (restSeconds) => {
        const next = structuredClone(saved);
        (next.current!.exercises[0] as any).restSeconds = restSeconds;
        return check(next);
      },
    );
    const good = {
      exerciseId: "removed-exercise",
      endsAt: 1_800_000_090_000,
      durationSeconds: 90,
    };
    const timers = [
      null,
      [],
      {},
      { ...good, exerciseId: "" },
      { ...good, endsAt: -1 },
      { ...good, endsAt: NaN },
      { ...good, endsAt: Infinity },
      { ...good, endsAt: 8_640_000_000_000_001 },
      { ...good, durationSeconds: 0 },
      { ...good, durationSeconds: 3601 },
      { ...good, durationSeconds: 1.5 },
    ].map((restTimer) =>
      check({ ...saved, current: { ...saved.current, restTimer } }),
    );
    return {
      preferences,
      timers,
      orphan: check({
        ...saved,
        current: { ...saved.current, restTimer: good },
      }),
      off: check({
        ...saved,
        current: {
          ...saved.current,
          exercises: saved.current!.exercises.map((e) => ({
            ...e,
            restSeconds: 0,
          })),
        },
      }),
      unchanged:
        JSON.stringify(await store.readState()) === JSON.stringify(saved),
    };
  });
  expect(result.preferences.every((valid) => !valid)).toBe(true);
  expect(result.timers.every((valid) => !valid)).toBe(true);
  expect(result.orphan).toBe(true);
  expect(result.off).toBe(true);
  expect(result.unchanged).toBe(true);
});

test("rest: wall-clock deadlines survive elapsed background time and extend from now after expiry", async ({
  page,
}) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const logic = await import("/frontend/src/restLogic.ts");
    const now = 1_800_000_000_000;
    const timer = logic.createRestTimer(
      { id: "exercise", restSeconds: 90 },
      now,
    )!;
    const extended = logic.extendRestTimer(timer, 30, now + 100_000);
    const capped = logic.extendRestTimer(timer, 7200, now);
    return {
      off: logic.createRestTimer({ id: "exercise" }, now),
      zero: logic.createRestTimer({ id: "exercise", restSeconds: 0 }, now),
      start: logic.remainingRestSeconds(timer, now),
      rounding: logic.remainingRestSeconds(timer, now + 500),
      backgrounded: logic.remainingRestSeconds(timer, now + 70_000),
      expired: logic.remainingRestSeconds(timer, now + 100_000),
      extendedRemaining: logic.remainingRestSeconds(extended, now + 100_000),
      extendedDeadline: extended.endsAt,
      cap: logic.remainingRestSeconds(capped, now),
      capDuration: capped.durationSeconds,
      label: logic.formatRestTime(90),
      original: timer.endsAt,
    };
  });
  expect(result.off).toBeUndefined();
  expect(result.zero).toBeUndefined();
  expect(result.start).toBe(90);
  expect(result.rounding).toBe(90);
  expect(result.backgrounded).toBe(20);
  expect(result.expired).toBe(0);
  expect(result.extendedRemaining).toBe(30);
  expect(result.extendedDeadline).toBe(1_800_000_130_000);
  expect(result.cap).toBe(3600);
  expect(result.capDuration).toBe(3600);
  expect(result.label).toBe("1:30");
  expect(result.original).toBe(1_800_000_090_000);
});
