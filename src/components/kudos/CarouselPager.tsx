"use client";

import type { ReactNode } from "react";
import { Icon } from "@/components/ui/Icon";

export type CarouselPagerLabels = {
  /** "Kudo trước" / "Previous kudo". */
  prev: string;
  /** "Kudo sau" / "Next kudo". */
  next: string;
  /** "{current}/{total}" template — interpolated with active slide. */
  pagerTemplate: string;
};

export type CarouselPagerProps = {
  current: number; // 1-indexed
  total: number;
  canPrev: boolean;
  canNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  labels: CarouselPagerLabels;
};

/**
 * §B.5 CarouselPager — prev arrow · "n/N" text · next arrow.
 *
 * Edge states (US5 Acceptance 2/3): when the first/last slide is
 * active, the boundary arrow is visually and semantically disabled
 * (`aria-disabled="true"` + `disabled`) and clicks are ignored. Focus
 * stays on the button so screen-reader users can hear the disabled
 * state without being shuffled elsewhere.
 */
export function CarouselPager({
  current,
  total,
  canPrev,
  canNext,
  onPrev,
  onNext,
  labels,
}: CarouselPagerProps): ReactNode {
  const pagerAria = labels.pagerTemplate
    .replace("{current}", String(current))
    .replace("{total}", String(total));

  const arrowBase =
    "flex h-8 w-8 items-center justify-center rounded-full transition-[background-color,opacity] duration-150 motion-reduce:transition-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-cream)]";
  const arrowEnabled =
    "text-white hover:bg-white/10";
  const arrowDisabled =
    "text-white opacity-40 cursor-not-allowed";

  return (
    <div
      className="flex w-full flex-row items-center justify-center gap-4"
      data-testid="kudo-carousel-pager"
    >
      <button
        type="button"
        onClick={onPrev}
        disabled={!canPrev}
        aria-disabled={!canPrev ? true : undefined}
        aria-label={labels.prev}
        data-testid="kudo-carousel-prev"
        className={`${arrowBase} ${canPrev ? arrowEnabled : arrowDisabled}`}
      >
        <Icon name="chevron-left" size={20} />
      </button>
      <div
        className="flex items-baseline gap-0.5 font-[family-name:var(--font-montserrat)] font-bold"
        data-testid="kudo-carousel-pager-text"
        aria-label={pagerAria}
        aria-live="polite"
      >
        <span className="text-[32px] leading-[1] tracking-tight text-[var(--color-accent-cream)]">
          {current}
        </span>
        <span className="text-lg leading-[1] text-[color:var(--color-muted-grey)]">
          /{total}
        </span>
      </div>
      <button
        type="button"
        onClick={onNext}
        disabled={!canNext}
        aria-disabled={!canNext ? true : undefined}
        aria-label={labels.next}
        data-testid="kudo-carousel-next"
        className={`${arrowBase} ${canNext ? arrowEnabled : arrowDisabled}`}
      >
        <Icon name="chevron-right" size={20} />
      </button>
    </div>
  );
}
