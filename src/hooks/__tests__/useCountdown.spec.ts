import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCountdown } from "../useCountdown";

describe("useCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Fixed "now" for deterministic tests.
    vi.setSystemTime(new Date("2026-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns all-zeros + hasLaunched when eventStartAt is undefined", () => {
    const { result } = renderHook(() => useCountdown(undefined));
    expect(result.current).toEqual({
      days: "00",
      hours: "00",
      minutes: "00",
      hasLaunched: true,
      remainingMinutes: 0,
    });
  });

  it("returns all-zeros + hasLaunched when eventStartAt is unparseable", () => {
    const { result } = renderHook(() => useCountdown("not-a-date"));
    expect(result.current.hasLaunched).toBe(true);
    expect(result.current.days).toBe("00");
  });

  it("returns all-zeros + hasLaunched when target is in the past", () => {
    const { result } = renderHook(() => useCountdown("2025-12-31T00:00:00Z"));
    expect(result.current.hasLaunched).toBe(true);
    expect(result.current.remainingMinutes).toBe(0);
  });

  it("computes days/hours/minutes for a future target", () => {
    // Target is 1 day, 5 hours, 20 minutes ahead of the mocked now.
    const target = new Date("2026-01-02T05:20:00Z").toISOString();
    const { result } = renderHook(() => useCountdown(target));
    expect(result.current).toMatchObject({
      days: "01",
      hours: "05",
      minutes: "20",
      hasLaunched: false,
    });
    expect(result.current.remainingMinutes).toBe(1 * 24 * 60 + 5 * 60 + 20);
  });

  it("clamps days to '99' when target is far in the future", () => {
    // 120 days ahead — should clamp the days digit to 99.
    const target = new Date("2026-05-01T00:00:00Z").toISOString();
    const { result } = renderHook(() => useCountdown(target));
    expect(result.current.days).toBe("99");
  });

  it("recomputes when the minute boundary ticks", () => {
    // Target is 3 minutes ahead.
    const target = new Date("2026-01-01T00:03:00Z").toISOString();
    const { result } = renderHook(() => useCountdown(target));
    expect(result.current.minutes).toBe("03");

    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(result.current.minutes).toBe("02");

    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(result.current.minutes).toBe("01");
  });

  it("flips hasLaunched=true once the target is reached", () => {
    const target = new Date("2026-01-01T00:02:00Z").toISOString();
    const { result } = renderHook(() => useCountdown(target));
    expect(result.current.hasLaunched).toBe(false);

    act(() => {
      vi.advanceTimersByTime(2 * 60_000);
    });
    expect(result.current.hasLaunched).toBe(true);
  });

  it("cleans up listeners on unmount", () => {
    const removeDocSpy = vi.spyOn(document, "removeEventListener");
    const removeWinSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = renderHook(() =>
      useCountdown(new Date("2026-01-02T00:00:00Z").toISOString()),
    );
    unmount();
    expect(removeDocSpy).toHaveBeenCalledWith("visibilitychange", expect.any(Function));
    expect(removeWinSpy).toHaveBeenCalledWith("focus", expect.any(Function));
  });
});
