# Asset Map: Thể lệ (b1Filzi9i6)

**Status** (2026-04-19): ✅ All 6 collectible badge PNGs + 4 hero-pill PNGs
shipped. `<CollectibleBadge hasImage />` + image-only `<HeroBadge />` both
wired.

---

## Hero tier pills (image-only — label baked in)

| Tier | Figma source | Local path | Current impl |
|------|--------------|------------|--------------|
| New | `3204:6161` composite | `public/images/the-le/pill-new@2x.png` (255×47 → displays 126×22) | ✅ `<HeroBadge tier="new" alt="New Hero" />` |
| Rising | `3204:6170` composite | `public/images/the-le/pill-rising@2x.png` | ✅ `<HeroBadge tier="rising" alt="Rising Hero" />` |
| Super | `3204:6179` composite | `public/images/the-le/pill-super@2x.png` (253×44) | ✅ `<HeroBadge tier="super" alt="Super Hero" />` |
| Legend | `3204:6188` composite | `public/images/the-le/pill-legend@2x.png` | ✅ `<HeroBadge tier="legend" alt="Legend Hero" />` |

## Collectible badges (6)

| Name | Figma node | Local path | Alt-text i18n key | Current impl |
|------|------------|------------|-------------------|--------------|
| revival | `I3204:6082;737:20341` | `public/images/the-le/badge-revival.png` | `rules.sender.badges.revival.label` | ✅ PNG wired |
| touch-of-light | `I3204:6087;737:20360` | `public/images/the-le/badge-touch-of-light.png` | `rules.sender.badges.touch-of-light.label` | ✅ PNG wired |
| stay-gold | `I3204:6086;737:20354` | `public/images/the-le/badge-stay-gold.png` | `rules.sender.badges.stay-gold.label` | ✅ PNG wired |
| flow-to-horizon | `I3204:6083;737:20660` | `public/images/the-le/badge-flow-to-horizon.png` | `rules.sender.badges.flow-to-horizon.label` | ✅ PNG wired |
| beyond-the-boundary | `I3204:6084;737:20348` | `public/images/the-le/badge-beyond-the-boundary.png` | `rules.sender.badges.beyond-the-boundary.label` | ✅ PNG wired |
| root-further | `I3204:6088;737:20387` | `public/images/the-le/badge-root-further.png` | `rules.sender.badges.root-further.label` | ✅ PNG wired (Figma layer typo "ROOT FUTHER" — we use correct spelling) |

---

## Follow-up

When design supplies flattened exports:

1. Drop files into `public/images/the-le/` with the filenames above.
2. Update `<HeroBadge>` / `<CollectibleBadge>` to conditionally render the
   `<Image>` when the source exists; keep the CSS fallback for safety.
3. Flip this doc's "Current impl" column to reference the real files.
