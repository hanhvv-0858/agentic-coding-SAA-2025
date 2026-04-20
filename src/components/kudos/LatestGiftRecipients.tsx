import Image from "next/image";
import { EmptyState } from "./EmptyState";
import type { Messages } from "@/libs/i18n/getMessages";
import type { LatestGiftee } from "@/types/kudo";

type LatestGiftRecipientsProps = {
  giftees: LatestGiftee[];
  messages: Messages;
};

/**
 * §D.3 LatestGiftRecipients — dark cream-bordered card with the most
 * recent recipients the caller has sent a kudo to. Up to 10 rows of
 * `avatar 32×32 + name + gift description`. Empty array → neutral
 * empty-state (`gifteesEmpty` copy).
 */
export function LatestGiftRecipients({
  giftees,
  messages,
}: LatestGiftRecipientsProps) {
  return (
    <section
      aria-labelledby="kudos-latest-giftees-title"
      className="flex w-full flex-col items-start gap-2.5 rounded-[17px] border border-[var(--color-border-secondary)] bg-[var(--color-panel-surface)] pb-6 pl-6 pr-4 pt-6"
      data-testid="kudos-latest-giftees"
    >
      <h3
        id="kudos-latest-giftees-title"
        className="font-[family-name:var(--font-montserrat)] text-[22px] font-bold leading-8 text-[var(--color-accent-cream)]"
      >
        {messages.kudos.sidebar.latestGifteesTitle}
      </h3>
      {giftees.length === 0 ? (
        <EmptyState messages={messages} variant="gifteesEmpty" />
      ) : (
        <ul role="list" className="mt-2 flex w-full flex-col gap-3">
          {giftees.map((g) => (
            <li
              key={g.id}
              className="flex items-center gap-3 rounded px-2 py-1 transition hover:bg-[var(--color-accent-cream)]/[0.08]"
              data-testid="kudos-latest-giftee-row"
            >
              {g.avatarUrl ? (
                <Image
                  src={g.avatarUrl}
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8 flex-shrink-0 rounded-full object-cover"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-bold text-white"
                >
                  {(g.displayName[0] ?? "?").toUpperCase()}
                </span>
              )}
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-bold text-white">
                  {g.displayName}
                </span>
                {g.giftDescription ? (
                  <span className="truncate text-xs text-white/70">
                    {g.giftDescription}
                  </span>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
