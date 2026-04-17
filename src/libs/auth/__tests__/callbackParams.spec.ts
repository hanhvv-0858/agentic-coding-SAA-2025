import { describe, it, expect } from "vitest";
import { parseCallbackParams } from "../callbackParams";

describe("parseCallbackParams", () => {
  it("parses the success path (code + state + next)", () => {
    const sp = new URLSearchParams("code=abc123&state=xyz&next=/kudos");
    expect(parseCallbackParams(sp)).toEqual({
      code: "abc123",
      state: "xyz",
      next: "/kudos",
    });
  });

  it("parses the error path", () => {
    const sp = new URLSearchParams("error=access_denied&error_description=User+denied");
    expect(parseCallbackParams(sp)).toEqual({
      error: "access_denied",
      error_description: "User denied",
    });
  });

  it("drops unknown keys", () => {
    const sp = new URLSearchParams("code=abc&spam=yes");
    expect(parseCallbackParams(sp)).toEqual({ code: "abc" });
  });

  it("returns empty when nothing matches", () => {
    const sp = new URLSearchParams("");
    expect(parseCallbackParams(sp)).toEqual({});
  });
});
