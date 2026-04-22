# Patch — Env var split (2026-04-22)

Supersedes references to `NEXT_PUBLIC_EVENT_START_AT` across this spec with
the new `NEXT_PUBLIC_SITE_LAUNCH_AT` (mốc A — site open). Sibling countdown
on Homepage hero ([i87tDx10uM-homepage-saa](../i87tDx10uM-homepage-saa/spec.md))
tracks `NEXT_PUBLIC_CEREMONY_AT` (mốc B — ceremony). Both independent.

## Decisions (from `/momorph.reviewspecify` 2026-04-22)

- **Q1** — Two distinct targets, independent semantics. ✅
- **Q2** — Validation: **fail-at-boot** if `SITE_LAUNCH_AT > CEREMONY_AT`
  (Zod `.refine()` in `src/libs/env/client.ts`).
- **Q3** — Independent env vars; when missing → "not valid" fallback
  (no gate / no countdown). **No cross-fallback**.
- **Q4** — No other phase countdowns needed (kudo deadline / voting close
  explicitly out of scope).

## Constitution compliance

No amendment needed. Existing rules cover:
- §IV Secrets — `NEXT_PUBLIC_*` prefix ✅
- §Environment Management — `.env.example` template maintained ✅

## Implementation task status

| # | Task                                                                | Status |
| - | ------------------------------------------------------------------- | ------ |
| 1 | Rename env var in Zod schema + add `.refine()` pairing invariant    | ✅ done |
| 2 | `src/proxy.ts` → `NEXT_PUBLIC_SITE_LAUNCH_AT`                       | ✅ done |
| 3 | `src/app/countdown/page.tsx` → `NEXT_PUBLIC_SITE_LAUNCH_AT`         | ✅ done |
| 4 | `.env.example` — 2 new var entries with docstring                   | ✅ done |
| 5 | e2e test skip-messages updated                                      | ✅ done |
| 6 | Spec body text sed-replace `EVENT_START_AT` → `SITE_LAUNCH_AT`      | ✅ done |
| 7 | Cross-ref note added at top of spec.md                              | ✅ done |
| 8 | `.momorph/contexts/screen_specs/SCREENFLOW.md` Pre-launch routing   | ✅ done |
| 9 | `MaZUn5xHXZ-kudos-live-board/DEPLOY.md` env table                    | ✅ done |

All TypeScript checks pass (only pre-existing `honorific` error remains, unrelated).

## Migration path for developers / CI

Developers MUST update their local `.env.local` file:

```bash
# Remove
NEXT_PUBLIC_EVENT_START_AT=...

# Add two independent vars
NEXT_PUBLIC_SITE_LAUNCH_AT=2026-04-23T00:00:00Z   # site opens — mốc A
NEXT_PUBLIC_CEREMONY_AT=2026-04-24T11:30:00Z       # ceremony — mốc B
```

Cloudflare deployment (production / staging): set the two new vars in
Wrangler env / dashboard; remove the old one.

## Verification (manual)

1. Set `NEXT_PUBLIC_SITE_LAUNCH_AT` to a future time → `/` rewrites to
   `/countdown` (URL stays `/`), Prelaunch page renders.
2. Set `NEXT_PUBLIC_CEREMONY_AT` to a future time (≥ SITE_LAUNCH) → after
   logging in, Homepage hero shows countdown with subtitle "Coming soon".
3. Invert `SITE_LAUNCH_AT > CEREMONY_AT` → Next.js dev server crashes at
   boot with the `.refine()` error message.
4. Unset `SITE_LAUNCH_AT` → `/` is always open (no rewrite to `/countdown`).
5. Unset `CEREMONY_AT` → Homepage hero falls back (no countdown tiles, no
   subtitle).
