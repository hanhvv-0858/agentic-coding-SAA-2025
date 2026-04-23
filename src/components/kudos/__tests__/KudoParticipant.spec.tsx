import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KudoParticipant } from "../KudoParticipant";
import type { KudoUser } from "@/types/kudo";

const WITH_AVATAR: KudoUser = {
  id: "u1",
  display_name: "Nguyen Van A",
  avatar_url: "/images/avatar-a.png",
  department_id: null,
  department_code: null,
  honour_title: null,
};
const NO_AVATAR: KudoUser = {
  id: "u2",
  display_name: "Tran Thi B",
  avatar_url: null,
  department_id: null,
  department_code: null,
  honour_title: null,
};

describe("<KudoParticipant />", () => {
  it("renders an <Image> when avatar_url is present (happy path)", () => {
    const { container } = render(
      <KudoParticipant user={WITH_AVATAR} monogramAlt="Default" />,
    );
    // next/image renders an <img> eventually — check for src presence.
    const img = container.querySelector("img");
    expect(img).toBeInTheDocument();
    expect(screen.queryByTestId("kudo-participant-monogram")).toBeNull();
  });

  it("renders the monogram fallback (FR-016) when avatar_url is null", () => {
    render(<KudoParticipant user={NO_AVATAR} monogramAlt="Default" />);
    const mono = screen.getByTestId("kudo-participant-monogram");
    expect(mono).toBeInTheDocument();
    // "Tran Thi B" → first+last initial = "TB"
    expect(mono.textContent).toBe("TB");
  });

  it("renders the display name as a visible label", () => {
    render(<KudoParticipant user={NO_AVATAR} monogramAlt="Default" />);
    expect(screen.getByText("Tran Thi B")).toBeInTheDocument();
  });

  // The old string-based `honorific` prop was removed — honour rendering
  // now derives from `user.honour_title` + `user.department_code` and
  // renders as a pill <Image> (see honourPills.ts). The two legacy tests
  // that exercised the string prop were deleted; coverage for the new
  // pill/department rendering lives in the US10 HonourTooltip specs.
});
