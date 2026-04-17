import { describe, it, expect } from "vitest";
import { mapOAuthError } from "../mapOAuthError";

describe("mapOAuthError", () => {
  it("maps Google `access_denied` to the same app code", () => {
    expect(mapOAuthError("access_denied")).toBe("access_denied");
  });

  it("maps Google `server_error` to `network`", () => {
    expect(mapOAuthError("server_error")).toBe("network");
  });

  it("maps Google `temporarily_unavailable` to `network`", () => {
    expect(mapOAuthError("temporarily_unavailable")).toBe("network");
  });

  it("maps Google `invalid_request` to `session_exchange_failed`", () => {
    expect(mapOAuthError("invalid_request")).toBe("session_exchange_failed");
  });

  it("passes through codes already in the app enum", () => {
    expect(mapOAuthError("cookie_blocked")).toBe("cookie_blocked");
    expect(mapOAuthError("session_exchange_failed")).toBe("session_exchange_failed");
  });

  it("defaults unknown strings to `access_denied`", () => {
    expect(mapOAuthError("some_future_error")).toBe("access_denied");
  });

  it("defaults nullish input to `access_denied`", () => {
    expect(mapOAuthError(null)).toBe("access_denied");
    expect(mapOAuthError(undefined)).toBe("access_denied");
    expect(mapOAuthError("")).toBe("access_denied");
  });
});
