import { getMessages } from "@/libs/i18n/getMessages";
import { SiteLogo } from "./SiteLogo";
import { LanguageToggle } from "./LanguageToggle";

// Top nav — design-style.md §5. Absolute-positioned over the hero, translucent
// dark background, px-36 (144px) at desktop per the Figma inset.
export async function SiteHeader() {
  const { locale, messages } = await getMessages();
  const label = messages.common.language.label[locale];
  const ariaLabel = messages.common.language.toggle[locale];

  return (
    <header className="absolute inset-x-0 top-0 z-40 h-20 flex items-center justify-between bg-[var(--color-brand-800)]/80 backdrop-blur-sm px-4 py-3 sm:px-12 lg:px-36">
      <SiteLogo />
      <LanguageToggle locale={locale} label={label} ariaLabel={ariaLabel} />
    </header>
  );
}
