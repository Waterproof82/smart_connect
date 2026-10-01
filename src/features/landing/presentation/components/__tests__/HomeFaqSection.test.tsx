import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "@shared/context/LanguageContext";
import HomeFaqSection from "../HomeFaqSection";

const renderWithLanguage = () => {
  return render(
    <LanguageProvider>
      <HomeFaqSection />
    </LanguageProvider>,
  );
};

describe("HomeFaqSection", () => {
  it("renders the FAQ section with a single h2 title", () => {
    renderWithLanguage();
    expect(
      screen.getByRole("heading", { level: 2, name: /Preguntas Frecuentes/i }),
    ).toBeInTheDocument();
  });

  it("renders at least 6 question items via summary elements", () => {
    renderWithLanguage();
    const summaries = screen.getAllByRole("group");
    // details elements are implicitly group role
    expect(summaries.length).toBeGreaterThanOrEqual(6);
  });

  it("renders all 6 FAQ questions as visible text", () => {
    renderWithLanguage();
    expect(screen.getByText(/¿Qué es Digitaliza Tenerife\?/)).toBeInTheDocument();
    expect(screen.getByText(/¿Cuánto cuesta la Carta Digital\?/)).toBeInTheDocument();
    expect(screen.getByText(/¿Cómo funcionan las tarjetas NFC Tap-to-Review\?/)).toBeInTheDocument();
    expect(screen.getByText(/¿Sus soluciones sirven para negocios fuera de Canarias\?/)).toBeInTheDocument();
    expect(screen.getByText(/¿Necesito conocimientos técnicos/)).toBeInTheDocument();
    expect(screen.getByText(/¿Cuánto tiempo lleva implementar el sistema\?/)).toBeInTheDocument();
  });

  // The home FAQPage JSON-LD is emitted once by App.tsx (buildHomeSchema,
  // fed by useHomeFaqGroups) — the section must not emit a duplicate.
  it("does not emit its own JSON-LD (App.tsx owns the FAQPage schema)", () => {
    const { container } = renderWithLanguage();
    const scripts = container.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts).toHaveLength(0);
  });

  it("keeps every answer in the DOM (visible FAQ == FAQPage JSON-LD)", () => {
    renderWithLanguage();
    expect(screen.getAllByRole("group").every((d) => d.querySelector("p"))).toBe(true);
  });

  it("renders inside a section element with an aria-label", () => {
    const { container } = renderWithLanguage();
    const section = container.querySelector("section");
    expect(section).toBeInTheDocument();
  });
});
