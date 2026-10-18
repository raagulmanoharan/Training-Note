import { test, expect } from "@playwright/test";

const origin = process.env.COACHLINE_URL || "http://localhost:5173";
async function storeCheck(page: any, scenario: string) {
  return page.evaluate(async (scenario: string) => {
    const store = await import("/frontend/src/personalStore.ts");
    const logic = await import("/frontend/src/personalLogic.ts");
    const state = store.defaultState();
    const workout = logic.generatePlan(["chest", "back"], 4, state.settings);
    workout.exercises[0].sets.push({
      id: crypto.randomUUID(),
      weight: 40,
      reps: 10,
      loggedAt: new Date().toISOString(),
    });
    state.current = workout;
    const first = await store.saveState(state, 0);
    if (scenario === "conflict") {
      const second = await store.saveState(
        { ...first, settings: { ...first.settings, gym: "Newest tab" } },
        first.revision,
      );
      let message = "";
      try {
        await store.saveState(
          { ...first, settings: { ...first.settings, gym: "Stale tab" } },
          first.revision,
        );
      } catch (e) {
        message = (e as Error).message;
      }
      return {
        message,
        actual: (await store.readState()).settings.gym,
        revision: second.revision,
      };
    }
    const backup = await store.exportBackup(first);
    if (scenario === "corrupt") {
      const altered = JSON.parse(backup);
      altered.state.current.exercises[0].sets[0].weight = 100;
      let message = "";
      try {
        await store.importBackup(JSON.stringify(altered), first);
      } catch (e) {
        message = (e as Error).message;
      }
      return {
        message,
        weight: (await store.readState()).current!.exercises[0].sets[0].weight,
      };
    }
    return { backup, state: first };
  }, scenario);
}

test("personal store: durable IndexedDB survives a closed page and reopened tab", async ({
  page,
  context,
}) => {
  await page.goto("/");
  const result = await storeCheck(page, "roundtrip");
  await page.close();
  const reopened = await context.newPage();
  await reopened.goto("/");
  const actual = await reopened.evaluate(async () => {
    const { readState } = await import("/frontend/src/personalStore.ts");
    return readState();
  });
  expect(actual).toEqual(result.state);
});

test("personal store: stale tab cannot overwrite newer saved work", async ({
  page,
}) => {
  await page.goto("/");
  const result = await storeCheck(page, "conflict");
  expect(result.message).toContain("Another tab");
  expect(result.actual).toBe("Newest tab");
});

test("personal store: damaged backup is rejected without changing local actuals", async ({
  page,
}) => {
  await page.goto("/");
  const result = await storeCheck(page, "corrupt");
  expect(result.message).toContain("verification failed");
  expect(result.weight).toBe(40);
});

test("personal logic: coverage, replacement identity and conservative double progression", async ({
  page,
}) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const store = await import("/frontend/src/personalStore.ts");
    const logic = await import("/frontend/src/personalLogic.ts");
    const settings = {
      ...store.defaultState().settings,
      gym: "Home gym",
      progressionEnabled: true,
    };
    const plan = logic.generatePlan(["chest", "back"], 4, settings);
    const shoulders = logic.generatePlan(["shoulders"], 3, settings);
    let rejected = false;
    try {
      logic.generatePlan(["shoulders"], 99, settings);
    } catch {
      rejected = true;
    }
    const exercise = plan.exercises[0];
    const previous = structuredClone(exercise);
    previous.sets = [12, 12, 12].map((reps) => ({
      id: crypto.randomUUID(),
      weight: 40,
      reps,
      loggedAt: new Date().toISOString(),
    }));
    const history = [
      {
        ...plan,
        exercises: [previous],
        activeExerciseId: previous.id,
        finishedAt: new Date().toISOString(),
      },
    ];
    const eligible = logic.progression(exercise, history, true);
    previous.sets[2].reps = 10;
    const held = logic.progression(exercise, history, true);
    previous.sets.pop();
    const incomplete = logic.progression(exercise, history, true);
    const wrongUnit = logic.progression(
      { ...exercise, unit: "lb" },
      history,
      true,
    );
    const wrongMachine = logic.progression(
      { ...exercise, equipment: "Different machine" },
      history,
      true,
    );
    const swaps = logic.suggestSwap(exercise, plan);
    return {
      targets: plan.exercises.map((e) => e.group + ":" + e.target),
      shoulders: shoulders.exercises.map((e) => e.target),
      rejected,
      eligible: eligible.suggestedWeight,
      held: held.kind,
      incomplete: incomplete.kind,
      wrongUnit: wrongUnit.previous,
      wrongMachine: wrongMachine.previous,
      swapsValid:
        swaps.length > 0 &&
        swaps.every(
          (e) => e.target === exercise.target && e.id !== exercise.catalogId,
        ),
    };
  });
  expect(new Set(result.targets).size).toBe(4);
  expect(new Set(result.shoulders).size).toBe(3);
  expect(result.rejected).toBe(true);
  expect(result.eligible).toBe(42.5);
  expect(result.held).toBe("hold");
  expect(result.incomplete).toBe("review");
  expect(result.wrongUnit).toBeNull();
  expect(result.wrongMachine).toBeNull();
  expect(result.swapsValid).toBe(true);
});

test("personal store: verified backup restores history, draft, settings after synthetic device loss", async ({
  page,
}) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const s = await import("/frontend/src/personalStore.ts");
    const l = await import("/frontend/src/personalLogic.ts");
    const state = s.defaultState();
    state.settings = { unit: "lb", gym: "Test gym", progressionEnabled: true };
    const finished = l.generatePlan(["chest"], 1, state.settings);
    finished.finishedAt = new Date().toISOString();
    finished.exercises[0].sets = [
      {
        id: crypto.randomUUID(),
        weight: 90,
        reps: 9,
        loggedAt: new Date().toISOString(),
      },
    ];
    state.history = [finished];
    state.current = l.generatePlan(["back"], 1, state.settings);
    state.current.exercises[0].pendingWeight = "45";
    state.current.exercises[0].pendingReps = "8";
    const saved = await s.saveState(state, 0);
    const text = await s.exportBackup(saved);
    await new Promise<void>((resolve, reject) => {
      const r = indexedDB.deleteDatabase("personal-gym-notebook");
      r.onsuccess = () => resolve();
      r.onerror = () => reject(r.error);
    });
    const restored = await s.importBackup(text, await s.readState());
    return { expected: saved, actual: restored };
  });
  expect(result.actual.history).toEqual(result.expected.history);
  expect(result.actual.current).toEqual(result.expected.current);
  expect(result.actual.settings).toEqual(result.expected.settings);
});

async function startPersonal(page: any, groups = ["Chest", "Back"], count = 4) {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Build a different workout", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "What are you training?" }),
  ).toBeVisible();
  for (const group of groups)
    await page.getByRole("button", { name: group, exact: true }).click();
  await page.getByLabel("Exercises", { exact: true }).fill(String(count));
  await page.getByRole("button", { name: "Build my workout" }).click();
  await expect(
    page.getByRole("heading", { name: "Today’s workout" }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Start workout", exact: true })
    .click();
  await expect(
    page.locator(".nb-exercise-card.is-active .nb-exercise-title"),
  ).toBeVisible();
}
async function logActual(page: any, weight = "40", reps = "10") {
  await page
    .getByRole("textbox", { name: "Weight (kg)", exact: true })
    .fill(weight);
  await page.getByRole("textbox", { name: "Reps", exact: true }).fill(reps);
  await page.getByRole("button", { name: /^Log set \d+ for / }).click();
  await expect(page.locator(".personal-status")).toHaveText(
    "Saved on this device",
  );
  const next = page.getByRole("textbox", { name: "Reps", exact: true });
  if (await next.count()) await expect(next).toHaveValue("");
}

test("personal UI: one-hand logger explicit actuals, corrections, undo, replacement and history", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await startPersonal(page);
  await expect(
    page.getByRole("textbox", { name: "Weight (kg)", exact: true }),
  ).toHaveValue("");
  const logBox = await page
    .getByRole("button", { name: /^Log set \d+ for / })
    .boundingBox();
  expect(logBox!.y + logBox!.height).toBeLessThan(650);
  await page.screenshot({
    path: "tests/artifacts/redesign-first-set-390.png",
    fullPage: true,
  });
  await logActual(page);
  await page
    .getByRole("button", { name: "Repeat 40 kg × 10", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Edit set 2", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Edit set 1", exact: true }).click();
  await page.getByLabel("Edit weight", { exact: true }).fill("42.5");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await page.getByRole("button", { name: "Edit set 2", exact: true }).click();
  await page.getByRole("button", { name: "Delete set", exact: true }).click();
  await page
    .getByRole("button", { name: "Undo deleted set", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Edit set 2", exact: true }),
  ).toBeVisible();
  const before = await page
    .locator(".nb-exercise-card.is-active .nb-exercise-title")
    .innerText();
  await page
    .getByRole("button", { name: `Swap ${before}`, exact: true })
    .click();
  await page.locator(".personal-inline .personal-secondary").first().click();
  await expect(
    page
      .locator(".personal-notice")
      .filter({ hasText: "Previous sets kept under their original exercise." }),
  ).toBeVisible();
  await expect(
    page.locator(".nb-exercise-card.is-active .nb-last-time"),
  ).toHaveCount(0);
  await expect(page.locator(".nb-exercise-card.is-active")).toContainText(
    "1 sets",
  );
  await expect(
    page.getByRole("button", { name: "Edit set 1", exact: true }),
  ).toHaveCount(0);
  await logActual(page, "20", "8");
  await page.screenshot({
    path: "tests/artifacts/redesign-notebook-390.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Finish", exact: true }).click();
  await page.getByRole("button", { name: "Save workout", exact: true }).click();
  await page
    .getByRole("button", { name: "View progress details", exact: true })
    .click();
  await expect(
    page.getByText("42.5 kg × 10 · 40 kg × 10", { exact: true }),
  ).toBeVisible();
  await expect(
    page
      .locator(".personal-progress-card p")
      .filter({ hasText: /^20 kg × 8$/ }),
  ).toBeVisible();
  await page.reload();
  await page
    .getByRole("button", { name: "View progress details", exact: true })
    .click();
  await expect(
    page.getByText("42.5 kg × 10 · 40 kg × 10", { exact: true }),
  ).toBeVisible();
  const savedIds = await notebookIds(page);
  await page.getByText("Correct a set", { exact: true }).first().click();
  await page
    .getByRole("button", { name: `Correct ${before} set 1`, exact: true })
    .click();
  await page.getByLabel("Correct history weight", { exact: true }).fill("45");
  await page
    .getByRole("button", { name: "Save correction", exact: true })
    .click();
  await expect(
    page
      .locator(".personal-progress-card p")
      .filter({ hasText: "45 kg × 10 · 40 kg × 10" }),
  ).toBeVisible();
  expect(await notebookIds(page)).toEqual(savedIds);
});

test("personal UI: draft inputs survive reload and 320 px has no page overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await startPersonal(page, ["Shoulders"], 3);
  await page
    .getByRole("textbox", { name: "Weight (kg)", exact: true })
    .fill("12.5");
  await page.getByRole("textbox", { name: "Reps", exact: true }).fill("8");
  await expect(page.locator(".personal-status")).toHaveText(
    "Saved on this device",
  );
  await page.reload();
  await expect(
    page.getByRole("textbox", { name: "Weight (kg)", exact: true }),
  ).toHaveValue("12.5");
  await expect(
    page.getByRole("textbox", { name: "Reps", exact: true }),
  ).toHaveValue("8");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "Finish", exact: true }).click();
  await expect(
    page.getByText("You have unlogged input.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Keep logging", exact: true }).click();
  await expect(
    page.getByRole("textbox", { name: "Weight (kg)", exact: true }),
  ).toHaveValue("12.5");
  await page.screenshot({
    path: "tests/artifacts/redesign-notebook-320.png",
    fullPage: true,
  });
});

test("personal UI: offline production shell restores draft without API requests", async ({
  page,
  context,
}) => {
  test.skip(
    !process.env.PERSONAL_OFFLINE,
    "Run against built preview with PERSONAL_OFFLINE=1",
  );
  const manifest = await (
    await page.request.get("/manifest.webmanifest")
  ).json();
  expect(manifest.display).toBe("standalone");
  for (const icon of manifest.icons)
    expect((await page.request.get(icon.src)).ok()).toBe(true);
  const api: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/api/")) api.push(r.url());
  });
  await startPersonal(page, ["Chest"], 1);
  await logActual(page);
  await page
    .getByRole("textbox", { name: "Weight (kg)", exact: true })
    .fill("42.5");
  await expect(page.locator(".personal-status")).toHaveText(
    "Saved on this device",
  );
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole("textbox", { name: "Weight (kg)", exact: true }),
  ).toHaveValue("42.5");
  await expect(
    page.getByRole("button", { name: "Edit set 1", exact: true }),
  ).toBeVisible();
  await page.getByRole("textbox", { name: "Reps", exact: true }).fill("8");
  await page.getByRole("button", { name: /^Log set \d+ for / }).click();
  await expect(
    page.getByRole("button", { name: "Edit set 2", exact: true }),
  ).toBeVisible();
  expect(api).toEqual([]);
});

test("personal UI: storage failure never claims a logged set is saved and retry keeps exactly one", async ({
  page,
}) => {
  await startPersonal(page, ["Chest"], 1);
  await page
    .getByRole("textbox", { name: "Weight (kg)", exact: true })
    .fill("40");
  await page.getByRole("textbox", { name: "Reps", exact: true }).fill("10");
  await expect(page.locator(".personal-status")).toHaveText(
    "Saved on this device",
  );
  await page.evaluate(() => {
    const original = IDBDatabase.prototype.transaction;
    (window as any).restoreTransactions = () => {
      IDBDatabase.prototype.transaction = original;
    };
    IDBDatabase.prototype.transaction = function (...args: any[]) {
      if (args[1] === "readwrite")
        throw new DOMException("Synthetic quota failure", "QuotaExceededError");
      return original.apply(this, args as any);
    };
  });
  await page.getByRole("button", { name: /^Log set \d+ for / }).click();
  await expect(page.locator(".personal-status")).toHaveText("Not saved");
  await expect(
    page.getByRole("button", { name: "Edit set 1", exact: true }),
  ).toHaveCount(0);
  await page.evaluate(() => (window as any).restoreTransactions());
  await page.getByRole("button", { name: "Retry save", exact: true }).click();
  await expect(page.locator(".personal-status")).toHaveText(
    "Saved on this device",
  );
  await expect(
    page.getByRole("button", { name: "Edit set 1", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Edit set 2", exact: true }),
  ).toHaveCount(0);
});

test("personal UI: backup preview verifies file and corrupt selection preserves existing draft", async ({
  page,
}) => {
  await startPersonal(page, ["Chest"], 1);
  await logActual(page);
  await page
    .getByRole("button", { name: "Settings and backup", exact: true })
    .click();
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export backup", exact: true })
    .click();
  const download = await downloadPromise;
  const path = await download.path();
  expect(path).toBeTruthy();
  await page
    .getByLabel("Choose backup file", { exact: true })
    .setInputFiles(path!);
  await expect(
    page.getByText("Merge into your notebook?", { exact: false }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Cancel import", exact: true })
    .click();
  await page.getByLabel("Choose backup file", { exact: true }).setInputFiles({
    name: "damaged.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"version":999}'),
  });
  await expect(
    page
      .getByRole("dialog", { name: "Settings and backup", exact: true })
      .getByRole("alert"),
  ).toContainText("invalid");
  await page.getByRole("button", { name: "Close panel", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Edit set 1", exact: true }),
  ).toBeVisible();
});

test("personal logic: assisted load and changed target never produce misleading overload", async ({
  page,
}) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const s = await import("/frontend/src/personalStore.ts");
    const l = await import("/frontend/src/personalLogic.ts");
    const c = await import("/frontend/src/personalCatalog.ts");
    const settings = {
      ...s.defaultState().settings,
      gym: "Same gym",
      progressionEnabled: true,
    };
    const item = c.exercises.find((e) => e.id === "assisted-pullup")!;
    const exercise = l.makeExercise(item, settings);
    const previous = structuredClone(exercise);
    previous.sets = [12, 12, 12].map((reps) => ({
      id: crypto.randomUUID(),
      weight: 40,
      reps,
      loggedAt: new Date().toISOString(),
    }));
    const w = l.generatePlan(["back"], 1, settings);
    w.exercises = [previous];
    w.activeExerciseId = previous.id;
    w.finishedAt = new Date().toISOString();
    const assisted = l.progression(exercise, [w], true);
    const plain = l.generatePlan(["chest"], 1, settings);
    const old = structuredClone(plain.exercises[0]);
    old.sets = previous.sets;
    const history = [
      {
        ...plain,
        exercises: [old],
        activeExerciseId: old.id,
        finishedAt: new Date().toISOString(),
      },
    ];
    const changed = l.progression(
      { ...plain.exercises[0], repMin: 6 },
      history,
      true,
    );
    const malformed = [undefined, 0, false, []].map((current) => {
      try {
        s.validateState({ ...s.defaultState(), current });
        return false;
      } catch {
        return true;
      }
    });
    return {
      assisted: assisted.kind,
      suggested: assisted.suggestedWeight,
      changed: changed.kind,
      malformed,
    };
  });
  expect(result.assisted).toBe("review");
  expect(result.suggested).toBeUndefined();
  expect(result.changed).toBe("review");
  expect(result.malformed.every(Boolean)).toBe(true);
});

test("personal UI: earlier typing acknowledgement cannot reveal a later failed set receipt", async ({
  page,
}) => {
  await startPersonal(page, ["Chest"], 1);
  await page
    .getByRole("textbox", { name: "Weight (kg)", exact: true })
    .fill("40");
  await page.getByRole("textbox", { name: "Reps", exact: true }).fill("10");
  await expect(page.locator(".personal-status")).toHaveText(
    "Saved on this device",
  );
  await page.evaluate(() => {
    const original = IDBDatabase.prototype.transaction;
    let writes = 0;
    (window as any).restoreTransactions = () => {
      IDBDatabase.prototype.transaction = original;
    };
    IDBDatabase.prototype.transaction = function (...args: any[]) {
      if (args[1] === "readwrite" && ++writes === 2)
        throw new DOMException(
          "Synthetic next write failure",
          "QuotaExceededError",
        );
      const tx = original.apply(this, args as any);
      if (args[1] === "readwrite" && writes === 1)
        Object.defineProperty(tx, "oncomplete", {
          set(handler: any) {
            tx.addEventListener("complete", () =>
              setTimeout(() => handler.call(tx), 400),
            );
          },
        });
      return tx;
    };
  });
  await page
    .getByRole("textbox", { name: "Weight (kg)", exact: true })
    .fill("42.5");
  await page.getByRole("button", { name: /^Log set \d+ for / }).click();
  await expect(page.locator(".personal-status")).toHaveText("Not saved");
  await expect(
    page.getByRole("button", { name: "Edit set 1", exact: true }),
  ).toHaveCount(0);
  await page.evaluate(() => (window as any).restoreTransactions());
  await page.getByRole("button", { name: "Retry save", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Edit set 1", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".personal-status")).toHaveText(
    "Saved on this device",
  );
  await expect(
    page.getByRole("button", { name: "Edit set 2", exact: true }),
  ).toHaveCount(0);
});

async function notebookIds(page: any) {
  return page.evaluate(
    async () =>
      new Promise((resolve, reject) => {
        const open = indexedDB.open("personal-gym-notebook", 1);
        open.onerror = () => reject(open.error);
        open.onsuccess = () => {
          const db = open.result;
          const r = db
            .transaction("state", "readonly")
            .objectStore("state")
            .get("main");
          r.onsuccess = () => {
            const w = r.result.history[0];
            resolve({
              workout: w.id,
              exercise: w.exercises[0].id,
              sets: w.exercises[0].sets.map((x: any) => x.id),
            });
            db.close();
          };
        };
      }),
  );
}

test("personal UI: all-set history shows two more reps without automatically adding load", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Settings and backup", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Gym label", exact: true })
    .fill("Same gym");
  await expect(page.locator(".personal-status")).toHaveText(
    "Saved on this device",
  );
  await startPersonal(page, ["Chest"], 1);
  await logActual(page, "40", "10");
  await logActual(page, "40", "10");
  await logActual(page, "40", "8");
  await page.getByRole("button", { name: "Finish", exact: true }).click();
  await page.getByRole("button", { name: "Save workout", exact: true }).click();
  await startPersonal(page, ["Chest"], 1);
  await expect(page.locator(".nb-exercise-card.is-active")).toContainText(
    "40 kg × 10 · 40 kg × 10 · 40 kg × 8",
  );
  await logActual(page, "40", "10");
  await logActual(page, "40", "10");
  await logActual(page, "40", "10");
  await expect(
    page.getByText(
      "Across 3 recorded sets: +2 reps at the same loads as last time.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Add set", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Edit set 4", exact: true }),
  ).toHaveCount(0);
});

test("redesign: compact lineup can be revised before explicit session start", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Build a different workout", exact: true })
    .click();
  await page.getByRole("button", { name: "Chest", exact: true }).click();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page.getByLabel("Exercises", { exact: true }).fill("4");
  await page.getByRole("button", { name: "Build my workout" }).click();
  await expect(
    page.getByRole("heading", { name: "Today’s workout" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "What are you training?" }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Change muscles", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "What are you training?" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Chest", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Build my workout" }).click();
  await page
    .getByRole("button", { name: "Start workout", exact: true })
    .click();
  await expect(page.locator(".nb-exercise-card")).toHaveCount(4);
  await expect(
    page.getByRole("button", { name: "Edit set 1", exact: true }),
  ).toHaveCount(0);
});

test("redesign: next-set row stays aligned, thumb-sized and draft survives exercise switching", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await startPersonal(page, ["Shoulders"], 3);
  const weight = page.getByRole("textbox", {
    name: "Weight (kg)",
    exact: true,
  });
  const reps = page.getByRole("textbox", { name: "Reps", exact: true });
  const check = page.getByRole("button", { name: /^Log set \d+ for / });
  await expect(weight).toHaveAttribute("inputmode", "decimal");
  await expect(reps).toHaveAttribute("inputmode", "numeric");
  for (const control of [weight, reps, check]) {
    const box = await control.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.width).toBeGreaterThanOrEqual(44);
  }
  const w = await weight.boundingBox(),
    r = await reps.boundingBox(),
    c = await check.boundingBox();
  expect(Math.abs(w!.y - r!.y)).toBeLessThan(5);
  expect(Math.abs(w!.y - c!.y)).toBeLessThan(5);
  await weight.fill("12.5");
  await reps.fill("8");
  await expect(page.locator(".personal-status")).toHaveText(
    "Saved on this device",
  );
  const firstName = await page
    .locator(".nb-exercise-card.is-active .nb-exercise-title")
    .innerText();
  await page
    .locator(".nb-exercise-card:not(.is-active)")
    .first()
    .getByRole("button")
    .first()
    .click();
  await expect(weight).toHaveValue("");
  await page
    .locator(".nb-exercise-card")
    .filter({
      has: page.getByRole("heading", { name: firstName, exact: true }),
    })
    .getByRole("button")
    .first()
    .click();
  await expect(weight).toHaveValue("12.5");
  await expect(reps).toHaveValue("8");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await check.click();
  await expect(
    page.getByRole("button", { name: "Edit set 1", exact: true }),
  ).toBeVisible();
  await logActual(page, "12.5", "8");
  await logActual(page, "12.5", "8");
  await page.getByRole("button", { name: "Add set", exact: true }).click();
  await expect(weight).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Edit set 4", exact: true }),
  ).toHaveCount(0);
});

test("redesign: swapping an unperformed exercise requires explicit draft discard", async ({
  page,
}) => {
  await startPersonal(page, ["Chest"], 1);
  const weight = page.getByRole("textbox", {
    name: "Weight (kg)",
    exact: true,
  });
  const reps = page.getByRole("textbox", { name: "Reps", exact: true });
  await weight.fill("40");
  await reps.fill("10");
  await expect(page.locator(".personal-status")).toHaveText(
    "Saved on this device",
  );
  const title = await page
    .locator(".nb-exercise-card.is-active .nb-exercise-title")
    .innerText();
  await page
    .getByRole("button", { name: `Swap ${title}`, exact: true })
    .click();
  await page.locator(".personal-inline .personal-secondary").first().click();
  await expect(
    page.getByRole("heading", { name: "Discard unlogged entry and swap?" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Keep entry", exact: true }).click();
  await expect(weight).toHaveValue("40");
  await expect(reps).toHaveValue("10");
  await expect(
    page.locator(".nb-exercise-card.is-active .nb-exercise-title"),
  ).toHaveText(title);
  await page
    .getByRole("button", { name: `Swap ${title}`, exact: true })
    .click();
  await page.locator(".personal-inline .personal-secondary").first().click();
  await page
    .getByRole("button", { name: "Discard entry and swap", exact: true })
    .click();
  await expect(
    page.locator(".nb-exercise-card.is-active .nb-exercise-title"),
  ).not.toHaveText(title);
  await expect(weight).toHaveValue("");
  await expect(reps).toHaveValue("");
  await expect(page.locator(".nb-set-row.is-saved")).toHaveCount(0);
});

test("redesign: invalid input explains blocked completion and Repeat cannot discard draft", async ({
  page,
}) => {
  await startPersonal(page, ["Chest", "Back"], 2);
  await logActual(page, "40", "10");
  const weight = page.getByRole("textbox", {
    name: "Weight (kg)",
    exact: true,
  });
  const reps = page.getByRole("textbox", { name: "Reps", exact: true });
  await weight.fill("2001");
  await reps.fill("10");
  await expect(
    page.getByText(
      "Use a weight from 0 to 2000. Use a decimal point if needed.",
      { exact: true },
    ),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /^Log set \d+ for / }),
  ).toBeDisabled();
  await expect(
    page.getByRole("button", { name: "Repeat 40 kg × 10", exact: true }),
  ).toBeDisabled();
  await weight.fill("42.5");
  await reps.fill("8.5");
  await expect(
    page.getByText("Use whole reps from 1 to 1000.", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: /^Log set \d+ for / }),
  ).toBeDisabled();
  await reps.fill("8");
  await expect(
    page.getByRole("button", { name: /^Log set \d+ for / }),
  ).toBeEnabled();
  await page
    .locator(".nb-exercise-card:not(.is-active)")
    .first()
    .getByRole("button")
    .first()
    .click();
  await page.getByRole("button", { name: "Finish", exact: true }).click();
  await expect(
    page.getByText("You have unlogged input.", { exact: false }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Keep logging", exact: true }).click();
  await expect(page.locator(".nb-set-row.is-saved")).toHaveCount(0);
  await page
    .locator(".nb-exercise-card:not(.is-active)")
    .first()
    .getByRole("button")
    .first()
    .click();
  await expect(weight).toHaveValue("42.5");
  await expect(reps).toHaveValue("8");
  await expect(
    page.getByRole("button", { name: "Edit set 1", exact: true }),
  ).toBeVisible();
});
