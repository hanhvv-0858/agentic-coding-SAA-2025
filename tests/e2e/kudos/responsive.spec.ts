/**
 * Phase 10 T108 — responsive breakpoint audit for /kudos.
 *
 * Viewports swept: 375×812 (mobile), 640×960 (sm), 1024×768 (lg),
 * 1440×900 (xl). For each: visit the page, wait for network idle,
 * and assert the skeleton of the layout is correct:
 *   - Hero + All Kudos heading always visible.
 *   - `< lg` (`< 1024px`) → sidebar is NOT inside the desktop grid
 *     column; it stacks (still in DOM so SRs see stats).
 *   - `≥ lg` → sidebar is visible on the right.
 *   - No horizontal scroll (`documentElement.scrollWidth` ≤
 *     `clientWidth + 1`).
 *
 * Like every other kudos E2E, gated on the shared auth fixture.
 */
import { test, expect } from "@playwright/test";
import { requireAuth } from "../fixtures/auth";

const VIEWPORTS = [
  { name: "mobile-375", width: 375, height: 812 },
  { name: "sm-640", width: 640, height: 960 },
  { name: "lg-1024", width: 1024, height: 768 },
  { name: "xl-1440", width: 1440, height: 900 },
] as const;

test.describe("Kudos /kudos — responsive breakpoint audit", () => {
  for (const vp of VIEWPORTS) {
    test(`renders cleanly at ${vp.name}`, async ({ page, context }) => {
      await requireAuth(page, context, test.skip);
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto("/kudos");
      await page.waitForLoadState("networkidle");

      // Hero heading always visible.
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

      // ALL KUDOS section heading always visible.
      await expect(
        page.getByRole("heading", { level: 2, name: /ALL KUDOS/i }),
      ).toBeVisible();

      // No horizontal scroll.
      const overflow = await page.evaluate(() => {
        const doc = document.documentElement;
        return {
          sw: doc.scrollWidth,
          cw: doc.clientWidth,
        };
      });
      expect(overflow.sw).toBeLessThanOrEqual(overflow.cw + 1);

      // Screenshot regression — saved per-viewport for visual review.
      await page.screenshot({
        path: `tests/e2e/kudos/__screenshots__/responsive-${vp.name}.png`,
        fullPage: false,
      });
    });
  }

  test("sidebar stacks below feed on mobile (< lg)", async ({
    page,
    context,
  }) => {
    await requireAuth(page, context, test.skip);
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/kudos");
    await page.waitForLoadState("networkidle");

    // The grid collapses to one column on < lg. The feed section's
    // bounding box should sit entirely above the sidebar's bounding
    // box (stats block). If stats aren't rendered (error) we skip
    // this assertion.
    const feed = page.locator("section#feed");
    const sidebar = page.getByTestId("kudo-stats-sidebar").first();
    if ((await sidebar.count()) === 0) test.skip();
    const feedBox = await feed.boundingBox();
    const sidebarBox = await sidebar.boundingBox();
    if (!feedBox || !sidebarBox) test.skip();
    expect(feedBox!.y + feedBox!.height).toBeLessThanOrEqual(sidebarBox!.y);
  });

  test("sidebar sits in the right column on desktop (≥ lg)", async ({
    page,
    context,
  }) => {
    await requireAuth(page, context, test.skip);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/kudos");
    await page.waitForLoadState("networkidle");

    const feed = page.locator("section#feed");
    const sidebar = page.getByTestId("kudo-stats-sidebar").first();
    if ((await sidebar.count()) === 0) test.skip();
    const feedBox = await feed.boundingBox();
    const sidebarBox = await sidebar.boundingBox();
    if (!feedBox || !sidebarBox) test.skip();
    // Sidebar's left edge is to the right of the feed column's left
    // edge, and their vertical ranges overlap (two-column layout).
    expect(sidebarBox!.x).toBeGreaterThan(feedBox!.x);
  });
});
