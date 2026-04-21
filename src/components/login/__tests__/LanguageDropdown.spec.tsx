// Unit tests for the Dropdown-ngôn ngữ overlay — spec hUyaaugye2.
// Scenarios align with tasks.md T004 (US1), T007 (US2), T010 (US3).
//
// The overlay's only contract is: render two rows bound to the correct
// locale codes + full names, fire `onSelect(locale)` on click, fire
// `onClose()` on Esc / Tab. The FR-006 no-op guard lives one layer up
// in `LanguageToggle.handleSelect`, so it is asserted at integration
// level, not here.

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageDropdown } from "../LanguageDropdown";
import type { Locale } from "@/types/auth";

type Handlers = {
  onSelect: ReturnType<typeof vi.fn>;
  onClose: ReturnType<typeof vi.fn>;
};

function renderDropdown(currentLocale: Locale = "vi"): Handlers {
  const onSelect = vi.fn();
  const onClose = vi.fn();
  render(
    <LanguageDropdown
      id="language-dropdown"
      currentLocale={currentLocale}
      onSelect={onSelect}
      onClose={onClose}
    />,
  );
  return { onSelect, onClose };
}

beforeEach(() => {
  vi.clearAllMocks();
});

// =========================================================================
// US1 — Switch interface language (P1, MVP)
// T004 scenarios 1-4
// =========================================================================
describe("<LanguageDropdown /> — render + selection (US1)", () => {
  it("T004-1: renders two rows with visible labels 'VN' and 'EN' (FR-003)", () => {
    renderDropdown("vi");
    const menu = screen.getByRole("menu");
    const rows = menu.querySelectorAll("button[role='menuitemradio']");
    expect(rows.length).toBe(2);
    // Visible text is the 2-letter code, not the full name.
    expect(menu.textContent).toContain("VN");
    expect(menu.textContent).toContain("EN");
    expect(menu.textContent).not.toContain("Tiếng Việt");
    expect(menu.textContent).not.toContain("English");
  });

  it("T004-2: each row exposes full language name via aria-label with aria-hidden visible text (FR-010)", () => {
    renderDropdown("vi");
    const rows = screen.getAllByRole("menuitemradio");
    const [vn, en] = rows;
    expect(vn.getAttribute("aria-label")).toBe("Tiếng Việt");
    expect(en.getAttribute("aria-label")).toBe("English");
    // The visible text span must be aria-hidden.
    expect(vn.querySelector("span[aria-hidden='true']")?.textContent).toBe("VN");
    expect(en.querySelector("span[aria-hidden='true']")?.textContent).toBe("EN");
  });

  it("T004-3: active locale row has aria-checked=true + cream @ 20% fill (FR-004)", () => {
    renderDropdown("vi");
    const [vn, en] = screen.getAllByRole("menuitemradio");
    expect(vn.getAttribute("aria-checked")).toBe("true");
    expect(en.getAttribute("aria-checked")).toBe("false");
    // Cream @ 20 % opacity — Tailwind v4 arbitrary-opacity syntax.
    expect(vn.className).toMatch(/bg-\[var\(--color-accent-cream\)\]\/20/);
    expect(en.className).not.toMatch(/bg-\[var\(--color-accent-cream\)\]\/20/);
  });

  it("T004-4: clicking the non-active row fires onSelect with the clicked locale (FR-005)", () => {
    const { onSelect } = renderDropdown("vi");
    const [, en] = screen.getAllByRole("menuitemradio");
    fireEvent.click(en);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("en");
  });
});

// =========================================================================
// US2 — Dismiss without changing language (P1)
// T007 scenarios 5-6
// =========================================================================
describe("<LanguageDropdown /> — dismissal (US2)", () => {
  it("T007-5: clicking the ACTIVE row still fires onSelect(activeLocale) at the overlay boundary — no-op guard is enforced one layer up", () => {
    const { onSelect } = renderDropdown("vi");
    const [vn] = screen.getAllByRole("menuitemradio");
    fireEvent.click(vn);
    // Overlay contract is simple: every click fires onSelect. The guard
    // lives in LanguageToggle.handleSelect (line 52) and is tested in
    // the integration spec scenario 3.
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith("vi");
  });

  it("T007-6: pressing Esc calls onClose (FR-002(c))", () => {
    const { onClose } = renderDropdown("vi");
    const menu = screen.getByRole("menu");
    fireEvent.keyDown(menu, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

// =========================================================================
// US3 — Keyboard-only navigation (P2)
// T010 scenarios 7-10
// =========================================================================
describe("<LanguageDropdown /> — keyboard navigation (US3)", () => {
  it("T010-7: ArrowDown from first row moves focus to second; ArrowUp from first row wraps to last (FR-007)", () => {
    renderDropdown("vi");
    const [vn, en] = screen.getAllByRole("menuitemradio");
    // Focus the first row first (it's the active one, focus-on-mount).
    expect(document.activeElement).toBe(vn);
    const menu = screen.getByRole("menu");
    fireEvent.keyDown(menu, { key: "ArrowDown" });
    expect(document.activeElement).toBe(en);
    // ArrowUp from second row → back to first.
    fireEvent.keyDown(menu, { key: "ArrowUp" });
    expect(document.activeElement).toBe(vn);
    // ArrowUp from first row → wrap to last (EN).
    fireEvent.keyDown(menu, { key: "ArrowUp" });
    expect(document.activeElement).toBe(en);
  });

  it("T010-8: on mount focus lands on the active-locale row (FR-008)", () => {
    renderDropdown("en");
    const [, en] = screen.getAllByRole("menuitemradio");
    expect(document.activeElement).toBe(en);
  });

  it("T010-9: pressing Tab while focus is on the second row calls onClose (FR-002(d), US3 AC4)", async () => {
    const { onClose } = renderDropdown("en");
    const menu = screen.getByRole("menu");
    fireEvent.keyDown(menu, { key: "Tab" });
    // queueMicrotask — wait a microtask tick.
    await Promise.resolve();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("T010-10: pressing Tab while focus is on the first row also calls onClose (keep the model simple)", async () => {
    const { onClose } = renderDropdown("vi");
    const menu = screen.getByRole("menu");
    fireEvent.keyDown(menu, { key: "Tab" });
    await Promise.resolve();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
