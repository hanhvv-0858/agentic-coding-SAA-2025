"use client";

import Image from "next/image";
import { useEffect, useId, useState, type ReactElement } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import type { Messages } from "@/libs/i18n/getMessages";
import { HONOUR_PILL_MAP, toHonourTier } from "./honourPills";
import type { TooltipPosition } from "./hooks/useTooltipAnchor";
import { getProfilePreview, type ProfilePreview } from "@/app/kudos/actions";

export type ProfilePreviewTooltipProps = {
  userId: string;
  /** Controlled visibility — parent owns the `useTooltipAnchor` hook. */
  open: boolean;
  position: TooltipPosition;
  tooltipHandlers: {
    onPointerEnter: () => void;
    onPointerLeave: () => void;
  };
  /** Called when the CTA is clicked — usually `close()` from the hook. */
  onClose: () => void;
  messages: Messages;
};

// Card dimensions from design-style §27.1 (inferred — flagged in §29).
const TOOLTIP_WIDTH = 380;

// Session-scoped cache with 60 s TTL (Q17 — lazy fetch + memoise).
const CACHE_TTL_MS = 60_000;
type CacheEntry = { payload: ProfilePreview; expiresAt: number };
const cache = new Map<string, CacheEntry>();

function getCached(userId: string): ProfilePreview | null {
  const entry = cache.get(userId);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(userId);
    return null;
  }
  return entry.payload;
}

function setCached(userId: string, payload: ProfilePreview): void {
  cache.set(userId, { payload, expiresAt: Date.now() + CACHE_TTL_MS });
}

// Test-only escape hatch — Vitest's module state persists across tests;
// clear the cache between hovers so assertions on fetch-call-count stay
// accurate. Not exported in production bundles (`NODE_ENV === "test"`
// guards the call site in tests).
export function __resetProfilePreviewCacheForTests(): void {
  cache.clear();
}

/**
 * §27 ProfilePreviewTooltip — full-content popover shown on hover/tap
 * of an avatar or name. Lazy-fetches the payload on first open per
 * user id, then memoises for 60 s (Q17 — tier can change mid-session
 * after the DB honour-compute trigger fires).
 *
 * Content (design-style §27.1–27.8):
 *   - Display name (cream, 22/28 bold, truncated)
 *   - "Tên đơn vị:" + department code (white label, muted-grey code)
 *   - Honour tier pill (same asset as §26.2)
 *   - 1 px divider
 *   - 2 stats rows — "Số Kudos nhận được / đã gửi" (white label, cream count)
 *   - CTA "Gửi KUDO" (cream pill) — hidden when `isSelf === true`
 *
 * Touch handling + motion per §28 + Q20 (first-tap-opens, CTA
 * commits). Dismiss via pointer-leave / Esc / outside-tap.
 */
export function ProfilePreviewTooltip({
  userId,
  open,
  position,
  tooltipHandlers,
  onClose,
  messages,
}: ProfilePreviewTooltipProps): ReactElement | null {
  const tooltipId = useId();
  const router = useRouter();

  // Read the cache synchronously on every render. Cache hits are stable
  // across renders (same Map entry → same object reference) until the
  // TTL expires, so this avoids the "setState in effect" cascade that
  // React's new `react-hooks/set-state-in-effect` rule flags.
  const cached = getCached(userId);

  // Track the async fetched payload separately; `data` is derived on
  // render (cache wins when hot, otherwise the async fetch for this
  // exact userId fills in). The userId guard avoids showing stale
  // payloads when the parent rapidly hovers different names.
  const [fetched, setFetched] = useState<
    { userId: string; payload: ProfilePreview } | null
  >(null);
  const data: ProfilePreview | null =
    cached ?? (fetched?.userId === userId ? fetched.payload : null);
  // Loading = tooltip open but nothing to show yet. Derived from state
  // instead of a separate `useState(false)` so we don't need a
  // synchronous `setLoading(true)` inside the effect (which the
  // `react-hooks/set-state-in-effect` rule flags).
  const loading = open && data == null;

  useEffect(() => {
    if (!open) return;
    if (cached) return;
    if (fetched?.userId === userId) return;
    let cancelled = false;
    getProfilePreview(userId)
      .then((payload) => {
        if (cancelled) return;
        if (payload) {
          setCached(userId, payload);
          setFetched({ userId, payload });
        }
      })
      .catch((err) => {
        if (!cancelled) console.error("[kudos] ProfilePreview fetch failed:", err);
      });
    return () => {
      cancelled = true;
    };
  }, [open, userId, cached, fetched?.userId]);

  if (!open) return null;
  // SSR guard — portal target only exists on the client. During server
  // render we skip the tooltip entirely (open is false on first paint
  // anyway).
  if (typeof document === "undefined") return null;

  const m = messages.kudos.profilePreview;

  return createPortal(
    <div
      id={tooltipId}
      role="dialog"
      aria-label={m.ariaLabel}
      data-tooltip-surface="true"
      data-testid="kudo-profile-preview-tooltip"
      data-loading={loading ? "true" : "false"}
      onPointerEnter={tooltipHandlers.onPointerEnter}
      onPointerLeave={tooltipHandlers.onPointerLeave}
      style={{
        position: "fixed",
        left: position.left,
        top: position.top,
        width: TOOLTIP_WIDTH,
      }}
      className="z-50 flex flex-col gap-4 rounded-2xl bg-[var(--color-panel-surface)] p-6 shadow-[var(--shadow-kudo-card)] motion-safe:animate-[fade-in_150ms_ease-out]"
    >
      {loading || !data ? (
        // Skeleton — 3 stacked placeholder rows sized to rough layout so
        // the card doesn't jump when the real data arrives.
        <>
          <div className="h-7 w-3/4 animate-pulse rounded bg-white/10" />
          <div className="h-5 w-full animate-pulse rounded bg-white/10" />
          <div className="mx-auto h-[38px] w-[218px] animate-pulse rounded-full bg-white/10" />
        </>
      ) : (
        <>
          <h3 className="truncate font-[family-name:var(--font-montserrat)] text-[22px] font-bold leading-7 tracking-[0.1px] text-[var(--color-accent-cream)]">
            {data.displayName}
          </h3>
          <p className="font-[family-name:var(--font-montserrat)] text-sm font-bold leading-5 tracking-[0.1px] text-white">
            {m.departmentLabel}{" "}
            <span className="text-[var(--color-muted-grey)]">
              {data.departmentCode ?? "—"}
            </span>
          </p>
          {(() => {
            const tier = toHonourTier(data.honourTitle);
            if (!tier) return null;
            const pill = HONOUR_PILL_MAP[tier];
            return (
              <Image
                src={pill.src}
                alt={tier}
                width={218}
                height={38}
                className="mx-auto h-[38px] w-[218px] select-none"
              />
            );
          })()}
          <hr className="border-0 border-t border-white/15" />
          <div className="flex flex-col gap-2">
            <p className="font-[family-name:var(--font-montserrat)] text-base font-bold leading-6 tracking-[0.15px] text-white">
              {m.receivedLabel}{" "}
              <span className="text-[var(--color-accent-cream)]">
                {data.kudosReceivedCount}
              </span>
            </p>
            <p className="font-[family-name:var(--font-montserrat)] text-base font-bold leading-6 tracking-[0.15px] text-white">
              {m.sentLabel}{" "}
              <span className="text-[var(--color-accent-cream)]">
                {data.kudosSentCount}
              </span>
            </p>
          </div>
          {!data.isSelf ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                router.push(`/kudos/new?recipient=${encodeURIComponent(data.userId)}`);
              }}
              data-testid="kudo-profile-preview-cta"
              className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--color-accent-cream)] font-[family-name:var(--font-montserrat)] text-base font-bold uppercase leading-6 tracking-[0.15px] text-[var(--color-brand-900)] transition-colors hover:bg-[rgba(255,234,158,0.9)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-cream)]"
            >
              <Icon name="pencil" size={20} />
              {m.ctaLabel}
            </button>
          ) : null}
        </>
      )}
    </div>,
    document.body,
  );
}
