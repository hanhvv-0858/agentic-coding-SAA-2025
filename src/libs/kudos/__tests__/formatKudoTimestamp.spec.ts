import { describe, it, expect } from "vitest";
import { formatKudoTimestamp } from "../formatKudoTimestamp";

describe("formatKudoTimestamp", () => {
  it("formats a Date as HH:mm - MM/DD/YYYY", () => {
    // Fixed local-time date — avoids timezone drift in CI.
    const d = new Date(2025, 9, 30, 10, 0, 0); // Oct 30 2025, 10:00 local
    expect(formatKudoTimestamp(d, "vi")).toBe("10:00 - 10/30/2025");
  });

  it("renders the same output for vi and en locales (pattern is locale-independent)", () => {
    const d = new Date(2025, 5, 3, 9, 5, 0);
    expect(formatKudoTimestamp(d, "vi")).toBe("09:05 - 06/03/2025");
    expect(formatKudoTimestamp(d, "en")).toBe("09:05 - 06/03/2025");
  });

  it("accepts an ISO string", () => {
    const iso = new Date(2024, 0, 1, 23, 59, 0).toISOString();
    expect(formatKudoTimestamp(iso, "vi")).toMatch(/^\d{2}:\d{2} - \d{2}\/\d{2}\/\d{4}$/);
  });

  it("returns empty string for nullish values", () => {
    expect(formatKudoTimestamp(null)).toBe("");
    expect(formatKudoTimestamp(undefined)).toBe("");
  });

  it("returns empty string for invalid dates", () => {
    expect(formatKudoTimestamp("not-a-date")).toBe("");
  });
});
