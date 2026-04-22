/**
 * Phase 10 T099 — focus-visible ring audit.
 *
 * For every interactive element in the kudos surface, assert the
 * `focus-visible:outline` class trio is present. This is a codified
 * version of the manual a11y audit: the test file doubles as a
 * regression guard so future refactors can't silently drop the ring.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { Messages } from "@/libs/i18n/getMessages";
import viMessages from "@/messages/vi.json";
import type { Kudo, KudoUser, Hashtag } from "@/types/kudo";

vi.mock("@/app/kudos/actions", () => ({
  toggleKudoHeart: vi.fn(),
}));

vi.mock("@/libs/analytics/track", () => ({
  track: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/kudos",
  useSearchParams: () => new URLSearchParams(),
}));

const messages = viMessages as unknown as Messages;

const FOCUS_RING_TOKENS = [
  "focus-visible:outline",
  "focus-visible:outline-2",
  "focus-visible:outline-offset-2",
];

function expectFocusRing(el: HTMLElement, component: string) {
  const cls = el.className;
  for (const token of FOCUS_RING_TOKENS) {
    expect(
      cls.includes(token),
      `${component}: expected class "${token}" to be present on ${el.tagName.toLowerCase()}. Got: ${cls}`,
    ).toBe(true);
  }
  // Must use the cream accent colour (design-style §A11y).
  expect(
    /focus-visible:outline-(?:\[var\(--color-accent-cream\)\]|\[var\(--color-accent-cream,[^\]]+\)\])/.test(
      cls,
    ),
    `${component}: expected accent-cream outline colour. Got: ${cls}`,
  ).toBe(true);
}

const user = (id: string, name: string): KudoUser => ({
  id,
  display_name: name,
  avatar_url: null,
  department_id: null,
  department_code: null,
  honour_title: null,
});

const tag = (slug: string, label: string): Hashtag => ({ slug, label });

const makeKudo = (id: string, hearts = 0): Kudo => ({
  id,
  body: `Body for ${id}`,
  title: null,
  created_at: new Date(2025, 9, 30, 10, 0, 0).toISOString(),
  sender_id: `sender-${id}`,
  hearts_count: hearts,
  is_anonymous: false,
  anonymous_alias: null,
  sender: user(`sender-${id}`, `Sender ${id}`),
  recipients: [user(`rec-${id}`, `Recipient ${id}`)],
  hashtags: [tag("dedicated", "Dedicated")],
  images: [],
  has_hearted: false,
});

describe("focus-visible audit — every interactive kudos control carries the ring", () => {
  it("HeartButton has the cream focus-visible outline", async () => {
    const { HeartButton } = await import("../HeartButton");
    render(
      <HeartButton
        kudoId="k1"
        initialHeartsCount={0}
        initialHasHearted={false}
        isSender={false}
        labels={{
          add: "Add",
          remove: "Remove",
          disabled: "Disabled",
          error: "Err",
        }}
      />,
    );
    expectFocusRing(screen.getByTestId("kudo-heart-button"), "HeartButton");
  });

  it("CopyLinkButton has the cream focus-visible outline", async () => {
    const { CopyLinkButton } = await import("../CopyLinkButton");
    render(
      <CopyLinkButton
        kudoId="k1"
        labels={{
          copy: "Copy",
          copied: "Copied",
          toast: "Link copied",
          errorToast: "Could not copy",
        }}
      />,
    );
    expectFocusRing(
      screen.getByTestId("kudo-copy-link-button"),
      "CopyLinkButton",
    );
  });

  it("FilterDropdown trigger has the cream focus-visible outline", async () => {
    const { FilterDropdown } = await import("../FilterDropdown");
    render(
      <FilterDropdown
        kind="hashtag"
        value={null}
        options={[{ value: "dedicated", label: "Dedicated" }]}
        onSelect={() => {}}
        messages={messages}
      />,
    );
    const wrapper = screen.getByTestId("filter-dropdown-hashtag");
    const trigger = wrapper.querySelector(
      "button[role='combobox']",
    ) as HTMLElement;
    expectFocusRing(trigger, "FilterDropdown");
  });

  it("CarouselPager prev + next arrows have the cream focus-visible outline", async () => {
    const { CarouselPager } = await import("../CarouselPager");
    render(
      <CarouselPager
        current={1}
        total={5}
        canPrev
        canNext
        onPrev={() => {}}
        onNext={() => {}}
        labels={{
          prev: "Prev",
          next: "Next",
          pagerTemplate: "{current}/{total}",
        }}
      />,
    );
    expectFocusRing(
      screen.getByTestId("kudo-carousel-prev"),
      "CarouselPager.prev",
    );
    expectFocusRing(
      screen.getByTestId("kudo-carousel-next"),
      "CarouselPager.next",
    );
  });

  it("HighlightCarousel slide region has the cream focus-visible outline", async () => {
    const { HighlightCarousel } = await import("../HighlightCarousel");
    render(
      <HighlightCarousel
        highlights={["k1", "k2", "k3"].map((id, i) => makeKudo(id, 10 - i))}
        messages={messages}
        locale="vi"
      />,
    );
    const track = screen.getByTestId("kudo-highlight-track");
    const region = track.parentElement as HTMLElement;
    expectFocusRing(region, "HighlightCarousel.region");
  });

  it("SpotlightBoard canvas + zoom controls carry the focus ring", async () => {
    const { SpotlightBoard } = await import("../SpotlightBoard");
    render(
      <SpotlightBoard
        recipients={[
          {
            name: "Alice",
            weight: 10,
            x: 0.5,
            y: 0.5,
            recentKudo: { time: "2025-10-30T10:00:00Z", preview: "" },
          },
        ]}
        total={1}
        messages={messages}
      />,
    );
    // Canvas group (tabIndex=0) — expect the offset-[-4px] style ring.
    const canvas = screen.getByTestId("kudos-spotlight-canvas") as HTMLElement;
    expect(canvas.className).toContain("focus-visible:outline-2");
    expect(canvas.className).toContain(
      "focus-visible:outline-[var(--color-accent-cream)]",
    );
    expectFocusRing(
      screen.getByTestId("kudos-spotlight-zoom-in"),
      "Spotlight.zoomIn",
    );
    expectFocusRing(
      screen.getByTestId("kudos-spotlight-zoom-out"),
      "Spotlight.zoomOut",
    );
  });

  it("KudoHashtagRow chips expose focus-visible outline (button semantics)", async () => {
    const { KudoHashtagRow } = await import("../KudoHashtagRow");
    render(
      <KudoHashtagRow
        hashtags={[tag("dedicated", "Dedicated"), tag("fun", "Fun")]}
      />,
    );
    const chips = screen.getAllByRole("button");
    expect(chips.length).toBeGreaterThan(0);
    for (const chip of chips) {
      expectFocusRing(chip, "KudoHashtagRow.chip");
    }
  });
});
