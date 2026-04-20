import type { Messages } from "@/libs/i18n/getMessages";

type AllKudosHeaderProps = {
  messages: Messages;
};

/**
 * §C.1 AllKudosHeader — "Sun* Annual Awards 2025" caption + "ALL KUDOS"
 * `<h2>` section title. Single heading rank (FR-018) — the H1 lives in
 * KudosHero.
 */
export function AllKudosHeader({ messages }: AllKudosHeaderProps) {
  return (
    <header className="flex flex-col gap-4">
      <p className="font-[family-name:var(--font-montserrat)] text-2xl font-bold leading-8 text-white">
        {"Sun* Annual Awards 2025"}
      </p>
      <h2 className="font-[family-name:var(--font-montserrat)] text-[clamp(32px,5vw,57px)] font-bold leading-[64px] tracking-[-0.25px] text-[var(--color-accent-cream)]">
        {messages.kudos.feed.sectionTitle}
      </h2>
    </header>
  );
}
