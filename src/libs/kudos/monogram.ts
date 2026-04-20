// Deterministic monogram helpers for FR-016 avatar fallback.
// When a profile has no avatar_url (or the image 404s), we render
// `initials` on a `bgColor` computed from the user id hash so each
// Sunner lands on a stable colour across the session.

const PALETTE = [
  "#ffea9e", // cream (primary design token, mirrors design-style §17a)
  "#ffd166",
  "#f3c26e",
  "#c9a15e",
  "#a68242",
  "#8a6a2f",
] as const;

/** First grapheme (up to 2 chars) of `displayName`, uppercased. */
export function getInitials(displayName: string | null | undefined): string {
  if (!displayName) return "?";
  const trimmed = displayName.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  const first = parts[0].charAt(0);
  const last = parts[parts.length - 1].charAt(0);
  return (first + last).toUpperCase();
}

/** Deterministic palette pick from any stable seed (user id recommended). */
export function pickMonogramColor(seed: string | null | undefined): string {
  if (!seed) return PALETTE[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}
