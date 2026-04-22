import Image from "next/image";

type AccountRowProps = {
  avatarUrl: string | null;
  email: string;
  displayName: string;
};

// Account disambiguation row — design-style §4.0, spec Q2.
// Renders avatar + email so the user can confirm the Google account they
// are about to attach their SAA profile to. Display-only.
export function AccountRow({ avatarUrl, email, displayName }: AccountRowProps) {
  const initial = (displayName.trim()[0] ?? "?").toUpperCase();

  return (
    <div className="flex items-center gap-3">
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt=""
          width={32}
          height={32}
          className="h-8 w-8 rounded-full object-cover"
          unoptimized
        />
      ) : (
        <span
          aria-hidden
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[color:var(--color-accent-cream)]/30 text-[color:var(--color-brand-900)] font-[family-name:var(--font-montserrat)] text-sm font-bold leading-5"
        >
          {initial}
        </span>
      )}
      <span
        title={email}
        className="truncate font-[family-name:var(--font-montserrat)] text-sm leading-5 text-[color:var(--color-brand-900)]"
      >
        {email}
      </span>
    </div>
  );
}
