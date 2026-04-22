"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { Icon } from "@/components/ui/Icon";
import { AccountRow } from "@/components/onboarding/AccountRow";
import { SignOutLink } from "@/components/onboarding/SignOutLink";
import { completeOnboarding } from "@/app/onboarding/actions";
import {
  validateDepartmentCode,
  validateDisplayName,
} from "@/libs/onboarding/validation";
import type { Messages } from "@/libs/i18n/getMessages";

type Department = { code: string; label: string };

export type OnboardingFormProps = {
  initialDisplayName: string;
  avatarUrl: string | null;
  email: string;
  departments: Department[];
  initialSubmitError: "generic" | "session_expired" | null;
  messages: Messages;
};

type FieldErrors = {
  displayName?: string;
  department?: string;
};

export function OnboardingForm({
  initialDisplayName,
  avatarUrl,
  email,
  departments,
  initialSubmitError,
  messages,
}: OnboardingFormProps) {
  const m = messages.onboarding;
  const [displayName, setDisplayName] = useState(initialDisplayName);
  const [departmentCode, setDepartmentCode] = useState<string>("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<"generic" | "session_expired" | null>(
    initialSubmitError,
  );
  const bannerRef = useRef<HTMLDivElement | null>(null);
  const displayNameId = useId();
  const departmentId = useId();

  const allowedCodes = useMemo(() => departments.map((d) => d.code), [departments]);

  // Auto-focus the banner on mount so screen readers announce it immediately.
  useEffect(() => {
    if (submitError && bannerRef.current) {
      bannerRef.current.focus();
    }
  }, [submitError]);

  // Q8: session-expired → 1.5 s delay → /login redirect.
  useEffect(() => {
    if (submitError !== "session_expired") return;
    const timer = window.setTimeout(() => {
      window.location.assign("/login?next=/onboarding");
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [submitError]);

  const validateName = (value: string): string | undefined => {
    const result = validateDisplayName(value);
    if (result.ok) return undefined;
    return m.errors.displayName[result.reason];
  };

  const validateDept = (value: string): string | undefined => {
    const result = validateDepartmentCode(value || null, allowedCodes);
    if (result.ok) return undefined;
    return m.errors.department[result.reason];
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const nextErrors: FieldErrors = {};
    const nameErr = validateName(displayName);
    if (nameErr) nextErrors.displayName = nameErr;
    const deptErr = validateDept(departmentCode);
    if (deptErr) nextErrors.department = deptErr;
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      e.preventDefault();
      return;
    }
    // Clear any previous submit-error banner when we successfully hand off to
    // the Server Action — the next page render will either redirect to `/`
    // or remount with a fresh `?error=` param.
    setSubmitError(null);
  };

  return (
    <div className="flex flex-col gap-6">
      {submitError ? (
        <div
          ref={bannerRef}
          tabIndex={-1}
          role="alert"
          aria-live="assertive"
          className="rounded-md border-l-4 border-[color:var(--color-error)] bg-[color:var(--color-error)]/10 px-4 py-3 font-[family-name:var(--font-montserrat)] text-sm leading-5 text-[color:var(--color-error)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-error)]"
        >
          {submitError === "session_expired"
            ? m.errors.submit.sessionExpired
            : m.errors.submit.generic}
        </div>
      ) : null}

      <AccountRow avatarUrl={avatarUrl} email={email} displayName={displayName} />

      <form
        action={completeOnboarding}
        onSubmit={handleSubmit}
        className="flex flex-col gap-6"
        noValidate
      >
        <div className="flex flex-col gap-2">
          <label
            htmlFor={displayNameId}
            className="font-[family-name:var(--font-montserrat)] text-base leading-6 font-semibold text-[color:var(--color-brand-900)]"
          >
            {m.fields.displayName.label}
          </label>
          <input
            id={displayNameId}
            name="displayName"
            type="text"
            required
            autoComplete="name"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            onBlur={(e) => setErrors((prev) => ({ ...prev, displayName: validateName(e.target.value) }))}
            placeholder={m.fields.displayName.placeholder}
            aria-invalid={Boolean(errors.displayName)}
            aria-describedby={errors.displayName ? `${displayNameId}-error` : undefined}
            className={`h-14 rounded-lg border bg-white px-4 font-[family-name:var(--font-montserrat)] text-base leading-6 text-[color:var(--color-brand-900)] placeholder:text-[color:var(--color-brand-900)]/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-accent-cream)] ${
              errors.displayName
                ? "border-[color:var(--color-error)]"
                : "border-[color:var(--color-border-secondary)]"
            }`}
          />
          {errors.displayName ? (
            <p
              id={`${displayNameId}-error`}
              className="font-[family-name:var(--font-montserrat)] text-xs leading-5 text-[color:var(--color-error)]"
            >
              {errors.displayName}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor={departmentId}
            className="font-[family-name:var(--font-montserrat)] text-base leading-6 font-semibold text-[color:var(--color-brand-900)]"
          >
            {m.fields.department.label}
          </label>
          <div className="relative">
            <select
              id={departmentId}
              name="departmentCode"
              required
              value={departmentCode}
              onChange={(e) => {
                setDepartmentCode(e.target.value);
                setErrors((prev) => ({ ...prev, department: validateDept(e.target.value) }));
              }}
              onBlur={(e) => setErrors((prev) => ({ ...prev, department: validateDept(e.target.value) }))}
              aria-invalid={Boolean(errors.department)}
              aria-describedby={errors.department ? `${departmentId}-error` : undefined}
              className={`h-14 w-full appearance-none rounded-lg border bg-white px-4 pr-10 font-[family-name:var(--font-montserrat)] text-base leading-6 text-[color:var(--color-brand-900)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-accent-cream)] ${
                errors.department
                  ? "border-[color:var(--color-error)]"
                  : "border-[color:var(--color-border-secondary)]"
              }`}
            >
              <option value="" disabled>
                {m.fields.department.placeholder}
              </option>
              {departments.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.label || d.code}
                </option>
              ))}
            </select>
            <Icon
              name="chevron-down"
              size={20}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[color:var(--color-brand-900)]"
            />
          </div>
          {errors.department ? (
            <p
              id={`${departmentId}-error`}
              className="font-[family-name:var(--font-montserrat)] text-xs leading-5 text-[color:var(--color-error)]"
            >
              {errors.department}
            </p>
          ) : null}
        </div>

        <div className="mt-2">
          <SubmitButton defaultLabel={m.submit.default} loadingLabel={m.submit.loading} />
        </div>
      </form>

      {/* Sign-out affordance lives OUTSIDE the outer <form> — HTML does
          not allow nested forms and `signOut` is its own Server Action
          (form action={signOut}) so it must be a sibling, not a child. */}
      <SignOutLink label={m.signOut.cta} />
    </div>
  );
}

type SubmitButtonProps = {
  defaultLabel: string;
  loadingLabel: string;
};

function SubmitButton({ defaultLabel, loadingLabel }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="flex h-14 w-full min-w-[240px] items-center justify-center gap-2 rounded-xl bg-[color:var(--color-accent-cream)] px-6 font-[family-name:var(--font-montserrat)] text-lg font-bold uppercase tracking-wide text-[color:var(--color-brand-900)] transition-opacity disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--color-accent-cream)] cursor-pointer sm:mx-auto sm:w-auto"
    >
      {pending ? <Icon name="spinner" size={20} className="text-[color:var(--color-brand-900)]" /> : null}
      {pending ? loadingLabel : defaultLabel}
    </button>
  );
}
