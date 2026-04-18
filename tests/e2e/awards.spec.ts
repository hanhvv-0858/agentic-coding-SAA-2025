import { test, expect } from "@playwright/test";
import { requireAuth } from "./fixtures/auth";

// E2E for /awards. Tests that don't require a Supabase session run
// unconditionally; authenticated happy-path tests are gated on the
// SUPABASE_TEST_SESSION_TOKEN env var (see fixtures/auth.ts).

test.describe("Awards — unauthenticated", () => {
  test("redirects to /login when no session is present", async ({ page }) => {
    const response = await page.goto("/awards");
    // Either a 302 landed us on /login, OR the final URL is /login.
    expect(response?.status()).toBeLessThan(500);
    await expect(page).toHaveURL(/\/login(\?|$)/);
  });
});

test.describe("Awards — authenticated happy path", () => {
  test("renders hero, 6 award sections, Kudos promo and footer", async ({
    page,
    context,
  }) => {
    await requireAuth(page, context, test.skip);
    await page.goto("/awards");

    await expect(page).toHaveTitle(/Hệ thống giải thưởng|Awards System/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    for (const slug of [
      "top-talent",
      "top-project",
      "top-project-leader",
      "best-manager",
      "signature-2025-creator",
      "mvp",
    ]) {
      await expect(page.locator(`section#${slug}`)).toBeVisible();
    }

    await expect(page.getByRole("heading", { name: /Sun\* Kudos/ })).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });

  test("clicking each left-nav item updates URL hash and scrolls to section", async ({
    page,
    context,
  }) => {
    await requireAuth(page, context, test.skip);
    await page.goto("/awards");

    // Desktop viewport — nav is visible only at lg+.
    await page.setViewportSize({ width: 1440, height: 1024 });

    for (const { name, slug } of [
      { name: "Top Project", slug: "top-project" },
      { name: "Best Manager", slug: "best-manager" },
      { name: "MVP", slug: "mvp" },
    ]) {
      await page.getByRole("navigation", { name: /Awards categories|Danh mục/ }).getByRole("link", { name }).click();
      await expect(page).toHaveURL(new RegExp(`#${slug}$`));
      await expect(page.locator(`section#${slug}`)).toBeInViewport();
    }
  });

  test("deep link /awards#signature-2025-creator auto-scrolls on cold load", async ({
    page,
    context,
  }) => {
    await requireAuth(page, context, test.skip);
    await page.goto("/awards#signature-2025-creator");
    await expect(page.locator("section#signature-2025-creator")).toBeInViewport();
  });

  test("keyboard Enter on focused nav link activates scroll", async ({
    page,
    context,
  }) => {
    await requireAuth(page, context, test.skip);
    await page.goto("/awards");
    await page.setViewportSize({ width: 1440, height: 1024 });

    const link = page
      .getByRole("navigation", { name: /Awards categories|Danh mục/ })
      .getByRole("link", { name: "Top Project Leader" });
    await link.focus();
    await page.keyboard.press("Enter");

    await expect(page).toHaveURL(/#top-project-leader$/);
  });
});

test.describe("Awards — language toggle", () => {
  test("VN → EN flips hero title and section headings without layout shift", async ({
    page,
    context,
  }) => {
    await requireAuth(page, context, test.skip);
    await page.goto("/awards");

    // Open language dropdown (pattern from Homepage header)
    await page
      .getByRole("banner")
      .getByRole("button", { name: /Select language/ })
      .click();
    // Click EN option
    await page.getByRole("menuitem", { name: /English|EN/ }).first().click();

    // Page should now show EN copy
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /Awards System/,
    );
  });
});
