import { getMessages } from "@/libs/i18n/getMessages";
import { clientEnv } from "@/libs/env/client";

// Formats the ceremony env var (ISO 8601 UTC) as `DD/MM/YYYY` in
// Asia/Ho_Chi_Minh time — matches the audience's local date. SSR + CSR
// agree because the timezone is pinned (same strategy as
// `formatKudoTimestamp.ts`).
const CEREMONY_DATE_FMT = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Ho_Chi_Minh",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function formatCeremonyDate(iso: string | undefined): string | null {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (Number.isNaN(t)) return null;
  const parts = CEREMONY_DATE_FMT.formatToParts(new Date(t));
  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? "";
  return `${pick("day")}/${pick("month")}/${pick("year")}`;
}

// Event metadata block — time + venue + livestream note. Sits below the
// countdown inside the hero content frame. Time value is derived from
// `NEXT_PUBLIC_CEREMONY_AT` (single source of truth with the Homepage
// countdown); falls back to the i18n static `timeValue` when the env
// var is unset or unparseable.
export async function EventInfo() {
  const { messages } = await getMessages();
  const e = messages.homepage.event;
  const streamNote = messages.homepage.event.streamNote;
  const ceremonyDate = formatCeremonyDate(clientEnv.NEXT_PUBLIC_CEREMONY_AT);

  return (
    <div className="flex flex-col gap-4 text-white">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-8">
        <InfoRow label={e.timeLabel} value={ceremonyDate ?? e.timeValue} />
        <InfoRow label={e.locationLabel} value={e.locationValue} />
      </div>
      <p className="font-[family-name:var(--font-montserrat)] text-base leading-6 font-bold tracking-[0.15px] text-white">
        {streamNote}
      </p>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="font-[family-name:var(--font-montserrat)] text-base leading-6 font-bold tracking-[0.15px] text-white">
        {label}
      </span>
      <span className="font-[family-name:var(--font-montserrat)] text-2xl leading-8 font-bold text-[var(--color-accent-cream)]">
        {value}
      </span>
    </div>
  );
}
