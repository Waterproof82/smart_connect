import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "@shared/context/LanguageContext";
import { Hero } from "../Hero";

const renderWithLanguage = () => {
  return render(
    <LanguageProvider>
      <Hero />
    </LanguageProvider>,
  );
};

describe("Hero", () => {
  it("renders without crashing", () => {
    expect(() => renderWithLanguage()).not.toThrow();
  });

  it("renders the primary CTA (contact) button with btn-primary and type=button", () => {
    renderWithLanguage();
    const button = screen.getByRole("button", { name: /Contactar/i });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass("btn-primary");
  });

  it("renders the secondary CTA (demo) button with btn-secondary and type=button", () => {
    renderWithLanguage();
    const button = screen.getByRole("button", { name: /Ver Demo/i });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass("btn-secondary");
  });

  it("does not carry stale conflicting utility classes on the primary CTA", () => {
    renderWithLanguage();
    const button = screen.getByRole("button", { name: /Contactar/i });
    expect(button.className).not.toMatch(
      /rounded-2xl|bg-\[var\(--color-accent\)\]|min-h-\[44px\]|focus-visible:ring-2/,
    );
  });

  it("does not carry stale conflicting utility classes on the secondary CTA", () => {
    renderWithLanguage();
    const button = screen.getByRole("button", { name: /Ver Demo/i });
    expect(button.className).not.toMatch(
      /rounded-2xl|bg-\[var\(--color-overlay-subtle\)\]|min-h-\[44px\]|focus-visible:ring-2/,
    );
  });
});
