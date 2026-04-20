"use client";

import {
  useOptimistic,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { track } from "@/libs/analytics/track";
import { toggleKudoHeart } from "@/app/kudos/actions";
import { useDebouncedCallback } from "./hooks/useDebouncedCallback";
import { useHeartsCache } from "./hooks/useHeartsCache";
import { useReducedMotion } from "./hooks/useReducedMotion";
import type { HeartState } from "./hooks/heartsCache";

// 300 ms per FR-007 — matches the `useDebouncedCallback` unit test.
const DEBOUNCE_MS = 300;

export type HeartButtonLabels = {
  add: string;
  remove: string;
  disabled: string;
  error: string;
};

export type HeartButtonProps = {
  kudoId: string;
  initialHeartsCount: number;
  initialHasHearted: boolean;
  isSender: boolean;
  labels: HeartButtonLabels;
  onError?: (message: string) => void;
  /**
   * Optional auth probe — when `false`, the user is signed out and
   * clicking should redirect to `/login?next=/kudos`. Defaults to
   * `true`; `KudoListClient` passes the SSR-known value down.
   */
  authenticated?: boolean;
};

type Snapshot = HeartState;

/**
 * C.4.1 HeartButton — client island with optimistic state, 300 ms
 * debounce, and shared cross-card sync via `heartsCache`.
 *
 * State machine:
 *   - Click → flip local optimistic (useOptimistic) + cache (useHeartsCache)
 *   - Debounce 300 ms → call `toggleKudoHeart` Server Action
 *   - Success → cache absorbs authoritative count
 *   - Error → rollback via setState + onError callback (toast)
 *   - UNAUTHENTICATED → push to /login?next=/kudos (FR-003)
 */
export function HeartButton({
  kudoId,
  initialHeartsCount,
  initialHasHearted,
  isSender,
  labels,
  onError,
  authenticated = true,
}: HeartButtonProps): ReactNode {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const { state, setState } = useHeartsCache(
    kudoId,
    initialHeartsCount,
    initialHasHearted,
  );

  // useOptimistic wraps the cache snapshot — lets concurrent React
  // render the flipped state immediately under a transition.
  const [optimistic, applyOptimistic] = useOptimistic<Snapshot, Snapshot>(
    state,
    (_prev, next) => next,
  );
  const [, startTransition] = useTransition();

  // Pulse animation token — toggled on each click so the CSS can
  // replay the scale keyframes; `useReducedMotion` collapses to 0 ms.
  const [pulseKey, setPulseKey] = useState(0);

  // Ref holds the *target* state across the debounce window so rapid
  // double-taps send only the final truth over the wire.
  const pendingRef = useRef<Snapshot | null>(null);
  // Snapshot the state prior to the first click in a debounce window
  // — used for rollback on server error.
  const rollbackRef = useRef<Snapshot>(state);

  const fire = useDebouncedCallback(async () => {
    const target = pendingRef.current;
    pendingRef.current = null;
    if (!target) return;
    const rollback = rollbackRef.current;
    const action = target.hearted ? "add" : "remove";
    try {
      const result = await toggleKudoHeart(kudoId, action);
      const next: Snapshot = {
        count: result.heartsCount,
        hearted: result.hasHearted,
      };
      setState(next);
      track({
        type: "kudos_heart_toggle",
        id: kudoId,
        action,
        multiplier: result.multiplier,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes("UNAUTHENTICATED")) {
        router.push("/login?next=/kudos");
        return;
      }
      // Rollback to the pre-click snapshot and surface the error.
      setState(rollback);
      startTransition(() => {
        applyOptimistic(rollback);
      });
      if (onError) onError(labels.error);
    }
  }, DEBOUNCE_MS);

  const handleClick = () => {
    if (isSender) return;
    if (!authenticated) {
      router.push("/login?next=/kudos");
      return;
    }

    // Capture rollback on the first click of a debounce window only
    // (so a rapid double-tap returns to the TRUE original state).
    if (pendingRef.current === null) {
      rollbackRef.current = state;
    }

    const nextHearted = !optimistic.hearted;
    const delta = nextHearted ? 1 : -1;
    const next: Snapshot = {
      count: Math.max(0, optimistic.count + delta),
      hearted: nextHearted,
    };

    // Apply optimistic UI immediately (inside a transition per React
    // 19 rules for `useOptimistic`).
    startTransition(() => {
      applyOptimistic(next);
    });
    setState(next);
    setPulseKey((k) => k + 1);

    pendingRef.current = next;
    fire();
  };

  const pressed = optimistic.hearted;
  const count = optimistic.count;

  const baseClass =
    "flex h-10 items-center gap-1 rounded-full px-2 py-1 font-[family-name:var(--font-montserrat)] text-base font-bold leading-6 transition-[color,transform,opacity] duration-150 motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-cream)]";
  const stateClass = isSender
    ? "cursor-not-allowed opacity-50 text-[var(--color-muted-grey)]"
    : pressed
      ? "text-[var(--color-heart-active)] hover:brightness-95"
      : "text-[var(--color-muted-grey)] hover:text-[var(--color-heart-active)]";

  // Motion token — `key={pulseKey}` replays the scale keyframes; the
  // reduced-motion path sets `duration: 0` so the pulse is instant.
  const pulseStyle: React.CSSProperties | undefined = reducedMotion
    ? undefined
    : {
        animation: "kudo-heart-pulse 250ms ease-out",
      };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isSender}
      aria-pressed={isSender ? undefined : pressed}
      aria-disabled={isSender ? true : undefined}
      aria-label={
        isSender ? labels.disabled : pressed ? labels.remove : labels.add
      }
      data-testid="kudo-heart-button"
      data-kudo-id={kudoId}
      data-hearted={pressed ? "true" : "false"}
      className={`${baseClass} ${stateClass}`}
    >
      <span
        data-testid="kudo-heart-count"
        className="font-[family-name:var(--font-montserrat)] text-[20px] font-bold leading-6 text-[var(--color-brand-900)]"
      >
        {count}
      </span>
      <span
        key={pulseKey}
        style={pulseStyle}
        className="inline-flex items-center justify-center"
      >
        <Icon
          name={pressed ? "heart-filled" : "heart"}
          size={24}
          className={
            pressed ? "text-[var(--color-heart-active)]" : undefined
          }
        />
      </span>
    </button>
  );
}
