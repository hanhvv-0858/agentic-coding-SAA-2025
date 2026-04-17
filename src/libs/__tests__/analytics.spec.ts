import { describe, it, expect } from "vitest";
import { emailDomain } from "@/libs/analytics/track";

describe("emailDomain", () => {
  it("extracts the domain part", () => {
    expect(emailDomain("alice@sun-asterisk.com")).toBe("sun-asterisk.com");
  });

  it("lowercases the domain", () => {
    expect(emailDomain("Alice@Sun-Asterisk.COM")).toBe("sun-asterisk.com");
  });

  it("returns empty string when no @ is present", () => {
    expect(emailDomain("not-an-email")).toBe("");
  });

  it("handles multiple @ by taking the last one", () => {
    expect(emailDomain('"a@b"@example.com')).toBe("example.com");
  });
});
