import { test, expect } from "@playwright/test";
import { requireAuth } from "./fixtures/auth";

// E2E for the Floating Action Button (bundled spec _hphd32jN2 + Sv7DFwBw1h).
// Tests the three tile paths from Homepage: Viết KUDOS → /kudos/new,
// Thể lệ → /the-le, and Cancel → stays on /.

test.describe("FAB — authenticated flows", () => {
  test("opens menu then navigates to /kudos/new via Viết KUDOS tile", async ({
    page,
    context,
  }) => {
    await requireAuth(page, context, test.skip);
    await page.goto("/");

    // Collapsed trigger visible.
    const trigger = page.locator("[data-fab-trigger]");
    await expect(trigger).toBeVisible();

    await trigger.click();
    await expect(page.getByRole("menu")).toBeVisible();

    await page
      .getByRole("menuitem")
      .filter({ hasText: /Viết KUDOS|Write KUDOS/ })
      .click();

    await expect(page).toHaveURL(/\/kudos\/new$/);
    // Back on that route, the FAB pill should be visible again (menu collapsed).
    await expect(page.locator("[data-fab-trigger]")).toBeVisible();
  });

  test("opens menu then navigates to /the-le via Thể lệ tile", async ({
    page,
    context,
  }) => {
    await requireAuth(page, context, test.skip);
    await page.goto("/");

    await page.locator("[data-fab-trigger]").click();
    await expect(page.getByRole("menu")).toBeVisible();

    await page
      .getByRole("menuitem")
      .filter({ hasText: /^Thể lệ$|^Rules$/ })
      .click();

    await expect(page).toHaveURL(/\/the-le$/);
    await expect(page.locator("[data-fab-trigger]")).toBeVisible();
  });

  test("Cancel button collapses menu and keeps URL unchanged", async ({
    page,
    context,
  }) => {
    await requireAuth(page, context, test.skip);
    await page.goto("/");

    await page.locator("[data-fab-trigger]").click();
    await expect(page.getByRole("menu")).toBeVisible();

    // Cancel is the icon-only menuitem with localised aria-label.
    const cancel = page
      .getByRole("menuitem")
      .filter({ has: page.locator('[aria-label="Đóng"], [aria-label="Close"]') });
    await cancel.first().click();

    await expect(page.getByRole("menu")).not.toBeVisible();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator("[data-fab-trigger]")).toBeVisible();
  });
});
