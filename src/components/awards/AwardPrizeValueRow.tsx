import { Icon, type IconName } from "@/components/ui/Icon";

type AwardPrizeValueRowProps = {
  /** Prize amount in VND, formatted with dots as thousands separator. */
  amountVnd: number;
  /** Pre-resolved trailing suffix text (e.g., "cho mỗi giải thưởng"). Omit/undefined → no suffix. */
  suffix?: string;
  /** Which icon to render at the row's start. */
  icon: Extract<IconName, "diamond" | "license">;
  /** Pre-resolved "Giá trị giải thưởng:" label. */
  label: string;
};

const VND_FORMATTER = new Intl.NumberFormat("vi-VN", { useGrouping: true });

/**
 * A single prize-value row on an award detail section. Callers decide how
 * many rows to render (1 for most awards, 2 for Signature 2025). Suffix is
 * conditional: omitted → no trailing text (Best Manager, MVP); present →
 * rendered after the amount (FR-007).
 */
export function AwardPrizeValueRow({ amountVnd, suffix, icon, label }: AwardPrizeValueRowProps) {
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <Icon
        name={icon}
        size={24}
        className="relative top-1 shrink-0 text-[var(--color-accent-cream)]"
      />
      <span className="font-[family-name:var(--font-montserrat)] text-base leading-6 font-bold tracking-[0.15px] text-white">
        {label}
      </span>
      <span className="font-[family-name:var(--font-montserrat)] text-2xl leading-8 font-bold text-[var(--color-accent-cream)]">
        {VND_FORMATTER.format(amountVnd)} VNĐ
      </span>
      {suffix && (
        <span className="font-[family-name:var(--font-montserrat)] text-base leading-6 font-normal tracking-[0.5px] text-white/90">
          {suffix}
        </span>
      )}
    </div>
  );
}
