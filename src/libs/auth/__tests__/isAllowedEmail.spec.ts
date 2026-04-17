import { describe, it, expect, vi, beforeAll } from "vitest";

// Env must be set before @/libs/env parses it at module load.
beforeAll(() => {
  vi.stubEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:3000");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "dummy-anon-key-at-least-20-chars");
  vi.stubEnv("ALLOWED_EMAIL_DOMAINS", "sun-asterisk.com,sun-asterisk.vn");
});

describe("isAllowedEmail", () => {
  it("accepts a Sun* domain", async () => {
    const { isAllowedEmail } = await import("../isAllowedEmail");
    expect(isAllowedEmail("alice@sun-asterisk.com")).toBe(true);
  });

  it("rejects a non-Sun* domain", async () => {
    const { isAllowedEmail } = await import("../isAllowedEmail");
    expect(isAllowedEmail("bob@gmail.com")).toBe(false);
  });

  it("is case-insensitive on the domain", async () => {
    const { isAllowedEmail } = await import("../isAllowedEmail");
    expect(isAllowedEmail("Alice@Sun-Asterisk.COM")).toBe(true);
  });

  it("accepts a secondary allow-listed domain", async () => {
    const { isAllowedEmail } = await import("../isAllowedEmail");
    expect(isAllowedEmail("carol@sun-asterisk.vn")).toBe(true);
  });

  it("rejects strings without @", async () => {
    const { isAllowedEmail } = await import("../isAllowedEmail");
    expect(isAllowedEmail("not-an-email")).toBe(false);
  });

  it("rejects empty / nullish input", async () => {
    const { isAllowedEmail } = await import("../isAllowedEmail");
    expect(isAllowedEmail("")).toBe(false);
    expect(isAllowedEmail(null)).toBe(false);
    expect(isAllowedEmail(undefined)).toBe(false);
  });

  it("rejects input with trailing @ (no domain)", async () => {
    const { isAllowedEmail } = await import("../isAllowedEmail");
    expect(isAllowedEmail("alice@")).toBe(false);
  });
});
