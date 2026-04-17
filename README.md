# Sun Annual Awards 2025

Internal web app for SAA 2025, built with Next.js 16 + Supabase Auth + Cloudflare
Workers. See [AGENTS.md](AGENTS.md) for the MoMorph agent workflow and
[.momorph/constitution.md](.momorph/constitution.md) for the tech-stack non-negotiables.

## Quick start

```bash
# Prerequisites: Node 22 LTS (Node 25 works but needs NODE_EXTRA_CA_CERTS
# workaround, see "Node CA workaround" below), Yarn v1.22.x, Supabase CLI (optional).

yarn install
cp .env.example .env.local
# Edit .env.local with your Supabase project URL + anon key.
yarn dev                  # http://localhost:3000/login
```

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
| `make check` | Runs lint + typecheck + test (pre-push gate) |

## Documentation

- [docs/auth.md](docs/auth.md) — OAuth flow, allow-list management, Supabase key rotation
- [.momorph/specs/](.momorph/specs/) — per-screen specs + design style + plans

## Scripts in `scripts/`

- `scripts/check-bundle-size.mjs` — fails CI if any route exceeds its gzipped
  bundle budget (spec TR-010).
- `scripts/check-bundle-secrets.mjs` — fails CI if server-only secret names
  leak into the client bundle (spec SC-006).

Run after `yarn build`:

```sh
node scripts/check-bundle-size.mjs
node scripts/check-bundle-secrets.mjs
```

## Analytics dashboard (SC-004 prerequisite)

Once an analytics vendor is chosen, build a dashboard showing:

- **`login_attempt` rate** per minute (granularity: hourly buckets for weekly view).
- **`login_error` rate** grouped by `error_code` (`access_denied`, `network`,
  `session_exchange_failed`, `cookie_blocked`).
- **Error ratio** = `login_error / login_attempt` — SC-004 target: < 2% after the
  first 2 weeks, excluding deliberate `access_denied`.
- **`language_change` events** per day — sanity check that US3 is being used.

The events are already emitted from
[src/libs/analytics/track.ts](src/libs/analytics/track.ts). Swap the sinks
(currently `window.dataLayer` on the client, stdout JSON on the server) for your
vendor of choice.

## Node CA workaround

Node 25.6.x ships a CA bundle missing the Google Trust Services root R1, which
breaks TLS handshakes with npm/yarn registries and Supabase. Either downgrade to
Node 22 LTS, or prefix commands with:

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
