import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    (window as any).designStorageCalls = [];
    for (const method of ["open", "deleteDatabase"] as const) {
      const original = IDBFactory.prototype[method];
      (IDBFactory.prototype as any)[method] = function (...args: any[]) {
        (window as any).designStorageCalls.push([method, ...args]);
        return (original as any).apply(this, args);
      };
    }
  });
});
test.afterEach(async ({ page }) => {
  if (new URL(page.url()).searchParams.get("design") === "1")
    expect(
      await page.evaluate(() => (window as any).designStorageCalls),
    ).toEqual([]);
});

async function library(page: any) {
  await page.goto("/?design=1");
  await page.getByRole("button", { name: /Component library/ }).click();
  await expect(
    page.getByRole("heading", { name: "Component library", exact: true }),
  ).toBeVisible();
}

test("design workbench: journeys, architecture and flows stay isolated from notebook storage", async ({
  page,
}) => {
  await page.goto("/?design=1");
  await expect(
    page.getByRole("heading", { name: "Journey & blueprint", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".dw-journey-column")).toHaveCount(12);
  await page.locator(".dw-journey-column").nth(4).click();
  await expect(page.locator(".dw-journey-column").nth(4)).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.getByRole("button", { name: /Information architecture/ }).click();
  await expect(page.locator(".dw-ia-card")).toHaveCount(2);
  await page.getByRole("button", { name: /Task flows/ }).click();
  await expect(page.locator(".dw-flow-selector button")).toHaveCount(10);
  await page.locator(".dw-flow-selector button").last().click();
  await expect(page.locator(".dw-flow-selector button").last()).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await page.getByRole("button", { name: /Component library/ }).click();
  await expect(
    page.getByText(
      /Legacy shared-state specimens · synthetic, in-memory state · no workout storage/,
    ),
  ).toBeVisible();
  expect(await page.evaluate(() => (window as any).designStorageCalls)).toEqual(
    [],
  );
});

test("design workbench: narrow views do not overflow the page", async ({
  page,
}) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/?design=1");
    for (const name of [
      "Journey & blueprint",
      "Information architecture",
      "Task flows",
      "Component library",
    ]) {
      await page
        .getByRole("button", { name: new RegExp(name.replace("&", "&")) })
        .click();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    await page.screenshot({
      path: `tests/artifacts/design-components-${width}.png`,
      fullPage: true,
    });
  }
});

test("design atoms: keyboard focus, native busy lock, field reasons and selected intent", async ({
  page,
}) => {
  await library(page);
  const primary = page.getByRole("button", {
    name: "Primary example",
    exact: true,
  });
  await primary.focus();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Shift+Tab");
  await expect(primary).toBeFocused();
  expect(
    await primary.evaluate((el: any) =>
      parseFloat(getComputedStyle(el).outlineWidth),
    ),
  ).toBeGreaterThanOrEqual(2);
  await page.keyboard.press("Enter");
  await expect(
    page.getByText("Illustrative action count: 1", { exact: true }),
  ).toBeVisible();
  const busy = page.getByRole("button", {
    name: "Saving sample action",
    exact: true,
  });
  await expect(busy).toBeDisabled();
  await expect(busy).toHaveAttribute("aria-busy", "true");
  await busy.evaluate((el: any) => {
    el.click();
    el.click();
  });
  await page
    .getByRole("button", { name: "Disabled example", exact: true })
    .evaluate((el: any) => el.click());
  await expect(
    page.getByText("Illustrative action count: 1", { exact: true }),
  ).toBeVisible();
  const invalid = page.getByRole("textbox", {
    name: "Invalid reps example",
    exact: true,
  });
  await expect(invalid).toHaveAttribute("aria-invalid", "true");
  const described = await invalid.getAttribute("aria-describedby");
  expect(described).toBeTruthy();
  await expect(page.locator(`[id="${described}"]`)).toHaveText(
    "Use positive whole reps.",
  );
  await invalid.fill("8");
  await expect(invalid).not.toHaveAttribute("aria-invalid", "true");
  await expect(
    page.getByRole("textbox", { name: "Example weight (kg)", exact: true }),
  ).toHaveAttribute("inputmode", "decimal");
  const choices = page.getByTestId("ds-demo-choice"),
    back = choices.getByRole("button", { name: "Back", exact: true });
  await expect(back).toHaveAttribute("aria-pressed", "false");
  await back.click();
  await expect(back).toHaveAttribute("aria-pressed", "true");
  await back.click();
  await expect(back).toHaveAttribute("aria-pressed", "false");
  const disclosure = page.getByTestId("ds-demo-disclosure"),
    summary = disclosure.locator("summary");
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(disclosure).toHaveAttribute("open", "");
  await expect(
    disclosure.getByRole("button", {
      name: "Choose dumbbell press",
      exact: true,
    }),
  ).toBeVisible();
});

test("design set molecule: pending cannot impersonate recorded and failed values survive explicit retry", async ({
  page,
}) => {
  await library(page);
  const row = page.getByTestId("ds-demo-row");
  const weight = page.getByRole("textbox", {
    name: "Example bench press set 2 weight (kg)",
    exact: true,
  });
  const reps = page.getByRole("textbox", {
    name: "Example bench press set 2 reps",
    exact: true,
  });
  await weight.fill("47.5");
  await reps.fill("9");
  await expect(row).toHaveAttribute("data-state", "draft");
  await page
    .getByRole("button", { name: "Log Example bench press set 2", exact: true })
    .click();
  await expect(row).toHaveAttribute("data-state", "saving");
  await expect(
    row.getByRole("button", { name: "Saving set 2…", exact: true }),
  ).toBeDisabled();
  await expect(
    row.getByRole("img", { name: "Recorded set 2", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Commit fails", exact: true }).click();
  await expect(row).toHaveAttribute("data-state", "error");
  await expect(weight).toHaveValue("47.5");
  await expect(reps).toHaveValue("9");
  await expect(
    row.getByRole("img", { name: "Recorded set 2", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Retry example save", exact: true })
    .click();
  await expect(row).toHaveAttribute("data-state", "saving");
  await page
    .getByRole("button", { name: "Commit succeeds", exact: true })
    .click();
  await expect(row).toHaveAttribute("data-state", "saved");
  await expect(
    row.getByRole("img", { name: "Recorded set 2", exact: true }),
  ).toBeVisible();
  await expect(row).toContainText("47.5");
  await expect(row).toContainText("9");
  await expect(page.getByTestId("ds-demo-saving")).toHaveAttribute(
    "data-state",
    "saving",
  );
});

test("design molecules: effort wraps, qualification stays visible, and reduced-motion controls retain contrast", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await library(page);
  const effort = page.getByRole("group", {
    name: "Good-form reps remaining",
    exact: true,
  });
  for (const button of await effort.getByRole("button").all()) {
    const box = await button.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    expect(box!.width).toBeGreaterThanOrEqual(44);
  }
  const choice = effort.getByRole("button", { name: "2 more", exact: true });
  await choice.click();
  await expect(choice).toHaveAttribute("aria-pressed", "true");
  await expect(choice).toBeDisabled();
  await page
    .getByRole("button", { name: "Effort commit fails", exact: true })
    .click();
  await expect(choice).toHaveAttribute("aria-pressed", "true");
  await expect(
    page.getByText("Effort estimate not saved", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Retry effort save", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Effort commit succeeds", exact: true })
    .click();
  await expect(
    page.getByText("Fixture selected: 2 good-form reps remaining.", {
      exact: true,
    }),
  ).toBeVisible();
  const comparison = page.locator(".ds-comparison");
  await expect(
    comparison.locator(".ds-comparison__qualification"),
  ).toBeVisible();
  await expect(
    comparison.locator(".ds-comparison__qualification"),
  ).toContainText("Effort not compared");
  await expect(comparison.locator("details")).not.toHaveAttribute("open", "");
  await comparison.locator("summary").click();
  await expect(comparison.locator("details")).toHaveAttribute("open", "");
  await expect(comparison).toContainText("40 kg × 10 / 10 / 8");
  const computed = await page
    .getByRole("button", { name: "Primary example", exact: true })
    .evaluate((element: any) => {
      const style = getComputedStyle(element);
      function luminance(color: string) {
        const rgb = (color.match(/[\d.]+/g) || [])
          .slice(0, 3)
          .map(Number)
          .map((v) => {
            const c = v / 255;
            return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
          });
        return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
      }
      const a = luminance(style.color),
        b = luminance(style.backgroundColor);
      return {
        contrast: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
        transition: style.transitionDuration,
      };
    });
  expect(computed.contrast).toBeGreaterThanOrEqual(4.5);
  expect(computed.transition).toBe("0s");
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});

test("design composition: actual rendered heading contrast survives workbench and worksheet boundaries", async ({
  page,
}) => {
  await library(page);
  const headings = await page
    .locator(".ds-gallery h2, .ds-gallery h3")
    .evaluateAll((elements) =>
      elements.map((element) => {
        const rgb = (color: string) =>
          (color.match(/[\d.]+/g) || []).map(Number);
        const luminance = (values: number[]) => {
          const v = values.slice(0, 3).map((n) => {
            const c = n / 255;
            return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
          });
          return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
        };
        let current: Element | null = element,
          background = [255, 255, 255];
        while (current) {
          const values = rgb(getComputedStyle(current).backgroundColor);
          if (
            values.length === 3 ||
            (values.length === 4 && values[3] > 0.99)
          ) {
            background = values;
            break;
          }
          current = current.parentElement;
        }
        const foreground = rgb(getComputedStyle(element).color),
          a = luminance(foreground),
          b = luminance(background);
        return {
          name: element.textContent,
          contrast: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
        };
      }),
    );
  expect(headings.length).toBeGreaterThan(8);
  for (const heading of headings)
    expect(
      heading.contrast,
      `Actual heading contrast for ${heading.name}`,
    ).toBeGreaterThanOrEqual(4.5);
});

test("integrated design states: effort saving never pretends another actual set is saving", async ({
  page,
}) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Plan a workout", exact: true })
    .click();
  await page.getByRole("button", { name: "Chest", exact: true }).click();
  await page.getByLabel("Exercises", { exact: true }).fill("1");
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
    page.getByRole("button", { name: "Options for set 1", exact: true }),
  ).toBeVisible();
  await page
    .locator(".nb-exercise-card.is-active")
    .getByRole("button", { name: /^More options for / })
    .click();
  await page
    .getByRole("button", { name: "How did that set feel?", exact: true })
    .click();
  await page.evaluate(() => {
    const original = IDBDatabase.prototype.transaction;
    IDBDatabase.prototype.transaction = function (...args: any[]) {
      const tx = original.apply(this, args as any);
      if (args[1] === "readwrite")
        Object.defineProperty(tx, "oncomplete", {
          set(handler: any) {
            tx.addEventListener("complete", () =>
              setTimeout(() => handler.call(tx), 900),
            );
          },
        });
      return tx;
    };
  });
  await page.getByRole("button", { name: "2 more", exact: true }).click();
  await expect(
    page.getByText("Saving effort estimate…", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", {
      name: "Saving set",
      exact: true,
      includeHidden: true,
    }),
  ).toHaveCount(0);
  await expect(page.locator(".nb-set-row.is-current")).toHaveAttribute(
    "data-state",
    "draft",
  );
  await expect(
    page.getByRole("button", {
      name: "Options for set 1",
      exact: true,
      includeHidden: true,
    }),
  ).toBeVisible();
  await expect(page.locator(".personal-status")).toHaveText(
    "Saved on this device",
  );
  await expect(
    page.getByRole("button", { name: /^Change effort for set 1 of/ }),
  ).toBeVisible();
});

test("integrated design atoms: backup checkbox remains a native compact persisted preference", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto("/");
  await page
    .getByRole("button", { name: "Settings and backup", exact: true })
    .click();
  const checkbox = page.getByRole("checkbox", {
    name: "Show double-progression hints",
    exact: true,
  });
  await expect(checkbox).not.toBeChecked();
  const box = await checkbox.boundingBox();
  expect(box!.width).toBeLessThanOrEqual(28);
  expect(box!.height).toBeLessThanOrEqual(28);
  await checkbox.check();
  await expect(page.locator(".personal-status")).toHaveText(
    "Saved on this device",
  );
  await page.reload();
  await page
    .getByRole("button", { name: "Settings and backup", exact: true })
    .click();
  await expect(checkbox).toBeChecked();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
});
