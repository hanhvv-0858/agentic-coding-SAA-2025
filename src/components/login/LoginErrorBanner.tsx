import { isOAuthErrorCode } from "@/types/auth";
import type { Messages } from "@/libs/i18n/getMessages";
import { DismissibleAlert } from "@/components/ui/DismissibleAlert";
import { track } from "@/libs/analytics/track";

type LoginErrorBannerProps = {
  errorParam: string | null | undefined;
  messages: Messages;
};

// Server component. Reads ?error=<code>, validates against the enum, resolves
// the localized string, and wraps in DismissibleAlert (client) for focus + Esc.
// Returns null when absent or invalid (FR-007).
export function LoginErrorBanner({ errorParam, messages }: LoginErrorBannerProps) {
  if (!isOAuthErrorCode(errorParam)) return null;
  const copy = messages.login.error[errorParam];
  if (!copy) return null;

  // PII-free analytics — emit only on server render so we don't double-count
  // (US2 AC5, spec T061). The track() helper writes a structured JSON line.
  track({ type: "login_error", provider: "google", error_code: errorParam });

  return (
    <DismissibleAlert
      autoFocus
      className="w-full max-w-[480px] rounded-lg bg-red-500/15 border border-red-400/40 text-white px-4 py-3 text-sm font-medium outline-none"
    >
      {copy}
    </DismissibleAlert>
  );
}
