import { SpotlightHeader } from "./SpotlightHeader";
import { SpotlightBoard } from "./SpotlightBoard";
import { InlineError } from "./InlineError";
import { buildSpotlightMock } from "@/libs/kudos/spotlightMock";
import type { Messages } from "@/libs/i18n/getMessages";
import type { SpotlightRecipient } from "@/types/kudo";

type SpotlightSectionProps = {
  data: { total: number; recipients: SpotlightRecipient[] } | null;
  errored?: boolean;
  messages: Messages;
};

/**
 * §B SpotlightSection — server wrapper that renders the B.6 header
 * then the B.7 client-side word-cloud island. Data comes from
 * `getSpotlight()` in `actions.ts` via the parent `page.tsx`
 * `Promise.all` tuple (plan §Data flow step 1). When the real endpoint
 * returns zero recipients (pre-launch / empty DB), we fall back to the
 * hand-seeded demo cloud so the section stays visually consistent with
 * the Figma mock (design §B.7 — 388 names across the panel).
 */
export function SpotlightSection({
  data,
  errored,
  messages,
}: SpotlightSectionProps) {
  const recipients = data?.recipients ?? [];
  const total = data?.total ?? 0;
  const usingMock = !errored && recipients.length === 0;
  const resolved = usingMock ? buildSpotlightMock() : { recipients, total };

  return (
    <section
      id="spotlight"
      className="mx-auto w-full max-w-[1152px] px-4 pb-20 sm:px-8 2xl:max-w-[1400px] 2xl:px-12"
      aria-label={messages.kudos.spotlight.sectionTitle}
    >
      <SpotlightHeader messages={messages} />
      <div className="mt-6 flex w-full justify-center">
        {errored ? (
          <InlineError messages={messages} block="spotlight" />
        ) : (
          <SpotlightBoard
            recipients={resolved.recipients}
            total={resolved.total}
            messages={messages}
          />
        )}
      </div>
    </section>
  );
}
