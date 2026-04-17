import { test, expect } from "@playwright/test";

// US2 error-state E2E coverage. Each ?error=<code> on /login should render the
// localized banner with role=alert and autofocus so screen readers catch it.

const CASES = [
  { code: "access_denied", vi: "Đăng nhập đã bị huỷ. Vui lòng thử lại." },
  { code: "network", vi: "Không kết nối được tới Google. Hãy thử lại sau." },
  { code: "session_exchange_failed", vi: "Phiên đăng nhập không hợp lệ." },
  { code: "cookie_blocked", vi: "Trình duyệt của bạn đang chặn cookie" },
];

test.describe("Login error banner", () => {
  test.beforeEach(async ({ context }) => {
    // Reset locale to VI — previous sessions (manual browser clicks) may have
    // left a NEXT_LOCALE=en cookie in the shared browser.
    await context.addCookies([
      { name: "NEXT_LOCALE", value: "vi", domain: "localhost", path: "/" },
    ]);
  });

  for (const { code, vi } of CASES) {
    test(`renders VI copy for ?error=${code}`, async ({ page }) => {
      await page.goto(`/login?error=${code}`);
      // Scope to the hero section so we don't match the Next.js dev overlay.
      const banner = page.getByRole("main").getByRole("alert");
      await expect(banner).toBeVisible();
      await expect(banner).toContainText(vi);
    });
  }

  test("ignores unknown error codes", async ({ page }) => {
    await page.goto("/login?error=some_future_error");
    const banner = page.getByRole("main").getByRole("alert");
    await expect(banner).toHaveCount(0);
  });

  test("Escape dismisses the banner", async ({ page }) => {
    await page.goto("/login?error=access_denied");
    const banner = page.getByRole("main").getByRole("alert");
    await expect(banner).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(banner).not.toBeVisible();
  });
});

test.describe("403 page", () => {
  test("/error/403 renders the forbidden message", async ({ page }) => {
    await page.goto("/error/403");
    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      /Không có quyền truy cập|Access denied/,
    );
    await expect(page.getByRole("link", { name: /Quay lại đăng nhập|Back to sign in/ })).toBeVisible();
  });
});
