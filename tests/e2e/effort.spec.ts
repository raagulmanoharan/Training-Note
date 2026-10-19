import { test, expect } from "@playwright/test";

async function start(page: any) {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Plan a workout", exact: true })
    .click();
  await page.getByRole("button", { name: "Chest", exact: true }).click();
  await page.getByLabel("Exercises", { exact: true }).fill("1");
  await page.getByRole("button", { name: "Build my workout" }).click();
  await page
    .getByRole("button", { name: "Start workout", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Weight (kg)", exact: true })
    .fill("40");
  await page.getByRole("textbox", { name: "Reps", exact: true }).fill("10");
  await page.getByRole("button", { name: /^Log set \d+ for / }).click();
  await expect(
    page.getByRole("button", { name: "Edit set 1", exact: true }),
  ).toBeVisible();
}
async function saved(page: any) {
  return page.evaluate(async () =>
    (await import("/frontend/src/personalStore.ts")).readState(),
  );
}

test("effort domain: ordered performance comparisons qualify evidence and never infer muscle growth", async ({
  page,
}) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const store = await import("/frontend/src/personalStore.ts");
    const logic = await import("/frontend/src/personalLogic.ts");
    const insight = await import("/frontend/src/personalInsights.ts");
    const settings = { ...store.defaultState().settings, gym: "Same gym" };
    function workout(
      day: number,
      reps: number[],
      weight = 40,
      effort?: number,
    ) {
      const w = logic.generatePlan(["chest"], 1, settings);
      w.startedAt = new Date(Date.UTC(2026, 9, day, 10)).toISOString();
      w.finishedAt = new Date(Date.UTC(2026, 9, day, 11)).toISOString();
      w.exercises[0].sets = reps.map((r) => ({
        id: crypto.randomUUID(),
        weight,
        reps: r,
        loggedAt: w.finishedAt!,
        ...(effort === undefined ? {} : { repsInReserve: effort }),
      }));
      return w;
    }
    const old = workout(1, [10, 10, 8]),
      latest = workout(2, [10, 10, 10]);
    const status = (a: any, b: any) => insight.movementInsights([a, b])[0];
    const repsUp = status(old, latest);
    const loadUp = status(
      workout(1, [10, 10, 10]),
      workout(2, [10, 10, 10], 42.5),
    );
    const mixed = status(workout(1, [12, 12, 12]), workout(2, [8, 8, 8], 42.5));
    const harder = status(
      workout(1, [10, 10, 8], 40, 2),
      workout(2, [10, 10, 10], 40, 0),
    );
    const missing = status(
      workout(1, [10, 10, 8], 40, 2),
      workout(2, [10, 10, 10]),
    );
    const variants = ["gym", "equipment", "unit", "repMin", "plannedSets"].map(
      (key) => {
        const b = workout(2, [10, 10, 10]);
        (b.exercises[0] as any)[key] =
          key === "unit"
            ? "lb"
            : key === "repMin"
              ? 6
              : key === "plannedSets"
                ? 4
                : "Other setup";
        return insight
          .movementInsights([old, b])
          .every((x) => x.status !== "improved");
      },
    );
    const unknown = workout(2, [10, 10, 10]);
    unknown.exercises[0].gym = "";
    const partial = workout(3, [12]);
    const partialLatest = insight.movementInsights([old, latest, partial]);
    const groups = insight.groupInsights([old, latest]);
    const twoOld = structuredClone(old),
      twoLatest = structuredClone(latest);
    const oldSecond = logic.generatePlan(["chest"], 2, settings).exercises[1];
    oldSecond.sets = [10, 10, 10].map((reps) => ({
      id: crypto.randomUUID(),
      weight: 20,
      reps,
      loggedAt: old.finishedAt!,
    }));
    const newSecond = structuredClone(oldSecond);
    newSecond.id = crypto.randomUUID();
    newSecond.sets = [9, 9, 9].map((reps) => ({
      id: crypto.randomUUID(),
      weight: 20,
      reps,
      loggedAt: latest.finishedAt!,
    }));
    twoOld.exercises.push(oldSecond);
    twoLatest.exercises.push(newSecond);
    const denominator = insight
      .groupInsights([twoOld, twoLatest])
      .find((x) => x.group === "chest");
    const c = await import("/frontend/src/personalCatalog.ts");
    const assistedItem = c.exercises.find((x) => x.id === "assisted-pullup")!;
    const assistedOld = workout(1, [10, 10, 8]),
      assistedNew = workout(2, [10, 10, 10]);
    const a = logic.makeExercise(assistedItem, settings),
      b = logic.makeExercise(assistedItem, settings);
    a.sets = assistedOld.exercises[0].sets;
    b.sets = assistedNew.exercises[0].sets;
    assistedOld.exercises = [a];
    assistedOld.activeExerciseId = a.id;
    assistedNew.exercises = [b];
    assistedNew.activeExerciseId = b.id;
    const assisted = insight.movementInsights([assistedOld, assistedNew])[0];
    return {
      repsUp,
      loadUp,
      mixed,
      harder,
      missing,
      variants,
      unknownSafe: insight
        .movementInsights([old, unknown])
        .every((x) => x.status !== "improved"),
      partialSafe: partialLatest.every((x) => x.status !== "improved"),
      groups,
      denominator,
      assisted,
    };
  });
  expect(result.repsUp.status).toBe("improved");
  expect(result.loadUp.status).toBe("improved");
  expect(result.mixed.status).not.toBe("improved");
  expect(result.harder.status).not.toBe("improved");
  expect(result.harder.summary).toMatch(/harder|effort/i);
  expect(result.missing.effortComparable).toBe(false);
  expect(result.missing.summary).toMatch(/effort/i);
  expect(result.variants.every(Boolean)).toBe(true);
  expect(result.unknownSafe).toBe(true);
  expect(result.partialSafe).toBe(true);
  const chest = result.groups.find((x: any) => x.group === "chest")!;
  expect(chest.improved).toBe(1);
  expect(chest.comparable).toBe(1);
  expect(result.denominator!.improved).toBe(1);
  expect(result.denominator!.comparable).toBe(2);
  expect(result.harder.comparable).toBe(true);
  expect(result.assisted.status).not.toBe("improved");
  expect(result.repsUp.previous!.exercise.sets.map((s: any) => s.reps)).toEqual(
    [10, 10, 8],
  );
  expect(result.repsUp.current!.exercise.sets.map((s: any) => s.reps)).toEqual([
    10, 10, 10,
  ]);
});

test("effort store: valid optional effort survives backup and malformed values reject atomically", async ({
  page,
}) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const s = await import("/frontend/src/personalStore.ts");
    const l = await import("/frontend/src/personalLogic.ts");
    const state = s.defaultState();
    state.current = l.generatePlan(["chest"], 1, state.settings);
    state.current.exercises[0].sets = [
      {
        id: crypto.randomUUID(),
        weight: 40,
        reps: 10,
        loggedAt: new Date().toISOString(),
        repsInReserve: 2,
      },
    ];
    const first = await s.saveState(state, 0),
      backup = await s.exportBackup(first);
    const restored = await s.importBackup(backup, first);
    const invalid: boolean[] = [];
    for (const value of [-1, 1.5, 5, "2", null]) {
      const bad = structuredClone(first);
      (bad.current!.exercises[0].sets[0] as any).repsInReserve = value;
      try {
        await s.saveState(bad, restored.revision);
        invalid.push(false);
      } catch {
        invalid.push(true);
      }
    }
    function canonical(value: any): string {
      if (value === null || typeof value !== "object")
        return JSON.stringify(value);
      if (Array.isArray(value))
        return "[" + value.map(canonical).join(",") + "]";
      return (
        "{" +
        Object.keys(value)
          .sort()
          .map((key) => JSON.stringify(key) + ":" + canonical(value[key]))
          .join(",") +
        "}"
      );
    }
    const invalidImports: boolean[] = [];
    for (const value of [-1, 1.5, 5]) {
      const parsed = JSON.parse(backup);
      delete parsed.checksum;
      parsed.state.current.exercises[0].sets[0].repsInReserve = value;
      const hash = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(canonical(parsed)),
      );
      parsed.checksum = Array.from(new Uint8Array(hash), (x) =>
        x.toString(16).padStart(2, "0"),
      ).join("");
      try {
        await s.importBackup(JSON.stringify(parsed), restored);
        invalidImports.push(false);
      } catch {
        invalidImports.push(true);
      }
    }
    const unchanged = await s.readState();
    const old = structuredClone(unchanged);
    delete old.current!.exercises[0].sets[0].repsInReserve;
    s.validateState(old);
    return {
      first: first.current,
      restored: restored.current,
      unchanged: unchanged.current,
      invalid,
      invalidImports,
      oldValid: true,
    };
  });
  expect(result.restored).toEqual(result.first);
  expect(result.unchanged).toEqual(result.first);
  expect(result.invalid.every(Boolean)).toBe(true);
  expect(result.invalidImports.every(Boolean)).toBe(true);
  expect(result.oldValid).toBe(true);
});

test("effort UI: optional add change remove, correction and undo preserve stable actuals", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await start(page);
  const original = (await saved(page)).current!.exercises[0].sets[0];
  expect(original.repsInReserve).toBeUndefined();
  await expect(page.locator(".nb-effort-picker")).toHaveCount(0);
  await page
    .getByRole("button", { name: "How did that set feel?", exact: true })
    .click();
  const choice = page.getByRole("button", {
    name: "2 more",
    exact: true,
  });
  const box = await choice.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  await page.screenshot({
    path: "tests/artifacts/effort-picker-320.png",
    fullPage: true,
  });
  await choice.click();
  await expect(page.locator(".personal-status")).toHaveText(
    "Saved on this device",
  );
  await expect(page.locator(".nb-effort-picker")).toHaveCount(0);
  let actual = (await saved(page)).current!.exercises[0].sets[0];
  expect(actual).toEqual({ ...original, repsInReserve: 2 });
  await page.reload();
  await page
    .getByRole("button", { name: /Change effort for set 1 of/ })
    .click();
  await page.getByRole("button", { name: "4+ more", exact: true }).click();
  await expect(page.locator(".personal-status")).toHaveText(
    "Saved on this device",
  );
  await page.getByRole("button", { name: "Edit set 1", exact: true }).click();
  await page.getByLabel("Edit weight", { exact: true }).fill("42.5");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await page.getByRole("button", { name: "Edit set 1", exact: true }).click();
  await page.getByRole("button", { name: "Delete set", exact: true }).click();
  await page
    .getByRole("button", { name: "Undo deleted set", exact: true })
    .click();
  actual = (await saved(page)).current!.exercises[0].sets[0];
  expect(actual).toEqual({ ...original, weight: 42.5, repsInReserve: 4 });
  await page
    .getByRole("button", { name: /^Change effort for set 1 of/ })
    .click();
  await page
    .getByRole("button", { name: "Remove effort", exact: true })
    .click();
  await expect(page.locator(".personal-status")).toHaveText(
    "Saved on this device",
  );
  await page.reload();
  expect((await saved(page)).current!.exercises[0].sets[0]).toEqual({
    ...original,
    weight: 42.5,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("effort UI: failed edit retains prior committed effort and proposed choice, retry saves once", async ({
  page,
}) => {
  await start(page);
  await page
    .getByRole("button", { name: "How did that set feel?", exact: true })
    .click();
  await page.getByRole("button", { name: "2 more", exact: true }).click();
  await expect(page.locator(".personal-status")).toHaveText(
    "Saved on this device",
  );
  const before = (await saved(page)).current!.exercises[0].sets[0];
  await page
    .getByRole("button", { name: /^Change effort for set 1 of/ })
    .click();
  await page.evaluate(() => {
    const original = IDBDatabase.prototype.transaction;
    (window as any).restoreEffortTransactions = () => {
      IDBDatabase.prototype.transaction = original;
    };
    IDBDatabase.prototype.transaction = function (...args: any[]) {
      if (args[1] === "readwrite")
        throw new DOMException("Synthetic quota failure", "QuotaExceededError");
      return original.apply(this, args as any);
    };
  });
  const proposed = page.getByRole("button", {
    name: "No more",
    exact: true,
  });
  await proposed.click();
  await expect(page.locator(".personal-status")).toHaveText("Not saved");
  await expect(proposed).toHaveAttribute("aria-pressed", "true");
  expect((await saved(page)).current!.exercises[0].sets[0]).toEqual(before);
  await page.evaluate(() => (window as any).restoreEffortTransactions());
  await page.getByRole("button", { name: "Retry save", exact: true }).click();
  await expect(page.locator(".personal-status")).toHaveText(
    "Saved on this device",
  );
  const after = (await saved(page)).current!.exercises[0];
  expect(after.sets).toHaveLength(1);
  expect(after.sets[0]).toEqual({ ...before, repsInReserve: 0 });
});

test("effort UI: history retains effort and muscle card exposes actual comparison evidence", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(async () => {
    const s = await import("/frontend/src/personalStore.ts"),
      l = await import("/frontend/src/personalLogic.ts");
    const state = s.defaultState();
    state.settings.gym = "Same gym";
    state.history = [1, 2].map((day) => {
      const w = l.generatePlan(["chest"], 2, state.settings);
      w.startedAt = new Date(Date.UTC(2026, 9, day, 10)).toISOString();
      w.finishedAt = new Date(Date.UTC(2026, 9, day, 11)).toISOString();
      w.exercises.forEach((e, index) => {
        e.sets = [0, 1, 2].map(() => ({
          id: crypto.randomUUID(),
          weight: index ? 20 : 40,
          reps: index ? (day === 1 ? 10 : 9) : day === 1 ? 8 : 10,
          loggedAt: w.finishedAt!,
          repsInReserve: 2,
        }));
      });
      return w;
    });
    await s.saveState(state, 0);
  });
  await page.reload();
  await page
    .getByRole("button", { name: "View progress details", exact: true })
    .click();
  await page.getByText("Lift comparisons", { exact: true }).click();
  const group = page
    .locator(".nb-muscle-insight")
    .filter({ has: page.getByRole("heading", { name: "Chest", exact: true }) });
  await expect(group).toContainText("1 of 2 exercise comparisons improved");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: "tests/artifacts/muscle-performance-390.png",
    fullPage: true,
  });
  await group.getByText("Inspect comparison evidence", { exact: true }).click();
  await page.screenshot({
    path: "tests/artifacts/muscle-evidence-390.png",
    fullPage: true,
  });
  await expect(group).toContainText("40 kg × 8 · 40 kg × 8 · 40 kg × 8");
  await expect(group).toContainText("40 kg × 10 · 40 kg × 10 · 40 kg × 10");
  await expect(
    page.getByText(
      "Based on comparable recorded lifts, not a measurement of muscle growth.",
      { exact: true },
    ),
  ).toBeVisible();
  const history = page.locator(".personal-progress-card").first();
  await expect(history).toContainText("2 reps left");
  const before = (await saved(page)).history[0].exercises[0].sets[0];
  await history.getByText("Correct a set", { exact: true }).first().click();
  await history
    .getByRole("button", { name: /^Change effort for set 1 of/ })
    .first()
    .click();
  await page.getByRole("button", { name: "1 more", exact: true }).click();
  await expect(page.locator(".personal-status")).toHaveText(
    "Saved on this device",
  );
  const after = (await saved(page)).history[0].exercises[0].sets[0];
  expect(after).toEqual({ ...before, repsInReserve: 1 });
  await page.reload();
  await page
    .getByRole("button", { name: "View progress details", exact: true })
    .click();
  await expect(page.locator(".personal-progress-card").first()).toContainText(
    "1 rep left",
  );
});
