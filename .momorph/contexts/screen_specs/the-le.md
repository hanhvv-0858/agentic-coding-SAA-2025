# Screen: Thể lệ UPDATE (Event Rules)

## Screen Info

| Property | Value |
|----------|-------|
| **Figma Frame ID** | `b1Filzi9i6` |
| **Figma Node ID** | `3204:6051` |
| **Figma Link** | https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/b1Filzi9i6 |
| **Screen Group** | Core App |
| **Status** | discovered |
| **Discovered At** | 2026-04-18 |
| **Last Updated** | 2026-04-18 |

---

## Description

Rules / terms panel ("Thể lệ") for the SAA 2025 Kudos programme. Presented as
a scrollable modal/panel that explains:

1. **Receiving Kudos → Hero badges**: four Hero tiers awarded based on how
   many teammates send you a Kudo (New Hero 1–4, Rising Hero 5–9, Super Hero
   10–20, Legend Hero 20+).
2. **Sending Kudos → 6 collectible icons + Secret Box**: every 5 hearts on a
   kudo opens a Secret Box chance for one of six exclusive SAA badges
   (REVIVAL, TOUCH OF LIGHT, STAY GOLD, FLOW TO HORIZON, BEYOND THE BOUNDARY,
   ROOT FUTHER). Collecting all six grants a mystery gift.
3. **Kudos Quốc Dân**: the 5 most-loved Kudos across Sun\* receive the special
   "Root Further" prize from SAA 2025.

Bottom action bar has two buttons: **Đóng** (close panel) and
**Viết KUDOS** (open the compose-kudo form).

The panel is content-heavy and scroll-aware (`Nội dung thể lệ` is an
`info_block` that scrolls when its content overflows the modal).

---

## Navigation Analysis

### Incoming Navigations (From)

| Source Screen | Trigger | Condition |
|---------------|---------|-----------|
| Homepage SAA (`i87tDx10uM`) | Rules/Thể lệ entry (header nav or CTA) | Authenticated |
| Sun\* Kudos - Live board (`MaZUn5xHXZ`) | "Thể lệ" link (assumed, footer/header) | Authenticated |
| Viết Kudo (`ihQ26W78P2`) | "Xem thể lệ" link (assumed) | Authenticated |

### Outgoing Navigations (To)

| Target Screen | Trigger Element | Node ID | Confidence | Notes |
|---------------|-----------------|---------|------------|-------|
| Viết Kudo (`ihQ26W78P2` / linked `520:11602`) | Button: "Viết KUDOS" (`B.2_Button viết kudos`) | `3204:6094` | High | Frame spec declares `navigation.action=on_click`, `linkedFrameId=520:11602`, `linkedFrameName="Viết Kudo"` |
| Previous screen (caller) | Button: "Đóng" (`B.1_Button đóng`) | `3204:6093` | High | Description: "Click: Đóng modal/panel và quay lại nội dung trước" |

### Navigation Rules

- **Back behavior**: Returns to the caller screen (modal dismiss). If accessed
  via a dedicated route it should fall back to Homepage.
- **Deep link support**: TBD. Most natural fit is `/the-le` or `/rules`;
  alternatively rendered as a modal over the referring screen.
- **Auth required**: Yes (part of the authenticated app shell like Homepage,
  Awards, Live board).

---

## Component Schema

### Layout Structure

```
┌──────────────────────────────────────────────────────────┐
│  Title: "Thể lệ"                                         │
├──────────────────────────────────────────────────────────┤
│  A_Nội dung thể lệ  (scrollable info_block)              │
│                                                          │
│   Section 1 — NGƯỜI NHẬN KUDOS (Hero badges)             │
│     • New Hero     (1–4 senders)      [badge + desc]     │
│     • Rising Hero  (5–9 senders)      [badge + desc]     │
│     • Super Hero   (10–20 senders)    [badge + desc]     │
│     • Legend Hero  (20+ senders)      [badge + desc]     │
│                                                          │
│   Section 2 — NGƯỜI GỬI KUDOS (6 collectible icons)      │
│     Intro copy about Secret Box (every 5 ❤ = 1 box)      │
│     Badge grid (2 rows × 3 columns):                     │
│       REVIVAL · TOUCH OF LIGHT · STAY GOLD               │
│       FLOW TO HORIZON · BEYOND THE BOUNDARY · ROOT       │
│       FURTHER                                            │
│     Closing copy: full set → mystery gift                │
│                                                          │
│   Section 3 — KUDOS QUỐC DÂN                             │
│     Top-5 most-hearted kudos win "Root Further" prize    │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  B_Button (footer action bar)                            │
│   [X Đóng]                         [✎ Viết KUDOS]       │
└──────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
RulesPanel (Organism — modal / page)
├── RulesTitle (Atom) — "Thể lệ"
├── RulesContent (Organism — scrollable)
│   ├── ReceiverSection (Organism)
│   │   ├── SectionHeading (Atom)
│   │   ├── SectionSubtitle (Atom)
│   │   └── HeroTierCard × 4 (Molecule)
│   │       ├── HeroBadgeMedia (Atom — MM_MEDIA_{New|Rising|Super|Legend} Hero)
│   │       ├── TierCountLabel (Atom)
│   │       └── TierDescription (Atom)
│   ├── SenderSection (Organism)
│   │   ├── SectionHeading (Atom)
│   │   ├── SectionIntroText (Atom)
│   │   ├── BadgeGrid (Molecule)
│   │   │   └── BadgeCard × 6 (Molecule)
│   │   │       ├── BadgeMedia (Atom — MM_MEDIA_ Badge *)
│   │   │       └── BadgeLabel (Atom)
│   │   └── SectionOutroText (Atom)
│   └── NationalKudosSection (Organism)
│       ├── SectionHeading (Atom)
│       └── SectionBodyText (Atom)
└── RulesFooter (Organism)
    ├── CloseButton (Molecule) — icon "X" + "Đóng"
    └── WriteKudosButton (Molecule, Primary) — icon pen + "Viết KUDOS"
```

### Main Components

| Component | Type | Node ID | Description | Reusable |
|-----------|------|---------|-------------|----------|
| Rules modal / panel | Organism | `3204:6052` (`Thể Lệ`) | Whole rules surface | No (screen-specific) |
| Rules content block | Organism | `3204:6053` (`A_Nội dung thể lệ`) | Scrollable info block per MoMorph spec (`otherType: info_block`) | No |
| Hero tier section | Organism | `3204:6076` (`Người gửi`) + `3204:6131` (`Người nhận`) | Hero badge tier list | No (reusable pattern) |
| HeroTierCard | Molecule | `3204:6161`, `3204:6170`, `3204:6179`, `3204:6188` | One tier row | Yes (repeats 4×) |
| Badge grid (6 icons) | Organism | `3204:6079` / `3204:6080` | 2-row 3-col badge collection | No |
| BadgeCard (6 variants) | Molecule | `3204:6082–3204:6088` | Icon + label | Yes (repeats 6×) |
| Footer button bar | Organism | `3204:6092` (`B_Button`) | Two-action bar | Pattern reusable |
| CloseButton | Molecule | `3204:6093` | Secondary / outlined | Yes (shared close-button pattern) |
| WriteKudosButton | Molecule | `3204:6094` | Primary CTA → Viết Kudo | Yes (same CTA used elsewhere) |

### Component Reuse Notes

- **Badges/Hero media**: all rendered as `MM_MEDIA_*` instances, meaning they
  are managed image assets — the React layer should use the existing media
  pipeline (same pattern as homepage hero/awards imagery).
- **WriteKudosButton**: the "Viết KUDOS" CTA appears in at least the Homepage
  Kudos promo, the Live board FAB, and here. Factor as a shared
  `<WriteKudosButton />` using the existing `PrimaryButton` + `Icon name="pen"`
  primitives.
- **Hero badge components**: `MM_MEDIA_New Hero`, `Rising Hero`, `Super Hero`,
  `Legend Hero` also appear on Profile / Hover danh hiệu overlays. Extract a
  single `<HeroBadge tier="new|rising|super|legend" />` atom.
- **Collectible badges**: REVIVAL, TOUCH OF LIGHT, STAY GOLD, FLOW TO HORIZON,
  BEYOND THE BOUNDARY, ROOT FUTHER likely also appear on Profile tabs and
  Secret Box flow — `<CollectibleBadge name="..." />` atom.

---

## Form Fields (If Applicable)

Not applicable — this screen is read-only content. No user-editable fields.

---

## API Mapping

### On Screen Load

| API | Method | Purpose | Response Usage |
|-----|--------|---------|----------------|
| (static) i18n keys in `src/messages/{vi,en}.json` | — | Render rule copy | Text content |
| Optional: `GET /api/rules/current` | GET | If rules are editable via CMS / admin campaign settings | Populate content blocks |

Given the admin section has "Setting - Campaign" screens, content may be
campaign-driven. For MVP, treat as static i18n-backed copy.

### On User Action

| Action | API | Method | Request Body | Response |
|--------|-----|--------|--------------|----------|
| Click "Đóng" | — | — | Navigation only (dismiss modal / `router.back()`) | — |
| Click "Viết KUDOS" | — | — | Navigation only → `/kudos/new` (Viết Kudo) | — |

### Error Handling

| Error Code | Message | UI Action |
|------------|---------|-----------|
| — | — | No network calls in MVP; content is static. |

---

## State Management

### Local State

| State | Type | Initial | Purpose |
|-------|------|---------|---------|
| `isOpen` (if modal) | boolean | `true` on mount | Controls panel visibility when used as modal |
| `scrollProgress` (optional) | number | 0 | For sticky-title fade or "scrolled" styling |

### Global State (If Applicable)

None required. Uses existing session cookie for auth gating.

---

## UI States

### Loading State
- Not required for static copy. If CMS-driven, show skeleton blocks for
  section headings and badge grid (6 placeholder tiles).

### Error State
- If content fetch fails, show inline alert + Retry. Otherwise N/A.

### Success State
- Default state — fully rendered rules.

### Empty State
- N/A — rules copy must always exist for a live campaign.

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Focus management | Move focus to modal title on open; return focus to trigger on close |
| Keyboard navigation | `Esc` closes modal; Tab cycles through Close → Write Kudos |
| Screen reader | `role="dialog"`, `aria-modal="true"`, `aria-labelledby="rules-title"` |
| Heading structure | H1/H2 for "Thể lệ" + 3 section headings (receiver / sender / Kudos Quốc Dân) |
| Color contrast | WCAG 2.2 AA for hero tier labels and badge captions |
| Reduced motion | No auto-scroll / parallax |

---

## Responsive Behavior

| Breakpoint | Layout Changes |
|------------|----------------|
| Mobile (<768px) | Single-column, badges stack 2×3 → 3×2 → 6×1; footer buttons stack full-width |
| Tablet (768–1024px) | Badge grid 3×2, footer buttons side-by-side |
| Desktop (≥1024px) | Figma baseline: badge grid 3×2, two-column hero tier cards if space allows |

---

## Analytics Events (Optional)

| Event | Trigger | Properties |
|-------|---------|------------|
| `rules_view` | On mount | `{screen: "rules", source: "homepage\|liveboard\|compose"}` |
| `rules_close` | Click Đóng | `{scroll_depth_pct}` |
| `rules_cta_write_kudo` | Click Viết KUDOS | `{scroll_depth_pct}` |

---

## Design Tokens

Reuses global tokens defined during Homepage / Awards extraction
(`--color-primary`, `--color-text`, typography scale, spacing). The modal
surface should reuse the same card/panel pattern as the awards page.

---

## Implementation Notes

### Dependencies

- `next-intl` for message catalog (copy lives in `src/messages/{vi,en}.json`).
- Existing `<PrimaryButton>` / `<Icon name="pen"|"close">` primitives.
- Media assets: 4 hero badges + 6 collectible badges — fetch from Figma/CMS
  as SVG/PNG; cache in `public/rules/`.

### Special Considerations

- Long-form copy in Vietnamese must be localized — every text node becomes an
  i18n key (expect ~20 keys under `rules.*`).
- The 6 collectible badges repeat across Profile and Secret Box flow — extract
  a shared badge atom to avoid duplication.
- Decide whether this is a modal (overlay) or a full route (`/the-le`). The
  Figma description ("Click 'Đóng': đóng panel") strongly implies modal; a
  route-based fallback is still useful for deep links.

---

## Analysis Metadata

| Property | Value |
|----------|-------|
| Analyzed By | Screen Flow Discovery (momorph.screenflow) |
| Analysis Date | 2026-04-18 |
| Needs Deep Analysis | Yes — before `/momorph.specify` |
| Confidence Score | High (navigation), Medium (layout — inferred from node tree without image) |

### Next Steps

- [ ] Run `/momorph.specify` for `b1Filzi9i6` to produce `spec.md` +
      `design-style.md` under `.momorph/specs/b1Filzi9i6-the-le/`.
- [ ] Confirm with Product whether rules are CMS-driven (admin campaign) or
      static i18n copy for MVP.
- [ ] Confirm modal vs. dedicated route with UX; reflect in routing plan.
- [ ] Extract shared atoms: `<HeroBadge />`, `<CollectibleBadge />`,
      `<WriteKudosButton />`.
- [ ] Verify the "Viết KUDOS" target — node spec links to `520:11602`; the
      MVP maps this to `ihQ26W78P2` (Viết Kudo).
