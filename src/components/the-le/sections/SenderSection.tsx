import type { Messages } from "@/libs/i18n/getMessages";
import { CollectibleBadge, type CollectibleName } from "@/components/ui/CollectibleBadge";

type SenderSectionProps = {
  rules: Messages["rules"];
};

const BADGE_ORDER: readonly CollectibleName[] = [
  "revival",
  "touch-of-light",
  "stay-gold",
  "flow-to-horizon",
  "beyond-the-boundary",
  "root-further",
] as const;

// Section 2 of the Thể lệ screen — heading + intro + 6-badge grid + outro
// (Figma nodes 3204:6076 → 6089). Grid reflows from 2-col on mobile
// (< 640 px) to 3-col on tablet and up, per plan.md breakpoints.
export function SenderSection({ rules }: SenderSectionProps) {
  const { heading, intro, badges, outro } = rules.sender;
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-[family-name:var(--font-montserrat)] text-[22px] leading-7 font-bold text-[var(--color-accent-cream)]">
        {heading}
      </h2>
      <p className="font-[family-name:var(--font-montserrat)] text-base leading-6 font-normal tracking-[0.5px] text-white">
        {intro}
      </p>
      <div className="grid grid-cols-2 gap-4 px-2 sm:grid-cols-3 sm:gap-x-4 sm:gap-y-6 sm:px-6">
        {BADGE_ORDER.map((name) => (
          <CollectibleBadge
            key={name}
            name={name}
            label={badges[name].label}
            hasImage
            className="mx-auto"
          />
        ))}
      </div>
      <p className="font-[family-name:var(--font-montserrat)] text-base leading-6 font-normal tracking-[0.5px] text-white">
        {outro}
      </p>
    </section>
  );
}
