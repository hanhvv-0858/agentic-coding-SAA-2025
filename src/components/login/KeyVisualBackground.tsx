import Image from "next/image";

// Full-bleed hero background + two gradient vignettes per design-style.md §2-§4.
// The `login-bg.jpg` key visual isn't exported by MoMorph `get_media_files` —
// the user needs to export it directly from the `C_Keyvisual` Figma node. Until
// then, the dark brand background + the Root Further logo carry the hero.
export function KeyVisualBackground() {
  return (
    <>
      {/* Base background image. File drop: /public/images/login-bg.jpg.
          If the file is absent (hero background wasn't exported by Figma),
          next/image renders an empty slot — the dark brand fallback + the
          gradient vignettes below still carry the visual composition. */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src="/images/login-bg.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      </div>

      {/* Left vignette — Rectangle 57 */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-10 bg-[linear-gradient(90deg,#00101A_0%,#00101A_25.41%,rgba(0,16,26,0)_100%)]"
      />

      {/* Bottom vignette — Cover */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 z-10 h-[70%] bg-[linear-gradient(0deg,#00101A_22.48%,rgba(0,19,32,0)_51.74%)]"
      />
    </>
  );
}
