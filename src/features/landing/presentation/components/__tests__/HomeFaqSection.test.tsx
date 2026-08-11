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
  it("renders the FAQ section with a title heading", () => {
    renderWithLanguage();
    expect(
      screen.getByRole("heading", { name: /Preguntas Frecuentes/i }),
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

  it("renders FAQ schema script tag in the document", () => {
    const { container } = renderWithLanguage();
    const scripts = container.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts.length).toBeGreaterThanOrEqual(1);
  });

  it("renders inside a section element with an aria-label", () => {
    const { container } = renderWithLanguage();
    const section = container.querySelector("section");
    expect(section).toBeInTheDocument();
  });
});
