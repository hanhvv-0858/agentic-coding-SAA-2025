import { cookies } from "next/headers";
import { DEFAULT_LOCALE, isSupportedLocale, type Locale } from "@/types/auth";
import vi from "@/messages/vi.json";
import en from "@/messages/en.json";

export type Messages = typeof vi;

const CATALOG: Record<Locale, Messages> = { vi, en: en as Messages };

export const LOCALE_COOKIE = "NEXT_LOCALE";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const raw = cookieStore.get(LOCALE_COOKIE)?.value;
  return isSupportedLocale(raw) ? raw : DEFAULT_LOCALE;
}

export async function getMessages(): Promise<{ locale: Locale; messages: Messages }> {
  const locale = await getLocale();
  return { locale, messages: CATALOG[locale] };
}
