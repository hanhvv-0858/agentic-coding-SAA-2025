"use client";

import { useEffect } from "react";

// Kudos Live board error boundary (App Router convention). Catches RSC
// render errors + Server Action failures below this route segment.
// Client component per Next.js requirement. Phase 2 ships a minimal
// shell; i18n copy via `messages.kudos.error.*` is rendered inline (the
// error boundary doesn't get Messages from getMessages() — we hard-code
// safe fallbacks here and the richer experience comes with the
// InlineError component in Phase 3 US1).
export default function KudosError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to console with digest for server-side correlation. Swap for
    // a real logger once the analytics vendor lands.
    console.error("[/kudos error]", { digest: error.digest, message: error.message });
  }, [error]);

  return (
    <main
      id="main"
      className="flex flex-1 flex-col items-center justify-center gap-4 bg-[var(--color-brand-900)] px-6 py-24 text-white"
    >
      <h1 className="font-[family-name:var(--font-montserrat)] text-2xl font-bold">
        Không tải được Sun* Kudos
      </h1>
      <p className="text-white/70">Vui lòng thử lại trong giây lát.</p>
      <button
        type="button"
        onClick={reset}
        className="rounded-[var(--radius-filter-chip)] bg-[var(--color-accent-cream)] px-6 py-2 text-[var(--color-brand-900)] hover:bg-[var(--color-accent-cream-hover)]"
      >
        Thử lại
      </button>
    </main>
  );
}
