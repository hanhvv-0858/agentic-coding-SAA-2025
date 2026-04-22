import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { KudoPostCard } from "../KudoPostCard";
import { reset as resetHeartsCache } from "../hooks/heartsCache";

// Phase 5 (US4) replaced the heart placeholder with a real
// <HeartButton>. Stub the Server Action so these render tests don't
// hit the network. The `data-testid="kudo-heart-button"` assertions
// below replace the Phase 3 `kudo-heart-placeholder` references.
vi.mock("@/app/kudos/actions", () => ({
  toggleKudoHeart: vi.fn(),
}));
// The global setup mocks `next/navigation`; leave it alone so the
// default `useRouter` / `usePathname` / `useSearchParams` stubs apply.

beforeEach(() => resetHeartsCache());
import type { Kudo, KudoUser, Hashtag } from "@/types/kudo";
import type { Messages } from "@/libs/i18n/getMessages";
import viMessages from "@/messages/vi.json";

const messages = viMessages as unknown as Messages;

const user = (id: string, name: string, avatar: string | null = null): KudoUser => ({
  id,
  display_name: name,
  avatar_url: avatar,
  department_id: null,
  department_code: null,
  honour_title: null,
});

const tag = (slug: string, label: string): Hashtag => ({ slug, label });

const baseKudo = (overrides: Partial<Kudo> = {}): Kudo => ({
  id: "k1",
  body: "Cảm ơn bạn rất nhiều vì đã giúp đỡ mình trong dự án.",
  title: null,
  // Fixed local-time — 10:00 on Oct 30 2025 → "10:00 - 10/30/2025".
  created_at: new Date(2025, 9, 30, 10, 0, 0).toISOString(),
  sender_id: "u-sender",
  hearts_count: 3,
  is_anonymous: false,
  anonymous_alias: null,
  sender: user("u-sender", "Alice Sender"),
  recipients: [user("u-rec", "Bob Recipient")],
  hashtags: [tag("dedicated", "Dedicated")],
  images: [],
  has_hearted: false,
  ...overrides,
});

describe("<KudoPostCard />", () => {
  it("renders all 7 slots populated in the happy path", () => {
    render(<KudoPostCard kudo={baseKudo()} messages={messages} locale="vi" />);
    expect(screen.getByTestId("kudo-post-card")).toBeInTheDocument();
    // Sender + recipient
    expect(screen.getByText("Alice Sender")).toBeInTheDocument();
    expect(screen.getByText("Bob Recipient")).toBeInTheDocument();
    // Timestamp
    expect(screen.getByText("10:00 - 10/30/2025")).toBeInTheDocument();
    // Body
    expect(screen.getByTestId("kudo-body").textContent).toContain("Cảm ơn");
    // Hashtag
    expect(screen.getByText("#Dedicated")).toBeInTheDocument();
    // HeartButton w/ count
    const heart = screen.getByTestId("kudo-heart-button");
    expect(heart.textContent).toContain("3");
  });

  it("applies the 5-line clamp class on the body (FR-012)", () => {
    render(<KudoPostCard kudo={baseKudo()} messages={messages} locale="vi" />);
    expect(screen.getByTestId("kudo-body").className).toMatch(/line-clamp-5/);
  });

  it("renders exactly 5 hashtag pills when the kudo has 6", () => {
    const kudo = baseKudo({
      hashtags: [
        tag("a", "A"),
        tag("b", "B"),
        tag("c", "C"),
        tag("d", "D"),
        tag("e", "E"),
        tag("f", "F"),
      ],
    });
    const { container } = render(
      <KudoPostCard kudo={kudo} messages={messages} locale="vi" />,
    );
    expect(container.querySelectorAll("ul[data-testid='kudo-hashtag-row'] li").length).toBe(5);
  });

  it("shows monogram fallback when sender/recipient avatar is null (FR-016)", () => {
    const kudo = baseKudo({
      sender: user("u-sender", "Alice Sender", null),
      recipients: [user("u-rec", "Bob Recipient", null)],
    });
    render(<KudoPostCard kudo={kudo} messages={messages} locale="vi" />);
    const monos = screen.getAllByTestId("kudo-participant-monogram");
    expect(monos.length).toBeGreaterThanOrEqual(2);
  });

  it("renders the filled-heart icon when has_hearted is true", () => {
    const kudo = baseKudo({
      id: "k-hearted",
      has_hearted: true,
      hearts_count: 7,
    });
    render(<KudoPostCard kudo={kudo} messages={messages} locale="vi" />);
    const btn = screen.getByTestId("kudo-heart-button");
    expect(btn.textContent).toContain("7");
    expect(btn).toHaveAttribute("aria-pressed", "true");
  });

  it("does not render an images row when there are no attachments (Phase 3 seed)", () => {
    render(<KudoPostCard kudo={baseKudo()} messages={messages} locale="vi" />);
    expect(screen.queryByTestId("kudo-image-row")).toBeNull();
  });
});
