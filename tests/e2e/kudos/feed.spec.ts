import { test, expect } from "@playwright/test";
import { requireAuth } from "../fixtures/auth";

// E2E for /kudos (Phase 3 / US1). Unauthenticated redirect runs
// unconditionally; authenticated happy path is gated on the
// SUPABASE_TEST_SESSION_TOKEN env var (see fixtures/auth.ts).

test.describe("Kudos feed — unauthenticated", () => {
  test("redirects to /login when no session is present", async ({ page }) => {
    const response = await page.goto("/kudos");
    expect(response?.status()).toBeLessThan(500);
    await expect(page).toHaveURL(/\/login(\?|$)/);
  });
});

test.describe("Kudos feed — authenticated happy path", () => {
  test("renders hero + AllKudosHeader + ≥ 4 kudo cards (or empty-state copy)", async ({
    page,
    context,
  }) => {
    await requireAuth(page, context, test.skip);
    await page.goto("/kudos");

    // H1 (FR-018) lives in KudosHero.
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // ALL KUDOS section header (`<h2>`).
    await expect(
      page.getByRole("heading", { level: 2, name: /ALL KUDOS/i }),
    ).toBeVisible();

    // Either ≥ 4 cards (seeded) or the empty-state copy (unseeded).
    const cards = page.getByTestId("kudo-post-card");
    const cardCount = await cards.count();
    if (cardCount === 0) {
      await expect(
        page.getByText("Hiện tại chưa có Kudos nào.").first(),
      ).toBeVisible();
    } else {
      expect(cardCount).toBeGreaterThanOrEqual(1);
      const first = cards.first();
      // Each card has sender + recipient (two participant blocks).
      await expect(
        first.getByTestId("kudo-participant-avatar").first(),
      ).toBeVisible();
      // Body + heart placeholder always present.
      await expect(first.getByTestId("kudo-body")).toBeVisible();
      await expect(first.getByTestId("kudo-heart-button")).toBeVisible();
    }
  });
});
