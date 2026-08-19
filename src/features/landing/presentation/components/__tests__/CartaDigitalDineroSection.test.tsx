import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "@shared/context/LanguageContext";
import CartaDigitalDineroSection from "../CartaDigitalDineroSection";

const renderWithLanguage = () => {
  return render(
    <LanguageProvider>
      <CartaDigitalDineroSection />
    </LanguageProvider>,
  );
};

describe("CartaDigitalDineroSection", () => {
  it("renders without crashing", () => {
    expect(() => renderWithLanguage()).not.toThrow();
  });

  it("renders a lucide TrendingUp icon instead of the decorative 📈 emoji", () => {
    const { container } = renderWithLanguage();
    expect(container.textContent).not.toMatch(/📈/);
    // 8 icons total: 3 card1 + 4 card2 (all already lucide) + 1 decorative
    // growth badge (this change's target).
    expect(container.querySelectorAll("svg").length).toBeGreaterThanOrEqual(8);
  });

  it("displays the growth label text next to the icon", () => {
    renderWithLanguage();
    // cartaDineroGrowthLabel resolves to real copy; just assert the badge
    // container still renders (icon swap didn't remove the sibling text).
    const growthValue = screen.getByText(/\+35%/i);
    expect(growthValue).toBeInTheDocument();
  });
});
