import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { AccountRow } from "../AccountRow";

describe("AccountRow", () => {
  it("renders the avatar image when avatarUrl is provided", () => {
    render(<AccountRow avatarUrl="https://example.com/a.png" email="a@x.com" displayName="Alice" />);
    const img = screen.getByRole("presentation");
    expect(img).toBeTruthy();
    expect(img.tagName).toBe("IMG");
  });

  it("renders the first letter of display_name when avatarUrl is null", () => {
    render(<AccountRow avatarUrl={null} email="bob@kudos.test" displayName="Bob Tran" />);
    expect(screen.getByText("B")).toBeTruthy();
  });

  it("upper-cases the fallback initial", () => {
    render(<AccountRow avatarUrl={null} email="c@x.com" displayName="charlie" />);
    expect(screen.getByText("C")).toBeTruthy();
  });

  it("falls back to `?` when display_name is empty", () => {
    render(<AccountRow avatarUrl={null} email="d@x.com" displayName="" />);
    expect(screen.getByText("?")).toBeTruthy();
  });

  it("renders the email as the visible identifier", () => {
    render(
      <AccountRow avatarUrl={null} email="alice.nguyen@sun-asterisk.com" displayName="Alice" />,
    );
    expect(screen.getByText("alice.nguyen@sun-asterisk.com")).toBeTruthy();
  });
});
