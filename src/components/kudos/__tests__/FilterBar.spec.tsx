// Phase 4 / T052 + T058 — `FilterBar` unit tests. Covers the URL
// wiring contract (`router.replace` with preserved co-param per FR-023)
// and the `kudos_filter_apply` analytics payload shape for both
// `kind: "hashtag"` and `kind: "department"`.

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import viMessages from "@/messages/vi.json";
import type { Messages } from "@/libs/i18n/getMessages";
import { FilterBar } from "../FilterBar";

const messages = viMessages as unknown as Messages;

const replaceMock = vi.fn();
const trackMock = vi.fn();
let searchParamsMock = new URLSearchParams("");

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: replaceMock, push: vi.fn() }),
  usePathname: () => "/kudos",
  useSearchParams: () => searchParamsMock,
}));

vi.mock("@/libs/analytics/track", () => ({
  track: (e: unknown) => trackMock(e),
}));

const hashtags = [
  { slug: "dedicated", label: "Dedicated" },
  { slug: "inspiring", label: "Inspring" },
];
const departments = [
  { code: "FE", label: "Frontend" },
  { code: "BE", label: "Backend" },
];

describe("<FilterBar />", () => {
  beforeEach(() => {
    replaceMock.mockReset();
    trackMock.mockReset();
    searchParamsMock = new URLSearchParams("");
  });

  it("renders both dropdowns (hashtag + department)", () => {
    render(
      <FilterBar
        hashtag={null}
        department={null}
        hashtags={hashtags}
        departments={departments}
        messages={messages}
      />,
    );
    expect(screen.getByTestId("filter-dropdown-hashtag")).toBeInTheDocument();
    expect(screen.getByTestId("filter-dropdown-department")).toBeInTheDocument();
    // No chips row when nothing is active.
    expect(screen.queryByTestId("kudos-filter-chips")).not.toBeInTheDocument();
  });

  it("selecting a hashtag writes ?hashtag= via router.replace + emits kudos_filter_apply kind=hashtag", () => {
    render(
      <FilterBar
        hashtag={null}
        department={null}
        hashtags={hashtags}
        departments={departments}
        messages={messages}
      />,
    );
    fireEvent.click(screen.getAllByRole("combobox")[0]);
    fireEvent.click(screen.getByText("#Dedicated"));
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

  it("selecting a department emits kudos_filter_apply kind=department", () => {
    render(
      <FilterBar
        hashtag={null}
        department={null}
        hashtags={hashtags}
        departments={departments}
        messages={messages}
      />,
    );
    fireEvent.click(screen.getAllByRole("combobox")[1]);
    fireEvent.click(screen.getByText("Frontend"));
    expect(trackMock).toHaveBeenCalledWith({
      type: "kudos_filter_apply",
      kind: "department",
      value: "FE",
    });
  });

  it("preserves the department param when only the hashtag changes (FR-023)", () => {
    searchParamsMock = new URLSearchParams("department=FE");
    render(
      <FilterBar
        hashtag={null}
        department="FE"
        hashtags={hashtags}
        departments={departments}
        messages={messages}
      />,
    );
    fireEvent.click(screen.getAllByRole("combobox")[0]);
    fireEvent.click(screen.getByText("#Dedicated"));
    expect(replaceMock).toHaveBeenCalled();
    const [url] = replaceMock.mock.calls[0] as [string];
    expect(url).toContain("hashtag=dedicated");
    expect(url).toContain("department=FE");
  });

  it("renders active chips + clearing a chip emits kudos_filter_apply with '(cleared)'", () => {
    render(
      <FilterBar
        hashtag="dedicated"
        department="FE"
        hashtags={hashtags}
        departments={departments}
        messages={messages}
      />,
    );
    expect(screen.getByTestId("kudos-filter-chip-hashtag")).toBeInTheDocument();
    expect(screen.getByTestId("kudos-filter-chip-department")).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: messages.kudos.filters.clearHashtagAria }),
    );
    expect(trackMock).toHaveBeenCalledWith({
      type: "kudos_filter_apply",
      kind: "hashtag",
      value: "(cleared)",
    });
  });

  it("Clear filters button removes both active params sequentially", () => {
    render(
      <FilterBar
        hashtag="dedicated"
        department="FE"
        hashtags={hashtags}
        departments={departments}
        messages={messages}
      />,
    );
    fireEvent.click(screen.getByTestId("kudos-filter-clear-all"));
    // Two updateParam calls → two router.replace invocations.
    expect(replaceMock).toHaveBeenCalledTimes(2);
    expect(trackMock).toHaveBeenCalledTimes(2);
  });
});
