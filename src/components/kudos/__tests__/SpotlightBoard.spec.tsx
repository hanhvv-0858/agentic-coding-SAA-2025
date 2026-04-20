import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SpotlightBoard } from "../SpotlightBoard";
import type { Messages } from "@/libs/i18n/getMessages";
import viMessages from "@/messages/vi.json";
import type { SpotlightRecipient } from "@/types/kudo";

const trackMock = vi.fn();
vi.mock("@/libs/analytics/track", () => ({
  track: (evt: unknown) => trackMock(evt),
}));

const messages = viMessages as unknown as Messages;

const recipients: SpotlightRecipient[] = [
  {
    name: "An Nguyễn",
    x: 0.2,
    y: 0.3,
    weight: 10,
    recentKudo: { time: "2026-01-01T00:00:00Z", preview: "Cảm ơn" },
  },
  {
    name: "Bình Trần",
    x: 0.6,
    y: 0.4,
    weight: 5,
    recentKudo: { time: "2026-01-02T00:00:00Z", preview: "Tuyệt" },
  },
  {
    name: "Cường Lê",
    x: 0.4,
    y: 0.7,
    weight: 1,
    recentKudo: { time: "2026-01-03T00:00:00Z", preview: "Ok" },
  },
];

beforeEach(() => {
  trackMock.mockReset();
});

describe("<SpotlightBoard />", () => {
  it("renders the counter with total + suffix (aria-live polite)", () => {
    render(
      <SpotlightBoard recipients={recipients} total={16} messages={messages} />,
    );
    const counter = screen.getByTestId("kudos-spotlight-counter");
    expect(counter.textContent).toContain("16");
    expect(counter.textContent).toContain(
      messages.kudos.spotlight.counterSuffix,
    );
    expect(counter.getAttribute("aria-live")).toBe("polite");
  });

  it("renders a name button for each recipient with aria-label", () => {
    render(
      <SpotlightBoard recipients={recipients} total={16} messages={messages} />,
    );
    const buttons = screen.getAllByTestId("kudos-spotlight-name");
    expect(buttons).toHaveLength(recipients.length);
    expect(buttons[0].getAttribute("aria-label")).toMatch(/Kudos/);
  });

  it("filters non-matching names when search is typed", () => {
    render(
      <SpotlightBoard recipients={recipients} total={16} messages={messages} />,
    );
    const search = screen.getByTestId(
      "kudos-spotlight-search",
    ) as HTMLInputElement;
    fireEvent.change(search, { target: { value: "An" } });
    const buttons = screen.getAllByTestId("kudos-spotlight-name");
    const matching = buttons.filter(
      (b) => b.getAttribute("data-match") === "true",
    );
    expect(matching.length).toBeGreaterThanOrEqual(1);
    const nonMatching = buttons.filter(
      (b) => b.getAttribute("data-match") === "false",
    );
    expect(nonMatching.length).toBeGreaterThanOrEqual(1);
  });

  it("renders mobile fallback list with top-20 recipients sorted by weight", () => {
    render(
      <SpotlightBoard recipients={recipients} total={16} messages={messages} />,
    );
    const list = screen.getByTestId("kudos-spotlight-mobile-list");
    const items = list.querySelectorAll(
      "[data-testid='kudos-spotlight-mobile-item']",
    );
    expect(items).toHaveLength(recipients.length);
    // First row should be the highest-weight recipient.
    expect(items[0].textContent).toContain("An Nguyễn");
  });

  it("zoom-in button scales state", () => {
    render(
      <SpotlightBoard recipients={recipients} total={16} messages={messages} />,
    );
    const canvas = screen.getByTestId("kudos-spotlight-canvas");
    const inner = canvas.firstElementChild as HTMLElement;
    const baseline = inner.style.transform;
    fireEvent.click(screen.getByTestId("kudos-spotlight-zoom-in"));
    expect(inner.style.transform).not.toBe(baseline);
  });

  it("renders empty state when recipients is empty", () => {
    render(<SpotlightBoard recipients={[]} total={0} messages={messages} />);
    expect(screen.getByTestId("kudos-spotlight-empty")).toBeTruthy();
  });
});
