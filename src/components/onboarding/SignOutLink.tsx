import { signOut } from "@/libs/auth/signOut";

type SignOutLinkProps = {
  label: string;
};

// Recovery affordance — design-style §5.1, spec Q7.
// Lets a user who signed in with the wrong Google account sign out without
// clearing cookies manually. Reuses the existing `signOut` Server Action.
export function SignOutLink({ label }: SignOutLinkProps) {
  return (
    <form action={signOut} className="flex justify-center">
      <button
        type="submit"
        className="font-[family-name:var(--font-montserrat)] text-xs leading-5 underline text-[color:var(--color-brand-900)]/70 hover:text-[color:var(--color-brand-900)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent-cream)] rounded px-1 py-1 cursor-pointer"
      >
        {label}
      </button>
    </form>
  );
}
