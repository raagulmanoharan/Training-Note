import { chromium, expect } from "@playwright/test";
import { mkdir, writeFile } from "node:fs/promises";
const appURL =
  process.env.PAGES_URL || "https://raagulmanoharan.github.io/Training-Note/";
const output = "docs/design/set-actions";
await mkdir(output, { recursive: true });
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
await page.goto(appURL);
await page.getByRole("button", { name: "Plan a workout", exact: true }).click();
await page.getByRole("button", { name: "Biceps", exact: true }).click();
await page
  .getByRole("button", { name: "Build my workout", exact: true })
  .click();
await page.getByRole("button", { name: "Start workout", exact: true }).click();
await page
  .getByRole("textbox", { name: "Weight (kg)", exact: true })
  .fill("20");
await page.getByRole("textbox", { name: "Reps", exact: true }).fill("10");
await page.getByRole("button", { name: /^Log set \d+ for / }).click();
const saved = () =>
  expect(page.locator(".personal-status")).toHaveText("Saved on this device");
await saved();
await expect(
  page.getByRole("button", { name: "Edit set 1", exact: true }),
).toHaveCount(0);
await page.screenshot({ path: `${output}/live-receipt.png`, fullPage: true });
await page
  .getByRole("button", { name: "Options for set 1", exact: true })
  .click();
const menu = page.getByRole("dialog", { name: "Set 1 options", exact: true });
await expect(menu).toContainText("20 kg × 10 reps");
await menu.evaluate(async (element) => {
  await Promise.all(
    element.getAnimations({ subtree: true }).map((animation) => animation.finished),
  );
});
await page.screenshot({ path: `${output}/live-menu.png` });
await menu.getByRole("button", { name: "Edit set 1", exact: true }).click();
await page.getByLabel("Edit weight", { exact: true }).fill("22.5");
await page.getByRole("button", { name: "Save changes", exact: true }).click();
await saved();
await expect(page.locator(".nb-saved-set")).toContainText("22.5");
await page
  .getByRole("button", { name: "Options for set 1", exact: true })
  .click();
await menu.getByRole("button", { name: "Delete set 1", exact: true }).click();
await saved();
await expect(page.locator(".nb-saved-set")).toHaveCount(0);
await page
  .getByRole("button", { name: "Undo deleted set", exact: true })
  .click();
await saved();
await page.reload();
await expect(
  page.getByRole("button", { name: "Options for set 1", exact: true }),
).toBeVisible();
await expect(page.locator(".nb-saved-set")).toContainText("22.5");
expect(errors).toEqual([]);
const report = {
  url: page.url(),
  menuContextVerified: true,
  editDeleteUndoReload: true,
  pageErrors: errors,
  fixture: "Fresh isolated synthetic browser; no user database accessed",
};
await writeFile(`${output}/live-review.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report));
await browser.close();
