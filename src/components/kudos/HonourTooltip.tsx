"use client";

import Image from "next/image";
import { useId, type ReactElement } from "react";
import { createPortal } from "react-dom";
import type { Messages } from "@/libs/i18n/getMessages";
import { HONOUR_PILL_MAP, HONOUR_TIER_KEY, type HonourTier } from "./honourPills";
import type { TooltipPosition } from "./hooks/useTooltipAnchor";

export type HonourTooltipProps = {
  tier: HonourTier;
  /** Controlled visibility — parent owns the `useTooltipAnchor` hook. */
  open: boolean;
  position: TooltipPosition;
  tooltipHandlers: {
    onPointerEnter: () => void;
    onPointerLeave: () => void;
  };
  messages: Messages;
};

// Card dimensions from design-style §26.1 (Figma `3241:14991`).
const TOOLTIP_WIDTH = 304;
const TOOLTIP_HEIGHT = 194;

/**
 * §26 HonourTooltip — controlled popover. Parent component owns the
 * `useTooltipAnchor` hook and passes in `open`/`position`/`handlers`;
 * this component renders the surface when `open` is true.
 */
export function HonourTooltip({
  tier,
  open,
  position,
  tooltipHandlers,
  messages,
}: HonourTooltipProps): ReactElement | null {
  const tooltipId = useId();

  if (!open) return null;
  // SSR guard — portal target only exists on the client.
  if (typeof document === "undefined") return null;

  const pill = HONOUR_PILL_MAP[tier];
  const tierKey = HONOUR_TIER_KEY[tier];
  const copy = messages.kudos.honour.tooltip[tierKey];
  const threshold = copy.threshold;
  const flavor = copy.flavor;

  return createPortal(
    <div
      id={tooltipId}
      role="tooltip"
      data-tooltip-surface="true"
      data-testid="kudo-honour-tooltip"
      data-tier={tierKey}
      onPointerEnter={tooltipHandlers.onPointerEnter}
      onPointerLeave={tooltipHandlers.onPointerLeave}
      style={{
        position: "fixed",
        left: position.left,
        top: position.top,
        width: TOOLTIP_WIDTH,
        minHeight: TOOLTIP_HEIGHT,
      }}
      className="z-50 flex flex-col items-center justify-center gap-4 rounded-2xl bg-[var(--color-panel-surface)] p-4 shadow-[var(--shadow-kudo-card)] motion-safe:animate-[fade-in_150ms_ease-out]"
    >
      <Image
        src={pill.src}
        alt={tier}
        width={218}
        height={38}
        className="h-[38px] w-[218px] select-none"
      />
      <p className="w-[250px] font-[family-name:var(--font-montserrat)] text-sm font-bold leading-5 tracking-[0.1px] text-[var(--color-muted-grey)]">
        {threshold} {flavor}
      </p>
    </div>,
    document.body,
  );
}
