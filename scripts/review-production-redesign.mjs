import { chromium } from "@playwright/test";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import assert from "node:assert/strict";
const output = "docs/design/production-redesign";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
});
const page = await context.newPage();
const errors = [],
  external = [];
page.on("pageerror", (e) => errors.push(e.message));
page.on("request", (r) => {
  if (/^https?:/.test(r.url()) && !r.url().startsWith("http://localhost:5173"))
    external.push(r.url());
});
await page.goto("http://localhost:5173/");
await page.waitForSelector(".training-home");
await page.evaluate(async () => {
  const s = await import("/frontend/src/personalStore.ts"),
    l = await import("/frontend/src/personalLogic.ts");
  const state = s.defaultState();
  state.settings.gym = "Main gym";
  for (let i = 0; i < 12; i++) {
    const w = l.generatePlan(["chest", "back"], 2, state.settings),
      d = new Date();
    d.setDate(d.getDate() - (27 - i * 2));
    d.setHours(10, 0, 0, 0);
    w.startedAt = d.toISOString();
    w.finishedAt = d.toISOString();
    w.exercises.forEach((e, j) => {
      e.sets = Array.from({ length: 3 }, () => ({
        id: crypto.randomUUID(),
        weight: j ? 45 : 60,
        reps: i === 11 ? 10 : 8,
        loggedAt: d.toISOString(),
        repsInReserve: 2,
      }));
    });
    state.history.push(w);
  }
  state.history.reverse();
  await s.saveState(state, 0);
});
await page.reload();
await page.waitForSelector(".training-home");
await page.evaluate(() => document.fonts.ready);
assert.equal(
  await page.evaluate(
    () =>
      document.fonts.check('14px "Notebook Sans"') &&
      document.fonts.check('14px "Notebook Mono"'),
  ),
  true,
);
await page.waitForTimeout(200);
for (const width of [320, 390]) {
  await page.setViewportSize({ width, height: 844 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
}
await page.screenshot({ path: output + "/home.png", fullPage: true });
await page
  .getByRole("button", { name: "Repeat this workout", exact: true })
  .click();
await page.getByRole("button", { name: "Start workout", exact: true }).click();
const results = [];
for (const width of [320, 390]) {
  await page.setViewportSize({ width, height: width === 320 ? 740 : 844 });
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  const log = page.getByRole("button", { name: /^Log set \d+ for / });
  const box = await log.boundingBox();
  results.push({
    width,
    log: box,
    withinInitialViewport: box.y + box.height <= (width === 320 ? 740 : 844),
  });
  assert.equal(results.at(-1).withinInitialViewport, true);
}
await page.getByRole("button", { name: "Use last time", exact: true }).click();
await page.waitForTimeout(200);
await page.screenshot({ path: output + "/workout.png", fullPage: true });
await page
  .getByRole("button", { name: "Hide elapsed time", exact: true })
  .click();
await page.screenshot({
  path: output + "/workout-compact.png",
  fullPage: true,
});
await page
  .getByRole("button", { name: "Show elapsed time", exact: true })
  .click();
await page.getByRole("button", { name: /^Log set \d+ for / }).click();
await page
  .locator(".personal-status")
  .filter({ hasText: "Saved on this device" })
  .waitFor();
const edit = page.getByRole("button", { name: "Edit set 1", exact: true });
const editBox = await edit.boundingBox();
assert.equal(editBox.y + editBox.height <= 844, true);
await page.waitForTimeout(200);
await page.screenshot({ path: output + "/logged.png", fullPage: true });
for (let n = 0; n < 4; n++) {
  await page
    .getByRole("button", { name: "Log 60 kg × 10 again", exact: true })
    .click();
  await page
    .locator(".personal-status")
    .filter({ hasText: "Saved on this device" })
    .waitFor();
}
await page.getByRole("button", { name: "Add set", exact: true }).click();
const longSession = [];
for (const width of [320, 390]) {
  await page.setViewportSize({ width, height: width === 320 ? 740 : 844 });
  await page.evaluate(() => scrollTo(0, 0));
  const log = await page
    .getByRole("button", { name: /^Log set \d+ for / })
    .boundingBox();
  const next = await page
    .getByRole("button", { name: "Next exercise", exact: true })
    .boundingBox();
  longSession.push({ width, log, next });
  console.log(JSON.stringify({ width, log, next }));
  await page.screenshot({
    path: output + `/sixth-set-${width}.png`,
    fullPage: true,
  });
  assert.equal(log.y + log.height <= (width === 320 ? 740 : 844), true);
  assert.equal(next.y + next.height <= (width === 320 ? 740 : 844), true);
}
await page.screenshot({ path: output + "/sixth-set.png", fullPage: true });
await page.reload();
await page.locator(".nb-exercise-card.is-active").waitFor();
assert.equal(await page.locator(".nb-saved-set").count(), 5);
assert.deepEqual(errors, []);
assert.deepEqual(external, []);
const fontFamily = await page
  .locator(".personal-app")
  .evaluate((el) => getComputedStyle(el).fontFamily);
const report = {
  actualProduction: true,
  fixture: "12 synthetic history sessions in isolated browser context",
  viewportChecks: results,
  latestCorrection: editBox,
  longSession,
  fontFamily,
  selfHostedFontsLoaded: true,
  reloadKeptRecordedSet: true,
  pageErrors: errors,
  externalRequests: external,
};
await writeFile(output + "/review.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report));
await browser.close();
