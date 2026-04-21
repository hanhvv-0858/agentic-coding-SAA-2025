// Integration tests for the header language toggle — spec hUyaaugye2.
// Asserts the caller-side contract: open → select → setLocale + analytics.
// Scenarios align with tasks.md T005 (US1), T008 (US2), T011 (US3).
//
// The FR-006 regression gate (re-selecting active locale = zero side
// effects) lives here (T008 scenario 3) because the guard lives in
// `LanguageToggle.handleSelect` line 52, not in the overlay.

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LanguageToggle } from "../LanguageToggle";

vi.mock("@/libs/i18n/setLocale", () => ({
  setLocale: vi.fn(),
}));
vi.mock("@/libs/analytics/track", () => ({
  track: vi.fn(),
}));

import { setLocale } from "@/libs/i18n/setLocale";
import { track } from "@/libs/analytics/track";

const setLocaleMock = vi.mocked(setLocale);
const trackMock = vi.mocked(track);

beforeEach(() => {
  vi.clearAllMocks();
});

function renderToggle(locale: "vi" | "en" = "vi") {
  render(<LanguageToggle locale={locale} label={locale.toUpperCase()} ariaLabel="Change language" />);
}

// =========================================================================
// US1 — Switch interface language (P1, MVP)
// T005 scenarios 1-2
// =========================================================================
describe("<LanguageToggle /> — open + select (US1)", () => {
  it("T005-1: trigger click opens the menu (US1 AC2)", () => {
    renderToggle("vi");
    const trigger = screen.getByRole("button", { name: /Change language/i });
    expect(screen.queryByRole("menu")).toBeNull();
    fireEvent.click(trigger);
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("T005-2: selecting a different locale fires setLocale('en') once + one language_change event", () => {
    renderToggle("vi");
    fireEvent.click(screen.getByRole("button", { name: /Change language/i }));
    const [, enRow] = screen.getAllByRole("menuitemradio");
    fireEvent.click(enRow);
    expect(setLocaleMock).toHaveBeenCalledTimes(1);
    expect(setLocaleMock).toHaveBeenCalledWith("en");
    expect(trackMock).toHaveBeenCalledTimes(1);
    expect(trackMock).toHaveBeenCalledWith({
      type: "language_change",
      from: "vi",
      to: "en",
    });
  });
});

// =========================================================================
// US2 — Dismiss without changing language (P1)
// T008 scenarios 3-4
// =========================================================================
describe("<LanguageToggle /> — dismiss paths (US2)", () => {
  it("T008-3: selecting the SAME locale fires zero setLocale + zero analytics (FR-006 / SC-003)", () => {
    renderToggle("vi");
    fireEvent.click(screen.getByRole("button", { name: /Change language/i }));
    const [vnRow] = screen.getAllByRole("menuitemradio");
    fireEvent.click(vnRow);
    // The no-op guard at LanguageToggle.handleSelect line 52 MUST keep
    // both of these counters at zero.
    expect(setLocaleMock).toHaveBeenCalledTimes(0);
    expect(trackMock).toHaveBeenCalledTimes(0);
    // Menu should also have closed.
    expect(screen.queryByRole("menu")).toBeNull();
  });

  it("T008-4: pressing Esc with menu open closes it + zero side effects", () => {
    renderToggle("vi");
    fireEvent.click(screen.getByRole("button", { name: /Change language/i }));
    const menu = screen.getByRole("menu");
    fireEvent.keyDown(menu, { key: "Escape" });
    expect(screen.queryByRole("menu")).toBeNull();
    expect(setLocaleMock).toHaveBeenCalledTimes(0);
    expect(trackMock).toHaveBeenCalledTimes(0);
  });
});

// =========================================================================
// US3 — Keyboard-only navigation (P2)
// T011 scenario 5
// =========================================================================
describe("<LanguageToggle /> — keyboard (US3)", () => {
  it("T011-5: Tab-ing out of the menu closes it with zero side effects (US3 AC4)", async () => {
    renderToggle("vi");
    fireEvent.click(screen.getByRole("button", { name: /Change language/i }));
    const menu = screen.getByRole("menu");
    fireEvent.keyDown(menu, { key: "Tab" });
    // queueMicrotask → onClose → setState → React re-render. waitFor
    // polls until the menu is removed, covering the microtask + React
    // render boundary.
    await waitFor(() => expect(screen.queryByRole("menu")).toBeNull());
    expect(setLocaleMock).toHaveBeenCalledTimes(0);
    expect(trackMock).toHaveBeenCalledTimes(0);
  });
});
