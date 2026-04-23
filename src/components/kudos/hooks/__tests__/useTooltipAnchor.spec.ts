// T123b — Pure behaviour tests for the shared `useTooltipAnchor` hook
// (spec US10 + design-style §28). Uses fake timers to assert dwell
// timing. `renderHook` + explicit pointer device mocking so we can
// simulate both `hover: hover` (pointer) and `hover: none` (touch).

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useRef } from "react";
import { useTooltipAnchor } from "../useTooltipAnchor";

// Utility — wires a fresh `<div>` in jsdom as the trigger element so
// `triggerRef.current.getBoundingClientRect()` works inside the hook's
// layout effect.
function renderUnderTest(matchHover = true) {
  // Stub matchMedia — jsdom's default returns false for everything.
  vi.stubGlobal("matchMedia", (query: string) => ({
    matches: query === "(hover: hover)" ? matchHover : !matchHover,
    media: query,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
    onchange: null,
  }));

  const el = document.createElement("button");
  document.body.appendChild(el);

  const result = renderHook(() => {
    const ref = useRef<HTMLButtonElement | null>(el);
    return useTooltipAnchor(ref, { tooltipWidth: 300, tooltipHeight: 200 });
  });
  return { ...result, el };
}

describe("useTooltipAnchor (pointer device)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  it("stays closed initially", () => {
    const { result } = renderUnderTest();
    expect(result.current.open).toBe(false);
  });

  it("opens after 400 ms dwell on pointer-enter", () => {
    const { result } = renderUnderTest();
    act(() => {
      result.current.triggerHandlers.onPointerEnter();
    });
    expect(result.current.open).toBe(false);
    act(() => {
      vi.advanceTimersByTime(399);
    });
    expect(result.current.open).toBe(false);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.open).toBe(true);
  });

  it("cancels open if pointer leaves before dwell completes", () => {
    const { result } = renderUnderTest();
    act(() => {
      result.current.triggerHandlers.onPointerEnter();
      vi.advanceTimersByTime(200);
      result.current.triggerHandlers.onPointerLeave();
      vi.advanceTimersByTime(600);
    });
    expect(result.current.open).toBe(false);
  });

  it("closes after 200 ms when pointer leaves an open tooltip", () => {
    const { result } = renderUnderTest();
    act(() => {
      result.current.triggerHandlers.onPointerEnter();
      vi.advanceTimersByTime(400);
    });
    expect(result.current.open).toBe(true);
    act(() => {
      result.current.triggerHandlers.onPointerLeave();
      vi.advanceTimersByTime(199);
    });
    expect(result.current.open).toBe(true);
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.open).toBe(false);
  });

  it("close() immediately resets open state", () => {
    const { result } = renderUnderTest();
    act(() => {
      result.current.triggerHandlers.onPointerEnter();
      vi.advanceTimersByTime(400);
    });
    expect(result.current.open).toBe(true);
    act(() => {
      result.current.close();
    });
    expect(result.current.open).toBe(false);
  });

  it("Esc closes an open tooltip", () => {
    const { result } = renderUnderTest();
    act(() => {
      result.current.triggerHandlers.onPointerEnter();
      vi.advanceTimersByTime(400);
    });
    expect(result.current.open).toBe(true);
    act(() => {
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    });
    expect(result.current.open).toBe(false);
  });
});

describe("useTooltipAnchor (touch device)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  it("first tap opens immediately (no dwell)", () => {
    const { result } = renderUnderTest(false);
    act(() => {
      result.current.triggerHandlers.onClick();
    });
    expect(result.current.open).toBe(true);
  });

  it("second tap on the trigger closes (tap-toggle)", () => {
    const { result } = renderUnderTest(false);
    act(() => {
      result.current.triggerHandlers.onClick();
    });
    expect(result.current.open).toBe(true);
    act(() => {
      result.current.triggerHandlers.onClick();
    });
    expect(result.current.open).toBe(false);
  });

  it("tap outside closes", () => {
    const { result, el } = renderUnderTest(false);
    act(() => {
      result.current.triggerHandlers.onClick();
    });
    expect(result.current.open).toBe(true);
    const outside = document.createElement("div");
    document.body.appendChild(outside);
    act(() => {
      const ev = new Event("pointerdown", { bubbles: true });
      Object.defineProperty(ev, "target", { value: outside });
      document.dispatchEvent(ev);
    });
    expect(result.current.open).toBe(false);
    // Trigger itself is still in the DOM
    expect(el.isConnected).toBe(true);
  });

  it("pointer hover does NOT open on touch device", () => {
    const { result } = renderUnderTest(false);
    act(() => {
      result.current.triggerHandlers.onPointerEnter();
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.open).toBe(false);
  });
});

// Ensure ref satisfies the `RefObject` type (useRef reassignment is a
// React 19 footgun). Shallow sanity.
it("accepts an initially-null trigger ref without crashing", () => {
  vi.stubGlobal("matchMedia", () => ({
    matches: true,
    addEventListener: () => {},
    removeEventListener: () => {},
  }));
  const render = renderHook(() => {
    const ref = useRef<HTMLButtonElement | null>(null);
    return useTooltipAnchor(ref, { tooltipWidth: 300, tooltipHeight: 200 });
  });
  expect(render.result.current.open).toBe(false);
  vi.unstubAllGlobals();
});
