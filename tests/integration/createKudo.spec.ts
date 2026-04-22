// Server Action integration — createKudo validation + rpc wiring.
// PR 2 task T013. 4 scenarios:
//   1. happy path — rpc called with correct args, returns ok+kudoId
//   2. missing auth — returns { ok: false, error: "unauthenticated" }
//   3. invalid input (empty title / missing recipient / wrong hashtag count)
//      → returns error before rpc call
//   4. rpc error surfaces as { ok: false }

import { describe, it, expect, vi, beforeEach } from "vitest";

const rpcMock = vi.fn();
const getUserMock = vi.fn();

vi.mock("@/libs/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: getUserMock },
    rpc: rpcMock,
  }),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

import { createKudo } from "@/app/kudos/actions";

const validInput = {
  recipientId: "11111111-1111-1111-1111-111111111111",
  title: "Hero",
  body: "<p>Cảm ơn bạn.</p>",
  hashtagSlugs: ["dedicated"],
  imagePaths: [],
  isAnonymous: false,
  anonymousAlias: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  getUserMock.mockResolvedValue({ data: { user: { id: "user-a" } } });
});

describe("createKudo Server Action — PR 2 US1", () => {
  it("T013-1: happy path — rpc called with correct args and returns ok + kudoId", async () => {
    rpcMock.mockResolvedValue({ data: "new-kudo-uuid", error: null });
    const result = await createKudo(validInput);
    expect(result).toEqual({ ok: true, kudoId: "new-kudo-uuid" });
    expect(rpcMock).toHaveBeenCalledTimes(1);
    expect(rpcMock).toHaveBeenCalledWith("create_kudo", {
      p_title: "Hero",
      p_body: "<p>Cảm ơn bạn.</p>",
      p_is_anonymous: false,
      p_recipient_id: validInput.recipientId,
      p_hashtag_slugs: ["dedicated"],
      p_image_paths: [],
      p_anonymous_alias: null,
    });
  });

  it("T013-2: returns unauthenticated error when no auth", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });
    const result = await createKudo(validInput);
    expect(result).toEqual({ ok: false, error: "unauthenticated" });
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("T013-3a: rejects empty title BEFORE calling rpc", async () => {
    const result = await createKudo({ ...validInput, title: "   " });
    expect(result).toEqual({ ok: false, error: "invalid_title" });
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("T013-3b: rejects when hashtagSlugs count = 0", async () => {
    const result = await createKudo({ ...validInput, hashtagSlugs: [] });
    expect(result).toEqual({ ok: false, error: "invalid_hashtag_count" });
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("T013-3c: rejects when hashtagSlugs count > 5", async () => {
    const result = await createKudo({
      ...validInput,
      hashtagSlugs: ["a", "b", "c", "d", "e", "f"],
    });
    expect(result).toEqual({ ok: false, error: "invalid_hashtag_count" });
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("T013-3d: rejects body that is empty after stripping HTML tags", async () => {
    const result = await createKudo({ ...validInput, body: "<p>   </p>" });
    expect(result).toEqual({ ok: false, error: "invalid_body" });
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("T013-4: surfaces rpc error as { ok: false }", async () => {
    rpcMock.mockResolvedValue({
      data: null,
      error: { message: "rpc_failed" },
    });
    const result = await createKudo(validInput);
    expect(result).toEqual({ ok: false, error: "rpc_failed" });
  });

  it("T079-a: anonymous=true with empty alias → invalid_anonymous_alias, no rpc", async () => {
    const result = await createKudo({
      ...validInput,
      isAnonymous: true,
      anonymousAlias: "",
    });
    expect(result).toEqual({ ok: false, error: "invalid_anonymous_alias" });
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("T079-b: anonymous=true with whitespace-only alias → invalid_anonymous_alias", async () => {
    const result = await createKudo({
      ...validInput,
      isAnonymous: true,
      anonymousAlias: "   ",
    });
    expect(result).toEqual({ ok: false, error: "invalid_anonymous_alias" });
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("T079-c: anonymous=true with >40 char alias → invalid_anonymous_alias", async () => {
    const result = await createKudo({
      ...validInput,
      isAnonymous: true,
      anonymousAlias: "x".repeat(41),
    });
    expect(result).toEqual({ ok: false, error: "invalid_anonymous_alias" });
    expect(rpcMock).not.toHaveBeenCalled();
  });

  it("T079-d: anonymous=true with valid alias → forwarded to rpc trimmed", async () => {
    rpcMock.mockResolvedValue({ data: "kudo-id", error: null });
    const result = await createKudo({
      ...validInput,
      isAnonymous: true,
      anonymousAlias: "  NinjaSunner  ",
    });
    expect(result).toEqual({ ok: true, kudoId: "kudo-id" });
    expect(rpcMock).toHaveBeenCalledWith(
      "create_kudo",
      expect.objectContaining({
        p_is_anonymous: true,
        p_anonymous_alias: "NinjaSunner",
      }),
    );
  });

  it("T079-e: anonymous=false with non-null alias → coerced to null before rpc", async () => {
    rpcMock.mockResolvedValue({ data: "kudo-id", error: null });
    await createKudo({
      ...validInput,
      isAnonymous: false,
      anonymousAlias: "StaleNickname",
    });
    expect(rpcMock).toHaveBeenCalledWith(
      "create_kudo",
      expect.objectContaining({
        p_is_anonymous: false,
        p_anonymous_alias: null,
      }),
    );
  });
});
