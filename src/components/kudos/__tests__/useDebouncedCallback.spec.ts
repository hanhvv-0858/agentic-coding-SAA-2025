import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useDebouncedCallback } from "../hooks/useDebouncedCallback";

describe("useDebouncedCallback", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("collapses two rapid-fire calls into one invocation", () => {
    const spy = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(spy, 300));

    act(() => {
      result.current("a");
      result.current("b");
    });
    expect(spy).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith("b");
  });

  it("fires a third call after the window has passed", () => {
    const spy = vi.fn();
    const { result } = renderHook(() => useDebouncedCallback(spy, 300));

    act(() => {
      result.current("one");
    });
    act(() => {
      vi.advanceTimersByTime(350);
    });
    expect(spy).toHaveBeenCalledTimes(1);

    act(() => {
      result.current("two");
    });
    act(() => {
      vi.advanceTimersByTime(350);
    });
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenLastCalledWith("two");
  });

  it("uses the latest callback reference", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { result, rerender } = renderHook(
      ({ cb }: { cb: (...a: unknown[]) => void }) =>
        useDebouncedCallback(cb, 300),
      { initialProps: { cb: first } },
    );

    act(() => {
      result.current("x");
    });
    rerender({ cb: second });
    act(() => {
      vi.advanceTimersByTime(350);
    });
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});
