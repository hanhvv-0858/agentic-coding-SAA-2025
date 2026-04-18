import { Icon } from "@/components/ui/Icon";
import type { Award, PrizeUnit } from "@/data/awards";
import type { Messages } from "@/libs/i18n/getMessages";
import { AwardPrizeValueRow } from "./AwardPrizeValueRow";

type AwardContentProps = {
  award: Award;
  /** Pre-resolved i18n messages object from server. */
  messages: Messages;
};

function resolveKey(messages: Messages, key: string): string {
  const parts = key.split(".");
  let cursor: unknown = messages;
  for (const part of parts) {
    if (cursor && typeof cursor === "object" && part in cursor) {
      cursor = (cursor as Record<string, unknown>)[part];
    } else {
      return key;
    }
  }
  return typeof cursor === "string" ? cursor : key;
}

const UNIT_KEY: Record<PrizeUnit, string> = {
  individual: "awards.card.unitIndividual",
  team: "awards.card.unitTeam",
  either: "awards.card.unitEither",
};

/**
 * Content column of an award detail section — title, long description, prize
 * count row, and 1 or 2 prize-value rows depending on `award.prizeValues`
 * length. FR-006 / FR-007 parent-level conditional row rendering lives here.
 */
export function AwardContent({ award, messages }: AwardContentProps) {
  const title = resolveKey(messages, award.titleKey);
  const description = resolveKey(messages, award.longDescKey);
  const prizeCountLabel = messages.awards.card.prizeCountLabel;
  const prizeValueLabel = messages.awards.card.prizeValueLabel;
  const unitLabel = resolveKey(messages, UNIT_KEY[award.prizeUnit]);

  return (
    <div className="flex flex-1 flex-col gap-6">
      <h2 className="flex items-center gap-3 font-[family-name:var(--font-montserrat)] text-3xl leading-tight font-bold text-[var(--color-accent-cream)] sm:text-4xl sm:leading-[44px]">
        <Icon name="target" size={24} className="shrink-0" />
        <span>{title}</span>
      </h2>

      <p className="font-[family-name:var(--font-montserrat)] text-base leading-6 font-normal tracking-[0.5px] text-white whitespace-pre-line">
        {description}
      </p>

      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1 pt-2">
        <Icon
          name="target"
          size={24}
          className="relative top-1 shrink-0 text-[var(--color-accent-cream)]"
        />
        <span className="font-[family-name:var(--font-montserrat)] text-base leading-6 font-bold tracking-[0.15px] text-white">
          {prizeCountLabel}
        </span>
        <span className="font-[family-name:var(--font-montserrat)] text-4xl leading-[44px] font-bold text-white tabular-nums">
          {String(award.prizeCount).padStart(2, "0")}
        </span>
        <span className="font-[family-name:var(--font-montserrat)] text-base leading-6 font-normal tracking-[0.5px] text-white/90">
          {unitLabel}
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {award.prizeValues.map((pv, i) => (
          <AwardPrizeValueRow
            key={i}
            amountVnd={pv.amountVnd}
            suffix={pv.suffixKey ? resolveKey(messages, pv.suffixKey) : undefined}
            icon={i === 0 ? "diamond" : "license"}
            label={prizeValueLabel}
          />
        ))}
      </div>
    </div>
  );
}
