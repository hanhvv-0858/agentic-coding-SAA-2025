import { vi } from "vitest";

/**
 * Shared Vitest helper for stubbing `window.matchMedia` across the
 * kudos reduced-motion + responsive suites. Referenced by Phase 10
 * T097 — factored out of per-component matchMedia stubs so every
 * reduced-motion test uses the same shape.
 *
 * Usage:
 * ```ts
 * import { mockMatchMedia } from "@/test-utils/mockMatchMedia";
 *
 * beforeEach(() => {
 *   mockMatchMedia({ reducedMotion: true });
 * });
 * ```
 *
 * The returned `restore()` removes the stub so a subsequent test can
 * re-initialise with different flags. Callers that want live
 * listener dispatch (e.g. `useReducedMotion` flip tests) can call
 * `fire()` to push a new `matches` value through every subscribed
 * `MediaQueryList` listener.
 */

type MockOptions = {
  /** When true, `(prefers-reduced-motion: reduce)` matches. */
  reducedMotion?: boolean;
  /**
   * Optional explicit map from media-query string → matches. Wins over
   * `reducedMotion` for any key present here.
   */
  queries?: Record<string, boolean>;
};

type Listener = (event: MediaQueryListEvent) => void;

export type MockMatchMediaHandle = {
  restore: () => void;
  /**
   * Dispatch a new `matches` value to every listener subscribed to
   * `query`. Mirrors a browser-issued `change` event.
   */
  fire: (query: string, matches: boolean) => void;
};

const QUERY_REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

export function mockMatchMedia(opts: MockOptions = {}): MockMatchMediaHandle {
  const original = typeof window !== "undefined" ? window.matchMedia : undefined;
  const queries: Record<string, boolean> = {
    [QUERY_REDUCED_MOTION]: opts.reducedMotion === true,
    ...(opts.queries ?? {}),
  };

  const listenerMap = new Map<string, Set<Listener>>();
  const mqlMap = new Map<string, MediaQueryList>();

  function ensureMql(query: string): MediaQueryList {
    const existing = mqlMap.get(query);
    if (existing) return existing;
    const listeners = new Set<Listener>();
    listenerMap.set(query, listeners);
    const mql = {
      matches: queries[query] ?? false,
      media: query,
      addEventListener: (_: string, cb: Listener) => {
        listeners.add(cb);
      },
      removeEventListener: (_: string, cb: Listener) => {
        listeners.delete(cb);
      },
      addListener: (cb: Listener) => {
        listeners.add(cb);
      },
      removeListener: (cb: Listener) => {
        listeners.delete(cb);
      },
      dispatchEvent: () => true,
      onchange: null,
    } as unknown as MediaQueryList;
    mqlMap.set(query, mql);
    return mql;
  }

  const impl = vi.fn((query: string) => ensureMql(query));

  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: impl,
  });

  return {
    restore() {
      if (original) {
        Object.defineProperty(window, "matchMedia", {
          configurable: true,
          writable: true,
          value: original,
        });
      } else {
        // Cannot fully remove — leave the stub so React's subsequent
        // renders in the same test file still see a function.
      }
    },
    fire(query: string, matches: boolean) {
      queries[query] = matches;
      const mql = mqlMap.get(query);
      if (mql) (mql as { matches: boolean }).matches = matches;
      const listeners = listenerMap.get(query);
      if (!listeners) return;
      for (const listener of listeners) {
        listener({ matches, media: query } as unknown as MediaQueryListEvent);
      }
    },
  };
}
