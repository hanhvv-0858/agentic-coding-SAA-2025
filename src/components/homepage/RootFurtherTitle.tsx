type RootFurtherTitleProps = {
  className?: string;
};

// Large display title "ROOT FURTHER" — rendered as live text instead of a
// bitmap image so it scales crisply at any size. Uses Montserrat at display
// scale with negative letter-spacing to approximate the Figma condensed look.
export function RootFurtherTitle({ className }: RootFurtherTitleProps) {
  return (
    <h1
      aria-label="ROOT FURTHER"
      className={[
        "font-[family-name:var(--font-montserrat)] font-bold uppercase text-white leading-[0.9] tracking-[-0.03em]",
        "text-6xl sm:text-7xl lg:text-8xl xl:text-[120px]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="block">ROOT</span>
      <span className="block">FURTHER</span>
    </h1>
  );
}
