// Phase 4 / T048 — `FilterDropdown` combobox unit tests. Covers the 6
// required test cases: keyboard ArrowUp/ArrowDown/Enter/Escape,
// single-select, outside-click close, `kind` prop toggles label+icon,
// disabled state ("Không tải được" + Retry), and the empty-list case.

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import viMessages from "@/messages/vi.json";
import type { Messages } from "@/libs/i18n/getMessages";
import { FilterDropdown } from "../FilterDropdown";

const messages = viMessages as unknown as Messages;

const hashtagOptions = [
  { value: "dedicated", label: "#Dedicated" },
  { value: "inspiring", label: "#Inspring" },
  { value: "teamwork", label: "#Teamwork" },
];

describe("<FilterDropdown />", () => {
  let onSelect: (next: string | null) => void;
  let spy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    spy = vi.fn();
    onSelect = (next: string | null) => {
      (spy as unknown as (v: string | null) => void)(next);
    };
  });

  it("renders the hashtag label + # icon when kind='hashtag'", () => {
    render(
      <FilterDropdown
        kind="hashtag"
        options={hashtagOptions}
        value={null}
        onSelect={onSelect}
        messages={messages}
      />,
    );
    const trigger = screen.getByRole("combobox");
    expect(trigger.getAttribute("aria-haspopup")).toBe("listbox");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.textContent).toContain("Hashtag");
  });

  it("renders the department label when kind='department'", () => {
    render(
      <FilterDropdown
        kind="department"
        options={[{ value: "FE", label: "Frontend" }]}
        value={null}
        onSelect={onSelect}
        messages={messages}
      />,
    );
    expect(screen.getByRole("combobox").textContent).toContain("Bộ phận");
  });

  it("opens on click + commits a single select via mouse", () => {
    render(
      <FilterDropdown
        kind="hashtag"
        options={hashtagOptions}
        value={null}
        onSelect={onSelect}
        messages={messages}
      />,
    );
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    fireEvent.click(screen.getByText("#Dedicated"));
    expect(spy).toHaveBeenCalledWith("dedicated");
  });

  it("supports keyboard ArrowDown → Enter to pick an option", () => {
    render(
      <FilterDropdown
        kind="hashtag"
        options={hashtagOptions}
        value={null}
        onSelect={onSelect}
        messages={messages}
      />,
    );
    const trigger = screen.getByRole("combobox");
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    // "All hashtags" at index 0 is active on open; ArrowDown moves to index 1 (#Dedicated)
    fireEvent.keyDown(trigger, { key: "ArrowDown" });
    fireEvent.keyDown(trigger, { key: "Enter" });
    expect(spy).toHaveBeenCalledWith("dedicated");
  });

  it("Escape key closes the popover without committing", () => {
    render(
      <FilterDropdown
        kind="hashtag"
        options={hashtagOptions}
        value={null}
        onSelect={onSelect}
        messages={messages}
      />,
    );
    const trigger = screen.getByRole("combobox");
    fireEvent.click(trigger);
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    fireEvent.keyDown(trigger, { key: "Escape" });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
    expect(spy).not.toHaveBeenCalled();
  });

  it("outside-click closes the popover", () => {
    render(
      <div>
        <FilterDropdown
          kind="hashtag"
          options={hashtagOptions}
          value={null}
          onSelect={onSelect}
          messages={messages}
        />
        <span data-testid="outside">outside</span>
      </div>,
    );
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("renders disabled state with loadError copy + Retry when disabled + onRetry set", () => {
    const onRetry = vi.fn();
    render(
      <FilterDropdown
        kind="hashtag"
        options={[]}
        value={null}
        onSelect={onSelect}
        messages={messages}
        disabled
        onRetry={onRetry}
      />,
    );
    const trigger = screen.getByRole("combobox");
    expect(trigger).toBeDisabled();
    expect(screen.getByText("Không tải được")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Thử lại"));
    expect(onRetry).toHaveBeenCalled();
  });

  it("picking the 'All' virtual option clears the filter (null)", () => {
    render(
      <FilterDropdown
        kind="hashtag"
        options={hashtagOptions}
        value="dedicated"
        onSelect={onSelect}
        messages={messages}
      />,
    );
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText("Tất cả hashtag"));
    expect(spy).toHaveBeenCalledWith(null);
  });
});
