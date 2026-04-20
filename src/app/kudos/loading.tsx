// Kudos Live board loading fallback — skeleton shell while the RSC
// resolves Server Actions. Phase 2 placeholder; richer skeleton atoms
// (KudoCardSkeleton) land in Phase 3 (US1 per tasks.md T039).
export default function KudosLoading() {
  return (
    <main
      id="main"
      className="flex flex-1 flex-col bg-[var(--color-brand-900)] text-white"
      aria-busy="true"
      aria-live="polite"
    >
      <section className="mx-auto w-full max-w-[1152px] 2xl:max-w-[1400px] px-4 2xl:px-12 pt-16 pb-8 sm:px-8">
        <div className="h-12 w-64 animate-pulse rounded bg-white/10" />
      </section>
      <section className="mx-auto w-full max-w-[1152px] 2xl:max-w-[1400px] px-4 2xl:px-12 pb-8 sm:px-8">
        <div className="h-56 w-full animate-pulse rounded-[var(--radius-highlight-card)] bg-white/5" />
      </section>
      <section className="mx-auto w-full max-w-[1152px] 2xl:max-w-[1400px] px-4 2xl:px-12 pb-24 sm:px-8">
        <div className="flex flex-col gap-4">
          <div className="h-40 w-full animate-pulse rounded-[var(--radius-kudo-card)] bg-white/5" />
          <div className="h-40 w-full animate-pulse rounded-[var(--radius-kudo-card)] bg-white/5" />
          <div className="h-40 w-full animate-pulse rounded-[var(--radius-kudo-card)] bg-white/5" />
        </div>
      </section>
    </main>
  );
}
