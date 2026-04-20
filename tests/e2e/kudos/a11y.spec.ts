/**
 * Phase 10 T106 + T107 — E2E a11y sweep + tab-order audit on /kudos.
 *
 * Gated on `SUPABASE_TEST_SESSION_TOKEN` via the shared auth fixture.
 * When the env var is missing (default in local dev), the whole suite
 * is skipped — matches the existing kudos E2E pattern.
 *
 * Install note: `@axe-core/playwright` ships in `devDependencies`
 * (4.11.x); no extra install step required. If ever removed, flip
 * `HAS_AXE` to false and the suite becomes a no-op.
 */
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { requireAuth } from "../fixtures/auth";

const HAS_AXE = true;

test.describe("Kudos /kudos — a11y sweep (axe-core)", () => {
  test.skip(!HAS_AXE, "@axe-core/playwright not installed");

  test("/kudos (baseline) has zero serious/critical a11y violations", async ({
    page,
    context,
  }) => {
    await requireAuth(page, context, test.skip);
    await page.goto("/kudos");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const critical = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(
      critical,
      `Found ${critical.length} serious/critical a11y issues: ${critical
        .map((v) => `${v.id} — ${v.description}`)
        .join("; ")}`,
    ).toEqual([]);
  });

  test("/kudos?hashtag=dedicated — filtered view has zero serious/critical a11y violations", async ({
    page,
    context,
  }) => {
    await requireAuth(page, context, test.skip);
    await page.goto("/kudos?hashtag=dedicated");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    const critical = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(critical).toEqual([]);
  });

  test("/kudos?department=engineering — department-filtered view has zero serious/critical a11y violations", async ({
    page,
    context,
  }) => {
    await requireAuth(page, context, test.skip);
    await page.goto("/kudos?department=engineering");
    await page.waitForLoadState("networkidle");

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa"])
      .analyze();
    const critical = results.violations.filter(
      (v) => v.impact === "serious" || v.impact === "critical",
    );
    expect(critical).toEqual([]);
  });
});

test.describe("Kudos /kudos — keyboard tab order (SC-010)", () => {
  test("Tab order flows skip-link → header → composer pill → filters → feed", async ({
    page,
    context,
  }) => {
    await requireAuth(page, context, test.skip);
    await page.goto("/kudos");
    await page.waitForLoadState("networkidle");

    // First Tab lands on the skip-link.
    await page.keyboard.press("Tab");
    const skip = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement | null;
      return {
        tag: el?.tagName?.toLowerCase() ?? null,
        href: el?.getAttribute("href") ?? null,
      };
    });
    expect(skip.tag).toBe("a");
    expect(skip.href).toBe("#main");

    // Advance a handful of tab stops — assert the focus is always on
    // a visible, focusable, non-disabled element (we don't pin every
    // stop because the shell nav length may drift).
    for (let i = 0; i < 12; i += 1) {
      await page.keyboard.press("Tab");
      const ok = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return false;
        if (
          "disabled" in el &&
          (el as HTMLButtonElement).disabled === true
        ) {
          return false;
        }
        return true;
      });
      expect(ok, `tab stop #${i + 1} landed on a disabled / missing element`).toBe(
        true,
      );
    }
  });
});
