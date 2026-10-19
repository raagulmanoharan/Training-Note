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
  for (const name of ["Back", "Biceps"])
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
  for (const name of ["Back", "Biceps"])
    await page.getByRole("button", { name, exact: true }).click();
  await page
    .getByRole("button", { name: "Pick exercises", exact: true })
    .click();
  await page.getByRole("button", { name: "Hammer curl", exact: true }).click();
  await page.getByRole("button", { name: "Biceps", exact: true }).click();
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

test("biceps and triceps suggestions stay separate and legacy arm backups remain valid", async ({
  page,
}) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const l = await import("/frontend/src/personalLogic.ts"),
      s = await import("/frontend/src/personalStore.ts");
    const settings = { ...s.defaultState().settings, gym: "Test gym" };
    const plans = Array.from(
      { length: l.availableTargets(["back", "biceps"]) - 1 },
      (_, i) => l.generatePlan(["back", "biceps"], i + 2, settings),
    );
    const curl = l.generateCustomPlan(["curl"], settings);
    curl.exercises[0].group = "arms";
    curl.groups = ["arms"];
    const legacy = s.defaultState();
    legacy.current = curl;
    s.validateState(legacy);
    const oldBackup = await s.inspectBackup(await s.exportBackup(legacy));
    const modern = s.defaultState();
    modern.current = l.generateCustomPlan(
      ["curl", "preacher-curl", "hammer-curl"],
      settings,
    );
    s.validateState(modern);
    const newBackup = await s.inspectBackup(await s.exportBackup(modern));
    return {
      groups: plans.flatMap((p) => p.exercises.map((e) => e.group)),
      names: plans.flatMap((p) => p.exercises.map((e) => e.name)),
      swaps: l.suggestSwap(curl.exercises[0], curl).map((e) => e.group),
      triceps: l
        .generatePlan(["triceps"], 1, settings)
        .exercises.map((e) => e.group),
      oldGroup: oldBackup.state.current!.exercises[0].group,
      newGroups: newBackup.state.current!.exercises.map((e) => e.group),
    };
  });
  expect(result.groups.every((g) => g === "back" || g === "biceps")).toBe(true);
  expect(result.names.join(" ")).not.toMatch(/triceps|pushdown/i);
  expect(result.swaps.length).toBeGreaterThan(0);
  expect(result.swaps.every((g) => g === "biceps")).toBe(true);
  expect(result.triceps).toEqual(["triceps"]);
  expect(result.oldGroup).toBe("arms");
  expect(result.newGroups).toEqual(["biceps", "biceps", "biceps"]);
  await page
    .getByRole("button", { name: "Plan a workout", exact: true })
    .click();
  for (const name of ["Back", "Biceps"])
    await page.getByRole("button", { name, exact: true }).click();
  await page
    .getByRole("button", { name: "Build my workout", exact: true })
    .click();
  await expect(page.locator(".nb-lineup")).not.toContainText(
    /triceps|pushdown/i,
  );
});
