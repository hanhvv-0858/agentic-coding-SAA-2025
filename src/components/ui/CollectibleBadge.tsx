import Image from "next/image";

export type CollectibleName =
  | "revival"
  | "touch-of-light"
  | "stay-gold"
  | "flow-to-horizon"
  | "beyond-the-boundary"
  | "root-further";

type CollectibleBadgeProps = {
  name: CollectibleName;
  label: string;
  /** When true, render the image from `/public/images/the-le/badge-{name}.png`.
   *  Defaults to false (CSS placeholder circle) until the flattened exports
   *  land — see `.momorph/specs/b1Filzi9i6-the-le/assets-map.md`. */
  hasImage?: boolean;
  className?: string;
};

const SHORT_LABEL_NAMES: ReadonlySet<CollectibleName> = new Set(["revival", "stay-gold"]);

// Reusable collectible-badge cell — 80-wide column flex containing a 64×64
// circle + caption. Used in the Thể lệ sender-section badge grid and planned
// for reuse on Profile and the Secret Box flow (spec TR-005).
export function CollectibleBadge({ name, label, hasImage = false, className }: CollectibleBadgeProps) {
  const labelSize = SHORT_LABEL_NAMES.has(name) ? "text-[12px]" : "text-[11px]";
  return (
    <div
      className={[
        "flex w-20 flex-col items-center justify-center gap-2",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="relative block h-16 w-16 overflow-hidden rounded-full border-2 border-white">
        {hasImage ? (
          <Image
            src={`/images/the-le/badge-${name}.png`}
            alt=""
            fill
            sizes="64px"
            className="object-cover"
            aria-hidden="true"
            unoptimized
          />
        ) : (
          <span
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,234,158,0.18)_0%,rgba(0,0,0,0)_70%)]"
          />
        )}
      </span>
      <span
        className={[
          "block w-20 text-center font-[family-name:var(--font-montserrat)] leading-4 font-bold tracking-[0.5px] text-white",
          labelSize,
        ].join(" ")}
      >
        {label}
      </span>
    </div>
  );
}
