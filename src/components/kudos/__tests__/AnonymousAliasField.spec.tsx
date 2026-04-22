// AnonymousAliasField unit tests — PR 5 patch T078 (spec US6 round 3).
// Scopes:
//   1. renders label "Nickname ẩn danh" + red asterisk + input
//   2. maxLength attr = 40
//   3. onChange forwards raw input
//   4. error prop paints red border + inline message with role="alert"

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AnonymousAliasField } from "../AnonymousAliasField";
import type { Messages } from "@/libs/i18n/getMessages";
import viMessages from "@/messages/vi.json";

const messages = viMessages as unknown as Messages;

describe("<AnonymousAliasField />", () => {
  it("renders the Nickname label and a required asterisk", () => {
    render(
      <AnonymousAliasField value="" onChange={() => {}} messages={messages} />,
    );
    expect(screen.getByLabelText(/Nickname ẩn danh/i)).toBeInTheDocument();
    // Required asterisk lives in the label as `<span>*</span>`.
    const label = screen.getByText((_, el) => el?.tagName === "LABEL");
    expect(label.textContent).toContain("*");
  });

  it("enforces maxLength=40 on the input", () => {
    render(
      <AnonymousAliasField value="" onChange={() => {}} messages={messages} />,
    );
    const input = screen.getByTestId(
      "kudo-anonymous-alias-input",
    ) as HTMLInputElement;
    expect(input.maxLength).toBe(40);
  });

  it("calls onChange with the raw typed value (no trimming in the component)", () => {
    const onChange = vi.fn();
    render(
      <AnonymousAliasField
        value=""
        onChange={onChange}
        messages={messages}
      />,
    );
    const input = screen.getByTestId("kudo-anonymous-alias-input");
    fireEvent.change(input, { target: { value: "  Doraemon  " } });
    expect(onChange).toHaveBeenCalledWith("  Doraemon  ");
  });

  it("renders error message + aria-invalid when `error` prop is set", () => {
    render(
      <AnonymousAliasField
        value="x"
        onChange={() => {}}
        messages={messages}
        error={messages.compose.fields.anonymousAlias.validation.required}
      />,
    );
    const input = screen.getByTestId("kudo-anonymous-alias-input");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    const alert = screen.getByRole("alert");
    expect(alert.textContent).toMatch(/Vui lòng nhập nickname/);
  });
});
