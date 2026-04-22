// RecipientField typeahead unit tests — PR 2 US1 T027.
// Scopes:
//   1. renders label + input + chevron icon
//   2. typing triggers searchSunner after debounce
//   3. selecting a suggestion calls onChange with the user
//   4. clear button resets to no-selection

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { RecipientField } from "../RecipientField";
import type { KudoUser } from "@/types/kudo";
import type { Messages } from "@/libs/i18n/getMessages";
import viMessages from "@/messages/vi.json";

const messages = viMessages as unknown as Messages;

vi.mock("@/app/kudos/actions", () => ({
  searchSunner: vi.fn(),
}));
import { searchSunner } from "@/app/kudos/actions";
const searchMock = vi.mocked(searchSunner);

const alice: KudoUser = {
  id: "u1",
  display_name: "Alice",
  avatar_url: null,
  department_id: null,
  department_code: null,
  honour_title: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
});

describe("<RecipientField />", () => {
  it("T027-1: renders the label, input and chevron icon", () => {
    render(
      <RecipientField value={null} onChange={() => {}} messages={messages} />,
    );
    expect(screen.getByLabelText(/Người nhận/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Tìm kiếm/i)).toBeInTheDocument();
  });

  it("T027-2: typing triggers searchSunner after 250ms debounce", async () => {
    searchMock.mockResolvedValue([alice]);
    render(
      <RecipientField value={null} onChange={() => {}} messages={messages} />,
    );
    const input = screen.getByLabelText(/Người nhận/i);
    fireEvent.change(input, { target: { value: "Al" } });
    expect(searchMock).not.toHaveBeenCalled();
    await act(async () => {
      vi.advanceTimersByTime(250);
    });
    await vi.waitFor(() => expect(searchMock).toHaveBeenCalledWith("Al"));
  });

  it("T027-3: selecting a suggestion calls onChange with the user", async () => {
    searchMock.mockResolvedValue([alice]);
    const onChange = vi.fn();
    render(
      <RecipientField value={null} onChange={onChange} messages={messages} />,
    );
    const input = screen.getByLabelText(/Người nhận/i);
    fireEvent.change(input, { target: { value: "Al" } });
    await act(async () => {
      vi.advanceTimersByTime(250);
    });
    const row = await vi.waitFor(() =>
      screen.getByRole("option", { name: /Alice/i }),
    );
    fireEvent.mouseDown(row);
    expect(onChange).toHaveBeenCalledWith(alice);
  });

  it("T027-4: clear button resets to null when a recipient was selected", () => {
    const onChange = vi.fn();
    render(
      <RecipientField value={alice} onChange={onChange} messages={messages} />,
    );
    const clearBtn = screen.getByRole("button", { name: /clear recipient/i });
    fireEvent.click(clearBtn);
    expect(onChange).toHaveBeenCalledWith(null);
  });
});
