"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type SpotlightAutoRefreshProps = {
  /** Poll interval in ms. Default 60 s per spec Open Q6. */
  intervalMs?: number;
};

/**
 * Client island mounted inside `SpotlightSection`. Calls
 * `router.refresh()` every 60 s so the Server Component re-runs
 * `getSpotlight()` and the board / counter pick up any newly inserted
 * kudos. Pauses when the tab is hidden (visibility-gated) so a backgrounded
 * tab doesn't keep polling.
 *
 * This is **Option A** from the realtime design note — zero new infra,
 * zero new dependency; the trade-off is the whole `/kudos` RSC tree
 * re-fetches, not just the Spotlight block. If network load becomes an
 * issue at ceremony scale, swap to Supabase Realtime (Option C).
 */
export function SpotlightAutoRefresh({
  intervalMs = 60_000,
}: SpotlightAutoRefreshProps) {
  const router = useRouter();

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    const tick = () => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    };

    const start = () => {
      if (timer === null) timer = setInterval(tick, intervalMs);
    };
    const stop = () => {
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    };

    // If the tab is hidden on mount, defer polling until it becomes
    // visible. If visible on mount, start immediately.
    if (document.visibilityState === "visible") start();

    const onVisibility = () => {
      if (document.visibilityState === "visible") {
        // Immediate refresh on return so the user sees fresh data
        // without waiting up to 60 s.
        router.refresh();
        start();
      } else {
        stop();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      stop();
    };
  }, [router, intervalMs]);

  return null;
}
