# Implementation Plan: Awards System (Hệ thống giải thưởng SAA 2025)

**Frame**: `zFYDgyj_pD-awards-system`
**Date**: 2026-04-18
**Spec**: [spec.md](spec.md)
**Design**: [design-style.md](design-style.md)
**Route**: `/awards`

---

## Summary

`/awards` is a **long-form, static, read-only** reference page listing all six SAA 2025 award categories (Top Talent → MVP). It is **session-gated** (redirects to `/login` if unauthenticated) but otherwise fetches zero runtime data — everything is authored content baked into `src/data/awards.ts` + `src/messages/{vi,en}.json`.

**Net-new work is small**: three page-specific components (hero banner, scroll-spy category nav, award detail section) and three new icons. Shared shell (Header, Footer, KudosPromoBlock, FAB, HeroBackdrop) is reused from the Homepage unchanged. Data model extension on `Award` is **additive** — Homepage's `<AwardCard />` keeps working.

The one moderately tricky piece is the **sticky left nav with IntersectionObserver scroll-spy** (FR-005/FR-005a) — handled in a single `"use client"` component with a tight state surface (`activeSlug`, `prefersReducedMotion`). All content cards remain server-rendered — zero hydration cost for the main page body.

**Estimated complexity: Low-Medium**. Biggest unknowns are (a) three icon SVG paths still to be fetched from Figma during Phase 0, and (b) the 6 unique award badges still blocked on design (fallback: shared `/images/awards/award-frame.png`).

---

## Technical Context

| Category | Value |
|---|---|
| Language/Framework | TypeScript (strict) / Next.js 16 App Router |
| Primary Dependencies | React 19, TailwindCSS 4, `@supabase/ssr`, `next/image`, `next/link` |
| Database | None (static content) |
| Testing | Vitest (unit), React Testing Library, Playwright (E2E) |
| State Management | Server-side SSR + one small client component with local `useState`; no global store |
| API Style | None for this feature; inherits Supabase `auth.getUser()` from middleware |
| Deployment | Cloudflare Workers (OpenNext adapter) |
| Package Manager | Yarn v1 |

---

## Constitution Compliance Check

*GATE: Must pass before implementation can begin.*

| Constitution Rule | Requirement | Status | How this feature complies |
|---|---|---|---|
| I.1 TypeScript strict | All source TS with strict mode | ✅ | All new files in TS |
| I.1 File-per-component | One component/hook per file | ✅ | `AwardsHeroBanner`, `AwardsCategoryNav`, `AwardDetailSection`, etc. each own file |
| I.1 `@/*` path alias | No `../../` traversal | ✅ | Every import uses `@/components/...`, `@/data/...`, `@/libs/...` |
| I.1 Naming | PascalCase components, camelCase utils | ✅ | Component names verified |
| I.1 Folder structure | `src/components/[feature]/` | ✅ | New folder `src/components/awards/` |
| II Responsive | 3 breakpoints + touch targets ≥ 44×44 + WCAG 2.2 AA | ✅ | Breakpoints in design-style §Responsive. **Touch targets**: Left nav is `hidden lg:block` (desktop-only), so its 44×44 rule doesn't apply. All mobile-visible interactive widgets (header nav, footer nav, Kudos CTA, FAB, skip link) are **reused from Homepage unchanged** — their 44×44 compliance is verified there and inherited. Awards page introduces no new mobile-visible interactive elements. Accessibility §in spec. |
| II Responsive | No fixed pixel widths for containers | ✅ | Elements (nav column 220px, badge 336×336) are **components**, not page containers. Page containers use `max-w-*` + `w-full` |
| III TDD | Red-Green-Refactor + co-located tests | ✅ | TR-009 maps 5 test categories; `__tests__/` folders alongside components |
| IV.1 Auth | Verify session server-side | ✅ | FR-002 + FR-013: `supabase.auth.getUser()` with try/catch + `redirect("/login")` |
| IV.2 Input validation | Server-side validation for user input | N/A | No user input on this feature |
| IV.3 XSS | No `dangerouslySetInnerHTML`; escape user content | ✅ | All copy is authored (i18n strings) — interpolated via standard JSX `{value}` which auto-escapes; no DANGEROUSLY_SET_INNER_HTML anywhere. Long descriptions may contain `"`, `–`, quotes — React handles these natively |
| IV.4 CSRF | State-changing ops use POST/PUT/DELETE | N/A | No mutations |
| IV.5 Secrets | No server secrets in client code | ✅ | No env secrets touched by this feature |
| V.1 Next.js | Server Components by default | ✅ | Only `AwardsCategoryNav` is `"use client"` (needs IntersectionObserver + DOM refs); everything else SSR |
| V.1 Next.js | `next/image` + `next/link` | ✅ | All images via `<Image>`; all internal nav via `<Link>` or plain `<a href="#">` for hash-only |
| V.1 Next.js | Data in Server Components | ✅ | Zero client-side fetch; static data |
| V.3 Cloudflare Workers | No Node native modules; small bundle | ✅ | Native `IntersectionObserver`, no new deps (TR-007). Bundle target ≤ 50 KB (TR-003) |
| V.4 Tailwind | Utility-first, tokens via globals.css | ✅ | One new token `--color-nav-dot` added to `src/app/globals.css`; everything else inherits existing tokens |

**No violations.** Plan is constitution-compliant.

---

## Architecture Decisions

### Frontend Approach

**Component structure** — feature-scoped folder `src/components/awards/` mirroring the `src/components/homepage/` pattern:

```
src/components/awards/
├── AwardsHeroBanner.tsx          (server) — hero with Root Further backdrop + title
├── AwardsCategoryNav.tsx         (client) — sticky left nav with scroll-spy
├── AwardDetailSection.tsx        (server) — single award section (image + content)
├── AwardContent.tsx              (server) — right-side content block (extracted for testability)
├── AwardPrizeValueRow.tsx        (server) — renders 1 prize-value row with conditional suffix
└── __tests__/
    ├── AwardDetailSection.spec.tsx
    ├── AwardPrizeValueRow.spec.tsx
    └── AwardsCategoryNav.spec.tsx
```

Rationale for splitting `AwardContent` and `AwardPrizeValueRow`:
- Prize-value conditional logic (FR-007: 3 cases) is the only interesting logic on the page → isolate into a tiny focused component + unit tests
- `AwardDetailSection` becomes a pure layout wrapper (alternating direction, image on left/right) with low behavioural surface

**Deviation from design-style.md Implementation Mapping**:
- Design-style lists `<AwardsCategoryNavItem>` (one per nav link) and `<AwardBadgeImage>` (per-card image) as separate components. This plan **consolidates** both into their parents:
  - Nav items render inline inside `<AwardsCategoryNav>` via `.map()` — they have no independent behaviour, all handlers live in the parent client component. Splitting would add a component file for zero testability benefit.
  - Badge images render inline inside `<AwardDetailSection>` as a `<Image>` with `ring` + `aspect-square` styling. No per-image props beyond `src` + `alt` — no component necessary.
- Trade-off: slightly larger `AwardsCategoryNav` + `AwardDetailSection` files, but cleaner import graph and zero artificial indirection. Aligns with constitution I "duplicate is acceptable until clear pattern emerges across three or more usages" — one usage each → no premature split.

**State management**:
- **100% server-rendered content** except `<AwardsCategoryNav />`
- `<AwardsCategoryNav />` local state: `activeSlug`, `prefersReducedMotion`, `isProgrammaticScrolling` (for FR-005a pause-during-click). No context / store / React Query needed.
- Awards data: frozen TypeScript constant `AWARDS` from `src/data/awards.ts` (extended with new fields)
- i18n: server-provided via existing `getMessages()` pattern from Homepage; client nav receives `labels` prop

**Data fetching**:
- `supabase.auth.getUser()` in page server component for session gate (same pattern as Homepage `src/app/page.tsx`)
- No runtime data fetch beyond auth

**Styling strategy**:
- TailwindCSS utility classes
- CSS custom properties for design tokens (add `--color-nav-dot`)
- Arbitrary values (`w-[336px]`, `lg:top-[120px]`) allowed where tokens don't cover (per Homepage precedent)

### Backend Approach

**N/A** — no backend changes. Reuses existing Supabase Auth session check (middleware + server client).

### Integration Points

| Existing | How this feature uses it |
|---|---|
| `<SiteHeader navItems={HEADER_NAV} sticky bgVariant="brand-700" right={...} />` | Reuse unchanged; `NavLink` auto-sets `aria-current="page"` for `/awards` because `HEADER_NAV[1].href === "/awards"` |
| `<SiteFooter navItems={FOOTER_NAV} showLogo />` | Reuse unchanged |
| `<LanguageToggle>` / `<NotificationBell>` / `<ProfileMenu>` | Slot into `SiteHeader.right` (same composition as Homepage) |
| `<HeroBackdrop />` | **Reuse**: the Awards hero reuses the same backdrop + gradient logic from Homepage. Export this component (currently only imported by `src/app/page.tsx`). |
| `<KudosPromoBlock />` | Reuse verbatim as bottom section |
| `<QuickActionsFab />` | Reuse verbatim (fixed bottom-right) |
| `src/data/awards.ts` `AWARDS` constant | **Extend** with `longDescKey`, `prizeCount`, `prizeUnit`, `prizeValues[]` |
| `src/components/ui/Icon.tsx` | **Extend** with 3 new icons: `target`, `diamond`, `license` |
| `src/messages/vi.json` + `en.json` | **Extend** with `awards.*` keys (hero, nav, card, per-award title + description). EN descriptions blocked on Product (Q1) — initial ship can fall back to VN catalogue. |
| `src/app/globals.css` | **Add** `--color-nav-dot: #D4271D` to `@theme` block |
| `src/libs/supabase/server.ts` | Reuse `createClient()` |
| `src/libs/i18n/getMessages.ts` | Reuse `getMessages()` |
| `src/libs/analytics/track.ts` | Reuse `track({ type: "screen_view", screen: "awards" })` — type already includes `screen: string` |

**Breaking-change surface**: `src/data/awards.ts` type extension. Homepage `<AwardCard />` only reads `{id, slug, titleKey, descKey, image}` → unchanged.

**Regression verification strategy** — Homepage currently has unit tests for shared primitives (Icon, PrimaryButton) but **no** dedicated `<AwardCard />` component test (those were deferred in Homepage MVP tasks T030/T044-T047). To guard against regression from the data extension:
1. `yarn typecheck` — catches any type-shape breakage immediately
2. `yarn lint` — catches unused field references
3. **Manual smoke verification**: after P1.1 extension, load `/` in dev and confirm all 6 AwardCards still render with title + desc + detail link (≤ 2 min check)
4. **Optional**: write a minimal `<AwardCard />` snapshot test in P1 to make future regression detection automatic — logged as bonus task, not blocking.

---

## Project Structure

### Documentation (this feature)

```
.momorph/specs/zFYDgyj_pD-awards-system/
├── spec.md              # Feature specification (DONE)
├── design-style.md      # Design specifications (DONE)
├── plan.md              # This file
├── tasks.md             # (next step — /momorph.tasks)
├── research.md          # (not needed — research integrated inline below)
└── assets/
    └── frame.png        # Figma frame reference
```

### Source Code — New Files

| File | Purpose |
|---|---|
| `src/app/awards/page.tsx` | **Replace stub.** Server Component with session gate, composes AwardsHeroBanner + AwardsPageContent (nav+list) + KudosPromoBlock + FAB |
| `src/components/awards/AwardsHeroBanner.tsx` | Server comp — reuses `<HeroBackdrop />` pattern, layouts decorative ROOT FURTHER wordmark top-left + `<h1>` + caption bottom-center |
| `src/components/awards/AwardsCategoryNav.tsx` | **Client** comp — `"use client"`, IntersectionObserver scroll-spy, smooth-scroll on click, `history.replaceState` URL update, reduced-motion support, pause-during-programmatic-scroll |
| `src/components/awards/AwardDetailSection.tsx` | Server comp — 2-col alternating layout, renders image + AwardContent. Props: `award`, `reverse` (bool, for even indices) |
| `src/components/awards/AwardContent.tsx` | Server comp — title (h2) + long description + prize count row + prize value rows |
| `src/components/awards/AwardPrizeValueRow.tsx` | Server comp — renders ONE prize-value row with conditional suffix (FR-007 logic isolated here) |
| `src/components/awards/__tests__/AwardDetailSection.spec.tsx` | Unit tests: renders title, description, alternating direction |
| `src/components/awards/__tests__/AwardPrizeValueRow.spec.tsx` | Unit tests: 3 suffix cases (count>1, count=1 single, count=1 split) |
| `src/components/awards/__tests__/AwardsCategoryNav.spec.tsx` | Unit tests: (1) click updates active + hash via `history.replaceState`, (2) Enter/Space key activates same handler as click, (3) scroll-spy pause during programmatic scroll (respects `scrollend` or 600 ms fallback), (4) `hashchange` event listener re-syncs active state when user navigates via browser back/forward, (5) `prefers-reduced-motion: reduce` swaps `"smooth"` → `"instant"`, (6) initial hash on mount auto-scrolls to matching section |
| `tests/e2e/awards.spec.ts` | Playwright E2E: deep link from Homepage, language toggle flip, keyboard nav |

### Source Code — Modified Files

| File | Changes |
|---|---|
| `src/data/awards.ts` | Extend `Award` type + each entry with `longDescKey`, `prizeCount`, `prizeUnit`, `prizeValues[]`. Keep existing fields untouched (Homepage compat). |
| `src/components/ui/Icon.tsx` | Add `"target" | "diamond" | "license"` to `IconName` union; add 3 `case` branches with inline SVG (paths fetched from Figma in Phase 0) |
| `src/components/ui/__tests__/Icon.spec.tsx` | Add 3 test cases for new icons (render + aria-label) |
| `src/messages/vi.json` | Add `awards.hero`, `awards.nav`, `awards.card`, `awards.{topTalent\|topProject\|...}` blocks (6 descriptions verbatim from design-style §i18n Message Keys) |
| `src/messages/en.json` | Mirror keys; long descriptions fallback to VN copy pending Q1 answer (mark with TODO comment) |
| `src/app/globals.css` | Add `--color-nav-dot: #D4271D;` to the `@theme` block |
| `src/app/page.tsx` (Homepage) | **Only if** we need to refactor `<HeroBackdrop />` export — moving it from `src/components/homepage/` to `src/components/common/` or keeping co-located with re-export. **Decision**: keep in `src/components/homepage/HeroBackdrop.tsx` and import from there in both places — no file move. |

### Dependencies

**None added.** Native `IntersectionObserver`, `history.replaceState`, `matchMedia` handle all behavior. TR-007 compliance.

---

## Implementation Strategy

### Phase 0: Asset Preparation

**Purpose**: Gather all non-code prerequisites so code phases are not blocked mid-flight.

- **P0.1** Fetch 3 icon SVG paths from Figma MCP:
  - Target: `mcp__momorph__get_design_item_image` with `nodeId="I313:8467;214:2529"` → extract path data
  - Diamond: same tool with `nodeId="I313:8467;214:2535"`
  - License: same tool with `nodeId="I313:8467;214:2543"`
  - Save normalised 24×24 viewBox paths as code snippets ready for `Icon.tsx`
- **P0.2** Verify hero key visual (`/images/homepage-hero.png`) + KUDOS logo (`/images/logo_footer_Kudos.png`) + shared ring (`/images/awards/award-frame.png`) exist in `public/` — already shipped with Homepage. Spot-check sizes.
- **P0.3** **Do NOT block on the 6 unique award badges** — assets-to-export.md item #2 is blocked on design team. Implement with shared `award-frame.png` fallback (same asset used by Homepage `<AwardCard />`); when design ships the 6 PNGs, swap `award.image` paths per card.
- **P0.4** Confirm `NEXT_LOCALE` cookie + `getMessages()` helper still work (no new env vars needed).

**Exit criteria**: Icon paths in hand; all image paths verified; no font license decisions needed (Digital Numbers not used here).

---

### Phase 1: Foundation

**Purpose**: Extend shared code so every subsequent phase has what it needs.

- **P1.1** Extend [src/data/awards.ts](src/data/awards.ts) — add new fields (`longDescKey`, `prizeCount`, `prizeUnit`, `prizeValues[]`) to the `Award` type and to each of 6 `AWARDS` entries. Decision on field optionality:
  - **New fields are required (not `?:`)** on the `Award` type. Rationale: the only consumer of the `Award` type in the codebase is the `AWARDS` constant in this same file — we control both ends. Homepage's `<AwardCard />` destructures only the original fields `{id, slug, titleKey, descKey, image}` which are preserved unchanged; it never creates `Award` instances nor references the new fields, so making new fields required doesn't break Homepage.
  - Required fields make it impossible to forget filling them in when adding a 7th award in the future. Optionality would be premature laziness.
  - Verify Homepage `<AwardCard />` still type-checks + renders via existing 60 unit tests + `yarn typecheck` + 30-second dev smoke.
- **P1.2** Extend [src/components/ui/Icon.tsx](src/components/ui/Icon.tsx) — add 3 icons. Write tests first (TDD Red), then implement paths from P0.1 (Green).
- **P1.3** Extend [src/messages/vi.json](src/messages/vi.json) + [src/messages/en.json](src/messages/en.json) — add `awards.*` keys per design-style i18n block. EN descriptions use VN verbatim pending Q1.
  - **Skip link copy**: Reuse existing `homepage.skipToMain` key (same text "Bỏ qua và chuyển đến nội dung chính" / "Skip to main content" is reusable across all authenticated pages). Short-term pragmatic; if/when a 3rd screen needs it, promote to `common.skipToMain` (constitution I — avoid premature abstraction).
  - **Page `<title>` + meta** (Q6 default): Add keys `awards.meta.title` = "Hệ thống giải thưởng | SAA 2025" and `awards.meta.description` = "Toàn bộ 6 hạng mục giải thưởng SAA 2025: Top Talent, Top Project, Top Project Leader, Best Manager, Signature 2025 - Creator, MVP" (mirror in EN). Consumed by metadata export in P2.5.
- **P1.4** Add `--color-nav-dot` token to [src/app/globals.css](src/app/globals.css).
- **P1.5** **(No-op verification)** `<HeroBackdrop />` already exports as a named export from `src/components/homepage/HeroBackdrop.tsx` (verified against Homepage's `src/app/page.tsx` line 11 import). No code change needed — just confirm awareness that we'll import it from `@/components/homepage/HeroBackdrop` in `<AwardsHeroBanner>` (Phase 2), not re-create the backdrop logic. Dropping this line if preferred; keeping as explicit awareness marker.
- **P1.6** **Phase 1 exit gate**: `yarn typecheck` clean; `yarn lint` clean; `yarn test:run` all existing + new Icon tests pass; Homepage `/login` + `/` still render unchanged (regression smoke).

---

### Phase 2: Core UI — User Story 1 (P1)

**Purpose**: Render all 6 award sections as static content. This alone delivers US1's MVP — users can arrive at `/awards` and browse.

**Task dependency DAG (within Phase 2):**

```
        P2.1 (AwardPrizeValueRow)
                │
                ▼
        P2.2 (AwardContent)
                │
                ▼
        P2.3 (AwardDetailSection) ──┐
                                    │
        P2.4 (AwardsHeroBanner) ────┼──► P2.5 (page.tsx) ──► P2.6 (exit gate)
                                    │
     (parallel with P2.1–P2.3) ─────┘
```

- **P2.4 can run in parallel** with P2.1/P2.2/P2.3 since it only depends on the reused `<HeroBackdrop>` (existing).
- **P2.5** depends on all 4 upstream components.
- **P2.6** is the final exit gate.

---

- **P2.1** Implement `<AwardPrizeValueRow>` **test-first**. This component renders exactly ONE row; caller decides how many rows to render. Props: `amountVnd: number`, `suffixKey?: string`, `icon: "diamond" | "license"`. Two test cases:
  1. `suffixKey` present → renders "{VND} cho mỗi giải thưởng" (or "cho giải cá nhân"/"tập thể" per key)
  2. `suffixKey` absent/undefined → renders just "{VND}" with no trailing text
  (The FR-007 "3 cases" distinction is handled at the parent level — `AwardContent` decides to render 0 / 1 / 2 rows and which `suffixKey` per row.)
- **P2.2** Implement `<AwardContent>` — composes title h2 + description + prize count row + 1-or-2 `<AwardPrizeValueRow>` children. **Conditional row rendering** lives here (FR-007 parent-level logic): if `prizeValues.length === 1`, render one row; if `=== 2`, render two rows. Dedicated test not required — coverage comes via `AwardDetailSection` integration test (§P2.3) which exercises both paths via Top Talent (1 row with suffix) + Signature 2025 (2 rows with distinct suffixes).
- **P2.3** Implement `<AwardDetailSection>` — 2-col alternating layout with `reverse` prop. **Responsive image** (TR-010): desktop `w-[336px] h-[336px]`, tablet/mobile `w-full max-w-[336px] aspect-square mx-auto`. **Image loading strategy** (CLS/LCP target SC-004): accept `priority: boolean` prop on the section; set `priority={true}` only for the **first** section (Top Talent) so its badge counts toward LCP without hurting it; remaining 5 badges lazy-load via default `<Image>` behaviour. Always provide explicit `width={336}` and `height={336}` on `<Image>` to reserve layout space → CLS target < 0.1. Test: reverse=false → image right; reverse=true → image left; mobile viewport → stacked single column. Also covers `AwardContent` integration implicitly.
- **P2.4** Implement `<AwardsHeroBanner>` — reuses `<HeroBackdrop />` wrapper, adds ROOT FURTHER decorative `<div aria-hidden>` top-left + caption + `<h1>` center-bottom.
- **P2.5** Create `src/app/awards/page.tsx` — server component with:
  - **SEO metadata** (Q6 default): `export const metadata: Metadata` or `export async function generateMetadata()` (async if locale-aware) reading `awards.meta.title` + `awards.meta.description` from `getMessages()`. Next.js App Router convention — injected into `<head>` at SSR. Prefer `generateMetadata` to respect `NEXT_LOCALE` cookie.
  - **Skip link**: `<a href="#main">` reading `messages.homepage.skipToMain` (reuse decision from P1.3). Same class chain as Homepage.
  - session gate + `redirect("/login")` with try/catch (FR-002, FR-013)
  - `track({ type: "screen_view", screen: "awards" })` (FR-011)
  - layout: SiteHeader + main (HeroBanner + 6 AwardDetailSections with alternating `reverse` prop) + KudosPromoBlock + SiteFooter + FAB
  - no left nav yet (deferred to Phase 3)
- **P2.6** **Phase 2 exit gate**: `/awards` renders all 6 sections correctly; Homepage AwardCard deep-link `/awards#top-talent` works via native browser anchor (no JS needed); typecheck + lint + tests green.

---

### Phase 3: Enhancement — User Story 2 (P1)

**Purpose**: Add the sticky left nav with scroll-spy + smooth-scroll + URL-hash-on-click.

- **P3.1** Scaffold `<AwardsCategoryNav>` client component (`"use client"`). Props:
  - `items: { slug: AwardSlug; label: string }[]` — 6 entries, label already resolved server-side from i18n (not a key to look up)
  - `ariaLabel: string` — aria-label for the `<nav>` wrapper (e.g., "Awards categories" / "Danh mục giải thưởng")
  - `initialActiveSlug: AwardSlug` — server-provided default `"top-talent"` unless the page's initial hash sets otherwise (client reads `window.location.hash` on mount anyway)

  **Rendering contract**: Each nav item MUST render as `<a href="#<slug>">` (NOT `<button>`). Rationale: with JS disabled, native browser anchor scrolling still works (Risk #10 mitigation). When JS is active, the click handler calls `event.preventDefault()` and invokes the smooth-scroll + hash-update logic. Keyboard Enter on the anchor activates the same handler via `onKeyDown`.
- **P3.2** Implement click handler → smooth-scrolls to `#<slug>` + `history.replaceState` + updates `activeSlug` state + pauses scroll-spy until `scrollend` / 600 ms fallback (FR-004, FR-005a).
- **P3.3** Implement IntersectionObserver scroll-spy (FR-005). `rootMargin: "-40% 0px -60% 0px"`. Observe the 6 `<section id="<slug>">` elements. Update `activeSlug` on intersection.
- **P3.4** Implement `prefersReducedMotion` detection (`matchMedia`) + swap `"smooth"`/`"instant"`.
- **P3.5** Implement initial hash-scroll on mount (FR-003): if valid slug in `window.location.hash`, scroll after 1 frame. Also listen for `hashchange` event (TR-006) — browser back/forward through history hashes should re-trigger scroll without page reload.
- **P3.6** Implement keyboard handlers: Enter/Space activate, focus ring visible (FR-014).
- **P3.7** Mount `<AwardsCategoryNav>` in `src/app/awards/page.tsx` — 2-column grid wrapper, nav left (`hidden lg:block`), content column right.
- **P3.8** Section id attribute — each `<AwardDetailSection>` wrapped in `<section id={award.slug}>` so IntersectionObserver + `scrollIntoView` can find it.
- **P3.9** **Phase 3 exit gate**: click each of 6 nav items → scroll + URL hash + active state; scroll manually → active state updates; deep link from Homepage award card lands on correct section; browser back-button re-fires `hashchange` → scroll to previous section.

---

### Phase 4: Polish — Responsive + a11y + perf (US3 smoke check)

- **P4.1 (US3 smoke check)**: Confirm `<KudosPromoBlock />` renders unchanged at the bottom with "Chi tiết →" navigating to `/kudos`. Since this is a Homepage-reused component, no net-new UI work — just a 30-second visual verification in dev.
- **P4.2 Responsive resize (FR-015)**: Verify no layout shift when the browser viewport crosses the 1024 px (`lg:`) breakpoint. Test manually in dev tools by dragging window width across boundary. Expected: left nav collapses/expands instantly via Tailwind `hidden lg:block`; content column re-flows without jump. No JS intervention needed — pure CSS via Tailwind responsive classes.
- **P4.3 axe-core a11y sweep** at mobile (375×812) + desktop (1440×900) viewports — target 0 serious/critical violations (SC-003). Run via `@axe-core/playwright` utility.
- **P4.4 Lighthouse** mobile slow-4G → LCP < 2.5 s, CLS < 0.1 (SC-004). Tooling options (pick one):
  1. `yarn cf:preview` + Chrome DevTools Lighthouse panel → manual run, no new deps
  2. Install `lighthouse` CLI as devDep + run `lighthouse http://<preview-url>/awards --preset=mobile --throttling.cpuSlowdownMultiplier=4`
  3. web.dev/measure against preview URL (browser-based, zero install)
  **Default**: option 1 (manual DevTools) — zero tooling setup. Only install Lighthouse CLI if we want to wire it into CI later (out of scope for MVP).
- **P4.5 Tab order**: skip link → header (logo → About → Awards → Kudos → bell → language → profile) → left nav × 6 → Kudos CTA → footer × 4 → FAB. Verify via Playwright test.
- **P4.6 Focus ring** visible on all interactive elements (Award sections are non-interactive so have no focus ring — confirmed).
- **P4.7 Language toggle** VN↔EN flips all visible copy without layout shift (SC-005).
- **P4.8 Visual verify** via Playwright screenshot + compare to `assets/frame.png` at 1440×900 desktop.

---

### Phase 5: E2E & Regression

- **P5.1** **Create** the shared auth fixture `tests/e2e/fixtures/auth.ts` (Awards is the **first** feature to need it — Homepage MVP deferred its E2E tests T044–T064, so no fixture exists yet). The fixture should: construct a mock Supabase session cookie valid for the test Supabase project, inject into Playwright's `page.context().addCookies()`. Shape matches `sb-<project-ref>-auth-token` cookie. When Homepage E2E lands later, it will reuse this fixture without modification.
- **P5.2** Write `tests/e2e/awards.spec.ts` covering:
  - Unauthenticated → redirect to `/login?next=/awards`
  - Authenticated happy path: hero + 6 sections + Kudos + footer render
  - Click each nav item → URL hash + scroll
  - Deep link `/awards#best-manager` on cold load → auto-scroll
  - Language toggle VN↔EN flips copy
  - Keyboard: focus nav + Enter activates
  - `hashchange` from browser back/forward → active section updates
- **P5.3** **Regression**: Homepage currently has no E2E suite (deferred). Regression strategy is:
  - `yarn typecheck` + `yarn lint` + `yarn test:run` (60 existing unit tests) all pass after `src/data/awards.ts` extension — catches type/unit-level regressions
  - **Manual smoke**: visit `/` in `yarn dev`, confirm all 6 AwardCards render with correct titles and descriptions — 30-second check
  - **Optional P5.3.b**: If a `<AwardCard />` snapshot test was added in P1 (bonus), run it in CI
  - Full Homepage E2E regression will be covered when Homepage E2E tasks T044–T064 eventually land (outside this feature's scope)

### Risk Assessment

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Icon SVG path extraction from Figma MCP fails or returns complex multi-path SVGs | Medium | Low | Fallback to generic Lucide-style icons (Target = crosshair, Diamond = gem, License = certificate) — visual parity acceptable for v1. Document in task note. |
| 6 unique award badges remain blocked on design → all cards look identical | High | Low | Shared `award-frame.png` works as fallback (same as Homepage). Track in [assets-to-export.md](../i87tDx10uM-homepage-saa/assets-to-export.md). Swap per-card when exports arrive (single commit). |
| `scrollend` not fired in Safari < 16.4 → scroll-spy unpauses immediately after click | Low | Low | 600 ms `setTimeout` fallback (FR-005a) handles all browsers. Feature-detect `'onscrollend' in window`. |
| Extending `Award` type breaks Homepage `<AwardCard />` type-check | Low | Medium | Additive field changes only; existing fields preserved; run `yarn typecheck` immediately after P1.1 to catch. |
| Bundle size regression pushes `/awards` over 50 KB gzipped | Low | Low | Only `AwardsCategoryNav` adds JS (~2–3 KB); rest is SSR. Monitor via `yarn analyze` once bundle guard is in place. |
| EN translations for 6 descriptions unavailable on Day 1 (Q1 unanswered) | Medium | Medium | Fallback: EN catalogue stores VN verbatim — users with locale=en still see VN long descriptions. Add TODO comment. Update once Product provides EN. |
| IntersectionObserver threshold edge-case: short sections smaller than viewport never trigger "below-40%" | Low | Low | All 6 sections are tall (image 336 + description 3 paragraphs = ~700+ px) → always taller than 60% viewport. Non-issue for real data. |
| Clicking same active nav item scrolls away then back | Low | Low | Test in Phase 3; document idempotent behavior in spec edge cases (already noted). |
| Next.js App Router soft-navigation strips/ignores URL hash fragments | Medium | Medium | **Verify in P3.5**: set `window.location.hash = "#best-manager"` then reload → browser MUST auto-scroll to the section before our client mount handler runs; if Next.js strips the hash during client-side soft-nav from Homepage → manually call `scrollIntoView` on mount. Known Next.js quirk: fragment links via `<Link href="/awards#slug">` may not scroll on soft-nav. Mitigation: add a `hashchange` + effect listener in `AwardsCategoryNav` that always runs on mount if hash is present (belt-and-braces). |
| JS-disabled browsers rely on native `<a href="#slug">` anchor scrolling but `AwardsCategoryNav` might render as `<button>` | Low | Low | Render nav items as `<a href="#<slug>">` (not `<button>`) so the fragment-scroll fallback works natively. Click handler calls `preventDefault()` when JS runs; without JS, the browser handles the anchor. |

### Estimated Complexity

| Area | Complexity | Reasoning |
|---|---|---|
| Frontend UI | **Low** | 5 new server components + 1 client component; 90% static JSX |
| Client interactivity | **Medium** | IntersectionObserver + `scrollend` + `history.replaceState` + reduced-motion — 3 APIs to coordinate but well-scoped to one component |
| Data extension | **Low** | Additive type change |
| Testing | **Medium** | Scroll-spy needs IntersectionObserver mock; E2E needs auth fixture share |
| Overall | **Low-Medium** | ~2-3 days single-dev; 1 day if parallelised |

---

## Integration Testing Strategy

### Test Scope

- [x] **Component/Module interactions**: Page composition (SiteHeader + HeroBanner + Nav + 6 Sections + Kudos + Footer); AwardContent ↔ AwardPrizeValueRow (conditional rendering)
- [x] **External dependencies**: Supabase Auth (mocked via existing pattern from Homepage integration tests)
- [ ] **Data layer**: N/A — no DB
- [x] **User workflows**: Homepage AwardCard → deep link → `/awards#<slug>` → correct section scrolled into view

### Test Categories

| Category | Applicable? | Key Scenarios |
|---|---|---|
| UI ↔ Logic | Yes | Prize-value conditional; scroll-spy active state tracking; reduced-motion branch |
| Service ↔ Service | No | N/A |
| App ↔ External API | Yes | Supabase `auth.getUser()` — success, failure (FR-013), no session |
| App ↔ Data Layer | No | N/A |
| Cross-platform | Yes | Responsive: desktop sticky nav visible / mobile hidden; image scaling |

### Test Environment

- **Unit**: Vitest + happy-dom + `@testing-library/react` (existing stack)
- **E2E**: Playwright on `yarn dev` (happy-path) and `yarn build && yarn start` (regression before merge)
- **Data strategy**: Hard-coded `AWARDS` constant — no fixtures needed for data
- **Isolation**: Each test re-renders component with fresh DOM; Playwright uses isolated browser context per test

### Mocking Strategy

| Dependency | Strategy | Rationale |
|---|---|---|
| `createClient()` from `@/libs/supabase/server` | **Mock** with Vitest `vi.mock()` at module boundary | Same pattern as Homepage integration tests |
| `IntersectionObserver` | **Mock** via `vi.stubGlobal('IntersectionObserver', MockClass)` | Real observer doesn't fire in JSDOM; manual trigger in tests |
| `matchMedia` for reduced-motion | **Mock** with `vi.stubGlobal` | JSDOM lacks media-query support |
| `scrollIntoView` | **Mock** — assert call args only | JSDOM doesn't implement scrolling |
| `history.replaceState` | **Real** — JSDOM supports it | Verify final `location.hash` |
| `track()` analytics | **Mock** — assert called with right event | Prevent console noise |

### Test Scenarios Outline

#### Happy path
- [ ] `/awards` SSR renders all 6 sections with correct copy
- [ ] `AwardsCategoryNav` click → updates `activeSlug` state + URL hash
- [ ] Scroll past a section boundary → active state moves to next section
- [ ] Deep link `/awards#signature-2025-creator` → page auto-scrolls (mocked) + nav active = Signature 2025

#### Error handling
- [ ] `createClient()` throws → page redirects to `/login` (FR-013)
- [ ] `getUser()` returns no user → redirect to `/login`
- [ ] Invalid hash `/awards#nonexistent` → first section active, no crash

#### Edge cases
- [ ] `prefers-reduced-motion: reduce` → scroll uses "instant" not "smooth"
- [ ] `scrollend` unsupported → 600 ms timeout unpauses scroll-spy
- [ ] JS disabled → all 6 sections render server-side; `<a href="#slug">` still works
- [ ] Mobile viewport (< 1024px) → nav hidden, sections stack single-column
- [ ] Prize-count = 1 single value → no "cho mỗi giải thưởng" suffix
- [ ] Prize-count = 1 two values (Signature) → 2 rows with "cá nhân" / "tập thể" suffixes

### Tooling & Framework

- **Test framework**: Vitest 4.x (already in devDeps)
- **Supporting tools**: `@testing-library/react`, `@testing-library/jest-dom`, `happy-dom`, `@axe-core/playwright`
- **CI integration**: `yarn lint && yarn typecheck && yarn test:run` as pre-merge gate; `yarn e2e` on PR preview deployment

### Coverage Goals

| Area | Target | Priority |
|---|---|---|
| Prize-value conditional logic (FR-007) | 100% | **High** — business rule, 3 branches |
| AwardsCategoryNav interaction (click, scroll-spy, hash) | 90%+ | **High** — only interactive component |
| Page shell composition (session gate, analytics, rendering) | 80%+ | Medium |
| AwardDetailSection alternating layout | 70% | Medium |
| Icon rendering (3 new icons) | 100% | **High** — smoke tests for regression |
| E2E happy paths | Key flows only | Medium — 5 critical scenarios |

---

## Dependencies & Prerequisites

### Required Before Start

- [x] `.momorph/constitution.md` reviewed — compliance check done above
- [x] `spec.md` approved — review-specify pass 3× with all fixes applied
- [x] `design-style.md` approved — includes all 6 verbatim VN descriptions + icon source IDs
- [x] Homepage regression baseline — **60 unit tests passing on main** (last verified after Homepage MVP + Kudos promo rework). Any drift before starting P1.1 will be caught by `yarn test:run` at P1.6 exit gate.

### External Dependencies

- **Figma MCP** — needed in Phase 0 only (icon SVG path extraction). Fallback: generic icon shapes if MCP unavailable.
- **Design team** — blocked on 6 unique award badge PNGs (not blocking start — fallback is in place).
- **Product team** — blocked on Q1 (EN translation). Not blocking start — EN catalogue ships with VN fallback.

### Open Questions (carried from spec)

Q1 (EN translation), Q2 (tax notation), Q3 (Signature eligibility wording), Q4 (default active nav), Q5 (final title), Q6 (SEO metadata), Q7 (Signature 2025 nav wrap), Q8 (scroll-spy URL update) — all **non-blocking**. Defaults documented in spec.md; implementers can proceed with assumptions and document as TODO comments.

---

## Next Steps

After plan approval:

1. **Run** `/momorph.tasks zFYDgyj_pD` to generate an ordered task breakdown with `[P]` parallel markers and per-phase exit gates.
2. **Review** `tasks.md` for parallelisation opportunities (Phase 2 static components can all be built in parallel).
3. **Begin** Phase 0 (icon fetch) → Phase 1 (foundation) → Phase 2–5 in order.

---

## Notes

### Key decisions

- **Single client component**: `<AwardsCategoryNav>` is the only `"use client"` file. Keeps hydration cost negligible and matches constitution V.1 "Server Components by default".
- **Reuse over refactor**: `<HeroBackdrop>` stays in `src/components/homepage/`. Importing from across folders is fine; refactoring to `src/components/common/` would be premature abstraction (constitution I: "duplicate is acceptable until clear pattern emerges across 3+ usages").
- **Static data wins**: No Supabase query for awards. All 6 entries in TypeScript. Rationale: 6 rows of award data + ~500 words per description = no justification for a DB round-trip per request. If Product ever wants to edit without redeploy, migrate to CMS (post-MVP).
- **Heading hierarchy**: Per FR-016 — 1 H1 (hero title) + 6 H2 (award titles). ROOT FURTHER wordmark is `aria-hidden` decorative. No H3+ needed.
- **URL-hash on click only** (Q8 default): Scroll-spy does not rewrite URL during passive scroll. Matches spec default.

### Lessons from Homepage

Homepage MVP had to re-export bitmap assets as CSS text because the exported PNGs were text-label bitmaps. For Awards, the only image asset that's blocked is the 6 unique badges — and we have a proven fallback (shared `award-frame.png` with text overlay). No new asset-quality risks.

### Testing philosophy

Focus on the **one place business logic lives**: `<AwardPrizeValueRow>` (FR-007 three cases) and `<AwardsCategoryNav>` (scroll-spy + hash). Everything else is declarative JSX — integration/E2E coverage is sufficient.
