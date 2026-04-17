import Link from "next/link";
import { getMessages } from "@/libs/i18n/getMessages";

// Minimal 403 stub. Full content comes from the Figma frame T3e_iS9PCL spec.
export default async function ForbiddenPage() {
  const { locale } = await getMessages();
  const title = locale === "vi" ? "Không có quyền truy cập" : "Access denied";
  const body =
    locale === "vi"
      ? "Tài khoản Google bạn chọn không được phép truy cập SAA 2025. Vui lòng dùng tài khoản Sun*."
      : "Your Google account is not authorized for SAA 2025. Please sign in with a Sun* account.";
  const cta = locale === "vi" ? "Quay lại đăng nhập" : "Back to sign in";

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center text-white">
      <h1 className="font-[family-name:var(--font-montserrat)] text-3xl font-bold">{title}</h1>
      <p className="max-w-md">{body}</p>
      <Link
        href="/login"
        className="rounded-lg bg-[var(--color-accent-cream)] px-6 py-3 font-bold text-[var(--color-brand-900)] hover:bg-[var(--color-accent-cream-hover)]"
      >
        {cta}
      </Link>
    </main>
  );
}
