# Implementation Plan: Homepage SAA 2025

**Frame**: `i87tDx10uM-homepage-saa`
**Date**: 2026-04-17
**Spec**: [spec.md](spec.md)
**Design**: [design-style.md](design-style.md)
**Research**: [research.md](research.md)

---

## Summary

Ship the SAA 2025 Homepage at route `/` — the post-login landing that introduces
the "Root Further" theme via a 4480-px-tall scrolling page with a hero +
countdown, Root Further body card, 6 award category cards, Sun\* Kudos promo
block, and sticky nav. Reuses every piece of infrastructure laid down by the
[Login spec](../GzbNeVGJHz-login/plan.md) — Supabase Auth, i18n catalogs,
`<SiteHeader />` / `<SiteFooter />`, `<PrimaryButton />`, `<Icon />`,
`<LanguageToggle />`, middleware, analytics, test harness — and introduces 14
Homepage-specific components + 1 client countdown.

---

## Technical Context

| | |
|---|---|
| **Language/Framework** | TypeScript 5 (strict) · Next.js 16.2.4 App Router · React 19 |
| **Primary Dependencies** | Existing: `@supabase/ssr`, `@opennextjs/cloudflare`, `zod`, Tailwind v4, `next/font`. **No new runtime deps needed.** |
| **State Management** | React hooks only — no global store. Session check via `createServerClient().auth.getUser()` in the Server Component |
| **API Style** | Server Components + 1 Server Action (`signOut`) |
| **Hosting runtime** | Cloudflare Workers via OpenNext (inherited) |
| **Package manager** | Yarn v1 classic (inherited) |
| **Fonts** | Montserrat + Montserrat Alternates (existing) + **Digital Numbers** (new, `next/font/local`) for countdown digits |

---

## Constitution Compliance Check

*GATE: Must pass before implementation can begin*

| Principle / Rule | Requirement | Compliance |
|------------------|-------------|------------|
| I. Clean Code & Organization | `src/app/`, `src/components/{ui,layout,homepage}/`, `src/libs/`, `@/*` alias | ✅ — new `components/homepage/` folder added to existing layout |
| I. TypeScript strict | `strict: true` | ✅ (inherited) |
| I. No premature abstraction | Duplicate until 3+ uses | ✅ — `<SectionHeader />` kept in `homepage/`, not `ui/` (1 use) |
| II. Responsive Design | Mobile-first; `sm/md/lg/xl`; ≥ 44×44 px touch targets; WCAG AA | 📋 Planned per `design-style.md` → Responsive Specifications |
| II. Web-only scope | No native mobile | ✅ (inherited via SCREENFLOW web-only scope) |
| III. Test-First Development | TDD Red-Green-Refactor | 📋 Tests alongside per-task; Vitest + Playwright gates |
| IV. Security (OWASP) | Session re-verify server-side, no secrets in client, sign-out via Server Action, CSP (inherited) | 📋 Planned — FR-001, FR-008, TR-005 |
| V. Platform — Next.js Server Components default, `next/image`, `next/link` | 5 client islands only (Countdown, NotificationBell, ProfileMenu, QuickActionsFab, NavLink) | ✅ Baked into architecture |
| V. Platform — Supabase via `@/libs/supabase/*` | `createClient()` (server) + `createClient()` (browser) | ✅ (inherited) |
| V. Platform — Cloudflare Workers (no Node built-ins) | Workers-compatible imports only | ✅ (inherited) |
| V. Platform — Tailwind utility-only | No custom CSS beyond `globals.css` | ✅ (inherited) |
| Dev Workflow — Yarn v1 classic | Package scripts already in place | ✅ (inherited) |

**Violations requiring justification**: None. All constitution principles
satisfy by re-using patterns established in the Login ship.

---

## Architecture Decisions

### Frontend

- **Component structure**: feature-scoped at `src/components/homepage/`; shared
  primitives live in `src/components/{ui,layout}/` and are extended rather
  than duplicated.
  - `<HomePage />` (Server, `src/app/page.tsx`) — top-level page, session
    check, i18n bootstrap, then composes the visual sections.
  - `<SiteHeader />` and `<SiteFooter />` (existing, extended) accept
    `navItems` and a `right` slot so Login keeps its minimal chrome and
    Homepage gets the full nav.
  - `<HeroSection />`, `<RootFurtherCard />`, `<AwardsSection />`,
    `<KudosPromoBlock />`, `<QuickActionsFab />` — feature components,
    server-side except the FAB.
  - `<Countdown />` is the single stateful dynamic UI — ticks every 60 s,
    rolls over correctly, respects `visibilitychange`.

- **Styling strategy**: Tailwind utilities against tokens from
  `globals.css` `@theme`. No `@apply`, no custom CSS files. Design tokens
  from [design-style.md §Design Tokens](design-style.md) are extended in
  `globals.css` (new: `--color-brand-700`, `--color-card`,
  `--font-digital-numbers`).

- **Data fetching**: Server Components read Supabase session via
  `createServerClient().auth.getUser()`. No client data hooks. Award
  category content comes from a frozen `src/data/awards.ts` array; i18n
  keys resolve title/description.

- **Routing / i18n**: Next.js App Router route `/` is dynamic (session-gated,
  `Cache-Control: no-store`). Locale resolved server-side via
  `getMessages()` (already in place). Messages extended in
  `src/messages/{vi,en}.json` with `homepage.*` + `common.nav.*` + `common.
  notification.*` + `common.profile.*` + `common.widget.*` keys.

### Backend

- **API design**: One new **Server Action** — `signOut()` in
  `src/libs/auth/signOut.ts`. Wraps `supabase.auth.signOut()` + redirects
  to `/login`.
- **Data access**: via Supabase client only (no raw SQL). No DB tables
  touched in this feature; `auth.users` metadata is read as a side effect
  of `getUser()`.
- **Validation**: `NEXT_PUBLIC_EVENT_START_AT` validated via Zod's
  `.datetime()` in `src/libs/env/client.ts` (client-safe because
  `NEXT_PUBLIC_*` prefix).

### Integration points

- **Existing services leveraged**: Supabase Auth, middleware session
  refresh, `<LanguageToggle />` + `<LanguageDropdown />`, analytics
  emitter, Icon system, PrimaryButton, SiteHeader/Footer, test harness.
- **New shared components**: `<NavLink />` (used in both header + footer
  nav), `<SectionHeader />` (could be reused on Awards page).
- **API contracts**: no external API contracts — everything in-process
  Supabase + `next/headers` cookies.

---

## Project Structure

### Documentation

```text
.momorph/specs/i87tDx10uM-homepage-saa/
├── spec.md            # feature spec (reviewed in 2 passes)
├── design-style.md    # visual spec (reviewed in 2 passes)
├── research.md        # reuse catalog + challenges
├── plan.md            # this file
├── tasks.md           # generated by /momorph.tasks next
└── assets/
    └── frame.png      # Figma reference screenshot
```

### Source — new files

```text
src/
├── app/
│   ├── page.tsx                                 # ★ REPLACE stub with <HomePage /> Server Comp
│   ├── awards/page.tsx                          # ★ stub route (hash-aware display)
│   ├── kudos/page.tsx                           # ★ stub
│   ├── kudos/new/page.tsx                       # ★ stub (FAB target)
│   ├── notifications/page.tsx                   # ★ stub
│   ├── profile/page.tsx                         # ★ stub
│   ├── standards/page.tsx                       # ★ stub
│   └── admin/page.tsx                           # ★ stub (role-gated; non-admin → /error/403)
├── components/
│   ├── layout/
│   │   ├── NavLink.tsx                          # ★ new, "use client" — pathname-aware active state
│   │   ├── NotificationBell.tsx                 # ★ new, "use client"
│   │   └── ProfileMenu.tsx                      # ★ new, "use client"
│   └── homepage/
│       ├── HeroSection.tsx                      # ★ new, server — composes hero
│       ├── HeroKeyVisual.tsx                    # ★ new, server — full-bleed BG + gradients
│       ├── Countdown.tsx                        # ★ new, "use client" — ticks every 60s
│       ├── CountdownTile.tsx                    # ★ new, server — 1 tile
│       ├── EventInfo.tsx                        # ★ new, server
│       ├── HeroCtas.tsx                         # ★ new, server — 2 PrimaryButtons
│       ├── RootFurtherCard.tsx                  # ★ new, server
│       ├── SectionHeader.tsx                    # ★ new, server — reusable (caption+title+desc)
│       ├── AwardsSection.tsx                    # ★ new, server
│       ├── AwardGrid.tsx                        # ★ new, server — responsive grid
│       ├── AwardCard.tsx                        # ★ new, server
│       ├── KudosPromoBlock.tsx                  # ★ new, server
│       ├── QuickActionsFab.tsx                  # ★ new, "use client" — floating FAB
│       └── __tests__/
│           ├── Countdown.spec.tsx
│           ├── AwardCard.spec.tsx
│           ├── ProfileMenu.spec.tsx
│           └── QuickActionsFab.spec.tsx
├── data/
│   ├── awards.ts                                # ★ new — 6 categories with slug + i18n keys + image paths
│   └── navItems.ts                              # ★ new — header + footer nav items (hrefs + i18n labelKeys)
├── libs/
│   └── auth/
│       ├── signOut.ts                           # ★ new — Server Action
│       └── __tests__/signOut.spec.ts
└── tests/e2e/
    ├── homepage.happy.spec.ts                   # ★ new E2E
    ├── homepage.countdown.spec.ts               # ★ new E2E
    ├── homepage.nav.spec.ts                     # ★ new E2E
    └── homepage.a11y.spec.ts                    # ★ new E2E — axe
```

### Source — modified files

| File | Change |
|------|--------|
| [src/components/layout/SiteHeader.tsx](../../../src/components/layout/SiteHeader.tsx) | Accept optional `navItems?: NavItem[]` + `right?: ReactNode` + `sticky?: boolean` + `bgVariant?: "brand-800" \| "brand-700"`; keep existing Login usage working |
| [src/components/layout/SiteFooter.tsx](../../../src/components/layout/SiteFooter.tsx) | Accept optional `navItems?: NavItem[]` + `showLogo?: boolean`; if provided, render logo + nav + copyright layout; if not, keep current centered copyright |
| [src/components/ui/PrimaryButton.tsx](../../../src/components/ui/PrimaryButton.tsx) | Add `variant="outline"` prop (default stays `"solid"`) |
| [src/components/ui/Icon.tsx](../../../src/components/ui/Icon.tsx) | Add cases: `bell`, `pencil`, `arrow-right` |
| [src/messages/vi.json](../../../src/messages/vi.json) | Add ~30 `homepage.*` + `common.nav.*` keys per [spec § i18n](spec.md) |
| [src/messages/en.json](../../../src/messages/en.json) | Mirror VI additions |
| [src/libs/env/client.ts](../../../src/libs/env/client.ts) | Add `NEXT_PUBLIC_EVENT_START_AT: z.string().datetime().optional()` |
| [src/libs/analytics/track.ts](../../../src/libs/analytics/track.ts) | Extend `AnalyticsEvent` union with `{ type: "screen_view"; screen: "homepage" }` (already covered by generic `screen_view` — just call site-wide) |
| [src/app/layout.tsx](../../../src/app/layout.tsx) | Load **Digital Numbers** font via `next/font/local` + add `font-digital-numbers` CSS variable |
| [src/app/globals.css](../../../src/app/globals.css) | Add `@theme` tokens: `--color-brand-700: #101417;`, `--color-card: #0B1419;`, `--font-digital-numbers: ...;` |
| [.env.example](../../../.env.example) | Add `NEXT_PUBLIC_EVENT_START_AT=2025-12-26T11:30:00Z` |
| [.env.local](../../../.env.local) | Add same (real value) |

### Dependencies

**No new dependencies required** — everything is already in place. Optional:

| Package | Version | Type | Purpose |
|---------|---------|------|---------|
| `@next/third-parties` | ^16 | runtime | *(optional, future)* Analytics vendor integration — not needed for MVP |

Assets to add (not packages):

| Asset | Destination | Source |
|-------|-------------|--------|
| Homepage hero BG | `public/images/homepage-hero.jpg` | User export from Figma `2167:9028` |
| Root Further title variant (if separate) | `public/images/root-further-title-small.png` | User export from Group 434 |
| "2025" vertical decor | `public/images/2025-decoration.svg` | User export |
| 6× award thumbnails | `public/images/awards/{slug}.png` | `get_media_files` or user export |
| Sun\* Kudos promo | `public/images/sunkudos-promo.png` | `get_media_files` |
| Digital Numbers font | `public/fonts/digital-numbers.woff2` | License required (Q-P1) |

---

## Implementation Approach

Vertical slice by priority: static shell → dynamic bits → polish. Each phase is
green-test-able on its own.

### Phase 0 — Asset Preparation + env

**Purpose**: Gather media + confirm env values before code. Also decides
whether Digital Numbers font is licenseable or we fall back.

1. **Inventory via MCP**: run `mcp__momorph__get_media_files` on
   `i87tDx10uM`; extract any URLs that resolve (expect hero BG to be missing,
   same as Login).
2. **Export missing assets from Figma manually**: hero BG, "2025"
   decoration, 6 award thumbnails, Sun\* Kudos promo illustration. User
   drops PNG/JPG files into `public/images/`.
3. **Digital Numbers font decision** (Q-P1): licensed / self-hosted /
   fallback? If fallback, skip font install.
4. Add `NEXT_PUBLIC_EVENT_START_AT=2025-12-26T11:30:00Z` (placeholder —
   confirm exact time with Product) to `.env.example` + `.env.local`.
5. Update `src/libs/env/client.ts` schema.

**Exit criteria**

- [ ] `public/images/homepage-hero.jpg` exists (or a placeholder logged as
      TODO)
- [ ] `public/images/awards/` has 6 PNGs (or 6 coloured placeholders)
- [ ] `public/images/sunkudos-promo.png` exists
- [ ] `NEXT_PUBLIC_EVENT_START_AT` available in dev + schema-validated
- [ ] Digital Numbers font decision made + documented

---

### Phase 1 — Foundation extensions

**Purpose**: Extend the shared shell and data layer so every Homepage task
after can import what it needs.

1. **Extend `<Icon />`** with **4 new icons** (bell, pencil, arrow-right,
   saa) + add test cases. The `saa` icon is the small Sun\* asterisk mark
   used as the FAB's right-hand separator (reuses the same vector as
   `<SiteLogo />` but at icon-size).
2. **Extend `<PrimaryButton />`** with `variant="outline"`; update existing
   tests; add 2 new tests for outline variant states.
3. **Extend `<SiteHeader />`** signature:
   ```ts
   type NavItem = { href: string; label: string; };
   type SiteHeaderProps = {
     navItems?: NavItem[];
     right?: ReactNode;
     sticky?: boolean;           // Homepage → true; Login → false
     bgVariant?: "brand-800" | "brand-700";  // Homepage → brand-700
   };
   ```
   Login call site stays unchanged (defaults preserved). Homepage passes
   `navItems`, `right`, `sticky`, `bgVariant`.
4. **Extend `<SiteFooter />`** signature:
   ```ts
   type SiteFooterProps = {
     navItems?: NavItem[];
     showLogo?: boolean;
   };
   ```
   Render strategies:
   - `navItems` absent → current centered-copyright layout (Login)
   - `navItems` present → logo + nav row + copyright (Homepage)
5. **Create `<NavLink />`** (client, `usePathname`): active-state detection,
   `aria-current="page"` when selected, smooth-scroll-to-top if already on
   target route (FR-005).
6. **Create `src/data/awards.ts`**: 6 entries `{ id, slug, titleKey,
   descKey, image }`.
7. **Extend i18n** catalogs (vi.json + en.json) with the ~30 new keys from
   spec § i18n Message Keys.
8. **Load Digital Numbers font** in `src/app/layout.tsx` (if licensed) and
   add the CSS variable. If fallback-only, skip the import — the CSS
   declaration uses the fallback chain.
9. **Update `globals.css`** `@theme` with new tokens (`--color-brand-700`,
   `--color-card`, `--font-digital-numbers`).

**Exit criteria**

- [ ] `yarn typecheck` clean
- [ ] `yarn test --run` green with **new test coverage** for every extended
      component:
  - `<Icon />` — 4 new test cases (bell, pencil, arrow-right, saa render)
  - `<PrimaryButton />` — 2 new cases for `variant="outline"` (default + hover)
  - `<SiteHeader />` — 3 new cases: `navItems` renders, `right` slot renders,
    `sticky` applies `position: sticky` class, `bgVariant="brand-700"` swaps bg
  - `<SiteFooter />` — 2 new cases: `navItems` present → 3-column layout,
    `navItems` absent → centered-copyright (Login compat)
  - `<NavLink />` — 4 cases: active-state via `aria-current`, scroll-to-top
    on same-route click, navigate on different-route click, Enter/Space
    keyboard activation
- [ ] Login `/login` still renders identically (manual visual diff + a11y axe
      spec against Login still 0 violations)
- [ ] New tokens resolve in Tailwind utilities (`bg-brand-700`, `bg-card`,
      `font-digital-numbers` all compile)

---

### Phase 2 — US1 Landing + US2 Countdown + US3 Award nav (P1) 🎯

**Purpose**: The page renders all sections with correct static content,
real countdown, and award-card clicks route to `/awards#<slug>`. Closes US1,
US2, and US3 (Award category navigation — the card markup and links are part
of the MVP static scroll).

#### Static page shell (US1)

1. Build `<HomePage />` Server Component in `src/app/page.tsx`:
   - **Skip-to-main-content link** as the very first focusable child
     (`<a href="#main" className="sr-only focus:not-sr-only …">Skip to main
     content</a>`) — TR-009 compliance. Place BEFORE `<SiteHeader />` in
     DOM order.
   - Call `createServerClient().auth.getUser()`.
   - If no user → `redirect("/login")` (FR-001).
   - If user → extract role from `app_metadata.role` and compose children.
   - Wrap try/catch around `getUser()` for FR-016 graceful failure.
   - `<main id="main">` wraps Hero / Root Further / Awards / Kudos promo
     for the skip link target.
   - Homepage ignores any `?next=` query param (spec Edge Case — only
     `/auth/callback` honours `next`).
2. Build the section components (server, static content):
   - `<HeroKeyVisual />` — full-bleed `<Image src="/images/homepage-hero.jpg"
     priority />` + gradient overlays.
   - `<HeroSection />` — wraps KeyVisual + Frame 487 content.
   - `<EventInfo />` — renders `Thời gian:` / `26/12/2025` + `Địa điểm:` /
     `Âu Cơ Art Center` + livestream note; pulls from i18n.
   - `<HeroCtas />` — 2 `<PrimaryButton />` side-by-side (solid cream for
     ABOUT AWARDS, outline for ABOUT KUDOS) wrapped in `<Link />`.
   - `<RootFurtherCard />` — dark card, title image (or text fallback), body
     paragraph from i18n, "2025" decoration overlay right.
   - `<SectionHeader />` — caption + 57px title + description (Montserrat 24/
     32/700 caption, 57/64/700/-0.25 title, 16/24/400 desc).
   - `<AwardsSection />` + `<AwardGrid />` + `<AwardCard />` — maps
     `src/data/awards.ts` to 6 `<AwardCard />`. Each card: next/image
     thumbnail, title (weight 400 per design-style §9), description
     (2-line clamp), `<Link href={'/awards#' + slug}>Chi tiết →</Link>`.
   - `<KudosPromoBlock />` — 2-column grid with left text + right
     illustration + `<Link href="/kudos">Chi tiết →</Link>` CTA styled as
     solid cream button.
   - Use extended `<SiteHeader />` + `<SiteFooter />` with Homepage props.
3. Add static nav items constant in `src/data/navItems.ts` (header + footer
   variants) — 3 header links, 4 footer links.

#### Countdown (US2)

4. **TDD-first**: write `Countdown.spec.tsx` covering:
   - Initial render with SSR-provided `remainingMs`.
   - Ticks to next minute after 60 s (fake timers).
   - Holds at `00/00/00` when `remainingMs ≤ 0`, hides subtitle.
   - Shows fallback when `eventStartAt` is undefined.
   - Recomputes on `visibilitychange → visible`.
   - Rollover: 59 min → next hour → next day.
5. Implement `<Countdown />` (client) + `<CountdownTile />` (server):
   - SSR receives `eventStartAt` as ISO string, computes initial
     `remainingMs`, renders server-side.
   - Client hydrates, sets up interval, listens for `visibilitychange`.
   - `aria-live="polite"` on the tiles container so SR catches minute
     changes (TR-006).
6. Wire into `<HeroSection />`: `<Countdown eventStartAt={env.NEXT_PUBLIC_
   EVENT_START_AT} />`.

#### Placeholder routes (so clicks don't 404)

7. Stub `/awards`, `/kudos`, `/kudos/new`, `/notifications`, `/profile`,
   `/standards`, `/admin` as minimal Server Components rendering `{title}:
   coming soon` with a link back to `/`. Notes:
   - `/kudos/new` needed because the FAB points to it in Phase 6.
   - `/admin` is **server-gated**: redirect to `/error/403` unless
     `app_metadata.role === "admin"`.
8. `/awards` stub behavior — **URL hashes are never sent to servers** (they
   live browser-side only), so a pure Server Component can't read
   `#<slug>`. Two options:
   - **(a) MVP**: stub is a plain Server Component saying "Awards coming
     soon" — the hash appears in the URL but isn't reflected in the body.
     Simplest; picked.
   - **(b) Future**: once the real Awards page exists with 6 anchor
     sections (`<section id="top-talent">` etc.), the browser scroll-anchor
     behavior handles the hash natively — no JS needed.
   The MVP stub ships option (a); upgrade to (b) with the dedicated
   `Hệ thống giải` spec.

**Exit criteria**

- [ ] `/` renders the full Homepage at 1440 + 375 viewports
- [ ] Countdown ticks every minute
- [ ] Award card clicks navigate to `/awards#<slug>`
- [ ] Hero CTAs navigate to `/awards` / `/kudos` (placeholders exist)
- [ ] `yarn build` succeeds
- [ ] Visual smoke test via Playwright screenshot matches Figma reference
      within acceptable threshold

---

### Phase 3 — US4 Header nav + logo scroll + sticky header (P1)

**Purpose**: Finish US4 (header nav + logo click). The hero CTAs (US4 AC1
and AC2) already shipped in Phase 2 — this phase wires up the 3 header
nav links (US4 AC3, AC4, AC5). US4 is **considered done at the end of
Phase 3**.

1. `<NavLink />` full implementation: pathname-aware, click handler that
   intercepts same-route clicks and calls `window.scrollTo({top:0,
   behavior:'smooth'})` (FR-005). Tests.
2. Update `<SiteLogo />` (or wrap in client `<LogoLink />`) so that on `/`
   it scrolls to top; on other routes it navigates to `/` (FR-014).
3. Sticky header: already wired via `sticky` prop in Phase 1. Verify
   z-index: header `z-40`, FAB `z-50`, content `z-20`, vignettes `z-10`.
4. Keyboard handling: Enter/Space = click behaviour (FR + accessibility).
5. Playwright E2E: active link has `aria-current="page"`; click "About SAA
   2025" when on `/` → scrolls to top; click other link → navigates.

---

### Phase 4 — US5 Language toggle on Homepage (P2)

**Purpose**: Confirm `<LanguageToggle />` from Login drops in and locale
switch works across the new pages.

1. Mount `<LanguageToggle />` inside the `<SiteHeader right>` slot.
2. Playwright E2E: click VN → open dropdown → select EN → all homepage copy
   flips; reload keeps EN; sign in with session already present maintains
   EN. Verify the updated US5 acceptance copy.

No new code unless a bug surfaces in the reused component.

---

### Phase 5 — US6 Notification bell (P2)

**Purpose**: Render the bell with a capped unread badge; mock the count for
MVP.

1. `<NotificationBell />` client component:
   - Props: `initialUnreadCount: number`.
   - Renders `<Icon name="bell">` + (if count > 0) a red badge; label
     "99+" when count ≥ 100.
   - Wrap in `<Link href="/notifications">`.
   - `aria-label` from `common.notification.unread` with `{count}`
     interpolation.
2. Page passes `initialUnreadCount={0}` (MVP default).
3. Unit test: badge shown for 5, "99+" for 150, hidden for 0.
4. Defer real Supabase query to a future spec.

---

### Phase 6 — US7 FAB quick actions (P3)

**Purpose**: Render the floating pill; clicking opens a 1-item placeholder
menu.

1. `<QuickActionsFab />` client component:
   - `fixed bottom-6 right-6 z-50 h-16 px-4 rounded-full bg-accent-cream`
   - Content: `<Icon name="pencil">` + `/` + `<Icon name="saa">` (reuse
     site-logo mark) per design.
   - Click opens a popover (controlled `isOpen` state) anchored below the
     button, containing one `<Link href="/kudos/new">Viết Kudo →</Link>`.
   - Esc closes; click outside closes.
2. Unit test: renders, opens, closes on Esc + outside click.
3. Playwright: click FAB → menu appears → click Viết Kudo → lands on
   `/kudos/new` (stub).

---

### Phase 7 — FR-008 Profile dropdown + sign out (P2)

**Purpose**: Wire profile menu with conditional admin item + server-side
logout. (Not its own user story — implements FR-008 from spec; supporting
cast for all US1–US7 logged-in sessions.)

1. Create Server Action `src/libs/auth/signOut.ts`:
   ```ts
   "use server";
   import { createClient } from "@/libs/supabase/server";
   import { redirect } from "next/navigation";
   export async function signOut() {
     const supabase = await createClient();
     await supabase.auth.signOut();
     redirect("/login");
   }
   ```
2. `<ProfileMenu />` client component:
   - Props: `user: { email, avatarUrl, displayName }`, `isAdmin: boolean`.
   - Trigger button with avatar + `aria-haspopup="menu"` + `aria-expanded`.
   - Dropdown: Profile (link) / Sign out (`<form action={signOut}>
     <button type="submit">`) / Admin Dashboard (if `isAdmin`).
3. Homepage reads `user` + computes `isAdmin` server-side and passes to
   menu.
4. Unit tests (signOut mock; isAdmin branching).
5. Playwright E2E: click profile → menu → Sign out → lands on `/login`.

---

### Phase 8 — Polish & Cross-Cutting

1. **Accessibility sweep** (inherits Login's axe pattern):
   - Add `tests/e2e/homepage.a11y.spec.ts` running axe at mobile + desktop.
   - Manual keyboard walk: Tab order per TR-009 (logo → 3 nav links → bell
     → language → profile → hero CTA 1 → hero CTA 2 → 6 award cards →
     Kudos promo CTA → 4 footer links → FAB).
   - Skip-to-main-content link — **already shipped in Phase 2**; verify
     it's the first focusable element and that the target `<main id="main">`
     exists. Playwright asserts Tab-from-cold-load focuses the skip link
     first.
2. **Performance**:
   - Measure LCP on preview deploy (Cloudflare Workers).
   - Only hero BG + Root Further title marked `priority` in `next/image`.
   - Lazy load 6 award thumbnails + Sun\* Kudos illus.
   - If LCP > 2.5 s, add blur placeholders to the hero via `plaiceholder`
     (already installed for Login polish task).
3. **Bundle size**:
   - Extend `scripts/check-bundle-size.mjs` with an additional route check
     for `/` (target: ≤ 40 KB gzipped per TR-003).
4. **Analytics**:
   - Emit `{ type: "screen_view", screen: "homepage" }` once on mount
     (server-side) — already supported by existing track().
5. **Docs**:
   - Append a section to `docs/auth.md` noting the admin-role check and
     `signOut` Server Action.
6. **SCREENFLOW**:
   - Mark Homepage as `implemented`, increment counter.

---

## Integration Testing Strategy

### Test scope

- [x] **Component / module interactions**: HomePage ↔ Supabase getUser;
      Countdown ↔ Date.now; NavLink ↔ usePathname; ProfileMenu ↔ signOut
      Server Action.
- [x] **External dependencies**: Supabase mocked at the SDK boundary (same
      pattern as Login tests).
- [x] **Data layer**: none mutated; frozen `awards.ts` and env values only.
- [x] **User workflows**: load `/` → see all sections, click award card →
      navigate, switch language, click bell, open FAB, sign out.

### Categories

| Category | Applicable? | Scenarios |
|----------|-------------|-----------|
| UI ↔ Logic | Yes | Countdown tick, bell badge, FAB open/close, profile menu, NavLink active-state |
| Service ↔ Service | Yes | HomePage → Supabase `getUser` + middleware `updateSession` flow |
| App ↔ External API | Yes (mocked) | `signOut` Server Action path |
| App ↔ Data Layer | No | — |
| Cross-platform | Yes | axe a11y at both viewports |

### Environment

- **Local**: Vitest (unit + integration) + Playwright (E2E against `yarn
  dev`).
- **CI**: same stack; Supabase mocked; no real OAuth.

### Mocking

| Dependency | Strategy |
|------------|----------|
| Supabase client | `vi.mock("@/libs/supabase/server")` — same as Login tests |
| `Date.now()` in Countdown | `vi.useFakeTimers()` + `vi.setSystemTime()` |
| `usePathname` in NavLink | `vi.mock("next/navigation")` returning a controlled string |
| `next/image` in component tests | `vi.mock("next/image")` returning plain `<img>` |

### Scenarios outline

1. **Happy path**
   - [ ] Authenticated user lands, all 6 award cards visible
   - [ ] Countdown mounted with real env value, ticks after 60 s
   - [ ] Language toggle flips entire page
2. **Error handling**
   - [ ] `getUser` throws → error shell renders (FR-016)
   - [ ] `NEXT_PUBLIC_EVENT_START_AT` missing → fallback copy in countdown
   - [ ] Event in the past → tiles hold at `00`, subtitle hidden
3. **Edge cases**
   - [ ] Unread count 0, 5, 150 → badge rendering 3 variants
   - [ ] Admin user sees Admin Dashboard menu item, non-admin doesn't
   - [ ] Tab backgrounded 10 min → on return, minute recomputes
   - [ ] `motion-safe:` gates animations for reduced-motion users

### Coverage goals

| Area | Target |
|------|--------|
| `<Countdown />` logic | 100% branches |
| `signOut` action | 100% |
| `<NavLink />` active-state | 100% |
| `<ProfileMenu />` branching (admin / not / menu open/close) | ≥ 90% |
| Static section comps (HeroSection, AwardCard, KudosPromoBlock) | ≥ 70% smoke |
| E2E critical paths | 100% of P1 acceptance scenarios |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Hero BG PNG missing (asset `<path-to-image>`) | High | High | Export manually; placeholder first; validated in Phase 0 exit |
| Digital Numbers font unlicensable | Med | Low | Fallback chain documented; swap later once licensed |
| Sticky header z-index clash with FAB popover | Low | Med | Enforce layer: vignette 10, content 20, header 40, FAB 50; Playwright asserts popover visible over page |
| Countdown hydration mismatch | Med | Low | SSR computes + client reconciles on mount; `suppressHydrationWarning` on tile if needed |
| Award card images (6 files) missing for MVP | Med | Med | Coloured-block placeholders with category initial; ship, swap when assets land |
| Event date + time-of-day still uncertain (Q3) | Med | Med | Defaulted to 2025-12-26T11:30:00Z; update when Product confirms — single env change |
| Admin role detection fragile (`app_metadata.role`) | Low | Med | Document the contract in `docs/auth.md`; ship tests that assert admin item appears only when role matches |

### Estimated complexity

| Area | Level |
|------|-------|
| Frontend UI | Medium-High (14 new components, dense layout, sticky + FAB coordination) |
| Backend | Low (one Server Action) |
| Testing | Medium (5 client-islands to mock; countdown timer mock) |
| Asset work | High (hero BG export, 6 thumbs, Kudos illus, font license) |
| Reuse from Login | High payoff — skips env/middleware/i18n/analytics/test-harness bootstrap |

---

## Dependencies & Prerequisites

### Required before start

- [x] `constitution.md` reviewed
- [x] `spec.md` passed `/momorph.reviewspecify` (2 passes)
- [x] `design-style.md` passed review (2 passes)
- [x] `research.md` created
- [x] Login ship delivered (source of reused components)
- [ ] Spec Q1–Q14 answered or assumptions documented
- [ ] Plan Q-P1/Q-P2/Q-P3 answered or defaults accepted
- [ ] Assets in `public/images/` (Phase 0 exit)
- [ ] Digital Numbers license decision (Phase 0)

### External dependencies

- Supabase project (already connected via dummy env; same rules as Login).
- No new third-party services.

---

## Next Steps

1. **Answer** the plan-level Qs (Q-P1/Q-P2/Q-P3) or accept defaults.
2. **Run** `/momorph.tasks` against this plan to generate `tasks.md`. Expect
   ~40–55 tasks across Phases 0–8.
3. **Begin** with Phase 0 (assets + env) while tasks.md is being reviewed.
4. **Implement** phase-by-phase; validate at each phase exit.

---

## Open Questions

Plan-specific:

- **Q-P1** Digital Numbers font — license / self-host / fallback?
- **Q-P2** Awards data — frozen in `src/data/awards.ts` OK for MVP (no CMS)?
- **Q-P3** Sign-out UX — silent redirect to `/login` or with a
  `?signed_out=true` toast?

Carry-over from spec.md (not repeated here): **Q1–Q14**. These influence
i18n copy, event time, asset origin, etc. Plan treats them as documented
assumptions per task in `tasks.md`.

---

## Notes

- Homepage is where the product's **first reusable chrome** (header/footer
  with navs + role-aware profile menu + bell) takes shape. Designing those
  components well pays off on every screen after.
- The 6 award cards are repetitive — hitting them with a data-driven
  `<AwardCard />` + `src/data/awards.ts` saves 5× the code of hand-writing
  each card.
- Keep `<LanguageDropdown />` in its current `login/` folder unless a
  second consumer's UX diverges. When the dedicated Dropdown-ngôn ngữ spec
  lands, hoist + tweak then.
- After Homepage ships, the repo will have: Login, Homepage, plus 5 route
  stubs (awards/kudos/notifications/profile/standards/admin). That's
  foundation enough for any subsequent screen spec to import directly.
