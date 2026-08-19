import { render } from "@testing-library/react";
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
});
