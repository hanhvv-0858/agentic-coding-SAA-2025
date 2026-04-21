// `FilterDropdown` combobox unit tests covering the dark-navy redesign
// per spec JWpsISMAaM. Scenarios align with tasks.md T011-T034.

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FilterDropdown, type FilterDropdownOption } from "../FilterDropdown";
import type { Messages } from "@/libs/i18n/getMessages";
import viMessages from "@/messages/vi.json";

const messages = viMessages as unknown as Messages;

const sampleOptions: FilterDropdownOption[] = [
  { value: "comprehensive", label: "#Toàn diện" },
  { value: "expertise", label: "#Giỏi chuyên môn" },
  { value: "dedicated", label: "#Cống hiến" },
  { value: "aim-high", label: "#Aim High" },
  { value: "wasshoi", label: "#Wasshoi" },
];

type Props = React.ComponentProps<typeof FilterDropdown>;

function makeProps(overrides: Partial<Props> = {}): Props {
  return {
    kind: "hashtag",
    options: sampleOptions,
    value: null,
    onSelect: vi.fn(),
    messages,
    ...overrides,
  };
}

describe("<FilterDropdown /> — trigger labels (kind)", () => {
  it("renders the hashtag label when kind='hashtag'", () => {
    render(<FilterDropdown {...makeProps({ kind: "hashtag" })} />);
    const trigger = screen.getByRole("combobox");
    expect(trigger.getAttribute("aria-haspopup")).toBe("listbox");
    expect(trigger.getAttribute("aria-expanded")).toBe("false");
    expect(trigger.textContent).toContain("Hashtag");
  });

  it("renders the department label when kind='department'", () => {
    render(
      <FilterDropdown
        {...makeProps({
          kind: "department",
          options: [{ value: "FE", label: "Frontend" }],
        })}
      />,
    );
    expect(screen.getByRole("combobox").textContent).toContain("Bộ phận");
  });
});

describe("<FilterDropdown /> — open / close / select (US1)", () => {
  it("T011: opens on chip click with dark-navy panel classes", () => {
    render(<FilterDropdown {...makeProps()} />);
    const chip = screen.getByRole("combobox");
    fireEvent.click(chip);
    const listbox = screen.getByRole("listbox");
    expect(listbox.className).toContain(
      "bg-[var(--color-details-container-2,#00070C)]",
    );
    expect(listbox.className).toContain(
      "border-[var(--color-border-secondary,#998C5F)]",
    );
    expect(listbox.className).toContain(
      "shadow-[0_8px_24px_rgba(0,0,0,0.35)]",
    );
    expect(screen.getAllByRole("option")).toHaveLength(5);
  });

  it("T012: clicking a non-selected item calls onSelect(slug) and closes", () => {
    const onSelect = vi.fn();
    render(<FilterDropdown {...makeProps({ onSelect })} />);
    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText("#Cống hiến"));
    expect(onSelect).toHaveBeenCalledWith("dedicated");
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("T012b: no virtual 'All hashtags / All departments' first row is rendered", () => {
    render(<FilterDropdown {...makeProps()} />);
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getAllByRole("option")).toHaveLength(sampleOptions.length);
    expect(screen.queryByText(/All hashtags/i)).toBeNull();
    expect(screen.queryByText(/Tất cả/)).toBeNull();
  });

  it("T013: item matching `value` has aria-selected + text-shadow class (FR-005)", () => {
    render(<FilterDropdown {...makeProps({ value: "dedicated" })} />);
    fireEvent.click(screen.getByRole("combobox"));
    const selected = screen.getByRole("option", { selected: true });
    expect(selected.textContent).toBe("#Cống hiến");
    expect(selected.className).toContain("bg-[var(--color-accent-cream)]/10");
    expect(selected.className).toContain("text-shadow:");
  });
});

describe("<FilterDropdown /> — dismiss (US2)", () => {
  it("T019: window mousedown outside closes the popover and keeps onSelect silent", () => {
    const onSelect = vi.fn();
    render(
      <>
        <FilterDropdown {...makeProps({ onSelect })} />
        <div data-testid="outside">outside</div>
      </>,
    );
    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    fireEvent.mouseDown(screen.getByTestId("outside"));
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("T020: Escape closes and returns focus to trigger", async () => {
    render(<FilterDropdown {...makeProps()} />);
    const chip = screen.getByRole("combobox");
    fireEvent.click(chip);
    fireEvent.keyDown(screen.getByRole("listbox"), { key: "Escape" });
    expect(screen.queryByRole("listbox")).toBeNull();
    await vi.waitFor(() => expect(document.activeElement).toBe(chip));
  });

  it("T021: clicking the currently-selected item calls onSelect(null) — toggle-off (FR-003)", () => {
    const onSelect = vi.fn();
    render(
      <FilterDropdown {...makeProps({ onSelect, value: "dedicated" })} />,
    );
    fireEvent.click(screen.getByRole("combobox"));
    const selected = screen.getByRole("option", { selected: true });
    fireEvent.click(selected);
    expect(onSelect).toHaveBeenCalledWith(null);
  });

  it("T022: opening one popover closes the other (FR-009 mutual exclusion)", () => {
    render(
      <>
        <FilterDropdown {...makeProps({ kind: "hashtag" })} />
        <FilterDropdown
          {...makeProps({
            kind: "department",
            options: [{ value: "eng", label: "Engineering" }],
          })}
        />
      </>,
    );
    const [hashtagChip, deptChip] = screen.getAllByRole("combobox");
    fireEvent.click(hashtagChip);
    expect(
      screen.getByTestId("filter-dropdown-hashtag-listbox"),
    ).toBeInTheDocument();
    // A mousedown on the Department chip is "outside" the hashtag's
    // containerRef → hashtag closes via the window listener.
    fireEvent.mouseDown(deptChip);
    expect(
      screen.queryByTestId("filter-dropdown-hashtag-listbox"),
    ).toBeNull();
  });
});

describe("<FilterDropdown /> — keyboard (US3)", () => {
  it("T025: Enter on the closed chip opens popover with activeIndex matching `value`", () => {
    render(<FilterDropdown {...makeProps({ value: "dedicated" })} />);
    const chip = screen.getByRole("combobox");
    fireEvent.keyDown(chip, { key: "Enter" });
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    const items = screen.getAllByRole("option");
    expect(items[2].getAttribute("data-active")).toBe("true");
  });

  it("T026: ArrowDown/ArrowUp move activeIndex, clamped at bounds", () => {
    render(<FilterDropdown {...makeProps()} />);
    fireEvent.click(screen.getByRole("combobox"));
    const listbox = screen.getByRole("listbox");
    fireEvent.keyDown(listbox, { key: "ArrowDown" });
    fireEvent.keyDown(listbox, { key: "ArrowDown" });
    const items = screen.getAllByRole("option");
    expect(items[2].getAttribute("data-active")).toBe("true");
    fireEvent.keyDown(listbox, { key: "ArrowUp" });
    fireEvent.keyDown(listbox, { key: "ArrowUp" });
    fireEvent.keyDown(listbox, { key: "ArrowUp" });
    expect(items[0].getAttribute("data-active")).toBe("true");
  });

  it("T027: Home jumps to 0, End to options.length - 1", () => {
    render(<FilterDropdown {...makeProps()} />);
    fireEvent.click(screen.getByRole("combobox"));
    const listbox = screen.getByRole("listbox");
    const items = screen.getAllByRole("option");
    fireEvent.keyDown(listbox, { key: "End" });
    expect(items[items.length - 1].getAttribute("data-active")).toBe("true");
    fireEvent.keyDown(listbox, { key: "Home" });
    expect(items[0].getAttribute("data-active")).toBe("true");
  });

  it("T028: Enter on an active item commits + closes", () => {
    const onSelect = vi.fn();
    render(<FilterDropdown {...makeProps({ onSelect })} />);
    fireEvent.click(screen.getByRole("combobox"));
    const listbox = screen.getByRole("listbox");
    fireEvent.keyDown(listbox, { key: "ArrowDown" });
    fireEvent.keyDown(listbox, { key: "Enter" });
    expect(onSelect).toHaveBeenCalledWith("expertise");
    expect(screen.queryByRole("listbox")).toBeNull();
  });
});

describe("<FilterDropdown /> — long-list scroll (US4)", () => {
  const longOptions: FilterDropdownOption[] = Array.from({ length: 13 }, (_, i) => ({
    value: `slug-${i}`,
    label: `#Tag ${i}`,
  }));

  it("T030: listbox applies responsive max-h + overflow-y-auto for long lists", () => {
    render(<FilterDropdown {...makeProps({ options: longOptions })} />);
    fireEvent.click(screen.getByRole("combobox"));
    const listbox = screen.getByRole("listbox");
    expect(listbox.className).toContain(
      "max-h-[min(640px,calc(100vh-160px))]",
    );
    expect(listbox.className).toContain("overflow-y-auto");
  });

  it("T031: selecting an item after scroll still fires onSelect + closes", () => {
    const onSelect = vi.fn();
    render(<FilterDropdown {...makeProps({ options: longOptions, onSelect })} />);
    fireEvent.click(screen.getByRole("combobox"));
    const listbox = screen.getByRole("listbox");
    fireEvent.scroll(listbox, { target: { scrollTop: 400 } });
    fireEvent.click(screen.getByText("#Tag 12"));
    expect(onSelect).toHaveBeenCalledWith("slug-12");
    expect(screen.queryByRole("listbox")).toBeNull();
  });
});

describe("<FilterDropdown /> — disabled + retry (FR-007, FR-008)", () => {
  it("T033: disabled trigger has aria-disabled='true' and click is a no-op", () => {
    render(<FilterDropdown {...makeProps({ disabled: true, options: [] })} />);
    const chip = screen.getByRole("combobox");
    expect(chip.getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(chip);
    expect(screen.queryByRole("listbox")).toBeNull();
  });

  it("T034: disabled + onRetry renders inline Retry control and fires onRetry", () => {
    const onRetry = vi.fn();
    render(
      <FilterDropdown
        {...makeProps({ disabled: true, options: [], onRetry })}
      />,
    );
    expect(screen.getByText("Không tải được")).toBeInTheDocument();
    fireEvent.click(screen.getByText("Thử lại"));
    expect(onRetry).toHaveBeenCalled();
  });
});
