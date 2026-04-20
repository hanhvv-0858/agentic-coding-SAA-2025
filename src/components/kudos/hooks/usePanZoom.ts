"use client";

// §B.7 SpotlightBoard — hand-rolled pan + zoom primitive (Q9 default,
// plan §Architecture Decisions). ~120 LOC; no external dependency. Uses
// Pointer Events for drag, `wheel` for zoom, and keyboard (WASD / Arrow
// keys + `+` / `-` / `0`) for a11y. Two-finger pinch is detected via a
// simple distance comparison between two active pointers.
//
// The state is held in `useState` so React re-renders the canvas; with
// <1000 DOM nodes this is comfortably within the 60 fps budget per
// plan §Risk #1 (Spotlight perf). When profiling says otherwise the
// hook can migrate to `useSyncExternalStore` without a public API
// change.

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from "react";
import { useReducedMotion } from "./useReducedMotion";

export type PanZoomState = { x: number; y: number; scale: number };

export type PanZoomActions = {
  panBy: (dx: number, dy: number) => void;
  panTo: (x: number, y: number) => void;
  zoomTo: (scale: number, centerX?: number, centerY?: number) => void;
  reset: () => void;
};

export type PanZoomHandlers = {
  onPointerDown: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerMove: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerUp: (e: ReactPointerEvent<HTMLElement>) => void;
  onPointerCancel: (e: ReactPointerEvent<HTMLElement>) => void;
  onWheel: (e: ReactWheelEvent<HTMLElement>) => void;
  onKeyDown: (e: ReactKeyboardEvent<HTMLElement>) => void;
};

type UsePanZoomOptions = {
  minScale?: number;
  maxScale?: number;
  /** Initial offset + zoom. Defaults to `{ x: 0, y: 0, scale: 1 }`. */
  initial?: PanZoomState;
  /** Keyboard pan step in CSS pixels per press. Plan default: 40 px. */
  keyboardStep?: number;
  /** Fired on the first pan interaction of a drag — use for analytics. */
  onPanStart?: () => void;
  /** Fired after a pan or wheel zoom settles. Useful for debounced tracking. */
  onInteractionEnd?: (next: PanZoomState) => void;
};

type UsePanZoomResult = {
  state: PanZoomState;
  actions: PanZoomActions;
  handlers: PanZoomHandlers;
  isPanning: boolean;
};

const DEFAULT_STATE: PanZoomState = { x: 0, y: 0, scale: 1 };

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Hand-rolled pan + zoom controller for the B.7 Spotlight word-cloud.
 */
export function usePanZoom(opts: UsePanZoomOptions = {}): UsePanZoomResult {
  const minScale = opts.minScale ?? 0.5;
  const maxScale = opts.maxScale ?? 3;
  const step = opts.keyboardStep ?? 40;
  const initial = opts.initial ?? DEFAULT_STATE;

  const [state, setState] = useState<PanZoomState>(initial);
  const [isPanning, setIsPanning] = useState(false);
  const reducedMotion = useReducedMotion();

  // Active pointers keyed by `pointerId` so we can track 1 pointer
  // (drag) or 2 (pinch) without extra bookkeeping.
  const pointersRef = useRef(new Map<number, { x: number; y: number }>());
  // Last single-pointer client coordinates — used to compute pan deltas.
  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);
  // Distance between the two pinch pointers at gesture start.
  const pinchStartRef = useRef<{ dist: number; scale: number } | null>(null);
  const panStartedRef = useRef(false);

  const clampScale = useCallback(
    (s: number) => clamp(s, minScale, maxScale),
    [minScale, maxScale],
  );

  const panBy = useCallback((dx: number, dy: number) => {
    setState((prev) => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
  }, []);

  const panTo = useCallback((x: number, y: number) => {
    setState((prev) => ({ ...prev, x, y }));
  }, []);

  const zoomTo = useCallback(
    (scale: number, centerX?: number, centerY?: number) => {
      setState((prev) => {
        const nextScale = clampScale(scale);
        if (centerX === undefined || centerY === undefined) {
          return { ...prev, scale: nextScale };
        }
        // Keep the pointer-focal point anchored during a zoom — the
        // translation adjusts so `(centerX, centerY)` stays put.
        const ratio = nextScale / prev.scale;
        return {
          x: centerX - (centerX - prev.x) * ratio,
          y: centerY - (centerY - prev.y) * ratio,
          scale: nextScale,
        };
      });
    },
    [clampScale],
  );

  const reset = useCallback(() => {
    setState(initial);
  }, [initial]);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      // Track this pointer + capture so the gesture survives an
      // out-of-bounds move (especially important on touch).
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);

      if (pointersRef.current.size === 1) {
        lastPointerRef.current = { x: e.clientX, y: e.clientY };
        setIsPanning(true);
        panStartedRef.current = false;
      } else if (pointersRef.current.size === 2) {
        const [a, b] = Array.from(pointersRef.current.values());
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        pinchStartRef.current = { dist, scale: state.scale };
      }
    },
    [state.scale],
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      if (!pointersRef.current.has(e.pointerId)) return;
      pointersRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointersRef.current.size === 2 && pinchStartRef.current) {
        // Two-finger pinch — scale relative to gesture origin.
        const [a, b] = Array.from(pointersRef.current.values());
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        const nextScale = pinchStartRef.current.scale * (dist / pinchStartRef.current.dist);
        zoomTo(nextScale, (a.x + b.x) / 2, (a.y + b.y) / 2);
        return;
      }

      if (pointersRef.current.size === 1 && lastPointerRef.current) {
        const dx = e.clientX - lastPointerRef.current.x;
        const dy = e.clientY - lastPointerRef.current.y;
        lastPointerRef.current = { x: e.clientX, y: e.clientY };
        if (!panStartedRef.current && (dx !== 0 || dy !== 0)) {
          panStartedRef.current = true;
          opts.onPanStart?.();
        }
        panBy(dx, dy);
      }
    },
    [panBy, zoomTo, opts],
  );

  const finishPointer = useCallback(
    (e: ReactPointerEvent<HTMLElement>) => {
      pointersRef.current.delete(e.pointerId);
      if (pointersRef.current.size === 0) {
        lastPointerRef.current = null;
        pinchStartRef.current = null;
        setIsPanning(false);
        if (panStartedRef.current) {
          panStartedRef.current = false;
          opts.onInteractionEnd?.(state);
        }
      } else if (pointersRef.current.size === 1) {
        pinchStartRef.current = null;
        const remaining = Array.from(pointersRef.current.values())[0];
        lastPointerRef.current = remaining;
      }
    },
    [state, opts],
  );

  const onWheel = useCallback(
    (e: ReactWheelEvent<HTMLElement>) => {
      // Browsers send `ctrlKey === true` for pinch gestures on trackpads.
      // Either a raw wheel or a pinch is treated as a zoom.
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const delta = -e.deltaY;
      // Normalise: |delta| can be line-height (53) or pixel (1-10). A
      // small exponent gives a smooth zoom regardless of source.
      const factor = Math.exp(delta * 0.0015);
      zoomTo(state.scale * factor, cx, cy);
    },
    [state.scale, zoomTo],
  );

  const onKeyDown = useCallback(
    (e: ReactKeyboardEvent<HTMLElement>) => {
      switch (e.key) {
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          panBy(step, 0);
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          panBy(-step, 0);
          break;
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault();
          panBy(0, step);
          break;
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault();
          panBy(0, -step);
          break;
        case "+":
        case "=":
          e.preventDefault();
          zoomTo(state.scale * 1.2);
          break;
        case "-":
        case "_":
          e.preventDefault();
          zoomTo(state.scale / 1.2);
          break;
        case "0":
          e.preventDefault();
          reset();
          break;
        default:
          return;
      }
    },
    [panBy, zoomTo, reset, state.scale, step],
  );

  // Reduced-motion honourification: nothing here animates on its own
  // (React re-render drives the transform), but we still expose the
  // hint via this useEffect so callers may decorate the canvas with
  // instant `transition: none` when reduced motion is active.
  useEffect(() => {
    if (!reducedMotion) return;
    // Intentionally empty — reduced motion currently means "no
    // animated transitions"; the hook already does not animate.
  }, [reducedMotion]);

  const handlers = useMemo<PanZoomHandlers>(
    () => ({
      onPointerDown,
      onPointerMove,
      onPointerUp: finishPointer,
      onPointerCancel: finishPointer,
      onWheel,
      onKeyDown,
    }),
    [onPointerDown, onPointerMove, finishPointer, onWheel, onKeyDown],
  );

  const actions = useMemo<PanZoomActions>(
    () => ({ panBy, panTo, zoomTo, reset }),
    [panBy, panTo, zoomTo, reset],
  );

  return { state, actions, handlers, isPanning };
}
