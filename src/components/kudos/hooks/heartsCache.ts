// Pure ES-module module-level cache of heart state per kudo, used by
// `HeartButton` (feed) and `HighlightHeartButton` (carousel) to stay in
// sync — satisfies spec FR-009 / plan §Shared heart sync.
//
// No React import here — `useHeartsCache` wraps this with
// `useSyncExternalStore` to participate in React's rendering model.

export type HeartState = {
  count: number;
  hearted: boolean;
};

type Listener = (value: HeartState) => void;

const cache = new Map<string, HeartState>();
const listeners = new Map<string, Set<Listener>>();

export function get(id: string): HeartState | undefined {
  return cache.get(id);
}

export function set(id: string, value: HeartState): void {
  const prev = cache.get(id);
  if (prev && prev.count === value.count && prev.hearted === value.hearted) {
    return;
  }
  cache.set(id, value);
  const subs = listeners.get(id);
  if (subs) {
    subs.forEach((fn) => fn(value));
  }
}

export function subscribe(id: string, listener: Listener): () => void {
  let subs = listeners.get(id);
  if (!subs) {
    subs = new Set();
    listeners.set(id, subs);
  }
  subs.add(listener);
  return () => {
    const current = listeners.get(id);
    if (!current) return;
    current.delete(listener);
    if (current.size === 0) listeners.delete(id);
  };
}

export function reset(): void {
  cache.clear();
  listeners.clear();
}

// Back-compat default export for consumers that prefer a namespace.
export const heartsCache = { get, set, subscribe, reset };
