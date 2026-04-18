import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

type NotificationBellProps = {
  initialUnreadCount: number;
  ariaLabelTemplate: string;
};

// Bell icon with red unread-count badge. Badge is capped at "99+". Wraps the
// icon in a Link to /notifications so keyboard + click both navigate.
export function NotificationBell({ initialUnreadCount, ariaLabelTemplate }: NotificationBellProps) {
  const count = Math.max(0, Math.trunc(initialUnreadCount));
  const badgeText = count === 0 ? "" : count > 99 ? "99+" : String(count);
  const ariaLabel = ariaLabelTemplate.replace("{count}", String(count));

  return (
    <Link
      href="/notifications"
      aria-label={ariaLabel}
      className="relative flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-cream)] focus-visible:outline-offset-2"
    >
      <Icon name="bell" size={24} />
      {badgeText && (
        <span
          aria-hidden="true"
          className="absolute -top-1 -right-1 inline-flex min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 font-[family-name:var(--font-montserrat)] text-[11px] leading-none font-bold text-white"
          style={{ height: 20 }}
        >
          {badgeText}
        </span>
      )}
    </Link>
  );
}
