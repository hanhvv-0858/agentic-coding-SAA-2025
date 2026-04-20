"use client";

import {
  useCallback,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from "react";
import { toast } from "@/libs/toast";
import { track } from "@/libs/analytics/track";
import { HighlightKudoCard } from "./HighlightKudoCard";
import { CarouselPager } from "./CarouselPager";
import { useReducedMotion } from "./hooks/useReducedMotion";
import { Icon } from "@/components/ui/Icon";
import type { Kudo } from "@/types/kudo";
import type { Messages } from "@/libs/i18n/getMessages";
import type { Locale } from "@/types/auth";

type HighlightCarouselProps = {
  highlights: Kudo[];
  messages: Messages;
  locale: Locale;
  viewerId?: string | null;
  authenticated?: boolean;
  /** Default active slide index (center-biased — spec Q3 default = 2). */
  defaultIndex?: number;
};

// Swipe threshold in px — below this the pointer gesture is ignored.
const SWIPE_THRESHOLD_PX = 50;

/**
 * §B.2 HighlightCarousel — 5-slide highlight rail.
 *
 *   - Centered slide (active index) at full opacity + scale
 *   - Neighbours (±1) at opacity ~0.6, scale ~0.92
 *   - Edges (±2) at opacity ~0.3, scale ~0.85, partially peeking in
 *   - Arrow buttons + keyboard (ArrowLeft/Right, Home/End) + swipe
 *
 * Heart state stays in sync with the feed via the shared
 * `heartsCache` (FR-009) — `HighlightKudoCard` instantiates the same
 * `<HeartButton>` keyed on `kudo.id`, so flipping either card flips
 * the other within the same tab.
 */
export function HighlightCarousel({
  highlights,
  messages,
  locale,
  viewerId = null,
  authenticated = true,
  defaultIndex = 2,
}: HighlightCarouselProps): ReactNode {
  const total = highlights.length;
  const clampedDefault =
    total === 0 ? 0 : Math.max(0, Math.min(defaultIndex, total - 1));
  const [rawActiveIndex, setActiveIndex] = useState(clampedDefault);
  // Derive the bounded active index at render time so a mid-flight
  // shrink of `highlights` never points at a ghost slide — avoids the
  // React 19 `set-state-in-effect` pitfall.
  const activeIndex =
    total === 0 ? 0 : Math.max(0, Math.min(rawActiveIndex, total - 1));
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pointerStartRef = useRef<{ x: number; id: number } | null>(null);

  const go = useCallback(
    (next: number, direction: "prev" | "next") => {
      if (next < 0 || next >= total || next === activeIndex) return;
      track({
        type: "kudos_carousel_scroll",
        from_index: activeIndex,
        to_index: next,
      });
      // `direction` is emitted via the event shape above — kept as a
      // local for future hooks (e.g. analytics variant / focus
      // announcement). Silence the unused-var warning without noise.
      void direction;
      setActiveIndex(next);
    },
    [activeIndex, total],
  );

  const handlePrev = useCallback(() => {
    if (activeIndex <= 0) return;
    go(activeIndex - 1, "prev");
  }, [activeIndex, go]);

  const handleNext = useCallback(() => {
    if (activeIndex >= total - 1) return;
    go(activeIndex + 1, "next");
  }, [activeIndex, total, go]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (total === 0) return;
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          handlePrev();
          break;
        case "ArrowRight":
          e.preventDefault();
          handleNext();
          break;
        case "Home":
          e.preventDefault();
          if (activeIndex !== 0) go(0, "prev");
          break;
        case "End":
          e.preventDefault();
          if (activeIndex !== total - 1) go(total - 1, "next");
          break;
        default:
          break;
      }
    },
    [activeIndex, handleNext, handlePrev, go, total],
  );

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "touch" && e.pointerType !== "pen") return;
    pointerStartRef.current = { x: e.clientX, id: e.pointerId };
  };

  const handlePointerUp = (e: PointerEvent<HTMLDivElement>) => {
    const start = pointerStartRef.current;
    pointerStartRef.current = null;
    if (!start || start.id !== e.pointerId) return;
    const delta = e.clientX - start.x;
    if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
    if (delta < 0) handleNext();
    else handlePrev();
  };

  const handleHeartError = useCallback((message: string) => {
    toast({ message, role: "alert" });
  }, []);

  if (total === 0) {
    return null;
  }

  const canPrev = activeIndex > 0;
  const canNext = activeIndex < total - 1;

  // Per-slide offset math — keep the active slide centered. Slot
  // width is 528 px + 24 px gap → 552 px translate step. The track
  // itself is `transform: translateX(calc(50% - activeOffset))` so
  // the active slide lands in the middle of the viewport.
  const SLIDE_WIDTH = 528;
  const SLIDE_GAP = 24;
  const stepPx = SLIDE_WIDTH + SLIDE_GAP;

  const trackTransform = `translate3d(calc(50% - ${SLIDE_WIDTH / 2}px - ${
    activeIndex * stepPx
  }px), 0, 0)`;

  const trackStyle: React.CSSProperties = {
    transform: trackTransform,
    transition: reducedMotion ? "none" : "transform 300ms ease-out",
    willChange: "transform",
  };

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={messages.kudos.highlight.sectionTitle}
      className="relative flex w-full flex-col items-center gap-6"
      data-testid="kudo-highlight-carousel"
    >
      {/* Side nav arrows — sit outside the carousel track, white (design
          §B.2 — arrows flank the cream cards, sit in the dark margins). */}
      <button
        type="button"
        onClick={handlePrev}
        disabled={!canPrev}
        aria-disabled={!canPrev ? true : undefined}
        aria-label={messages.kudos.highlight.prevLabel}
        data-testid="kudo-highlight-side-prev"
        className="absolute -left-14 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-white transition-[background-color,opacity] duration-150 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none lg:flex"
      >
        <Icon name="chevron-left" size={32} />
      </button>
      <button
        type="button"
        onClick={handleNext}
        disabled={!canNext}
        aria-disabled={!canNext ? true : undefined}
        aria-label={messages.kudos.highlight.nextLabel}
        data-testid="kudo-highlight-side-next"
        className="absolute -right-14 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full text-white transition-[background-color,opacity] duration-150 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white motion-reduce:transition-none lg:flex"
      >
        <Icon name="chevron-right" size={32} />
      </button>

      <div
        ref={containerRef}
        tabIndex={0}
        role="group"
        aria-label={messages.kudos.highlight.sectionTitle}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          pointerStartRef.current = null;
        }}
        className="relative w-full overflow-hidden py-4 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-cream)]"
        style={{ touchAction: "pan-y" }}
        data-reduced-motion={reducedMotion ? "true" : "false"}
      >
        {/* Edge vignettes — fade the dimmed side slides into the dark
            background so only the peeking slivers stay visible (design
            §B.2 — cream cards recede behind a shadow gradient). The
            overlays sit above the track but below the side nav arrows
            (z-10) and let pointer events pass through to the cards. */}
        <div
          aria-hidden="true"
          data-testid="kudo-highlight-edge-left"
          className="pointer-events-none absolute inset-y-0 left-0 z-[5] w-[18%] bg-gradient-to-r from-[var(--color-brand-900)] to-transparent"
        />
        <div
          aria-hidden="true"
          data-testid="kudo-highlight-edge-right"
          className="pointer-events-none absolute inset-y-0 right-0 z-[5] w-[18%] bg-gradient-to-l from-[var(--color-brand-900)] to-transparent"
        />

        <div
          className="flex items-stretch gap-6"
          style={trackStyle}
          data-testid="kudo-highlight-track"
        >
          {highlights.map((kudo, idx) => {
            const distance = Math.abs(idx - activeIndex);
            const isActive = idx === activeIndex;
            let opacity = 1;
            let scale = 1;
            if (distance === 1) {
              opacity = 0.6;
              scale = 0.92;
            } else if (distance >= 2) {
              opacity = 0.3;
              scale = 0.85;
            }
            const slideStyle: React.CSSProperties = {
              opacity,
              transform: `scale(${scale})`,
              transition: reducedMotion
                ? "none"
                : "opacity 300ms ease-out, transform 300ms ease-out",
              flex: "0 0 auto",
            };
            return (
              <div
                key={kudo.id ?? idx}
                role="group"
                aria-roledescription="slide"
                aria-label={`Slide ${idx + 1} of ${total}`}
                aria-hidden={isActive ? undefined : true}
                data-testid="kudo-highlight-slide"
                data-active={isActive ? "true" : "false"}
                data-index={idx}
                style={slideStyle}
              >
                <HighlightKudoCard
                  kudo={kudo}
                  messages={messages}
                  locale={locale}
                  viewerId={viewerId}
                  authenticated={authenticated}
                  onHeartError={handleHeartError}
                  isActive={isActive}
                />
              </div>
            );
          })}
        </div>
      </div>
      <CarouselPager
        current={activeIndex + 1}
        total={total}
        canPrev={canPrev}
        canNext={canNext}
        onPrev={handlePrev}
        onNext={handleNext}
        labels={{
          prev: messages.kudos.highlight.prevLabel,
          next: messages.kudos.highlight.nextLabel,
          pagerTemplate: messages.kudos.highlight.pagerTemplate,
        }}
      />
    </div>
  );
}
