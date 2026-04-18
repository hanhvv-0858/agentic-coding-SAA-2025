import Link from "next/link";
import { getMessages } from "@/libs/i18n/getMessages";
import { PrimaryButton } from "@/components/ui/PrimaryButton";
import { Icon } from "@/components/ui/Icon";

// Hero CTA row — two buttons side-by-side with a 40px gap (FR-006). Both CTAs
// have a trailing arrow icon matching the Figma reference.
export async function HeroCtas() {
  const { messages } = await getMessages();
  const cta = messages.homepage.cta;

  return (
    <div className="flex flex-wrap items-center gap-6 sm:gap-10">
      <Link href="/awards" aria-label={cta.aboutAwards}>
        <PrimaryButton
          variant="solid"
          tabIndex={-1}
          trailingIcon={<Icon name="arrow-right" size={22} />}
        >
          {cta.aboutAwards}
        </PrimaryButton>
      </Link>
      <Link href="/kudos" aria-label={cta.aboutKudos}>
        <PrimaryButton
          variant="outline"
          tabIndex={-1}
          trailingIcon={<Icon name="arrow-right" size={22} />}
        >
          {cta.aboutKudos}
        </PrimaryButton>
      </Link>
    </div>
  );
}
