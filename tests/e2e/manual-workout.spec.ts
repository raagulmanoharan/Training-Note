import { test, expect } from "@playwright/test";
const read = (page: any) =>
  page.evaluate(async () =>
    (await import("/frontend/src/personalStore.ts")).readState(),
  );
test("manual back and biceps selection keeps six chosen variations in order and restores logged actuals", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Plan a workout", exact: true })
    .click();
  for (const name of ["Back", "Arms"])
    await page.getByRole("button", { name, exact: true }).click();
  await page
    .getByRole("button", { name: "Pick exercises", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Build my workout", exact: true }),
  ).toBeDisabled();
  const names = [
    "Barbell deadlift",
    "Lat pulldown",
    "Seated cable row",
    "Dumbbell curl",
    "Preacher curl",
    "Hammer curl",
  ];
  for (const name of names)
    await page.getByRole("button", { name, exact: true }).click();
  await page
    .getByRole("button", { name: "Build my workout", exact: true })
    .click();
  await expect(page.locator(".nb-lineup-row h3")).toHaveText(names);
  expect((await read(page)).current).toBeNull();
  await page
    .getByRole("button", { name: "Start workout", exact: true })
    .click();
  const before = await read(page);
  expect(before.current.exercises.map((e: any) => e.name)).toEqual(names);
  expect(before.current.exercises.every((e: any) => e.sets.length === 0)).toBe(
    true,
  );
  expect(new Set(before.current.exercises.map((e: any) => e.id)).size).toBe(6);
  await page
    .getByRole("textbox", { name: "Weight (kg)", exact: true })
    .fill("60");
  await page.getByRole("textbox", { name: "Reps", exact: true }).fill("5");
  await page
    .getByRole("button", {
      name: "Log set 1 for Barbell deadlift",
      exact: true,
    })
    .click();
  await expect(page.locator(".personal-status")).toHaveText(
    "Saved on this device",
  );
  const saved = await read(page);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Edit set 1", exact: true }),
  ).toBeVisible();
  expect((await read(page)).current).toEqual(saved.current);
});
test("manual picker filters removed groups and rejects duplicate or unavailable exercise IDs", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Plan a workout", exact: true })
    .click();
  for (const name of ["Back", "Arms"])
    await page.getByRole("button", { name, exact: true }).click();
  await page
    .getByRole("button", { name: "Pick exercises", exact: true })
    .click();
  await page.getByRole("button", { name: "Hammer curl", exact: true }).click();
  await page.getByRole("button", { name: "Arms", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Build my workout", exact: true }),
  ).toBeDisabled();
  const errors = await page.evaluate(async () => {
    const l = await import("/frontend/src/personalLogic.ts"),
      s = await import("/frontend/src/personalStore.ts");
    return [[], ["curl", "curl"], ["missing"]].map((ids) => {
      try {
        l.generateCustomPlan(ids, s.defaultState().settings);
        return false;
      } catch {
        return true;
      }
    });
  });
  expect(errors).toEqual([true, true, true]);
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 740 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
  }
});
