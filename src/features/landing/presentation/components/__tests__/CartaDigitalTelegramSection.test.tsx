import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "@shared/context/LanguageContext";
import CartaDigitalTelegramSection from "../CartaDigitalTelegramSection";

const renderWithLanguage = () => {
  return render(
    <LanguageProvider>
      <CartaDigitalTelegramSection />
    </LanguageProvider>,
  );
};

describe("CartaDigitalTelegramSection", () => {
  it("renders without crashing", () => {
    expect(() => renderWithLanguage()).not.toThrow();
  });

  it("displays the Telegram section heading", () => {
    renderWithLanguage();
    expect(
      screen.getByText(/Pedidos por Telegram/i),
    ).toBeInTheDocument();
  });

  it("renders at least 3 feature items", () => {
    const { container } = renderWithLanguage();
    const featureItems = container.querySelectorAll("[data-testid='telegram-feature']");
    expect(featureItems.length).toBeGreaterThanOrEqual(3);
  });

  it("displays the subtitle text", () => {
    renderWithLanguage();
    expect(
      screen.getByText(/El cliente pide desde el QR/i),
    ).toBeInTheDocument();
  });

  it("displays all 4 feature titles", () => {
    renderWithLanguage();
    expect(screen.getByText(/Pedido online al instante/i)).toBeInTheDocument();
    expect(screen.getByText(/Grupo de Telegram del equipo/i)).toBeInTheDocument();
    expect(screen.getByText(/Respuesta con un botón/i)).toBeInTheDocument();
    expect(screen.getByText(/Camarero en mesa desde el móvil/i)).toBeInTheDocument();
  });

  it("renders a lucide svg icon (not an emoji) inside each feature item", () => {
    const { container } = renderWithLanguage();
    const items = container.querySelectorAll("[data-testid='telegram-feature']");
    items.forEach((item) => {
      expect(item.querySelector("svg")).not.toBeNull();
    });
  });

  it("no longer contains the legacy emoji icons", () => {
    const { container } = renderWithLanguage();
    expect(container.textContent).not.toMatch(/📱|👥|✅|🍽️/);
  });
});
