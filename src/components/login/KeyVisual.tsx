import Image from "next/image";

// "ROOT FURTHER" hero artwork — design-style.md §10.
// 451×200 at desktop (aspect 115:51), responsive down to ~320px on mobile.
export function KeyVisual() {
  return (
    <Image
      src="/images/root-further.png"
      alt="Root Further"
      width={451}
      height={200}
      priority
      className="w-full max-w-[451px] h-auto motion-safe:animate-[fade-in_0.4s_ease-out]"
    />
  );
}
