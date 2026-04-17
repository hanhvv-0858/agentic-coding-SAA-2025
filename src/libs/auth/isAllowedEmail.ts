import { env } from "@/libs/env/server";

// Returns true only when the email's domain (case-insensitive) appears in
// ALLOWED_EMAIL_DOMAINS. Defense-in-depth against Supabase allow-list drift.
export function isAllowedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const at = email.lastIndexOf("@");
  if (at < 1 || at === email.length - 1) return false;
  const domain = email.slice(at + 1).toLowerCase();
  return env.ALLOWED_EMAIL_DOMAINS.includes(domain);
}
