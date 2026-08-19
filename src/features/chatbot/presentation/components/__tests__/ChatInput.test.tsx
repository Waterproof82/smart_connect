import { render, screen } from "@testing-library/react";
import { ChatInput } from "../ChatInput";

describe("ChatInput", () => {
  it("renders without crashing", () => {
    expect(() =>
      render(<ChatInput value="" onChange={vi.fn()} onSend={vi.fn()} />),
    ).not.toThrow();
  });

  it("send button has type=button and focus-visible (not focus)", () => {
    render(<ChatInput value="hola" onChange={vi.fn()} onSend={vi.fn()} />);
    const button = screen.getByRole("button", { name: /Enviar mensaje/i });
    expect(button).toHaveAttribute("type", "button");
    expect(button.className).toMatch(/focus-visible:/);
    expect(button.className).not.toMatch(/focus:outline-none|focus:ring/);
  });

  it("leaves the text input's focus classes unchanged (focus:, not focus-visible:)", () => {
    render(<ChatInput value="" onChange={vi.fn()} onSend={vi.fn()} />);
    const input = screen.getByLabelText(/Escribe tu mensaje/i);
    expect(input.className).toMatch(/focus:border-\[var\(--color-primary\)\]/);
    expect(input.className).toMatch(/focus:ring-2/);
  });
});
