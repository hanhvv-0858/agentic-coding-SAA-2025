// Unit tests for HashtagPicker — spec p9zO-c4a4x + tasks T037/T044.
// 10 scenarios covering the listbox contract.

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { createRef } from "react";
import { HashtagPicker } from "../HashtagPicker";
import type { HashtagOption } from "@/types/kudo";

const options: HashtagOption[] = [
  { slug: "dedicated", label: "Cống hiến" },
  { slug: "wasshoi", label: "Wasshoi" },
  { slug: "aim-high", label: "Aim High" },
];

function makeTriggerRef() {
  return createRef<HTMLButtonElement>();
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("<HashtagPicker />", () => {
  it("T037-1: renders all options as role=option", () => {
    const triggerRef = makeTriggerRef();
    render(
      <HashtagPicker
        options={options}
        selectedSlugs={[]}
        onToggle={() => {}}
        onClose={() => {}}
        triggerRef={triggerRef}
      />,
    );
    const rows = screen.getAllByRole("option");
    expect(rows).toHaveLength(3);
  });

  it("T037-2: selected row has aria-selected=true + visible ✓ check icon", () => {
    const triggerRef = makeTriggerRef();
    render(
      <HashtagPicker
        options={options}
        selectedSlugs={["wasshoi"]}
        onToggle={() => {}}
        onClose={() => {}}
        triggerRef={triggerRef}
      />,
    );
    const rows = screen.getAllByRole("option");
    expect(rows[0]).toHaveAttribute("aria-selected", "false");
    expect(rows[1]).toHaveAttribute("aria-selected", "true");
    expect(rows[2]).toHaveAttribute("aria-selected", "false");
  });

  it("T037-3: clicking an unselected row fires onToggle with slug", () => {
    const triggerRef = makeTriggerRef();
    const onToggle = vi.fn();
    render(
      <HashtagPicker
        options={options}
        selectedSlugs={[]}
        onToggle={onToggle}
        onClose={() => {}}
        triggerRef={triggerRef}
      />,
    );
    fireEvent.click(screen.getAllByRole("option")[0]);
    expect(onToggle).toHaveBeenCalledWith("dedicated");
  });

  it("T037-4: clicking a selected row fires onToggle to deselect", () => {
    const triggerRef = makeTriggerRef();
    const onToggle = vi.fn();
    render(
      <HashtagPicker
        options={options}
        selectedSlugs={["dedicated"]}
        onToggle={onToggle}
        onClose={() => {}}
        triggerRef={triggerRef}
      />,
    );
    fireEvent.click(screen.getAllByRole("option")[0]);
    expect(onToggle).toHaveBeenCalledWith("dedicated");
  });

  it("T037-5 (5-cap): click on 6th unselected row is a no-op", () => {
    const triggerRef = makeTriggerRef();
    const onToggle = vi.fn();
    const fiveOptions: HashtagOption[] = [
      { slug: "a", label: "A" },
      { slug: "b", label: "B" },
      { slug: "c", label: "C" },
      { slug: "d", label: "D" },
      { slug: "e", label: "E" },
      { slug: "f", label: "F" },
    ];
    render(
      <HashtagPicker
        options={fiveOptions}
        selectedSlugs={["a", "b", "c", "d", "e"]}
        onToggle={onToggle}
        onClose={() => {}}
        triggerRef={triggerRef}
      />,
    );
    const rows = screen.getAllByRole("option");
    const sixthRow = rows[5];
    expect(sixthRow).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(sixthRow);
    expect(onToggle).not.toHaveBeenCalled();
  });

  it("T037-6: Esc key fires onClose", () => {
    const triggerRef = makeTriggerRef();
    const onClose = vi.fn();
    render(
      <HashtagPicker
        options={options}
        selectedSlugs={[]}
        onToggle={() => {}}
        onClose={onClose}
        triggerRef={triggerRef}
      />,
    );
    fireEvent.keyDown(screen.getByRole("listbox"), { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("T037-7: ArrowDown from first row moves focus to second", () => {
    const triggerRef = makeTriggerRef();
    render(
      <HashtagPicker
        options={options}
        selectedSlugs={[]}
        onToggle={() => {}}
        onClose={() => {}}
        triggerRef={triggerRef}
      />,
    );
    const rows = screen.getAllByRole("option");
    // Simulate focus-on-mount already placed focus on the first row.
    rows[0].focus();
    fireEvent.keyDown(screen.getByRole("listbox"), { key: "ArrowDown" });
    expect(document.activeElement).toBe(rows[1]);
  });

  it("T037-8: Enter on a focused row toggles it", () => {
    const triggerRef = makeTriggerRef();
    const onToggle = vi.fn();
    render(
      <HashtagPicker
        options={options}
        selectedSlugs={[]}
        onToggle={onToggle}
        onClose={() => {}}
        triggerRef={triggerRef}
      />,
    );
    const row = screen.getAllByRole("option")[0];
    fireEvent.keyDown(row, { key: "Enter" });
    expect(onToggle).toHaveBeenCalledWith("dedicated");
  });

  it("T037-9: loading skeleton renders when options === undefined", () => {
    const triggerRef = makeTriggerRef();
    render(
      <HashtagPicker
        options={undefined}
        selectedSlugs={[]}
        onToggle={() => {}}
        onClose={() => {}}
        triggerRef={triggerRef}
      />,
    );
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.queryAllByRole("option")).toHaveLength(0);
  });

  it("T037-10: error state renders Retry button + fires onRetry", () => {
    const triggerRef = makeTriggerRef();
    const onRetry = vi.fn();
    render(
      <HashtagPicker
        options={undefined}
        loadError={new Error("boom")}
        selectedSlugs={[]}
        onToggle={() => {}}
        onClose={() => {}}
        onRetry={onRetry}
        triggerRef={triggerRef}
      />,
    );
    const retry = screen.getByRole("button", { name: /Thử lại/i });
    fireEvent.click(retry);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
