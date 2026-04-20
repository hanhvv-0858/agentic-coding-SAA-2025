import type { ReactNode } from "react";
import type { Messages } from "@/libs/i18n/getMessages";

type HighlightHeaderProps = {
  messages: Messages;
  /** Right-aligned slot for B.1.1/B.1.2 filter chips (design-style §B.1). */
  rightSlot?: ReactNode;
};

/**
 * §B.1 HighlightHeader — "NỔI BẬT" / "HIGHLIGHT" caption +
 * "HIGHLIGHT KUDOS" `<h2>` title. Cream colour + 57/64 typography
 * mirrors the AllKudosHeader (§C.1) to keep the two slab headers
 * visually aligned. Single H1 lives in `KudosHero`; this is an H2
 * per FR-018 / design-style §B.1. Filter chips sit on the same row
 * as the title (Figma `2940:13453`).
 */
export function HighlightHeader({ messages, rightSlot }: HighlightHeaderProps) {
  return (
    <header
      className="flex w-full flex-col items-start gap-4 lg:flex-row lg:items-end lg:justify-between"
      data-testid="kudos-highlight-header"
    >
      <div className="flex flex-col gap-4">
        <p className="font-[family-name:var(--font-montserrat)] text-2xl font-bold leading-8 text-white">
          {messages.kudos.highlight.sectionCaption}
        </p>
        <h2 className="font-[family-name:var(--font-montserrat)] text-[clamp(32px,5vw,57px)] font-bold leading-[64px] tracking-[-0.25px] text-[var(--color-accent-cream)]">
          {messages.kudos.highlight.sectionTitle}
        </h2>
      </div>
      {rightSlot ? (
        <div className="flex w-full flex-shrink-0 lg:w-auto">{rightSlot}</div>
      ) : null}
    </header>
  );
}
