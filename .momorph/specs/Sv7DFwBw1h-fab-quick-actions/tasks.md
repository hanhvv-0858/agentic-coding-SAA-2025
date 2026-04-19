# Tasks: Floating Action Button (expanded menu)

**Frame**: `Sv7DFwBw1h-fab-quick-actions`
**Created**: 2026-04-20

---

## Pointer

This frame ships as part of a **bundled implementation** with the
collapsed trigger (`_hphd32jN2`) — they are two states of one
`<QuickActionsFab>` component.

**Canonical task list** — [`../_hphd32jN2-fab-collapsed/tasks.md`](../_hphd32jN2-fab-collapsed/tasks.md).

All 36 tasks (Phases 1–8) covering both frames live there, including:

- **US1 (P1 MVP)** — happy-path open/navigate/close, trigger ↔ menu
  mutual exclusion; the 3 menu tiles (Thể lệ, Viết KUDOS, Cancel) with
  composite shadow and navigation wiring.
- **US2 (P2)** — keyboard open/close + focus trap + focus restore.
- **US3 (P2)** — outside-click dismissal.
- **US4 (P2)** — a11y polish + branded shadow glow + axe-core sweep.
- **US5 (P3)** — reduced-motion compliance.
- **Polish** — analytics reservations, SCREENFLOW update, PR description.

This frame's FRs (FR-001–FR-012 in its own `spec.md`) map onto the
canonical task list via the consolidation table at the top of
[canonical tasks.md](../_hphd32jN2-fab-collapsed/tasks.md#user-story-consolidation).

**Do not duplicate task content here**. If this file and the canonical
file disagree, the canonical file wins.
