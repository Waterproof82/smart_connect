import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "@shared/context/LanguageContext";
import CartaDigitalHeroSection from "../CartaDigitalHeroSection";

const renderWithLanguage = () => {
  return render(
    <LanguageProvider>
      <CartaDigitalHeroSection onScrollToSection={vi.fn()} />
    </LanguageProvider>,
  );
};

describe("CartaDigitalHeroSection", () => {
  it("renders without crashing", () => {
    expect(() => renderWithLanguage()).not.toThrow();
  });

  it("renders a lucide MapPin icon instead of the 📍 emoji prefix", () => {
    const { container } = renderWithLanguage();
    expect(container.textContent).not.toMatch(/📍/);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("renders the primary CTA (demo) button with btn-primary and type=button", () => {
    renderWithLanguage();
    const button = screen.getByRole("button", { name: /Ver cómo funciona/i });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass("btn-primary");
  });

  it("renders the secondary CTA (calc) button with btn-secondary and type=button", () => {
    renderWithLanguage();
    const button = screen.getByRole("button", { name: /Calcular ahorro/i });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass("btn-secondary");
  });

  it("does not carry stale conflicting utility classes on the primary CTA", () => {
    renderWithLanguage();
    const button = screen.getByRole("button", { name: /Ver cómo funciona/i });
    expect(button.className).not.toMatch(
      /rounded-xl|bg-\[var\(--color-primary\)\]|min-h-\[44px\]/,
    );
  });

  it("does not carry stale conflicting utility classes on the secondary CTA", () => {
    renderWithLanguage();
    const button = screen.getByRole("button", { name: /Calcular ahorro/i });
    expect(button.className).not.toMatch(
      /rounded-xl|bg-\[var\(--color-primary\)\]|min-h-\[44px\]/,
    );
  });
});
