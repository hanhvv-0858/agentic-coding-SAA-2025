import { getMessages } from "@/libs/i18n/getMessages";
import type { Messages } from "@/libs/i18n/getMessages";
import { AWARDS } from "@/data/awards";
import { AwardCard } from "./AwardCard";

function resolveKey(messages: Messages, key: string): string {
  const parts = key.split(".");
  let cursor: unknown = messages;
  for (const part of parts) {
    if (cursor && typeof cursor === "object" && part in cursor) {
      cursor = (cursor as Record<string, unknown>)[part];
    } else {
      return key;
    }
  }
  return typeof cursor === "string" ? cursor : key;
}

// 3×2 responsive grid of award cards.
export async function AwardGrid() {
  const { messages } = await getMessages();
  const detailLabel = messages.homepage.awards.detailLink;

  return (
    <ul className="grid list-none grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
      {AWARDS.map((award) => (
        <li key={award.id}>
          <AwardCard
            award={award}
            title={resolveKey(messages, award.titleKey)}
            description={resolveKey(messages, award.descKey)}
            detailLabel={detailLabel}
          />
        </li>
      ))}
    </ul>
  );
}
