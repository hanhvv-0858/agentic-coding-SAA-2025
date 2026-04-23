// T123 — HonourTooltip tests. Controlled component — we pass
// `open={true}` + stubbed position/handlers to exercise render paths.

import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { HonourTooltip } from "../HonourTooltip";
import type { HonourTier } from "../honourPills";
import type { Messages } from "@/libs/i18n/getMessages";
import viMessages from "@/messages/vi.json";

const messages = viMessages as unknown as Messages;

const stubPosition = { left: 0, top: 0, placement: "below" as const };
const stubHandlers = {
  onPointerEnter: () => {},
  onPointerLeave: () => {},
};

describe("HonourTooltip", () => {
  it.each<[HonourTier, keyof (typeof messages)["kudos"]["honour"]["tooltip"]]>([
    ["New Hero", "newHero"],
    ["Rising Hero", "risingHero"],
    ["Super Hero", "superHero"],
    ["Legend Hero", "legendHero"],
  ])("renders %s copy when open", (tier, tierKey) => {
    render(
      <HonourTooltip
        tier={tier}
        open
        position={stubPosition}
        tooltipHandlers={stubHandlers}
        messages={messages}
      />,
    );
    const tooltip = screen.getByTestId("kudo-honour-tooltip");
    const expected = `${messages.kudos.honour.tooltip[tierKey].threshold} ${messages.kudos.honour.tooltip[tierKey].flavor}`;
    expect(tooltip.textContent).toContain(expected);
  });

  it("sets role='tooltip' on the surface", () => {
    render(
      <HonourTooltip
        tier="New Hero"
        open
        position={stubPosition}
        tooltipHandlers={stubHandlers}
        messages={messages}
      />,
    );
    expect(
      screen.getByTestId("kudo-honour-tooltip").getAttribute("role"),
    ).toBe("tooltip");
  });

  it("marks data-tooltip-surface so outside-clicks ignore it", () => {
    render(
      <HonourTooltip
        tier="Rising Hero"
        open
        position={stubPosition}
        tooltipHandlers={stubHandlers}
        messages={messages}
      />,
    );
    expect(
      screen.getByTestId("kudo-honour-tooltip").getAttribute("data-tooltip-surface"),
    ).toBe("true");
  });

  it("encodes tier via data-tier attribute", () => {
    render(
      <HonourTooltip
        tier="Legend Hero"
        open
        position={stubPosition}
        tooltipHandlers={stubHandlers}
        messages={messages}
      />,
    );
    expect(
      screen.getByTestId("kudo-honour-tooltip").getAttribute("data-tier"),
    ).toBe("legendHero");
  });

  it("renders nothing when open={false}", () => {
    render(
      <HonourTooltip
        tier="New Hero"
        open={false}
        position={stubPosition}
        tooltipHandlers={stubHandlers}
        messages={messages}
      />,
    );
    expect(screen.queryByTestId("kudo-honour-tooltip")).toBeNull();
  });
});
