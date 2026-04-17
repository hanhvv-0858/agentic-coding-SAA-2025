export const OAUTH_ERROR_CODES = [
  "access_denied",
  "network",
  "session_exchange_failed",
  "cookie_blocked",
] as const;

export type OAuthErrorCode = (typeof OAUTH_ERROR_CODES)[number];

export function isOAuthErrorCode(value: string | null | undefined): value is OAuthErrorCode {
  return typeof value === "string" && (OAUTH_ERROR_CODES as readonly string[]).includes(value);
}

export type AllowedDomain = string & { readonly __brand: "AllowedDomain" };

export const SUPPORTED_LOCALES = ["vi", "en"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "vi";

export function isSupportedLocale(value: string | null | undefined): value is Locale {
  return typeof value === "string" && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}
