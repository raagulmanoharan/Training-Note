import { test, expect } from "@playwright/test";
test("Pages project path: live assets, durable actuals and offline logging", async ({
  page,
  context,
}) => {
  const appURL = process.env.PAGES_URL || "http://127.0.0.1:5178/gym-notebook/";
  const projectPath = new URL(appURL).pathname;
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
  const manifestResponse = await page.evaluate(async (url) => {
    const response = await fetch(url);
    return {
      ok: response.ok,
      url: response.url,
      manifest: await response.json(),
    };
  }, new URL("manifest.webmanifest", appURL).href);
  expect(manifestResponse.ok).toBe(true);
  const manifest = manifestResponse.manifest;
  expect(new URL(manifest.scope, manifestResponse.url).pathname).toBe(
    projectPath,
  );
  for (const icon of manifest.icons)
    expect(
      await page.evaluate(
        async (url) => (await fetch(url)).ok,
        new URL(icon.src, manifestResponse.url).href,
      ),
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
  expect(new URL(scope).pathname).toBe(projectPath);
  const fontPaths = await page.evaluate(async () => {
    const names = await caches.keys();
    const paths: string[] = [];
    for (const name of names) {
      const cache = await caches.open(name);
      for (const request of await cache.keys())
        paths.push(new URL(request.url).pathname);
    }
    return paths;
  });
  expect(fontPaths).toContain(`${projectPath}fonts/manrope-latin-variable.ttf`);
  expect(fontPaths).toContain(`${projectPath}fonts/ibm-plex-mono-regular.ttf`);
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
  expect(
    await page.evaluate(async () => {
      await document.fonts.load('14px "Notebook Sans"');
      await document.fonts.load('14px "Notebook Mono"');
      return (
        document.fonts.check('14px "Notebook Sans"') &&
        document.fonts.check('14px "Notebook Mono"')
      );
    }),
  ).toBe(true);
  expect(requests).toEqual([]);
  await page.screenshot({
    path: "tests/artifacts/pages-mobile.png",
    fullPage: true,
  });
});
