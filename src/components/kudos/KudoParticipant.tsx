import Image from "next/image";
import { getInitials, pickMonogramColor } from "@/libs/kudos/monogram";
import type { KudoUser } from "@/types/kudo";

type KudoParticipantProps = {
  user: KudoUser;
  /** Aria-only label (design-style §17a/17b names are `<button>`s in later phases). */
  monogramAlt: string;
};

// Maps the `honour_title` string onto the pre-rendered pill PNGs shared
// with the Thể lệ screen (design §17a — "Legend Hero"/"Rising Hero"
// badges are image assets, not text pills).
const HONOUR_PILL_MAP: Record<
  string,
  { src: string; width: number; height: number }
> = {
  "Legend Hero": {
    src: "/images/the-le/pill-legend@2x.png",
    width: 255,
    height: 47,
  },
  "Rising Hero": {
    src: "/images/the-le/pill-rising@2x.png",
    width: 255,
    height: 47,
  },
  "Super Hero": {
    src: "/images/the-le/pill-super@2x.png",
    width: 253,
    height: 44,
  },
  "New Hero": {
    src: "/images/the-le/pill-new@2x.png",
    width: 255,
    height: 47,
  },
};

/**
 * Shared render for sender (§17a) and recipient (§17b). 64×64 avatar +
 * display name + optional CECV code (grey small) + optional honour
 * title pill (dark navy with cream/red accent). Falls back to a monogram
 * circle (FR-016) when `avatar_url` is null.
 */
export function KudoParticipant({ user, monogramAlt }: KudoParticipantProps) {
  const name = user.display_name ?? "";
  const initials = getInitials(name);
  const bg = pickMonogramColor(user.id);
  const hasAvatar = Boolean(user.avatar_url);
  const honourCode = user.honour_code ?? null;
  const honourTitle = user.honour_title ?? null;

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div
        className="relative h-16 w-16 overflow-hidden rounded-full"
        data-testid="kudo-participant-avatar"
      >
        {hasAvatar ? (
          <Image
            src={user.avatar_url as string}
            alt={name || monogramAlt}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <div
            role="img"
            aria-label={name || monogramAlt}
            className="flex h-full w-full items-center justify-center text-lg font-bold text-[var(--color-brand-900)]"
            style={{ backgroundColor: bg }}
            data-testid="kudo-participant-monogram"
          >
            {initials}
          </div>
        )}
      </div>
      <span className="text-center font-[family-name:var(--font-montserrat)] text-base font-bold leading-6 text-[var(--color-brand-900)]">
        {name || monogramAlt}
      </span>
      {honourCode || honourTitle ? (
        <div className="flex items-center gap-2">
          {honourCode ? (
            <span
              className="font-[family-name:var(--font-montserrat)] text-xs font-bold leading-4 tracking-wide text-[var(--color-muted-grey)]"
              data-testid="kudo-participant-code"
            >
              {honourCode}
            </span>
          ) : null}
          {honourTitle
            ? (() => {
                const pill = HONOUR_PILL_MAP[honourTitle];
                return pill ? (
                  <Image
                    src={pill.src}
                    alt={honourTitle}
                    width={pill.width}
                    height={pill.height}
                    style={{ width: "auto" }}
                    className="h-5 w-auto select-none"
                    data-testid="kudo-participant-honour"
                  />
                ) : (
                  <span
                    className="inline-flex items-center rounded-full bg-[var(--color-brand-900)] px-2.5 py-0.5 font-[family-name:var(--font-montserrat)] text-[11px] font-bold leading-4 tracking-wide text-[var(--color-accent-cream)]"
                    data-testid="kudo-participant-honour"
                  >
                    {honourTitle}
                  </span>
                );
              })()
            : null}
        </div>
      ) : null}
    </div>
  );
}
