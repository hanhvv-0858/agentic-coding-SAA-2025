import { describe, it, expect, vi, beforeEach } from "vitest";
import { act, renderHook } from "@testing-library/react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { usePanZoom } from "../hooks/usePanZoom";

function makePointerEvent(
  overrides: Partial<ReactPointerEvent<HTMLElement>> = {},
): ReactPointerEvent<HTMLElement> {
  const target = document.createElement("div");
  return {
    pointerId: 1,
    clientX: 0,
    clientY: 0,
    currentTarget: target,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    ...overrides,
  } as unknown as ReactPointerEvent<HTMLElement>;
}

describe("usePanZoom", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts at the default { x:0, y:0, scale:1 } state", () => {
    const { result } = renderHook(() => usePanZoom());
    expect(result.current.state).toEqual({ x: 0, y: 0, scale: 1 });
  });

  it("panBy updates x + y additively", () => {
    const { result } = renderHook(() => usePanZoom());
    act(() => result.current.actions.panBy(10, 20));
    act(() => result.current.actions.panBy(5, -3));
    expect(result.current.state.x).toBe(15);
    expect(result.current.state.y).toBe(17);
  });

  it("zoomTo clamps scale between minScale and maxScale", () => {
    const { result } = renderHook(() =>
      usePanZoom({ minScale: 0.5, maxScale: 3 }),
    );
    act(() => result.current.actions.zoomTo(10));
    expect(result.current.state.scale).toBe(3);
    act(() => result.current.actions.zoomTo(0.1));
    expect(result.current.state.scale).toBe(0.5);
  });

  it("reset restores the initial state", () => {
    const { result } = renderHook(() =>
      usePanZoom({ initial: { x: 5, y: 5, scale: 1 } }),
    );
    act(() => result.current.actions.panBy(100, 100));
    act(() => result.current.actions.zoomTo(2));
    act(() => result.current.actions.reset());
    expect(result.current.state).toEqual({ x: 5, y: 5, scale: 1 });
  });

  it("pointer drag emits panBy via onPointerMove", () => {
    const { result } = renderHook(() => usePanZoom());
    act(() =>
      result.current.handlers.onPointerDown(
        makePointerEvent({ pointerId: 1, clientX: 0, clientY: 0 }),
      ),
    );
    act(() =>
      result.current.handlers.onPointerMove(
        makePointerEvent({ pointerId: 1, clientX: 40, clientY: 25 }),
      ),
    );
    expect(result.current.state.x).toBe(40);
    expect(result.current.state.y).toBe(25);
    expect(result.current.isPanning).toBe(true);
    act(() =>
      result.current.handlers.onPointerUp(makePointerEvent({ pointerId: 1 })),
    );
    expect(result.current.isPanning).toBe(false);
  });

  it("keyboard WASD / ArrowKeys pan by the configured step", () => {
    const { result } = renderHook(() => usePanZoom({ keyboardStep: 40 }));
    const fire = (key: string) => {
      const event = {
        key,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>;
      act(() => result.current.handlers.onKeyDown(event));
    };
    fire("ArrowRight");
    expect(result.current.state.x).toBe(-40);
    fire("ArrowLeft");
    expect(result.current.state.x).toBe(0);
    fire("ArrowDown");
    expect(result.current.state.y).toBe(-40);
    fire("w");
    expect(result.current.state.y).toBe(0);
  });

  it("keyboard +/- zooms; 0 resets", () => {
    const { result } = renderHook(() => usePanZoom());
    const fire = (key: string) => {
      const event = {
        key,
        preventDefault: vi.fn(),
      } as unknown as React.KeyboardEvent<HTMLElement>;
      act(() => result.current.handlers.onKeyDown(event));
    };
    fire("+");
    expect(result.current.state.scale).toBeGreaterThan(1);
    fire("-");
    fire("-");
    expect(result.current.state.scale).toBeLessThan(1);
    fire("0");
    expect(result.current.state.scale).toBe(1);
  });

  it("onPanStart fires only once per drag", () => {
    const onPanStart = vi.fn();
    const { result } = renderHook(() => usePanZoom({ onPanStart }));
    act(() =>
      result.current.handlers.onPointerDown(
        makePointerEvent({ pointerId: 1, clientX: 0, clientY: 0 }),
      ),
    );
    act(() =>
      result.current.handlers.onPointerMove(
        makePointerEvent({ pointerId: 1, clientX: 5, clientY: 5 }),
      ),
    );
    act(() =>
      result.current.handlers.onPointerMove(
        makePointerEvent({ pointerId: 1, clientX: 10, clientY: 10 }),
      ),
    );
    expect(onPanStart).toHaveBeenCalledTimes(1);
  });

  it("wheel event zooms anchored at the pointer position", () => {
    const { result } = renderHook(() => usePanZoom());
    const target = document.createElement("div");
    target.getBoundingClientRect = () =>
      ({ left: 0, top: 0, width: 200, height: 200 }) as DOMRect;
    const wheelEvent = {
      currentTarget: target,
      clientX: 50,
      clientY: 50,
      deltaY: -100,
      preventDefault: vi.fn(),
    } as unknown as React.WheelEvent<HTMLElement>;
    act(() => result.current.handlers.onWheel(wheelEvent));
    expect(result.current.state.scale).toBeGreaterThan(1);
  });
});
