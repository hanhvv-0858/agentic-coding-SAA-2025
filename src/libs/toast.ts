// Lightweight in-house toast pub/sub. Mirrors the
// `src/components/kudos/hooks/heartsCache.ts` pattern — a module-level
// emitter with explicit subscribe/emit so non-React callers (server
// actions, plain async helpers, analytics) can `toast()` without a
// React context. The visible `<Toaster />` (src/components/ui/Toaster.tsx)
// subscribes once and renders the queue.
//
// Spec: FR-013 + FR-022 — global ARIA-live region for screen-reader
// announcement of copy-link success / heart errors / parked-route
// fallbacks. Phase 6 / US5 (T069).

export type ToastRole = "status" | "alert";

export type ToastInput = {
  message: string;
  /** Defaults to `"status"` (polite). Use `"alert"` for errors. */
  role?: ToastRole;
  /** Auto-dismiss in ms. Defaults to 3000; pass 0 to keep until manual close. */
  duration?: number;
};

export type Toast = {
  id: number;
  message: string;
  role: ToastRole;
  duration: number;
};

type Listener = (toasts: Toast[]) => void;

const DEFAULT_DURATION = 3000;
// Spec note: queue cap of 3 visible — overflow drops the oldest.
const MAX_VISIBLE = 3;

let nextId = 1;
let queue: Toast[] = [];
const listeners = new Set<Listener>();

function emit(): void {
  // Listener copy-on-iterate so an unsubscribe during dispatch is safe.
  for (const fn of Array.from(listeners)) {
    fn(queue);
  }
}

export function getSnapshot(): Toast[] {
  return queue;
}

export function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Push a toast onto the global queue. Safe to call from any module
 * (client or server) — server-side calls degrade to a console.log so
 * they don't crash SSR.
 */
export function toast(input: ToastInput): number {
  if (typeof window === "undefined") {
    // Server — log + return 0; the visible queue lives only in the browser.
    console.log(JSON.stringify({ toast: input.message, role: input.role ?? "status" }));
    return 0;
  }
  const next: Toast = {
    id: nextId++,
    message: input.message,
    role: input.role ?? "status",
    duration: input.duration ?? DEFAULT_DURATION,
  };
  // Drop oldest if we're at the visible cap.
  const merged = [...queue, next];
  queue = merged.length > MAX_VISIBLE ? merged.slice(merged.length - MAX_VISIBLE) : merged;
  emit();
  return next.id;
}

/** Remove a toast by id. No-op if it's already been dismissed. */
export function dismissToast(id: number): void {
  const before = queue.length;
  queue = queue.filter((t) => t.id !== id);
  if (queue.length !== before) emit();
}

/** Clear every toast — primarily for tests. */
export function resetToasts(): void {
  queue = [];
  nextId = 1;
  emit();
}

export const TOAST_DEFAULT_DURATION = DEFAULT_DURATION;
export const TOAST_MAX_VISIBLE = MAX_VISIBLE;
