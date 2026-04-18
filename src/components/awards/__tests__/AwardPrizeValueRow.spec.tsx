import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AwardPrizeValueRow } from "../AwardPrizeValueRow";

describe("<AwardPrizeValueRow />", () => {
  const baseProps = {
    icon: "diamond" as const,
    label: "Giá trị giải thưởng:",
  };

  it("renders the VND amount formatted with vi-VN thousand separators", () => {
    render(<AwardPrizeValueRow {...baseProps} amountVnd={7_000_000} />);
    expect(screen.getByText(/7\.000\.000 VNĐ/)).toBeInTheDocument();
  });

  it("renders the trailing suffix when `suffix` prop is provided (FR-007 count>1 case)", () => {
    render(
      <AwardPrizeValueRow
        {...baseProps}
        amountVnd={7_000_000}
        suffix="cho mỗi giải thưởng"
      />,
    );
    expect(screen.getByText("cho mỗi giải thưởng")).toBeInTheDocument();
  });

  it("omits the trailing suffix when `suffix` prop is undefined (FR-007 count=1 single-value case)", () => {
    render(<AwardPrizeValueRow {...baseProps} amountVnd={10_000_000} />);
    // Only the label + amount should be present; no "cho mỗi giải thưởng" or similar
    expect(screen.getByText("Giá trị giải thưởng:")).toBeInTheDocument();
    expect(screen.getByText(/10\.000\.000 VNĐ/)).toBeInTheDocument();
    expect(screen.queryByText(/cho /)).not.toBeInTheDocument();
  });

  it("renders the diamond icon by default", () => {
    const { container } = render(
      <AwardPrizeValueRow {...baseProps} amountVnd={5_000_000} />,
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("uses the license icon when specified (Signature 2025 team-prize row)", () => {
    const { container } = render(
      <AwardPrizeValueRow
        amountVnd={8_000_000}
        icon="license"
        label="Giá trị giải thưởng:"
        suffix="cho giải tập thể"
      />,
    );
    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(screen.getByText("cho giải tập thể")).toBeInTheDocument();
  });
});
