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

  it("renders the only h1 of the home page, without a reveal animation (LCP)", () => {
    renderWithLanguage();
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1.className).not.toMatch(/reveal-/);
  });

  it("renders the primary CTA as the shared WhatsApp link (crawlable, absolute fallback)", () => {
    renderWithLanguage();
    const link = screen.getByRole("link", { name: /Contactar/i });
    expect(link).toHaveClass("btn-wa");
    expect(link.getAttribute("href")).toMatch(/^\/#contacto/);
  });

  it("renders the secondary CTA as a crawlable link to the solutions anchor", () => {
    renderWithLanguage();
    const link = screen.getByRole("link", { name: /Ver Demo/i });
    expect(link).toHaveClass("btn-ghost");
    expect(link).toHaveAttribute("href", "/#soluciones");
  });

  it("states the audience (hospitality, retail and businesses)", () => {
    renderWithLanguage();
    expect(screen.getByText(/tiendas y empresas/i)).toBeInTheDocument();
  });
});
