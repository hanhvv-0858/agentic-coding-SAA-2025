import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { requireAuth } from "./fixtures/auth";

// Thể lệ a11y gates per spec TR-007 / SC-003: zero serious/critical axe
// violations at desktop (1440×900) + mobile (375×812) viewports.

test.describe("Thể lệ a11y", () => {
  test("zero serious/critical axe violations at desktop 1440×900", async ({
    page,
    context,
  }) => {
    await requireAuth(page, context, test.skip);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/the-le");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    const blocking = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );

    if (blocking.length > 0) {
      console.warn(
        "axe violations:",
        JSON.stringify(
          blocking.map((v) => ({ id: v.id, impact: v.impact, help: v.help })),
          null,
          2,
        ),
      );
    }
    expect(blocking).toEqual([]);
  });

  test("zero serious/critical axe violations at mobile 375×812", async ({
    page,
    context,
  }) => {
    await requireAuth(page, context, test.skip);
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/the-le");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    const blocking = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(blocking).toEqual([]);
  });
});
