import type { Locale } from "@/types/auth";

// Formats a timestamp as `HH:mm - MM/DD/YYYY` (design-style.md §17d).
// ALWAYS renders in `Asia/Ho_Chi_Minh` time so SSR (UTC runtime on
// Cloudflare Workers) and CSR (user's local timezone) produce the
// identical string — otherwise the `d.getHours()` / `d.getMonth()` etc.
// local-time methods cause hydration mismatches for any kudo shown
// between 17:00 UTC and 00:00 UTC (see hydration-failed regression
// 2026-04-22). Locale only affects numeral rendering; vi + en both use
// the same pattern per design.
const VN_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Ho_Chi_Minh",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatKudoTimestamp(
  value: string | Date | null | undefined,
  _locale: Locale = "vi",
): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";

  // `formatToParts` keeps the spec-required `HH:mm - MM/DD/YYYY` shape
  // without being at the mercy of Intl's default "en-GB" glue text.
  const parts = VN_FORMATTER.formatToParts(d);
  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  const hh = pick("hour");
  const mm = pick("minute");
  const month = pick("month");
  const day = pick("day");
  const year = pick("year");
  return `${hh}:${mm} - ${month}/${day}/${year}`;
}
