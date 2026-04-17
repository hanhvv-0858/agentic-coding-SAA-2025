// Open-redirect guard for post-auth `?next=` redirects.
// Accepts ONLY same-origin path-only URLs like "/kudos/123".
// Rejects "//evil.com", "http://…", "javascript:…", empty, and anything that
// cannot be resolved back to the request origin.
export function validateNextParam(next: string | null | undefined): string {
  const FALLBACK = "/";
  if (!next) return FALLBACK;

  // Quick rejects — catch the common open-redirect shapes before URL parsing.
  if (next.startsWith("//")) return FALLBACK; // "//evil.com" protocol-relative
  if (!next.startsWith("/")) return FALLBACK; // must be path-only
  if (next.includes("\\")) return FALLBACK; // Windows path trick

  // Resolve against a dummy origin; if the parsed pathname doesn't match the
  // original, or if the parsed URL escapes to a different host, reject.
  try {
    const url = new URL(next, "https://placeholder.local");
    if (url.origin !== "https://placeholder.local") return FALLBACK;
    // Disallow protocols smuggled in the path like javascript:… (URL would
    // treat them as path, but belt-and-braces).
    if (/^[a-z][a-z0-9+.-]*:/i.test(next)) return FALLBACK;
    // Reconstruct path + search + hash (drop any fragment of origin).
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return FALLBACK;
  }
}
