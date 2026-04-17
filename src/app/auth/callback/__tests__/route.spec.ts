import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase server client before importing the route.
const mockExchange = vi.fn();
const mockGetUser = vi.fn();
const mockSignOut = vi.fn().mockResolvedValue({ error: null });

vi.mock("@/libs/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      exchangeCodeForSession: mockExchange,
      getUser: mockGetUser,
      signOut: mockSignOut,
    },
  }),
}));

vi.mock("@/libs/env/server", () => ({
  env: { ALLOWED_EMAIL_DOMAINS: ["sun-asterisk.com"] },
}));

function makeRequest(url: string) {
  return {
    url,
    nextUrl: new URL(url),
  } as never;
}

describe("/auth/callback route handler", () => {
  beforeEach(() => {
    mockExchange.mockReset();
    mockGetUser.mockReset();
    mockSignOut.mockClear();
  });

  it("redirects to /login?error=access_denied when Google returns access_denied", async () => {
    const { GET } = await import("../route");
    const res = await GET(makeRequest("http://localhost:3000/auth/callback?error=access_denied"));
    expect(res.headers.get("location")).toBe("http://localhost:3000/login?error=access_denied");
    expect(res.status).toBe(302);
  });

  it("maps Google `server_error` to ?error=network", async () => {
    const { GET } = await import("../route");
    const res = await GET(makeRequest("http://localhost:3000/auth/callback?error=server_error"));
    expect(res.headers.get("location")).toBe("http://localhost:3000/login?error=network");
  });

  it("redirects to ?error=session_exchange_failed when code is missing", async () => {
    const { GET } = await import("../route");
    const res = await GET(makeRequest("http://localhost:3000/auth/callback"));
    expect(res.headers.get("location")).toBe(
      "http://localhost:3000/login?error=session_exchange_failed",
    );
  });

  it("redirects to ?error=network when exchangeCodeForSession fails with a 5xx", async () => {
    mockExchange.mockResolvedValue({
      error: { status: 502, message: "upstream fetch failed" },
    });
    const { GET } = await import("../route");
    const res = await GET(makeRequest("http://localhost:3000/auth/callback?code=abc"));
    expect(res.headers.get("location")).toBe("http://localhost:3000/login?error=network");
  });

  it("redirects to ?error=session_exchange_failed on generic exchange error", async () => {
    mockExchange.mockResolvedValue({
      error: { status: 400, message: "invalid grant" },
    });
    const { GET } = await import("../route");
    const res = await GET(makeRequest("http://localhost:3000/auth/callback?code=abc"));
    expect(res.headers.get("location")).toBe(
      "http://localhost:3000/login?error=session_exchange_failed",
    );
  });

  it("redirects non-Sun* domains to /error/403 and signs out", async () => {
    mockExchange.mockResolvedValue({ error: null });
    mockGetUser.mockResolvedValue({
      data: { user: { email: "outsider@gmail.com" } },
      error: null,
    });
    const { GET } = await import("../route");
    const res = await GET(makeRequest("http://localhost:3000/auth/callback?code=abc"));
    expect(res.headers.get("location")).toBe("http://localhost:3000/error/403");
    expect(mockSignOut).toHaveBeenCalledOnce();
  });

  it("redirects to / on full success", async () => {
    mockExchange.mockResolvedValue({ error: null });
    mockGetUser.mockResolvedValue({
      data: { user: { email: "alice@sun-asterisk.com" } },
      error: null,
    });
    const { GET } = await import("../route");
    const res = await GET(makeRequest("http://localhost:3000/auth/callback?code=abc"));
    expect(res.headers.get("location")).toBe("http://localhost:3000/");
  });

  it("honours a validated ?next= param", async () => {
    mockExchange.mockResolvedValue({ error: null });
    mockGetUser.mockResolvedValue({
      data: { user: { email: "alice@sun-asterisk.com" } },
      error: null,
    });
    const { GET } = await import("../route");
    const res = await GET(
      makeRequest("http://localhost:3000/auth/callback?code=abc&next=%2Fkudos%2F123"),
    );
    expect(res.headers.get("location")).toBe("http://localhost:3000/kudos/123");
  });

  it("rejects open-redirect ?next= and falls back to /", async () => {
    mockExchange.mockResolvedValue({ error: null });
    mockGetUser.mockResolvedValue({
      data: { user: { email: "alice@sun-asterisk.com" } },
      error: null,
    });
    const { GET } = await import("../route");
    const res = await GET(
      makeRequest("http://localhost:3000/auth/callback?code=abc&next=%2F%2Fevil.com"),
    );
    expect(res.headers.get("location")).toBe("http://localhost:3000/");
  });
});
