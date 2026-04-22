import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Test-only env shim. Real values are injected in dev/prod by Next.js;
// under Vitest we need safe defaults so `env/client.ts` + `env/server.ts`
// don't throw at import time when a transitive chain pulls them in.
if (!process.env.NEXT_PUBLIC_SITE_URL) {
  process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
}
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://stub.supabase.co";
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "stub-anon-key-long-enough-to-pass-min-20-char-check";
}
if (!process.env.ALLOWED_EMAIL_DOMAINS) {
  process.env.ALLOWED_EMAIL_DOMAINS = "sun-asterisk.com";
}

// Default next/navigation mock so client-island components that call
// `useRouter` / `useSearchParams` / `usePathname` can render under jsdom
// without blowing up. Individual specs may override via `vi.mock()`.
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(""),
  redirect: (path: string) => {
    throw new Error(`NEXT_REDIRECT:${path}`);
  },
  notFound: () => {
    throw new Error("NEXT_NOT_FOUND");
  },
}));

afterEach(() => {
  cleanup();
});
