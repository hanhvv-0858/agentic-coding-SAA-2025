import { test, expect } from "@playwright/test";

test.describe("Language toggle (US3)", () => {
  test.beforeEach(async ({ context }) => {
    await context.addCookies([
      { name: "NEXT_LOCALE", value: "vi", domain: "localhost", path: "/" },
    ]);
  });

  test("switches from VI to EN and persists via NEXT_LOCALE cookie", async ({
    page,
    context,
  }) => {
    await page.goto("/login");

    // Default is VI.
    await expect(page.getByRole("button", { name: /ĐĂNG NHẬP với Google/ })).toBeVisible();

    // Open dropdown.
    await page.getByRole("button", { name: /Chọn ngôn ngữ, hiện tại tiếng Việt/ }).click();
    await expect(page.getByRole("menu")).toBeVisible();

    // Click English.
    await page.getByRole("menuitemradio", { name: "English" }).click();

    // Hero copy switches to EN; toggle label becomes EN.
    await expect(page.getByText("Start your journey with SAA 2025.")).toBeVisible();
    await expect(page.getByRole("button", { name: /Select language, current English/ })).toBeVisible();

    // Cookie persisted.
    const cookies = await context.cookies();
    const locale = cookies.find((c) => c.name === "NEXT_LOCALE");
    expect(locale?.value).toBe("en");

    // Reload — still EN.
    await page.reload();
    await expect(page.getByText("Start your journey with SAA 2025.")).toBeVisible();
  });

  test("keyboard: ArrowDown opens menu, Escape closes", async ({ page }) => {
    await page.goto("/login");
    const toggle = page.getByRole("button", { name: /Chọn ngôn ngữ/ });
    await toggle.focus();
    await page.keyboard.press("ArrowDown");
    await expect(page.getByRole("menu")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("menu")).not.toBeVisible();
  });
});
