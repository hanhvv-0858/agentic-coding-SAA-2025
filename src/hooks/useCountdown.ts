"use client";

import { useEffect, useMemo, useState } from "react";

type Remaining = { days: string; hours: string; minutes: string };

export type UseCountdownResult = Remaining & {
  /** True when `eventStartAt` is missing/invalid, or when `now >= target`. */
  hasLaunched: boolean;
  /** Total minutes remaining until `target` (0 when launched / invalid). */
  remainingMinutes: number;
};

const ZERO: Remaining = { days: "00", hours: "00", minutes: "00" };
const LAUNCHED: UseCountdownResult = {
  ...ZERO,
  hasLaunched: true,
  remainingMinutes: 0,
};

function computeRemaining(target: number, now: number): Remaining {
  const diff = Math.max(0, target - now);
  const totalMinutes = Math.floor(diff / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  return {
    days: String(Math.min(days, 99)).padStart(2, "0"),
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
  };
}

// Shared countdown tick engine. Reused by the Homepage hero `<Countdown>` and
// the Prelaunch `<PrelaunchCountdown>`. Ticks once per minute; recomputes on
// `visibilitychange` so background tabs stay accurate without a per-second
// timer. When `eventStartAt` is missing/invalid, `hasLaunched` is true and
// all digits are "00" — callers render a fallback message.
export function useCountdown(eventStartAt?: string): UseCountdownResult {
  const targetMs = useMemo(() => {
    if (!eventStartAt) return null;
    const parsed = Date.parse(eventStartAt);
    return Number.isNaN(parsed) ? null : parsed;
  }, [eventStartAt]);

  // Lazy initialiser — runs once at mount. If `targetMs` later changes (prop
  // update), the effect below picks up the new target and pushes a new state
  // via its `tick()` call, without needing a setState-in-effect for the
  // null-target case (see: when a prop flips back to null we keep whatever
  // was last rendered; in practice `eventStartAt` is a stable env var).
  const [state, setState] = useState<UseCountdownResult>(() => {
    if (targetMs === null) return LAUNCHED;
    const now = Date.now();
    const r = computeRemaining(targetMs, now);
    const diff = Math.max(0, targetMs - now);
    return {
      ...r,
      hasLaunched: now >= targetMs,
      remainingMinutes: Math.floor(diff / 60_000),
    };
  });

  useEffect(() => {
    if (targetMs === null) return;
    const tick = () => {
      const now = Date.now();
      const r = computeRemaining(targetMs, now);
      const diff = Math.max(0, targetMs - now);
      setState({
        ...r,
        hasLaunched: now >= targetMs,
        remainingMinutes: Math.floor(diff / 60_000),
      });
    };
    tick();
    const id = window.setInterval(tick, 60_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") tick();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", tick);
    };
  }, [targetMs]);

  // If the caller ever passes a null target (in practice: env var cleared at
  // runtime — doesn't happen), surface the launched-fallback immediately
  // without going through setState.
  return targetMs === null ? LAUNCHED : state;
}
