import Image from "next/image";
import { LogoLink } from "./LogoLink";

// SAA 2025 brand logo — design-style.md §6, Figma node I662:14391;186:2166.
// 52×56 wrapper; the image inside is 52×48. When `asLink` is set (Homepage),
// renders inside a LogoLink so clicking the logo navigates home or scrolls
// to the top if already there (FR-014). Login call sites omit `asLink` to
// keep the plain decorative behavior unchanged.
type SiteLogoProps = {
  asLink?: boolean;
};

export function SiteLogo({ asLink = false }: SiteLogoProps = {}) {
  const image = (
    <Image
      src="/images/saa-logo.png"
      alt="Sun Annual Awards 2025"
      width={52}
      height={48}
      priority
    />
  );

  if (asLink) {
    return (
      <LogoLink className="h-14 w-[52px] items-start">
        {image}
      </LogoLink>
    );
  }

  return <div className="h-14 w-[52px] flex items-start">{image}</div>;
}
