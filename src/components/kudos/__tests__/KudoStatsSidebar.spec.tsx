import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { KudoStatsSidebar } from "../KudoStatsSidebar";
import type { Messages } from "@/libs/i18n/getMessages";
import viMessages from "@/messages/vi.json";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const messages = viMessages as unknown as Messages;

describe("<KudoStatsSidebar />", () => {
  it("composes StatsBlock + LatestGiftRecipients when stats is present", () => {
    render(
      <KudoStatsSidebar
        stats={{
          receivedCount: 1,
          sentCount: 2,
          heartsReceived: 3,
          secretBoxesOpened: 0,
          secretBoxesUnopened: 0,
        }}
        giftees={[
          {
            id: "u1",
            displayName: "An",
            avatarUrl: null,
            giftDescription: "demo hay",
          },
        ]}
        messages={messages}
      />,
    );
    expect(screen.getByTestId("kudos-stats-block")).toBeTruthy();
    expect(screen.getByTestId("kudos-latest-giftees")).toBeTruthy();
  });

  it("renders the inline error block when errored=true", () => {
    render(
      <KudoStatsSidebar
        stats={null}
        giftees={[]}
        errored
        messages={messages}
      />,
    );
    expect(screen.getByTestId("kudos-inline-error")).toBeTruthy();
  });
});
