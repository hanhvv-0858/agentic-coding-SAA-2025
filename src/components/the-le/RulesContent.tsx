import type { Messages } from "@/libs/i18n/getMessages";
import { ReceiverSection } from "./sections/ReceiverSection";
import { SenderSection } from "./sections/SenderSection";
import { NationalKudosSection } from "./sections/NationalKudosSection";

type RulesContentProps = {
  rules: Messages["rules"];
};

// Scrollable content block — composes the three rule sections in order.
// The scroll responsibility lives on the parent `<RulesPanel>` so the
// footer bar stays pinned while the content column scrolls (FR-006).
export function RulesContent({ rules }: RulesContentProps) {
  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto pr-1">
      <ReceiverSection rules={rules} />
      <SenderSection rules={rules} />
      <NationalKudosSection rules={rules} />
    </div>
  );
}
