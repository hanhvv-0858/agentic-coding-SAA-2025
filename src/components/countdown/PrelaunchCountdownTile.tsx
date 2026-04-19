type PrelaunchCountdownTileProps = {
  digit: string;
};

// Glass-style LED tile — 77×123 at desktop (Figma), scaled down on tablet +
// mobile per design-style §Responsive. A single Digital Numbers digit
// centred over a translucent gradient with a warm cream border.
export function PrelaunchCountdownTile({ digit }: PrelaunchCountdownTileProps) {
  return (
    <span
      className={[
        "relative inline-flex items-center justify-center overflow-hidden",
        "h-[86px] w-[54px] sm:h-[106px] sm:w-[66px] lg:h-[123px] lg:w-[77px]",
        "rounded-xl border border-[var(--color-accent-cream)]",
        "backdrop-blur-[24px]",
      ].join(" ")}
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.05) 100%)",
      }}
    >
      <span
        className="font-[family-name:var(--font-digital-numbers)] tabular-nums leading-none text-white text-[52px] sm:text-[64px] lg:text-[74px]"
        aria-hidden="true"
      >
        {digit}
      </span>
    </span>
  );
}
