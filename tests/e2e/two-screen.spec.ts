import { test, expect } from "@playwright/test";
async function read(page: any) {
  return page.evaluate(async () =>
    (await import("/frontend/src/personalStore.ts")).readState(),
  );
}
async function seed(page: any) {
  await page.goto("/");
  await page.evaluate(async () => {
    const s = await import("/frontend/src/personalStore.ts"),
      l = await import("/frontend/src/personalLogic.ts");
    const state = s.defaultState();
    state.settings.gym = "Synthetic gym";
    const now = new Date();
    const make = (offset: number, completed: boolean, reps = 10) => {
      const w = l.generatePlan(["chest"], 1, state.settings);
      const d = new Date(now);
      d.setDate(d.getDate() + offset);
      d.setHours(10, 0, 0, 0);
      w.startedAt = d.toISOString();
      w.finishedAt = d.toISOString();
      if (completed)
        w.exercises[0].sets = [reps, reps, reps].map((r) => ({
          id: crypto.randomUUID(),
          weight: 40,
          reps: r,
          loggedAt: d.toISOString(),
        }));
      return w;
    };
    state.history = [
      make(-7, true, 8),
      make(-1, true),
      make(-1, true),
      make(-2, false),
      make(-40, true),
    ];
    await s.saveState(state, 0);
  });
  await page.reload();
}
test("two screens: attendance counts distinct recent recorded days; repeat retains context but clears actuals and IDs", async ({
  page,
}) => {
  await seed(page);
  await expect(
    page.getByRole("region", {
      name: "Recorded gym visits in the last four weeks",
    }),
  ).toContainText("2 gym visits");
  await expect(page.locator(".home-day.visited")).toHaveCount(2);
  await expect(
    page.getByRole("button", { name: "Progress", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Backup", exact: true }),
  ).toHaveCount(0);
  const before = await read(page);
  await page
    .getByRole("button", { name: "View progress details", exact: true })
    .click();
  await expect(
    page.getByRole("dialog", { name: "Training history and evidence" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Close panel", exact: true }).click();
  await page
    .getByRole("button", { name: "Repeat this workout", exact: true })
    .click();
  expect((await read(page)).current).toBeNull();
  await page
    .getByRole("button", { name: "Start workout", exact: true })
    .click();
  const after = await read(page),
    latest = before.history.find(
      (w: any) =>
        w.exercises[0].sets.length &&
        new Date(w.startedAt).getDate() ===
          new Date(Date.now() - 86400000).getDate(),
    );
  expect(after.current.id).not.toBe(latest.id);
  expect(after.current.exercises[0].id).not.toBe(latest.exercises[0].id);
  expect(after.current.exercises[0].sets).toEqual([]);
  expect(after.current.exercises[0].pendingWeight).toBe("");
  expect(after.history).toEqual(before.history);
  await expect(page.locator(".nb-exercise-card.is-active")).toContainText(
    "40 kg × 10",
  );
  await expect(
    page.getByRole("button", { name: "Next exercise", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Use last time", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Weight (kg)", exact: true }),
  ).toHaveValue("40");
  await expect(
    page.getByRole("textbox", { name: "Reps", exact: true }),
  ).toHaveValue("10");
  await expect(page.locator(".personal-status")).toHaveText(
    "Saved on this device",
  );
  expect((await read(page)).current.exercises[0].sets).toEqual([]);
  await expect(
    page.getByRole("button", { name: "Edit set 1", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("textbox", { name: "Weight (kg)", exact: true })
    .fill("42.5");
  await page.getByRole("textbox", { name: "Reps", exact: true }).fill("8");
  await expect(page.locator(".personal-status")).toHaveText(
    "Saved on this device",
  );
  await page.getByRole("button", { name: "Back to Home", exact: true }).click();
  await page
    .getByRole("button", { name: "Continue workout", exact: true })
    .click();
  await expect(
    page.getByRole("textbox", { name: "Weight (kg)", exact: true }),
  ).toHaveValue("42.5");
  await page.reload();
  await expect(
    page.getByRole("textbox", { name: "Reps", exact: true }),
  ).toHaveValue("8");
  await page.getByRole("button", { name: /^Log set \d+ for / }).click();
  await page.getByRole("button", { name: "Finish", exact: true }).click();
  await page.getByRole("button", { name: "Save workout", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Repeat this workout", exact: true }),
  ).toBeVisible();
  expect((await read(page)).current).toBeNull();
});
test("two screens: Home and Workout fit 320/390; capture actual synthetic screenshots", async ({
  page,
}) => {
  await seed(page);
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.screenshot({
    path: "tests/artifacts/two-screen-home.png",
    fullPage: true,
  });
  await page
    .getByRole("button", { name: "Repeat this workout", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Start workout", exact: true })
    .click();
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
  await page.screenshot({
    path: "tests/artifacts/two-screen-workout.png",
    fullPage: true,
  });
});
test("two screens: mixed or harder performance never becomes a steady or growth claim on Home", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(async () => {
    const s = await import("/frontend/src/personalStore.ts"),
      l = await import("/frontend/src/personalLogic.ts");
    const state = s.defaultState();
    state.settings.gym = "Synthetic gym";
    state.history = [0, -7].map((offset, index) => {
      const w = l.generatePlan(["chest"], 1, state.settings),
        d = new Date();
      d.setDate(d.getDate() + offset);
      w.startedAt = d.toISOString();
      w.finishedAt = d.toISOString();
      w.exercises[0].sets = [10, 10, 10].map((reps) => ({
        id: crypto.randomUUID(),
        weight: index ? 40 : 42.5,
        reps,
        repsInReserve: index ? 2 : 0,
        loggedAt: d.toISOString(),
      }));
      return w;
    });
    await s.saveState(state, 0);
  });
  await page.reload();
  await expect(page.locator(".home-muscle-row")).toContainText("Mixed results");
  await expect(page.locator(".home-performance")).toContainText(
    "Mixed results · see details",
  );
  await expect(page.locator(".home-muscle-row")).not.toContainText(
    "Holding steady",
  );
  await page
    .getByRole("button", { name: "View progress details", exact: true })
    .click();
  await page.getByText("Lift comparisons", { exact: true }).click();
  await expect(page.getByRole("dialog")).toContainText(
    "Some work felt harder. Effort is subjective; inspect the matched records.",
  );
});
