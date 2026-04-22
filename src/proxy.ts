import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/libs/supabase/middleware";

// Next.js 16 renamed the `middleware` file convention to `proxy`. The
// exported function + `config.matcher` contract is unchanged; only the
// filename and the exported symbol name are different.
// See: https://nextjs.org/docs/messages/middleware-to-proxy
export async function proxy(request: NextRequest) {
  // Prelaunch dispatch — rewrite `/` → `/countdown` while the event hasn't
  // started yet. This branch intentionally SKIPS `updateSession(request)`:
  // prelaunch visitors are typically anonymous, and signed-in users who
  // happen to land on `/` pre-launch get a session refresh on any other
  // navigation (the session lifetime comfortably exceeds the prelaunch
  // window). Merging rewrite + cookie-carry would add complexity for
  // negligible benefit — see plan.md §Notes on middleware session-refresh
  // tradeoff.
  // Prelaunch gate is driven by NEXT_PUBLIC_SITE_LAUNCH_AT (mốc A — site
  // opens). Independent of NEXT_PUBLIC_CEREMONY_AT (mốc B — gala night)
  // which powers the Homepage About-SAA countdown only.
  const target = process.env.NEXT_PUBLIC_SITE_LAUNCH_AT;
  if (target && request.nextUrl.pathname === "/") {
    const targetMs = Date.parse(target);
    if (!Number.isNaN(targetMs) && Date.now() < targetMs) {
      const url = request.nextUrl.clone();
      url.pathname = "/countdown";
      return NextResponse.rewrite(url);
    }
  }
  return updateSession(request);
}

export const config = {
  matcher: [
    // Root path explicit — the negative-lookahead pattern below requires
    // at least one character after the leading slash, so `/` needs its
    // own entry. Without this, prelaunch rewrite on `/` would silently
    // skip the proxy and the homepage would render through.
    "/",
    // Everything else except static assets and Next.js internals.
    "/((?!_next/static|_next/image|favicon.ico|images/|icons/).*)",
  ],
};
