"use client";

import Image from "next/image";
import { useRef } from "react";
import { Icon } from "@/components/ui/Icon";
import { getInitials, pickMonogramColor } from "@/libs/kudos/monogram";
import type { KudoUser } from "@/types/kudo";
import type { Messages } from "@/libs/i18n/getMessages";
import { HONOUR_PILL_MAP, toHonourTier } from "./honourPills";
import { useTooltipAnchor } from "./hooks/useTooltipAnchor";
import { HonourTooltip } from "./HonourTooltip";
import { ProfilePreviewTooltip } from "./ProfilePreviewTooltip";

type KudoParticipantProps = {
  user: KudoUser;
  /** Aria-only label (design-style §17a/17b names are `<button>`s in later phases). */
  monogramAlt: string;
  /** When true, render the anonymous-sender variant per design round 4:
   *  grey circle + incognito icon instead of monogram, and a neutral
   *  "Người gửi ẩn danh" subline instead of CECV + honour pill. The
   *  caller supplies `user.display_name` = alias (already swapped
   *  server-side in `getKudoFeed`). */
  isAnonymous?: boolean;
  /** Localised "Người gửi ẩn danh" subline — only used when
   *  `isAnonymous=true`. Injected from messages so consumers can keep
   *  this component locale-agnostic. */
  anonymousLabel?: string;
  /** Localised alt text for the incognito avatar. */
  anonymousAvatarAlt?: string;
  /** When supplied, wires hover/tap tooltips onto the avatar+name
   *  (profile preview) and the honour pill (tier info). Anonymous
   *  senders never render tooltips, regardless of this prop. Optional
   *  to keep the component usable in display-only contexts (tests,
   *  screenshots) without an i18n catalogue. */
  messages?: Messages;
};

// `HONOUR_PILL_MAP` extracted to `./honourPills.ts` (T114a) so the
// ProfilePreviewTooltip + HonourTooltip components can reuse the same
// asset registry without duplicating the URLs/sizes.

/**
 * Shared render for sender (§17a) and recipient (§17b). 64×64 avatar +
 * display name + optional CECV code (grey small) + optional honour
 * title pill (dark navy with cream/red accent). Falls back to a monogram
 * circle (FR-016) when `avatar_url` is null.
 *
 * When `messages` is supplied, wires the US10 tooltips:
 *  - Profile preview on hover/tap of the avatar+name cluster.
 *  - Honour tooltip on hover/tap of the tier pill.
 */
export function KudoParticipant({
  user,
  monogramAlt,
  isAnonymous = false,
  anonymousLabel,
  anonymousAvatarAlt,
  messages,
}: KudoParticipantProps) {
  const name = user.display_name ?? "";
  const initials = getInitials(name);
  const bg = pickMonogramColor(user.id);
  const hasAvatar = Boolean(user.avatar_url);
  const honourCode = user.department_code ?? null;
  const honourTitle = user.honour_title ?? null;
  const honourTier = toHonourTier(honourTitle);

  const tooltipsEnabled = Boolean(messages) && !isAnonymous;
  const profileTriggerRef = useRef<HTMLButtonElement | null>(null);
  const pillTriggerRef = useRef<HTMLButtonElement | null>(null);

  // Always call hooks so the order stays stable; gate their work via
  // `tooltipsEnabled` at read time.
  const profileAnchor = useTooltipAnchor(profileTriggerRef, {
    tooltipWidth: 380,
    tooltipHeight: 360,
  });
  const pillAnchor = useTooltipAnchor(pillTriggerRef, {
    tooltipWidth: 304,
    tooltipHeight: 194,
  });

  const profileCluster = (
    <>
      <div
        className="relative h-16 w-16 overflow-hidden rounded-full"
        data-testid="kudo-participant-avatar"
      >
        {isAnonymous ? (
          <div
            role="img"
            aria-label={anonymousAvatarAlt ?? monogramAlt}
            className="flex h-full w-full items-center justify-center bg-[var(--color-border-secondary)]/30 text-[var(--color-brand-900)]"
            data-testid="kudo-participant-anonymous-avatar"
          >
            <Icon name="incognito" size={36} />
          </div>
        ) : hasAvatar ? (
          <Image
            src={user.avatar_url as string}
            alt={name || monogramAlt}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <div
            role="img"
            aria-label={name || monogramAlt}
            className="flex h-full w-full items-center justify-center text-lg font-bold text-[var(--color-brand-900)]"
            style={{ backgroundColor: bg }}
            data-testid="kudo-participant-monogram"
          >
            {initials}
          </div>
        )}
      </div>
      <span className="text-center font-[family-name:var(--font-montserrat)] text-base font-bold leading-6 text-[var(--color-brand-900)]">
        {name || monogramAlt}
      </span>
    </>
  );

  const pillImage =
    !isAnonymous && honourTier
      ? (() => {
          const pill = HONOUR_PILL_MAP[honourTier];
          return (
            <Image
              src={pill.src}
              alt={honourTier}
              width={pill.width}
              height={pill.height}
              className="h-5 w-auto select-none"
              data-testid="kudo-participant-honour"
            />
          );
        })()
      : honourTitle && !isAnonymous ? (
          <span
            className="inline-flex items-center rounded-full bg-[var(--color-brand-900)] px-2.5 py-0.5 font-[family-name:var(--font-montserrat)] text-[11px] font-bold leading-4 tracking-wide text-[var(--color-accent-cream)]"
            data-testid="kudo-participant-honour"
          >
            {honourTitle}
          </span>
        ) : null;

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      {tooltipsEnabled ? (
        <button
          ref={profileTriggerRef}
          type="button"
          data-testid="kudo-participant-profile-trigger"
          aria-label={name || monogramAlt}
          onPointerEnter={profileAnchor.triggerHandlers.onPointerEnter}
          onPointerLeave={profileAnchor.triggerHandlers.onPointerLeave}
          onFocus={profileAnchor.triggerHandlers.onFocus}
          onBlur={profileAnchor.triggerHandlers.onBlur}
          onClick={profileAnchor.triggerHandlers.onClick}
          onKeyDown={profileAnchor.triggerHandlers.onKeyDown}
          className="flex flex-col items-center gap-2 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-cream)]"
        >
          {profileCluster}
        </button>
      ) : (
        profileCluster
      )}
      {isAnonymous ? (
        <span
          className="font-[family-name:var(--font-montserrat)] text-xs font-bold leading-4 tracking-wide text-[var(--color-muted-grey)]"
          data-testid="kudo-participant-anonymous-label"
        >
          {anonymousLabel ?? "Người gửi ẩn danh"}
        </span>
      ) : honourCode || honourTitle ? (
        <div className="flex items-center gap-2">
          {honourCode ? (
            <span
              className="font-[family-name:var(--font-montserrat)] text-xs font-bold leading-4 tracking-wide text-[var(--color-muted-grey)]"
              data-testid="kudo-participant-code"
            >
              {honourCode}
            </span>
          ) : null}
          {pillImage ? (
            tooltipsEnabled && honourTier ? (
              <button
                ref={pillTriggerRef}
                type="button"
                data-testid="kudo-participant-pill-trigger"
                aria-label={honourTier}
                onPointerEnter={pillAnchor.triggerHandlers.onPointerEnter}
                onPointerLeave={pillAnchor.triggerHandlers.onPointerLeave}
                onFocus={pillAnchor.triggerHandlers.onFocus}
                onBlur={pillAnchor.triggerHandlers.onBlur}
                onClick={pillAnchor.triggerHandlers.onClick}
                onKeyDown={pillAnchor.triggerHandlers.onKeyDown}
                className="rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-cream)]"
              >
                {pillImage}
              </button>
            ) : (
              pillImage
            )
          ) : null}
        </div>
      ) : null}

      {tooltipsEnabled && messages ? (
        <>
          <ProfilePreviewTooltip
            userId={user.id}
            open={profileAnchor.open}
            position={profileAnchor.position}
            tooltipHandlers={profileAnchor.tooltipHandlers}
            onClose={profileAnchor.close}
            messages={messages}
          />
          {honourTier ? (
            <HonourTooltip
              tier={honourTier}
              open={pillAnchor.open}
              position={pillAnchor.position}
              tooltipHandlers={pillAnchor.tooltipHandlers}
              messages={messages}
            />
          ) : null}
        </>
      ) : null}
    </div>
  );
}
