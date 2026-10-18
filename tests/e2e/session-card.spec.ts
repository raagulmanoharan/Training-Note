import { test, expect } from "@playwright/test";

test("persistent session card: elapsed clock, compact preference, scrolling and deliberate finish", async ({
  page,
}) => {
  await page.clock.install({ time: new Date("2026-10-18T10:00:00Z") });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.evaluate(async () => {
    const store = await import("/frontend/src/personalStore.ts"),
      logic = await import("/frontend/src/personalLogic.ts");
    const state = store.defaultState();
    state.current = logic.generatePlan(["chest", "back"], 4, state.settings);
    state.current.startedAt = new Date(Date.now() - 125000).toISOString();
    await store.saveState(state, 0);
  });
  await page.reload();
  const card = page.getByRole("region", { name: "Active workout session" });
  const timer = page.getByLabel("Elapsed session time", { exact: true });
  await expect(timer).toHaveText("02:05");
  const before = await page.evaluate(async () =>
    (await import("/frontend/src/personalStore.ts")).readState(),
  );
  await page.clock.runFor(2100);
  await expect(timer).toHaveText("02:07");
  await page
    .getByRole("button", { name: "Hide elapsed time", exact: true })
    .click();
  await expect(timer).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Finish", exact: true }),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Show elapsed time", exact: true }),
  ).toBeVisible();
  const after = await page.evaluate(async () =>
    (await import("/frontend/src/personalStore.ts")).readState(),
  );
  expect(after).toEqual(before);
  await page
    .getByRole("button", { name: "Show elapsed time", exact: true })
    .click();
  await expect(timer).toHaveText("02:07");
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 740 });
    await page.evaluate(() => scrollTo(0, document.body.scrollHeight));
    await expect(card).toBeInViewport();
    const box = await card.boundingBox();
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.y).toBeLessThan(20);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
    await page.getByRole("button", { name: "Finish", exact: true }).click();
    await expect(
      page.getByRole("region", { name: "Finish workout", exact: true }),
    ).toBeInViewport();
    await expect(
      page.getByRole("region", { name: "Finish workout", exact: true }),
    ).toBeFocused();
    await page
      .getByRole("button", { name: "Keep logging", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Finish", exact: true }),
    ).toBeFocused();
  }
});

test("session time shows elapsed hours, clamps invalid/future dates and updates without storage writes", async ({
  page,
}) => {
  await page.goto("/");
  const values = await page.evaluate(async () => {
    const { sessionClock } = await import("/frontend/src/SessionCard.tsx");
    const now = Date.parse("2026-10-18T12:00:00Z");
    return [
      sessionClock("2026-10-18T10:55:28Z", now).text,
      sessionClock("bad", now).text,
      sessionClock("2026-10-19T12:00:00Z", now).text,
    ];
  });
  expect(values).toEqual(["1:04:32", "00:00", "00:00"]);
});
