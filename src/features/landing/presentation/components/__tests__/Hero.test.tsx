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

  // design.md Interfaces/Contracts "Copy" + structured-data-policy spec
  // "Home H1 Names Product, Audience and Place" (seo-audit-followups, S4):
  // the H1 names no product/audience/place today ("Aumenta tu facturación,
  // ahorra horas cada semana"), which the SEO audit flagged. New copy names
  // the products (carta digital, NFC), the audience (restaurantes) and the
  // place (Tenerife), in es and en, across the same 3-part composition.
  describe("H1 copy (seo-audit-followups S4) — names product, audience and place", () => {
    afterEach(() => {
      localStorage.removeItem("language");
    });

    it("es: reads 'TPV, carta digital y chatbot con IA' / 'para restaurantes' / 'de Tenerife y Canarias'", () => {
      renderWithLanguage();
      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toHaveTextContent(
        "TPV, carta digital y chatbot con IA para restaurantes de Tenerife y Canarias",
      );
    });

    it("en: reads 'POS, digital menu and AI chatbot' / 'for restaurants' / 'in Tenerife and the Canary Islands'", () => {
      localStorage.setItem("language", "en");
      renderWithLanguage();
      const h1 = screen.getByRole("heading", { level: 1 });
      expect(h1).toHaveTextContent(
        "POS, digital menu and AI chatbot for restaurants in Tenerife and the Canary Islands",
      );
    });

    it("es: the subtitle covers TPV táctil, carta digital, chatbot con IA and NFC cards", () => {
      renderWithLanguage();
      const lede = document.querySelector(".ds-lede");
      expect(lede).toHaveTextContent(/TPV táctil/);
      expect(lede).toHaveTextContent(/carta digital/);
      expect(lede).toHaveTextContent(/chatbot con IA/);
      expect(lede).toHaveTextContent(/tarjetas NFC/);
    });

    it("en: the subtitle covers the POS, digital menu, AI chatbot and NFC cards", () => {
      localStorage.setItem("language", "en");
      renderWithLanguage();
      const lede = document.querySelector(".ds-lede");
      expect(lede).toHaveTextContent(/POS/);
      expect(lede).toHaveTextContent(/digital menu/);
      expect(lede).toHaveTextContent(/AI chatbot/);
      expect(lede).toHaveTextContent(/NFC cards/);
    });

    it("still renders the 3-part composition: plain text, one accent <span>, plain text", () => {
      renderWithLanguage();
      const h1 = screen.getByRole("heading", { level: 1 });
      const spans = h1.querySelectorAll("span");
      expect(spans).toHaveLength(1);
      expect(spans[0]).toHaveTextContent("para restaurantes");
      expect(
        h1.textContent?.startsWith("TPV, carta digital y chatbot con IA"),
      ).toBe(true);
      expect(h1.textContent?.endsWith("de Tenerife y Canarias")).toBe(true);
    });
  });
});
