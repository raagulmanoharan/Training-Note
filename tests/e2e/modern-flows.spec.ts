import { test, expect, type Page } from "@playwright/test";

const read = (page: Page) =>
  page.evaluate(async () =>
    (await import("/frontend/src/personalStore.ts")).readState(),
  );

async function saved(page: Page) {
  await expect(page.locator(".personal-status")).toHaveText(
    "Saved on this device",
  );
}
async function narrow(page: Page) {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      `The ${width}px viewport must not scroll sideways`,
    ).toBe(true);
    const dialog = page.getByRole("dialog");
    for (const surface of await dialog.all()) {
      expect(
        await surface.evaluate((el) => el.scrollWidth <= el.clientWidth + 1),
      ).toBe(true);
    }
  }
}
async function preview(page: Page, names = ["Dumbbell curl", "Preacher curl"]) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await narrow(page);
  await page
    .getByRole("button", { name: "Plan a workout", exact: true })
    .click();
  await page.getByRole("button", { name: "Biceps", exact: true }).click();
  await page
    .getByRole("button", { name: "Pick exercises", exact: true })
    .click();
  for (const name of names)
    await page.getByRole("button", { name, exact: true }).click();
  await page
    .getByRole("button", { name: "Build my workout", exact: true })
    .click();
  await narrow(page);
}
async function start(page: Page, names?: string[]) {
  await preview(page, names);
  await page
    .getByRole("button", { name: "Start workout", exact: true })
    .click();
  await saved(page);
}
async function enter(page: Page, weight = "20", reps = "10") {
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
async function removeActive(page: Page, name: string) {
  const remove = page.getByRole("button", {
    name: `Remove ${name}`,
    exact: true,
  });
  if (!(await remove.isVisible()))
    await page
      .getByRole("button", { name: `More options for ${name}`, exact: true })
      .click();
  await remove.click();
  return page.getByRole("dialog", { name: "Remove exercise", exact: true });
}

test("review removal is reversible; draft reload and set corrections preserve actual identity", async ({
  page,
}) => {
  await preview(page);
  await page
    .getByRole("button", {
      name: "More options for Preacher curl",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Remove Preacher curl", exact: true })
    .click();
  await expect(page.locator(".nb-lineup-row h3")).toHaveText(["Dumbbell curl"]);
  expect((await read(page)).current).toBeNull();
  await page
    .getByRole("button", { name: "Undo removed exercise", exact: true })
    .click();
  await expect(page.locator(".nb-lineup-row h3")).toHaveText([
    "Dumbbell curl",
    "Preacher curl",
  ]);
  const previewMore = page.getByRole("button", {
    name: "More options for Preacher curl",
    exact: true,
  });
  await previewMore.click();
  await expect(
    page.getByRole("dialog", {
      name: "Options for Preacher curl",
      exact: true,
    }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(previewMore).toBeFocused();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page
    .getByRole("button", { name: "Start workout", exact: true })
    .click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  await expect(
    page.getByRole("dialog", {
      name: "Options for Preacher curl",
      exact: true,
    }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", {
      name: "More options for Preacher curl",
      exact: true,
    }),
  ).toHaveAttribute("aria-haspopup", "dialog");
  await enter(page, "20", "9");
  const draft = (await read(page)).current!;
  expect(draft.exercises[0].sets).toHaveLength(0);
  await page.reload();
  await expect(
    page.getByRole("textbox", { name: "Weight (kg)", exact: true }),
  ).toHaveValue("20");
  await expect(
    page.getByRole("textbox", { name: "Reps", exact: true }),
  ).toHaveValue("9");
  expect((await read(page)).current).toEqual(draft);
  await page.getByRole("button", { name: /^Log set 1 for / }).click();
  await saved(page);
  const original = (await read(page)).current!.exercises[0].sets[0];
  await page.getByRole("button", { name: "Edit set 1", exact: true }).click();
  await expect(page.getByLabel("Edit weight", { exact: true })).toBeFocused();
  await page.getByLabel("Edit weight", { exact: true }).fill("22.5");
  await narrow(page);
  await page
    .getByRole("button", { name: "Cancel correction", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Edit set 1", exact: true }),
  ).toBeFocused();
  expect((await read(page)).current!.exercises[0].sets[0]).toEqual(original);
  await page.getByRole("button", { name: "Edit set 1", exact: true }).click();
  await expect(page.getByLabel("Edit weight", { exact: true })).toBeFocused();
  await page.getByLabel("Edit weight", { exact: true }).fill("22.5");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await saved(page);
  await expect(
    page.getByRole("button", { name: "Edit set 1", exact: true }),
  ).toBeFocused();
  const corrected = (await read(page)).current!.exercises[0].sets[0];
  expect(corrected).toEqual({ ...original, weight: 22.5 });
  await page.getByRole("button", { name: "Edit set 1", exact: true }).click();
  await page.getByRole("button", { name: "Delete set", exact: true }).click();
  await saved(page);
  expect((await read(page)).current!.exercises[0].sets).toEqual([]);
  await page
    .getByRole("button", { name: "Undo deleted set", exact: true })
    .click();
  await saved(page);
  expect((await read(page)).current!.exercises[0].sets).toEqual([corrected]);
  await narrow(page);
});

test("mid-session add preserves another exercise draft; removing actual work requires confirmation and supports undo", async ({
  page,
}) => {
  await start(page);
  await enter(page, "17.5", "11");
  const original = (await read(page)).current!.exercises[0];
  await page
    .getByRole("button", { name: "Workout options", exact: true })
    .click();
  await page
    .getByRole("dialog", { name: "Workout options", exact: true })
    .getByRole("button", { name: "Add exercise", exact: true })
    .click();
  const picker = page.getByRole("dialog", {
    name: "Add exercise",
    exact: true,
  });
  await expect(picker).toBeVisible();
  await picker
    .getByRole("searchbox", { name: "Find an exercise", exact: true })
    .fill("curl");
  await expect(
    picker.getByRole("button", {
      name: "Dumbbell curl is already in this workout",
      exact: true,
    }),
  ).toBeDisabled();
  await narrow(page);
  await picker
    .getByRole("button", { name: "Add Hammer curl", exact: true })
    .click();
  await saved(page);
  let workout = (await read(page)).current!;
  expect(workout.exercises.find((x) => x.id === original.id)).toEqual(original);
  expect(workout.exercises).toHaveLength(3);
  const added = workout.exercises.find((x) => x.name === "Hammer curl")!;
  expect(workout.activeExerciseId).toBe(added.id);
  expect(added.sets).toEqual([]);
  await log(page, "15", "12");
  await enter(page, "17.5", "10");
  const beforeRemoval = (await read(page)).current!;
  let confirm = await removeActive(page, "Hammer curl");
  await expect(confirm).toContainText(/1.*set|set.*1/i);
  await expect(confirm).toContainText(/unlogged|draft|typed/i);
  await narrow(page);
  expect(
    await confirm.evaluate((el) => el.contains(document.activeElement)),
  ).toBe(true);
  await confirm
    .getByRole("button", { name: "Keep exercise", exact: true })
    .click();
  expect((await read(page)).current).toEqual(beforeRemoval);
  confirm = await removeActive(page, "Hammer curl");
  await confirm
    .getByRole("button", { name: "Remove exercise", exact: true })
    .click();
  await saved(page);
  workout = (await read(page)).current!;
  expect(workout.exercises.some((x) => x.id === added.id)).toBe(false);
  expect(workout.exercises.find((x) => x.id === original.id)).toEqual(original);
  await page
    .getByRole("button", { name: "Undo removed exercise", exact: true })
    .click();
  await saved(page);
  expect((await read(page)).current!.exercises).toEqual(
    beforeRemoval.exercises,
  );
  await page.reload();
  expect((await read(page)).current!.exercises).toEqual(
    beforeRemoval.exercises,
  );
});

test("removing the last exercise leaves Home with an explicit way to restore the same session", async ({
  page,
}) => {
  await start(page, ["Dumbbell curl"]);
  const before = (await read(page)).current!;
  const confirm = await removeActive(page, "Dumbbell curl");
  await confirm
    .getByRole("button", { name: "Remove exercise", exact: true })
    .click();
  await saved(page);
  expect((await read(page)).current).toBeNull();
  await expect(
    page.getByRole("button", { name: "Plan a workout", exact: true }),
  ).toBeVisible();
  await narrow(page);
  await page
    .getByRole("button", { name: "Undo removed workout", exact: true })
    .click();
  await saved(page);
  expect((await read(page)).current).toEqual(before);
  await expect(
    page.getByRole("button", { name: /^Log set 1 for / }),
  ).toBeVisible();
});

test("swap keeps recorded work attributed to its original exercise and confirms disposal of unlogged input", async ({
  page,
}) => {
  await start(page, ["Dumbbell curl"]);
  await log(page, "20", "10");
  const before = (await read(page)).current!;
  const original = before.exercises[0];
  await page
    .getByRole("button", {
      name: "More options for Dumbbell curl",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Swap Dumbbell curl", exact: true })
    .click();
  await narrow(page);
  await page
    .locator(".personal-inline .personal-secondary")
    .filter({ hasText: "Hammer curl" })
    .click();
  await saved(page);
  let workout = (await read(page)).current!;
  expect(workout.exercises.find((x) => x.id === original.id)).toEqual(original);
  const replacement = workout.exercises.find((x) => x.name === "Hammer curl")!;
  expect(replacement.sets).toEqual([]);
  expect(workout.activeExerciseId).toBe(replacement.id);
  await enter(page, "15", "12");
  const withDraft = (await read(page)).current!;
  await page
    .getByRole("button", { name: "More options for Hammer curl", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Swap Hammer curl", exact: true })
    .click();
  await page
    .locator(".personal-inline .personal-secondary")
    .filter({ hasText: "Preacher curl" })
    .click();
  const confirm = page.getByRole("group", {
    name: "Confirm exercise swap",
    exact: true,
  });
  await expect(confirm).toContainText("15");
  await narrow(page);
  await confirm
    .getByRole("button", { name: "Keep entry", exact: true })
    .click();
  expect((await read(page)).current).toEqual(withDraft);
  await page
    .getByRole("button", { name: "More options for Hammer curl", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Swap Hammer curl", exact: true })
    .click();
  await page
    .locator(".personal-inline .personal-secondary")
    .filter({ hasText: "Preacher curl" })
    .click();
  await page
    .getByRole("button", { name: "Discard entry and swap", exact: true })
    .click();
  await saved(page);
  workout = (await read(page)).current!;
  expect(workout.exercises.find((x) => x.id === original.id)).toEqual(original);
  expect(workout.exercises.some((x) => x.id === replacement.id)).toBe(false);
  expect(
    workout.exercises.find((x) => x.name === "Preacher curl")!.sets,
  ).toEqual([]);
});

test("finish, correct history, cancel workout deletion, delete, and undo retain the exact training record", async ({
  page,
}) => {
  await start(page, ["Dumbbell curl"]);
  await log(page, "20", "10");
  await page.getByRole("button", { name: "Finish", exact: true }).click();
  const finish = page.getByRole("dialog", {
    name: "Finish workout",
    exact: true,
  });
  await expect(
    finish.getByRole("button", { name: "Close dialog", exact: true }),
  ).toBeFocused();
  await narrow(page);
  await page.getByRole("button", { name: "Keep logging", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Finish", exact: true }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Finish", exact: true }).click();
  await page.getByRole("button", { name: "Save workout", exact: true }).click();
  await saved(page);
  await page
    .getByRole("button", { name: "View progress details", exact: true })
    .click();
  const history = page.getByRole("dialog", {
    name: "Training history and evidence",
    exact: true,
  });
  await history.getByText("Correct a set", { exact: true }).click();
  await history
    .getByRole("button", { name: "Correct Dumbbell curl set 1", exact: true })
    .click();
  await history
    .getByLabel("Correct history weight", { exact: true })
    .fill("22.5");
  await narrow(page);
  await history
    .getByRole("button", { name: "Save correction", exact: true })
    .click();
  await saved(page);
  const beforeDelete = (await read(page)).history;
  expect(beforeDelete[0].exercises[0].sets[0].weight).toBe(22.5);
  await history
    .getByRole("button", { name: "Correct Dumbbell curl set 1", exact: true })
    .click();
  await history
    .getByRole("button", { name: "Delete set", exact: true })
    .click();
  await saved(page);
  expect((await read(page)).history[0].exercises[0].sets).toEqual([]);
  // A finished workout remains reachable even after its last actual is removed.
  await history
    .getByRole("button", { name: "Close panel", exact: true })
    .click();
  await page
    .getByRole("button", { name: "View progress details", exact: true })
    .click();
  await expect(history.locator(".personal-progress-card")).toHaveCount(1);
  await history
    .getByRole("button", { name: "Undo deleted history set", exact: true })
    .click();
  await saved(page);
  expect((await read(page)).history).toEqual(beforeDelete);
  await history
    .getByRole("button", { name: /^More options for workout from / })
    .click();
  await page
    .getByRole("dialog", { name: "Workout options", exact: true })
    .getByRole("button", { name: /^Delete workout from / })
    .click();
  let confirm = page.getByRole("dialog", {
    name: "Delete workout",
    exact: true,
  });
  await expect(confirm).toBeVisible();
  expect(
    await confirm.evaluate((el) => el.contains(document.activeElement)),
  ).toBe(true);
  await confirm
    .getByRole("button", { name: "Keep workout", exact: true })
    .click();
  expect((await read(page)).history).toEqual(beforeDelete);
  await history
    .getByRole("button", { name: /^More options for workout from / })
    .click();
  await page
    .getByRole("dialog", { name: "Workout options", exact: true })
    .getByRole("button", { name: /^Delete workout from / })
    .click();
  confirm = page.getByRole("dialog", { name: "Delete workout", exact: true });
  await confirm
    .getByRole("button", { name: "Delete workout", exact: true })
    .click();
  await saved(page);
  expect((await read(page)).history).toEqual([]);
  await page
    .getByRole("button", { name: "Undo deleted workout", exact: true })
    .click();
  await saved(page);
  expect((await read(page)).history).toEqual(beforeDelete);
  await page.reload();
  expect((await read(page)).history).toEqual(beforeDelete);
});

test("failed exercise removal keeps the confirmation open and retries one durable change", async ({
  page,
}) => {
  await start(page);
  await log(page, "20", "10");
  const before = (await read(page)).current!;
  const confirm = await removeActive(page, "Dumbbell curl");
  await page.evaluate(() => {
    const original = IDBDatabase.prototype.transaction;
    (window as any).restoreModernTransactions = () => {
      IDBDatabase.prototype.transaction = original;
    };
    IDBDatabase.prototype.transaction = function (...args: any[]) {
      if (args[1] === "readwrite")
        throw new DOMException(
          "Synthetic removal failure",
          "QuotaExceededError",
        );
      return original.apply(this, args as any);
    };
  });
  await confirm
    .getByRole("button", { name: "Remove exercise", exact: true })
    .click();
  await expect(confirm).toBeVisible();
  await expect(
    confirm.getByRole("button", { name: "Retry save", exact: true }),
  ).toBeVisible();
  expect((await read(page)).current).toEqual(before);
  await expect(
    confirm.getByRole("button", { name: "Remove exercise", exact: true }),
  ).toBeDisabled();
  await page.evaluate(() => (window as any).restoreModernTransactions());
  await confirm
    .getByRole("button", { name: "Retry save", exact: true })
    .click();
  await saved(page);
  await expect(confirm).toHaveCount(0);
  expect((await read(page)).current!.exercises).toEqual(
    before.exercises.slice(1),
  );
  await page
    .getByRole("button", { name: "Undo removed exercise", exact: true })
    .click();
  await saved(page);
  expect((await read(page)).current!.exercises).toEqual(before.exercises);
});

test("empty preview and no search results provide a clear recovery path without creating actuals", async ({
  page,
}) => {
  await preview(page, ["Dumbbell curl"]);
  await page
    .getByRole("button", {
      name: "More options for Dumbbell curl",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: "Remove Dumbbell curl", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Start workout", exact: true }),
  ).toBeDisabled();
  expect((await read(page)).current).toBeNull();
  await narrow(page);
  await page.getByRole("button", { name: "Add exercise", exact: true }).click();
  let picker = page.getByRole("dialog", { name: "Add exercise", exact: true });
  await picker
    .getByRole("searchbox", { name: "Find an exercise", exact: true })
    .fill("no such movement 123");
  await expect(
    picker.getByRole("button", { name: "Clear filters", exact: true }),
  ).toBeVisible();
  await narrow(page);
  // Chromium first clears a focused native search field on Escape.
  await page.keyboard.press("Escape");
  await expect(
    picker.getByRole("searchbox", { name: "Find an exercise", exact: true }),
  ).toHaveValue("");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Escape");
  await expect(picker).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Add exercise", exact: true }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Add exercise", exact: true }).click();
  picker = page.getByRole("dialog", { name: "Add exercise", exact: true });
  await picker
    .getByRole("searchbox", { name: "Find an exercise", exact: true })
    .fill("no such movement 123");
  await picker
    .getByRole("button", { name: "Clear filters", exact: true })
    .click();
  await picker.getByRole("button", { name: "Biceps", exact: true }).click();
  await expect(
    picker.getByRole("button", { name: "Add Triceps pushdown", exact: true }),
  ).toHaveCount(0);
  await picker
    .getByRole("button", { name: "Add Hammer curl", exact: true })
    .click();
  await expect(page.locator(".nb-lineup-row h3")).toHaveText(["Hammer curl"]);
  await page
    .getByRole("button", { name: "Start workout", exact: true })
    .click();
  await saved(page);
  const state = await read(page);
  expect(state.current!.exercises).toHaveLength(1);
  expect(state.current!.exercises[0].sets).toEqual([]);
  expect(state.history).toEqual([]);
});

test("whole-session discard confirms recorded and typed work, cancels safely, and restores the exact session", async ({
  page,
}) => {
  await start(page);
  await log(page, "20", "10");
  await enter(page, "22.5", "9");
  const before = (await read(page)).current!;
  await page
    .getByRole("button", { name: "Workout options", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Discard current workout", exact: true })
    .click();
  let confirm = page.getByRole("dialog", {
    name: "Discard workout",
    exact: true,
  });
  await expect(confirm).toContainText(/1.*recorded|recorded.*1/i);
  await expect(confirm).toContainText(/unlogged|draft|typed/i);
  await narrow(page);
  await confirm
    .getByRole("button", { name: "Keep workout", exact: true })
    .click();
  expect((await read(page)).current).toEqual(before);
  await expect(
    page.getByRole("button", { name: "Workout options", exact: true }),
  ).toBeFocused();
  await page
    .getByRole("button", { name: "Workout options", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Discard current workout", exact: true })
    .click();
  confirm = page.getByRole("dialog", { name: "Discard workout", exact: true });
  await confirm
    .getByRole("button", { name: "Discard workout", exact: true })
    .click();
  await saved(page);
  expect((await read(page)).current).toBeNull();
  expect((await read(page)).history).toEqual([]);
  await page
    .getByRole("button", { name: "Undo removed workout", exact: true })
    .click();
  await saved(page);
  expect((await read(page)).current).toEqual(before);
  await page.reload();
  expect((await read(page)).current).toEqual(before);
});
