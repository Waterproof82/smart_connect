import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "@shared/context/LanguageContext";
import CartaDigitalModosSection from "../CartaDigitalModosSection";

const renderWithLanguage = () => {
  return render(
    <LanguageProvider>
      <CartaDigitalModosSection />
    </LanguageProvider>,
  );
};

describe("CartaDigitalModosSection", () => {
  it("renders without crashing", () => {
    expect(() => renderWithLanguage()).not.toThrow();
  });

  it("displays the section heading", () => {
    renderWithLanguage();
    expect(screen.getByText(/Dos modos, un sistema/i)).toBeInTheDocument();
  });

  it("displays Restaurant Mode title", () => {
    renderWithLanguage();
    expect(screen.getByText(/Modo Restaurante/i)).toBeInTheDocument();
  });

  it("displays Shop Mode title", () => {
    renderWithLanguage();
    expect(screen.getByText(/Modo Tienda/i)).toBeInTheDocument();
  });

  it("renders both mode cards in the DOM", () => {
    const { container } = renderWithLanguage();
    const cards = container.querySelectorAll("[data-testid='modo-card']");
    expect(cards.length).toBe(2);
  });

  it("displays feature items for both modes", () => {
    renderWithLanguage();
    expect(screen.getByText(/Pedidos en mesa vía QR \+ Telegram/i)).toBeInTheDocument();
    expect(screen.getByText(/Pedidos online con gestión de clientes/i)).toBeInTheDocument();
  });

  it("renders a lucide svg icon (not an emoji) inside each mode card", () => {
    const { container } = renderWithLanguage();
    const cards = container.querySelectorAll("[data-testid='modo-card']");
    cards.forEach((card) => {
      expect(card.querySelector("svg")).not.toBeNull();
    });
  });

  it("no longer contains the legacy emoji icons", () => {
    const { container } = renderWithLanguage();
    expect(container.textContent).not.toMatch(/🍽️|🛒/);
  });
});
