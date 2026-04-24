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

supabase/migrations/       # 22 migrations (0001 → 0022)
scripts/                   # Seeders + CI guards
.momorph/                  # Specs, plans, design styles, schema context
tests/ + *__tests__/       # Vitest + Playwright
```

## Database

Single-file snapshot of the current schema — 10 tables + 1 view + 5 functions + 3 triggers + 22 RLS policies + Supabase Storage bucket + policies:

- [.momorph/contexts/database-schema.sql](.momorph/contexts/database-schema.sql) — consolidated DDL (state after all 22 migrations)
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

## Deployment (Cloudflare Workers)

The app ships to Cloudflare Workers via [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare). Config lives in [wrangler.toml](wrangler.toml) + [.env.production.local](#) (gitignored) + Cloudflare Worker secrets.

### First-time setup

1. **Cloudflare account + Wrangler login**
   ```sh
   npx wrangler login         # OAuth into your CF account
   npx wrangler whoami        # verify
   ```

2. **Register your `workers.dev` subdomain** (one-time, per account)
   Dashboard → *Workers & Pages* → *Overview* → "Your subdomain" → set e.g. `yourname`. Must be globally unique; if taken, pick another.

3. **Create `.env.production.local`** (gitignored) with client-facing env vars baked into the production bundle at build time:
   ```env
   NEXT_PUBLIC_SITE_URL=https://agentic-coding-saa-2025.<your-subdomain>.workers.dev
   NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   NEXT_PUBLIC_SITE_LAUNCH_AT=2026-04-22T00:00:00Z
   NEXT_PUBLIC_CEREMONY_AT=2026-05-05T11:30:00Z
   ```
   > ⚠️ `NEXT_PUBLIC_*` vars are **inlined at build time** — they must live in `.env.production.local`, NOT `wrangler.toml [vars]` (which only affect server runtime).

4. **Set server-runtime vars** (already in [wrangler.toml](wrangler.toml)): `ALLOWED_EMAIL_DOMAINS` is committed; the service role key is a secret:
   ```sh
   npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
   # Paste the Supabase "service_role" key (NOT anon). Wrangler will offer
   # to create the Worker if it doesn't exist yet — answer "y".
   ```
   Verify: `npx wrangler secret list`

5. **Register Supabase Auth Redirect URLs**
   Supabase Dashboard → *Authentication* → *URL Configuration*:
   - **Site URL**: `https://agentic-coding-saa-2025.<your-subdomain>.workers.dev`
   - **Redirect URLs** (allow-list, add BOTH for dev + prod to work):
     ```
     http://localhost:3000/auth/callback
     https://agentic-coding-saa-2025.<your-subdomain>.workers.dev/auth/callback
     ```


### Deploy

```sh
yarn cf:build              # next build → opennextjs-cloudflare build → .open-next/worker.js
yarn cf:preview            # (optional) test locally at http://localhost:8787
yarn cf:deploy             # upload + activate
```

Deploy output includes the public URL — smoke-test the login flow + `/kudos` feed + image upload there before announcing.

https://agentic-coding-saa-2025.vuvanhanh.workers.dev/kudos

### Observability

```sh
npx wrangler tail                  # stream live logs (runtime errors, console.log)
npx wrangler deployments list      # deployment history
npx wrangler rollback              # rollback to previous version if a deploy breaks prod
```

### Redeploying after env changes

| What changed | Steps |
|---|---|
| `NEXT_PUBLIC_*` in `.env.production.local` | `yarn cf:build && yarn cf:deploy` |
| `[vars]` in `wrangler.toml` (server-runtime only) | `yarn cf:deploy` (no rebuild needed) |
| Secret via `wrangler secret put` | Immediate — applied to currently-deployed worker |
| App code | `yarn cf:build && yarn cf:deploy` |

### Troubleshooting

| Symptom | Fix |
|---|---|
| Login → `redirect_uri_mismatch` | Step 5 missing — add Workers URL to Supabase Redirect URLs |
| Countdown shows wrong date after redeploy | Client-baked at build — update `.env.production.local` then rebuild (NOT wrangler.toml) |
| 500 "Invalid API key" in `wrangler tail` | `wrangler secret put SUPABASE_SERVICE_ROLE_KEY` — paste the real `service_role` key |
| `Node.js middleware is not currently supported` during build | Use `src/middleware.ts` (Edge runtime) — not `src/proxy.ts` (Node); OpenNext only supports the former |
| Wrangler prompts for subdomain during deploy | Register it via Dashboard first (step 2) — CLI prompt is glitchy |

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
