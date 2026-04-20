import type { Messages } from "@/libs/i18n/getMessages";

type SpotlightHeaderProps = {
  messages: Messages;
};

/**
 * §B.6 SpotlightHeader — caption + `<h2>SPOTLIGHT BOARD</h2>`. Mirrors
 * the `<HighlightHeader />` typography scale to keep section headings
 * visually aligned (design-style §B.6).
 */
export function SpotlightHeader({ messages }: SpotlightHeaderProps) {
  return (
    <header
      className="flex flex-col gap-4"
      data-testid="kudos-spotlight-header"
    >
      <p className="font-[family-name:var(--font-montserrat)] text-2xl font-bold leading-8 text-white">
        {messages.kudos.spotlight.sectionCaption}
      </p>
      <h2 className="font-[family-name:var(--font-montserrat)] text-[clamp(32px,5vw,57px)] font-bold leading-[64px] tracking-[-0.25px] text-[var(--color-accent-cream)]">
        {messages.kudos.spotlight.sectionTitle}
      </h2>
    </header>
  );
}
