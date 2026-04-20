"use client";

import { useEffect, useState } from "react";

const SKELETON_DELAY_MS = 200;

/**
 * §LoadingSkeleton — 200 ms-delayed skeleton (design-style §Motion #4).
 * A client wrapper hides the skeleton for the first 200 ms to avoid
 * sub-200 ms flicker on fast connections. `prefers-reduced-motion:
 * reduce` falls back to a static grey bar (no pulse).
 */
export function KudoCardSkeleton() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setVisible(true), SKELETON_DELAY_MS);
    return () => window.clearTimeout(t);
  }, []);

  if (!visible) return null;
  return (
    <div
      aria-hidden="true"
      className="h-[260px] w-full max-w-[680px] animate-pulse rounded-[var(--radius-kudo-card)] bg-[var(--color-kudo-card)]/40 motion-reduce:animate-none"
      data-testid="kudo-card-skeleton"
    />
  );
}
