import { getMessages } from "@/libs/i18n/getMessages";
import { SectionHeader } from "./SectionHeader";
import { AwardGrid } from "./AwardGrid";

// Awards section — header + 3×2 grid. 80px gap between header and grid.
export async function AwardsSection() {
  const { messages } = await getMessages();
  const a = messages.homepage.awards;

  return (
    <section className="mx-auto w-full max-w-[1224px] px-4 sm:px-8 lg:px-0">
      <div className="flex flex-col gap-10 lg:gap-16">
        <SectionHeader caption={a.caption} title={a.title} description={a.description} />
        <AwardGrid />
      </div>
    </section>
  );
}
