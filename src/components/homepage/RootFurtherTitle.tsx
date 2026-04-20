import Image from "next/image";

type RootFurtherTitleProps = {
  className?: string;
  /**
   * Which logotype asset to render.
   * - `big` (default): 451×200 design size — hero top-left. Asset
   *   `/images/root-further_big@2x.png` (902×400 intrinsic).
   * - `small`: 290×134 design size — "Root Further" narrative card.
   *   Asset `/images/root-further_small@2x.png` (580×268 intrinsic).
   */
  variant?: "big" | "small";
};

// Display wordmark "ROOT FURTHER" — rendered as the canonical Figma
// PNG so the engraved/outline logotype matches pixel-for-pixel rather
// than approximating it with live text + letter-spacing. Kept as an
// `<h1 aria-label="ROOT FURTHER">` wrapper so the page still exposes a
// proper heading to assistive tech.
export function RootFurtherTitle({
  className,
  variant = "big",
}: RootFurtherTitleProps) {
  const isSmall = variant === "small";
  const src = isSmall
    ? "/images/root-further_small@2x.png"
    : "/images/root-further_big@2x.png";
  const width = isSmall ? 290 : 451;
  const height = isSmall ? 134 : 200;
  // Responsive clamp — shrink on narrow viewports while honouring the
  // design size on desktop.
  const responsive = isSmall
    ? "w-[180px] sm:w-[230px] lg:w-[290px]"
    : "w-[260px] sm:w-[340px] lg:w-[451px]";

  return (
    <h1 aria-label="ROOT FURTHER" className={className}>
      <Image
        src={src}
        alt="ROOT FURTHER"
        width={width}
        height={height}
        priority={!isSmall}
        className={`h-auto max-w-full select-none ${responsive}`}
      />
    </h1>
  );
}
