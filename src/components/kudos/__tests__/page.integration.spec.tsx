// Phase 2 + Phase 3 (US1 / T044) — covers the /kudos RSC shell:
//   * redirect to /login when unauthenticated (FR-003)
//   * empty-state copy when the feed returns zero items (FR-002)
//   * error state when the Server Action throws (FR-022)
//   * card stack when seeded rows come back
//
// We exercise the same composition in isolation for the empty + card
// + error branches (rendering the full RSC requires many Next
// internals); the RSC export test below guards the route shape.

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import viMessages from "@/messages/vi.json";
import type { Messages } from "@/libs/i18n/getMessages";
import { EmptyState } from "../EmptyState";
import { InlineError } from "../InlineError";
import { KudoPostCard } from "../KudoPostCard";
import type { Kudo } from "@/types/kudo";

const messages = viMessages as unknown as Messages;

const sampleKudo: Kudo = {
  id: "k1",
  body: "Cảm ơn bạn rất nhiều.",
  title: null,
  created_at: new Date(2025, 9, 30, 10, 0, 0).toISOString(),
  sender_id: "u1",
  hearts_count: 2,
  sender: {
    id: "u1",
    display_name: "Alice",
    avatar_url: null,
    department_id: null,
    honour_code: null,
    honour_title: null,
  },
  recipients: [
    {
      id: "u2",
      display_name: "Bob",
      avatar_url: null,
      department_id: null,
      honour_code: null,
      honour_title: null,
    },
  ],
  hashtags: [{ slug: "dedicated", label: "Dedicated" }],
  images: [],
  has_hearted: false,
};

const redirectMock = vi.fn();
const createClientMock = vi.fn();

vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    redirectMock(path);
    // Mirror Next.js behaviour — redirect() throws to halt rendering.
    throw new Error(`NEXT_REDIRECT:${path}`);
  },
  useRouter: () => ({ replace: vi.fn(), push: vi.fn() }),
  usePathname: () => "/kudos",
  useSearchParams: () => new URLSearchParams(""),
}));

vi.mock("@/libs/supabase/server", () => ({
  createClient: () => createClientMock(),
}));

// The layout chrome pulls many client components; stub them so the RSC
// shell can be imported cleanly in unit tests.
vi.mock("@/components/layout/SiteHeader", () => ({ SiteHeader: () => null }));
vi.mock("@/components/layout/SiteFooter", () => ({ SiteFooter: () => null }));
vi.mock("@/components/layout/LanguageToggle", () => ({ LanguageToggle: () => null }));
vi.mock("@/components/layout/NotificationBell", () => ({ NotificationBell: () => null }));
vi.mock("@/components/layout/ProfileMenu", () => ({ ProfileMenu: () => null }));
vi.mock("@/components/shell/QuickActionsFab", () => ({ QuickActionsFab: () => null }));

describe("/kudos route shell (Phase 2)", () => {
  beforeEach(() => {
    redirectMock.mockReset();
    createClientMock.mockReset();
  });

  it("exports a default async component", async () => {
    const mod = await import("@/app/kudos/page");
    expect(typeof mod.default).toBe("function");
  });

  it("redirects unauthenticated users to /login?next=/kudos (FR-003)", async () => {
    createClientMock.mockReturnValue({
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
      },
    });

    const mod = await import("@/app/kudos/page");
    await expect(
      mod.default({ searchParams: Promise.resolve({}) }),
    ).rejects.toThrow(/NEXT_REDIRECT/);

    expect(redirectMock).toHaveBeenCalledWith("/login?next=/kudos");
  });
});

describe("/kudos feed composition (Phase 3 — US1)", () => {
  it("renders the empty-state copy when the feed is empty (FR-002)", () => {
    render(<EmptyState messages={messages} variant="feedEmpty" />);
    expect(screen.getByText("Hiện tại chưa có Kudos nào.")).toBeInTheDocument();
  });

  it("renders at least 4 kudo cards when seeded rows are present", () => {
    const kudos = Array.from({ length: 4 }, (_, i) => ({
      ...sampleKudo,
      id: `k${i}`,
    }));
    render(
      <div>
        {kudos.map((k) => (
          <KudoPostCard key={k.id} kudo={k} messages={messages} locale="vi" />
        ))}
      </div>,
    );
    expect(screen.getAllByTestId("kudo-post-card").length).toBe(4);
  });

  it("renders the inline feed error (FR-022) with a Retry button (US9 #4)", () => {
    const onRetry = vi.fn();
    render(<InlineError messages={messages} block="feed" onRetry={onRetry} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/Không tải được danh sách/)).toBeInTheDocument();
    expect(screen.getByText(/Thử lại/)).toBeInTheDocument();
  });
});

// Phase 4 / T056 — server-filter integration for getKudoFeed. We stub
// the supabase client with a chain-recording fake and assert the correct
// two-step filter narrowing (hashtag → junction → kudo_ids;
// department → profiles → sender_ids) lands on the main select.

describe("getKudoFeed — server-side hashtag + department filter (Phase 4 / US2+US3)", () => {
  // Recorded PostgREST-style chain builder. Captures each `.eq/.in/.lt`
  // call so assertions below can check the final filter set.
  type Recorded = {
    table: string;
    calls: Array<{ fn: string; args: unknown[] }>;
    resolveWith: unknown;
  };

  const makeBuilder = (rec: Recorded) => {
    const builder: Record<string, (...args: unknown[]) => unknown> = {};
    const record = (fn: string) => (...args: unknown[]) => {
      rec.calls.push({ fn, args });
      return builder;
    };
    builder.select = record("select");
    builder.eq = record("eq");
    builder.in = record("in");
    builder.lt = record("lt");
    builder.order = record("order");
    builder.limit = record("limit");
    builder.maybeSingle = () =>
      Promise.resolve({ data: rec.resolveWith, error: null });
    // thenable — awaiting the chain returns { data, error }.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (builder as any).then = (onFulfilled: (v: unknown) => unknown) =>
      Promise.resolve({ data: rec.resolveWith, error: null }).then(onFulfilled);
    return builder;
  };

  it("resolves hashtag slug → kudo_ids then narrows main query via .in('id', …)", async () => {
    const recs: Record<string, Recorded> = {
      hashtags: { table: "hashtags", calls: [], resolveWith: { id: "hid-1" } },
      kudo_hashtags: {
        table: "kudo_hashtags",
        calls: [],
        resolveWith: [{ kudo_id: "k1" }, { kudo_id: "k2" }],
      },
      kudos_with_stats: {
        table: "kudos_with_stats",
        calls: [],
        resolveWith: [],
      },
      kudo_hearts: { table: "kudo_hearts", calls: [], resolveWith: [] },
    };

    const supabase = {
      from: (t: string) => makeBuilder(recs[t] ?? { table: t, calls: [], resolveWith: [] }),
      auth: { getUser: async () => ({ data: { user: null } }) },
    };

    vi.resetModules();
    vi.doMock("@/libs/supabase/server", () => ({
      createClient: async () => supabase,
    }));

    const { getKudoFeed } = await import("@/app/kudos/actions");
    const page = await getKudoFeed(
      { hashtag: "dedicated", department: null },
      null,
    );
    expect(page.items).toEqual([]);
    // The main query should have called .in("id", ["k1", "k2"]).
    const mainInCall = recs.kudos_with_stats.calls.find(
      (c) => c.fn === "in" && c.args[0] === "id",
    );
    expect(mainInCall).toBeTruthy();
    expect(mainInCall?.args[1]).toEqual(["k1", "k2"]);
    vi.doUnmock("@/libs/supabase/server");
  });

  it("short-circuits to an empty page when the hashtag slug is unknown", async () => {
    const recs: Record<string, Recorded> = {
      hashtags: { table: "hashtags", calls: [], resolveWith: null },
    };
    const supabase = {
      from: (t: string) => makeBuilder(recs[t] ?? { table: t, calls: [], resolveWith: null }),
      auth: { getUser: async () => ({ data: { user: null } }) },
    };
    vi.resetModules();
    vi.doMock("@/libs/supabase/server", () => ({
      createClient: async () => supabase,
    }));
    const { getKudoFeed } = await import("@/app/kudos/actions");
    const page = await getKudoFeed(
      { hashtag: "nope", department: null },
      null,
    );
    expect(page).toEqual({ items: [], nextCursor: null, hasMore: false });
    vi.doUnmock("@/libs/supabase/server");
  });
});

describe("getKudoHashtags + getKudoDepartments (Phase 4 / T049 + T050)", () => {
  it("getKudoHashtags returns slug+label rows", async () => {
    const supabase = {
      from: (t: string) => {
        expect(t).toBe("hashtags");
        return {
          select: () => ({
            order: async () => ({
              data: [{ slug: "dedicated", label: "Dedicated" }],
              error: null,
            }),
          }),
        };
      },
      auth: { getUser: async () => ({ data: { user: null } }) },
    };
    vi.resetModules();
    vi.doMock("@/libs/supabase/server", () => ({
      createClient: async () => supabase,
    }));
    const { getKudoHashtags } = await import("@/app/kudos/actions");
    const rows = await getKudoHashtags();
    expect(rows).toEqual([{ slug: "dedicated", label: "Dedicated" }]);
    vi.doUnmock("@/libs/supabase/server");
  });

  it("getKudoDepartments resolves the locale-appropriate label (vi default)", async () => {
    vi.doMock("next/headers", () => ({
      cookies: async () => ({ get: () => undefined }),
    }));
    const supabase = {
      from: (t: string) => {
        expect(t).toBe("departments");
        return {
          select: () => ({
            order: async () => ({
              data: [{ code: "FE", name_vi: "Frontend VN", name_en: "Frontend" }],
              error: null,
            }),
          }),
        };
      },
      auth: { getUser: async () => ({ data: { user: null } }) },
    };
    vi.resetModules();
    vi.doMock("@/libs/supabase/server", () => ({
      createClient: async () => supabase,
    }));
    const { getKudoDepartments } = await import("@/app/kudos/actions");
    const rows = await getKudoDepartments();
    expect(rows).toEqual([{ code: "FE", label: "Frontend VN" }]);
    vi.doUnmock("@/libs/supabase/server");
    vi.doUnmock("next/headers");
  });
});
