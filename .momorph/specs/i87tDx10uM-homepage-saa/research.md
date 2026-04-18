# Research: Homepage SAA

**Frame**: `i87tDx10uM-homepage-saa`
**Date**: 2026-04-17
**Spec**: [spec.md](spec.md)
**Design**: [design-style.md](design-style.md)

---

## Purpose

Unlike Login (day-0 repo bootstrap), Homepage lands on **a live codebase**
with foundation already in place from Login. This doc catalogs what to reuse,
what to extend, and what's genuinely new — so the plan can skip redundant
bootstrap work.

---

## Repository Snapshot (after Login ship)

| Area | Current state | Source of truth |
|------|---------------|-----------------|
| Stack | Next.js 16.2.4 · React 19 · TypeScript strict · Tailwind CSS 4 · Yarn v1 · `@supabase/ssr` · `@opennextjs/cloudflare` | [package.json](../../../package.json) |
| Folder layout | `src/app` + `src/components/{ui,layout,login}` + `src/libs/{auth,i18n,supabase,analytics,env}` + `src/messages` + `src/types` | [src/](../../../src/) |
| Tailwind tokens | Brand 900, 800; accent cream + cream-hover + cream-active; divider; Montserrat + Montserrat Alternates fonts | [src/app/globals.css](../../../src/app/globals.css) |
| Auth | Supabase Google OAuth + `/auth/callback` + domain allow-list + middleware session refresh | [src/app/auth/callback/route.ts](../../../src/app/auth/callback/route.ts) |
| i18n | VI + EN catalogs + `getMessages()` + `setLocale` Server Action + `<LanguageToggle />` + `<LanguageDropdown />` | [src/libs/i18n/](../../../src/libs/i18n/) |
| Analytics | Typed event emitter (screen_view / login_* / language_change) | [src/libs/analytics/track.ts](../../../src/libs/analytics/track.ts) |
| Test harness | Vitest (60 unit/integration) + Playwright (28 E2E including axe a11y) + CI workflow | [vitest.config.ts](../../../vitest.config.ts), [playwright.config.ts](../../../playwright.config.ts) |
| Middleware | Session refresh on every non-static request | [middleware.ts](../../../middleware.ts) |

---

## Components to Reuse (no changes needed)

| Component | Path | How Homepage uses it |
|-----------|------|---------------------|
| `<Icon />` | [src/components/ui/Icon.tsx](../../../src/components/ui/Icon.tsx) | Render flag-vn, chevron-down, google, globe + NEW bell, pencil, arrow-right (add new cases) |
| `<KeyVisualBackground />` (Login's) | [src/components/login/KeyVisualBackground.tsx](../../../src/components/login/KeyVisualBackground.tsx) | **Not reused** — Homepage's hero uses different dimensions + different gradient + different image path. Homepage ships a fresh `<HeroKeyVisual />` at `src/components/homepage/HeroKeyVisual.tsx`. Consider promoting a shared `<FullBleedImage />` primitive later once a third caller exists (YAGNI now). |
| `<DismissibleAlert />` | [src/components/ui/DismissibleAlert.tsx](../../../src/components/ui/DismissibleAlert.tsx) | Available for any error banners |
| `<LanguageToggle />` | [src/components/layout/LanguageToggle.tsx](../../../src/components/layout/LanguageToggle.tsx) | Drop into header right-cluster as-is (state, aria, keyboard all handled) |
| `<LanguageDropdown />` | [src/components/login/LanguageDropdown.tsx](../../../src/components/login/LanguageDropdown.tsx) | **Consider hoisting** to `src/components/ui/LanguageDropdown.tsx` since it's now used on 2 screens (Login + Homepage) — still minor, could defer |
| Supabase clients | [src/libs/supabase/{server,client,middleware}.ts](../../../src/libs/supabase/) | `createClient()` on Homepage for session check; `signOut()` for profile menu logout |
| i18n infra | [src/libs/i18n/](../../../src/libs/i18n/) | `getMessages()` server-side; `setLocale` Server Action stays the same |
| Analytics | [src/libs/analytics/track.ts](../../../src/libs/analytics/track.ts) | Extend with `screen_view` + homepage-specific events (none urgent) |
| Env schema | [src/libs/env/server.ts](../../../src/libs/env/server.ts) | Extend with `NEXT_PUBLIC_EVENT_START_AT` (client-safe value) |

---

## Components to Extend

| Component | Current | Homepage change |
|-----------|---------|-----------------|
| `<SiteHeader />` | Server comp; renders `<SiteLogo />` + `<LanguageToggle />` at `px-36 py-3 bg-[#0B0F12]/80 absolute inset-x-0 top-0 z-40 h-20` | Add optional `navItems` prop (3 links) + optional right-cluster slot (bell, profile). Change position from `absolute` → **`sticky`** when `sticky` prop is set. Bump bg to `#101417/80` when on Homepage (new `--color-brand-700` token) |
| `<SiteFooter />` | Server comp; copyright only, justify-center | Accept optional `navItems` + optional `logoAlign` prop. When `navItems` provided, layout switches to `logo ↔ nav ↔ copyright` (Homepage uses this) |
| `<PrimaryButton />` | Cream filled CTA with `variant="default"` implied | Add `variant="outline"` for the "ABOUT KUDOS" outlined cream button (border + transparent bg + cream text) |
| `src/messages/{vi,en}.json` | Login keys only | Extend with ~30 `homepage.*` + `common.nav.*` + `common.notification.*` + `common.profile.*` + `common.widget.*` keys |
| `src/libs/env/server.ts` schema | 5 vars | Add `NEXT_PUBLIC_EVENT_START_AT` (ISO 8601 string, `.datetime()`), client-safe so also in [client.ts](../../../src/libs/env/client.ts) |
| `src/app/globals.css` `@theme` | Login tokens | Add `--color-brand-700: #101417` (Homepage header variant) + `--color-card: #0B1419` + `--font-digital-numbers` variable |
| `src/app/layout.tsx` | Loads Montserrat + Montserrat Alternates | Add `next/font/local` load for **Digital Numbers** (gate on license — if unavailable, drop the line and fallback will kick in) |
| Tailwind config (if present) | (implicit via `@theme inline`) | Already absorbed into globals.css — no separate config file edit needed |

---

## Brand-New Components (Homepage-only)

| Component | File path | Type | Purpose |
|-----------|-----------|------|---------|
| `<HomePage />` | `src/app/page.tsx` (REPLACE stub) | Server Comp | Page shell: session check → stub redirect → compose |
| `<NavLink />` | `src/components/layout/NavLink.tsx` | Client (needs `usePathname` for active-state) | Header + footer nav links with active-route detection |
| `<NotificationBell />` | `src/components/layout/NotificationBell.tsx` | Client | Bell icon + unread badge; click navigates to `/notifications` |
| `<ProfileMenu />` | `src/components/layout/ProfileMenu.tsx` | Client | Avatar button opening dropdown (Profile · Sign out · [Admin]) |
| `<Countdown />` | `src/components/homepage/Countdown.tsx` | Client | Ticks every 60s; SSR-safe initial paint; `aria-live` on minute change |
| `<CountdownTile />` | `src/components/homepage/CountdownTile.tsx` | Server Comp | Single tile wrapper (presentation); accepts `digit1, digit2, label` |
| `<HeroSection />` | `src/components/homepage/HeroSection.tsx` | Server Comp | Composes bg + title + subtitle + countdown + event info + CTAs |
| `<EventInfo />` | `src/components/homepage/EventInfo.tsx` | Server Comp | Time/location/livestream block |
| `<HeroCtas />` | `src/components/homepage/HeroCtas.tsx` | Server Comp | Wraps 2 PrimaryButtons (cream + outline) |
| `<RootFurtherCard />` | `src/components/homepage/RootFurtherCard.tsx` | Server Comp | Dark card with title + body paragraph + vertical "2025" decoration |
| `<SectionHeader />` | `src/components/homepage/SectionHeader.tsx` | Server Comp | Reusable caption + title + description block |
| `<AwardsSection />` | `src/components/homepage/AwardsSection.tsx` | Server Comp | Wraps `<SectionHeader />` + `<AwardGrid />` |
| `<AwardGrid />` | `src/components/homepage/AwardGrid.tsx` | Server Comp | Responsive 1/2/3-col grid of 6 `<AwardCard />` |
| `<AwardCard />` | `src/components/homepage/AwardCard.tsx` | Server Comp | Image + title + description + "Chi tiết →" link, navigates to `/awards#<slug>` |
| `<KudosPromoBlock />` | `src/components/homepage/KudosPromoBlock.tsx` | Server Comp | Two-column promo with illustration + CTA |
| `<QuickActionsFab />` | `src/components/homepage/QuickActionsFab.tsx` | Client | Floating pill opening quick-actions popover |
| `<ScrollToTopButton />` | *(inside NavLink, no separate component)* | Client | Smooth-scroll-to-top behavior on active-link click (FR-005) |

---

## Data + Routes

| New file | Purpose |
|----------|---------|
| `src/data/awards.ts` | Frozen list of 6 categories: `{ id, slug, titleKey, descKey, image }` (tittle/desc keys point into i18n catalog) |
| `src/app/awards/page.tsx` | Stub with "Awards content coming soon" + hash-aware display of requested category |
| `src/app/kudos/page.tsx` | Stub |
| `src/app/notifications/page.tsx` | Stub |
| `src/app/profile/page.tsx` | Stub |
| `src/app/standards/page.tsx` | Stub |
| `src/app/admin/page.tsx` | Stub (gated: only renders for admin role; non-admins see 403) |

---

## Integration Points

### APIs / Supabase queries used

| API / Query | Where | Status |
|-------------|-------|--------|
| `supabase.auth.getUser()` SSR | `<HomePage />` (session check) | Reuse from Login |
| `supabase.auth.signOut()` Server Action | `<ProfileMenu />` | **New** — `src/libs/auth/signOut.ts` Server Action |
| Notification unread count | `<NotificationBell />` | **Fake for MVP** — prop `initialUnreadCount={0}` passed from page. Real query deferred |
| User profile (avatar + displayName) | `<ProfileMenu />` | **Fake for MVP** — read from `user.user_metadata.avatar_url` + `full_name` (Google profile) |
| Event start datetime | `<Countdown />` | From `NEXT_PUBLIC_EVENT_START_AT` env — no API |

### Database entities

Read-only, no schema changes from this feature:

| Table | How Homepage uses it |
|-------|---------------------|
| `auth.users` | Current user's id, email, `user_metadata.{avatar_url, full_name}`, `app_metadata.role` |
| `public.notifications` *(future)* | Unread count query — mocked for MVP, wire in later spec |
| `public.user_profiles` *(future)* | Extended profile — mocked, use `user_metadata` fallback |

### External services

None new. Supabase (existing) + Cloudflare Workers (inherited deploy target).

---

## Potential Challenges

### Technical

| Challenge | Impact | Proposed solution |
|-----------|--------|-------------------|
| **Hero "ROOT FURTHER" asset origin unknown** (design-style §Asset Notes) | High — might block pixel-perfect hero | Pattern A: export hero BG PNG and see if title is baked in; Pattern B: if not, overlay Group 434 as separate image layer |
| **Digital Numbers font license** | Medium — degrades countdown aesthetic | Fallback chain in CSS; implement with fallback first, swap in the font when licensed |
| **`get_media_files` likely won't return hero BG** | High — same bug as Login | User exports manually from Figma; document in Phase 0 |
| **SSR countdown hydration mismatch** | Medium — tile shows `Server: 02, Client: 01` if minute ticks during hydration | Server computes value + client's `useEffect` recomputes on mount with `Date.now()`; React's default hydration strategy handles the transient mismatch via `suppressHydrationWarning` on the Tile wrapper |
| **Scroll-to-top for active link** | Low | `useRouter()` is pathname-aware; if `pathname === "/"` on click, `e.preventDefault()` + `window.scrollTo({top:0, behavior:'smooth'})` |
| **Sticky header z-index conflict with FAB** | Low | Header z-40, FAB z-50, hero vignette z-10, hero content z-20 — already planned |
| **Tab backgrounded, minute ticks drift** | Low (spec Edge Case) | `visibilitychange` listener recomputes on foreground |

### Integration

| Challenge | Impact | Solution |
|-----------|--------|----------|
| **6 award thumbnails missing until Figma export** | Medium | Placeholder: solid-color card with category title overlay; replace once images land |
| **Sun\* Kudos promo illustration (big "KUDOS" text)** | Medium | Treat as single PNG asset (decorative text baked in) — no live SVN-Gotham rendering needed |
| **Profile dropdown spec (`721:5223`) is separate** | Medium | Ship a minimal functional dropdown (Profile/Sign out/[Admin]) in this feature; restyle when the Dropdown-profile spec lands |
| **`/awards#<slug>` navigation depends on `/awards` page existence** | Low | Stub `/awards` with hash-aware anchor rendering ("You requested: Top Talent") — looks deliberate, not broken |

---

## Files to Read Before Implementation

### Must read

- [x] [spec.md](spec.md) — FRs, TRs, acceptance scenarios, i18n keys
- [x] [design-style.md](design-style.md) — tokens, component specs, responsive, implementation mapping
- [x] [.momorph/constitution.md](../../constitution.md) — non-negotiables
- [x] Login screen code (pattern reference) — [src/app/(public)/login/page.tsx](../../../src/app/(public)/login/page.tsx), [src/components/login/*](../../../src/components/login/), [src/components/layout/*](../../../src/components/layout/)

### Recommended

- [ ] Supabase SSR Next.js guide — `mcp__context7__query-docs` with topic "supabase ssr nextjs getUser server action signOut" if unsure about logout pattern
- [ ] Next.js App Router hash-navigation / scroll-anchor docs — for award card `#<slug>` behavior

---

## Recommendations

### Architecture

1. **Split SiteHeader composition, not duplicate**: introduce a `SiteHeader`
   with an optional `navItems?: NavItem[]` prop AND a `right?: ReactNode`
   slot. Both Login and Homepage use the same component, just with different
   props.
2. **Homepage components live in `src/components/homepage/`** — feature
   folder, not `ui/`, because they're Homepage-specific compositions.
   Candidates for promotion to `ui/` later: `<SectionHeader />` (generic),
   `<CountdownTile />` (could be general-purpose) — defer until a second
   consumer appears (constitution Principle I: no premature abstraction).
3. **Server Components by default, 5 client islands**:
   `<Countdown />`, `<NotificationBell />`, `<ProfileMenu />`,
   `<QuickActionsFab />`, `<NavLink />`. Everything else static-rendered.
4. **Data-driven award cards**: `src/data/awards.ts` as const array; card
   copy via i18n keys. Adding a 7th award = 1 entry in the array.
5. **Sign out as Server Action**, not a client fetch: reliability + CSRF
   protection via framework.

### Implementation

- **Start with Phase 0 (assets)** before code — knowing which assets are
  missing shapes the fallback strategy.
- **Build the static scroll first** (Phase 2 below) — hero + awards + kudos
  + footer with placeholder countdown "00/00/00" and hardcoded event copy.
  This gives a visual checkpoint for designers before we wire dynamics.
- **Countdown comes next** (Phase 3) — once static scroll looks right, dynamic
  ticking is isolated.
- **Avoid**: re-inventing Login's patterns, inlining SVGs (use `<Icon />`),
  client components that just render static markup.

### Testing

- **Focus on**: session-gated redirect, countdown math (edge cases around
  midnight/minute rollover), award card click → `/awards#<slug>` URL,
  sticky-header behavior, bell badge cap at 99+.
- **Mock**: `Date.now()` in countdown tests (use `vi.useFakeTimers()`),
  Supabase `getUser` + `signOut`, `usePathname` for NavLink active-state.
- **E2E scenarios** (extend existing Playwright):
  - Authenticated user lands on `/`, sees all sections
  - Award card click → correct hash + correct target rendered on stub
  - Hero CTA "ABOUT AWARDS" / "ABOUT KUDOS" → correct routes
  - Language toggle flips Homepage copy (regression on Login's US3
    component, scaled to Homepage)
  - Sign out → redirect to `/login`
  - a11y sweep: 0 serious/critical axe violations

---

## Open Questions

Carry-over from spec.md (Q1–Q14) — not repeating here. Plan treats them as
assumptions documented per task.

Plan-specific:

- **Q-P1**: Digital Numbers font licence — if no budget/license access, we
  ship with `Courier New, monospace` fallback and mark `--font-digital-numbers`
  for future swap. Is that OK?
- **Q-P2**: Awards data — 6 entries frozen in `src/data/awards.ts`. If the
  list changes, it's a code edit + merge. Acceptable for MVP? (Moving to a
  CMS is a sizeable scope creep.)
- **Q-P3**: Sign-out UX — after `signOut()`, redirect to `/login?signed_out=
  true` with a confirmation toast, or silent redirect to `/login`?
  Current plan: silent (no toast unless Product asks).

---

## Notes

- Homepage is **visually dense** (4480 px × 1512 px, 6 cards + hero + promo
  + 2 gradients) but **logic-light** (only countdown + bell badge + profile
  menu + FAB have non-trivial state). The LOC should be reasonable.
- Expect asset work (export + compress hero BG + 6 awards + Kudos illus) to
  be the biggest time-sink in Phase 0. Budget 30–60 min for that alone.
- Supabase + env stay unchanged — no `yarn add` during Phase 0.
