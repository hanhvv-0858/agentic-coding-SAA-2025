import Link from "next/link";

export default function StandardsPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-[var(--color-brand-900)] px-6 py-24 text-white">
      <h1 className="font-[family-name:var(--font-montserrat)] text-4xl font-bold">
        General Standards
      </h1>
      <p className="text-white/70">Coming soon.</p>
      <Link href="/" className="text-[var(--color-accent-cream)] underline">
        ← Back to home
      </Link>
    </main>
  );
}
