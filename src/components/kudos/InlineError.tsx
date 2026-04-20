"use client";

import type { Messages } from "@/libs/i18n/getMessages";

type ErrorBlock = "feed" | "carousel" | "spotlight" | "stats";

type InlineErrorProps = {
  messages: Messages;
  block: ErrorBlock;
  onRetry?: () => void;
};

const COPY_KEY: Record<ErrorBlock, keyof Messages["kudos"]["error"]> = {
  feed: "feedError",
  carousel: "carouselError",
  spotlight: "spotlightError",
  stats: "statsError",
};

/**
 * §ErrorState — per-block inline error with Retry button (US9 #4).
 * Used by the `Promise.all(...).catch(...)` pattern in page.tsx when a
 * single Server Action rejects (plan §Phase 5 step 5.4).
 */
export function InlineError({ messages, block, onRetry }: InlineErrorProps) {
  const copy = messages.kudos.error[COPY_KEY[block]];
  const retryLabel = messages.kudos.error.retryLabel;
  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 py-12 text-center text-white"
      data-testid="kudos-inline-error"
      data-block={block}
    >
      <p>{copy}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="rounded-md border border-white/40 px-4 py-2 text-sm font-bold transition hover:bg-white/10 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-cream)]"
        >
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}
