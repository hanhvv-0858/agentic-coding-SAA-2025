# Screen: Countdown - Prelaunch page

## Screen Info

| Property | Value |
|----------|-------|
| **Figma Frame ID** | `8PJQswPZmU` |
| **MoMorph Link** | https://momorph.ai/files/9ypp4enmFmdK3YAFJLIu6C/screens/8PJQswPZmU |
| **Figma Node ID** | `2268:35127` |
| **Screen Group** | Core App (pre-launch / marketing) |
| **Status** | discovered |
| **Discovered At** | 2026-04-19 |
| **Last Updated** | 2026-04-19 |

---

## Description

Pre-launch landing page that gates the SAA 2025 site before the official
event open. Renders a full-bleed cover (background image + dark cover
overlay) with a centered LED-style countdown to the launch moment showing
**DAYS / HOURS / MINUTES** (no seconds in the design). Above the timer is
a single text label ("Awards Information Navigation Links" per node name —
the literal copy is the prelaunch headline; treat the node name as
boilerplate, not the visible string). No interactive controls, no header,
no footer, no language toggle inside the frame.

Functional behavior derived from the per-unit design specs:
- **Days** — auto-updating remaining days; shows `00` when < 1 day.
- **Hours** — range `00`–`23`.
- **Minutes** — range `00`–`59`.
- All three units use a 2-digit LED tile pair (`Rectangle 1` background +
  digit `TEXT`), shared `Group 4` / `Group 5` instances → one reusable
  `<LedDigit />` atom.

---

## Navigation Analysis

### Incoming Navigations (From)

| Source Screen | Trigger | Condition |
|---------------|---------|-----------|
| Direct URL / app shell | auto | When `now < EVENT_LAUNCH_AT` (or feature flag `prelaunch=on`). Likely served at `/` (replacing Homepage SAA) or `/countdown` until launch. |
| Homepage SAA | link (informational) | Tagged in SCREENFLOW navigation graph as `Home → Countdown`; verify whether Home links to it pre-launch or whether Countdown *replaces* Home. |

### Outgoing Navigations (To)

| Target Screen | Trigger Element | Node ID | Confidence | Notes |
|---------------|-----------------|---------|------------|-------|
| — | (none in frame) | — | — | No buttons, links, or interactive nodes in the node tree. The timer reaching 00:00:00 is expected to auto-redirect to `Homepage SAA` (`i87tDx10uM`), but that transition is **not** modelled in the Figma frame and must be confirmed with Product. |

### Navigation Rules
- **Back behavior**: N/A (no app chrome rendered).
- **Deep link support**: Yes — pre-launch should be reachable at a stable
  URL (e.g. `/`); needs Product confirmation.
- **Auth required**: **Open question.** Login currently sits in front of
  every authenticated screen, but a prelaunch page is typically public.
  Decision pending — see Open Questions.

---

## Component Schema

### Layout Structure

```
┌─────────────────────────────────────────────┐
│                                              │
│           MM_MEDIA_BG Image (full bleed)    │
│           + Cover (dark gradient overlay)    │
│                                              │
│         ┌──────────────────────────┐         │
│         │  Headline / event tag    │         │
│         │                          │         │
│         │   ┌──┐┌──┐ ┌──┐┌──┐ ┌──┐┌──┐     │
│         │   │ 0││ 0│ │ 0││ 0│ │ 0││ 0│     │
│         │   └──┘└──┘ └──┘└──┘ └──┘└──┘     │
│         │    DAYS    HOURS    MINUTES       │
│         └──────────────────────────┘         │
│                                              │
└─────────────────────────────────────────────┘
```

### Component Hierarchy

```
Screen (Bìa)
├── BackgroundLayer
│   ├── MM_MEDIA_BG Image (Atom — RECTANGLE filled with media)
│   └── Cover (Atom — dark overlay rectangle)
└── Frame 487 (centering wrapper)
    └── Frame 523
        └── CountdownBlock (Organism — node "Countdown time")
            ├── Headline (Atom — TEXT, node "Awards Information Navigation Links")
            └── TimeRow (Molecule — node "Time")
                ├── DaysUnit  (Molecule — "1_Days")
                │   ├── LedDigit ×2 (instances of Group 5 / Group 4)
                │   └── Label "DAYS" (Atom)
                ├── HoursUnit (Molecule — "2_Hours")
                │   ├── LedDigit ×2
                │   └── Label "HOURS"
                └── MinutesUnit (Molecule — "3_Minutes")
                    ├── LedDigit ×2
                    └── Label "MINUTES"
```

### Main Components

| Component | Type | Node ID | Description | Reusable |
|-----------|------|---------|-------------|----------|
| BackgroundLayer | Organism | `2268:35129` + `2268:35130` | Full-bleed media + dark overlay | Yes — pattern reused on Login hero |
| CountdownBlock | Organism | `2268:35136` | Headline + 3-unit timer wrapper | Yes — already used on Homepage SAA hero per earlier discovery |
| TimeRow | Molecule | `2268:35138` | Horizontal row of D/H/M units | Yes |
| CountdownUnit (Days/Hours/Minutes) | Molecule | `2268:35139` / `:35144` / `:35149` | 2-digit LED + caption label | Yes — single component parameterised by `unit` and `value` |
| LedDigit | Atom | instances of `Group 5` / `Group 4` (`186:2616/2617`) | Single 2-digit LED tile (rectangle + numeric text) | Yes |

---

## Reuse with Existing Codebase

The Homepage SAA implementation already shipped a hero countdown
(`src/components/home/...` per recent commit `0823b46 Feature/Homepage-SAA`).
That component was built around the exact same DAYS / HOURS / MINUTES /
SECONDS pattern using `Courier New` tabular-nums as the LED fallback.

**Reuse plan for this screen:**
- Lift the existing `CountdownTimer` / LED-tile primitives out of the
  Homepage hero into `src/components/countdown/` as shared atoms
  (`<LedDigit />`, `<CountdownUnit />`, `<CountdownTimer />`).
- This screen consumes them with `units={["days","hours","minutes"]}`
  (no seconds) inside a fullscreen `<PrelaunchCover />` page wrapper.
- Background uses the same media-overlay pattern as the Login hero —
  reuse the cover/overlay token from `globals.css`.

---

## Form Fields

N/A — read-only screen, no forms.

---

## API Mapping

### On Screen Load

| API | Method | Purpose | Response Usage |
|-----|--------|---------|----------------|
| (config) `EVENT_LAUNCH_AT` | env / Server Component constant | Source of truth for the target timestamp | Diff against `Date.now()` to compute remaining D/H/M |
| `/auth/session` (Supabase SSR) | GET | Only if auth-gated (TBD) | Redirect logic |

No bespoke API call required for MVP — the launch timestamp can ship as
an environment variable or Server Component constant, matching the
Homepage hero's existing approach.

### On User Action

N/A — no interactive elements in the frame.

### Error Handling

| Error Code | Message | UI Action |
|------------|---------|-----------|
| Timestamp in past | — | Redirect to Homepage SAA (`/`) on the server before render |
| Clock skew (client < server) | — | Trust the server-rendered initial values; client tick only decrements |

---

## State Management

### Local State

| State | Type | Initial | Purpose |
|-------|------|---------|---------|
| remainingMs | number | `EVENT_LAUNCH_AT - Date.now()` (computed once on mount) | Drives the visible D/H/M values |
| tickIntervalId | number \| null | null | `setInterval(..., 1000)` handle; cleared on unmount and on reaching 0 |
| isLaunched | boolean | `remainingMs <= 0` | Triggers auto-redirect to Homepage |

### Global State

None.

---

## UI States

### Loading State
- N/A — Server Component renders the initial countdown values; no spinner
  needed. First paint already shows the correct numbers.

### Error State
- If `EVENT_LAUNCH_AT` is missing/invalid → fall back to redirect to
  `Homepage SAA` and log a server-side warning (no user-facing error).

### Success State
- When countdown hits `00:00:00` → auto-redirect to `Homepage SAA` (`/`).
  Confirm with Product whether the redirect is automatic or whether the
  page should switch to a "Launching now" celebratory state.

### Empty State
- N/A.

---

## Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Live region | Wrap countdown in `aria-live="polite"` so SR users hear minute updates without being spammed (announce minutes only, not seconds — also matches the visible granularity). |
| Reduced motion | No animation in this frame; if a tick animation is added later, gate behind `prefers-reduced-motion: no-preference`. |
| Color contrast | LED digits on dark cover must hit WCAG AA (≥ 4.5 : 1 on body text — verify against the dark overlay). |
| Semantic structure | Headline as `<h1>`; D/H/M groups labelled via `<dl>` or `aria-label="2 days"` per unit so the value + unit reads naturally. |
| Keyboard | No focusable elements — page is purely informational. |

---

## Responsive Behavior

| Breakpoint | Layout Changes |
|------------|----------------|
| Mobile (<768px) | Stack: shrink LED tile size (e.g. 48 px) and keep the 3 units on a single row. If still overflowing, wrap to two lines (Days / Hours-Minutes). |
| Tablet (768–1024px) | Single row, mid-size tiles. |
| Desktop (≥1024px) | Figma reference layout — fullscreen cover, large LED tiles centered. |

---

## Design Tokens

Carry over the Homepage hero tokens (no new tokens needed for MVP):
- LED face colour, LED background, label text colour — reuse hero values.
- Cover overlay: extend existing `--color-panel-surface` / use the Login
  hero's gradient.
- Typography: tabular-nums fallback (`Courier New`) until the real
  Digital Numbers font ships.

---

## Implementation Notes

### Dependencies
- No new packages — uses the same primitives as the Homepage SAA hero.

### Special Considerations
- **Hydration**: Render the initial countdown server-side from a stable
  timestamp (not `Date.now()` directly inside the Server Component) to
  avoid hydration mismatches; the client effect then takes over the
  ticking.
- **Server vs. client clock**: The decrement loop runs on the client; a
  manipulated client clock would change visible numbers but does **not**
  unlock anything (auth/redirect is server-enforced).
- **Routing decision pending**: Either (a) make `/` conditionally render
  Countdown vs. Homepage based on `EVENT_LAUNCH_AT`, or (b) ship as
  `/countdown` and add a middleware gate that redirects `/` → `/countdown`
  pre-launch. Pick one in `momorph.specify`.

---

## Open Questions

1. Is the prelaunch page **public** (no Supabase session required) or does
   it sit behind login? Affects routing + middleware.
2. Does the screen **replace** Homepage SAA pre-launch, or is it a
   separate `/countdown` route linked from Home?
3. What is the launch timestamp source — env var, Supabase config row, or
   admin-editable campaign in the future Admin area?
4. The frame shows D/H/M only (no Seconds), but the Homepage SAA hero
   ships D/H/M/S. Confirm the prelaunch design is intentional or whether
   Seconds should be added for parity.
5. Behavior at `T-0`: hard redirect to `/`, soft state swap, or
   celebratory "We're live!" state?
6. Headline copy — the node name `"Awards Information Navigation Links"`
   is clearly placeholder boilerplate; need real i18n key + vi/en strings
   from Product.
7. Background image asset — same hero media as Homepage or a unique
   prelaunch key visual?

---

## Analysis Metadata

| Property | Value |
|----------|-------|
| Analyzed By | Screen Flow Discovery (`momorph.screenflow`) |
| Analysis Date | 2026-04-19 |
| Needs Deep Analysis | Yes — for `momorph.specify` (run next) |
| Confidence Score | High on layout/components; Medium on routing & launch behaviour pending Product input |

### Next Steps
- [ ] Run `momorph.specify 8PJQswPZmU` to draft `spec.md` + `design-style.md`.
- [ ] Resolve the 7 open questions above with Product before planning.
- [ ] Decide on `<CountdownTimer />` extraction location (shared between
      Homepage hero and this screen).
