# Implementation Plan: Floating Action Button (expanded menu)

**Frame**: `Sv7DFwBw1h-fab-quick-actions`
**Date**: 2026-04-20
**Spec**: [`spec.md`](./spec.md)

---

## Pointer

This frame's implementation is planned jointly with the collapsed
trigger (`_hphd32jN2`) because they are two phases of a single
`<QuickActionsFab>` component.

**Canonical plan** — [`../_hphd32jN2-fab-collapsed/plan.md`](../_hphd32jN2-fab-collapsed/plan.md).

Everything below this pointer lives there:

- Constitution compliance matrix
- Architecture decisions (state model, file split, styling, focus
  behaviour, routing / navigation)
- Project structure (new `src/components/shell/` folder,
  `QuickActionsFabHost` server-component wrapper, 3 new CSS tokens,
  4 new `common.fab.*` i18n keys, deletion of the old
  `components/homepage/QuickActionsFab.tsx`)
- Phased implementation strategy (0 → 6)
- Risk assessment + complexity estimate
- Integration + a11y + E2E testing strategy
- Open questions (4 Design, 1 Marketing, 2 Technical)
- Next steps (`/momorph.tasks` → single bundled `tasks.md`)

**Do not duplicate content here**. If this plan and the canonical plan
disagree, the canonical plan wins; update it and discard any
contradictions here.
