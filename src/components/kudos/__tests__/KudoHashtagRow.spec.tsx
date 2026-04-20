import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { KudoHashtagRow } from "../KudoHashtagRow";
import type { Hashtag } from "@/types/kudo";

const replaceMock = vi.fn();
const trackMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, push: vi.fn() }),
  usePathname: () => "/kudos",
  useSearchParams: () => new URLSearchParams(""),
}));

vi.mock("@/libs/analytics/track", () => ({
  track: (e: unknown) => trackMock(e),
}));

const mk = (n: number): Hashtag[] =>
  Array.from({ length: n }, (_, i) => ({
    slug: `tag-${i}`,
    label: `Tag${i}`,
  }));

describe("<KudoHashtagRow />", () => {
  beforeEach(() => {
    replaceMock.mockReset();
    trackMock.mockReset();
  });

  it("renders nothing for an empty list", () => {
    const { container } = render(<KudoHashtagRow hashtags={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders each hashtag with a leading # prefix", () => {
    render(
      <KudoHashtagRow
        hashtags={[
          { slug: "dedicated", label: "Dedicated" },
          { slug: "inspiring", label: "Inspring" },
        ]}
      />,
    );
    expect(screen.getByText("#Dedicated")).toBeInTheDocument();
    expect(screen.getByText("#Inspring")).toBeInTheDocument();
  });

  it("caps at 5 hashtags when given 7", () => {
    const { container } = render(<KudoHashtagRow hashtags={mk(7)} />);
    expect(container.querySelectorAll("li").length).toBe(5);
  });

  it("renders hashtags as <button> (US2 interactive filter trigger)", () => {
    const { container } = render(<KudoHashtagRow hashtags={mk(3)} />);
    expect(container.querySelectorAll("button").length).toBe(3);
  });

  it("clicking a hashtag writes ?hashtag={slug} via router.replace + emits analytics (FR-008)", () => {
    render(
      <KudoHashtagRow
        hashtags={[{ slug: "dedicated", label: "Dedicated" }]}
      />,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(replaceMock).toHaveBeenCalledWith(
      "/kudos?hashtag=dedicated",
      { scroll: false },
    );
    expect(trackMock).toHaveBeenCalledWith({
      type: "kudos_filter_apply",
      kind: "hashtag",
      value: "dedicated",
    });
  });
});
