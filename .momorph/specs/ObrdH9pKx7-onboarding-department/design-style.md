# Design Style: Onboarding — Complete Profile

**Screen ID**: `ObrdH9pKx7`
**Status**: Derived (no Figma frame — visual choices extend the Login + Thể lệ
style families so the flow feels continuous).
**Created**: 2026-04-22

> This document extends the existing visual system rather than introducing new
> tokens. All colors / radii / shadows referenced here already ship in
> [src/app/globals.css](../../../src/app/globals.css) from prior specs.

---

## 1. Page Background

- Base: `bg-[var(--color-brand-900)]` (same navy as Login / Homepage).
- Optional hero image overlay at 10 % opacity, identical to Login's
  `Rectangle 57` left-side vignette — produces visual continuity from
  `/login` → `/onboarding`.
- No scrollbar on viewport ≥ 640 px (content fits above the fold).

## 2. Layout

Desktop (≥ 1024 px):
```
┌──────────────────────────────────────────┐
│  [SAA Logo]            [Language toggle] │  ← header 80 px tall
│                                          │
│       ┌─────────────────────────────┐    │
│       │   Title (h1, 28px bold)     │    │
│       │                             │    │
│       │   Description paragraph     │    │
│       │   (14/22, muted-grey)       │    │
│       │                             │    │
│       │   ( ◯ avatar )  user@email   │   │  ← account disambiguation row (see §4.0)
│       │                             │    │
│       │   Display name ─────────    │    │
│       │   [ input 56 px tall ]      │    │
│       │                             │    │
│       │   Department ──────────     │    │
│       │   [ select 56 px tall ]     │    │
│       │                             │    │
│       │       [ COMPLETE → ]        │    │
│       │                             │    │
│       │   Không phải bạn? Đăng xuất │   │  ← sign-out link (see §5.1)
│       └─────────────────────────────┘    │
│                                          │
│              © 2025 Sun*                 │  ← footer 56 px tall
└──────────────────────────────────────────┘
```

- Form card width: **520 px** on desktop, **100 %** minus 16 px gutter on
  mobile.
- Form card padding: 40 px (desktop) / 24 px (mobile).
- Card surface: `bg-[var(--color-modal-paper)]` with
  `rounded-2xl shadow-[var(--shadow-kudo-card)]`.

## 3. Typography

| Element | Token / utility | Value |
|---------|-----------------|-------|
| Title (`h1`) | Montserrat 28/36/700, `text-[var(--color-foreground)]` | `text-[28px] leading-9 font-bold` |
| Description paragraph | Montserrat 14/22/500, `text-[var(--color-muted-grey)]` | `text-sm leading-[22px] text-[color:var(--color-muted-grey)]` |
| Field label | Montserrat 16/24/600, `text-[var(--color-foreground)]` | `text-base leading-6 font-semibold` |
| Input value | Montserrat 16/24/500 | `text-base leading-6` |
| Submit label | Montserrat 18/28/700 uppercase | `text-lg leading-7 font-bold uppercase tracking-wide` |
| Error line | Montserrat 13/20/500, `text-[var(--color-error)]` | `text-xs leading-5 mt-2` |

## 4. Inputs

### 4.0 Account disambiguation row (display-only)

Sits directly below the description paragraph, above the first field label.

- Layout: `flex items-center gap-3`.
- Avatar: `<img>` 32 × 32 `rounded-full`, `object-cover`; `alt=""`
  (decorative — email below is the real identifier).
- Avatar fallback (when `avatar_url` is null): rounded filled circle
  `bg-[color:var(--color-accent-cream)]/30 text-[color:var(--color-brand-900)]`,
  centered first letter of `display_name` (upper-cased) in Montserrat
  14/20/700. If `display_name` is also empty, render a single `?`.
- Email: Montserrat 14/20/500, `text-[color:var(--color-muted-grey)]`,
  `truncate` with `title={email}` so long addresses don't overflow.

Row bottom-margin: 16 px before the first field label.

### 4.1 `display_name` text input
- Height: **56 px** (`h-14`).
- Border: `border border-[var(--color-border-secondary)]`.
- Background: white (`bg-white`).
- Radius: `rounded-lg` (8 px).
- Horizontal padding: 16 px.
- Focus: `focus-visible:outline-2 focus-visible:outline-offset-2
  focus-visible:outline-[var(--color-accent-cream)]`.
- Error state: `aria-invalid="true"` → border switches to
  `border-[var(--color-error)]`; error line rendered below.

### 4.2 `department_code` select
For MVP, **native `<select>`** styled to match the text input (same height,
border, radius, focus ring). This keeps the client bundle small and gives us
free keyboard + screen-reader support.

- Right chevron: `<Icon name="chevron-down" size={20} />` positioned via
  `appearance-none` + CSS `background-image` or via absolutely-positioned
  sibling.
- Option list: inherits native UA styling — acceptable for MVP per TR-005.
- Phase-2 upgrade path: swap to a listbox-style combobox if product asks for
  custom option rendering (avatar + VN/EN labels).

### 4.3 Department retry banner (fetch failed)

When the Server Component's `getKudoDepartments()` throws, the select is
replaced with:
- Container: `rounded-lg bg-[color:var(--color-error)]/8 border border-[color:var(--color-error)]/30 p-4`.
- Message: Montserrat 14/20/500, `text-[color:var(--color-error)]`.
- Retry button: secondary outline style `border-[color:var(--color-error)]
  text-[color:var(--color-error)] rounded-md h-10 px-4`; on click,
  re-fetches and replaces itself with the normal select on success.

### 4.4 Empty department list banner

When `getKudoDepartments()` returns `[]`:
- Container: `rounded-lg bg-[color:var(--color-accent-cream)]/10 p-4` above
  the form.
- Text: Montserrat 14/20/500 in `--color-foreground`, copy per spec §Q6.

## 5. Submit button

Reuse `<PrimaryButton size="lg" variant="primary">`:
- Height: **56 px**.
- Fill: `bg-[var(--color-accent-cream)]`.
- Text: `text-[var(--color-brand-900)]`.
- Radius: `rounded-xl` (12 px).
- Disabled: `opacity-60 cursor-not-allowed`.
- Loading: spinner icon + label swap to `onboarding.submit.loading`.

Full-width on mobile; fixed **240 px** min-width on desktop, right-aligned.

### 5.1 Sign-out link (recovery affordance — adopted per spec §Decision Log Q7)

Below the submit button (24 px gap):
- `<form action={signOut} method="post">` wrapping a `<button type="submit">`.
- Text: *"Không phải bạn? Đăng xuất và thử lại"* / *"Not you? Sign out and try again"*.
- Style: Montserrat 13/20/500 underline, `text-[color:var(--color-muted-grey)]`
  with `hover:text-[color:var(--color-accent-cream)]`.
- Focus ring: standard 2 px cream outline.

## 6. Error banner

When `errors.submit` is set:
- Rendered at the **top** of the form card (above the first label).
- `role="alert"` `aria-live="assertive"`.
- Background: `bg-[var(--color-error)]/8`.
- Border-left: 4 px solid `var(--color-error)`.
- Padding: 12 × 16.
- Text: `text-[var(--color-error)]` 14/20/500.
- Auto-focused on mount (`tabIndex={-1}` + `.focus()` on first render).

## 7. States table

| Field | Default | Focus | Filled + valid | Error | Disabled |
|-------|---------|-------|----------------|-------|----------|
| Display name | white bg, olive border | cream outline 2 px | same as default | red border + error line below | `bg-muted-grey/10` + border `muted-grey/40` |
| Department select | white bg, olive border, chevron | cream outline 2 px | value shows code + localized label | red border + error line below | same as display_name |
| Submit | cream fill + brand-900 text | 2 px cream outline offset 2 | — | — (never red) | 60 % opacity |

## 8. Spacing

- Header → card: 48 px (desktop) / 24 px (mobile).
- Card padding: 40 px (desktop) / 24 px (mobile).
- Field row gap (label → input): 8 px.
- Between field rows: 24 px.
- Input → submit: 40 px.

## 9. Motion

- None. No hero animation, no skeleton, no focus transition except the default
  `outline` ring from Tailwind's `focus-visible` utility.
- Spinner on submit: reuse the existing `<Icon name="spinner" className="animate-spin" />`
  (already used in Login CTA).
- No `prefers-reduced-motion` branch needed (nothing to disable).

## 10. Responsive breakpoints

| Breakpoint | Card width | Card padding | Header padding | Submit width |
|------------|------------|--------------|----------------|--------------|
| < 640 px   | `w-full`   | 24 px        | 16 px          | `w-full`      |
| 640–1023   | 480 px     | 32 px        | 24 px          | 240 px min    |
| ≥ 1024 px  | 520 px     | 40 px        | 32 px          | 240 px min    |

## 11. Implementation mapping

| Element | Component | File |
|---------|-----------|------|
| Page | `OnboardingPage` (Server Component) | `src/app/onboarding/page.tsx` (NEW) |
| Layout | Minimal layout extending the public / login layout | `src/app/onboarding/layout.tsx` (NEW) |
| Form | `OnboardingForm` (Client Component) | `src/components/onboarding/OnboardingForm.tsx` (NEW) |
| Submit CTA | `PrimaryButton` (reuse) | `src/components/ui/PrimaryButton.tsx` (existing) |
| Server Action | `completeOnboarding` | `src/app/onboarding/actions.ts` (NEW) |
| Analytics event | `onboarding_complete` | `src/libs/analytics/track.ts` (extend `TrackEvent` union) |

## 12. No new design tokens

Verified pass: every color / radius / shadow / font-family referenced above
already exists in the CSS custom-property layer. If implementation finds a gap
during TDD, update this section with the new token and raise it to the
constitution channel.
