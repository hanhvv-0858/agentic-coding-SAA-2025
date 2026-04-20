import type { Locale } from "@/types/auth";

// Formats a timestamp as `HH:mm - MM/DD/YYYY` (design-style.md §17d).
// Locale only affects numeral rendering (VI and EN both use the same
// pattern per design). We keep this zero-dep — the spec's date-fns
// mention (tasks.md T032) is an implementation hint, not a hard
// requirement, and the project has no existing date-fns dependency.
export function formatKudoTimestamp(
  value: string | Date | null | undefined,
  _locale: Locale = "vi",
): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(d.getTime())) return "";

  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();
  return `${hh}:${mm} - ${month}/${day}/${year}`;
}
