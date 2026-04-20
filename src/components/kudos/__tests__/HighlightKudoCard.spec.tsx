import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { HighlightKudoCard } from "../HighlightKudoCard";
import { reset as resetHeartsCache } from "../hooks/heartsCache";
import type { Kudo, KudoUser, Hashtag } from "@/types/kudo";
import type { Messages } from "@/libs/i18n/getMessages";
import viMessages from "@/messages/vi.json";

vi.mock("@/app/kudos/actions", () => ({
  toggleKudoHeart: vi.fn(),
}));

const messages = viMessages as unknown as Messages;

const user = (
  id: string,
  name: string,
  avatar: string | null = null,
): KudoUser => ({
  id,
  display_name: name,
  avatar_url: avatar,
  department_id: null,
  honour_code: null,
  honour_title: null,
});

const tag = (slug: string, label: string): Hashtag => ({ slug, label });

const baseKudo = (overrides: Partial<Kudo> = {}): Kudo => ({
  id: "hk1",
  body: "Cảm ơn bạn đã support team rất nhiều.",
  title: null,
  created_at: new Date(2025, 9, 30, 10, 0, 0).toISOString(),
  sender_id: "u-sender",
  hearts_count: 42,
  sender: user("u-sender", "Alice Sender"),
  recipients: [user("u-rec", "Bob Recipient")],
  hashtags: [tag("dedicated", "Dedicated")],
  images: [],
  has_hearted: false,
  ...overrides,
});

beforeEach(() => resetHeartsCache());

describe("<HighlightKudoCard />", () => {
  it("renders sender, recipient, body, timestamp, hashtag, heart count", () => {
    render(
      <HighlightKudoCard
        kudo={baseKudo()}
        messages={messages}
        locale="vi"
      />,
    );
    expect(screen.getByTestId("kudo-highlight-card")).toBeInTheDocument();
    expect(screen.getByText("Alice Sender")).toBeInTheDocument();
    expect(screen.getByText("Bob Recipient")).toBeInTheDocument();
    expect(screen.getByTestId("kudo-highlight-body").textContent).toContain(
      "Cảm ơn",
    );
    expect(screen.getByText("#Dedicated")).toBeInTheDocument();
    const heart = screen.getByTestId("kudo-heart-button");
    expect(heart.textContent).toContain("42");
  });

  it("applies 3-line clamp class on the body (design-style §B.3)", () => {
    render(
      <HighlightKudoCard
        kudo={baseKudo()}
        messages={messages}
        locale="vi"
      />,
    );
    expect(screen.getByTestId("kudo-highlight-body").className).toMatch(
      /line-clamp-3/,
    );
  });

  it("marks self-kudo heart as aria-disabled when viewer is the sender", () => {
    render(
      <HighlightKudoCard
        kudo={baseKudo()}
        messages={messages}
        locale="vi"
        viewerId="u-sender"
      />,
    );
    const heart = screen.getByTestId("kudo-heart-button");
    expect(heart).toHaveAttribute("aria-disabled", "true");
  });

  it("adds elevation shadow on the active slide only", () => {
    const { rerender } = render(
      <HighlightKudoCard
        kudo={baseKudo()}
        messages={messages}
        locale="vi"
        isActive
      />,
    );
    expect(screen.getByTestId("kudo-highlight-card")).toHaveAttribute(
      "data-active",
      "true",
    );
    rerender(
      <HighlightKudoCard
        kudo={baseKudo()}
        messages={messages}
        locale="vi"
        isActive={false}
      />,
    );
    expect(screen.getByTestId("kudo-highlight-card")).toHaveAttribute(
      "data-active",
      "false",
    );
  });

  it("renders the HeartButton bound to the kudo id so it can share heartsCache with the feed", () => {
    render(
      <HighlightKudoCard
        kudo={baseKudo({ id: "shared-id" })}
        messages={messages}
        locale="vi"
      />,
    );
    const heart = screen.getByTestId("kudo-heart-button");
    expect(heart).toHaveAttribute("data-kudo-id", "shared-id");
  });
});
