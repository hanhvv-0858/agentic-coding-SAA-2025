import Image from "next/image";
import { getMessages } from "@/libs/i18n/getMessages";
import type { Messages } from "@/libs/i18n/getMessages";
import type { NavItem } from "@/data/navItems";
import { NavLink } from "./NavLink";

type SiteFooterProps = {
  navItems?: readonly NavItem[];
  showLogo?: boolean;
};

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

// Copyright bar — design-style.md §15. Two modes:
//   • default (Login compat): centered copyright only
//   • extended (Homepage): logo + nav links + copyright row
export async function SiteFooter({ navItems, showLogo = false }: SiteFooterProps = {}) {
  const { messages } = await getMessages();

  if (!navItems || navItems.length === 0) {
    return (
      <footer className="relative z-20 w-full flex items-center justify-center border-t border-[var(--color-divider)] px-4 py-6 sm:px-12 lg:px-[90px] lg:py-10">
        <small className="font-[family-name:var(--font-montserrat-alt)] text-base leading-6 font-bold text-white text-center">
          {messages.common.footer.copyright}
        </small>
      </footer>
    );
  }

  return (
    <footer className="relative z-20 w-full border-t border-[var(--color-divider)] px-4 py-8 sm:px-12 lg:px-[90px] lg:py-10">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-6">
          {showLogo && (
            <Image
              src="/images/saa-logo.png"
              alt="Sun Annual Awards 2025"
              width={69}
              height={64}
            />
          )}
          <nav aria-label="Footer" className="flex flex-wrap items-center gap-4 lg:gap-12">
            {navItems.map((item) => (
              <NavLink key={item.href} href={item.href}>
                {resolveKey(messages, item.labelKey)}
              </NavLink>
            ))}
          </nav>
        </div>
        <small className="font-[family-name:var(--font-montserrat-alt)] text-base leading-6 font-bold text-white">
          {messages.common.footer.copyright}
        </small>
      </div>
    </footer>
  );
}
