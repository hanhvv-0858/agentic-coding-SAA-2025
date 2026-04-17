import { getMessages } from "@/libs/i18n/getMessages";

// Copyright bar — design-style.md §15 (use justify-center for the single
// visible child, despite Figma's exported `space-between`).
export async function SiteFooter() {
  const { messages } = await getMessages();

  return (
    <footer className="relative z-20 w-full flex items-center justify-center border-t border-[var(--color-divider)] px-4 py-6 sm:px-12 lg:px-[90px] lg:py-10">
      <small className="font-[family-name:var(--font-montserrat-alt)] text-base leading-6 font-bold text-white text-center">
        {messages.common.footer.copyright}
      </small>
    </footer>
  );
}
