import { test, expect, type Locator, type Page } from "@playwright/test";

const read = (page: Page) =>
  page.evaluate(async () =>
    (await import("/frontend/src/personalStore.ts")).readState(),
  );
const saved = (page: Page) =>
  expect(page.locator(".personal-status")).toHaveText("Saved on this device");
const shot = (page: Page, name: string) =>
  page.screenshot({
    path: `artifacts/workout-editing/${name}.png`,
    fullPage: false,
  });

async function seed(page: Page, ids = ["curl", "preacher-curl"]) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(async (ids) => {
    const store = await import("/frontend/src/personalStore.ts");
    const logic = await import("/frontend/src/personalLogic.ts");
    const state = store.defaultState();
    state.current = logic.generateCustomPlan(ids, state.settings);
    await store.saveState(state, 0);
  }, ids);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Finish", exact: true }),
  ).toBeVisible();
}

async function reachable(control: Locator) {
  await control.scrollIntoViewIfNeeded();
  await expect(control).toBeInViewport();
  const box = await control.boundingBox();
  expect(box?.height, "Action height").toBeGreaterThanOrEqual(44);
  expect(box?.width, "Action width").toBeGreaterThanOrEqual(44);
  expect(
    await control.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const hit = document.elementFromPoint(
        r.left + r.width / 2,
        r.top + r.height / 2,
      );
      return hit === el || (hit !== null && el.contains(hit));
    }),
    "Action center is not covered",
  ).toBe(true);
}

async function enlargeText(page: Page) {
  await page.evaluate(() => {
    const metrics = [...document.querySelectorAll<HTMLElement>("body *")].map(
      (el) => {
        const style = getComputedStyle(el);
        return {
          el,
          size: parseFloat(style.fontSize),
          line: parseFloat(style.lineHeight),
        };
      },
    );
    for (const { el, size, line } of metrics) {
      if (Number.isFinite(size)) el.style.fontSize = `${size * 2}px`;
      if (Number.isFinite(line)) el.style.lineHeight = `${line * 2}px`;
    }
  });
}

async function noSideways(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth + 1,
    ),
  ).toBe(true);
  for (const dialog of await page.getByRole("dialog").all())
    expect(
      await dialog.evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
    ).toBe(true);
}
async function enter(page: Page, weight: string, reps: string) {
  await page
    .getByRole("textbox", { name: "Weight (kg)", exact: true })
    .fill(weight);
  await page.getByRole("textbox", { name: "Reps", exact: true }).fill(reps);
  await saved(page);
}
async function log(page: Page, weight = "20", reps = "10") {
  await enter(page, weight, reps);
  await page.getByRole("button", { name: /^Log set \d+ for / }).click();
  await saved(page);
}
async function options(page: Page, name: string) {
  await page
    .getByRole("button", { name: `More options for ${name}`, exact: true })
    .click();
  return page.getByRole("dialog", { name: `Options for ${name}`, exact: true });
}
async function failWrites(page: Page) {
  await page.evaluate(() => {
    const transaction = IDBDatabase.prototype.transaction;
    (window as any).restoreWorkoutEditingWrites = () => {
      IDBDatabase.prototype.transaction = transaction;
    };
    IDBDatabase.prototype.transaction = function (...args: any[]) {
      if (args[1] === "readwrite")
        throw new DOMException(
          "Synthetic storage failure",
          "QuotaExceededError",
        );
      return transaction.apply(this, args as any);
    };
  });
}
async function restoreWrites(page: Page) {
  await page.evaluate(() => (window as any).restoreWorkoutEditingWrites());
}

async function chooseExercises(page: Page) {
  await page
    .getByRole("button", { name: "Workout options", exact: true })
    .click();
  await page
    .getByRole("dialog", { name: "Workout options", exact: true })
    .getByRole("button", { name: "Add exercise", exact: true })
    .click();
  const picker = page.getByRole("dialog", {
    name: "Choose exercises",
    exact: true,
  });
  await expect(picker).toBeVisible();
  return picker;
}

async function openSwap(page: Page, name: string) {
  const menu = await options(page, name);
  await menu.getByRole("button", { name: `Swap ${name}`, exact: true }).click();
  return page.getByRole("dialog", { name: "Swap exercise", exact: true });
}

test("one exercise collection stages multiple choices across filters, cancels safely, and saves once", async ({
  page,
}) => {
  await seed(page);
  await log(page);
  await enter(page, "22.5", "9");
  const before = await read(page);
  let picker = await chooseExercises(page);
  const existing = picker.getByRole("checkbox", {
    name: "Dumbbell curl",
    exact: true,
  });
  await expect(existing).toBeChecked();
  await expect(existing).toBeEnabled();
  await expect(picker.getByText("In workout", { exact: true })).toHaveCount(0);
  await picker
    .getByRole("searchbox", { name: "Search exercises", exact: true })
    .fill("hammer");
  await picker
    .getByRole("checkbox", { name: "Hammer curl", exact: true })
    .check();
  await picker
    .getByRole("searchbox", { name: "Search exercises", exact: true })
    .fill("cable curl");
  await picker
    .getByRole("checkbox", { name: "Cable curl", exact: true })
    .check();
  await picker
    .getByRole("searchbox", { name: "Search exercises", exact: true })
    .fill("");
  await picker.getByRole("button", { name: "Chest", exact: true }).click();
  await picker.getByRole("button", { name: "Biceps", exact: true }).click();
  await expect(
    picker.getByRole("checkbox", { name: "Hammer curl", exact: true }),
  ).toBeChecked();
  await expect(
    picker.getByRole("checkbox", { name: "Cable curl", exact: true }),
  ).toBeChecked();
  expect(await read(page)).toEqual(before);
  const oldStyle = await existing.evaluate((el) => ({
    class: el.className,
    opacity: getComputedStyle(el).opacity,
  }));
  const newStyle = await picker
    .getByRole("checkbox", { name: "Hammer curl", exact: true })
    .evaluate((el) => ({
      class: el.className,
      opacity: getComputedStyle(el).opacity,
    }));
  expect(newStyle).toEqual(oldStyle);
  await picker
    .getByRole("button", { name: "Selected exercises", exact: true })
    .click();
  await expect(picker.getByRole("checkbox")).toHaveCount(4);
  for (const choice of await picker.getByRole("checkbox").all())
    await expect(choice).toBeChecked();
  await shot(page, "unified-selection");
  await picker.getByRole("button", { name: "Cancel", exact: true }).click();
  expect(await read(page)).toEqual(before);
  picker = await chooseExercises(page);
  await expect(
    picker.getByRole("checkbox", { name: "Hammer curl", exact: true }),
  ).not.toBeChecked();
  await picker
    .getByRole("checkbox", { name: "Hammer curl", exact: true })
    .check();
  await picker
    .getByRole("checkbox", { name: "Cable curl", exact: true })
    .check();
  await picker
    .getByRole("checkbox", { name: "Preacher curl", exact: true })
    .uncheck();
  await picker
    .getByRole("button", { name: "Save exercises", exact: true })
    .click();
  await saved(page);
  await expect(picker).toHaveCount(0);
  const after = await read(page);
  expect(after.revision).toBe(before.revision + 1);
  expect(after.current!.exercises.map((e) => e.name)).toEqual([
    "Dumbbell curl",
    "Hammer curl",
    "Cable curl",
  ]);
  expect(after.current!.exercises[0]).toEqual(before.current!.exercises[0]);
  expect(after.current!.activeExerciseId).toBe(
    before.current!.activeExerciseId,
  );
  await page.reload();
  expect(await read(page)).toEqual(after);
});

test("removing a selected exercise with actuals and a draft requires a deliberate choice and can be undone", async ({
  page,
}) => {
  await seed(page);
  await log(page);
  await enter(page, "22.5", "9");
  const before = await read(page);
  let picker = await chooseExercises(page);
  await picker
    .getByRole("checkbox", { name: "Dumbbell curl", exact: true })
    .uncheck();
  await picker
    .getByRole("checkbox", { name: "Hammer curl", exact: true })
    .check();
  await picker
    .getByRole("button", { name: "Save exercises", exact: true })
    .click();
  const confirm = page.getByRole("dialog", {
    name: "Remove selected exercises?",
    exact: true,
  });
  await expect(confirm).toContainText("Dumbbell curl");
  await expect(confirm).toContainText(/1.*set|set.*1/);
  await expect(confirm).toContainText(/unlogged|draft|typed/i);
  expect(await read(page)).toEqual(before);
  await shot(page, "protected-removal");
  await confirm
    .getByRole("button", { name: "Back to selection", exact: true })
    .click();
  picker = page.getByRole("dialog", { name: "Choose exercises", exact: true });
  await expect(
    picker.getByRole("checkbox", { name: "Dumbbell curl", exact: true }),
  ).not.toBeChecked();
  await expect(
    picker.getByRole("checkbox", { name: "Hammer curl", exact: true }),
  ).toBeChecked();
  await picker
    .getByRole("button", { name: "Save exercises", exact: true })
    .click();
  await confirm
    .getByRole("button", { name: "Remove and save", exact: true })
    .click();
  await saved(page);
  const after = await read(page);
  expect(after.current!.exercises.map((e) => e.name)).toEqual([
    "Preacher curl",
    "Hammer curl",
  ]);
  expect(after.current!.activeExerciseId).toBe(after.current!.exercises[0].id);
  await page
    .getByRole("button", { name: "Undo removed exercises", exact: true })
    .click();
  await saved(page);
  const restored = (await read(page)).current!;
  expect(
    restored.exercises.find((e) => e.id === before.current!.exercises[0].id),
  ).toEqual(before.current!.exercises[0]);
  expect(
    restored.exercises.find((e) => e.id === before.current!.exercises[1].id),
  ).toEqual(before.current!.exercises[1]);
});

test("swap is a searchable replacement picker with canonical target matches and protected recorded work", async ({
  page,
}) => {
  await seed(page, ["lateral", "reverse-fly", "overhead"]);
  // A stored target from an earlier catalog must not hide a canonical equivalent.
  await page.evaluate(async () => {
    const store = await import("/frontend/src/personalStore.ts");
    const state = await store.readState();
    state.current!.exercises[0].target = "side deltoids";
    await store.saveState(state, state.revision);
  });
  await page.reload();
  const before = (await read(page)).current!;
  let picker = await openSwap(page, "Lateral raise");
  await expect(
    picker.getByRole("button", { name: /^Swap to / }).first(),
  ).toHaveAccessibleName("Swap to Cable lateral raise");
  await expect(
    picker.getByRole("searchbox", { name: "Search exercises", exact: true }),
  ).toBeVisible();
  await expect(
    picker.getByText(
      "No other movement for this target in the current catalog.",
      { exact: true },
    ),
  ).toHaveCount(0);
  await picker
    .getByRole("button", { name: "Swap to Cable lateral raise", exact: true })
    .click();
  await saved(page);
  let after = (await read(page)).current!;
  expect(after.exercises).toHaveLength(before.exercises.length);
  expect(after.exercises[0].name).toBe("Cable lateral raise");
  expect(after.exercises.slice(1)).toEqual(before.exercises.slice(1));
  await log(page, "10", "12");
  await enter(page, "12.5", "10");
  const performed = (await read(page)).current!.exercises[0];
  picker = await openSwap(page, "Cable lateral raise");
  await picker
    .getByRole("searchbox", { name: "Search exercises", exact: true })
    .fill("Dumbbell curl");
  await picker
    .getByRole("button", { name: "Swap to Dumbbell curl", exact: true })
    .click();
  const confirmation = page.getByRole("group", {
    name: "Confirm exercise swap",
    exact: true,
  });
  await expect(confirmation).toContainText("12.5");
  expect((await read(page)).current!.exercises[0]).toEqual(performed);
  await confirmation
    .getByRole("button", { name: "Keep entry", exact: true })
    .click();
  expect((await read(page)).current!.exercises[0]).toEqual(performed);
  await picker
    .getByRole("button", { name: "Swap to Dumbbell curl", exact: true })
    .click();
  await failWrites(page);
  await confirmation
    .getByRole("button", { name: "Discard entry and swap", exact: true })
    .click();
  await expect(
    picker.getByRole("button", { name: "Retry save", exact: true }),
  ).toBeVisible();
  expect((await read(page)).current!.exercises[0]).toEqual(performed);
  await restoreWrites(page);
  await picker.getByRole("button", { name: "Retry save", exact: true }).click();
  await saved(page);
  after = (await read(page)).current!;
  expect(after.exercises.find((e) => e.id === performed.id)).toEqual({
    ...performed,
    pendingWeight: "",
    pendingReps: "",
  });
  const replacement = after.exercises.find((e) => e.name === "Dumbbell curl")!;
  expect(replacement.sets).toEqual([]);
  expect(replacement.pendingWeight).toBe("");
  expect(replacement.pendingReps).toBe("");
  expect(after.activeExerciseId).toBe(replacement.id);
  expect(after.exercises).toHaveLength(before.exercises.length + 1);
});

async function openTargets(page: Page) {
  await page
    .getByRole("button", { name: "Workout options", exact: true })
    .click();
  await page.getByRole("button", { name: /^Edit sets & rest/ }).click();
  return page.getByRole("dialog", { name: "Edit sets & rest", exact: true });
}

test("bulk planned sets and rest change only selected exercises and enabled fields", async ({
  page,
}) => {
  await seed(page, ["curl", "preacher-curl", "hammer-curl"]);
  await page.evaluate(async () => {
    const store = await import("/frontend/src/personalStore.ts");
    const state = await store.readState();
    state.current!.exercises[1].plannedSets = 5;
    state.current!.exercises[1].repMin = 6;
    state.current!.exercises[1].repMax = 10;
    state.current!.exercises[2].restSeconds = 120;
    await store.saveState(state, state.revision);
  });
  await page.reload();
  await log(page);
  await enter(page, "22.5", "9");
  const before = await read(page);
  let editor = await openTargets(page);
  await expect(
    editor.getByRole("button", { name: "Apply to 3 exercises", exact: true }),
  ).toBeDisabled();
  await editor.getByRole("checkbox", { name: /^Working sets/ }).check();
  await expect(
    editor.getByLabel("Working sets target", { exact: true }),
  ).toHaveValue("");
  await editor.getByLabel("Working sets target", { exact: true }).fill("4");
  await editor.getByRole("checkbox", { name: /^Rest between sets/ }).check();
  await editor.getByRole("button", { name: "90s", exact: true }).click();
  await editor
    .getByText("Choose exercises · 3 selected", { exact: true })
    .click();
  await editor
    .getByRole("checkbox", { name: "Select Hammer curl", exact: true })
    .uncheck();
  await shot(page, "bulk-targets");
  await editor.getByRole("button", { name: "Cancel", exact: true }).click();
  expect(await read(page)).toEqual(before);
  editor = await openTargets(page);
  await editor.getByRole("checkbox", { name: /^Working sets/ }).check();
  await editor.getByLabel("Working sets target", { exact: true }).fill("4");
  await editor.getByRole("checkbox", { name: /^Rest between sets/ }).check();
  await editor.getByRole("button", { name: "90s", exact: true }).click();
  await editor
    .getByText("Choose exercises · 3 selected", { exact: true })
    .click();
  await editor
    .getByRole("checkbox", { name: "Select Hammer curl", exact: true })
    .uncheck();
  await editor
    .getByRole("button", { name: "Apply to 2 exercises", exact: true })
    .click();
  await saved(page);
  const after = await read(page);
  expect(after.revision).toBe(before.revision + 1);
  expect(after.current!.exercises[0]).toEqual({
    ...before.current!.exercises[0],
    plannedSets: 4,
    restSeconds: 90,
  });
  expect(after.current!.exercises[1]).toEqual({
    ...before.current!.exercises[1],
    plannedSets: 4,
    restSeconds: 90,
  });
  expect(after.current!.exercises[2]).toEqual(before.current!.exercises[2]);
  await page.reload();
  expect(await read(page)).toEqual(after);
});

test("bulk recorded corrections preserve identities, unselected actuals and pending entry; failed save retries once", async ({
  page,
}) => {
  await seed(page);
  await log(page, "20", "10");
  await log(page, "22.5", "9");
  await log(page, "25", "8");
  await page.getByRole("button", { name: "Add set", exact: true }).click();
  await enter(page, "27.5", "7");
  await page.evaluate(async () => {
    const store = await import("/frontend/src/personalStore.ts");
    const state = await store.readState();
    state.current!.exercises[0].sets[0].repsInReserve = 2;
    state.current!.exercises[0].sets[1].repsInReserve = 1;
    state.current!.exercises[0].sets[2].repsInReserve = 0;
    await store.saveState(state, state.revision);
  });
  await page.reload();
  const before = await read(page);
  let menu = await options(page, "Dumbbell curl");
  await menu
    .getByRole("button", { name: "Edit recorded sets", exact: true })
    .click();
  let editor = page.getByRole("dialog", {
    name: "Edit recorded sets",
    exact: true,
  });
  await expect(
    editor.getByRole("button", { name: "Correct 3 sets", exact: true }),
  ).toBeDisabled();
  await editor.getByRole("checkbox", { name: "Weight", exact: true }).check();
  await expect(
    editor.getByLabel("Weight for selected sets (kg)", { exact: true }),
  ).toHaveValue("");
  await editor
    .getByLabel("Weight for selected sets (kg)", { exact: true })
    .fill("30");
  await editor
    .getByRole("checkbox", { name: "Select recorded set 2", exact: true })
    .uncheck();
  await editor.getByRole("button", { name: "Cancel", exact: true }).click();
  expect(await read(page)).toEqual(before);
  menu = await options(page, "Dumbbell curl");
  await menu
    .getByRole("button", { name: "Edit recorded sets", exact: true })
    .click();
  editor = page.getByRole("dialog", {
    name: "Edit recorded sets",
    exact: true,
  });
  await editor.getByRole("checkbox", { name: "Weight", exact: true }).check();
  await editor
    .getByLabel("Weight for selected sets (kg)", { exact: true })
    .fill("30");
  await editor
    .getByRole("checkbox", { name: "Select recorded set 2", exact: true })
    .uncheck();
  await shot(page, "bulk-actuals");
  await failWrites(page);
  await editor
    .getByRole("button", { name: "Correct 2 sets", exact: true })
    .click();
  await expect(
    editor.getByRole("button", { name: "Retry save", exact: true }),
  ).toBeVisible();
  expect(await read(page)).toEqual(before);
  await expect(
    editor.getByRole("button", { name: "Correct 2 sets", exact: true }),
  ).toBeDisabled();
  await restoreWrites(page);
  await editor.getByRole("button", { name: "Retry save", exact: true }).click();
  await saved(page);
  await expect(editor).toHaveCount(0);
  const after = await read(page);
  expect(after.revision).toBe(before.revision + 1);
  expect(after.current!.exercises[0]).toEqual({
    ...before.current!.exercises[0],
    sets: before.current!.exercises[0].sets.map((set, index) =>
      index === 1 ? set : { ...set, weight: 30 },
    ),
  });
  expect(after.current!.exercises[1]).toEqual(before.current!.exercises[1]);
  await page.reload();
  expect(await read(page)).toEqual(after);
});

test("rest follows the persisted deadline across reload, extends, expires and never blocks logging", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-10-19T10:00:00Z") });
  await seed(page, ["curl"]);
  const editor = await openTargets(page);
  await editor.getByRole("checkbox", { name: /^Rest between sets/ }).check();
  await editor.getByRole("button", { name: "90s", exact: true }).click();
  await editor
    .getByRole("button", { name: "Apply to 1 exercise", exact: true })
    .click();
  await saved(page);
  await log(page);
  const region = page.getByRole("region", { name: "Rest timer", exact: true });
  await expect(region).toBeVisible();
  const initial = (await read(page)).current!;
  expect(initial.restTimer).toBeTruthy();
  const deadline = initial.restTimer!.endsAt;
  await page.clock.fastForward(30000);
  await page.reload();
  await expect(region).toBeVisible();
  expect((await read(page)).current!.restTimer!.endsAt).toBe(deadline);
  const clock = region.getByRole("timer");
  await expect(clock).toHaveAccessibleName(/(?:5\d|60) seconds remaining/);
  await region
    .getByRole("button", { name: "Add 30 seconds to rest", exact: true })
    .click();
  await saved(page);
  expect((await read(page)).current!.restTimer!.endsAt).toBeGreaterThan(
    deadline,
  );
  await enter(page, "22.5", "9");
  await log(page, "22.5", "9");
  await expect(region).toBeVisible();
  expect((await read(page)).current!.exercises[0].sets).toHaveLength(2);
  await shot(page, "rest-running");
  await region.getByRole("button", { name: "Skip rest", exact: true }).click();
  await saved(page);
  await expect(region).toHaveCount(0);
  expect((await read(page)).current!.restTimer).toBeUndefined();
  await log(page, "25", "8");
  await page.clock.fastForward(95000);
  await expect(region).toContainText("Rest complete");
  const expired = (await read(page)).revision;
  await page.clock.fastForward(5000);
  expect((await read(page)).revision).toBe(expired);
  await region
    .getByRole("button", { name: "Dismiss completed rest", exact: true })
    .click();
  await saved(page);
  await expect(region).toHaveCount(0);
});

test("chooser search, scrolling and final actions stay usable at narrow and keyboard-sized heights", async ({
  page,
}) => {
  await seed(page, ["lateral", "reverse-fly", "overhead"]);
  for (const width of [320, 390]) {
    for (const height of [740, 420]) {
      await page.setViewportSize({ width, height });
      const picker = await chooseExercises(page);
      const search = picker.getByRole("searchbox", {
        name: "Search exercises",
        exact: true,
      });
      const close = picker.getByRole("button", {
        name: "Close dialog",
        exact: true,
      });
      const save = picker.getByRole("button", {
        name: "Save exercises",
        exact: true,
      });
      await expect(search).toBeInViewport();
      await reachable(close);
      await reachable(save);
      await noSideways(page);
      await picker.getByRole("checkbox").last().scrollIntoViewIfNeeded();
      await reachable(close);
      await reachable(save);
      await search.fill("Bent-over reverse fly");
      const candidate = picker.getByRole("checkbox", {
        name: "Bent-over reverse fly",
        exact: true,
      });
      await reachable(candidate);
      await candidate.check();
      await shot(page, `picker-${width}-${height}`);
      await noSideways(page);
      await close.click();
      await expect(picker).toHaveCount(0);
    }
  }
});

test("a failed selection save retains the staged list and retries additions and removals atomically", async ({
  page,
}) => {
  await seed(page);
  await enter(page, "17.5", "11");
  const before = await read(page);
  const picker = await chooseExercises(page);
  await picker
    .getByRole("checkbox", { name: "Preacher curl", exact: true })
    .uncheck();
  await picker
    .getByRole("checkbox", { name: "Hammer curl", exact: true })
    .check();
  await picker
    .getByRole("checkbox", { name: "Cable curl", exact: true })
    .check();
  await failWrites(page);
  await picker
    .getByRole("button", { name: "Save exercises", exact: true })
    .click();
  await expect(
    picker.getByRole("button", { name: "Retry save", exact: true }),
  ).toBeVisible();
  await expect(
    picker.getByRole("button", { name: "Save exercises", exact: true }),
  ).toBeDisabled();
  await expect(
    picker.getByRole("checkbox", { name: "Hammer curl", exact: true }),
  ).toBeChecked();
  expect(await read(page)).toEqual(before);
  await restoreWrites(page);
  await picker.getByRole("button", { name: "Retry save", exact: true }).click();
  await saved(page);
  await expect(picker).toHaveCount(0);
  const after = await read(page);
  expect(after.revision).toBe(before.revision + 1);
  expect(after.current!.exercises.map((e) => e.name)).toEqual([
    "Dumbbell curl",
    "Hammer curl",
    "Cable curl",
  ]);
  expect(after.current!.exercises[0]).toEqual(before.current!.exercises[0]);
  await page.reload();
  expect(await read(page)).toEqual(after);
});

test("bulk history correction changes only the selected historical sets while an active workout is untouched", async ({
  page,
}) => {
  await seed(page, ["curl"]);
  await log(page, "20", "10");
  await log(page, "22.5", "9");
  await log(page, "25", "8");
  await page.getByRole("button", { name: "Finish", exact: true }).click();
  await page.getByRole("button", { name: "Save workout", exact: true }).click();
  await saved(page);
  await page.evaluate(async () => {
    const store = await import("/frontend/src/personalStore.ts");
    const logic = await import("/frontend/src/personalLogic.ts");
    const state = await store.readState();
    state.current = logic.generateCustomPlan(
      ["curl", "hammer-curl"],
      state.settings,
    );
    state.current.exercises[0].pendingWeight = "27.5";
    state.current.exercises[0].pendingReps = "7";
    state.history[0].exercises[0].sets[0].repsInReserve = 2;
    await store.saveState(state, state.revision);
  });
  await page.reload();
  const before = await read(page);
  await page.getByRole("button", { name: "Back to Home", exact: true }).click();
  await page
    .getByRole("button", { name: "View progress details", exact: true })
    .click();
  const history = page.getByRole("dialog", {
    name: "Training history and evidence",
    exact: true,
  });
  await history.getByText("Correct a set", { exact: true }).click();
  await history
    .getByRole("button", { name: "Options for set 1", exact: true })
    .click();
  await page
    .getByRole("dialog", { name: "Set 1 options", exact: true })
    .getByRole("button", { name: "Edit recorded sets", exact: true })
    .click();
  const editor = page.getByRole("dialog", {
    name: "Edit recorded sets",
    exact: true,
  });
  await editor
    .getByRole("checkbox", { name: "Select recorded set 3", exact: true })
    .uncheck();
  await editor.getByRole("checkbox", { name: "Reps", exact: true }).check();
  await editor.getByLabel("Reps for selected sets", { exact: true }).fill("12");
  await editor
    .getByRole("button", { name: "Correct 2 sets", exact: true })
    .click();
  await saved(page);
  const after = await read(page);
  expect(after.current).toEqual(before.current);
  expect(after.history).toEqual(
    before.history.map((workout, index) =>
      index
        ? workout
        : {
            ...workout,
            exercises: workout.exercises.map((exercise) => ({
              ...exercise,
              sets: exercise.sets.map((set, setIndex) =>
                setIndex === 2 ? set : { ...set, reps: 12 },
              ),
            })),
          },
    ),
  );
  await page.reload();
  expect(await read(page)).toEqual(after);
});

test("picker labels and actions remain readable at doubled text on narrow phones", async ({
  page,
}) => {
  await seed(page, ["lateral", "reverse-fly", "overhead"]);
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.reload();
    const picker = await chooseExercises(page);
    await picker
      .getByRole("searchbox", { name: "Search exercises", exact: true })
      .fill("Bent-over reverse fly");
    await enlargeText(page);
    await noSideways(page);
    const row = picker.getByRole("checkbox", {
      name: "Bent-over reverse fly",
      exact: true,
    });
    await reachable(row);
    const title = row.locator(".nb-exercise-option-name");
    expect(
      await title.evaluate((el) => {
        const style = getComputedStyle(el);
        const range = document.createRange();
        range.selectNodeContents(el);
        const text = range.getBoundingClientRect();
        const box = el.getBoundingClientRect();
        return (
          style.textOverflow !== "ellipsis" &&
          text.left >= box.left - 1 &&
          text.right <= box.right + 1 &&
          text.top >= box.top - 1 &&
          text.bottom <= box.bottom + 1
        );
      }),
    ).toBe(true);
    await row.check();
    await reachable(
      picker.getByRole("button", { name: "Save exercises", exact: true }),
    );
    await reachable(
      picker.getByRole("button", { name: "Close dialog", exact: true }),
    );
    await shot(page, `picker-${width}-text-2`);
  }
});
