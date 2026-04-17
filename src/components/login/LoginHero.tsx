import { KeyVisual } from "./KeyVisual";
import { HeroCopy } from "./HeroCopy";
import { GoogleLoginButton } from "./GoogleLoginButton";
import { LoginErrorBanner } from "./LoginErrorBanner";
import type { Messages } from "@/libs/i18n/getMessages";

type LoginHeroProps = {
  messages: Messages;
  errorParam: string | null | undefined;
  nextParam: string | null | undefined;
};

// Hero content column — design-style.md §8, §9, §11.
// Frame 487 (1152×653, gap 80px) → Frame 550 (text + CTA column, gap 24px).
export function LoginHero({ messages, errorParam, nextParam }: LoginHeroProps) {
  return (
    <section className="relative z-20 w-full max-w-[1152px] flex flex-col items-start gap-12 lg:gap-20 justify-center px-4 py-12 sm:px-12 lg:px-36 lg:py-24 lg:gap-[120px]">
      <KeyVisual />
      <div className="flex flex-col items-start gap-6 pl-0 lg:pl-4 w-full max-w-[496px]">
        <LoginErrorBanner errorParam={errorParam} messages={messages} />
        <HeroCopy messages={messages} />
        <GoogleLoginButton
          defaultLabel={messages.login.cta.default}
          loadingLabel={messages.login.cta.loading}
          nextParam={nextParam ?? null}
        />
      </div>
    </section>
  );
}
