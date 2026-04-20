import type { Messages } from "@/libs/i18n/getMessages";
import type { KudosStats } from "@/types/kudo";
import { MoQuaCTA } from "./MoQuaCTA";

type StatsBlockProps = {
  stats: KudosStats;
  messages: Messages;
};

/**
 * §D.1 StatsBlock — dark cream-bordered card with 5 labelled numeric
 * rows + a divider + `MoQuaCTA` at the bottom. Each row is rendered as
 * a `<dl>` pair for SR friendliness (design-style §21).
 */
export function StatsBlock({ stats, messages }: StatsBlockProps) {
  const rows: Array<{ label: string; value: number; key: string }> = [
    {
      key: "received",
      label: messages.kudos.sidebar.statReceived,
      value: stats.receivedCount,
    },
    {
      key: "sent",
      label: messages.kudos.sidebar.statSent,
      value: stats.sentCount,
    },
    {
      key: "hearts",
      label: messages.kudos.sidebar.statHearts,
      value: stats.heartsReceived,
    },
    {
      key: "boxesOpened",
      label: messages.kudos.sidebar.statBoxesOpened,
      value: stats.secretBoxesOpened,
    },
    {
      key: "boxesUnopened",
      label: messages.kudos.sidebar.statBoxesUnopened,
      value: stats.secretBoxesUnopened,
    },
  ];

  return (
    <section
      aria-label={messages.kudos.sidebar.statsTitle}
      className="flex w-full flex-col items-start gap-2.5 rounded-[17px] border border-[var(--color-border-secondary)] bg-[var(--color-panel-surface)] p-6"
      data-testid="kudos-stats-block"
    >
      <dl className="flex w-full flex-col gap-2">
        {rows.map((row, index) => (
          <div key={row.key} className="contents">
            {row.key === "boxesOpened" ? (
              <div
                className="my-3 h-px w-full bg-[var(--color-accent-cream)]"
                aria-hidden="true"
                data-testid="kudos-stats-divider"
              />
            ) : null}
            <div
              className="flex w-full items-center justify-between"
              data-testid="kudos-stats-row"
              data-stat={row.key}
              data-index={index}
            >
              <dt className="font-[family-name:var(--font-montserrat)] text-[22px] font-bold leading-8 text-white">
                {row.label}
              </dt>
              <dd className="font-[family-name:var(--font-montserrat)] text-[32px] font-bold text-[var(--color-accent-cream)]">
                {row.value}
              </dd>
            </div>
          </div>
        ))}
      </dl>
      <MoQuaCTA
        unopened={stats.secretBoxesUnopened}
        messages={messages}
      />
    </section>
  );
}
