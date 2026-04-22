import { test, expect } from "@playwright/test";

// E2E for /countdown — public route, no auth required. Behaviour depends on
// NEXT_PUBLIC_SITE_LAUNCH_AT being set to a future timestamp at build/dev
// time. These tests assume the dev server has a future value (which is the
// default in .env.local per README guidance).

test.describe("Countdown — public render", () => {
  test("renders the prelaunch headline and three unit labels", async ({ page }) => {
    const response = await page.goto("/countdown");
    if (response && response.status() >= 300 && response.status() < 400) {
      // If the env is already in the past on the dev machine, the server
      // redirects to /login — skip the happy-path assertions and flag it.
      test.skip(true, "Env NEXT_PUBLIC_SITE_LAUNCH_AT is in the past — cannot test prelaunch render");
    }

    // Headline — checked by role=heading level 1.
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Three unit labels (English or Vietnamese both render "DAYS/HOURS/MINUTES"
    // because the source strings in vi.json and en.json are identical).
    await expect(page.getByText("DAYS", { exact: true })).toBeVisible();
    await expect(page.getByText("HOURS", { exact: true })).toBeVisible();
    await expect(page.getByText("MINUTES", { exact: true })).toBeVisible();

    // Timer region with aria-live announcement.
    await expect(page.getByRole("timer")).toHaveAttribute("aria-live", "polite");
  });

  test("middleware rewrites `/` to the prelaunch content without changing URL", async ({ page }) => {
    const response = await page.goto("/");
    if (response && response.status() >= 300 && response.status() < 400) {
      test.skip(true, "Env NEXT_PUBLIC_SITE_LAUNCH_AT is in the past");
    }

    // NextResponse.rewrite keeps the URL as /, but the body is the prelaunch page.
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("timer")).toBeVisible();
  });
});
