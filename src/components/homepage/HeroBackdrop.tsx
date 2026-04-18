import Image from "next/image";

// Shared full-bleed backdrop that sits behind both the Hero section and the
// Root Further narrative card. One single key visual image covers the whole
// area; a dark-left gradient keeps the content column legible while letting
// the colorful artwork bleed through on the right side and into the Root
// Further card.
export function HeroBackdrop() {
  return (
    <>
      <Image
        src="/images/homepage-hero.png"
        alt=""
        aria-hidden="true"
        fill
        priority
        sizes="100vw"
        className="pointer-events-none select-none object-cover object-right"
      />
      {/* Left-side darkening for reading legibility over the hero content. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, #00101A 0%, rgba(0,16,26,0.90) 25%, rgba(0,16,26,0.55) 50%, rgba(0,16,26,0.15) 75%, rgba(0,16,26,0) 100%)",
        }}
      />
    </>
  );
}
