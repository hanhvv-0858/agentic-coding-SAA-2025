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
  | { type: "prelaunch_launch_transition" }
  // FAB quick-actions menu. Reserved for emission when Live board lands;
  // see .momorph/specs/_hphd32jN2-fab-collapsed/plan.md §Phase 6 T032.
  | { type: "fab_open" }
  | { type: "fab_action_click"; action: "rules" | "write_kudo" }
  | { type: "fab_close_cancel" }
  // Kudos Live board (spec MaZUn5xHXZ) — plan §Analytics events.
  // 8 new typed events; no runtime change in this file — consumers emit
  // via the existing `track()` below. `kudos_compose_open` supersedes the
  // FR-021 placeholders (feed view / heart / filter preserved; granularity
  // now covers composer hand-off, copy-link, carousel/spotlight gestures).
  | {
      type: "kudos_feed_view";
      filters?: { hashtag?: string; department?: string };
    }
  | {
      type: "kudos_filter_apply";
      kind: "hashtag" | "department";
      value: string;
    }
  | {
      type: "kudos_heart_toggle";
      id: string;
      action: "add" | "remove";
      multiplier?: 1 | 2;
    }
  | { type: "kudos_card_open"; id: string; source: "feed" | "carousel" }
  | { type: "kudos_copy_link"; id: string }
  | { type: "kudos_spotlight_pan"; delta_x: number; delta_y: number }
  | {
      type: "kudos_carousel_scroll";
      from_index: number;
      to_index: number;
    }
  | { type: "kudos_compose_open"; source: "liveboard_pill" | "fab" }
  // Viết Kudo compose flow (spec ihQ26W78P2) — added in PR 2.
  | { type: "kudos_compose_submit"; kudo_id: string }
  | { type: "kudos_compose_cancel"; reason: "hủy_button" | "esc" | "backdrop" }
  // Onboarding — complete profile (spec ObrdH9pKx7). Payload is PII-free by
  // design (no user id, no department_code, no name fragment) — see spec Q3.
  | {
      type: "onboarding_complete";
      has_display_name_changed: boolean;
      has_department_changed: boolean;
    };

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
