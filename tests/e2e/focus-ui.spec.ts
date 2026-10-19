import { test, expect, type Locator, type Page } from "@playwright/test";

const sixExercises = [
  "Barbell deadlift",
  "Lat pulldown",
  "Seated cable row",
  "Dumbbell curl",
  "Preacher curl",
  "Hammer curl",
];
const read = (page: Page) =>
  page.evaluate(async () =>
    (await import("/frontend/src/personalStore.ts")).readState(),
  );
const saved = (page: Page) =>
  expect(page.locator(".personal-status")).toHaveText("Saved on this device");
const shot = (page: Page, name: string) =>
  page.screenshot({
    path: `artifacts/focus-qa/revised-${name}.png`,
    fullPage: true,
  });

async function reachable(control: Locator) {
  await control.scrollIntoViewIfNeeded();
  await expect(control).toBeInViewport();
  const box = await control.boundingBox();
  expect(
    box?.height,
    "A primary/action target must be at least 44px high",
  ).toBeGreaterThanOrEqual(44);
  expect(
    box?.width,
    "A primary/action target must be at least 44px wide",
  ).toBeGreaterThanOrEqual(44);
  expect(
    await control.evaluate((el) => {
      const r = el.getBoundingClientRect();
      const hit = document.elementFromPoint(
        r.left + r.width / 2,
        r.top + r.height / 2,
      );
      return hit === el || (hit !== null && el.contains(hit));
    }),
    "The visible action must not be covered by another surface",
  ).toBe(true);
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
async function readableText(text: Locator) {
  await expect(text).toBeVisible();
  expect(
    await text.evaluate((el) => {
      const style = getComputedStyle(el);
      const box = el.getBoundingClientRect();
      const range = document.createRange();
      range.selectNodeContents(el);
      const content = range.getBoundingClientRect();
      return (
        style.textOverflow !== "ellipsis" &&
        !["1", "2", "3"].includes(style.webkitLineClamp) &&
        content.left >= box.left - 1 &&
        content.right <= box.right + 1 &&
        ![
          el,
          ...(function* () {
            let parent = el.parentElement;
            while (parent) {
              yield parent;
              parent = parent.parentElement;
            }
          })(),
        ].some((parent) => {
          const parentStyle = getComputedStyle(parent);
          const bounds = parent.getBoundingClientRect();
          return (
            ["hidden", "clip"].includes(parentStyle.overflowY) &&
            (content.top < bounds.top - 1 || content.bottom > bounds.bottom + 1)
          );
        })
      );
    }),
    "The entire exercise title must wrap within its visible container",
  ).toBe(true);
}
async function numericValueFits(input: Locator) {
  const dimensions = await input.evaluate((element) => {
    const field = element as HTMLInputElement;
    const style = getComputedStyle(field);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    return {
      value: field.value,
      text: context.measureText(field.value).width,
      available:
        field.clientWidth -
        parseFloat(style.paddingLeft) -
        parseFloat(style.paddingRight),
    };
  });
  expect(
    dimensions.text,
    `The entire actual value ${dimensions.value} must fit in its numeric field (${dimensions.available}px available)`,
  ).toBeLessThanOrEqual(dimensions.available + 1);
}
async function textScale(page: Page, factor: number) {
  // Model text-only enlargement; preserve and restore styles so new surfaces do not compound inherited sizes.
  await page.evaluate((factor) => {
    const previous = (window as any).__focusTextStyles as
      Array<{ el: HTMLElement; style: string | null }> | undefined;
    for (const item of previous || []) {
      if (item.style === null) item.el.removeAttribute("style");
      else item.el.setAttribute("style", item.style);
    }
    (window as any).__focusTextStyles = [];
    if (factor === 1) return;
    const metrics = [...document.querySelectorAll<HTMLElement>("body *")].map(
      (el) => {
        const style = getComputedStyle(el);
        return {
          el,
          original: el.getAttribute("style"),
          size: parseFloat(style.fontSize),
          line: parseFloat(style.lineHeight),
        };
      },
    );
    (window as any).__focusTextStyles = metrics.map(({ el, original }) => ({
      el,
      style: original,
    }));
    for (const { el, size, line } of metrics) {
      if (Number.isFinite(size)) el.style.fontSize = `${size * factor}px`;
      if (Number.isFinite(line)) el.style.lineHeight = `${line * factor}px`;
    }
  }, factor);
}
async function exerciseOptions(page: Page, name: string) {
  const trigger = page.getByRole("button", {
    name: `More options for ${name}`,
    exact: true,
  });
  await reachable(trigger);
  await trigger.click();
  const dialog = page.getByRole("dialog", {
    name: `Options for ${name}`,
    exact: true,
  });
  await expect(dialog).toBeVisible();
  return dialog;
}
async function sessionOptions(page: Page) {
  await page
    .getByRole("button", { name: "Workout options", exact: true })
    .click();
}
async function setOptions(page: Page, number: number) {
  const trigger = page.getByRole("button", {
    name: `Options for set ${number}`,
    exact: true,
  });
  await reachable(trigger);
  await trigger.click();
  const dialog = page.getByRole("dialog", {
    name: `Set ${number} options`,
    exact: true,
  });
  await expect(dialog).toBeVisible();
  return dialog;
}
async function enter(page: Page, weight: string, reps: string) {
  await page
    .getByRole("textbox", { name: "Weight (kg)", exact: true })
    .fill(weight);
  await page.getByRole("textbox", { name: "Reps", exact: true }).fill(reps);
  await saved(page);
}
async function log(page: Page, weight: string, reps: string) {
  await enter(page, weight, reps);
  const button = page.getByRole("button", { name: /^Log set \d+ for / });
  await reachable(button);
  await button.click();
  await saved(page);
}
async function previewSix(page: Page) {
  await page.goto("/");
  await expect(
    page.getByRole("button", { name: "Plan a workout", exact: true }),
  ).toBeVisible();
  await shot(page, "home");
  await page
    .getByRole("button", { name: "Plan a workout", exact: true })
    .click();
  for (const name of ["Back", "Biceps"])
    await page.getByRole("button", { name, exact: true }).click();
  await page
    .getByRole("button", { name: "Pick exercises", exact: true })
    .click();
  for (const name of sixExercises)
    await page.getByRole("button", { name, exact: true }).click();
  await shot(page, "planner-six-selected");
  const build = page.getByRole("button", {
    name: "Build my workout",
    exact: true,
  });
  await reachable(build);
  await build.click();
  await expect(page.locator(".nb-lineup-row h3")).toHaveText(sixExercises);
  await shot(page, "review");
}

test("one-hand gym journey: six exercises, target edit, typo correction, busy equipment, add/remove, partial finish and return", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-10-19T10:00:00Z") });
  await page.setViewportSize({ width: 390, height: 844 });
  await previewSix(page);
  let options = await exerciseOptions(page, "Dumbbell curl");
  await shot(page, "exercise-options");
  await options
    .getByRole("button", { name: "Edit Dumbbell curl", exact: true })
    .click();
  let edit = page.getByRole("dialog", { name: "Edit exercise", exact: true });
  await edit.getByLabel("Working sets target", { exact: true }).fill("2");
  await edit.getByRole("button", { name: "Cancel", exact: true }).click();
  options = await exerciseOptions(page, "Dumbbell curl");
  await options
    .getByRole("button", { name: "Edit Dumbbell curl", exact: true })
    .click();
  edit = page.getByRole("dialog", { name: "Edit exercise", exact: true });
  await expect(
    edit.getByLabel("Working sets target", { exact: true }),
  ).toHaveValue("3");
  await edit.getByLabel("Working sets target", { exact: true }).fill("2");
  await shot(page, "edit-exercise");
  await edit.getByRole("button", { name: "Save changes", exact: true }).click();
  expect((await read(page)).current).toBeNull();
  await page
    .getByRole("button", { name: "Start workout", exact: true })
    .click();
  await saved(page);
  const started = (await read(page)).current!;
  expect(started.exercises.map((x) => x.name)).toEqual(sixExercises);
  expect(started.exercises[3].plannedSets).toBe(2);
  expect(started.exercises.every((x) => x.sets.length === 0)).toBe(true);
  await expect(
    page.getByRole("textbox", { name: "Weight (kg)", exact: true }),
  ).toHaveAttribute("inputmode", "decimal");
  await expect(
    page.getByRole("textbox", { name: "Reps", exact: true }),
  ).toHaveAttribute("inputmode", "numeric");
  await shot(page, "active");
  await log(page, "600", "5");
  const typo = (await read(page)).current!.exercises[0].sets[0];
  await page
    .getByRole("button", { name: "Options for set 1", exact: true })
    .click();
  await page
    .getByRole("dialog", { name: "Set 1 options", exact: true })
    .getByRole("button", { name: "Edit set 1", exact: true })
    .click();
  await page.getByLabel("Edit weight", { exact: true }).fill("60");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await saved(page);
  expect((await read(page)).current!.exercises[0].sets[0]).toEqual({
    ...typo,
    weight: 60,
  });
  await page
    .locator(".nb-exercise-heading")
    .filter({
      has: page.getByRole("heading", { name: "Lat pulldown", exact: true }),
    })
    .click();
  await log(page, "40", "10");
  const original = (await read(page)).current!.exercises.find(
    (x) => x.name === "Lat pulldown",
  )!;
  options = await exerciseOptions(page, "Lat pulldown");
  await options
    .getByRole("button", { name: "Swap Lat pulldown", exact: true })
    .click();
  const swap = page.getByRole("dialog", { name: "Swap exercise", exact: true });
  await shot(page, "swap");
  await swap
    .getByRole("button", { name: "Swap to Assisted pull-up", exact: true })
    .click();
  await saved(page);
  let workout = (await read(page)).current!;
  expect(workout.exercises.find((x) => x.id === original.id)).toEqual(original);
  const replacement = workout.exercises.find(
    (x) => x.name === "Assisted pull-up",
  )!;
  expect(replacement.sets).toEqual([]);
  expect(replacement.plannedSets).toBe(2);
  await sessionOptions(page);
  await page
    .getByRole("dialog", { name: "Workout options", exact: true })
    .getByRole("button", { name: "Add exercise", exact: true })
    .click();
  const picker = page.getByRole("dialog", {
    name: "Choose exercises",
    exact: true,
  });
  await picker
    .getByRole("searchbox", { name: "Search exercises", exact: true })
    .fill("Cable curl");
  await shot(page, "add-exercise");
  await picker
    .getByRole("checkbox", { name: "Cable curl", exact: true })
    .click();
  await picker
    .getByRole("button", { name: "Save exercises", exact: true })
    .click();
  await saved(page);
  const beforeRemove = (await read(page)).current!;
  const added = beforeRemove.exercises.find((x) => x.name === "Cable curl")!;
  options = await exerciseOptions(page, "Cable curl");
  await options
    .getByRole("button", { name: "Remove Cable curl", exact: true })
    .click();
  let remove = page.getByRole("dialog", {
    name: "Remove exercise",
    exact: true,
  });
  await shot(page, "remove-exercise");
  await remove
    .getByRole("button", { name: "Keep exercise", exact: true })
    .click();
  expect((await read(page)).current).toEqual(beforeRemove);
  options = await exerciseOptions(page, "Cable curl");
  await options
    .getByRole("button", { name: "Remove Cable curl", exact: true })
    .click();
  remove = page.getByRole("dialog", { name: "Remove exercise", exact: true });
  await remove
    .getByRole("button", { name: "Remove exercise", exact: true })
    .click();
  await saved(page);
  expect(
    (await read(page)).current!.exercises.some((x) => x.id === added.id),
  ).toBe(false);
  await page
    .getByRole("button", { name: "Undo removed exercise", exact: true })
    .click();
  await saved(page);
  expect((await read(page)).current!.exercises).toEqual(beforeRemove.exercises);
  await page.reload();
  expect((await read(page)).current!.exercises).toEqual(beforeRemove.exercises);
  await page.getByRole("button", { name: "Finish", exact: true }).click();
  await shot(page, "partial-finish");
  await page.getByRole("button", { name: "Save workout", exact: true }).click();
  await saved(page);
  const finished = (await read(page)).history;
  expect(finished).toHaveLength(1);
  expect(finished[0].exercises.flatMap((x) => x.sets)).toHaveLength(2);
  await shot(page, "populated-home");
  await page.clock.setSystemTime(new Date("2026-10-26T10:00:00Z"));
  await page
    .getByRole("button", { name: "Repeat this workout", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Start workout", exact: true })
    .click();
  await saved(page);
  workout = (await read(page)).current!;
  expect(
    workout.exercises.every(
      (x) => !x.sets.length && !x.pendingWeight && !x.pendingReps,
    ),
  ).toBe(true);
  expect((await read(page)).history).toEqual(finished);
  await expect(page.locator(".nb-last-time")).toContainText("60 kg × 5");
  await shot(page, "return-next-week");
});

test("long exercise names remain readable and actions operable at 320px and doubled text", async ({
  page,
}) => {
  await page.goto("/");
  const longName =
    "Single-arm cable row with a controlled pause and an independent adjustable handle";
  await page.evaluate(async (name) => {
    const store = await import("/frontend/src/personalStore.ts");
    const logic = await import("/frontend/src/personalLogic.ts");
    const state = store.defaultState();
    state.current = logic.generateCustomPlan(
      ["row", "curl", "preacher-curl"],
      state.settings,
    );
    state.current.exercises[0].name = name;
    state.current.exercises[0].equipment =
      "Independent adjustable cable station beside the north wall";
    await store.saveState(state, 0);
  }, longName);
  for (const width of [320, 390]) {
    for (const scale of [1, 2]) {
      await page.setViewportSize({ width, height: 844 });
      await page.reload();
      const title = page.getByRole("heading", { name: longName, exact: true });
      await expect(title).toBeVisible();
      if (scale === 2) await textScale(page, 2);
      await noSideways(page);
      await readableText(title);
      await enter(page, "22.5", "12");
      await numericValueFits(
        page.getByRole("textbox", { name: "Weight (kg)", exact: true }),
      );
      await numericValueFits(
        page.getByRole("textbox", { name: "Reps", exact: true }),
      );
      await reachable(
        page.getByRole("button", {
          name: `Log set 1 for ${longName}`,
          exact: true,
        }),
      );
      await shot(page, `long-active-${width}-text-${scale}`);
      // Reload before opening the new surface to avoid compounding inherited font sizes.
      await page.reload();
      const options = await exerciseOptions(page, longName);
      if (scale === 2) await textScale(page, 2);
      await noSideways(page);
      await reachable(
        options.getByRole("button", { name: `Swap ${longName}`, exact: true }),
      );
      await reachable(
        options.getByRole("button", { name: `Edit ${longName}`, exact: true }),
      );
      await reachable(
        options.getByRole("button", {
          name: `Remove ${longName}`,
          exact: true,
        }),
      );
      await shot(page, `long-options-${width}-text-${scale}`);
      await page.keyboard.press("Escape");
      await expect(
        page.getByRole("button", {
          name: `More options for ${longName}`,
          exact: true,
        }),
      ).toBeFocused();
    }
  }
});

test("exercise target editor validates and keeps a failed write recoverable without changing actuals", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/");
  await page.evaluate(async () => {
    const store = await import("/frontend/src/personalStore.ts");
    const logic = await import("/frontend/src/personalLogic.ts");
    const state = store.defaultState();
    state.current = logic.generateCustomPlan(["curl"], state.settings);
    await store.saveState(state, 0);
  });
  await page.reload();
  await log(page, "20", "10");
  const before = (await read(page)).current!;
  const options = await exerciseOptions(page, "Dumbbell curl");
  await options
    .getByRole("button", { name: "Edit Dumbbell curl", exact: true })
    .click();
  const edit = page.getByRole("dialog", { name: "Edit exercise", exact: true });
  await edit.getByLabel("Working sets target", { exact: true }).fill("0");
  await edit.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(edit).toBeVisible();
  expect((await read(page)).current).toEqual(before);
  await edit.getByLabel("Working sets target", { exact: true }).fill("4");
  await edit.getByLabel("Lower rep target", { exact: true }).fill("9");
  await edit.getByLabel("Upper rep target", { exact: true }).fill("12");
  await noSideways(page);
  await page.evaluate(() => {
    const original = IDBDatabase.prototype.transaction;
    (window as any).restoreFocusTransactions = () => {
      IDBDatabase.prototype.transaction = original;
    };
    IDBDatabase.prototype.transaction = function (...args: any[]) {
      if (args[1] === "readwrite")
        throw new DOMException(
          "Synthetic target edit failure",
          "QuotaExceededError",
        );
      return original.apply(this, args as any);
    };
  });
  await edit.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(edit).toBeVisible();
  await expect(
    edit.getByLabel("Working sets target", { exact: true }),
  ).toHaveValue("4");
  expect((await read(page)).current).toEqual(before);
  await shot(page, "edit-save-failed");
  await page.evaluate(() => (window as any).restoreFocusTransactions());
  await edit.getByRole("button", { name: "Retry save", exact: true }).click();
  await saved(page);
  await expect(edit).toHaveCount(0);
  const after = (await read(page)).current!;
  expect(after.exercises[0]).toEqual({
    ...before.exercises[0],
    plannedSets: 4,
    repMin: 9,
    repMax: 12,
    restSeconds: 0,
  });
  await page.reload();
  expect((await read(page)).current).toEqual(after);
});

test("older receipts expand as complete rows and correction drafts survive navigation attempts", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/");
  await page.evaluate(async () => {
    const store = await import("/frontend/src/personalStore.ts");
    const logic = await import("/frontend/src/personalLogic.ts");
    const state = store.defaultState();
    state.current = logic.generateCustomPlan(
      ["curl", "preacher-curl"],
      state.settings,
    );
    await store.saveState(state, 0);
  });
  await page.reload();
  for (const reps of ["10", "9", "8"]) await log(page, "20", reps);
  await page.getByRole("button", { name: "Add set", exact: true }).click();
  await log(page, "20", "7");
  const before = (await read(page)).current!;
  await expect(
    page.getByRole("button", { name: "Options for set 1", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Options for set 2", exact: true }),
  ).toHaveCount(0);
  for (const number of [3, 4])
    await reachable(
      page.getByRole("button", {
        name: `Options for set ${number}`,
        exact: true,
      }),
    );
  const reveal = page.getByRole("button", {
    name: "Show all 4 sets",
    exact: true,
  });
  await reachable(reveal);
  await shot(page, "recent-receipts-320");
  await reveal.click();
  for (const number of [1, 2, 3, 4])
    await reachable(
      page.getByRole("button", {
        name: `Options for set ${number}`,
        exact: true,
      }),
    );
  await shot(page, "all-receipts-320");
  await page
    .getByRole("button", { name: "Options for set 1", exact: true })
    .click();
  await page
    .getByRole("dialog", { name: "Set 1 options", exact: true })
    .getByRole("button", { name: "Edit set 1", exact: true })
    .click();
  const weight = page.getByLabel("Edit weight", { exact: true });
  await weight.fill("21");
  await expect(
    page.getByRole("button", { name: "Show fewer sets", exact: true }),
  ).toBeDisabled();
  await page
    .locator(".nb-exercise-heading")
    .filter({
      has: page.getByRole("heading", { name: "Preacher curl", exact: true }),
    })
    .click();
  await expect(weight).toBeFocused();
  await expect(weight).toHaveValue("21");
  await expect(
    page.getByText(
      "Save or cancel this correction before changing exercises.",
      { exact: true },
    ),
  ).toBeVisible();
  expect((await read(page)).current).toEqual(before);
  await page
    .getByRole("button", { name: "Workout options", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Workout options", exact: true }),
  ).toHaveCount(0);
  await expect(weight).toBeFocused();
  await expect(weight).toHaveValue("21");
  await shot(page, "correction-navigation-guard");
  await page
    .getByRole("button", { name: "Cancel correction", exact: true })
    .click();
  expect((await read(page)).current).toEqual(before);
  await page
    .getByRole("button", { name: "Options for set 1", exact: true })
    .click();
  await page
    .getByRole("dialog", { name: "Set 1 options", exact: true })
    .getByRole("button", { name: "Edit set 1", exact: true })
    .click();
  await weight.fill("21");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await saved(page);
  const expected = structuredClone(before);
  expected.exercises[0].sets[0].weight = 21;
  expect((await read(page)).current).toEqual(expected);
  await page
    .getByRole("button", { name: "Show fewer sets", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Options for set 1", exact: true }),
  ).toHaveCount(0);
  await page.reload();
  expect((await read(page)).current).toEqual(expected);
});

test("saved-set options preserve the next draft through cancel, correction, deletion, undo and failed-write retry", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/");
  await page.evaluate(async () => {
    const store = await import("/frontend/src/personalStore.ts");
    const logic = await import("/frontend/src/personalLogic.ts");
    const state = store.defaultState();
    state.current = logic.generateCustomPlan(["curl"], state.settings);
    state.current.exercises[0].plannedSets = 5;
    await store.saveState(state, 0);
  });
  await page.reload();
  for (const [weight, reps] of [
    ["20", "10"],
    ["22.5", "9"],
    ["25", "8"],
    ["27.5", "7"],
  ])
    await log(page, weight, reps);
  await enter(page, "30", "6");
  const original = (await read(page)).current!;
  const firstId = original.exercises[0].sets[0].id;
  const firstTrigger = page.getByRole("button", {
    name: "Options for set 1",
    exact: true,
  });
  await expect(firstTrigger).toHaveCount(0);
  await page
    .getByRole("button", { name: "Show all 4 sets", exact: true })
    .click();

  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await noSideways(page);
    const receipt = page.locator(`.nb-saved-set[data-set-id="${firstId}"]`);
    await expect(receipt.locator(".ds-set-value")).toHaveText([
      "Weight 20 kg",
      "Reps 10",
    ]);
    await expect(
      receipt.getByRole("img", { name: "Recorded set 1", exact: true }),
    ).toBeVisible();
    await expect(receipt.getByRole("button")).toHaveCount(1);
    const aligned = await receipt
      .locator(".ds-saved-receipt")
      .evaluate((row) => {
        const parts = [
          row.querySelector(".ds-set-ordinal > span:first-child")!,
          row.querySelector(".ds-commit--saved")!,
          ...row.querySelectorAll(".ds-set-value"),
          row.querySelector("button")!,
        ].map((part) => part.getBoundingClientRect());
        const centers = parts.map((part) => part.top + part.height / 2);
        return Math.max(...centers) - Math.min(...centers);
      });
    expect(
      aligned,
      "Set number, tick, actuals and ellipsis share a row center",
    ).toBeLessThanOrEqual(1);
    let menu = await setOptions(page, 1);
    await expect(firstTrigger).toHaveAttribute("aria-haspopup", "dialog");
    await reachable(
      menu.getByRole("button", { name: "Edit set 1", exact: true }),
    );
    await reachable(
      menu.getByRole("button", { name: "Delete set 1", exact: true }),
    );
    await noSideways(page);
    await page.screenshot({
      path: `artifacts/set-actions/options-${width}.png`,
      fullPage: true,
    });
    await page.keyboard.press("Escape");
    await expect(menu).toHaveCount(0);
    await expect(firstTrigger).toBeFocused();
    expect((await read(page)).current).toEqual(original);
    menu = await setOptions(page, 1);
    await menu
      .getByRole("button", { name: "Close dialog", exact: true })
      .click();
    await expect(firstTrigger).toBeFocused();
    expect((await read(page)).current).toEqual(original);
    await page.screenshot({
      path: `artifacts/set-actions/receipts-${width}.png`,
      fullPage: true,
    });
    await textScale(page, 2);
    await noSideways(page);
    menu = await setOptions(page, 1);
    await textScale(page, 2);
    await noSideways(page);
    await reachable(
      menu.getByRole("button", { name: "Edit set 1", exact: true }),
    );
    await reachable(
      menu.getByRole("button", { name: "Delete set 1", exact: true }),
    );
    await page.screenshot({
      path: `artifacts/set-actions/options-${width}-text-2.png`,
      fullPage: true,
    });
    await page.keyboard.press("Escape");
    await expect(firstTrigger).toBeFocused();
    await textScale(page, 1);
    expect((await read(page)).current).toEqual(original);
  }

  let menu = await setOptions(page, 1);
  await menu.getByRole("button", { name: "Edit set 1", exact: true }).click();
  const weight = page.getByLabel("Edit weight", { exact: true });
  await expect(weight).toBeFocused();
  await weight.fill("21");
  await page
    .getByRole("button", { name: "Cancel correction", exact: true })
    .click();
  await expect(firstTrigger).toBeFocused();
  expect((await read(page)).current).toEqual(original);
  menu = await setOptions(page, 1);
  await menu.getByRole("button", { name: "Edit set 1", exact: true }).click();
  await weight.fill("21");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await saved(page);
  await expect(firstTrigger).toBeFocused();
  const corrected = structuredClone(original);
  corrected.exercises[0].sets[0].weight = 21;
  expect((await read(page)).current).toEqual(corrected);

  menu = await setOptions(page, 1);
  await menu.getByRole("button", { name: "Delete set 1", exact: true }).click();
  await saved(page);
  await expect(menu).toHaveCount(0);
  const deleted = structuredClone(corrected);
  deleted.exercises[0].sets.shift();
  expect((await read(page)).current).toEqual(deleted);
  await page
    .getByRole("button", { name: "Undo deleted set", exact: true })
    .click();
  await saved(page);
  expect((await read(page)).current).toEqual(corrected);

  menu = await setOptions(page, 1);
  await page.evaluate(() => {
    const transaction = IDBDatabase.prototype.transaction;
    (window as any).restoreSetActionTransactions = () => {
      IDBDatabase.prototype.transaction = transaction;
    };
    IDBDatabase.prototype.transaction = function (...args: any[]) {
      if (args[1] === "readwrite")
        throw new DOMException(
          "Synthetic set deletion failure",
          "QuotaExceededError",
        );
      return transaction.apply(this, args as any);
    };
  });
  await menu.getByRole("button", { name: "Delete set 1", exact: true }).click();
  await expect(menu).toBeVisible();
  await expect(
    menu.getByRole("button", { name: "Retry save", exact: true }),
  ).toBeVisible();
  await expect(
    menu.getByRole("button", { name: "Delete set 1", exact: true }),
  ).toBeDisabled();
  await expect(page.locator(".personal-status")).not.toHaveText(
    "Saved on this device",
  );
  expect((await read(page)).current).toEqual(corrected);
  await expect(
    page.locator(`.nb-saved-set[data-set-id="${firstId}"]`),
  ).toBeVisible();
  await page.screenshot({
    path: "artifacts/set-actions/delete-failed.png",
    fullPage: true,
  });
  await page.evaluate(() => (window as any).restoreSetActionTransactions());
  await menu.getByRole("button", { name: "Retry save", exact: true }).click();
  await saved(page);
  await expect(menu).toHaveCount(0);
  expect((await read(page)).current).toEqual(deleted);
  await page.reload();
  expect((await read(page)).current).toEqual(deleted);
  await expect(
    page.getByRole("textbox", { name: "Weight (kg)", exact: true }),
  ).toHaveValue("30");
  await expect(
    page.getByRole("textbox", { name: "Reps", exact: true }),
  ).toHaveValue("6");
});
