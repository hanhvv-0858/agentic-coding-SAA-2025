import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import viMessages from "@/messages/vi.json";
import type { Messages } from "@/libs/i18n/getMessages";
import { RulesPanel } from "../RulesPanel";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ back: vi.fn(), push: vi.fn() }),
}));

const rules = (viMessages as Messages).rules;

describe("<RulesPanel />", () => {
  it("renders the panel title as the single H1", () => {
    render(<RulesPanel rules={rules} />);
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveAttribute("id", "rules-title");
    expect(h1).toHaveTextContent("Thể lệ");
  });

  it("renders exactly three H2 section headings (Receiver / Sender / Quốc Dân)", () => {
    render(<RulesPanel rules={rules} />);
    const headings = screen.getAllByRole("heading", { level: 2 });
    expect(headings).toHaveLength(3);
    expect(headings[0]).toHaveTextContent(/NGƯỜI NHẬN KUDOS/);
    expect(headings[1]).toHaveTextContent(/NGƯỜI GỬI KUDOS/);
    expect(headings[2]).toHaveTextContent(/KUDOS QUỐC DÂN/);
  });

  it("renders all 4 hero tier counts + labels in order", () => {
    render(<RulesPanel rules={rules} />);
    expect(screen.getByText(/Có 1-4 người gửi Kudos/)).toBeInTheDocument();
    expect(screen.getByText(/Có 5-9 người gửi Kudos/)).toBeInTheDocument();
    expect(screen.getByText(/Có 10–20 người gửi Kudos/)).toBeInTheDocument();
    expect(screen.getByText(/Có hơn 20 người gửi Kudos/)).toBeInTheDocument();
  });

  it("renders all 6 collectible badge labels (correct ROOT FURTHER spelling)", () => {
    render(<RulesPanel rules={rules} />);
    expect(screen.getByText("REVIVAL")).toBeInTheDocument();
    expect(screen.getByText("TOUCH OF LIGHT")).toBeInTheDocument();
    expect(screen.getByText("STAY GOLD")).toBeInTheDocument();
    expect(screen.getByText("FLOW TO HORIZON")).toBeInTheDocument();
    expect(screen.getByText("BEYOND THE BOUNDARY")).toBeInTheDocument();
    expect(screen.getByText("ROOT FURTHER")).toBeInTheDocument();
  });

  it("renders both footer buttons (Đóng + Viết KUDOS)", () => {
    render(<RulesPanel rules={rules} />);
    expect(screen.getByRole("button", { name: /Đóng/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Viết KUDOS/ })).toBeInTheDocument();
  });
});
