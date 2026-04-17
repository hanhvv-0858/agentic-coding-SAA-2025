import Link from "next/link";
import { getMessages } from "@/libs/i18n/getMessages";

// Minimal 404 stub. Full content comes from the Figma frame p0yJ89B-9_ spec.
export default async function NotFoundPage() {
  const { locale } = await getMessages();
  const title = locale === "vi" ? "Không tìm thấy trang" : "Page not found";
  const cta = locale === "vi" ? "Về trang chính" : "Back to home";

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center text-white">
      <h1 className="font-[family-name:var(--font-montserrat)] text-3xl font-bold">{title}</h1>
      <Link
        href="/"
        className="rounded-lg bg-[var(--color-accent-cream)] px-6 py-3 font-bold text-[var(--color-brand-900)] hover:bg-[var(--color-accent-cream-hover)]"
      >
        {cta}
      </Link>
    </main>
  );
}
