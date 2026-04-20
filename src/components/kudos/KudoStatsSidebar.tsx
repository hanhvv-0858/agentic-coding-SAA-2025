import { StatsBlock } from "./StatsBlock";
import { LatestGiftRecipients } from "./LatestGiftRecipients";
import { InlineError } from "./InlineError";
import type { Messages } from "@/libs/i18n/getMessages";
import type { KudosStats, LatestGiftee } from "@/types/kudo";

type KudoStatsSidebarProps = {
  stats: KudosStats | null;
  giftees: LatestGiftee[];
  errored?: boolean;
  messages: Messages;
};

/**
 * §D KudoStatsSidebar — 422-wide sticky sidebar on desktop. Composes
 * the three sub-cards: D.1 StatsBlock (with inlined D.1.8 MoQuaCTA)
 * and D.3 LatestGiftRecipients. On viewports < 1024 px the parent
 * `page.tsx` grid drops the sticky column so the sidebar stacks
 * below the feed per FR-017.
 */
export function KudoStatsSidebar({
  stats,
  giftees,
  errored,
  messages,
}: KudoStatsSidebarProps) {
  if (errored || !stats) {
    return (
      <aside
        aria-label={messages.kudos.sidebar.statsTitle}
        className="flex w-full flex-col gap-6 lg:sticky lg:top-[calc(var(--header-h,72px)+24px)] lg:w-[422px]"
        data-testid="kudos-stats-sidebar"
      >
        <InlineError messages={messages} block="stats" />
      </aside>
    );
  }
  return (
    <aside
      aria-label={messages.kudos.sidebar.statsTitle}
      className="flex w-full flex-col items-start gap-6 lg:sticky lg:top-[calc(var(--header-h,72px)+24px)] lg:w-[422px]"
      data-testid="kudos-stats-sidebar"
    >
      <StatsBlock stats={stats} messages={messages} />
      <LatestGiftRecipients giftees={giftees} messages={messages} />
    </aside>
  );
}
