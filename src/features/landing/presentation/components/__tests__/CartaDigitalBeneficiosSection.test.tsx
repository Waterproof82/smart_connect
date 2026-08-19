import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "@shared/context/LanguageContext";
import CartaDigitalBeneficiosSection from "../CartaDigitalBeneficiosSection";

const renderWithLanguage = () => {
  return render(
    <LanguageProvider>
      <CartaDigitalBeneficiosSection />
    </LanguageProvider>,
  );
};

describe("CartaDigitalBeneficiosSection", () => {
  it("renders without crashing", () => {
    expect(() => renderWithLanguage()).not.toThrow();
  });

  it("displays the benefits section heading", () => {
    renderWithLanguage();
    expect(screen.getByText(/cambian tu negocio/i)).toBeInTheDocument();
  });

  it("renders all 7 benefit items", () => {
    const { container } = renderWithLanguage();
    const items = container.querySelectorAll("[data-testid='beneficio-item']");
    expect(items.length).toBe(7);
  });

  it("renders a lucide svg icon (not an emoji) inside each benefit item", () => {
    const { container } = renderWithLanguage();
    const items = container.querySelectorAll("[data-testid='beneficio-item']");
    items.forEach((item) => {
      expect(item.querySelector("svg")).not.toBeNull();
    });
  });

  it("no longer contains the legacy emoji icons", () => {
    const { container } = renderWithLanguage();
    expect(container.textContent).not.toMatch(
      /🍽️|🌍|💰|👤|💬|🌐|⚙️/,
    );
  });
});
