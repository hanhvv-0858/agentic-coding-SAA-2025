import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { PrelaunchCountdownTile } from "../PrelaunchCountdownTile";

describe("<PrelaunchCountdownTile />", () => {
  it("renders the digit in a glass-style tile", () => {
    const { container, getByText } = render(<PrelaunchCountdownTile digit="7" />);
    expect(getByText("7")).toBeInTheDocument();
    const tile = container.querySelector("span");
    expect(tile?.className).toMatch(/rounded-xl/);
    expect(tile?.className).toMatch(/border/);
    expect(tile?.className).toMatch(/backdrop-blur-\[24px\]/);
  });

  it("marks the digit as decorative (screen readers rely on parent timer label)", () => {
    const { container } = render(<PrelaunchCountdownTile digit="0" />);
    const digitSpan = container.querySelector("span > span");
    expect(digitSpan).toHaveAttribute("aria-hidden", "true");
  });
});
