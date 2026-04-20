import { describe, it, expect, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useHeartsCache } from "../hooks/useHeartsCache";
import { reset } from "../hooks/heartsCache";

beforeEach(() => reset());

describe("useHeartsCache", () => {
  it("seeds the cache on first render", () => {
    const { result } = renderHook(() =>
      useHeartsCache("k1", 3, false),
    );
    expect(result.current.state).toEqual({ count: 3, hearted: false });
  });

  it("two hooks for the same id see identical updates", () => {
    const a = renderHook(() => useHeartsCache("k1", 3, false));
    const b = renderHook(() => useHeartsCache("k1", 3, false));
    expect(a.result.current.state).toEqual({ count: 3, hearted: false });
    expect(b.result.current.state).toEqual({ count: 3, hearted: false });

    act(() => a.result.current.setState({ count: 4, hearted: true }));
    expect(a.result.current.state).toEqual({ count: 4, hearted: true });
    expect(b.result.current.state).toEqual({ count: 4, hearted: true });
  });

  it("ignores identical writes (no redundant re-render)", () => {
    let renders = 0;
    const { result } = renderHook(() => {
      renders += 1;
      return useHeartsCache("k1", 2, false);
    });
    const renderCountBefore = renders;
    act(() => result.current.setState({ count: 2, hearted: false }));
    // No state change → no additional render from the store.
    expect(renders).toBe(renderCountBefore);
  });
});
