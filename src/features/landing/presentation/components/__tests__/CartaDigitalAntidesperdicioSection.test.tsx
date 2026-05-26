import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "@shared/context/LanguageContext";
import CartaDigitalAntidesperdicioSection from "../CartaDigitalAntidesperdicioSection";

const renderWithLanguage = () => {
  return render(
    <LanguageProvider>
      <CartaDigitalAntidesperdicioSection />
    </LanguageProvider>,
  );
};

describe("CartaDigitalAntidesperdicioSection", () => {
  it("renders without crashing", () => {
    expect(() => renderWithLanguage()).not.toThrow();
  });

  it("displays the anti-waste section heading", () => {
    renderWithLanguage();
    expect(
      screen.getByText(/Reduce el desperdicio alimentario/i),
    ).toBeInTheDocument();
  });

  it("renders 3 feature items", () => {
    const { container } = renderWithLanguage();
    const items = container.querySelectorAll("[data-testid='antidesperdicio-feature']");
    expect(items.length).toBe(3);
  });

  it("displays the subtitle", () => {
    renderWithLanguage();
    expect(
      screen.getByText(/Convierte el stock próximo a caducar en ingresos/i),
    ).toBeInTheDocument();
  });

  it("displays all 3 feature titles", () => {
    renderWithLanguage();
    expect(screen.getByText(/Descuentos por tiempo limitado/i)).toBeInTheDocument();
    expect(screen.getByText(/Notificación a clientes frecuentes/i)).toBeInTheDocument();
    expect(screen.getByText(/Menos pérdidas, más margen/i)).toBeInTheDocument();
  });
});
