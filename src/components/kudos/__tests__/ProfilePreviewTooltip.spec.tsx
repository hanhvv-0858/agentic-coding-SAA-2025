// T122 — ProfilePreviewTooltip tests. Controlled visibility; lazy
// fetch + 60 s cache memoise; CTA click routes to composer; isSelf
// hides the CTA.

import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { render, screen, waitFor, cleanup } from "@testing-library/react";
import {
  ProfilePreviewTooltip,
  __resetProfilePreviewCacheForTests,
} from "../ProfilePreviewTooltip";
import type { Messages } from "@/libs/i18n/getMessages";
import viMessages from "@/messages/vi.json";

const messages = viMessages as unknown as Messages;

vi.mock("@/app/kudos/actions", () => ({
  getProfilePreview: vi.fn(),
}));
import { getProfilePreview } from "@/app/kudos/actions";
const fetchMock = vi.mocked(getProfilePreview);

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));
const pushMock = vi.fn();

const stubPosition = { left: 0, top: 0, placement: "below" as const };
const stubHandlers = { onPointerEnter: () => {}, onPointerLeave: () => {} };

const baseProfile = {
  userId: "u-1",
  displayName: "Alice Nguyen",
  departmentCode: "CEVC1",
  honourTitle: "Rising Hero",
  kudosReceivedCount: 7,
  kudosSentCount: 3,
  isSelf: false,
};

beforeEach(() => {
  __resetProfilePreviewCacheForTests();
  fetchMock.mockReset();
  pushMock.mockReset();
});

afterEach(() => {
  // Unmount via RTL so portal children detach cleanly before happy-dom
  // reclaims the document. Manual `document.body.innerHTML = ""` races
  // with React's unmount and corrupts the DOM tree.
  cleanup();
});

describe("ProfilePreviewTooltip", () => {
  it("renders nothing when open={false}", () => {
    render(
      <ProfilePreviewTooltip
        userId="u-1"
        open={false}
        position={stubPosition}
        tooltipHandlers={stubHandlers}
        onClose={() => {}}
        messages={messages}
      />,
    );
    expect(screen.queryByTestId("kudo-profile-preview-tooltip")).toBeNull();
  });

  it("fetches the profile preview on first open and renders fields", async () => {
    fetchMock.mockResolvedValueOnce(baseProfile);
    render(
      <ProfilePreviewTooltip
        userId="u-1"
        open
        position={stubPosition}
        tooltipHandlers={stubHandlers}
        onClose={() => {}}
        messages={messages}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText("Alice Nguyen")).toBeTruthy();
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.getByText("CEVC1")).toBeTruthy();
    // Stats — "Số Kudos nhận được: 7" appears as split spans.
    const node = screen.getByTestId("kudo-profile-preview-tooltip");
    expect(node.textContent).toContain("Số Kudos nhận được:");
    expect(node.textContent).toContain("7");
    expect(node.textContent).toContain("Số Kudos đã gửi:");
    expect(node.textContent).toContain("3");
  });

  it("renders CTA when isSelf=false", async () => {
    fetchMock.mockResolvedValueOnce(baseProfile);
    render(
      <ProfilePreviewTooltip
        userId="u-1"
        open
        position={stubPosition}
        tooltipHandlers={stubHandlers}
        onClose={() => {}}
        messages={messages}
      />,
    );
    await waitFor(() => {
      expect(screen.getByTestId("kudo-profile-preview-cta")).toBeTruthy();
    });
  });

  it("hides CTA when isSelf=true", async () => {
    fetchMock.mockResolvedValueOnce({ ...baseProfile, isSelf: true });
    render(
      <ProfilePreviewTooltip
        userId="u-1"
        open
        position={stubPosition}
        tooltipHandlers={stubHandlers}
        onClose={() => {}}
        messages={messages}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText("Alice Nguyen")).toBeTruthy();
    });
    expect(screen.queryByTestId("kudo-profile-preview-cta")).toBeNull();
  });

  it("CTA click routes to /kudos/new?recipient=<userId> and calls onClose", async () => {
    fetchMock.mockResolvedValueOnce(baseProfile);
    const onClose = vi.fn();
    render(
      <ProfilePreviewTooltip
        userId="u-1"
        open
        position={stubPosition}
        tooltipHandlers={stubHandlers}
        onClose={onClose}
        messages={messages}
      />,
    );
    const cta = await screen.findByTestId("kudo-profile-preview-cta");
    cta.click();
    expect(onClose).toHaveBeenCalled();
    expect(pushMock).toHaveBeenCalledWith("/kudos/new?recipient=u-1");
  });

  it("memoises — second open for the same userId does not re-fetch (within 60 s TTL)", async () => {
    fetchMock.mockResolvedValue(baseProfile);
    const { rerender } = render(
      <ProfilePreviewTooltip
        userId="u-1"
        open
        position={stubPosition}
        tooltipHandlers={stubHandlers}
        onClose={() => {}}
        messages={messages}
      />,
    );
    await waitFor(() => {
      expect(screen.getByText("Alice Nguyen")).toBeTruthy();
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    // Close + re-open
    rerender(
      <ProfilePreviewTooltip
        userId="u-1"
        open={false}
        position={stubPosition}
        tooltipHandlers={stubHandlers}
        onClose={() => {}}
        messages={messages}
      />,
    );
    rerender(
      <ProfilePreviewTooltip
        userId="u-1"
        open
        position={stubPosition}
        tooltipHandlers={stubHandlers}
        onClose={() => {}}
        messages={messages}
      />,
    );
    // Still 1 call — served from cache.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("sets role='dialog' and aria-label", async () => {
    fetchMock.mockResolvedValueOnce(baseProfile);
    render(
      <ProfilePreviewTooltip
        userId="u-1"
        open
        position={stubPosition}
        tooltipHandlers={stubHandlers}
        onClose={() => {}}
        messages={messages}
      />,
    );
    const node = screen.getByTestId("kudo-profile-preview-tooltip");
    expect(node.getAttribute("role")).toBe("dialog");
    expect(node.getAttribute("aria-label")).toBe(
      messages.kudos.profilePreview.ariaLabel,
    );
  });
});
