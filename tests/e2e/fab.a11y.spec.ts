import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { requireAuth } from "./fixtures/auth";

// FAB a11y gate per collapsed + expanded specs SC-002: zero serious/critical
// axe violations on the FAB subtree, both states.

test.describe("FAB a11y", () => {
  test("zero serious/critical violations while collapsed", async ({
    page,
    context,
  }) => {
    await requireAuth(page, context, test.skip);
    await page.goto("/");
    await expect(page.locator("[data-fab-trigger]")).toBeVisible();

    const results = await new AxeBuilder({ page })
      .include("[data-fab-trigger]")
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    const blocking = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );

    expect(blocking, JSON.stringify(blocking, null, 2)).toHaveLength(0);
  });

  test("zero serious/critical violations while expanded", async ({
    page,
    context,
  }) => {
    await requireAuth(page, context, test.skip);
    await page.goto("/");
    await page.locator("[data-fab-trigger]").click();
    await expect(page.getByRole("menu")).toBeVisible();

    const results = await new AxeBuilder({ page })
      .include('[role="menu"]')
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    const blocking = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );

    expect(blocking, JSON.stringify(blocking, null, 2)).toHaveLength(0);
  });
});
