"use client";

import { useEffect, useRef, useState } from "react";

type SpotlightCounterProps = {
  total: number;
  suffix: string;
  /** Tailwind positioning + typography classes merged in by the caller. */
  className: string;
  /** Optional `data-testid`. Only the desktop variant sets this — the
   *  mobile-list fallback omits it so existing tests can keep using the
   *  singular `getByTestId('kudos-spotlight-counter')` query. */
  testId?: string;
};

// Pulse duration kept in sync with the `kudo-spotlight-counter-pulse`
// keyframe in globals.css.
const PULSE_MS = 700;

/**
 * B.7.1 Spotlight counter — renders `{total} KUDOS` and fires a short
 * subtle pulse animation each time `total` changes (e.g. after the 60 s
 * auto-refresh picks up new kudos). First render does NOT pulse so the
 * page load is visually calm.
 */
export function SpotlightCounter({ total, suffix, className, testId }: SpotlightCounterProps) {
  const [pulseToken, setPulseToken] = useState(0);
  const prevTotalRef = useRef(total);

  useEffect(() => {
    if (prevTotalRef.current === total) return;
    prevTotalRef.current = total;
    // Change the token so React re-applies the animation class from
    // scratch even when two consecutive changes fire in quick succession.
    setPulseToken((n) => n + 1);
    const id = window.setTimeout(() => {
      // Token left in place; CSS animation auto-stops when its
      // `animation-duration` elapses. The timeout is a safety net for
      // SSR/HMR edge cases where the node might outlive the animation.
    }, PULSE_MS);
    return () => window.clearTimeout(id);
  }, [total]);

  return (
    <div
      key={pulseToken}
      className={className}
      style={{
        animation:
          pulseToken > 0
            ? `kudo-spotlight-counter-pulse ${PULSE_MS}ms ease-out 1`
            : undefined,
      }}
      aria-live="polite"
      data-testid={testId}
    >
      {total} {suffix}
    </div>
  );
}
