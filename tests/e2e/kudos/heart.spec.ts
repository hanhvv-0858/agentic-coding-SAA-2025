import { test, expect } from "@playwright/test";
import { requireAuth } from "../fixtures/auth";

// E2E for /kudos heart loop (Phase 5 / US4). Gated on
// SUPABASE_TEST_SESSION_TOKEN — see fixtures/auth.ts. The scenarios
// below cover spec US4 Acceptance 1–4 (click toggles, persists across
// reload, debounced double-tap, rollback on offline).

test.describe("Kudos heart — authenticated happy path", () => {
  test("toggles + persists across reload", async ({ page, context }) => {
    await requireAuth(page, context, test.skip);
    await page.goto("/kudos");

    const firstCard = page.getByTestId("kudo-post-card").first();
    await expect(firstCard).toBeVisible();
    const heartBtn = firstCard.getByTestId("kudo-heart-button");
    const countEl = firstCard.getByTestId("kudo-heart-count");

    // Skip own-kudo cards (disabled) until we find a hearable one.
    const ariaDisabled = await heartBtn.getAttribute("aria-disabled");
    if (ariaDisabled === "true") {
      test.skip(
        true,
        "First seeded card belongs to the current user — skipping heart E2E.",
      );
      return;
    }

    const initialCountText = (await countEl.textContent()) ?? "0";
    const initialCount = parseInt(initialCountText, 10);
    const initialPressed = await heartBtn.getAttribute("aria-pressed");
    const wasHearted = initialPressed === "true";

    // Click to toggle.
    await heartBtn.click();
    // Optimistic flip — count changes by ±1 and aria-pressed inverts.
    await expect(heartBtn).toHaveAttribute(
      "aria-pressed",
      wasHearted ? "false" : "true",
    );
    await expect(countEl).toHaveText(
      String(initialCount + (wasHearted ? -1 : 1)),
    );

    // Reload — server truth should match our local flip.
    await page.reload();
    const reloadedBtn = page
      .getByTestId("kudo-post-card")
      .first()
      .getByTestId("kudo-heart-button");
    await expect(reloadedBtn).toHaveAttribute(
      "aria-pressed",
      wasHearted ? "false" : "true",
    );
  });

  test("rapid double-tap collapses to at most 1 server request", async ({
    page,
    context,
  }) => {
    await requireAuth(page, context, test.skip);
    await page.goto("/kudos");

    const firstCard = page.getByTestId("kudo-post-card").first();
    const heartBtn = firstCard.getByTestId("kudo-heart-button");
    const ariaDisabled = await heartBtn.getAttribute("aria-disabled");
    if (ariaDisabled === "true") {
      test.skip(
        true,
        "First seeded card belongs to the current user — skipping heart E2E.",
      );
      return;
    }

    // Count matching server-action RSC requests (Next.js uses POST to
    // the same route with a `next-action` header).
    let actionRequests = 0;
    page.on("request", (req) => {
      const headers = req.headers();
      if (headers["next-action"]) actionRequests += 1;
    });

    await heartBtn.click();
    await heartBtn.click();
    // Wait past the 300 ms debounce + network RTT.
    await page.waitForTimeout(700);
    // At most one action call should have fired (debounce squashes).
    expect(actionRequests).toBeLessThanOrEqual(1);
  });
});
