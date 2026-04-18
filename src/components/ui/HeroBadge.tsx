import Image from "next/image";

export type HeroTier = "new" | "rising" | "super" | "legend";

type HeroBadgeProps = {
  tier: HeroTier;
  /** Semantic label for screen readers. Baked text in the PNG is visual-only —
   *  this string is the only thing assistive tech announces. */
  label: string;
  className?: string;
};

// Image-only Hero tier pill — the flattened PNG (native 255×47, rendered at
// 126×22) contains the tier name, border, glow, and texture all baked in.
// Reused on Profile + Hover-danh-hiệu overlays per spec TR-004. If a future
// use case needs dynamic label text, swap back to the DOM-text variant in
// git history (commit prior to 2026-04-19).
export function HeroBadge({ tier, label, className }: HeroBadgeProps) {
  return (
    <Image
      src={`/images/the-le/pill-${tier}@2x.png`}
      alt={label}
      width={126}
      height={22}
      unoptimized
      className={["inline-block select-none", className ?? ""].filter(Boolean).join(" ")}
    />
  );
}
