"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { isSupportedLocale, type Locale } from "@/types/auth";
import { LOCALE_COOKIE } from "./getMessages";

const ONE_YEAR = 60 * 60 * 24 * 365;

// Server Action — writes NEXT_LOCALE cookie and revalidates the current layout
// so server components re-render in the new language. Rejects unsupported
// locales silently (cookie stays untouched).
export async function setLocale(next: Locale): Promise<void> {
  if (!isSupportedLocale(next)) return;

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, next, {
    path: "/",
    sameSite: "lax",
    maxAge: ONE_YEAR,
  });

  revalidatePath("/");
}
