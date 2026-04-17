<!--
Sync Impact Report
- Version change: 1.0.0 -> 1.1.0
- Changes:
  - Added "Project Scope" section at the top clarifying web-only scope
  - Principle II (Responsive Design) expanded with explicit "web-only" note
  - No principles removed; no breaking governance change (MINOR bump)
- Rationale:
  - Figma file contains 37 [iOS] frames that are out of scope for this project.
  - Previous wording could be read as permitting native mobile work; now
    explicit that responsive web is the only delivery target.
- Follow-up TODOs: None
-->

# Agentic Coding Hands-on Constitution

## Project Scope

- **In scope**: A responsive **website** built on the tech stack in §Technology
  Stack & Constraints. Desktop-first per Figma 1440×1024; mobile/tablet
  breakpoints derived per Principle II.
- **Out of scope**:
  - **iOS native app** — the Figma file contains `[iOS]` prefixed frames that
    MUST NOT be implemented in this project.
  - **Android native app** — no Material Design / Jetpack Compose / Kotlin
    work.
  - **Desktop native apps** (Electron, Tauri, etc.).
- Mobile usability is achieved via **responsive web design**, not a separate
  native codebase. Principle II is the binding source of truth for mobile UX.

---

## Core Principles

### I. Clean Code & Organization

- All source code MUST be written in TypeScript with strict mode enabled.
- Files MUST be short and focused: one component/hook/utility per file.
- Use the `@/*` path alias for all imports from `src/`. Never use relative paths
  that traverse more than one level up (`../../`).
- Naming conventions:
  - Components: `PascalCase.tsx` (e.g., `LoginForm.tsx`)
  - Hooks: `camelCase.ts` prefixed with `use` (e.g., `useAuth.ts`)
  - Utilities/libs: `camelCase.ts` (e.g., `formatDate.ts`)
  - Types: `camelCase.ts` or co-located in the file that uses them
  - Route segments: `kebab-case` directories under `src/app/`
- Folder structure MUST follow Next.js App Router conventions:
  ```
  src/
  ├── app/              # Routes, layouts, pages, loading/error states
  │   ├── (auth)/       # Route groups for auth-related pages
  │   ├── globals.css   # Global TailwindCSS styles
  │   ├── layout.tsx    # Root layout
  │   └── page.tsx      # Home page
  ├── components/       # Reusable UI components
  │   ├── ui/           # Generic primitives (Button, Input, Modal)
  │   └── [feature]/    # Feature-scoped components
  ├── hooks/            # Custom React hooks
  ├── libs/             # Third-party integrations (Supabase, etc.)
  ├── types/            # Shared TypeScript type definitions
  └── utils/            # Pure utility functions
  ```
- No dead code. Remove unused imports, variables, and functions immediately.
- Avoid premature abstraction: duplicate is acceptable until a clear pattern
  emerges across three or more usages.

### II. Responsive Design

**This is the project's sole mobile strategy.** Native iOS/Android apps are out
of scope (§Project Scope) — all mobile UX MUST be delivered through the web app
rendering correctly on small viewports.

- Every page and component MUST render correctly across three breakpoints:
  - **Mobile**: < 640px (default / mobile-first)
  - **Tablet**: >= 640px (`sm:`) to < 1024px (`lg:`)
  - **Desktop**: >= 1024px (`lg:`)
- Use TailwindCSS responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`) with a
  mobile-first approach: base styles target mobile, larger breakpoints override.
- Layout MUST use Flexbox or CSS Grid via Tailwind utilities. No fixed pixel
  widths for containers; use `max-w-*` and `w-full` patterns.
- Touch targets MUST be at least 44x44px on mobile.
- Text MUST remain readable without horizontal scrolling at any breakpoint.
- Images and media MUST be responsive (`w-full`, `object-cover`, or
  Next.js `<Image>` with appropriate sizing).
- Accessibility: WCAG 2.2 AA across all breakpoints (automated axe-core gate in
  CI; manual keyboard + screen-reader checks for P1 screens).
- **Must NOT**: ship platform-specific UI patterns (Material Design ripple,
  iOS swipe-back gestures, native navigation bars) that only make sense inside
  a real native shell. The design system is web-native (Tailwind + Montserrat
  + brand tokens — see per-screen `design-style.md`).

### III. Test-First Development (TDD)

- Follow the Red-Green-Refactor cycle:
  1. Write a failing test that defines expected behavior.
  2. Implement the minimum code to make the test pass.
  3. Refactor while keeping tests green.
- Every user-facing feature MUST have at least integration tests covering
  the happy path and primary error scenarios.
- Test files MUST be co-located or placed in a `__tests__/` directory adjacent
  to the code they test.
- Use descriptive test names that explain the expected behavior, not the
  implementation (e.g., "redirects unauthenticated users to login page").
- Mock external services (Supabase, third-party APIs) at the boundary;
  never mock internal modules.

### IV. Security (OWASP Compliance)

- **Authentication**: All protected routes MUST verify the user session via
  Supabase Auth middleware before rendering. Never trust client-side auth state
  alone for authorization decisions.
- **Input Validation**: All user inputs MUST be validated server-side.
  Use Zod or equivalent schema validation for form data and API payloads.
- **XSS Prevention**: Never use `dangerouslySetInnerHTML`. Sanitize any
  user-generated content before rendering.
- **CSRF Protection**: Use Supabase's built-in CSRF protection for auth flows.
  All state-changing operations MUST use POST/PUT/DELETE methods, never GET.
- **Secrets Management**: Environment variables containing secrets MUST NOT
  be exposed to the client. Only `NEXT_PUBLIC_*` prefixed variables are
  allowed in client-side code. Never commit `.env` files.
- **Dependency Security**: Run `yarn audit` periodically. Do not add
  dependencies with known critical vulnerabilities.
- **Headers**: Configure security headers (CSP, X-Frame-Options,
  X-Content-Type-Options) via Next.js middleware or Cloudflare settings.
- **SQL Injection**: Use Supabase client SDK (parameterized queries) exclusively.
  Never construct raw SQL strings with user input.

### V. Platform Best Practices

- **Next.js**:
  - Prefer Server Components by default. Use `"use client"` only when the
    component requires browser APIs, event handlers, or React state/effects.
  - Use Next.js App Router features: `loading.tsx`, `error.tsx`, `not-found.tsx`
    for route-level UX states.
  - Use `next/image` for all images (automatic optimization).
  - Use `next/link` for all internal navigation.
  - Data fetching MUST happen in Server Components or Server Actions.
    Avoid `useEffect` for data fetching.
- **Supabase**:
  - Use `@/libs/supabase/server.ts` for server-side operations and
    `@/libs/supabase/client.ts` for client-side only when necessary.
  - Row Level Security (RLS) MUST be enabled on all tables.
  - Use Supabase Auth for all authentication flows. Do not implement custom
    auth logic.
- **Cloudflare Workers**:
  - Be aware of Workers runtime limitations: no Node.js native modules,
    limited CPU time per request.
  - Use the OpenNext adapter (`@opennextjs/cloudflare`) for deployment.
    Do not use Node.js-specific APIs that are incompatible with the
    Workers runtime.
  - Keep bundle size minimal: avoid large dependencies.
- **TailwindCSS**:
  - Use Tailwind utility classes exclusively. No custom CSS except in
    `globals.css` for truly global styles (fonts, CSS variables).
  - Extract repeated class combinations into components, not into
    `@apply` rules.
  - Use design tokens (colors, spacing, typography) from the Tailwind config
    rather than arbitrary values.

## Technology Stack & Constraints

| Category        | Technology                          | Version    |
|-----------------|-------------------------------------|------------|
| Framework       | Next.js (App Router)                | 15.x       |
| UI Library      | React                               | 19.x       |
| Language        | TypeScript (strict mode)            | 5.x        |
| Styling         | TailwindCSS                         | 4.x        |
| Backend/BaaS    | Supabase (Auth, Database, Storage)  | Latest     |
| Deployment      | Cloudflare Workers (OpenNext)       | Latest     |
| Package Manager | Yarn                                | 1.22.22    |
| Linting         | ESLint (flat config, next/core-web-vitals + next/typescript) | 9.x |
| Dev Server      | Next.js Turbopack                   | Built-in   |

**Constraints**:
- All code MUST be compatible with the Cloudflare Workers runtime.
- No Node.js native modules (`fs`, `path`, `crypto` from Node) in
  production code.
- Maximum bundle size awareness: avoid importing entire libraries when
  only a subset is needed (use tree-shakeable imports).
- Yarn v1 (classic) is the only allowed package manager. Do not use npm
  or pnpm.

## Development Workflow

- **Branching**: Create feature branches from `main`. Use descriptive names
  (e.g., `feat/login-page`, `fix/auth-redirect`).
- **Commits**: Follow Conventional Commits format:
  `type(scope): description` (e.g., `feat(auth): add Google OAuth login`).
- **Code Review**: All changes MUST be reviewed before merging to `main`.
- **Local Development**:
  1. `make up` to start local Supabase and sync environment.
  2. `make dev` to start the Next.js dev server with Turbopack.
  3. `make down` to stop local services.
- **Pre-deployment Checks**:
  - `yarn lint` MUST pass with zero errors.
  - `yarn build` MUST succeed without errors.
  - All tests MUST pass.
- **Environment Management**:
  - `.env.example` is the template; never put real secrets in it.
  - `.env.development` is auto-generated by `make up` with local Supabase
    credentials.
  - Production secrets are managed via Cloudflare Workers environment
    variables.

## Governance

- This constitution is the authoritative reference for all development
  decisions in this project. When in doubt, follow the constitution.
- **Amendments**: Any change to this document MUST be documented with a
  version bump, rationale, and updated date. Breaking changes to principles
  require MAJOR version increment.
- **Compliance**: All code reviews MUST verify adherence to these principles.
  Deviations require explicit justification documented in the PR description.
- **Versioning**: This document follows Semantic Versioning:
  - MAJOR: Principle removed or fundamentally redefined.
  - MINOR: New principle or section added.
  - PATCH: Clarifications and wording improvements.

**Version**: 1.1.0 | **Ratified**: 2026-04-17 | **Last Amended**: 2026-04-17
