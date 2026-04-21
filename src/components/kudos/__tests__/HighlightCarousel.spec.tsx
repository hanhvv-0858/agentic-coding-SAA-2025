import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { HighlightCarousel } from "../HighlightCarousel";
import { reset as resetHeartsCache, set as setHeart } from "../hooks/heartsCache";
import type { Kudo, KudoUser, Hashtag } from "@/types/kudo";
import type { Messages } from "@/libs/i18n/getMessages";
import viMessages from "@/messages/vi.json";

vi.mock("@/app/kudos/actions", () => ({
  toggleKudoHeart: vi.fn(),
}));

const trackMock = vi.fn();
vi.mock("@/libs/analytics/track", () => ({
  track: (evt: unknown) => trackMock(evt),
}));

const messages = viMessages as unknown as Messages;

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
  sender: user(`sender-${id}`, `Sender ${id}`),
  recipients: [user(`rec-${id}`, `Recipient ${id}`)],
  hashtags: [tag("dedicated", "Dedicated")],
  images: [],
  has_hearted: false,
});

const fiveKudos = (): Kudo[] =>
  ["k1", "k2", "k3", "k4", "k5"].map((id, i) => makeKudo(id, 100 - i * 10));

beforeEach(() => {
  resetHeartsCache();
  trackMock.mockReset();
});

afterEach(() => {
  // Clean up any stray matchMedia stubs.
});

describe("<HighlightCarousel />", () => {
  it("renders all 5 slides with slide 3 (index 2) active by default", () => {
    render(
      <HighlightCarousel
        highlights={fiveKudos()}
        messages={messages}
        locale="vi"
      />,
    );
    const slides = screen.getAllByTestId("kudo-highlight-slide");
    expect(slides).toHaveLength(5);
    // Default index 2 → pager "3/5".
    expect(screen.getByTestId("kudo-carousel-pager-text").textContent).toBe(
      "3/5",
    );
    const active = slides.find((s) => s.dataset.active === "true");
    expect(active?.dataset.index).toBe("2");
  });

  it("next arrow advances active index; pager updates; emits kudos_carousel_scroll", () => {
    render(
      <HighlightCarousel
        highlights={fiveKudos()}
        messages={messages}
        locale="vi"
      />,
    );
    fireEvent.click(screen.getByTestId("kudo-carousel-next"));
    expect(screen.getByTestId("kudo-carousel-pager-text").textContent).toBe(
      "4/5",
    );
    expect(trackMock).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "kudos_carousel_scroll",
        from_index: 2,
        to_index: 3,
      }),
    );
  });

  it("disables next arrow on the last slide (no-cycle)", () => {
    render(
      <HighlightCarousel
        highlights={fiveKudos()}
        messages={messages}
        locale="vi"
        defaultIndex={4}
      />,
    );
    const next = screen.getByTestId("kudo-carousel-next");
    expect(next).toHaveAttribute("aria-disabled", "true");
    expect(next).toBeDisabled();
    fireEvent.click(next);
    expect(screen.getByTestId("kudo-carousel-pager-text").textContent).toBe(
      "5/5",
    );
  });

  it("disables prev arrow on the first slide", () => {
    render(
      <HighlightCarousel
        highlights={fiveKudos()}
        messages={messages}
        locale="vi"
        defaultIndex={0}
      />,
    );
    const prev = screen.getByTestId("kudo-carousel-prev");
    expect(prev).toHaveAttribute("aria-disabled", "true");
  });

  it("supports ArrowLeft / ArrowRight keyboard navigation", () => {
    render(
      <HighlightCarousel
        highlights={fiveKudos()}
        messages={messages}
        locale="vi"
      />,
    );
    const region = screen.getByTestId("kudo-highlight-carousel");
    const track = region.querySelector("[tabindex='0']") as HTMLElement;
    expect(track).toBeTruthy();
    fireEvent.keyDown(track, { key: "ArrowRight" });
    expect(screen.getByTestId("kudo-carousel-pager-text").textContent).toBe(
      "4/5",
    );
    fireEvent.keyDown(track, { key: "ArrowLeft" });
    expect(screen.getByTestId("kudo-carousel-pager-text").textContent).toBe(
      "3/5",
    );
    fireEvent.keyDown(track, { key: "Home" });
    expect(screen.getByTestId("kudo-carousel-pager-text").textContent).toBe(
      "1/5",
    );
    fireEvent.keyDown(track, { key: "End" });
    expect(screen.getByTestId("kudo-carousel-pager-text").textContent).toBe(
      "5/5",
    );
  });

  it("gracefully handles < 5 items", () => {
    const three = [makeKudo("a", 30), makeKudo("b", 20), makeKudo("c", 10)];
    render(
      <HighlightCarousel
        highlights={three}
        messages={messages}
        locale="vi"
      />,
    );
    expect(screen.getAllByTestId("kudo-highlight-slide")).toHaveLength(3);
    // defaultIndex 2 clamps within bounds → shows 3/3.
    expect(screen.getByTestId("kudo-carousel-pager-text").textContent).toBe(
      "3/3",
    );
  });

  it("renders nothing when highlights is empty", () => {
    const { container } = render(
      <HighlightCarousel highlights={[]} messages={messages} locale="vi" />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("heart state syncs with shared heartsCache — seeding the cache updates the carousel card", () => {
    render(
      <HighlightCarousel
        highlights={fiveKudos()}
        messages={messages}
        locale="vi"
      />,
    );
    // Carousel card for k3 starts at hearts_count 80.
    const k3Heart = screen
      .getAllByTestId("kudo-heart-button")
      .find((b) => b.getAttribute("data-kudo-id") === "k3");
    expect(k3Heart).toBeTruthy();
    // Feed flipping the same id updates heartsCache → carousel reflects
    // the new state (FR-009).
    act(() => {
      setHeart("k3", { count: 999, hearted: true });
    });
    expect(k3Heart?.textContent).toContain("999");
    expect(k3Heart).toHaveAttribute("aria-pressed", "true");
  });

  it("under reduced motion, track has no transition", () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = vi.fn().mockImplementation((q: string) => ({
      matches: q.includes("reduce"),
      media: q,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      onchange: null,
      dispatchEvent: () => false,
    })) as typeof window.matchMedia;

    try {
      render(
        <HighlightCarousel
          highlights={fiveKudos()}
          messages={messages}
          locale="vi"
        />,
      );
      const track = screen.getByTestId("kudo-highlight-track") as HTMLElement;
      expect(track.style.transition).toBe("none");
    } finally {
      window.matchMedia = originalMatchMedia;
    }
  });
});
