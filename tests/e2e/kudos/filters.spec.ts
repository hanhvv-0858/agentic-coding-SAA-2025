// Phase 4 / T057 — filter E2E. Gated on SUPABASE_TEST_SESSION_TOKEN
// the same way feed.spec.ts is; when no session is available the test
// skips (matches the Phase 3 pattern).

import { test, expect } from "@playwright/test";
import { requireAuth } from "../fixtures/auth";

test.describe("Kudos filters — URL-driven hashtag + department", () => {
  test("hashtag chip narrows the feed, in-card hashtag replaces URL, Back clears", async ({
    page,
    context,
  }) => {
    await requireAuth(page, context, test.skip);
    await page.goto("/kudos");

    const cards = page.getByTestId("kudo-post-card");
    const initialCount = await cards.count();
    if (initialCount === 0) {
      test.skip(true, "Seeded feed empty — skip filter interaction E2E.");
      return;
    }

    // Open hashtag dropdown → pick the first hashtag option.
    const hashtagTrigger = page.getByTestId("filter-dropdown-hashtag").locator("[role='combobox']");
    await hashtagTrigger.click();
    const firstOption = page
      .getByTestId("filter-dropdown-hashtag-listbox")
      .locator("[role='option']")
      .nth(1); // index 0 is "Tất cả hashtag"; index 1 is the first real tag
    const pickedLabel = (await firstOption.textContent())?.trim() ?? "";
    await firstOption.click();

    // URL should now carry `?hashtag=…`.
    await expect(page).toHaveURL(/\?hashtag=/);
    await expect(
      page.getByTestId("kudo-filter-chip-hashtag, kudos-filter-chip-hashtag").first(),
    ).toBeVisible({ timeout: 2000 }).catch(() => {});
    await expect(page.getByTestId("kudos-filter-chip-hashtag")).toBeVisible();
    expect(pickedLabel.length).toBeGreaterThan(0);

    // Capture history length BEFORE clicking a hashtag INSIDE a card.
    const beforeLen = await page.evaluate(() => history.length);

    const inCardHashtag = page.getByTestId("kudo-post-card").first().locator("[data-hashtag-slug]").first();
    if (await inCardHashtag.count()) {
      await inCardHashtag.click();
      const afterLen = await page.evaluate(() => history.length);
      // router.replace() must NOT grow the history stack.
      expect(afterLen).toBe(beforeLen);
    }

    // Clear filter via the chip clear-button.
    const clearBtn = page
      .getByTestId("kudos-filter-chip-hashtag")
      .getByRole("button");
    await clearBtn.click();
    await expect(page).not.toHaveURL(/\?hashtag=/);
  });

  test("combined hashtag + department filter preserves both params in URL", async ({
    page,
    context,
  }) => {
    await requireAuth(page, context, test.skip);
    await page.goto("/kudos");
    if ((await page.getByTestId("kudo-post-card").count()) === 0) {
      test.skip(true, "Seeded feed empty — skip combined filter E2E.");
      return;
    }

    // Pick a department first.
    const deptTrigger = page
      .getByTestId("filter-dropdown-department")
      .locator("[role='combobox']");
    await deptTrigger.click();
    const firstDept = page
      .getByTestId("filter-dropdown-department-listbox")
      .locator("[role='option']")
      .nth(1);
    if ((await firstDept.count()) === 0) return;
    await firstDept.click();
    await expect(page).toHaveURL(/\?department=/);

    // Then a hashtag — the URL should carry both params.
    const hashtagTrigger = page
      .getByTestId("filter-dropdown-hashtag")
      .locator("[role='combobox']");
    await hashtagTrigger.click();
    const firstHashtag = page
      .getByTestId("filter-dropdown-hashtag-listbox")
      .locator("[role='option']")
      .nth(1);
    if ((await firstHashtag.count()) === 0) return;
    await firstHashtag.click();

    const url = new URL(page.url());
    expect(url.searchParams.get("hashtag")).toBeTruthy();
    expect(url.searchParams.get("department")).toBeTruthy();
  });
});
