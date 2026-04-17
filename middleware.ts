import type { NextRequest } from "next/server";
import { updateSession } from "@/libs/supabase/middleware";

export async function middleware(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Match everything except static assets and Next.js internals.
    "/((?!_next/static|_next/image|favicon.ico|images/|icons/).*)",
  ],
};
