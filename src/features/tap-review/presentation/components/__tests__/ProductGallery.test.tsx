import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "@shared/context/LanguageContext";
import ProductGallery from "../ProductGallery";

const renderWithLanguage = () => {
  return render(
    <LanguageProvider>
      <ProductGallery />
    </LanguageProvider>,
  );
};

describe("ProductGallery", () => {
  it("renders without crashing", () => {
    expect(() => renderWithLanguage()).not.toThrow();
  });

  it("every thumbnail button has type=button", () => {
    renderWithLanguage();
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
    for (const button of buttons) {
      expect(button).toHaveAttribute("type", "button");
    }
  });
});
