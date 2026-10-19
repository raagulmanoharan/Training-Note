import { test, expect } from "@playwright/test";
const read = (p: any) =>
  p.evaluate(async () =>
    (await import("/frontend/src/personalStore.ts")).readState(),
  );
async function log(p: any, weight = "40", reps = "10") {
  await p
    .getByRole("textbox", { name: "Weight (kg)", exact: true })
    .fill(weight);
  await p.getByRole("textbox", { name: "Reps", exact: true }).fill(reps);
  await p.getByRole("button", { name: /^Log set \d+ for / }).click();
  await expect(p.locator(".personal-status")).toHaveText(
    "Saved on this device",
  );
}
test("complete workout: plan, correct, swap, complete every remaining set, resume, finish and repeat", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Settings and backup", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Gym label", exact: true })
    .fill("Workout audit gym");
  await expect(page.locator(".personal-status")).toHaveText(
    "Saved on this device",
  );
  await page.getByRole("button", { name: "Close panel", exact: true }).click();
  await page
    .getByRole("button", { name: "Plan a workout", exact: true })
    .click();
  for (const name of ["Chest", "Back"])
    await page.getByRole("button", { name, exact: true }).click();
  await page.getByLabel("Exercises", { exact: true }).fill("2");
  await page.getByRole("button", { name: "Build my workout" }).click();
  expect((await read(page)).current).toBeNull();
  await page
    .getByRole("button", { name: "Start workout", exact: true })
    .click();
  await log(page);
  await page.getByRole("button", { name: "Edit set 1", exact: true }).click();
  await page.getByLabel("Edit weight", { exact: true }).fill("42.5");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  let state = await read(page);
  const original = state.current.exercises[0],
    originalSet = original.sets[0];
  await page
    .getByRole("button", {
      name: `More options for ${original.name}`,
      exact: true,
    })
    .click();
  await page
    .getByRole("button", { name: `Swap ${original.name}`, exact: true })
    .click();
  await page.locator(".personal-inline .personal-secondary").first().click();
  state = await read(page);
  expect(
    state.current.exercises.find((x: any) => x.id === original.id).sets,
  ).toEqual([originalSet]);
  expect(state.current.exercises.length).toBe(3);
  const ids = state.current.exercises
    .filter((x: any) => x.id !== original.id)
    .map((x: any) => x.id);
  for (const id of ids) {
    const w = (await read(page)).current;
    const index = w.exercises.findIndex((x: any) => x.id === id);
    const x = w.exercises[index];
    await page
      .locator(".nb-exercise-heading")
      .filter({ has: page.getByRole("heading", { name: x.name, exact: true }) })
      .click();
    for (let n = x.sets.length; n < x.plannedSets; n++)
      await log(page, "30", "10");
  }
  state = await read(page);
  expect(
    state.current.exercises.reduce((n: number, x: any) => n + x.sets.length, 0),
  ).toBe(6);
  const expected = state.current;
  await page.getByRole("button", { name: "Back to Home", exact: true }).click();
  await page
    .getByRole("button", { name: "Continue workout", exact: true })
    .click();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Finish", exact: true }),
  ).toBeVisible();
  expect((await read(page)).current).toEqual(expected);
  await page.getByRole("button", { name: "Finish", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Finish workout", exact: true }),
  ).toBeInViewport();
  await expect(
    page
      .getByRole("dialog", { name: "Finish workout", exact: true })
      .getByRole("button", { name: "Close dialog", exact: true }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Keep logging", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Finish", exact: true }),
  ).toBeFocused();
  await page.getByRole("button", { name: "Finish", exact: true }).click();
  await page.getByRole("button", { name: "Save workout", exact: true }).click();
  state = await read(page);
  expect(state.current).toBeNull();
  expect(state.history).toHaveLength(1);
  expect(state.history[0].exercises).toEqual(expected.exercises);
  await expect(page.locator(".home-day.visited")).toHaveCount(1);
  await page
    .getByRole("button", { name: "View progress details", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toContainText("42.5 kg × 10");
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Repeat this workout", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Start workout", exact: true })
    .click();
  state = await read(page);
  expect(state.current.exercises.every((x: any) => !x.sets.length)).toBe(true);
  expect(state.history).toHaveLength(1);
  expect(
    state.current.exercises.reduce((n: number, x: any) => n + x.plannedSets, 0),
  ).toBe(6);
  await expect(page.locator(".nb-last-time")).toContainText("42.5 kg × 10");
});

test("readability: Home and Workout retain readable type, touch targets and narrow viewport fit", async ({
  page,
}) => {
  async function readableScreen() {
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const visibleText = await page.locator("main").evaluate((root) =>
      [...root.querySelectorAll("*")]
        .filter((element) => {
          const bounds = element.getBoundingClientRect();
          return (
            [...element.childNodes].some(
              (node) =>
                node.nodeType === Node.TEXT_NODE && node.textContent?.trim(),
            ) &&
            bounds.width > 1 &&
            bounds.height > 1 &&
            getComputedStyle(element).visibility !== "hidden"
          );
        })
        .map((element) => ({
          text: element.textContent,
          size: parseFloat(getComputedStyle(element).fontSize),
        })),
    );
    expect(visibleText.length).toBeGreaterThan(3);
    for (const text of visibleText)
      expect(text.size, `Readable text: ${text.text}`).toBeGreaterThanOrEqual(
        12,
      );
    for (const button of await page.getByRole("button").all()) {
      if (!(await button.isVisible())) continue;
      const bounds = await button.boundingBox();
      expect(bounds!.height, await button.innerText()).toBeGreaterThanOrEqual(
        44,
      );
      expect(bounds!.width, await button.innerText()).toBeGreaterThanOrEqual(
        44,
      );
    }
  }
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "Your next workout.", exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("button", { name: "Settings and backup", exact: true })
      .locator("svg"),
  ).toBeVisible();
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await readableScreen();
  }
  await page
    .getByRole("button", { name: "Plan a workout", exact: true })
    .click();
  await page.getByRole("button", { name: "Chest", exact: true }).click();
  await page.getByRole("button", { name: "Build my workout" }).click();
  await page
    .getByRole("button", { name: "Start workout", exact: true })
    .click();
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await readableScreen();
  }
  expect(
    await page
      .getByRole("textbox", { name: "Weight (kg)", exact: true })
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize)),
  ).toBeGreaterThanOrEqual(16);
});

test("finish states: cancel and discard empty session; partial finish drops only explicitly unlogged input", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  async function start() {
    await page
      .getByRole("button", { name: "Plan a workout", exact: true })
      .click();
    const chest = page.getByRole("button", { name: "Chest", exact: true });
    if ((await chest.getAttribute("aria-pressed")) !== "true")
      await chest.click();
    await page.getByRole("button", { name: "Build my workout" }).click();
    await page
      .getByRole("button", { name: "Start workout", exact: true })
      .click();
  }
  await page.goto("/");
  await start();
  const emptyId = (await read(page)).current.id;
  await page.getByRole("button", { name: "Finish", exact: true }).click();
  await page.getByRole("button", { name: "Keep logging", exact: true }).click();
  expect((await read(page)).current.id).toBe(emptyId);
  await page.getByRole("button", { name: "Finish", exact: true }).click();
  await page
    .getByRole("button", { name: "Discard empty draft", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Your next workout.", exact: true }),
  ).toBeVisible();
  expect((await read(page)).history).toEqual([]);
  await start();
  await log(page);
  await page
    .getByRole("textbox", { name: "Weight (kg)", exact: true })
    .fill("42.5");
  await page.getByRole("textbox", { name: "Reps", exact: true }).fill("9");
  await page.getByRole("button", { name: "Finish", exact: true }).click();
  await expect(
    page.getByRole("dialog", { name: "Finish workout", exact: true }),
  ).toContainText("unlogged input");
  await page.getByRole("button", { name: "Keep logging", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Weight (kg)", exact: true }),
  ).toHaveValue("42.5");
  await page.getByRole("button", { name: "Finish", exact: true }).click();
  await page
    .getByRole("button", {
      name: "Save workout without unlogged input",
      exact: true,
    })
    .click();
  await expect(
    page.locator(".personal-notice").filter({
      hasText:
        "Workout finished · 1 set recorded. Export a backup to protect it.",
    }),
  ).toBeInViewport();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  const state = await read(page);
  expect(state.current).toBeNull();
  expect(state.history).toHaveLength(1);
  expect(state.history[0].exercises.flatMap((x: any) => x.sets)).toHaveLength(
    1,
  );
  expect(
    state.history[0].exercises.every(
      (x: any) => !x.pendingWeight && !x.pendingReps,
    ),
  ).toBe(true);
});
