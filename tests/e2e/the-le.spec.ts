import { test, expect } from "@playwright/test";
import { requireAuth } from "./fixtures/auth";

// E2E for /the-le. Unauthenticated redirect runs unconditionally;
// authenticated flows are gated on SUPABASE_TEST_SESSION_TOKEN.

test.describe("Thể lệ — unauthenticated", () => {
  test("redirects to /login when no session is present", async ({ page }) => {
    const response = await page.goto("/the-le");
    expect(response?.status()).toBeLessThan(500);
    await expect(page).toHaveURL(/\/login(\?|$)/);
  });
});

test.describe("Thể lệ — authenticated happy path", () => {
  test("renders title, 3 section headings, 6 badge labels and footer buttons", async ({
    page,
    context,
  }) => {
    await requireAuth(page, context, test.skip);
    await page.goto("/the-le");

    await expect(page).toHaveTitle(/Thể lệ|Rules/);
    await expect(page.getByRole("heading", { level: 1, name: /Thể lệ|Rules/ })).toBeVisible();

    const h2s = page.getByRole("heading", { level: 2 });
    await expect(h2s).toHaveCount(3);

    for (const label of [
      "REVIVAL",
      "TOUCH OF LIGHT",
      "STAY GOLD",
      "FLOW TO HORIZON",
      "BEYOND THE BOUNDARY",
      "ROOT FURTHER",
    ]) {
      await expect(page.getByText(label, { exact: true })).toBeVisible();
    }

    await expect(page.getByRole("button", { name: /Đóng|Close/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Viết KUDOS|WRITE KUDOS/ })).toBeVisible();
  });

  test("clicking Đóng navigates back to caller", async ({ page, context }) => {
    await requireAuth(page, context, test.skip);
    await page.goto("/");
    await page.goto("/the-le");
    await page.getByRole("button", { name: /Đóng|Close/ }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test("pressing Escape dismisses the panel", async ({ page, context }) => {
    await requireAuth(page, context, test.skip);
    await page.goto("/");
    await page.goto("/the-le");
    await page.keyboard.press("Escape");
    await expect(page).toHaveURL(/\/$/);
  });

  test("clicking Viết KUDOS navigates to /kudos/new", async ({ page, context }) => {
    await requireAuth(page, context, test.skip);
    await page.goto("/the-le");
    await page.getByRole("link", { name: /Viết KUDOS|WRITE KUDOS/ }).click();
    await expect(page).toHaveURL(/\/kudos\/new$/);
  });
});
