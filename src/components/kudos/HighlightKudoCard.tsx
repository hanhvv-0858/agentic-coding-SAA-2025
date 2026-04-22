import Image from "next/image";
import type { Kudo } from "@/types/kudo";
import type { Messages } from "@/libs/i18n/getMessages";
import type { Locale } from "@/types/auth";
import { KudoParticipant } from "./KudoParticipant";
import { KudoImageRow } from "./KudoImageRow";
import { KudoHashtagRow } from "./KudoHashtagRow";
import { HeartButton } from "./HeartButton";
import { CopyLinkButton } from "./CopyLinkButton";
import { SeeDetailLink } from "./SeeDetailLink";
import { formatKudoTimestamp } from "@/libs/kudos/formatKudoTimestamp";

type HighlightKudoCardProps = {
  kudo: Kudo;
  messages: Messages;
  locale: Locale;
  /** Viewer id — passed through to `HeartButton` to lock self-heart. */
  viewerId?: string | null;
  authenticated?: boolean;
  onHeartError?: (message: string) => void;
  /**
   * Whether this card is the centered / active slide. Non-active slides
   * render without the elevation shadow (design-style §B.3).
   */
  isActive?: boolean;
};

/**
 * §B.3 HighlightKudoCard — compact centrepiece for the highlight
 * carousel. 528×hug body with 3-line clamp, cream fill + 4px cream
 * border + 16px radius. Reuses the same participant, image, hashtag,
 * heart, and copy-link atoms as the feed card so heart state stays in
 * sync via `heartsCache` (FR-009).
 */
export function HighlightKudoCard({
  kudo,
  messages,
  locale,
  viewerId = null,
  authenticated = true,
  onHeartError,
  isActive = false,
}: HighlightKudoCardProps) {
  const card = messages.kudos.card;
  const body = kudo.body ?? "";
  const primaryRecipient = kudo.recipients[0];
  const isSender = viewerId !== null && viewerId === kudo.sender_id;

  const shadowClass = isActive
    ? "shadow-[0_12px_32px_rgba(0,0,0,0.45),0_0_16px_rgba(255,234,158,0.18)]"
    : "";

  return (
    <article
      className={`flex w-[528px] max-w-full flex-col items-start gap-4 rounded-[var(--radius-highlight-card)] border-4 border-[var(--color-accent-cream)] bg-[var(--color-kudo-card)] px-8 pt-8 pb-4 ${shadowClass}`}
      data-testid="kudo-highlight-card"
      data-kudo-id={kudo.id}
      data-active={isActive ? "true" : "false"}
    >
      {/* Sender + sent-arrow + primary recipient row. 3-col grid with
          each participant centred in its half gives the wide breathing
          room shown in design; the icon sits dead-centre of the card. */}
      <div className="grid w-full grid-cols-[1fr_auto_1fr] items-start">
        <div className="flex justify-center">
          <KudoParticipant
            user={kudo.sender}
            monogramAlt={card.monogramAlt}
            isAnonymous={kudo.is_anonymous ?? false}
            anonymousLabel={card.anonymousSenderLabel}
            anonymousAvatarAlt={card.anonymousAvatarAlt}
          />
        </div>
        <div
          aria-hidden="true"
          className="flex h-16 w-16 items-center justify-center"
        >
          <Image
            src="/icons/ic_kudo_send@2x.png"
            alt=""
            width={64}
            height={64}
            className="h-7 w-7 select-none"
          />
        </div>
        <div className="flex justify-center">
          {primaryRecipient ? (
            <KudoParticipant
              user={primaryRecipient}
              monogramAlt={card.monogramAlt}
            />
          ) : null}
        </div>
      </div>

      {/* Cream hairline between participants and meta row (design §B.3). */}
      <hr
        aria-hidden="true"
        className="w-full border-0 border-t border-[var(--color-accent-cream)]"
      />

      {/* Timestamp — left-aligned on card surface, no dividers. */}
      <p className="font-[family-name:var(--font-montserrat)] text-sm font-bold leading-5 tracking-[0.5px] text-[var(--color-muted-grey)]">
        {formatKudoTimestamp(kudo.created_at, locale)}
      </p>

      {/* Kudo title (award category row — "IDOL GIỚI TRẺ"). */}
      {kudo.title ? (
        <p
          className="w-full text-center font-[family-name:var(--font-montserrat)] text-base font-bold leading-6 tracking-wide text-[var(--color-brand-900)]"
          data-testid="kudo-highlight-title"
        >
          {kudo.title}
        </p>
      ) : null}

      {/* Amber body panel (design §B.3 — thank-you message in warmer
          tint with cream outline). 4-line clamp. Body is TipTap-
          serialised HTML (see Viết Kudo FR-007 for schema safety). */}
      <div
        className="w-full rounded-2xl border border-[var(--color-accent-cream)] bg-[var(--color-accent-cream)]/40 p-5"
        data-testid="kudo-highlight-content-panel"
      >
        <div
          className="line-clamp-4 w-full text-center font-[family-name:var(--font-montserrat)] text-[18px] font-bold leading-7 text-[var(--color-brand-900)] [&_p]:m-0 [&_a]:underline [&_a]:text-[var(--color-error)]"
          data-testid="kudo-highlight-body"
          dangerouslySetInnerHTML={{ __html: body }}
        />
      </div>

      {/* Images — renders when `kudo.images` is non-empty. */}
      <KudoImageRow images={kudo.images ?? []} alt={card.imageAlt} />

      {/* Hashtags — read-only pills, same click-to-filter behaviour. */}
      <KudoHashtagRow hashtags={kudo.hashtags ?? []} />

      {/* Cream hairline between hashtags and action bar. */}
      <hr
        aria-hidden="true"
        className="w-full border-0 border-t border-[var(--color-accent-cream)]"
      />

      {/* Action bar — Heart · Copy Link · Xem chi tiết distributed. */}
      <div className="grid h-14 w-full grid-cols-[1fr_auto_auto] items-center gap-6">
        <HeartButton
          kudoId={kudo.id ?? ""}
          initialHeartsCount={kudo.hearts_count ?? 0}
          initialHasHearted={kudo.has_hearted}
          isSender={isSender}
          authenticated={authenticated}
          onError={onHeartError}
          labels={{
            add: card.heartAria,
            remove: card.heartAria,
            disabled: card.heartAriaDisabled,
            error: messages.kudos.error.heartError,
          }}
        />
        <CopyLinkButton
          kudoId={kudo.id ?? ""}
          labels={{
            copy: card.copyLinkLabel,
            copied: card.copyLinkSuccess,
            toast: card.copyLinkToast,
            errorToast: card.copyLinkError,
          }}
        />
        <SeeDetailLink
          kudoId={kudo.id ?? ""}
          label={card.seeDetailLabel}
          parkedToastMessage={messages.kudos.error.parkedToast}
        />
      </div>
    </article>
  );
}
