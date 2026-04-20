"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  get,
  set as setInCache,
  subscribe as subscribeToCache,
  type HeartState,
} from "./heartsCache";

/**
 * React reader/writer around the module-level `heartsCache`. Two
 * components mounting for the same kudo id share the same value —
 * flipping a heart in the feed is mirrored in the carousel
 * instantaneously (FR-009).
 *
 * `initialCount` + `initialHearted` seed the cache on first read so the
 * hook never returns `undefined`. Subsequent re-renders with different
 * seeds are ignored (server-provided initial values are the source of
 * truth only until the user first toggles).
 */
export function useHeartsCache(
  id: string,
  initialCount: number,
  initialHearted: boolean,
): { state: HeartState; setState: (next: HeartState) => void } {
  // Seed on first call. `get()` is safe to call during render.
  if (get(id) === undefined) {
    setInCache(id, { count: initialCount, hearted: initialHearted });
  }

  const subscribe = useCallback(
    (onStoreChange: () => void) => subscribeToCache(id, onStoreChange),
    [id],
  );

  // Reads the seeded entry — stable reference across calls until
  // setInCache replaces it. The seed block above guarantees get(id)
  // is non-undefined by the time useSyncExternalStore is reached, so
  // the non-null assertion is safe.
  const getSnapshot = useCallback((): HeartState => get(id)!, [id]);

  // Share the client snapshot identity — both must return the same
  // reference on server + client to avoid the "should be cached to
  // avoid an infinite loop" warning during hydration.
  const state = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const setState = useCallback(
    (next: HeartState) => {
      setInCache(id, next);
    },
    [id],
  );

  return { state, setState };
}
