import { PrelaunchCountdownTile } from "./PrelaunchCountdownTile";

type CountdownUnitProps = {
  label: string;
  digits: [string, string];
};

// One DAYS / HOURS / MINUTES column — a pair of LED tiles plus an uppercase
// label below. Non-interactive; ARIA announcement lives on the parent
// `<PrelaunchCountdown>` via aria-label on its timer region.
export function CountdownUnit({ label, digits }: CountdownUnitProps) {
  return (
    <div className="flex flex-col items-start gap-3 sm:gap-[21px]">
      <div className="flex flex-row gap-3 sm:gap-[21px]" aria-hidden="true">
        <PrelaunchCountdownTile digit={digits[0]} />
        <PrelaunchCountdownTile digit={digits[1]} />
      </div>
      <span className="font-[family-name:var(--font-montserrat)] font-bold text-white text-base leading-6 sm:text-2xl sm:leading-8 lg:text-[36px] lg:leading-[48px]">
        {label}
      </span>
    </div>
  );
}
