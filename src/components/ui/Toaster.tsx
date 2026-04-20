"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import {
  dismissToast,
  getSnapshot,
  subscribe,
  TOAST_DEFAULT_DURATION,
  type Toast,
} from "@/libs/toast";
import { useReducedMotion } from "@/components/kudos/hooks/useReducedMotion";

// Mounted once at the app shell root (`src/app/layout.tsx`). Renders
// the visible toast queue from `src/libs/toast.ts`. Uses `role="status"`
// for info/success and `role="alert"` for errors per FR-013 / FR-022.
//
// Behaviour summary:
//   - Auto-dismiss after `duration` ms (default 3000); 0 disables.
//   - Pause-on-hover: mouseenter clears the timer; mouseleave restarts.
//   - Keyboard: Esc on a focused toast dismisses it.
//   - `prefers-reduced-motion: reduce` → fade-only (no slide).
//   - Max 3 visible — queue cap enforced inside `toast()` itself.

const EMPTY_TOASTS: readonly Toast[] = [];
const getServerSnapshot = (): readonly Toast[] => EMPTY_TOASTS;

export function Toaster() {
  const toasts = useSyncExternalStore<readonly Toast[]>(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const reducedMotion = useReducedMotion();

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed top-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2"
      data-testid="toaster-region"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} reducedMotion={reducedMotion} />
      ))}
    </div>
  );
}

function ToastItem({
  toast,
  reducedMotion,
}: {
  toast: Toast;
  reducedMotion: boolean;
}) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingRef = useRef<number>(toast.duration);
  // 0 sentinel — populated inside `schedule()` (effect / handler), so
  // we never call the impure `Date.now()` during render.
  const startRef = useRef<number>(0);

  const clear = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const schedule = (ms: number) => {
    clear();
    if (ms <= 0) return; // 0 → keep until manual close
    startRef.current = Date.now();
    timerRef.current = setTimeout(() => dismissToast(toast.id), ms);
  };

  useEffect(() => {
    schedule(toast.duration || TOAST_DEFAULT_DURATION);
    return clear;
    // toast.id is stable for the life of the component.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast.id]);

  const handleMouseEnter = () => {
    if (!timerRef.current) return;
    remainingRef.current = Math.max(
      0,
      remainingRef.current - (Date.now() - startRef.current),
    );
    clear();
  };

  const handleMouseLeave = () => {
    schedule(remainingRef.current);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      dismissToast(toast.id);
    }
  };

  const isError = toast.role === "alert";
  const surfaceClass = isError
    ? "bg-[var(--color-heart-active,#E11D48)] text-white"
    : "bg-[var(--color-accent-cream,#F5EBD7)] text-[var(--color-brand-900,#001824)]";

  // Reduced-motion path drops the slide-in keyframe; we still allow a
  // simple opacity transition so dismiss feels responsive.
  const animationStyle: React.CSSProperties | undefined = reducedMotion
    ? undefined
    : {
        animation: "kudo-toast-enter 180ms ease-out",
      };

  return (
    <div
      role={toast.role}
      tabIndex={0}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      style={animationStyle}
      data-testid="toast-item"
      data-toast-role={toast.role}
      className={`pointer-events-auto rounded-[var(--radius-pill,8px)] px-4 py-3 text-sm font-semibold shadow-[0_8px_24px_rgba(0,0,0,0.25)] transition-opacity duration-150 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-cream,#F5EBD7)] ${surfaceClass}`}
    >
      {toast.message}
    </div>
  );
}
