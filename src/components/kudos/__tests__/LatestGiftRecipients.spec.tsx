import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LatestGiftRecipients } from "../LatestGiftRecipients";
import type { Messages } from "@/libs/i18n/getMessages";
import viMessages from "@/messages/vi.json";
import type { LatestGiftee } from "@/types/kudo";

const messages = viMessages as unknown as Messages;

const giftees: LatestGiftee[] = [
  {
    id: "u1",
    displayName: "An",
    avatarUrl: null,
    giftDescription: "Cảm ơn vì buổi demo tuyệt vời",
  },
  {
    id: "u2",
    displayName: "Bình",
    avatarUrl: null,
    giftDescription: "Onboarding rất tận tình",
  },
  {
    id: "u3",
    displayName: "Cường",
    avatarUrl: null,
    giftDescription: "Fix bug siêu nhanh",
  },
];

describe("<LatestGiftRecipients />", () => {
  it("renders the section title + one row per giftee", () => {
    render(<LatestGiftRecipients giftees={giftees} messages={messages} />);
    expect(
      screen.getByText(messages.kudos.sidebar.latestGifteesTitle),
    ).toBeTruthy();
    const rows = screen.getAllByTestId("kudos-latest-giftee-row");
    expect(rows).toHaveLength(giftees.length);
    expect(screen.getByText("An")).toBeTruthy();
    expect(screen.getByText("Bình")).toBeTruthy();
  });

  it("falls back to the empty-state copy when giftees is empty", () => {
    render(<LatestGiftRecipients giftees={[]} messages={messages} />);
    expect(screen.getByTestId("kudos-empty-state")).toBeTruthy();
  });
});
