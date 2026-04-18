import type { Messages } from "@/libs/i18n/getMessages";

type NationalKudosSectionProps = {
  rules: Messages["rules"];
};

// Section 3 — "KUDOS QUỐC DÂN" heading (24/32) + body paragraph
// (Figma nodes 3204:6090 / 3204:6091).
export function NationalKudosSection({ rules }: NationalKudosSectionProps) {
  const { heading, body } = rules.quocDan;
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-[family-name:var(--font-montserrat)] text-2xl leading-8 font-bold text-[var(--color-accent-cream)]">
        {heading}
      </h2>
      <p className="font-[family-name:var(--font-montserrat)] text-base leading-6 font-normal tracking-[0.5px] text-white">
        {body}
      </p>
    </section>
  );
}
