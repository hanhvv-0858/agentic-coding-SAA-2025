import { describe, it, expect } from "vitest";
import { formatKudoTimestamp } from "../formatKudoTimestamp";

describe("formatKudoTimestamp", () => {
  // Dates are constructed via `Date.UTC(...)` so the test is timezone
  // independent. Local-time `new Date(y, m, d, h, …)` would make these
  // assertions pass only on machines in Asia/Ho_Chi_Minh (UTC+7) and
  // fail on CI runners that use UTC. The formatter under test is
  // pinned to Asia/Ho_Chi_Minh, so expected values reflect VN time.

  it("formats a Date as HH:mm - MM/DD/YYYY", () => {
    // 03:00 UTC = 10:00 VN (Oct 30 2025)
    const d = new Date(Date.UTC(2025, 9, 30, 3, 0, 0));
    expect(formatKudoTimestamp(d, "vi")).toBe("10:00 - 10/30/2025");
  });

  it("renders the same output for vi and en locales (pattern is locale-independent)", () => {
    // 02:05 UTC = 09:05 VN (Jun 3 2025)
    const d = new Date(Date.UTC(2025, 5, 3, 2, 5, 0));
    expect(formatKudoTimestamp(d, "vi")).toBe("09:05 - 06/03/2025");
    expect(formatKudoTimestamp(d, "en")).toBe("09:05 - 06/03/2025");
  });

  it("accepts an ISO string", () => {
    const iso = new Date(Date.UTC(2024, 0, 1, 16, 59, 0)).toISOString();
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
