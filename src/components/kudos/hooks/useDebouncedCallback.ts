"use client";

import { useCallback, useEffect, useRef } from "react";

/**
 * 300 ms debouncer per spec FR-007. Returns a stable callback that
 * schedules the *latest* call after `delay` ms of silence — rapid-fire
 * invocations collapse into one. The callback reference itself is
 * stored in a ref so the returned wrapper stays referentially stable
 * across re-renders. Pending timers are cleared on unmount.
 *
 * The hook is intentionally narrow (no external `.cancel()` method)
 * — callers should simply stop scheduling when they want to stop.
 */
export function useDebouncedCallback<A extends unknown[]>(
  callback: (...args: A) => void,
  delay: number,
): (...args: A) => void {
  const cbRef = useRef(callback);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    cbRef.current = callback;
  }, [callback]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return useCallback(
    (...args: A) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        cbRef.current(...args);
      }, delay);
    },
    [delay],
  );
}
