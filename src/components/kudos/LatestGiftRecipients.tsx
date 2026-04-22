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
      className="flex w-full flex-col items-stretch gap-6 rounded-[17px] border border-[var(--color-border-secondary)] bg-[var(--color-panel-surface)] px-6 py-8"
      data-testid="kudos-latest-giftees"
    >
      <h3
        id="kudos-latest-giftees-title"
        className="text-center font-[family-name:var(--font-montserrat)] text-lg font-bold uppercase leading-7 tracking-wide text-[var(--color-accent-cream)]"
      >
        {messages.kudos.sidebar.latestGifteesTitle}
      </h3>
      {giftees.length === 0 ? (
        <EmptyState messages={messages} variant="gifteesEmpty" />
      ) : (
        <ul role="list" className="flex w-full flex-col gap-4">
          {giftees.map((g) => (
            <li
              key={g.id}
              className="flex items-center gap-4 rounded-lg px-1 transition hover:bg-[var(--color-accent-cream)]/[0.08]"
              data-testid="kudos-latest-giftee-row"
            >
              {g.avatarUrl ? (
                <Image
                  src={g.avatarUrl}
                  alt=""
                  width={48}
                  height={48}
                  className="h-12 w-12 flex-shrink-0 rounded-full border-2 border-white object-cover"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-white bg-white/10 text-sm font-bold text-white"
                >
                  {(g.displayName[0] ?? "?").toUpperCase()}
                </span>
              )}
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-base font-bold leading-6 text-[var(--color-accent-cream)] font-[family-name:var(--font-montserrat)]">
                  {g.displayName}
                </span>
                {g.giftDescription ? (
                  <span className="truncate text-sm font-bold leading-5 text-white font-[family-name:var(--font-montserrat)]">
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
