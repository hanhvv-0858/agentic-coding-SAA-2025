import { getMessages } from "@/libs/i18n/getMessages";

// Event metadata block — time + venue + livestream note. Sits below the
// countdown inside the hero content frame.
export async function EventInfo() {
  const { messages } = await getMessages();
  const e = messages.homepage.event;
  const streamNote = messages.homepage.event.streamNote;

  return (
    <div className="flex flex-col gap-4 text-white">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-8">
        <InfoRow label={e.timeLabel} value={e.timeValue} />
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
