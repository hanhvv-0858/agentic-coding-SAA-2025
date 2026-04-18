import type { Messages } from "@/libs/i18n/getMessages";
import { HeroTierCard } from "../HeroTierCard";

type ReceiverSectionProps = {
  rules: Messages["rules"];
};

// Section 1 of the Thể lệ screen — heading + intro + 4 HeroTierCards in
// the order New → Rising → Super → Legend (per Figma node 3204:6131).
export function ReceiverSection({ rules }: ReceiverSectionProps) {
  const { heading, intro, tiers } = rules.receiver;
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-[family-name:var(--font-montserrat)] text-[22px] leading-7 font-bold text-[var(--color-accent-cream)]">
        {heading}
      </h2>
      <p className="font-[family-name:var(--font-montserrat)] text-base leading-6 font-normal tracking-[0.5px] text-white">
        {intro}
      </p>
      <HeroTierCard tier="new" {...tiers.new} />
      <HeroTierCard tier="rising" {...tiers.rising} />
      <HeroTierCard tier="super" {...tiers.super} />
      <HeroTierCard tier="legend" {...tiers.legend} />
    </section>
  );
}
