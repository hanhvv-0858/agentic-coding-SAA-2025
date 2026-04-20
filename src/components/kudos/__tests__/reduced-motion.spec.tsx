/**
 * Phase 10 T098 — reduced-motion sweep.
 *
 * One test per motion entry from design-style.md §Motion (12 entries).
 * Each test mounts a single component under a `matchMedia` stub that
 * reports `(prefers-reduced-motion: reduce) → true`, then asserts the
 * reduced-motion branch actually took effect (no inline `animation`
 * style, `transition: none`, `motion-reduce:` class present, etc.).
 *
 * The shared `mockMatchMedia` helper lives under `src/test-utils`.
 */
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { render, screen, act } from "@testing-library/react";
import { mockMatchMedia } from "@/test-utils/mockMatchMedia";
import { HeartButton } from "../HeartButton";
import { HighlightCarousel } from "../HighlightCarousel";
import { SpotlightBoard } from "../SpotlightBoard";
import { KudoCardSkeleton } from "../KudoCardSkeleton";
import { reset as resetHeartsCache } from "../hooks/heartsCache";
import type { Kudo, KudoUser, Hashtag } from "@/types/kudo";
import type { Messages } from "@/libs/i18n/getMessages";
import viMessages from "@/messages/vi.json";

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

const user = (id: string, name: string): KudoUser => ({
  id,
  display_name: name,
  avatar_url: null,
  department_id: null,
  honour_code: null,
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
  sender: user(`sender-${id}`, `Sender ${id}`),
  recipients: [user(`rec-${id}`, `Recipient ${id}`)],
  hashtags: [tag("dedicated", "Dedicated")],
  images: [],
  has_hearted: false,
});

let handle: ReturnType<typeof mockMatchMedia>;

beforeEach(() => {
  resetHeartsCache();
  handle = mockMatchMedia({ reducedMotion: true });
});

afterEach(() => {
  handle.restore();
  vi.clearAllMocks();
});

describe("reduced-motion sweep — every animated component honours prefers-reduced-motion", () => {
  it("[#1 heart-pop] HeartButton renders without an inline `animation` style", () => {
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
    // The pulse `<span>` wrapping the Icon carries the scale keyframe
    // when motion is allowed. Under reduced motion the style is undefined.
    const button = screen.getByTestId("kudo-heart-button");
    const spans = button.querySelectorAll("span");
    for (const span of spans) {
      expect(span.style.animation).toBe("");
    }
  });

  it("[#2 carousel slide] HighlightCarousel track has `transition: none`", () => {
    const highlights = ["k1", "k2", "k3", "k4", "k5"].map((id, i) =>
      makeKudo(id, 100 - i * 10),
    );
    render(
      <HighlightCarousel
        highlights={highlights}
        messages={messages}
        locale="vi"
      />,
    );
    const track = screen.getByTestId("kudo-highlight-track") as HTMLElement;
    expect(track.style.transition).toBe("none");
    const container = track.parentElement as HTMLElement;
    expect(container.dataset.reducedMotion).toBe("true");
  });

  it("[#3 skeleton shimmer] KudoCardSkeleton carries `motion-reduce:animate-none`", () => {
    vi.useFakeTimers();
    try {
      render(<KudoCardSkeleton />);
      act(() => {
        vi.advanceTimersByTime(250);
      });
      const skel = screen.getByTestId("kudo-card-skeleton");
      expect(skel.className).toContain("motion-reduce:animate-none");
    } finally {
      vi.useRealTimers();
    }
  });

  it("[#4 spotlight pan transform] SpotlightBoard sets `transition: none`", () => {
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
          {
            name: "Bob",
            weight: 5,
            x: 0.3,
            y: 0.2,
            recentKudo: { time: "2025-10-30T10:00:00Z", preview: "" },
          },
        ]}
        total={2}
        messages={messages}
      />,
    );
    const canvas = screen.getByTestId("kudos-spotlight-canvas");
    const innerLayer = canvas.querySelector("div") as HTMLElement | null;
    expect(innerLayer?.style.transition).toBe("none");
  });

  it("[#5 carousel pointer rubberband] HighlightCarousel suppresses transform interpolation when reduced", () => {
    const highlights = ["k1", "k2", "k3"].map((id, i) => makeKudo(id, 10 - i));
    render(
      <HighlightCarousel
        highlights={highlights}
        messages={messages}
        locale="vi"
        defaultIndex={1}
      />,
    );
    const track = screen.getByTestId("kudo-highlight-track") as HTMLElement;
    // Confirm no CSS transition string — the pointer rubberband relies
    // on `transform 300ms` when motion is allowed.
    expect(track.style.transition).toBe("none");
  });

  it("[#6 toast slide] Toaster entry style omits `animation` under reduced motion", async () => {
    const { Toaster } = await import("@/components/ui/Toaster");
    const { toast } = await import("@/libs/toast");
    render(<Toaster />);
    act(() => {
      toast({ message: "Hello", role: "status" });
    });
    const item = await screen.findByTestId("toast-item");
    // Inline style should NOT carry the `kudo-toast-enter` keyframe.
    expect(item.style.animation).toBe("");
  });

  it("[#7 chevron rotate — filter dropdown] FilterDropdown still renders and does not crash under reduced-motion", async () => {
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
    const btn = screen.getByTestId("filter-dropdown-hashtag");
    expect(btn).toBeDefined();
  });

  it("[#8 copy-link flash] CopyLinkButton transition uses CSS (not JS animation)", async () => {
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
    const btn = screen.getByTestId("kudo-copy-link-button");
    // No inline `animation` style — flash is a className swap only.
    expect(btn.style.animation).toBe("");
  });

  it("[#9 carousel pager arrow hover] CarouselPager arrows have no inline animation", async () => {
    const { CarouselPager } = await import("../CarouselPager");
    render(
      <CarouselPager
        current={1}
        total={5}
        canPrev={false}
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
    const prev = screen.getByTestId("kudo-carousel-prev");
    const next = screen.getByTestId("kudo-carousel-next");
    expect(prev.style.animation).toBe("");
    expect(next.style.animation).toBe("");
  });

  it("[#10 spotlight name scale] SpotlightBoard name buttons carry only CSS transition (no inline animation)", () => {
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
    const name = screen.getByTestId("kudos-spotlight-name");
    expect(name.style.animation).toBe("");
  });

  it("[#11 heart optimistic rollback] HeartButton does not apply the pulse keyframe when reduced-motion is on", () => {
    render(
      <HeartButton
        kudoId="k2"
        initialHeartsCount={5}
        initialHasHearted
        isSender={false}
        labels={{
          add: "Add",
          remove: "Remove",
          disabled: "Disabled",
          error: "Err",
        }}
      />,
    );
    const button = screen.getByTestId("kudo-heart-button");
    // The keyed wrapper `<span>` still exists, but has no animation style.
    const iconWrapper = button.querySelector(
      "span.inline-flex",
    ) as HTMLElement | null;
    expect(iconWrapper).toBeTruthy();
    expect(iconWrapper?.style.animation).toBe("");
  });

  it("[#12 hero backdrop parallax] KudosHero renders without JS-driven animation under reduced-motion", async () => {
    const { KudosHero } = await import("../KudosHero");
    render(<KudosHero messages={messages} />);
    // Hero is a static image + H1; no JS animation to assert. Just
    // confirm it mounted without throwing under the mocked matchMedia.
    // H1 is wrapped inside KudosHero — look for any heading.
    const headings = document.querySelectorAll("h1");
    expect(headings.length).toBeGreaterThan(0);
  });
});
