import { describe, it, expect, vi, beforeEach } from "vitest";

const cookieSet = vi.fn();
const revalidate = vi.fn();

vi.mock("next/headers", () => ({
  cookies: async () => ({ set: cookieSet }),
}));
vi.mock("next/cache", () => ({
  revalidatePath: (p: string) => revalidate(p),
}));

describe("setLocale", () => {
  beforeEach(() => {
    cookieSet.mockClear();
    revalidate.mockClear();
  });

  it("writes NEXT_LOCALE cookie with Path=/, SameSite=Lax, Max-Age=1y", async () => {
    const { setLocale } = await import("../setLocale");
    await setLocale("en");
    expect(cookieSet).toHaveBeenCalledWith("NEXT_LOCALE", "en", {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
  });

  it("revalidates the root layout after setting the cookie", async () => {
    const { setLocale } = await import("../setLocale");
    await setLocale("vi");
    expect(revalidate).toHaveBeenCalledWith("/");
  });

  it("ignores unsupported locales (no cookie write, no revalidate)", async () => {
    const { setLocale } = await import("../setLocale");
    // @ts-expect-error — runtime guard test
    await setLocale("fr");
    expect(cookieSet).not.toHaveBeenCalled();
    expect(revalidate).not.toHaveBeenCalled();
  });
});
