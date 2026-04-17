import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/libs/supabase/server";
import { parseCallbackParams } from "@/libs/auth/callbackParams";
import { isAllowedEmail } from "@/libs/auth/isAllowedEmail";
import { validateNextParam } from "@/libs/auth/validateNextParam";
import { mapOAuthError } from "@/libs/auth/mapOAuthError";
import type { OAuthErrorCode } from "@/types/auth";

function redirectToLogin(request: NextRequest, error: OAuthErrorCode): NextResponse {
  const url = new URL("/login", request.url);
  url.searchParams.set("error", error);
  return NextResponse.redirect(url, { status: 302 });
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const params = parseCallbackParams(request.nextUrl.searchParams);

  // Failure path — Google returned an `?error=...` or the user denied consent.
  if (params.error) {
    return redirectToLogin(request, mapOAuthError(params.error));
  }

  // Success path must carry a `code`. Absence is treated as an invalid session.
  if (!params.code) {
    return redirectToLogin(request, "session_exchange_failed");
  }

  const supabase = await createClient();

  // Exchange the OAuth code for a Supabase session cookie.
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(params.code);
  if (exchangeError) {
    // Supabase network failures surface with status/message hints we can use.
    const isNetwork =
      exchangeError.status === 0 ||
      (exchangeError.status !== undefined && exchangeError.status >= 500) ||
      /network|timeout|fetch/i.test(exchangeError.message ?? "");
    return redirectToLogin(request, isNetwork ? "network" : "session_exchange_failed");
  }

  // Domain allow-list re-check (defense in depth — the primary gate lives in
  // the Supabase Auth config). Revoke the session before redirecting so the
  // cookie doesn't linger.
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) {
    return redirectToLogin(request, "session_exchange_failed");
  }
  if (!isAllowedEmail(userData.user.email)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(new URL("/error/403", request.url), { status: 302 });
  }

  // Validated same-origin redirect target.
  const target = validateNextParam(params.next);
  return NextResponse.redirect(new URL(target, request.url), { status: 302 });
}
