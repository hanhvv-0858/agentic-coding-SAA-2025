import { isOAuthErrorCode, type OAuthErrorCode } from "@/types/auth";

// Google OAuth2 can return these error strings in `?error=...` per
// https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.2.1.
// Map them onto the 4 banner codes the UI knows how to render.
const GOOGLE_TO_APP: Record<string, OAuthErrorCode> = {
  access_denied: "access_denied",
  invalid_request: "session_exchange_failed",
  unauthorized_client: "session_exchange_failed",
  unsupported_response_type: "session_exchange_failed",
  invalid_scope: "session_exchange_failed",
  server_error: "network",
  temporarily_unavailable: "network",
};

export function mapOAuthError(raw: string | null | undefined): OAuthErrorCode {
  if (!raw) return "access_denied";
  if (isOAuthErrorCode(raw)) return raw;
  return GOOGLE_TO_APP[raw] ?? "access_denied";
}
