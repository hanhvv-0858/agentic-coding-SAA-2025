import type { Messages } from "@/libs/i18n/getMessages";
import { RulesContent } from "./RulesContent";
import { CloseButton } from "./CloseButton";
import { WriteKudosButton } from "./WriteKudosButton";

type RulesPanelProps = {
  rules: Messages["rules"];
};

// The Thể lệ panel — full-bleed sheet on mobile, centered on tablet, and
// right-anchored on desktop (lg:) per plan.md responsive spec. Uses the new
// --color-panel-surface token; container handles its own overflow so the
// content scrolls while the footer stays pinned (FR-006).
export function RulesPanel({ rules }: RulesPanelProps) {
  return (
    <div className="bg-[var(--color-panel-surface)] w-full lg:ml-auto lg:mr-10 lg:w-[553px] sm:max-w-[553px] sm:mx-auto">
      <div className="flex min-h-[calc(100dvh-88px)] max-h-[calc(100dvh-88px)] flex-col gap-10 px-5 pt-5 pb-6 sm:px-10 sm:pt-6 sm:pb-10">
        <h1
          id="rules-title"
          className="font-[family-name:var(--font-montserrat)] text-[36px] leading-[44px] font-bold text-[var(--color-accent-cream)] sm:text-[45px] sm:leading-[52px]"
        >
          {rules.title}
        </h1>
        <RulesContent rules={rules} />
        <footer className="flex w-full flex-row items-stretch gap-4">
          <CloseButton label={rules.actions.close} />
          <WriteKudosButton label={rules.actions.writeKudos} />
        </footer>
      </div>
    </div>
  );
}
