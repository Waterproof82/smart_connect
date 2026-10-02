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

  // accessibility-baseline spec: "No Duplicate FAQ Heading on Home" —
  // the outer App.tsx <section id="faq"> already labels this content, so
  // HomeFaqSection itself must not render a second, nested <section> (and
  // must not duplicate its own h2 text into a sibling h3 when there is
  // only one FAQ group).
  it("renders a div, not a nested section (design.md D8)", () => {
    const { container } = renderWithLanguage();
    expect(container.querySelector("section")).not.toBeInTheDocument();
    expect(container.querySelector("div")).toBeInTheDocument();
  });

  it("renders exactly one heading with the FAQ title (no duplicate h2+h3)", () => {
    const { container } = renderWithLanguage();
    const headings = Array.from(
      container.querySelectorAll("h2, h3"),
    ).filter((el) => /Preguntas Frecuentes/i.test(el.textContent ?? ""));
    expect(headings).toHaveLength(1);
    expect(headings[0].tagName).toBe("H2");
  });

  it("the single h2 carries id=\"faq-title\"", () => {
    const { container } = renderWithLanguage();
    const h2 = screen.getByRole("heading", {
      level: 2,
      name: /Preguntas Frecuentes/i,
    });
    expect(h2.id).toBe("faq-title");
    expect(container.querySelector("#faq-title")).toBe(h2);
  });
});
