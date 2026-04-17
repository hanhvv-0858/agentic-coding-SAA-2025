# Implementation Plan: Login (Sun Annual Awards 2025)

**Frame**: `GzbNeVGJHz-Login`
**Date**: 2026-04-17
**Spec**: [spec.md](spec.md)
**Design**: [design-style.md](design-style.md)
**Research**: [research.md](research.md)

---

## Summary

Build the public Login screen for SAA 2025 — a single "LOGIN With Google" CTA that
signs the user in via **Supabase Auth (Google OAuth)**, persists the session via
`@supabase/ssr` cookies, and redirects to `/` (Homepage) — rendered as a Next.js App
Router **Server Component** with two small client islands (`<LanguageToggle />` and
`<GoogleLoginButton />`), deployed to **Cloudflare Workers** via the
`@opennextjs/cloudflare` adapter. Because this is the first spec to hit the repo, the
plan also covers the one-time constitution alignment (folder structure → `src/`,
Yarn v1 lockfile, `<Icon />` component, Supabase scaffolding, test harness, Workers
adapter). Subsequent specs will inherit this baseline and skip Phase 0.

---

## Technical Context

| | |
|---|---|
| **Language/Framework** | TypeScript 5 (strict) / Next.js 16.2.4 (App Router) / React 19.2.4 |
| **Primary Dependencies** | `@supabase/supabase-js`, `@supabase/ssr`, `@opennextjs/cloudflare`, `tailwindcss@4` |
| **Database** | Supabase Postgres (RLS required on every table — not touched by this feature; `auth.users` / `auth.sessions` are Supabase-managed) |
| **Testing** | Vitest (unit + integration), React Testing Library, Playwright (E2E), `happy-dom` as the Vitest DOM (Workers-compatible; avoids Jest/jsdom) |
| **State Management** | React hooks only — no Zustand/Redux/Context for this screen. Server-side state comes from Supabase `getUser()` |
| **API Style** | Supabase SSR + one Next.js Route Handler (`/auth/callback`) |
| **Hosting runtime** | Cloudflare Workers via OpenNext adapter (no Node built-ins) |
| **Package manager** | Yarn v1 (classic) — constitution mandate |

---

## Constitution Compliance Check

*GATE: Must pass before implementation can begin*

| Principle / Rule | Requirement | Compliance |
|------------------|-------------|------------|
| I. Clean Code & Organization — TS strict | `strict: true` already on | ✅ Compliant |
| I. Folder structure `src/app/` etc. | Repo has flat `app/` at root | 🔧 Addressed in Phase 0 (see G1) |
| I. `@/*` path alias | Currently `./*`; must become `./src/*` | 🔧 Addressed in Phase 0 (G2) |
| II. Responsive Design | mobile-first, ≥44px touch targets, WCAG AA | 📋 Planned in Phase 2 + 4 (design-style §Responsive) |
| III. Test-First Development | TDD — write failing test before impl | 📋 Enforced per task in Phase 2+ |
| IV. Security (OWASP) | Supabase Auth, no client secrets, OWASP top-10 defenses, CSP, `HttpOnly`+`Secure` cookies | 📋 Planned — FR-005, TR-002, TR-003, TR-004 |
| V. Platform — Next.js defaults (Server Components, `next/image`, `next/link`, no `useEffect` for fetching) | `<LoginPage />` = server component; `<Icon />` + `next/image` for all art | ✅ Baked into architecture below |
| V. Platform — Supabase (`@/libs/supabase/server.ts` + `client.ts`, RLS) | Scaffolded in Phase 1 | 📋 Planned |
| V. Platform — Cloudflare Workers (`@opennextjs/cloudflare`, no Node built-ins) | Adapter + `wrangler.toml` | 📋 Phase 0 / 1 |
| V. Platform — TailwindCSS (utility-only, no custom CSS beyond `globals.css`) | v4 already installed | ✅ Plus Phase 1 config extension |
| Stack — Next.js 15.x vs. installed 16.2.4 | Version mismatch | ⚠️ **Open Question Q-P1**: bump constitution to 16.x (recommended) |
| Stack — Yarn v1 classic | Repo has `package-lock.json` | 🔧 Phase 0 — migrate (G3) |
| Dev workflow — `make up` / `make dev` / `make down` | No Makefile | 🔧 Phase 0 (G8) |
| Env management — `.env.example` committed, real envs gitignored | Neither present | 🔧 Phase 0 (G12) + `.gitignore` update |

**Violations requiring documented justification**

| Violation | Justification | Alternative Rejected |
|-----------|---------------|---------------------|
| Running on Next.js 16.2.4 while constitution states 15.x | The repo was scaffolded with `create-next-app` at 16.2.4; downgrading would discard working boilerplate. 16.x is backwards-compatible with the 15.x App Router rules the constitution actually relies on. | Pinning to 15.x — rejected because no constitution rule materially depends on a 15-only API |
| Plaintext GitHub token in committed `.mcp.json` | — **NOT justified**; violates Principle IV. | No alternative; **Phase 0 mandatory fix**: rotate + move to ignored file |

---

## Architecture Decisions

### Frontend Approach

- **Component Structure**: Feature-scoped + atomic UI primitives.
  - `src/app/(public)/login/page.tsx` — the Server Component page (default-exported).
  - `src/components/layout/SiteHeader.tsx`, `SiteFooter.tsx` — reusable shell chrome
    for any public/auth screen.
  - `src/components/layout/LanguageToggle.tsx` — client component; orchestrates the
    `Dropdown-ngôn ngữ` overlay + cookie write.
  - `src/components/login/GoogleLoginButton.tsx` — client component; calls
    `supabase.auth.signInWithOAuth({ provider: "google" })` and owns the loading
    state per FR-006.
  - `src/components/login/LoginErrorBanner.tsx` — server component that reads
    `?error=<code>` search param and renders the localized banner per FR-007.
  - `src/components/ui/Icon.tsx` — thin wrapper over an SVG sprite map; `<Icon
    name="google" className="h-6 w-6" />`.
  - `src/components/ui/PrimaryButton.tsx` — cream-CTA primitive; `GoogleLoginButton`
    composes it.

- **Styling Strategy**: Tailwind CSS v4 utilities only. Tokens (brand colors,
  accent, divider, font families) added in `tailwind.config.ts` per
  `design-style.md` → Implementation Mapping. `globals.css` keeps only `@tailwind`
  directives + font-face CSS variables.

- **Data Fetching**: Server Components read Supabase session via
  `createServerClient().auth.getUser()`. No client data hooks — per constitution V
  "avoid `useEffect` for data fetching".

- **Routing / i18n**: Locale resolved server-side from the `NEXT_LOCALE` cookie
  (default `vi`). Messages loaded by a tiny util (`src/libs/i18n/getMessages.ts`)
  that imports `src/messages/vi.json` + `src/messages/en.json`. A library like
  `next-intl` is **not required** for this feature's scope; if a later feature needs
  rich formatting, install then. Deferred.

### Backend Approach

- **API Design**: One new Route Handler at `src/app/auth/callback/route.ts`
  (GET only). Owns: (a) `exchangeCodeForSession`, (b) domain re-validation,
  (c) `next` param validation, (d) 302 to `/` or `next`, (e) error redirects to
  `/login?error=<code>`.
- **Data Access**: Via Supabase client exclusively — no raw SQL. RLS enforced by
  Supabase (no tables touched in this feature).
- **Validation**: Zod schemas for the callback query params (`code`, `state?`,
  `next?`, `error?`) in `src/libs/auth/callbackParams.ts`.

### Integration Points

- **Existing Services**: none (day 0 of the repo).
- **Shared Components**: every component this feature adds is designed to be reused
  by later features. `<SiteHeader />`, `<SiteFooter />`, `<Icon />`,
  `<PrimaryButton />`, `<LanguageToggle />`, the Supabase client pair, and the
  i18n util are all general-purpose.
- **API Contracts**: `/auth/callback` is fully internal. Supabase REST endpoints
  are called via the official SDK, so no hand-maintained contracts.

---

## Project Structure

### Documentation (this feature)

```text
.momorph/specs/GzbNeVGJHz-login/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Codebase research + alignment gaps
├── design-style.md      # Visual specification
├── assets/
│   └── frame.png        # Figma reference screenshot
└── tasks.md             # To be produced by /momorph.tasks
```

### Source Code (affected areas)

New files (creation):

```text
src/
├── app/
│   ├── layout.tsx                               # [MOVED from /app/layout.tsx + edited]
│   ├── globals.css                              # [MOVED]
│   ├── favicon.ico                              # [MOVED]
│   ├── page.tsx                                 # [MOVED — redirect stub until Homepage spec]
│   ├── (public)/
│   │   └── login/
│   │       └── page.tsx                         # ★ LoginPage (Server Component)
│   ├── auth/
│   │   └── callback/
│   │       └── route.ts                         # ★ OAuth callback Route Handler
│   └── error/
│       ├── 403/page.tsx                         # minimal — will be fleshed out in the 403 spec
│       └── 404/page.tsx                         # minimal — will be fleshed out in the 404 spec
├── components/
│   ├── ui/
│   │   ├── Icon.tsx                             # ★ sprite-based icon (+ spinner variant)
│   │   ├── PrimaryButton.tsx                    # ★ cream CTA primitive
│   │   ├── DismissibleAlert.tsx                 # ★ "use client" — focus + Esc handler (used by LoginErrorBanner + future alerts)
│   │   └── __tests__/
│   │       ├── Icon.spec.tsx
│   │       ├── PrimaryButton.spec.tsx
│   │       └── DismissibleAlert.spec.tsx
│   ├── layout/
│   │   ├── SiteHeader.tsx                       # ★ server comp — hosts <SiteLogo /> + <LanguageToggle />
│   │   ├── SiteLogo.tsx                         # ★ server comp — <Image> wrapper for SAA logo
│   │   ├── SiteFooter.tsx                       # ★ copyright
│   │   └── LanguageToggle.tsx                   # ★ "use client" — opens dropdown, writes cookie via setLocale
│   └── login/
│       ├── GoogleLoginButton.tsx                # ★ "use client" — OAuth CTA
│       ├── KeyVisualBackground.tsx              # ★ server comp — full-bleed login-bg.jpg via next/image
│       ├── LoginHero.tsx                        # ★ server comp — KeyVisual + HeroCopy + CTA column
│       ├── KeyVisual.tsx                        # ★ server comp — Root Further image
│       ├── HeroCopy.tsx                         # ★ server comp — 2-line intro text
│       ├── LoginErrorBanner.tsx                 # ★ server comp — renders banner; delegates focus/Esc to <DismissibleAlert />
│       ├── LanguageDropdown.tsx                 # ★ overlay menu (VI / EN); prototype only — hoisted to ui/ when dedicated spec lands
│       └── __tests__/
│           ├── GoogleLoginButton.spec.tsx
│           ├── LoginErrorBanner.spec.tsx
│           ├── LanguageToggle.spec.tsx
│           └── LanguageDropdown.spec.tsx
├── icons/
│   ├── flag-vn.svg
│   ├── globe.svg                                # for non-VI locales — see Q-P5 (globe vs country flag)
│   ├── chevron-down.svg
│   └── google.svg
├── libs/
│   ├── env.ts                                   # ★ Zod-validated process.env at module load
│   ├── supabase/
│   │   ├── server.ts                            # ★ createServerClient factory
│   │   ├── client.ts                            # ★ createBrowserClient factory
│   │   ├── middleware.ts                        # ★ updateSession helper
│   │   └── __tests__/
│   │       ├── server.spec.ts
│   │       └── middleware.spec.ts
│   ├── auth/
│   │   ├── callbackParams.ts                    # ★ Zod schema for ?code=, ?next=, ?error=
│   │   ├── isAllowedEmail.ts                    # ★ domain allow-list (Sun* only)
│   │   ├── validateNextParam.ts                 # ★ open-redirect guard
│   │   └── __tests__/
│   │       ├── callbackParams.spec.ts
│   │       ├── isAllowedEmail.spec.ts
│   │       └── validateNextParam.spec.ts
│   ├── i18n/
│   │   ├── getMessages.ts                       # ★ locale cookie → messages JSON
│   │   ├── setLocale.ts                         # ★ sets NEXT_LOCALE cookie (Server Action)
│   │   └── __tests__/
│   │       ├── getMessages.spec.ts
│   │       └── setLocale.spec.ts
│   └── analytics/
│       ├── track.ts                             # ★ typed event emitter — screen_view, login_attempt, ...
│       └── __tests__/track.spec.ts
├── messages/
│   ├── vi.json                                  # ★ VI catalog — spec's i18n table
│   └── en.json                                  # ★ EN catalog
├── types/
│   └── auth.ts                                  # ★ OAuthErrorCode, AllowedDomain
└── utils/                                       # empty for now
```

Test harness + CI files (outside `src/`):

```text
tests/
├── setup/
│   ├── vitest.setup.ts                          # ★ extends expect with jest-dom
│   └── mockSupabase.ts                          # ★ vi.mock scaffolds for Supabase client
├── fixtures/
│   ├── users.ts                                 # ★ makeUser({ email, domain? })
│   └── sessions.ts                              # ★ makeSession()
└── e2e/
    ├── login.happy.spec.ts                      # ★ Playwright — US1 happy path
    ├── login.errors.spec.ts                     # ★ Playwright — US2 error scenarios
    ├── login.language.spec.ts                   # ★ Playwright — US3 language toggle
    └── fixtures/mockGoogleOAuth.ts              # ★ Playwright fixture that stubs accounts.google.com

docs/
└── auth.md                                      # ★ OAuth flow + "how to add an allowed domain"

.github/
└── workflows/
    └── ci.yml                                   # ★ lint → typecheck → vitest → playwright → build
```

Files moved, deleted, or modified at the project root:

```text
/app/**                     → moved into /src/app/
/tsconfig.json              → paths "@/*" = ["./src/*"]
/next.config.ts             → add OpenNext/Workers settings + images domains
/package.json               → add deps + scripts (see Dependencies)
/package-lock.json          → DELETE (replaced by yarn.lock)
/yarn.lock                  → NEW (Yarn v1 install)
/eslint.config.mjs          → extend with next/typescript + import-order rules
/postcss.config.mjs         → (no change; Tailwind v4 plugin already wired)
/tailwind.config.ts         → NEW — tokens from design-style.md
/middleware.ts              → NEW — calls updateSession() on every non-static req
/wrangler.toml              → NEW — Cloudflare Workers config
/open-next.config.ts        → NEW — OpenNext adapter config
/Makefile                   → NEW — `make up/dev/down/test/e2e/check`
/.env.example               → NEW — NEXT_PUBLIC_SITE_URL, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, ALLOWED_EMAIL_DOMAINS
/.gitignore                 → add .env, .env.*, .env.local, .wrangler/, .open-next/, playwright-report/, test-results/
/.mcp.json                  → ROTATE embedded token + move to ignored file
/vitest.config.ts           → NEW — happy-dom env, alias `@` → ./src, setupFiles
/playwright.config.ts       → NEW — baseURL localhost:3000, retries 1, fixtures
/public/
├── images/
│   ├── login-bg.jpg                             # downloaded via get_media_files (+ @2x if 2x asset exists)
│   ├── root-further.png                         # downloaded via get_media_files (SVG if available, else PNG + @2x)
│   └── saa-logo.svg                             # downloaded via get_media_files
```

> Note on asset retrieval: `mcp__momorph__get_media_files` returns URLs / binary data
> for the Figma-hosted media under the file's `MM_MEDIA_*` components. If it returns an
> SVG, use it; if only a PNG is available, ship `name.png` + `name@2x.png` and let
> `next/image` pick the closest. Do **not** use `<img>` tags for these — the bitmap
> assets go through `next/image`, the vector icons through `<Icon />`.

### Dependencies

Install in one command: `yarn add <runtime>` then `yarn add -D <dev>`.

| Package | Version target | Type | Purpose |
|---------|----------------|------|---------|
| `@supabase/supabase-js` | `^2.x (latest)` | runtime | Supabase SDK base |
| `@supabase/ssr` | `^0.5.x (latest)` | runtime | Next.js App Router + cookie helpers (Workers-compatible) |
| `zod` | `^3.23.x (latest)` | runtime | Parse callback query params + env schema (TR boundary validation) |
| `@opennextjs/cloudflare` | `^0.5.x (latest)` | dev | Adapter to build Next.js for Workers |
| `wrangler` | `^3.80.x (latest)` | dev | Cloudflare CLI (local dev + deploy) |
| `vitest` | `^2.x` | dev | Unit + integration runner (Workers-compatible) |
| `@vitejs/plugin-react` | `^4.x` | dev | Vite React plugin for Vitest |
| `@testing-library/react` | `^16.x` | dev | Component test helpers |
| `@testing-library/jest-dom` | `^6.x` | dev | `toBeInTheDocument` etc. |
| `@testing-library/user-event` | `^14.x` | dev | User-event simulator |
| `happy-dom` | `^15.x` | dev | Fast, Workers-shaped DOM for Vitest |
| `@playwright/test` | `^1.47.x (latest)` | dev | E2E runner |
| `@axe-core/playwright` | `^4.x` | dev | Accessibility audit inside Playwright (T-5.1) |
| `@next/bundle-analyzer` | `^15.x` | dev | Bundle-size guard (T-5.3) |
| `eslint-plugin-jsx-a11y` | `^6.x` | dev | Catch a11y regressions at lint time |
| `prettier` | `^3.x` | dev | Formatter (constitution asks for consistent style) |
| `plaiceholder` | `^3.x` | dev | (optional, T-5.2) generate LQIP for hero background if LCP budget is tight |
| `@types/node` | already installed | dev | — |

Version numbers use **Context7** at install time for the exact latest compatible
set (see "Research" recommendations). Pin in `package.json` once CI is green.

---

## Implementation Approach

### Phase 0 — Constitution Alignment & Asset Preparation

**Purpose**: Remove blockers so feature code can be written. These tasks are repo-wide,
not Login-specific, but they MUST land before (or inside) the Login PR.

1. **Rotate the plaintext GitHub token in `.mcp.json`** (from research.md — security
   immediate). Move to a local-only env / secret manager. Update `.mcp.json` to read
   from env.
2. Delete `package-lock.json`, `node_modules/`; run `yarn install`; commit `yarn.lock`.
3. Create `src/` dir and move `app/` → `src/app/`. Update `tsconfig.json` paths
   (`@/*` → `./src/*`). Verify `next dev` still serves the scaffold page.
4. Add `.gitignore` entries: `.env`, `.env.*`, `.env.local`, `.wrangler/`,
   `.open-next/`.
5. Create `.env.example` with `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (documented; never
   used from client), `ALLOWED_EMAIL_DOMAINS`.
6. Install **Cloudflare Workers adapter**: `yarn add -D @opennextjs/cloudflare wrangler`.
   Add `open-next.config.ts`, `wrangler.toml`. Confirm `yarn build` produces a
   Workers-compatible bundle locally.
7. Create `Makefile` with `up` (starts `supabase start` + writes `.env.development`),
   `dev` (`yarn dev --turbo`), `down` (`supabase stop`), `test` (`vitest run`),
   `e2e` (`playwright test`), `check` (`yarn lint && yarn tsc --noEmit &&
   make test`).
8. **Download assets** via `mcp__momorph__get_media_files` into `public/images/` and
   `src/icons/`. Source Figma node IDs per `design-style.md` → Asset Checklist:
   - `MM_MEDIA_Root Further Logo` (`2939:9548`) → `public/images/root-further.png`
   - `C_Keyvisual` child (`662:14389`) → `public/images/login-bg.jpg`
   - `MM_MEDIA_Logo` (`I662:14391;178:1033;178:1030`) → `public/images/saa-logo.svg`
     (SVG preferred; fall back to PNG if only raster available)
   - `MM_MEDIA_VN` (`178:1020`) → `src/icons/flag-vn.svg`
   - `MM_MEDIA_Down` (`186:1862`) → `src/icons/chevron-down.svg`
   - `MM_MEDIA_Google` (`662:14662`) → `src/icons/google.svg`
9. Decide and document Next.js version policy (Q-P1): propose a constitution patch
   bumping to 16.x as part of the Login PR description.

**Exit criteria (Phase 0)**

- [ ] `yarn install` succeeds; `yarn.lock` committed.
- [ ] `yarn dev` serves the scaffold page from `src/app/page.tsx`.
- [ ] `yarn build` compiles with the OpenNext adapter (bundle produced).
- [ ] `.mcp.json` no longer contains a plaintext token.
- [ ] All six Figma assets present in `public/` / `src/icons/`.

---

### Phase 1 — Foundation (shared infrastructure)

**Purpose**: Lay the rails that User Story 1 will run on. Still blocking — no user
story can ship without these.

1. **Tailwind tokens** (`tailwind.config.ts`): extend `fontFamily` with `montserrat` +
   `montserrat-alt`; extend `colors` with `brand.900`, `brand.800`, `accent.cream`,
   `divider`. Replace `Geist` in `src/app/layout.tsx` with `next/font/google` for
   Montserrat + Montserrat Alternates (400 + 700, subsets `latin` + `vietnamese`,
   `display: "swap"`).
2. **`<Icon />` component** (`src/components/ui/Icon.tsx`): reads from
   `src/icons/*.svg`; renders as inline SVG with `role="img"` + `aria-label`.
   Includes a `ring-spinner` variant (used by `<GoogleLoginButton />` loading state).
3. **`<PrimaryButton />` primitive** (`src/components/ui/PrimaryButton.tsx`): cream
   CTA variant per `design-style.md` §14 — default / hover / active / focus-visible /
   disabled states. Props: `loading`, `leadingIcon?`, `trailingIcon?`, children, plus
   all native `<button>` props.
4. **Supabase client factories** (`src/libs/supabase/{server,client,middleware}.ts`)
   following the Supabase SSR Next.js guide (use `mcp__context7__query-docs` with
   topic "supabase ssr nextjs" at implementation time to lift the canonical snippets).
5. **Middleware** (`middleware.ts` at project root): calls `updateSession()` from
   `@/libs/supabase/middleware`; `matcher` excludes `/_next/static`, `/_next/image`,
   `/favicon.ico`, `/images/*`, `/icons/*`.
6. **Env validation** (`src/libs/env.ts`): Zod schema for
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `ALLOWED_EMAIL_DOMAINS`, parsed once at module load. Throws on missing / malformed.
7. **i18n message catalogs** (`src/messages/vi.json`, `en.json`) populated from
   `spec.md` → i18n Message Keys. `src/libs/i18n/getMessages.ts` reads the cookie
   from `next/headers`.
8. **Site chrome**: `<SiteHeader />` (renders logo + `<LanguageToggle />`) and
   `<SiteFooter />` (renders copyright), both using tokens from step 1 and dimensions
   from `design-style.md` §5 / §15.
9. **Test harness**: add Vitest config (`vitest.config.ts`) with `happy-dom`
   environment, path alias `@` → `./src`, and a setup file importing
   `@testing-library/jest-dom`. Add `tests/setup/vitest.setup.ts`. Add Playwright
   config (`playwright.config.ts`) with a mock Supabase project in `.env.test`.
10. **CI pipeline** (`.github/workflows/ci.yml` — pending Q-P4 answer): install
    Yarn v1, run `yarn lint`, `yarn tsc --noEmit`, `yarn test --run`,
    `yarn playwright test --shard=1/1`, `yarn build`.

**Exit criteria (Phase 1)**

- [ ] `<Icon />` and `<PrimaryButton />` each have ≥1 passing unit test.
- [ ] Supabase factories compile against the Workers runtime (`yarn build`).
- [ ] `yarn test` runs and reports 0 failures (with only the Phase 1 tests).
- [ ] Playwright can launch Chromium and load `/` without session.
- [ ] CI workflow green on a throwaway PR.

---

### Phase 2 — User Story 1 (P1): Sign in → Homepage  🎯 MVP

**Goal**: A Sun\* user clicks the CTA and reaches `/`.

Follow TDD for each task: write the test (red), implement (green), refactor.

#### Server + wiring (US1)

1. **T-2.1** [US1] `src/libs/auth/isAllowedEmail.ts` + unit tests covering
   `alice@sun-asterisk.com` → true, `bob@external.com` → false, mixed-case input,
   missing `@`. Reads the allow-list from env. (FR-005, SC-006 inputs.)
2. **T-2.2** [US1] `src/libs/auth/validateNextParam.ts` + unit tests covering
   allowed (`/kudos/123`), rejected (`//evil.com`, `http://x.test/`, `javascript:…`,
   empty), returning the default `/` on rejection. (FR-004, TR-002.)
3. **T-2.3** [US1] `src/libs/auth/callbackParams.ts` (Zod schema) + unit tests.
4. **T-2.4** [US1] `src/app/auth/callback/route.ts` — GET handler. Logic:
   `parse params → if error param → redirect("/login?error=...") → else
   exchangeCodeForSession → getUser → isAllowedEmail(user.email)?
   validateNextParam → redirect`. Writes no response body on success (302 only).
   Integration tests via Vitest + mocked Supabase client cover the five branches
   enumerated in `research.md` → Testing Recommendations.
5. **T-2.5** [US1] `src/components/login/GoogleLoginButton.tsx` — `"use client"`.
   Props: `isDisabled?`. Calls `supabase.auth.signInWithOAuth({ provider: "google",
   options: { redirectTo: <origin>/auth/callback } })`. Sets `isSubmitting` *before*
   awaiting the call (FR-006). RTL test asserts: button disables + label changes
   before SDK fire.

#### UI (US1)

6. **T-2.6** [US1] `src/app/(public)/login/page.tsx` — Server Component.
   (a) Read session via `createServerClient().auth.getUser()` → if present, `redirect("/")`.
   (b) Read locale + messages. (c) Render `<SiteHeader />` + hero (`<KeyVisual />` +
   `<HeroCopy />` + `<GoogleLoginButton />`) + `<LoginErrorBanner />` (derived from
   `?error=`) + `<SiteFooter />`. Full `design-style.md` Tailwind classes.
7. **T-2.7** [US1] `src/components/ui/DismissibleAlert.tsx` — thin `"use client"`
   wrapper. Props: `children`, `onDismiss?`, `autoFocus?: boolean`. On mount, if
   `autoFocus`, calls `ref.current?.focus()`. Attaches `keydown` listener for
   `Escape` → `onDismiss?.()`. Renders `<div role="alert" aria-live="assertive"
   tabIndex={-1}>{children}</div>`. Unit tests cover: autoFocus true/false, Esc
   dismisses, `role=alert` present.
8. **T-2.8** [US1] `src/components/login/LoginErrorBanner.tsx` — server
   component; reads `?error=` search param, validates against an enum
   (`access_denied | network | session_exchange_failed | cookie_blocked`),
   resolves the localized string from `getMessages()`, and wraps the styled banner
   in `<DismissibleAlert autoFocus>...</DismissibleAlert>`. If `?error=` is absent
   or invalid, renders nothing (`return null`). This separation keeps the server
   component free of browser APIs (no `useEffect`, no `document`), while
   `<DismissibleAlert />` owns all client-side behavior.
9. **T-2.9** [US1] `src/components/login/LoginHero.tsx` + `KeyVisual.tsx` +
   `HeroCopy.tsx` — split hero into discrete server components for readability.
   `<HeroCopy />` reads its two lines from `messages.login.hero.line1/line2`.
10. **T-2.10** [US1] `src/components/login/KeyVisualBackground.tsx` — full-bleed
    `<Image src="/images/login-bg.jpg" fill priority sizes="100vw" />` +
    Rectangle 57 gradient overlay + Cover gradient overlay, all positioned per
    design-style.md §2–§4.
11. **T-2.11** [US1] Homepage stub — `src/app/page.tsx` becomes a Server Component
    that calls `createServerClient().auth.getUser()`; if no session, redirects to
    `/login`; if session, renders a minimal placeholder (`<h1>SAA 2025</h1>`).
    Full Homepage spec is separate; for US1 we only need it to exist so the
    callback's 302 doesn't 404.

12. **T-2.12** [US1] `src/components/login/LoginPage.motion.ts` (or inline in
    `LoginHero`) — gate the hero mount animation on
    `prefers-reduced-motion: no-preference` via Tailwind's `motion-safe:` variant
    (e.g. `motion-safe:animate-fade-in`). No JavaScript needed; `motion-reduce:`
    or `motion-safe:` utilities cover this per
    [spec.md Edge Cases — Reduced motion](spec.md).

#### E2E (US1)

13. **T-2.13** [US1] Playwright scenario: "fresh browser → `/login` → click CTA →
    mocked Google OAuth success with `user.email=@sun-asterisk.com` →
    `/auth/callback?code=mock` → 302 to `/` → assert `sb-*-auth-token` cookie
    present with `HttpOnly`, `Secure` (in prod profile), `SameSite=Lax` flags
    (TR-003)".
14. **T-2.14** [US1] Playwright scenario: "already-signed-in (session cookie
    seeded) visits `/login` → 302 to `/` without rendering the login UI" (covers
    US1 AC4 + spec Edge Case "browser back after OAuth").

**Checkpoint (end of Phase 2)**: US1 demonstrably works end to end. MVP-complete.

---

### Phase 3 — User Story 2 (P1): Accurate error states

1. **T-3.1** [US2] Extend `/auth/callback` to emit the four defined `?error=` codes
   (`access_denied`, `network`, `session_exchange_failed`, `cookie_blocked`).
   Integration tests cover each branch:
   - `?error=access_denied` arriving from Google → 302 to `/login?error=access_denied`
   - `exchangeCodeForSession` throws → 302 to `/login?error=session_exchange_failed`
   - Cookie store unreachable (simulated via mocked `cookies()`) → 302 to
     `/login?error=cookie_blocked`
   - Google 5xx / network error → 302 to `/login?error=network`
2. **T-3.2** [US2] Extend `<LoginErrorBanner />` i18n mapping (keys already in the
   catalog from Phase 1); the server component uses `getMessages()[code]` and
   renders inside `<DismissibleAlert autoFocus>…</DismissibleAlert>` (the client
   wrapper landed in T-2.7). No new component is required in Phase 3.
3. **T-3.3** [US2] Non-allowed domain → `/error/403`. Callback logic: after
   `getUser()`, if `!isAllowedEmail(user.email)` → (a) call
   `supabase.auth.signOut()` to clear the session Supabase just issued, (b) 302 to
   `/error/403`. Unit + integration tests.
4. **T-3.4** [US2] `src/app/error/403/page.tsx` + `src/app/error/404/page.tsx` —
   minimal server components that render a centered message in the locale. Full
   visuals come from their own Figma frames (`T3e_iS9PCL`, `p0yJ89B-9_`); this
   feature only needs them to exist as valid redirect targets.
5. **T-3.5** [US2] Analytics: fire `login_error` with `{ provider: 'google',
   error_code }` whenever the banner is rendered (server-side, no PII). Unit test
   via `vi.mock('@/libs/analytics/track')`.
6. **T-3.6** [US2] Playwright scenario "deny consent": intercept OAuth mock to
   return `?error=access_denied` → assert banner visible with VI copy, focus on
   banner, Esc dismisses the banner and re-focuses the CTA.
7. **T-3.7** [US2] Playwright scenario "non-Sun\* domain": OAuth mock returns a
   user with `email=outsider@gmail.com` → assert 302 to `/error/403`, no
   `sb-*-auth-token` cookie set.

**Checkpoint**: P1 user stories complete. Feature is safely shippable.

---

### Phase 4 — User Story 3 (P2): Language toggle

1. **T-4.1** [US3] `src/libs/i18n/setLocale.ts` — Server Action that writes
   `NEXT_LOCALE` with `Path=/; SameSite=Lax; Max-Age=31536000` and calls
   `revalidatePath("/")` so the route re-renders. Unit test covers cookie attrs +
   revalidate call + rejection of unsupported locales.
2. **T-4.2** [US3] `src/components/login/LanguageDropdown.tsx` — overlay menu
   (reuses `<Icon />`). Prototype inside `login/`; hoisted to `ui/` when the
   dedicated `Dropdown-ngôn ngữ` spec lands. Accepts `currentLocale` + `onSelect`.
3. **T-4.3** [US3] `<LanguageToggle />` opens the dropdown, rotates chevron via
   `motion-safe:transition-transform`, handles `Enter`/`Space`/`ArrowDown` to open,
   `Escape` to close, exposes `aria-label` + `aria-expanded` + `aria-controls`
   per FR-012 (sourced from `common.language.toggle.vi` / `.en` i18n keys).
4. **T-4.4** [US3] Selecting a locale calls `setLocale` action. Emits a
   `language_change` analytics event with `{ from, to }`. RTL test asserts the
   event fired with correct payload.
5. **T-4.5** [US3] Playwright scenario: "VN toggle → open → select EN → hero copy
   flips to English → reload page → English persists (cookie survives) → sign in
   → Homepage stub renders in English".

**Checkpoint**: all three user stories complete.

---

### Phase 5 — Polish & Cross-Cutting Concerns

1. **T-5.1** Accessibility sweep:
   - Run axe-core (`@axe-core/playwright`) on `/login` at mobile + desktop
     viewports; assert zero `serious`/`critical` violations.
   - Manual keyboard walk-through: verify tab order is Language toggle → CTA,
     that `Escape` dismisses the language dropdown and the error banner, and
     that the focus ring is visible on both dark and cream backgrounds.
   - Screen-reader spot-check with VoiceOver (macOS) + NVDA (Win): button name,
     language toggle `aria-label`, banner `role=alert` announcement.
2. **T-5.2** Performance budget (SC-002):
   - Preview deploy to Cloudflare Workers (Wrangler).
   - Run Lighthouse mobile (slow 4G, Moto G Power profile); capture LCP/TTI/CLS.
   - If LCP > 2.5 s: generate a low-quality blur placeholder for `login-bg.jpg`
     (`plaiceholder` or manual base64 encode) and pass as `blurDataURL` to
     `<Image>`.
3. **T-5.3** Bundle guard (TR-010):
   - Add `@next/bundle-analyzer` (dev dep).
   - Add a CI step `yarn analyze` that writes `.next/analyze/*.json`.
   - Add a small Node script `scripts/check-bundle-size.mjs` that reads the
     analyzer report, finds the `/login` route, and asserts its client bundle
     is ≤ 30 720 bytes (30 KB) gzipped. Fails CI on exceed.
4. **T-5.4** Secrets-in-bundle scan (SC-006):
   - Add `scripts/check-bundle-secrets.mjs` that greps the built client bundle
     under `.open-next/` for forbidden substrings:
     `SUPABASE_SERVICE_ROLE_KEY`, `GITHUB_TOKEN`, `gho_`, `service_role`.
     Fails CI on any hit.
5. **T-5.5** Security headers (TR-004):
   - Decide location per Q8 — default: Cloudflare Workers response-header
     transform configured in `wrangler.toml` + `open-next.config.ts`.
   - Add: `Content-Security-Policy` (allowing `accounts.google.com` for OAuth
     redirect only), `Strict-Transport-Security: max-age=63072000;
     includeSubDomains; preload`, `X-Content-Type-Options: nosniff`,
     `Referrer-Policy: strict-origin-when-cross-origin`,
     `Permissions-Policy: camera=(), microphone=(), geolocation=()`.
   - Playwright test asserts the headers appear on `GET /login`.
6. **T-5.6** Analytics wiring (`src/libs/analytics/track.ts`):
   - Typed emitter with events `screen_view`, `login_attempt`, `login_success`,
     `login_error`, `language_change` per spec `§Analytics`.
   - PII-scrubbed: `login_success` emits `{ user_id, email_domain }` (domain
     extracted via `email.split('@')[1]`; raw email NEVER emitted).
   - Vendor-agnostic (simple `window.dataLayer.push` + server-side
     `console.log(JSON.stringify(event))`). Swap the sink in a later feature.
7. **T-5.7** Cookie flags verification (TR-003):
   - Vitest integration test against the callback: assert `Set-Cookie` includes
     `HttpOnly`, `Secure` (in production env), `SameSite=Lax`, and the Supabase
     cookie name prefix `sb-`.
   - Verify total `Set-Cookie` bytes < 4 KB (well under the Workers 8 KB limit)
     using a realistic user payload fixture.
8. **T-5.8** Docs:
   - `docs/auth.md` — OAuth flow diagram (mermaid), how to add an allowed
     domain, how to rotate the Supabase anon key, local-dev Supabase setup.
   - Link from `README.md` (which is Phase 1 / Phase 5 boundary — Phase 5 final).
9. **T-5.9** SC-004 operational dashboard:
   - Out of code scope, but add a README note describing how to build an
     `login_error / login_attempt` rate dashboard in the analytics vendor once
     chosen. Tag owner TBD.

---

## Integration Testing Strategy

### Test Scope

- [x] **Component / module interactions**: `<LoginPage />` rendering with
      session-absent and session-present; `<GoogleLoginButton />` wiring to
      Supabase client; `<LanguageToggle />` → `setLocale` action.
- [x] **External dependencies**: Supabase Auth (mocked at the SDK boundary) —
      `signInWithOAuth`, `exchangeCodeForSession`, `getUser`.
- [x] **Data layer**: none (no app tables touched).
- [x] **User workflows**: full `/login` → Google mock → `/` loop; denied-consent;
      non-Sun\* domain → 403.

### Test Categories

| Category | Applicable? | Key Scenarios |
|----------|-------------|---------------|
| UI ↔ Logic | Yes | CTA loading state, error banner focus, language toggle |
| Service ↔ Service | Yes | Callback ↔ Supabase Auth ↔ cookie store |
| App ↔ External API | Yes (mocked) | OAuth redirect, code exchange |
| App ↔ Data Layer | No | — |
| Cross-platform | Partial | Desktop + mobile viewport checks in Playwright |

### Test Environment

- **Environment type**: Local for unit/integration (Vitest + happy-dom), Playwright
  against `yarn dev` for E2E smoke, and CI spins up a dedicated test Supabase
  project (key in encrypted CI secret).
- **Test data strategy**: Fixtures in `tests/fixtures/`, factory-style (`makeUser`,
  `makeSession`). No real Google OAuth in CI — mock the redirect.
- **Isolation approach**: Vitest uses fresh module state per file. Playwright
  clears cookies between tests.

### Mocking Strategy

| Dependency Type | Strategy | Rationale |
|-----------------|----------|-----------|
| Supabase client | Mock at the module boundary (`vi.mock('@/libs/supabase/...')`) | Fast, deterministic |
| Google OAuth | Replace the consent URL with an internal `/__tests__/mock-google` route in Playwright | No external network in CI |
| `cookies()` from `next/headers` | Vitest mock | Stable values per test |

### Test Scenarios Outline

1. **Happy Path**
   - [ ] Fresh visitor clicks CTA → reaches `/`.
   - [ ] Already-signed-in visitor hits `/login` → 302 to `/`.
2. **Error Handling**
   - [ ] Denied consent → banner + button re-enabled.
   - [ ] Non-Sun\* domain → 403 redirect, no cookie.
   - [ ] Supabase exchange throws → banner with `session_exchange_failed` copy.
   - [ ] Cookie blocked → banner with `cookie_blocked` copy.
3. **Edge Cases**
   - [ ] `?next=//evil.com` → ignored, lands on `/`.
   - [ ] `?next=/kudos/123` → lands on `/kudos/123`.
   - [ ] Back button after successful login → stays on `/`.
   - [ ] Two tabs on `/login` after login in a third tab → both eventually redirect.

### Tooling & Framework

- **Test framework**: Vitest (unit + integration), Playwright (E2E).
- **Supporting tools**: happy-dom, `@testing-library/*`, `@next/bundle-analyzer`,
  axe-core.
- **CI integration**: workflow `lint → typecheck → vitest → playwright →
  bundle-guard → build`.

### Coverage Goals

| Area | Target | Priority |
|------|--------|----------|
| `/auth/callback` route handler | 100% branches | High |
| `src/libs/auth/*` utilities | 100% branches | High |
| UI components with state (`<GoogleLoginButton />`, `<LanguageToggle />`, `<LoginErrorBanner />`) | ≥ 90% | High |
| Static UI (`<SiteHeader />`, `<SiteFooter />`, `<KeyVisual />`) | ≥ 70% | Medium |
| Integration (E2E) | All 3 stories' P1 flows green | High |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Cloudflare Workers runtime surprises break Supabase callback | Med | High | Run `yarn build` + `wrangler dev` locally end-of-Phase-1; keep `@supabase/ssr` pinned; write an integration test that imports the route via the OpenNext build output |
| Open-redirect bug via `?next=` | Low | High | Dedicated unit tests for `validateNextParam`, plus Playwright covers the malicious-input case |
| Supabase cookie size pushed past Workers limit | Low | High | Use Supabase's split-cookie default; monitor `Set-Cookie` size in E2E |
| Constitution vs repo Next.js version drift | High | Low | Decide in Phase 0 (Q-P1); the Login PR description proposes the constitution patch |
| Fonts inflate LCP | Med | Med | Subset to `latin` + `vietnamese`; `display: swap`; self-host via `next/font` |
| Google OAuth client config wrong (redirect URI mismatch) | Med | High | Document exact URIs in `docs/auth.md`; add a CI-only check that asserts `NEXT_PUBLIC_SITE_URL/auth/callback` is present in the Supabase project config JSON |
| Scope creep pulling in `Dropdown-ngôn ngữ` spec | Med | Med | `<LanguageDropdown />` for Login ships a minimal form; the full spec lands separately |

### Estimated Complexity

| Area | Level |
|------|-------|
| Frontend | Medium (visual precision + 3 stateful client components) |
| Backend | Medium (callback + domain/next validation + env schema) |
| Testing | Medium (first-time harness setup + realistic OAuth mocking) |
| Repo alignment (Phase 0) | Medium (one-time — future specs get this for free) |

---

## Dependencies & Prerequisites

### Required Before Start

- [x] `constitution.md` reviewed and understood.
- [x] `spec.md` exists and passed `/momorph.reviewspecify` (two passes).
- [x] `design-style.md` exists and passed the same review.
- [x] `research.md` (this feature) completed.
- [ ] Open questions Q-P1 through Q-P5 (see below) answered OR explicitly deferred
      with a chosen default.
- [ ] Open questions Q1–Q10 (spec.md) answered OR a documented default chosen per
      question.
- [ ] Supabase project URL + anon key provisioned and shared via the team's secret
      manager.
- [ ] Cloudflare Workers project created + API token issued for `wrangler`.
- [ ] Design confirms (or rejects) backdrop-blur on the header and hover/active
      visuals on the cream CTA (spec Q6, Q7).

### External Dependencies

- Supabase (Auth + later DB) as the backend.
- Google Cloud OAuth 2.0 client (configured from inside the Supabase dashboard).
- Cloudflare Workers account + zone (for production host) + `saa.sun-asterisk.com`
  (or the domain chosen in Q-P3).

---

## Open Questions (plan-level)

Plan-specific questions that should be answered before tasks.md is generated. All
spec-level questions (Q1–Q10) are still tracked in `spec.md → Open Questions`.

- **Q-P1** Bump constitution to Next.js 16.x (match repo) or downgrade to 15.x?
  *Recommendation: bump constitution as part of this PR.*
- **Q-P2** Does a Supabase project already exist for SAA 2025, or does Phase 0 create
  it? Affects the shape of the secret-management tasks.
- **Q-P3** Production domain — `saa.sun-asterisk.com`? Needed for OAuth redirect URI
  registration and the `cookie_blocked` error copy.
- **Q-P4** CI runner — GitHub Actions (assumed throughout this plan) or another?
- **Q-P5** For non-Vietnamese locales, use a generic globe icon in the language
  toggle or a country-specific flag (e.g. 🇬🇧)? Design input. Affects `src/icons/`
  contents. The plan defaults to a generic `globe.svg` until answered.

---

## Next Steps

1. **Answer** the open questions listed under *Required Before Start*. For any
   question that blocks a specific task, tag the task rather than block the whole
   plan.
2. **Run** `/momorph.tasks` against this plan to generate the task breakdown
   (`tasks.md`). Expect ~40–60 tasks across Phase 0 → Phase 5.
3. **Review** `tasks.md` for parallelization opportunities — Phase 0 + 1 tasks are
   largely independent and can fan out across the team.
4. **Begin** TDD implementation task by task, marking completed items as `[x]`.

---

## Notes

- This plan intentionally folds constitution alignment (Phase 0) into the Login PR.
  Pulling it forward into a separate PR is *also* acceptable and would let the
  Login PR itself stay smaller — worth considering when `/momorph.tasks` estimates
  size.
- `<LanguageDropdown />` is prototyped inside the `login/` feature folder now; when
  the dedicated `Dropdown-ngôn ngữ` spec is implemented, hoist it to
  `src/components/ui/LanguageDropdown.tsx` and delete the Login-local copy. This
  short-term duplication is intentional (YAGNI — don't extract until a real second
  user appears).
- `/error/403` and `/error/404` pages are created as minimal placeholders in this
  plan. Each will be fully specified by its own frame (`T3e_iS9PCL`, `p0yJ89B-9_`).
  The Login feature only needs them to exist as valid redirect targets.
- The embedded GitHub token in `.mcp.json` MUST be rotated in Phase 0. Do not
  proceed past Phase 0 with that token live.
