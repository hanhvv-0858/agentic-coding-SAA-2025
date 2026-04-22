# Patch — Env var split (2026-04-22)

Supersedes references to `NEXT_PUBLIC_EVENT_START_AT` across this spec with
the new `NEXT_PUBLIC_CEREMONY_AT` (mốc B — awards ceremony gala). Sibling
Prelaunch page ([8PJQswPZmU-countdown](../8PJQswPZmU-countdown/spec.md))
tracks `NEXT_PUBLIC_SITE_LAUNCH_AT` (mốc A — site open).

See the parent patch document
([8PJQswPZmU-countdown/patch-env-split.md](../8PJQswPZmU-countdown/patch-env-split.md))
for the full decision log (Q1–Q4), constitution compliance, migration path,
and verification steps. This file only captures the deltas specific to the
Homepage spec.

## Deltas inside Homepage spec

1. **Hero countdown** reads `NEXT_PUBLIC_CEREMONY_AT` instead of the old
   event-start var. The `<Countdown>` component + `<ComingSoonLabel>` are
   both driven by this single prop coming from the Hero Server Component.
2. **Subtitle hide-on-launch** (FR-002): when `hasLaunched === true` from
   `useCountdown(NEXT_PUBLIC_CEREMONY_AT)`, the "Coming soon" `<p>` is
   conditionally removed — implemented in
   [`src/components/homepage/ComingSoonLabel.tsx`](../../../src/components/homepage/ComingSoonLabel.tsx)
   (new, 2026-04-22).
3. **Invariant with SITE_LAUNCH**: spec assumes `CEREMONY_AT >= SITE_LAUNCH_AT`;
   Zod `.refine()` enforces. No spec scenarios depend on the ordering, so
   no acceptance-scenario updates needed.

## Implementation task status

| # | Task                                                                | Status |
| - | ------------------------------------------------------------------- | ------ |
| 1 | `HeroSection.tsx` → `NEXT_PUBLIC_CEREMONY_AT`                       | ✅ done |
| 2 | `ComingSoonLabel.tsx` (new) — hides on launch                       | ✅ done (earlier) |
| 3 | Spec body text sed-replace                                          | ✅ done |
| 4 | Cross-ref note added at top of spec.md                              | ✅ done |

## Verification

Same as the parent patch's Manual Verification §. For this spec specifically,
run: log in as a test user → Homepage loads → assert countdown tiles render
Days/Hours/Minutes values that match `CEREMONY_AT - Date.now()` to the
nearest minute, subtitle "Coming soon" visible. Then fast-forward the
`CEREMONY_AT` env to a past time, reload: tiles display `00/00/00`, subtitle
is gone.
