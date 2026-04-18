import { HeroBadge, type HeroTier } from "@/components/ui/HeroBadge";

type HeroTierCardProps = {
  tier: HeroTier;
  label: string;
  count: string;
  description: string;
};

// One row in the Receiver section — the reusable `<HeroBadge />` pill next
// to a count label, with a description line below (Figma node 3204:6161
// and siblings for the other three tiers).
export function HeroTierCard({ tier, label, count, description }: HeroTierCardProps) {
  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex flex-row flex-wrap items-center gap-3">
        <HeroBadge tier={tier} label={label} />
        <span className="font-[family-name:var(--font-montserrat)] text-base leading-6 font-bold tracking-[0.5px] text-white">
          {count}
        </span>
      </div>
      <p className="font-[family-name:var(--font-montserrat)] text-sm leading-5 font-bold tracking-[0.1px] text-white">
        {description}
      </p>
    </div>
  );
}
