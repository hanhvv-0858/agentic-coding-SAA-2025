import { test, expect } from "@playwright/test";
import { requireAuth } from "../fixtures/auth";

// E2E for /kudos Copy Link button (Phase 6 / US5).
// Spec: FR-013 reconciliation — inline label swap + global toast.
// Gated on SUPABASE_TEST_SESSION_TOKEN — see fixtures/auth.ts.

test.describe("Kudos copy-link — authenticated", () => {
  test.beforeEach(async ({ context }) => {
    // Clipboard API requires explicit grants on Chromium.
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  });

  test("copies the kudo URL to the clipboard + shows inline confirmation + global toast", async ({
    page,
    context,
  }) => {
    await requireAuth(page, context, test.skip);
    await page.goto("/kudos");

    const firstCard = page.getByTestId("kudo-post-card").first();
    await expect(firstCard).toBeVisible();
    const kudoId = await firstCard.getAttribute("data-kudo-id");
    expect(kudoId).toBeTruthy();

    const copyBtn = firstCard.getByTestId("kudo-copy-link-button");
    const copyLabel = firstCard.getByTestId("kudo-copy-link-label");
    const idleLabel = (await copyLabel.textContent()) ?? "";

    await copyBtn.click();

    // 1. Clipboard contains `<origin>/kudos/<id>`.
    const clipboardText = await page.evaluate(() =>
      navigator.clipboard.readText(),
    );
    expect(clipboardText).toContain(`/kudos/${kudoId}`);

    // 2. Inline label flips to the "copied" state immediately.
    await expect(copyBtn).toHaveAttribute("data-copied", "true");
    const copiedLabel = (await copyLabel.textContent()) ?? "";
    expect(copiedLabel).not.toBe(idleLabel);

    // 3. Global toast region shows a status toast.
    const toast = page.getByTestId("toast-item").first();
    await expect(toast).toBeVisible();
    await expect(toast).toHaveAttribute("role", "status");

    // 4. Inline label cycles back to idle after ~1.5 s.
    await page.waitForTimeout(1700);
    await expect(copyBtn).toHaveAttribute("data-copied", "false");
    await expect(copyLabel).toHaveText(idleLabel);
  });
});
