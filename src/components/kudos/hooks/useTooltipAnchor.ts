"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";

// Dwell + pointer-leave timing (design-style §28).
const HOVER_OPEN_DELAY_MS = 400;
const HOVER_CLOSE_DELAY_MS = 200;

export type TooltipPosition = {
  /** Viewport-relative `left` in px; pair with `position: fixed`. */
  left: number;
  /** Viewport-relative `top`. */
  top: number;
  /** Which side of the trigger the tooltip mounted on — "below" is
   *  preferred; "above" is used when there isn't room below. Consumers
   *  can use this to flip arrow decorations if they add one. */
  placement: "above" | "below";
};

export type UseTooltipAnchorOptions = {
  /** Target size — used to decide above/below and clamp inside viewport. */
  tooltipWidth: number;
  tooltipHeight: number;
  /** Gap between trigger and tooltip edge in px. */
  offset?: number;
};

export type UseTooltipAnchorResult = {
  open: boolean;
  position: TooltipPosition;
  /** Spread on the **trigger** element (the avatar/name/pill button). */
  triggerHandlers: {
    onPointerEnter: () => void;
    onPointerLeave: () => void;
    onFocus: () => void;
    onBlur: () => void;
    onClick: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
  };
  /** Spread on the **tooltip surface** so leaving the surface (not just
   *  the trigger) cancels the close timer. */
  tooltipHandlers: {
    onPointerEnter: () => void;
    onPointerLeave: () => void;
  };
  /** Explicit close — for CTA clicks inside the tooltip that navigate away. */
  close: () => void;
};

/**
 * §US10 tooltip anchor hook — shared by `<ProfilePreviewTooltip>` and
 * `<HonourTooltip>`. Implements the behavioural contract:
 *
 *   - Pointer (`@media (hover: hover)`): dwell 400 ms to open, leave
 *     200 ms to close, cancel-on-reenter.
 *   - Touch (`@media (hover: none)`): first tap opens; tap-outside OR
 *     second tap on trigger closes. Per Q20 option (a).
 *   - `Esc` closes regardless of input modality.
 *   - `Enter` / `Space` on trigger opens — for keyboard users (e.g. the
 *     Spotlight roving-tabindex users per Q8).
 *
 * Positioning is viewport-relative (`position: fixed`); the consumer is
 * expected to render the tooltip with `style={{ left, top }}`. We flip
 * above/below based on available space so the card never clips the
 * viewport bottom.
 */
export function useTooltipAnchor(
  triggerRef: RefObject<HTMLElement | null>,
  options: UseTooltipAnchorOptions,
): UseTooltipAnchorResult {
  const { tooltipWidth, tooltipHeight } = options;
  const offset = options.offset ?? 8;

  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<TooltipPosition>({
    left: 0,
    top: 0,
    placement: "below",
  });

  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointerOverTooltipRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (openTimerRef.current !== null) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const openNow = useCallback(() => {
    clearTimers();
    setOpen(true);
  }, [clearTimers]);

  const closeNow = useCallback(() => {
    clearTimers();
    setOpen(false);
  }, [clearTimers]);

  // Re-compute position whenever the tooltip opens, on scroll, or on
  // resize so it tracks the trigger. `useLayoutEffect` runs before the
  // browser paints so there's no flash at `(0, 0)`.
  useLayoutEffect(() => {
    if (!open) return;
    const updatePosition = () => {
      const el = triggerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const viewportWidth = window.innerWidth;

      const roomBelow = viewportHeight - rect.bottom;
      const roomAbove = rect.top;
      const placement: "above" | "below" =
        roomBelow >= tooltipHeight + offset || roomBelow >= roomAbove
          ? "below"
          : "above";

      const top =
        placement === "below"
          ? rect.bottom + offset
          : rect.top - tooltipHeight - offset;

      // Center horizontally on the trigger; clamp to viewport with 12 px margin.
      const triggerCenter = rect.left + rect.width / 2;
      const desiredLeft = triggerCenter - tooltipWidth / 2;
      const left = Math.max(
        12,
        Math.min(viewportWidth - tooltipWidth - 12, desiredLeft),
      );

      setPosition({ left, top, placement });
    };
    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open, tooltipWidth, tooltipHeight, offset, triggerRef]);

  // Esc closes. Bound on open so the hook doesn't hoard global listeners.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        closeNow();
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey, true);
    return () => document.removeEventListener("keydown", onKey, true);
  }, [open, closeNow, triggerRef]);

  // Outside-click / outside-tap closes (covers both pointer + touch).
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: Event) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      // The tooltip itself is a portal sibling — consumers add
      // `data-tooltip-surface="true"` on the root so we know to ignore
      // clicks inside it.
      let node: Node | null = target;
      while (node && node instanceof Element) {
        if (node.getAttribute?.("data-tooltip-surface") === "true") return;
        node = node.parentNode;
      }
      closeNow();
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [open, closeNow, triggerRef]);

  const clearAllTimersOnUnmount = useCallback(() => clearTimers(), [clearTimers]);
  useEffect(() => clearAllTimersOnUnmount, [clearAllTimersOnUnmount]);

  // On pointer devices we dwell 400 ms before opening; touch devices
  // skip the dwell (first tap = open). `matchMedia` captures the
  // device at call time — if the user docks/undocks mid-session we'd
  // need to re-check, but that edge is low priority.
  const isPointerDevice = useCallback(() => {
    if (typeof window === "undefined") return true;
    return window.matchMedia("(hover: hover)").matches;
  }, []);

  const onPointerEnter = useCallback(() => {
    if (!isPointerDevice()) return;
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    if (open || openTimerRef.current !== null) return;
    openTimerRef.current = setTimeout(() => {
      openTimerRef.current = null;
      setOpen(true);
    }, HOVER_OPEN_DELAY_MS);
  }, [isPointerDevice, open]);

  const onPointerLeave = useCallback(() => {
    if (!isPointerDevice()) return;
    if (openTimerRef.current !== null) {
      clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (!open) return;
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      if (!pointerOverTooltipRef.current) setOpen(false);
    }, HOVER_CLOSE_DELAY_MS);
  }, [isPointerDevice, open]);

  const onFocus = useCallback(() => openNow(), [openNow]);
  const onBlur = useCallback(() => {
    // Close on blur only if focus is moving OUTSIDE the tooltip surface.
    // The portal sibling handles its own internal focus-cycle via Tab.
    closeTimerRef.current = setTimeout(() => {
      if (!pointerOverTooltipRef.current) setOpen(false);
    }, HOVER_CLOSE_DELAY_MS);
  }, []);

  const onClick = useCallback(() => {
    if (isPointerDevice()) {
      // Pointer device: click is already handled by hover dwell, but
      // keyboard-Enter fires onClick too. If not open yet, open now.
      if (!open) openNow();
      return;
    }
    // Touch device: tap-toggle.
    if (open) {
      closeNow();
    } else {
      openNow();
    }
  }, [isPointerDevice, open, openNow, closeNow]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openNow();
      }
    },
    [openNow],
  );

  const onTooltipPointerEnter = useCallback(() => {
    pointerOverTooltipRef.current = true;
    if (closeTimerRef.current !== null) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const onTooltipPointerLeave = useCallback(() => {
    pointerOverTooltipRef.current = false;
    if (!isPointerDevice()) return;
    closeTimerRef.current = setTimeout(() => {
      closeTimerRef.current = null;
      setOpen(false);
    }, HOVER_CLOSE_DELAY_MS);
  }, [isPointerDevice]);

  return {
    open,
    position,
    triggerHandlers: {
      onPointerEnter,
      onPointerLeave,
      onFocus,
      onBlur,
      onClick,
      onKeyDown,
    },
    tooltipHandlers: {
      onPointerEnter: onTooltipPointerEnter,
      onPointerLeave: onTooltipPointerLeave,
    },
    close: closeNow,
  };
}
