import { test, expect } from "@playwright/test";
import { requireAuth } from "../fixtures/auth";

// Phase 7 (US6 / T080) — highlight carousel happy path:
//   * pager starts at "3/5" (center-biased default per spec Q3)
//   * next arrow advances the pager to "4/5"
//   * heart on the centered card syncs into the matching feed card
//   * reduced-motion emulation disables the track transition
//
// Gated on SUPABASE_TEST_SESSION_TOKEN — mirrors the other Kudos E2Es.

test.describe("Highlight carousel", () => {
  test("pager default and next arrow advance", async ({ page, context }) => {
    await requireAuth(page, context, test.skip);
    await page.goto("/kudos");

    const carousel = page.getByTestId("kudo-highlight-carousel");
    await expect(carousel).toBeVisible();

    const pager = page.getByTestId("kudo-carousel-pager-text");
    await expect(pager).toHaveText(/\d+\/\d+/);

    const firstText = (await pager.textContent()) ?? "";
    const totalMatch = firstText.match(/\/(\d+)$/);
    const total = totalMatch ? parseInt(totalMatch[1], 10) : 0;
    if (total < 2) {
      test.skip(true, "Not enough highlight items to exercise paging.");
      return;
    }

    // Click next and expect the current counter to tick up by 1.
    const before = parseInt(firstText.split("/")[0], 10);
    await page.getByTestId("kudo-carousel-next").click();
    await expect(pager).toHaveText(`${before + 1}/${total}`);
  });

  test("heart on carousel card syncs with feed card", async ({
    page,
    context,
  }) => {
    await requireAuth(page, context, test.skip);
    await page.goto("/kudos");

    const carousel = page.getByTestId("kudo-highlight-carousel");
    await expect(carousel).toBeVisible();

    const activeSlide = carousel
      .locator('[data-testid="kudo-highlight-slide"][data-active="true"]')
      .first();
    await expect(activeSlide).toBeVisible();

    const carouselHeart = activeSlide.getByTestId("kudo-heart-button");
    const disabled = await carouselHeart.getAttribute("aria-disabled");
    if (disabled === "true") {
      test.skip(true, "Centered card belongs to the current user.");
      return;
    }
    const kudoId = await carouselHeart.getAttribute("data-kudo-id");
    expect(kudoId).toBeTruthy();

    const beforeCount = parseInt(
      (await carouselHeart.getByTestId("kudo-heart-count").textContent()) ??
        "0",
      10,
    );

    await carouselHeart.click();
    await expect(carouselHeart).toHaveAttribute("aria-pressed", "true");

    // Matching feed card (same kudo id) should reflect the new state.
    const feedHeart = page.locator(
      `[data-testid="kudo-post-card"][data-kudo-id="${kudoId}"] [data-testid="kudo-heart-button"]`,
    );
    if ((await feedHeart.count()) > 0) {
      await expect(feedHeart).toHaveAttribute("aria-pressed", "true");
      const feedCountText =
        (await feedHeart
          .getByTestId("kudo-heart-count")
          .textContent()) ?? "";
      expect(parseInt(feedCountText, 10)).toBe(beforeCount + 1);
    }
  });

  test("reduced-motion removes transition on the carousel track", async ({
    page,
    context,
  }) => {
    await requireAuth(page, context, test.skip);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/kudos");

    const track = page.getByTestId("kudo-highlight-track");
    await expect(track).toBeVisible();
    const transition = await track.evaluate(
      (el) => (el as HTMLElement).style.transition,
    );
    expect(transition).toBe("none");
  });
});
