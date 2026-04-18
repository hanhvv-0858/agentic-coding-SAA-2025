import type { BrowserContext, Page } from "@playwright/test";

/**
 * Shared Playwright auth fixture for authenticated route E2E tests.
 *
 * Awards is the **first** feature to need this (Homepage MVP deferred its
 * E2E tests T044–T064). When those Homepage tests eventually land they
 * will reuse this fixture unchanged.
 *
 * ## How to produce `SUPABASE_TEST_SESSION_TOKEN` for real-auth tests
 *
 * Supabase issues a JWT-format cookie named `sb-<project-ref>-auth-token`
 * on successful OAuth. Because our OAuth provider is Google, we can't
 * script the sign-in from Playwright (Google captchas + security checks).
 *
 * Two options:
 *
 * 1. **Test Supabase project** (preferred): create a dedicated Supabase
 *    project for CI, use `supabase.auth.signInWithPassword({ email, password })`
 *    once at setup time, dump the returned session cookie, and pipe it
 *    into CI as `SUPABASE_TEST_SESSION_TOKEN` secret.
 *
 * 2. **Mock Supabase at network boundary** (lighter): intercept requests
 *    to `*.supabase.co/auth/v1/*` via `page.route(...)` and respond with
 *    a synthetic session. Brittle — keep only for smoke.
 *
 * Without one of the above, the authenticated E2E tests in
 * `awards.spec.ts` are SKIPPED at runtime (see `test.skip(!hasAuth)` gate).
 */

export const SESSION_COOKIE_NAME_PREFIX = "sb-";

/**
 * Attach a (real or mocked) Supabase session cookie to the Playwright
 * browser context. Returns `true` if a session was seeded, `false` if not
 * available (in which case tests should be skipped).
 *
 * Consumes the `SUPABASE_TEST_SESSION_TOKEN` env var, which should contain
 * the **full cookie value** (JSON-stringified auth payload, URL-encoded).
 */
export async function seedSupabaseSession(
  context: BrowserContext,
  opts: { projectRef?: string } = {},
): Promise<boolean> {
  const token = process.env.SUPABASE_TEST_SESSION_TOKEN;
  if (!token) return false;

  // Derive cookie name from the Supabase URL if not explicitly provided.
  // e.g. https://abcdef.supabase.co → "sb-abcdef-auth-token"
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const projectRef =
    opts.projectRef ??
    supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] ??
    "example";

  await context.addCookies([
    {
      name: `${SESSION_COOKIE_NAME_PREFIX}${projectRef}-auth-token`,
      value: token,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      expires: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 h
    },
  ]);
  return true;
}

/**
 * Convenience: seed session OR skip the test. Use at the top of an
 * authenticated test via `await requireAuth(page, context, test)`.
 */
export async function requireAuth(
  page: Page,
  context: BrowserContext,
  skip: (reason: string) => void,
): Promise<void> {
  const ok = await seedSupabaseSession(context);
  if (!ok) {
    skip(
      "Authenticated test skipped: SUPABASE_TEST_SESSION_TOKEN env var not set. " +
        "See tests/e2e/fixtures/auth.ts for how to produce one.",
    );
    return;
  }
  // Hit the page once so middleware session-refresh runs.
  await page.goto("/");
}
