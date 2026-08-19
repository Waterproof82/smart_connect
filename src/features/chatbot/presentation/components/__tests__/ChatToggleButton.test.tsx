import { useRef } from "react";
import { render, screen } from "@testing-library/react";
import { ChatToggleButton } from "../ChatToggleButton";

const Harness = ({ isOpen = false }: { isOpen?: boolean }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  return (
    <ChatToggleButton
      isOpen={isOpen}
      buttonRef={buttonRef}
      onToggle={vi.fn()}
    />
  );
};

describe("ChatToggleButton", () => {
  it("renders without crashing", () => {
    expect(() => render(<Harness />)).not.toThrow();
  });

  it("has type=button and an accessible name of 'Asistente Experto' via aria-label", () => {
    render(<Harness />);
    const button = screen.getByRole("button", { name: "Asistente Experto" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveAttribute("aria-label", "Asistente Experto");
  });

  it("uses focus-visible instead of focus on the toggle button", () => {
    render(<Harness />);
    const button = screen.getByRole("button", { name: "Asistente Experto" });
    expect(button.className).toMatch(/focus-visible:/);
    expect(button.className).not.toMatch(/focus:outline-none|focus:ring/);
  });

  it("uses focus-visible instead of focus on the WhatsApp link when rendered", () => {
    render(
      <ChatToggleButton
        isOpen={false}
        whatsappPhone="+34600000000"
        buttonRef={{ current: null }}
        onToggle={vi.fn()}
      />,
    );
    const link = screen.getByRole("link", { name: /Contactar por WhatsApp/i });
    expect(link.className).toMatch(/focus-visible:/);
    expect(link.className).not.toMatch(/focus:outline-none|focus:ring/);
  });
});
