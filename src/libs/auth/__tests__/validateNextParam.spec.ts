import { describe, it, expect } from "vitest";
import { validateNextParam } from "../validateNextParam";

describe("validateNextParam", () => {
  it("accepts a same-origin path", () => {
    expect(validateNextParam("/kudos/123")).toBe("/kudos/123");
  });

  it("preserves query + hash", () => {
    expect(validateNextParam("/kudos?page=2#top")).toBe("/kudos?page=2#top");
  });

  it("rejects protocol-relative (//evil.com)", () => {
    expect(validateNextParam("//evil.com")).toBe("/");
  });

  it("rejects absolute http URL", () => {
    expect(validateNextParam("http://x.test/")).toBe("/");
  });

  it("rejects javascript: pseudo-protocol", () => {
    expect(validateNextParam("javascript:alert(1)")).toBe("/");
  });

  it("rejects data: pseudo-protocol", () => {
    expect(validateNextParam("data:text/html,<script>alert(1)</script>")).toBe("/");
  });

  it("rejects empty / nullish", () => {
    expect(validateNextParam("")).toBe("/");
    expect(validateNextParam(null)).toBe("/");
    expect(validateNextParam(undefined)).toBe("/");
  });

  it("rejects backslash path tricks", () => {
    expect(validateNextParam("/\\evil.com")).toBe("/");
  });

  it("accepts the bare root", () => {
    expect(validateNextParam("/")).toBe("/");
  });

  it("accepts nested paths with encoded characters", () => {
    expect(validateNextParam("/users/alice%20smith")).toBe("/users/alice%20smith");
  });
});
