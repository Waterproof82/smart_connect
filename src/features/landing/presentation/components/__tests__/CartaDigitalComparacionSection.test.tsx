import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "@shared/context/LanguageContext";
import CartaDigitalComparacionSection from "../CartaDigitalComparacionSection";

const renderWithLanguage = () => {
  return render(
    <LanguageProvider>
      <CartaDigitalComparacionSection />
    </LanguageProvider>,
  );
};

describe("CartaDigitalComparacionSection", () => {
  it("renders the section title", () => {
    renderWithLanguage();
    expect(
      screen.getByRole("heading", { name: /Carta Digital vs. Alternativas/i }),
    ).toBeInTheDocument();
  });

  it("renders a semantic table element", () => {
    const { container } = renderWithLanguage();
    const table = container.querySelector("table");
    expect(table).toBeInTheDocument();
  });

  it("renders thead and tbody elements", () => {
    const { container } = renderWithLanguage();
    expect(container.querySelector("thead")).toBeInTheDocument();
    expect(container.querySelector("tbody")).toBeInTheDocument();
  });

  it("renders column headers for Digitaliza Tenerife and paper menu", () => {
    renderWithLanguage();
    expect(
      screen.getAllByText("Digitaliza Tenerife").length,
    ).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Carta en papel")).toBeInTheDocument();
    expect(screen.getByText("Otras apps")).toBeInTheDocument();
  });

  it("renders at least 5 rows in the table body", () => {
    const { container } = renderWithLanguage();
    const rows = container.querySelectorAll("tbody tr");
    expect(rows.length).toBeGreaterThanOrEqual(5);
  });

  it("renders specific comparison criteria", () => {
    renderWithLanguage();
    expect(screen.getByText("Comisiones")).toBeInTheDocument();
    expect(screen.getByText("Actualización de precios")).toBeInTheDocument();
    expect(screen.getByText("Idiomas")).toBeInTheDocument();
    expect(screen.getByText("Pedidos digitales")).toBeInTheDocument();
    expect(screen.getByText("Puesta en marcha")).toBeInTheDocument();
  });
});
