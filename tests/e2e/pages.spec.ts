import { test, expect } from "@playwright/test";
test("Pages project path: live assets, durable actuals and offline logging", async ({
  page,
  context,
}) => {
  const appURL = process.env.PAGES_URL || "http://127.0.0.1:5178/gym-notebook/";
  const requests: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/api/")) requests.push(r.url());
  });
  await page.setViewportSize({ width: 390, height: 844 });
  const response = await page.goto(appURL);
  expect(response?.status()).toBe(200);
  await page
    .getByRole("button", { name: "Plan a workout", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "What are you training?" }),
  ).toBeVisible();
  const manifestResponse = await page.request.get(
    new URL("manifest.webmanifest", appURL).href,
  );
  expect(manifestResponse.ok()).toBe(true);
  const manifest = await manifestResponse.json();
  expect(new URL(manifest.scope, manifestResponse.url()).pathname).toBe(
    "/gym-notebook/",
  );
  for (const icon of manifest.icons)
    expect(
      (
        await page.request.get(new URL(icon.src, manifestResponse.url()).href)
      ).ok(),
    ).toBe(true);
  await page.getByRole("button", { name: "Chest", exact: true }).click();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page.getByRole("button", { name: "Build my workout" }).click();
  await page
    .getByRole("button", { name: "Start workout", exact: true })
    .click();
  await page
    .getByRole("textbox", { name: "Weight (kg)", exact: true })
    .fill("40");
  await page.getByRole("textbox", { name: "Reps", exact: true }).fill("10");
  await page.getByRole("button", { name: /^Log set \d+ for / }).click();
  await expect(
    page.getByRole("button", { name: "Edit set 1", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".personal-status")).toHaveText(
    "Saved on this device",
  );
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  const scope = await page.evaluate(
    async () => (await navigator.serviceWorker.ready).scope,
  );
  expect(new URL(scope).pathname).toBe("/gym-notebook/");
  await context.setOffline(true);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "Edit set 1", exact: true }),
  ).toBeVisible();
  await page
    .getByRole("textbox", { name: "Weight (kg)", exact: true })
    .fill("42.5");
  await page.getByRole("textbox", { name: "Reps", exact: true }).fill("8");
  await page.getByRole("button", { name: /^Log set \d+ for / }).click();
  await expect(
    page.getByRole("button", { name: "Edit set 2", exact: true }),
  ).toBeVisible();
  expect(requests).toEqual([]);
  await page.screenshot({
    path: "tests/artifacts/pages-mobile.png",
    fullPage: true,
  });
});
