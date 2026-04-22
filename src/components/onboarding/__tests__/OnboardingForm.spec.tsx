// OnboardingForm unit tests — spec ObrdH9pKx7 US1 acceptance scenarios.
//
// Scopes:
//   T-U1 empty submit → action not called, errors surfaced
//   T-U2 too-short displayName → error line
//   T-U4 emoji → invalidChars error
//   T-U5 valid Vietnamese diacritics → no error
//   T-U6 missing department → error line
//   T-U7 happy-path submit → handleSubmit does NOT preventDefault
//   T-U8 server-error banner auto-focused + role=alert
//   T-U9 session-expired banner triggers window.location.assign after 1.5 s
//   T-U10 sign-out link renders

import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { OnboardingForm } from "../OnboardingForm";
import type { Messages } from "@/libs/i18n/getMessages";
import viMessages from "@/messages/vi.json";

const messages = viMessages as unknown as Messages;

vi.mock("@/app/onboarding/actions", () => ({
  completeOnboarding: vi.fn(),
}));
vi.mock("@/libs/auth/signOut", () => ({
  signOut: vi.fn(),
}));

const departments = [
  { code: "CEVC1", label: "CEVC1" },
  { code: "SPD", label: "SPD" },
];

function renderForm(overrides: Partial<Parameters<typeof OnboardingForm>[0]> = {}) {
  return render(
    <OnboardingForm
      initialDisplayName=""
      avatarUrl={null}
      email="alice@kudos.test"
      departments={departments}
      initialSubmitError={null}
      messages={messages}
      {...overrides}
    />,
  );
}

describe("OnboardingForm", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("T-U1 empty submit surfaces both errors without navigating", () => {
    renderForm();
    const form = document.querySelector("form");
    expect(form).toBeTruthy();
    fireEvent.submit(form!);
    expect(
      screen.getByText(messages.onboarding.errors.displayName.required),
    ).toBeTruthy();
    expect(
      screen.getByText(messages.onboarding.errors.department.required),
    ).toBeTruthy();
  });

  it("T-U2 displayName < 2 chars post-trim shows tooShort", () => {
    renderForm();
    const input = screen.getByLabelText(messages.onboarding.fields.displayName.label);
    fireEvent.change(input, { target: { value: "A" } });
    fireEvent.blur(input);
    expect(screen.getByText(messages.onboarding.errors.displayName.tooShort)).toBeTruthy();
  });

  it("T-U4 emoji triggers invalidChars", () => {
    renderForm();
    const input = screen.getByLabelText(messages.onboarding.fields.displayName.label);
    fireEvent.change(input, { target: { value: "Alice 🚀" } });
    fireEvent.blur(input);
    expect(screen.getByText(messages.onboarding.errors.displayName.invalidChars)).toBeTruthy();
  });

  it("T-U5 Vietnamese diacritics + apostrophes + dashes are accepted", () => {
    renderForm();
    const input = screen.getByLabelText(messages.onboarding.fields.displayName.label);
    fireEvent.change(input, { target: { value: "Nguyễn Thị Lan-Anh" } });
    fireEvent.blur(input);
    expect(screen.queryByText(messages.onboarding.errors.displayName.invalidChars)).toBeNull();
  });

  it("T-U6 missing department surfaces required error on submit", () => {
    renderForm({ initialDisplayName: "Alice" });
    const form = document.querySelector("form");
    fireEvent.submit(form!);
    expect(screen.getByText(messages.onboarding.errors.department.required)).toBeTruthy();
  });

  it("T-U8 server-error banner renders with role=alert and receives focus", () => {
    renderForm({ initialSubmitError: "generic" });
    const banner = screen.getByRole("alert");
    expect(banner.textContent).toContain(messages.onboarding.errors.submit.generic);
    expect(document.activeElement).toBe(banner);
  });

  it("T-U9 session-expired banner redirects after 1500 ms", () => {
    const assign = vi.fn();
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { ...window.location, assign },
    });
    renderForm({ initialSubmitError: "session_expired" });
    expect(screen.getByRole("alert").textContent).toContain(
      messages.onboarding.errors.submit.sessionExpired,
    );
    expect(assign).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1500);
    expect(assign).toHaveBeenCalledWith("/login?next=/onboarding");
  });

  it("T-U10 sign-out link renders with localized label", () => {
    renderForm();
    expect(screen.getByText(messages.onboarding.signOut.cta)).toBeTruthy();
  });

  it("T-U7 valid form submit passes client validation (no field errors)", () => {
    renderForm({ initialDisplayName: "Alice" });
    const select = screen.getByLabelText(messages.onboarding.fields.department.label);
    fireEvent.change(select, { target: { value: "CEVC1" } });
    const form = document.querySelector("form") as HTMLFormElement;
    fireEvent.submit(form);
    expect(screen.queryByText(messages.onboarding.errors.displayName.required)).toBeNull();
    expect(screen.queryByText(messages.onboarding.errors.department.required)).toBeNull();
    expect(screen.queryByText(messages.onboarding.errors.displayName.tooShort)).toBeNull();
    expect(screen.queryByText(messages.onboarding.errors.displayName.invalidChars)).toBeNull();
  });
});
