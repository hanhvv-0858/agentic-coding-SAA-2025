import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "../EmptyState";
import type { Messages } from "@/libs/i18n/getMessages";
import viMessages from "@/messages/vi.json";

const messages = viMessages as unknown as Messages;

describe("<EmptyState />", () => {
  it("defaults to the feedEmpty copy (FR-002)", () => {
    render(<EmptyState messages={messages} />);
    expect(screen.getByText("Hiện tại chưa có Kudos nào.")).toBeInTheDocument();
  });

  it("uses spotlightEmpty copy when variant='spotlightEmpty'", () => {
    render(<EmptyState messages={messages} variant="spotlightEmpty" />);
    expect(
      screen.getByText("Chưa có Sunner nào được vinh danh."),
    ).toBeInTheDocument();
  });

  it("uses gifteesEmpty copy when variant='gifteesEmpty'", () => {
    render(<EmptyState messages={messages} variant="gifteesEmpty" />);
    expect(screen.getByText("Bạn chưa gửi Kudo nào.")).toBeInTheDocument();
  });

  it("exposes role='status' for screen readers and a data-variant attr", () => {
    const { container } = render(
      <EmptyState messages={messages} variant="feedEmpty" />,
    );
    const el = container.querySelector("[data-testid='kudos-empty-state']");
    expect(el?.getAttribute("role")).toBe("status");
    expect(el?.getAttribute("data-variant")).toBe("feedEmpty");
  });
});
