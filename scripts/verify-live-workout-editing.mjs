import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";

const appURL =
  process.env.PAGES_URL || "https://raagulmanoharan.github.io/Training-Note/";
const output = process.env.SCREENSHOT_DIR || "docs/design/workout-editing";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
page.setDefaultTimeout(20000);
page.setDefaultNavigationTimeout(20000);
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const button = (name, scope = page) =>
  scope.getByRole("button", { name, exact: true });
const dialog = (name) => page.getByRole("dialog", { name, exact: true });
const saved = () =>
  expect(page.locator(".personal-status")).toHaveText("Saved on this device");
const capture = async (name, sheet) => {
  if (sheet)
    await sheet.evaluate(async (el) => {
      await Promise.all(
        el
          .getAnimations({ subtree: true })
          .filter(
            (animation) =>
              animation.effect?.getTiming().iterations !== Infinity,
          )
          .map((animation) => animation.finished),
      );
    });
  await page.screenshot({ path: `${output}/${name}.png` });
};
const read = () =>
  page.evaluate(
    () =>
      new Promise((resolve, reject) => {
        const request = indexedDB.open("personal-gym-notebook", 1);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          const get = db
            .transaction("state", "readonly")
            .objectStore("state")
            .get("main");
          get.onsuccess = () => {
            db.close();
            resolve(get.result);
          };
          get.onerror = () => reject(get.error);
        };
      }),
  );

await page.goto(appURL);
await button("Plan a workout").click();
await button("Shoulders").click();
await button("Pick exercises").click();
await button("Lateral raise").click();
await button("Reverse fly").click();
await button("Build my workout").click();
await button("Add exercise").click();
let picker = dialog("Choose exercises");
await picker
  .getByRole("checkbox", { name: "Overhead press", exact: true })
  .check();
await picker
  .getByRole("checkbox", { name: "Shoulder press", exact: true })
  .check();
await button("Selected exercises", picker).click();
await expect(picker.getByRole("checkbox", { checked: true })).toHaveCount(4);
await capture("live-selection", picker);
await button("Save exercises", picker).click();
await expect(page.locator(".nb-lineup-row h3")).toHaveText([
  "Lateral raise",
  "Reverse fly",
  "Overhead press",
  "Shoulder press",
]);
await button("More options for Lateral raise").click();
await button("Swap Lateral raise").click();
picker = dialog("Swap exercise");
await expect(
  picker.getByRole("button", { name: /^Swap to / }).first(),
).toHaveAccessibleName("Swap to Cable lateral raise");
await capture("live-swap", picker);
await button("Swap to Cable lateral raise", picker).click();
await button("Edit sets & rest").click();
let editor = dialog("Edit sets & rest");
await editor
  .getByRole("checkbox", { name: "Working sets", exact: true })
  .check();
await editor.getByLabel("Working sets target", { exact: true }).fill("2");
await editor
  .getByRole("checkbox", { name: "Rest between sets", exact: true })
  .check();
await button("60s", editor).click();
await capture("live-bulk-targets", editor);
await button("Apply to 4 exercises", editor).click();
await button("Start workout").click();
await saved();
for (const [weight, reps] of [
  ["10", "12"],
  ["12.5", "10"],
]) {
  await page
    .getByRole("textbox", { name: "Weight (kg)", exact: true })
    .fill(weight);
  await page.getByRole("textbox", { name: "Reps", exact: true }).fill(reps);
  await page.getByRole("button", { name: /^Log set \d+ for / }).click();
  await saved();
}
await expect(
  page.getByRole("region", { name: "Rest timer", exact: true }),
).toBeVisible();
await button("More options for Cable lateral raise").click();
await button("Edit recorded sets").click();
editor = dialog("Edit recorded sets");
await editor.getByRole("checkbox", { name: "Weight", exact: true }).check();
await editor
  .getByLabel("Weight for selected sets (kg)", { exact: true })
  .fill("15");
await capture("live-bulk-actuals", editor);
await button("Correct 2 sets", editor).click();
await saved();
const before = await read();
await page.reload();
await expect(
  page.getByRole("button", { name: "Finish", exact: true }),
).toBeVisible();
const after = await read();
expect(after).toEqual(before);
expect(after.current.exercises.map((e) => e.plannedSets)).toEqual([2, 2, 2, 2]);
expect(after.current.exercises.map((e) => e.restSeconds)).toEqual([
  60, 60, 60, 60,
]);
expect(after.current.exercises[0].sets.map((s) => s.weight)).toEqual([15, 15]);
expect(after.current.restTimer.endsAt).toBeGreaterThan(Date.now());
expect(errors).toEqual([]);
await capture("live-workout");
const report = {
  url: page.url(),
  multipleSelection: true,
  sameTargetSwap: true,
  bulkTargets: true,
  bulkActuals: true,
  restAfterReload: true,
  pageErrors: errors,
  fixture: "Fresh isolated synthetic browser; no user database accessed",
};
await writeFile(`${output}/live-review.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report));
await browser.close();
