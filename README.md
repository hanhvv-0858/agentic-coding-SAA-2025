# Sun\* Annual Awards 2025

Internal web app for the **Sun\* Annual Awards 2025** — a company-wide peer-recognition platform built around a real-time **Kudos Live Board**, anonymous-capable composer, Secret Box gamification, and an awards gallery. Generated screen-by-screen with the [MoMorph](AGENTS.md) spec → plan → tasks → implement workflow.

> See [AGENTS.md](AGENTS.md) for the MoMorph agent commands and
> [.momorph/constitution.md](.momorph/constitution.md) for tech-stack non-negotiables.

## Features

| Area | What it does | Key routes / specs |
|---|---|---|
| **Kudos Live Board** | Real-time word-cloud of recipients, live activity feed (6 most recent), pan/zoom + roving-tabindex keyboard nav, highlight carousel with honour/profile tooltips | [`/kudos`](src/app/kudos) · [spec](.momorph/specs/MaZUn5xHXZ-kudos-live-board) |
| **Viết Kudo (composer)** | Write a kudo: recipient picker, 1–5 hashtags, up to 5 images (Supabase Storage), optional anonymous alias | [`/kudos/new`](src/app/kudos) · [spec](.momorph/specs/ihQ26W78P2-viet-kudo) |
| **Onboarding gate** | Post-Google-OAuth gate that collects `display_name` + `department` when missing from the profile | [`/onboarding`](src/app/onboarding) · [spec](.momorph/specs/ObrdH9pKx7-onboarding-department) |
| **Hashtag filter** | Dropdown to filter the feed by the 13 canonical Sun\* Q4 2025 hashtags (bilingual labels) | [spec](.momorph/specs/JWpsISMAaM-dropdown-hashtag-filter) |
| **Awards system** | Static awards gallery — MVP, Top Talent, Best Manager, etc. | [`/awards`](src/app/awards) · [spec](.momorph/specs/zFYDgyj_pD-awards-system) |
| **Thể lệ & Countdown** | Rules page + event countdown widget | [`/the-le`](src/app/the-le) · [`/countdown`](src/app/countdown) |
| **Auth** | Google OAuth via Supabase SSR; server-side allow-list of Sun\* email domains | [`/auth`](src/app/auth) · [docs/auth.md](docs/auth.md) |

## Tech stack

- **Next.js 16** (App Router, Server Actions, Server Components) on **React 19**
- **TypeScript 5** strict, **Tailwind CSS 4**, **Montserrat** + **Pacifico** display
- **Supabase** (Postgres + RLS + Auth + Storage) via `@supabase/ssr`
- **Cloudflare Workers** deploy target via `@opennextjs/cloudflare` + **Wrangler 4**
- **Vitest 4** (unit + component) · **Playwright 1** (E2E)

## Quick start

```bash
# Prerequisites: Node 22 LTS (Node 25 needs the CA workaround below),
# Yarn v1.22.x, Supabase CLI (optional).

yarn install
cp .env.example .env.local
# Edit .env.local with your Supabase project URL + anon key + service role.
yarn dev                  # http://localhost:3000/login
```

To populate demo data (58 Sunners with weighted kudos counts, gift redemptions, and Secret Boxes):

```bash
yarn tsx scripts/seed-kudos-fixtures.ts
```

The seeder is idempotent — re-running skips rows that already exist.

## Project structure

```
src/
├── app/                   # Next.js App Router (routes + Server Actions)
│   ├── (public)/          # login, error
│   ├── admin/
│   ├── auth/              # OAuth callback + sign-out
│   ├── awards/
│   ├── countdown/
│   ├── kudos/             # Live board, composer, actions.ts
│   ├── onboarding/        # Department + display_name gate
│   ├── profile/
│   ├── standards/
│   └── the-le/
├── components/
│   ├── kudos/             # SpotlightBoard, HighlightKudoCard, composer, tooltips
│   ├── layout/
│   └── ui/                # Icon, buttons, InlineError, EmptyState
├── libs/
│   ├── analytics/         # track() — vendor-agnostic event sink
│   ├── auth/              # Supabase SSR helpers + allow-list
│   ├── i18n/              # getMessages() — vi + en
│   └── kudos/             # Shared kudo formatters
├── messages/              # vi.json + en.json
└── types/

supabase/migrations/       # 21 migrations (0001 → 0021)
scripts/                   # Seeders + CI guards
.momorph/                  # Specs, plans, design styles, schema context
tests/ + *__tests__/       # Vitest + Playwright
```

## Database

Single-file snapshot of the current schema — 10 tables + 1 view + 5 functions + 3 triggers + 22 RLS policies + Supabase Storage bucket + policies:

- [.momorph/contexts/database-schema.sql](.momorph/contexts/database-schema.sql) — consolidated DDL (state after all 21 migrations)
- [.momorph/contexts/DATABASE_DESIGN.mmd](.momorph/contexts/DATABASE_DESIGN.mmd) — Mermaid ERD (preview in VSCode with *Markdown Preview Mermaid Support*)

Replayable migration history lives under [supabase/migrations/](supabase/migrations/).

## Scripts

| Command | Purpose |
|---|---|
| `yarn dev` | Next.js dev server with Turbopack |
| `yarn build` | Production build |
| `yarn test` | Vitest (watch mode) |
| `yarn test:run` | Vitest one-shot for CI |
| `yarn e2e` | Playwright against a running dev server |
| `yarn lint` | ESLint (flat config, Next.js + jsx-a11y) |
| `yarn typecheck` | `tsc --noEmit` |
| `yarn analyze` | Bundle analyzer (`ANALYZE=true next build`) |
| `yarn tsx scripts/seed-kudos-fixtures.ts` | Idempotent demo-data seeder |
| `make check` | Runs lint + typecheck + test (pre-push gate) |

### CI guards

Run after `yarn build`:

```sh
node scripts/check-bundle-size.mjs      # fails CI if any route exceeds its gzipped budget (TR-010)
node scripts/check-bundle-secrets.mjs   # fails CI if server-only secret names leak into the client bundle (SC-006)
```

## Documentation

- [AGENTS.md](AGENTS.md) — MoMorph agent command reference
- [.momorph/constitution.md](.momorph/constitution.md) — Tech-stack + coding standards
- [.momorph/specs/](.momorph/specs/) — Per-screen specs + design-style + plan + tasks (the source of truth for every feature)
- [.momorph/contexts/](.momorph/contexts/) — DB schema, ERD, screen flow summaries
- [docs/auth.md](docs/auth.md) — OAuth flow, allow-list management, Supabase key rotation

## Analytics dashboard (SC-004 prerequisite)

Once an analytics vendor is chosen, build a dashboard showing:

- **`login_attempt`** rate per minute (hourly buckets for the weekly view).
- **`login_error`** rate grouped by `error_code` (`access_denied`, `network`, `session_exchange_failed`, `cookie_blocked`).
- **Error ratio** = `login_error / login_attempt` — SC-004 target: < 2 % after the first 2 weeks, excluding deliberate `access_denied`.
- **`language_change`** events per day — sanity check that the locale toggle is being used.
- **`kudos_spotlight_pan`** events per session — Spotlight board engagement.

Events are emitted from [src/libs/analytics/track.ts](src/libs/analytics/track.ts). Swap the sinks (currently `window.dataLayer` on the client, stdout JSON on the server) for your vendor of choice.

## Node CA workaround

Node 25.6.x ships a CA bundle missing the Google Trust Services root R1, which breaks TLS handshakes with npm/yarn registries and Supabase. Either downgrade to Node 22 LTS, or prefix commands with:

```sh
NODE_EXTRA_CA_CERTS=/tmp/node-ca/system-roots.pem yarn install
```

Generate the cert bundle once:

```sh
mkdir -p /tmp/node-ca
security find-certificate -a -p \
  /System/Library/Keychains/SystemRootCertificates.keychain \
  > /tmp/node-ca/system-roots.pem
```
