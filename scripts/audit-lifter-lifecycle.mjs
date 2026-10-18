// Accelerated synthetic snapshots, not a 100-day user study. Isolated browser contexts only.
import { chromium } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const out = "tests/artifacts/lifter-lifecycle";
await mkdir(out, { recursive: true });
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const origin = process.env.COACHLINE_URL || "http://127.0.0.1:5190";
const results = [];
for (const day of [0, 5, 10, 100]) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const date = new Date(Date.UTC(2026, 6, 10 + day, 12));
  await page.clock.setFixedTime(date);
  await page.goto(origin);
  await page.getByRole("heading", { name: "Training", exact: true }).waitFor();
  if (day === 0) {
    await page.screenshot({ path: `${out}/day-0-home.png`, fullPage: true });
    const defaults = await page.evaluate(async () =>
      (await import("/frontend/src/personalStore.ts")).readState(),
    );
    await page
      .getByRole("button", { name: "Plan a workout", exact: true })
      .click();
    for (const name of ["Chest", "Back"])
      await page.getByRole("button", { name, exact: true }).click();
    await page.getByLabel("Exercises", { exact: true }).fill("2");
    await page.getByRole("button", { name: "Build my workout" }).click();
    await page
      .getByRole("button", { name: "Start workout", exact: true })
      .click();
    const names = await page.locator(".nb-exercise-title").allTextContents();
    for (let movement = 0; movement < 2; movement++) {
      await page.locator(".nb-exercise-heading").nth(movement).click();
      for (let set = 0; set < 3; set++) {
        await page
          .getByRole("textbox", { name: "Weight (kg)", exact: true })
          .fill(movement ? "45" : "60");
        await page
          .getByRole("textbox", { name: "Reps", exact: true })
          .fill("10");
        await page.getByRole("button", { name: /^Log set \d+ for / }).click();
        await page
          .getByRole("button", { name: `Edit set ${set + 1}`, exact: true })
          .waitFor();
      }
    }
    await page.screenshot({ path: `${out}/day-0-workout.png`, fullPage: true });
    await page.getByRole("button", { name: "Finish", exact: true }).click();
    await page
      .getByRole("button", { name: "Save workout", exact: true })
      .click();
    await page
      .getByRole("heading", { name: "Training", exact: true })
      .waitFor();
    const saved = await page.evaluate(async () =>
      (await import("/frontend/src/personalStore.ts")).readState(),
    );
    results.push({
      day,
      calendarDate: date.toISOString(),
      kind: "actual first-session UI walkthrough",
      defaults: defaults.settings,
      exercises: names,
      recordedSets: saved.history[0].exercises.flatMap((x) => x.sets).length,
      historyCount: saved.history.length,
      homeText: await page.locator(".training-home").innerText(),
      errors,
    });
  } else {
    const seeded = await page.evaluate(
      async ({ day, base }) => {
        const s = await import("/frontend/src/personalStore.ts"),
          l = await import("/frontend/src/personalLogic.ts"),
          c = await import("/frontend/src/personalCatalog.ts"),
          ins = await import("/frontend/src/personalInsights.ts");
        const state = s.defaultState();
        state.settings = {
          gym: "Neighborhood gym",
          unit: "kg",
          progressionEnabled: true,
        };
        const offsets =
          day === 5
            ? [0, 2, 4]
            : day === 10
              ? [0, 2, 4, 6, 8, 9]
              : Array.from({ length: 55 }, (_, i) =>
                  Math.floor((i * 100) / 55),
                );
        const records = offsets.map((offset, i) => {
          const upper = i % 2 === 0;
          const w = l.generatePlan(
            upper ? ["chest", "back", "shoulders"] : ["legs", "arms", "core"],
            6,
            state.settings,
          );
          const d = new Date(base);
          d.setUTCDate(d.getUTCDate() + offset);
          w.startedAt = d.toISOString();
          w.finishedAt = new Date(d.getTime() + 3600000).toISOString();
          w.exercises.forEach((e, n) => {
            const load =
              (e.catalogId === "bench" ? 60 : 20 + n * 5) +
              Math.floor(i / 10) * 2.5;
            const reps = day === 5 ? Math.min(12, 10 + Math.floor(i / 2)) : 10;
            if (day === 10 && i === 4 && e.catalogId === "bench") {
              e.repMin = 6;
              e.repMax = 8;
            }
            e.sets = Array.from({ length: 3 }, () => ({
              id: crypto.randomUUID(),
              weight: day === 100 && i === 54 ? load - 7.5 : load,
              reps: day === 10 && i === 4 && e.catalogId === "bench" ? 8 : reps,
              loggedAt: w.finishedAt,
              repsInReserve:
                day === 10 && i === 4 && e.catalogId === "bench" ? 0 : 2,
            }));
          });
          return w;
        });
        state.history = records.slice().reverse();
        await s.saveState(state, 0);
        const lastBench = state.history
          .flatMap((w) => w.exercises)
          .find((e) => e.catalogId === "bench");
        const candidate = {
          ...lastBench,
          id: crypto.randomUUID(),
          sets: [],
          pendingWeight: "",
          pendingReps: "",
        };
        const hint = l.progression(candidate, state.history, true);
        const backup = await s.exportBackup(await s.readState());
        const missing = structuredClone(state.history);
        missing.forEach((w) => w.exercises.forEach((e) => (e.gym = "")));
        return {
          sessionCount: records.length,
          setCount: records.flatMap((w) => w.exercises.flatMap((e) => e.sets))
            .length,
          backupBytes: new TextEncoder().encode(backup).length,
          latestGroups: state.history[0].groups,
          expectedNextGroups:
            records.length % 2 === 0
              ? ["chest", "back", "shoulders"]
              : ["legs", "arms", "core"],
          benchHint: hint,
          benchLatest: first(lastBench),
          benchBaseline: first(
            records[0].exercises.find((e) => e.catalogId === "bench"),
          ),
          missingGymComparable: ins
            .groupInsights(missing)
            .reduce((n, g) => n + g.comparable, 0),
          catalogSize: c.exercises.length,
          hasBarbellBackSquat: c.exercises.some(
            (e) =>
              e.id === "squat" || /barbell.*squat|back squat/i.test(e.name),
          ),
          hasConventionalDeadlift: c.exercises.some((e) =>
            /^deadlift$|conventional deadlift/i.test(e.name),
          ),
        };
        function first(e) {
          return e
            ? {
                name: e.name,
                weight: e.sets[0]?.weight,
                reps: e.sets[0]?.reps,
                rir: e.sets[0]?.repsInReserve,
                plannedSets: e.plannedSets,
                repMin: e.repMin,
                repMax: e.repMax,
              }
            : null;
        }
      },
      { day, base: new Date(Date.UTC(2026, 6, 10, 10)).toISOString() },
    );
    const began = await page.evaluate(() => performance.now());
    await page.reload();
    await page
      .getByRole("heading", { name: "Training", exact: true })
      .waitFor();
    const homeReadyElapsed =
      (await page.evaluate(() => performance.now())) - began;
    const homeText = await page.locator(".training-home").innerText();
    await page.screenshot({
      path: `${out}/day-${day}-home.png`,
      fullPage: true,
    });
    const start = await page.evaluate(() => performance.now());
    await page
      .getByRole("button", { name: "View progress details", exact: true })
      .click();
    await page.locator(".personal-progress-card").last().waitFor();
    const history = await page
      .getByRole("dialog")
      .evaluate((el) => ({
        cards: el.querySelectorAll(".personal-progress-card").length,
        scrollHeight: el.scrollHeight,
        viewportHeight: el.clientHeight,
        domElements: el.querySelectorAll("*").length,
        searchFields: el.querySelectorAll("input[type=search]").length,
      }));
    const historyReadyElapsed =
      (await page.evaluate(() => performance.now())) - start;
    await page
      .getByRole("button", { name: "Close panel", exact: true })
      .click();
    if (day === 10) {
      // The intended upper rotation is not the last session: rebuild it through the actual UI.
      await page
        .getByRole("button", { name: "Train something else", exact: true })
        .click();
      for (const name of ["Chest", "Back", "Shoulders"])
        await page.getByRole("button", { name, exact: true }).click();
      await page.getByLabel("Exercises", { exact: true }).fill("6");
      await page.getByRole("button", { name: "Build my workout" }).click();
      await page
        .getByRole("button", { name: "Customize Bench press", exact: true })
        .click();
      await page.getByLabel("Min reps", { exact: true }).fill("6");
      await page.getByLabel("Max reps", { exact: true }).fill("8");
    } else
      await page
        .getByRole("button", { name: "Repeat this workout", exact: true })
        .click();
    await page
      .getByRole("button", { name: "Start workout", exact: true })
      .click();
    await page.locator(".nb-exercise-card.is-active").waitFor();
    await page.screenshot({
      path: `${out}/day-${day}-workout.png`,
      fullPage: true,
    });
    const active = await page
      .locator(".nb-exercise-card.is-active")
      .innerText();
    const previousButton = page.getByRole("button", {
      name: "Use last time",
      exact: true,
    });
    if (await previousButton.count()) await previousButton.click();
    else {
      await page
        .getByRole("textbox", { name: "Weight (kg)", exact: true })
        .fill("40");
      await page.getByRole("textbox", { name: "Reps", exact: true }).fill("10");
    }
    await page.getByRole("button", { name: /^Log set \d+ for / }).click();
    await page
      .getByRole("button", { name: "Edit set 1", exact: true })
      .waitFor();
    const performed = await page.evaluate(async () =>
      (await import("/frontend/src/personalStore.ts")).readState(),
    );
    const performedId = performed.current.exercises.find(
      (e) => e.id === performed.current.activeExerciseId,
    ).sets[0].id;
    await page
      .getByRole("button", { name: "Back to Home", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Continue workout", exact: true })
      .click();
    await page.reload();
    await page
      .getByRole("button", { name: "Edit set 1", exact: true })
      .waitFor();
    const resumed = await page.evaluate(async () =>
      (await import("/frontend/src/personalStore.ts")).readState(),
    );
    const resumePreservedActual = resumed.current.exercises
      .flatMap((e) => e.sets)
      .some((s) => s.id === performedId);
    if (!resumePreservedActual)
      throw new Error("Actual set missing after reload");
    await page.screenshot({
      path: `${out}/day-${day}-workout.png`,
      fullPage: true,
    });
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    );
    const roundtrip = await page.evaluate(async () => {
      const s = await import("/frontend/src/personalStore.ts");
      const state = await s.readState();
      const text = await s.exportBackup(state);
      const parsed = await s.inspectBackup(text);
      return {
        historyCount: parsed.state.history.length,
        currentActuals: parsed.state.current.exercises.flatMap((e) => e.sets)
          .length,
      };
    });
    results.push({
      day,
      calendarDate: date.toISOString(),
      kind: "accelerated seeded snapshot with gym and hints explicitly configured",
      ...seeded,
      homeText,
      active,
      resumePreservedActual,
      history,
      homeReadyElapsedMs: Math.round(homeReadyElapsed),
      historyReadyElapsedMs: Math.round(historyReadyElapsed),
      timingLimit:
        "Single desktop Chromium run including automation; not a mobile performance benchmark.",
      overflow,
      backupVerification: roundtrip,
      errors,
    });
  }
  await context.close();
}
await browser.close();
await writeFile(`${out}/observations.json`, JSON.stringify(results, null, 2));
console.log(
  JSON.stringify(
    results.map(
      ({
        day,
        historyCount,
        sessionCount,
        setCount,
        history,
        benchHint,
        overflow,
        errors,
      }) => ({
        day,
        sessions: sessionCount || historyCount,
        setCount,
        history,
        benchHint: benchHint?.kind,
        overflow,
        errors,
      }),
    ),
    null,
    2,
  ),
);
