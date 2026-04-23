import { SpotlightHeader } from "./SpotlightHeader";
import { SpotlightBoard } from "./SpotlightBoard";
import { SpotlightAutoRefresh } from "./SpotlightAutoRefresh";
import { EmptyState } from "./EmptyState";
import { InlineError } from "./InlineError";
import type { Messages } from "@/libs/i18n/getMessages";
import type { SpotlightLatestKudo, SpotlightRecipient } from "@/types/kudo";

type SpotlightSectionProps = {
  data: {
    total: number;
    recipients: SpotlightRecipient[];
    latestKudos: SpotlightLatestKudo[];
  } | null;
  errored?: boolean;
  messages: Messages;
};

/**
 * §B SpotlightSection — server wrapper that renders the B.6 header
 * then the B.7 client-side word-cloud island. Data comes from
 * `getSpotlight()` in `actions.ts` via the parent `page.tsx`
 * `Promise.all` tuple (plan §Data flow step 1).
 *
 * State resolution mirrors the All Kudos feed block:
 *   - errored → `<InlineError block="spotlight" />` (with Retry copy)
 *   - empty (0 recipients) → `<EmptyState variant="spotlightEmpty" />`
 *   - otherwise → the real word-cloud
 *
 * The pre-launch "demo mock" fallback that used `buildSpotlightMock()`
 * was removed (2026-04-23, user request) — we only render real DB data.
 */
export function SpotlightSection({
  data,
  errored,
  messages,
}: SpotlightSectionProps) {
  const recipients = data?.recipients ?? [];
  const total = data?.total ?? 0;
  const latestKudos = data?.latestKudos ?? [];
  const isEmpty = !errored && recipients.length === 0;

  return (
    <section
      id="spotlight"
      className="mx-auto w-full max-w-[1152px] px-4 pb-20 sm:px-8 2xl:max-w-[1400px] 2xl:px-12"
      aria-label={messages.kudos.spotlight.sectionTitle}
    >
      <SpotlightHeader messages={messages} />
      {/* 60 s auto-refresh so the board picks up new kudos without a
          manual reload. Visibility-gated (pauses when tab is hidden).
          Mounted here rather than in `page.tsx` so it only runs when
          the Spotlight is actually on screen. */}
      <SpotlightAutoRefresh />
      <div className="mt-6 flex w-full justify-center">
        {errored ? (
          <InlineError messages={messages} block="spotlight" />
        ) : isEmpty ? (
          <EmptyState messages={messages} variant="spotlightEmpty" />
        ) : (
          <SpotlightBoard
            recipients={recipients}
            total={total}
            latestKudos={latestKudos}
            messages={messages}
          />
        )}
      </div>
    </section>
  );
}
