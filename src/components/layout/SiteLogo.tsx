import Image from "next/image";

// SAA 2025 brand logo — design-style.md §6, Figma node I662:14391;186:2166.
// 52×56 wrapper; the image inside is 52×48.
export function SiteLogo() {
  return (
    <div className="h-14 w-[52px] flex items-start">
      <Image
        src="/images/saa-logo.png"
        alt="Sun Annual Awards 2025"
        width={52}
        height={48}
        priority
      />
    </div>
  );
}
