import Image from "next/image";
import type { Kudo } from "@/types/kudo";
import type { Messages } from "@/libs/i18n/getMessages";
import type { Locale } from "@/types/auth";
import { KudoParticipant } from "./KudoParticipant";
import { KudoImageRow } from "./KudoImageRow";
import { KudoHashtagRow } from "./KudoHashtagRow";
import { HeartButton } from "./HeartButton";
import { CopyLinkButton } from "./CopyLinkButton";
import { formatKudoTimestamp } from "@/libs/kudos/formatKudoTimestamp";
import { Icon } from "@/components/ui/Icon";

type KudoPostCardProps = {
  kudo: Kudo;
  messages: Messages;
  locale: Locale;
  /** Viewer's user id — used to toggle sender-disabled state (FR-006). */
  viewerId?: string | null;
  /** Viewer signed-in probe — false → HeartButton redirects to /login. */
  authenticated?: boolean;
  /** Hoisted error handler (toast) from the list wrapper. */
  onHeartError?: (message: string) => void;
};

/**
 * §17 KudoPostCard — cream card that composes the 7 (actually 8 with
 * the sent-arrow glyph) inner slots per design-style.md:
 *
 *   sender (17a) → sent-icon (17c) → recipient (17b) → timestamp (17d)
 *   body (17e) → images (17f) → hashtags (17g) → action bar (17h).
 *
 * Server Component — no interactivity in Phase 3. The action-bar slot
 * renders a non-interactive heart+count placeholder + a disabled
 * copy-link icon; real HeartButton + CopyLinkButton are client islands
 * added in Phase 5 / US4 and Phase 6 / US5.
 */
export function KudoPostCard({
  kudo,
  messages,
  locale,
  viewerId = null,
  authenticated = true,
  onHeartError,
}: KudoPostCardProps) {
  const card = messages.kudos.card;
  const body = kudo.body ?? "";
  const primaryRecipient = kudo.recipients[0];
  const isSender = viewerId !== null && viewerId === kudo.sender_id;
  const images = kudo.images ?? [];
  return (
    <article
      className="flex w-full max-w-[680px] flex-col items-stretch gap-4 rounded-[var(--radius-kudo-card)] bg-[var(--color-kudo-card)] px-10 pt-10 pb-4 shadow-[var(--shadow-kudo-card)]"
      data-testid="kudo-post-card"
      data-kudo-id={kudo.id}
    >
      {/* Sender → send-icon → primary recipient row. 3-col grid:
          each participant CENTRED within its half (justify-center)
          gives the wide breathing room shown in design §17. The icon
          sits dead-centre of the card regardless of participant
          column widths (honour pill / anonymous nickname, etc.). */}
      <div className="grid w-full grid-cols-[1fr_auto_1fr] items-start">
        <div className="flex justify-center">
          <KudoParticipant
            user={kudo.sender}
            monogramAlt={card.monogramAlt}
            isAnonymous={kudo.is_anonymous ?? false}
            anonymousLabel={card.anonymousSenderLabel}
            anonymousAvatarAlt={card.anonymousAvatarAlt}
            messages={messages}
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
            className="h-8 w-8 select-none"
          />
        </div>
        <div className="flex justify-center">
          {primaryRecipient ? (
            <KudoParticipant
              user={primaryRecipient}
              monogramAlt={card.monogramAlt}
              messages={messages}
            />
          ) : null}
        </div>
      </div>

      {/* Section divider between participants and the meta row. */}
      <hr
        aria-hidden="true"
        className="w-full border-0 border-t border-[var(--color-accent-cream)]"
      />

      {/* Timestamp (§17d) — left-aligned on its own row. */}
      <p className="w-full font-[family-name:var(--font-montserrat)] text-sm font-bold leading-5 tracking-[0.5px] text-[var(--color-muted-grey)]">
        {formatKudoTimestamp(kudo.created_at, locale)}
      </p>

      {/* Kudo title (§17 — "IDOL GIỚI TRẺ") + edit pencil on the same
          row per design. Grid keeps the title geometrically centred
          while the pencil sits flush right. The left cell is an
          invisible spacer that mirrors the pencil's 32×32 footprint so
          the title stays on the card's centre-line. */}
      {(kudo.title || isSender) && (
        <div className="grid w-full grid-cols-[32px_1fr_32px] items-center gap-4">
          <span aria-hidden="true" className="h-8 w-8" />
          {kudo.title ? (
            <p
              className="text-center font-[family-name:var(--font-montserrat)] text-base font-bold leading-6 tracking-wide text-[var(--color-brand-900)]"
              data-testid="kudo-title"
            >
              {kudo.title}
            </p>
          ) : (
            <span />
          )}
          {isSender ? (
            <button
              type="button"
              aria-label={card.editAria}
              data-testid="kudo-edit-button"
              className="inline-flex h-8 w-8 items-center justify-center justify-self-end rounded text-[var(--color-brand-900)] transition hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-cream)] cursor-pointer"
            >
              <Icon name="pencil" size={24} />
            </button>
          ) : (
            <span />
          )}
        </div>
      )}

      {/* Amber content panel (§17e — ONLY the thank-you message sits in
          the warmer tint per the v3 Figma). 4-line clamp. Cream outline
          matches the design §17e border. */}
      <div
        className="w-full rounded-2xl border border-[var(--color-accent-cream)] bg-[var(--color-accent-cream)]/40 p-5"
        data-testid="kudo-content-panel"
      >
        {/* Body is TipTap-serialised HTML (stored in `kudos.body`). We
            render via dangerouslySetInnerHTML because TipTap's schema
            already strips `<script>` / `<iframe>` / unsafe attributes on
            compose (Viết Kudo FR-007). `[&_p]:m-0` flattens the inner
            paragraph margins so line-clamp on the wrapper still works. */}
        <div
          className="line-clamp-4 w-full cursor-pointer text-center font-[family-name:var(--font-montserrat)] text-[20px] font-bold leading-7 text-[var(--color-brand-900)] [&_p]:m-0 [&_a]:underline [&_a]:text-[var(--color-error)]"
          data-testid="kudo-body"
          dangerouslySetInnerHTML={{ __html: body }}
        />
      </div>

      {/* Images (§17f) — outside the amber panel. */}
      <KudoImageRow images={images} alt={card.imageAlt} />

      {/* Hashtags (§17g) — red, outside the amber panel. */}
      <KudoHashtagRow hashtags={kudo.hashtags ?? []} />

      {/* Section divider between hashtags and the action bar. */}
      <hr
        aria-hidden="true"
        className="w-full border-0 border-t border-[var(--color-accent-cream)]"
      />

      {/* Action bar (§17h) — Heart (left, count-left-of-icon) · Copy Link
          right. "Xem chi tiết" removed per new design. */}
      <div className="flex h-14 w-full flex-row items-center justify-between gap-6">
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
      </div>
    </article>
  );
}
