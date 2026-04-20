"use client";

import { useState, useTransition } from "react";
import { getKudoFeed } from "@/app/kudos/actions";
import { toast } from "@/libs/toast";
import { KudoPostCard } from "./KudoPostCard";
import type { Kudo, FeedPage, FilterState } from "@/types/kudo";
import type { Messages } from "@/libs/i18n/getMessages";
import type { Locale } from "@/types/auth";

type KudoListClientProps = {
  initialPage: FeedPage;
  filters: FilterState;
  messages: Messages;
  locale: Locale;
  /** Viewer's user id — passed down so cards can disable own-kudo hearts. */
  viewerId?: string | null;
  /** Signed-in probe — routes clicks to /login when false. */
  authenticated?: boolean;
};

/**
 * §C.2 Feed list — client wrapper around the SSR'd initial page.
 * Renders each kudo via `<KudoPostCard>`; exposes a Load More button
 * (Q1 default — NOT infinite scroll, per plan §Open Questions).
 *
 * The FR-009 `heartsCache` subscriber wiring lands in Phase 5 / US4;
 * Phase 3 uses only the inert `has_hearted` field from SSR.
 */
export function KudoListClient({
  initialPage,
  filters,
  messages,
  locale,
  viewerId = null,
  authenticated = true,
}: KudoListClientProps) {
  const [items, setItems] = useState<Kudo[]>(initialPage.items);
  const [cursor, setCursor] = useState<string | null>(initialPage.nextCursor);
  const [hasMore, setHasMore] = useState<boolean>(initialPage.hasMore);
  const [isPending, startTransition] = useTransition();
  // Phase 6 / US5 — heart errors now route through the global
  // `<Toaster />` mounted at the app shell root (`src/app/layout.tsx`).
  // The Phase 5 sr-only placeholder region has been retired.
  const handleHeartError = (message: string) => {
    toast({ message, role: "alert" });
  };

  const loadMore = () => {
    if (!cursor || !hasMore) return;
    startTransition(async () => {
      const next = await getKudoFeed(filters, cursor);
      setItems((prev) => [...prev, ...next.items]);
      setCursor(next.nextCursor);
      setHasMore(next.hasMore);
    });
  };

  return (
    <div className="flex flex-col items-center gap-6">
      {items.map((k) => (
        <KudoPostCard
          key={k.id}
          kudo={k}
          messages={messages}
          locale={locale}
          viewerId={viewerId}
          authenticated={authenticated}
          onHeartError={handleHeartError}
        />
      ))}
      {hasMore ? (
        <button
          type="button"
          onClick={loadMore}
          disabled={isPending}
          className="rounded-[var(--radius-pill)] border border-[var(--color-accent-cream)]/70 px-6 py-3 text-[var(--color-accent-cream)] transition hover:bg-[var(--color-accent-cream)]/20 disabled:opacity-50 focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-cream)]"
        >
          {messages.kudos.feed.loadMore}
        </button>
      ) : (
        <p className="py-6 text-center text-sm text-white/60">
          {messages.kudos.feed.endOfList}
        </p>
      )}
    </div>
  );
}
