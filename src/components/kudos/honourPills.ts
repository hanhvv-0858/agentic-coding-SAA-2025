// Shared pill-asset map for the "Hero tier" badge (spec §Hero Tier
// Auto-compute + §US10 ProfilePreviewTooltip + §US10 HonourTooltip).
// Assets live under `public/images/the-le/` and were originally exported
// for the Thể lệ screen; reused across the Live board to avoid asset
// duplication. Rendering components size via `width`/`height` props on
// `<Image>`; native PNG is ~255 × 47 (source) which downscales sharply to
// 218 × 38 (Figma target) per design-style §26.2.

export type HonourTier = "Legend Hero" | "Rising Hero" | "Super Hero" | "New Hero";

export type HonourPillAsset = {
  src: string;
  width: number;
  height: number;
};

export const HONOUR_PILL_MAP: Record<HonourTier, HonourPillAsset> = {
  "Legend Hero": {
    src: "/images/the-le/pill-legend@2x.png",
    width: 255,
    height: 47,
  },
  "Rising Hero": {
    src: "/images/the-le/pill-rising@2x.png",
    width: 255,
    height: 47,
  },
  "Super Hero": {
    src: "/images/the-le/pill-super@2x.png",
    width: 253,
    height: 44,
  },
  "New Hero": {
    src: "/images/the-le/pill-new@2x.png",
    width: 255,
    height: 47,
  },
};

// Narrow `string` → `HonourTier | undefined`. Used at the edge (API
// payload) to keep downstream code strongly typed.
export function toHonourTier(raw: string | null | undefined): HonourTier | undefined {
  if (!raw) return undefined;
  return raw in HONOUR_PILL_MAP ? (raw as HonourTier) : undefined;
}

// Short key used for tier-sensitive i18n lookups.
// e.g. `kudos.honour.tooltip.newHero.threshold`.
export const HONOUR_TIER_KEY: Record<HonourTier, "newHero" | "risingHero" | "superHero" | "legendHero"> = {
  "New Hero": "newHero",
  "Rising Hero": "risingHero",
  "Super Hero": "superHero",
  "Legend Hero": "legendHero",
};
