import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatsBlock } from "../StatsBlock";
import type { Messages } from "@/libs/i18n/getMessages";
import viMessages from "@/messages/vi.json";

const messages = viMessages as unknown as Messages;

describe("<StatsBlock />", () => {
  it("renders 5 stat rows with labels and numeric values", () => {
    render(
      <StatsBlock
        stats={{
          receivedCount: 12,
          sentCount: 3,
          heartsReceived: 44,
          secretBoxesOpened: 2,
          secretBoxesUnopened: 1,
        }}
        messages={messages}
      />,
    );
    const rows = screen.getAllByTestId("kudos-stats-row");
    expect(rows).toHaveLength(5);
    expect(screen.getByText("12")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
    expect(screen.getByText("44")).toBeTruthy();
  });

  it("enables MoQuaCTA when unopened > 0", () => {
    render(
      <StatsBlock
        stats={{
          receivedCount: 0,
          sentCount: 0,
          heartsReceived: 0,
          secretBoxesOpened: 0,
          secretBoxesUnopened: 2,
        }}
        messages={messages}
      />,
    );
    const cta = screen.getByTestId("kudos-mo-qua-cta");
    expect(cta).not.toHaveAttribute("aria-disabled");
    expect(cta).not.toBeDisabled();
  });

  it("disables MoQuaCTA when unopened === 0 (FR-010)", () => {
    render(
      <StatsBlock
        stats={{
          receivedCount: 0,
          sentCount: 0,
          heartsReceived: 0,
          secretBoxesOpened: 5,
          secretBoxesUnopened: 0,
        }}
        messages={messages}
      />,
    );
    const cta = screen.getByTestId("kudos-mo-qua-cta");
    expect(cta).toHaveAttribute("aria-disabled", "true");
    expect(cta).toBeDisabled();
  });
});
