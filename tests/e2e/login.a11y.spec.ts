import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Gate per spec SC-003: Lighthouse a11y ≥ 95, axe-core reports zero
// serious/critical violations. This test covers the axe half.

test.describe("Login a11y", () => {
  test("has no serious or critical axe violations at desktop 1440×1024", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 1024 });
    await page.goto("/login");

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

  test("has no serious or critical axe violations at mobile 375×812", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/login");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    const blocking = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(blocking).toEqual([]);
  });
});
