// Typed analytics emitter. Vendor-agnostic — writes to window.dataLayer on the
// client and a structured JSON line on the server. Swap the sinks in a later
// feature once an analytics vendor is chosen. PII scrubbing is the caller's
// responsibility; helper functions below make the scrub explicit.

export type AnalyticsEvent =
  | { type: "screen_view"; screen: string }
  | { type: "login_attempt"; provider: "google" }
  | { type: "login_success"; user_id: string; email_domain: string }
  | { type: "login_error"; provider: "google"; error_code: string }
  | { type: "language_change"; from: string; to: string }
  | { type: "rules_view"; source: "homepage" | "live-board" | "compose" | "direct" }
  | { type: "rules_close"; via: "button" | "esc" | "backdrop" }
  | { type: "rules_cta_write_kudos" }
  | { type: "prelaunch_view"; remaining_minutes: number }
  | { type: "prelaunch_launch_transition" };

declare global {
  interface Window {
    dataLayer?: Array<AnalyticsEvent>;
  }
}

export function track(event: AnalyticsEvent): void {
  if (typeof window === "undefined") {
    // Server — stdout JSON is good enough for Cloudflare Workers logs.
    console.log(JSON.stringify({ event: event.type, ...event }));
    return;
  }
  if (!window.dataLayer) window.dataLayer = [];
  window.dataLayer.push(event);
}

// Extract the domain portion of an email for PII-free analytics.
export function emailDomain(email: string): string {
  const at = email.lastIndexOf("@");
  return at >= 0 ? email.slice(at + 1).toLowerCase() : "";
}
