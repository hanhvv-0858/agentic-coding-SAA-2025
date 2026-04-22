import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// Countdown a11y gate — zero serious/critical axe violations at desktop
// 1440×900 + mobile 375×812. Public route, no auth fixture required.

test.describe("Countdown a11y", () => {
  test("zero serious/critical axe violations at desktop 1440×900", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const response = await page.goto("/countdown");
    if (response && response.status() >= 300 && response.status() < 400) {
      test.skip(true, "Env NEXT_PUBLIC_SITE_LAUNCH_AT is in the past — prelaunch redirects to /login");
    }

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

  test("zero serious/critical axe violations at mobile 375×812", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    const response = await page.goto("/countdown");
    if (response && response.status() >= 300 && response.status() < 400) {
      test.skip(true, "Env NEXT_PUBLIC_SITE_LAUNCH_AT is in the past");
    }

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    const blocking = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(blocking).toEqual([]);
  });
});
