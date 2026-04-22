import { describe, expect, it } from "vitest";
import {
  DISPLAY_NAME_MAX,
  DISPLAY_NAME_MIN,
  validateDepartmentCode,
  validateDisplayName,
} from "../validation";

describe("validateDisplayName", () => {
  it("accepts plain Latin letters", () => {
    expect(validateDisplayName("Alice Nguyen")).toEqual({ ok: true, value: "Alice Nguyen" });
  });

  it("accepts Vietnamese diacritics + combining marks", () => {
    expect(validateDisplayName("Nguyễn Thị Lan-Anh")).toEqual({
      ok: true,
      value: "Nguyễn Thị Lan-Anh",
    });
  });

  it("accepts apostrophes and periods", () => {
    expect(validateDisplayName("D'Souza Jr.")).toEqual({ ok: true, value: "D'Souza Jr." });
  });

  it("trims leading and trailing whitespace before validating", () => {
    expect(validateDisplayName("  Bob Tran  ")).toEqual({ ok: true, value: "Bob Tran" });
  });

  it("rejects empty input", () => {
    expect(validateDisplayName("")).toEqual({ ok: false, reason: "required" });
  });

  it("rejects whitespace-only input", () => {
    expect(validateDisplayName("   ")).toEqual({ ok: false, reason: "required" });
  });

  it("rejects input shorter than the minimum after trim", () => {
    expect(validateDisplayName("A")).toEqual({ ok: false, reason: "tooShort" });
  });

  it(`rejects input longer than ${DISPLAY_NAME_MAX} chars`, () => {
    const tooLong = "A".repeat(DISPLAY_NAME_MAX + 1);
    expect(validateDisplayName(tooLong)).toEqual({ ok: false, reason: "tooLong" });
  });

  it("rejects emoji", () => {
    expect(validateDisplayName("Alice 🚀 Nguyen")).toEqual({ ok: false, reason: "invalidChars" });
  });

  it("rejects digits", () => {
    expect(validateDisplayName("Alice 42")).toEqual({ ok: false, reason: "invalidChars" });
  });

  it("exposes min/max bounds consistent with spec", () => {
    expect(DISPLAY_NAME_MIN).toBe(2);
    expect(DISPLAY_NAME_MAX).toBe(80);
  });
});

describe("validateDepartmentCode", () => {
  const codes = ["CEVC1", "CEVC1 - DSV", "SPD", "OPDC - HRD - HRBP"];

  it("accepts a code present in the allow-list", () => {
    expect(validateDepartmentCode("CEVC1", codes)).toEqual({ ok: true, value: "CEVC1" });
  });

  it("rejects empty input", () => {
    expect(validateDepartmentCode("", codes)).toEqual({ ok: false, reason: "required" });
  });

  it("rejects null/undefined", () => {
    expect(validateDepartmentCode(null, codes)).toEqual({ ok: false, reason: "required" });
    expect(validateDepartmentCode(undefined, codes)).toEqual({ ok: false, reason: "required" });
  });

  it("rejects codes not in the allow-list", () => {
    expect(validateDepartmentCode("UNKNOWN", codes)).toEqual({ ok: false, reason: "invalid" });
  });
});
