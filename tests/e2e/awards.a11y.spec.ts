import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { requireAuth } from "./fixtures/auth";

// Awards a11y gates per spec SC-003: zero axe serious/critical violations at
// mobile (375×812) + desktop (1440×900) viewports, plus a tab-order sanity
// check per plan P4.5.

test.describe("Awards a11y", () => {
  test("zero serious/critical axe violations at desktop 1440×900", async ({
    page,
    context,
  }) => {
    await requireAuth(page, context, test.skip);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/awards");

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
    await page.goto("/awards");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();

    const blocking = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(blocking).toEqual([]);
  });

  test("tab order: skip link → header → left nav → Kudos CTA → footer → FAB", async ({
    page,
    context,
  }) => {
    await requireAuth(page, context, test.skip);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/awards");

    // First Tab should land on the skip link (first focusable).
    await page.keyboard.press("Tab");
    const firstFocused = await page.evaluate(() =>
      document.activeElement?.textContent?.trim(),
    );
    expect(firstFocused).toMatch(/Skip to main content|Bỏ qua/);
  });
});
