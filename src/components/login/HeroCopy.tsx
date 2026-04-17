import type { Messages } from "@/libs/i18n/getMessages";

type HeroCopyProps = { messages: Messages };

// Two-line intro — design-style.md §12. Montserrat 20/40/700 +0.5px, white.
export function HeroCopy({ messages }: HeroCopyProps) {
  return (
    <p className="font-[family-name:var(--font-montserrat)] text-lg leading-7 font-bold tracking-[0.5px] text-white sm:text-xl sm:leading-[40px] motion-safe:animate-[fade-in_0.4s_ease-out]">
      {messages.login.hero.line1}
      <br />
      {messages.login.hero.line2}
    </p>
  );
}
