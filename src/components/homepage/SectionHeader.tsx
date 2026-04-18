type SectionHeaderProps = {
  caption: string;
  title: string;
  description?: string;
};

// Reusable section header — design-style §C1. Caption (white 24/32/700),
// title (cream 57/64/700), description (white 16/24/400). Title scales down
// on narrow viewports so it doesn't overflow on mobile.
export function SectionHeader({ caption, title, description }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="font-[family-name:var(--font-montserrat)] text-lg leading-7 font-bold text-white sm:text-2xl sm:leading-8">
        {caption}
      </p>
      <h2 className="font-[family-name:var(--font-montserrat)] text-4xl leading-[1.1] font-bold tracking-tight text-[var(--color-accent-cream)] sm:text-5xl lg:text-[57px] lg:leading-[64px] lg:tracking-[-0.25px]">
        {title}
      </h2>
      {description && (
        <p className="font-[family-name:var(--font-montserrat)] text-base leading-6 font-normal tracking-[0.5px] text-white max-w-2xl">
          {description}
        </p>
      )}
    </div>
  );
}
