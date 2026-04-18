type CountdownTileProps = {
  digits: [string, string];
  label: string;
};

// Presentation-only tile pair — design-style §7. Flip-clock aesthetic: each
// tile has a dark-to-darker vertical gradient split by a thin line across
// the middle to evoke the mechanical split-flap. Digits render in the
// Digital Numbers display face over the gradient.
function FlipDigit({ digit }: { digit: string }) {
  return (
    <div
      className="relative flex h-16 w-14 items-center justify-center overflow-hidden rounded-[4px] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_2px_8px_rgba(0,0,0,0.55)] sm:h-20 sm:w-16 lg:h-[88px] lg:w-[72px]"
      style={{
        background:
          "linear-gradient(180deg, #2d3237 0%, #1a1e22 50%, #12161a 50%, #1e2328 100%)",
      }}
    >
      <span
        className="font-[family-name:var(--font-digital-numbers)] text-white tabular-nums"
        style={{
          fontSize: "clamp(40px, 4.5vw, 56px)",
          lineHeight: 1,
          letterSpacing: "0.02em",
        }}
      >
        {digit}
      </span>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-black/70"
      />
    </div>
  );
}

export function CountdownTile({ digits, label }: CountdownTileProps) {
  return (
    <div className="flex flex-col items-start gap-3">
      <div className="flex items-center gap-1.5 sm:gap-2">
        <FlipDigit digit={digits[0]} />
        <FlipDigit digit={digits[1]} />
      </div>
      <span className="font-[family-name:var(--font-montserrat)] text-xs leading-4 font-bold uppercase tracking-[0.2em] text-white/90 sm:text-sm lg:text-base">
        {label}
      </span>
    </div>
  );
}
