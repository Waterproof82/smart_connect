import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "@shared/context/LanguageContext";
import CartaDigitalCTAFinalSection from "../CartaDigitalCTAFinalSection";

const renderWithLanguage = () => {
  return render(
    <LanguageProvider>
      <CartaDigitalCTAFinalSection whatsappPhone="+34600000000" />
    </LanguageProvider>,
  );
};

describe("CartaDigitalCTAFinalSection", () => {
  it("renders without crashing", () => {
    expect(() => renderWithLanguage()).not.toThrow();
  });

  it("renders the primary CTA link with btn-primary", () => {
    renderWithLanguage();
    const link = screen.getByRole("link", { name: /Demo gratuita/i });
    expect(link).toHaveClass("btn-primary");
  });

  it("renders the secondary CTA link with btn-secondary", () => {
    renderWithLanguage();
    const link = screen.getByRole("link", { name: /Habar con asesor/i });
    expect(link).toHaveClass("btn-secondary");
  });

  it("does not carry stale conflicting utility classes on the primary CTA", () => {
    renderWithLanguage();
    const link = screen.getByRole("link", { name: /Demo gratuita/i });
    expect(link.className).not.toMatch(
      /rounded-xl|bg-\[var\(--color-primary\)\]|min-h-\[48px\]/,
    );
  });

  it("does not carry stale conflicting utility classes on the secondary CTA", () => {
    renderWithLanguage();
    const link = screen.getByRole("link", { name: /Habar con asesor/i });
    expect(link.className).not.toMatch(
      /rounded-xl|bg-\[var\(--color-primary\)\]|min-h-\[48px\]/,
    );
  });
});
