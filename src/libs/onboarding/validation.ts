// Pure validators for the Onboarding screen (spec ObrdH9pKx7).
// Shared between the client form island and the `completeOnboarding` Server
// Action so the validation rules are a single source of truth.

export const DISPLAY_NAME_MIN = 2;
export const DISPLAY_NAME_MAX = 80;

// Unicode letters (`\p{L}`) + combining marks (`\p{M}`) + whitespace + dash +
// apostrophe + period. Per spec Q1 — accepts names like `Nguyễn Thị Lan-Anh`,
// `D'Souza Jr.`, rejects emoji, digits, and control characters.
const DISPLAY_NAME_REGEX = /^[\p{L}\p{M}\s\-'.]+$/u;

export type DisplayNameValidation =
  | { ok: true; value: string }
  | { ok: false; reason: "required" | "tooShort" | "tooLong" | "invalidChars" };

export function validateDisplayName(raw: string): DisplayNameValidation {
  const trimmed = raw.trim();
  if (trimmed.length === 0) return { ok: false, reason: "required" };
  if (trimmed.length < DISPLAY_NAME_MIN) return { ok: false, reason: "tooShort" };
  if (trimmed.length > DISPLAY_NAME_MAX) return { ok: false, reason: "tooLong" };
  if (!DISPLAY_NAME_REGEX.test(trimmed)) return { ok: false, reason: "invalidChars" };
  return { ok: true, value: trimmed };
}

export type DepartmentCodeValidation =
  | { ok: true; value: string }
  | { ok: false; reason: "required" | "invalid" };

export function validateDepartmentCode(
  raw: string | null | undefined,
  allowed: readonly string[],
): DepartmentCodeValidation {
  if (raw === null || raw === undefined || raw.length === 0) {
    return { ok: false, reason: "required" };
  }
  if (!allowed.includes(raw)) {
    return { ok: false, reason: "invalid" };
  }
  return { ok: true, value: raw };
}
