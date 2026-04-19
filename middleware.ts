import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/libs/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Prelaunch dispatch — rewrite `/` → `/countdown` while the event hasn't
  // started yet. This branch intentionally SKIPS `updateSession(request)`:
  // prelaunch visitors are typically anonymous, and signed-in users who
  // happen to land on `/` pre-launch get a session refresh on any other
  // navigation (the session lifetime comfortably exceeds the prelaunch
  // window). Merging rewrite + cookie-carry would add complexity for
  // negligible benefit — see plan.md §Notes on middleware session-refresh
  // tradeoff. Resolution Q5 (spec b1Filzi9i6-the-le counterpart for rules
  // was similar).
  const target = process.env.NEXT_PUBLIC_EVENT_START_AT;
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
    // Match everything except static assets and Next.js internals.
    "/((?!_next/static|_next/image|favicon.ico|images/|icons/).*)",
  ],
};
