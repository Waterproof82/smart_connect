import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "@shared/context/LanguageContext";
import CartaDigitalCTAFinalSection from "../CartaDigitalCTAFinalSection";

vi.mock("@shared/hooks", () => ({
  useWhatsappPhone: () => "34600000000",
}));

const renderWithLanguage = () => {
  return render(
    <LanguageProvider>
      <CartaDigitalCTAFinalSection />
    </LanguageProvider>,
  );
};

describe("CartaDigitalCTAFinalSection", () => {
  it("renders without crashing", () => {
    expect(() => renderWithLanguage()).not.toThrow();
  });

  it("renders the primary CTA as the shared WhatsApp button with the Carta message", () => {
    renderWithLanguage();
    const link = screen.getByRole("link", { name: /Demo gratuita/i });
    expect(link).toHaveClass("btn-wa");
    expect(link.getAttribute("href")).toMatch(
      /^https:\/\/wa\.me\/34600000000\?text=.*carta%20digital/i,
    );
  });

  it("renders the secondary CTA as a ghost link to the contact form (a non-WhatsApp alternative)", () => {
    renderWithLanguage();
    const link = screen.getByRole("link", { name: /Hablar con asesor/i });
    expect(link).toHaveClass("btn-ghost");
    expect(link).toHaveAttribute("href", "/#contacto?servicio=Carta%20Digital");
  });

  it("has a single filled CTA (one primary action per screen)", () => {
    const { container } = renderWithLanguage();
    expect(container.querySelectorAll(".btn-wa, .btn-primary")).toHaveLength(1);
  });
});
