import type { ReactNode } from "react";
import { getMessages } from "@/libs/i18n/getMessages";
import type { Messages } from "@/libs/i18n/getMessages";
import type { NavItem } from "@/data/navItems";
import { SiteLogo } from "./SiteLogo";
import { LanguageToggle } from "./LanguageToggle";
import { NavLink } from "./NavLink";

type BgVariant = "brand-800" | "brand-700";

type SiteHeaderProps = {
  navItems?: readonly NavItem[];
  right?: ReactNode;
  sticky?: boolean;
  bgVariant?: BgVariant;
};

const BG_CLASS: Record<BgVariant, string> = {
  "brand-800": "bg-[var(--color-brand-800)]/80",
  "brand-700": "bg-[var(--color-brand-700)]/80",
};

// Resolves dotted i18n keys like "common.nav.aboutSaa" against the catalog.
function resolveKey(messages: Messages, key: string): string {
  const parts = key.split(".");
  let cursor: unknown = messages;
  for (const part of parts) {
    if (cursor && typeof cursor === "object" && part in cursor) {
      cursor = (cursor as Record<string, unknown>)[part];
    } else {
      return key;
    }
  }
  return typeof cursor === "string" ? cursor : key;
}

// Top nav — design-style.md §5. Floats over the hero with a translucent
// backdrop. When navItems are provided (Homepage), renders the full nav row;
// otherwise falls back to logo + language toggle (Login compatibility).
export async function SiteHeader({
  navItems,
  right,
  sticky = false,
  bgVariant = "brand-800",
}: SiteHeaderProps = {}) {
  const { locale, messages } = await getMessages();
  const label = messages.common.language.label[locale];
  const ariaLabel = messages.common.language.toggle[locale];

  const positionClass = sticky ? "sticky top-0" : "absolute inset-x-0 top-0";
  const rightSlot = right ?? (
    <LanguageToggle locale={locale} label={label} ariaLabel={ariaLabel} />
  );

  return (
    <header
      className={[
        positionClass,
        "z-40 h-20 flex items-center justify-between backdrop-blur-sm px-4 py-3 sm:px-12 lg:px-36",
        BG_CLASS[bgVariant],
      ].join(" ")}
    >
      <div className="flex items-center gap-6 lg:gap-16">
        <SiteLogo asLink={Boolean(navItems && navItems.length > 0)} />
        {navItems && navItems.length > 0 && (
          <nav aria-label="Primary" className="hidden md:flex items-center gap-4 lg:gap-6">
            {navItems.map((item) => (
              <NavLink key={item.href} href={item.href}>
                {resolveKey(messages, item.labelKey)}
              </NavLink>
            ))}
          </nav>
        )}
      </div>
      <div className="flex items-center gap-2 lg:gap-4">{rightSlot}</div>
    </header>
  );
}
