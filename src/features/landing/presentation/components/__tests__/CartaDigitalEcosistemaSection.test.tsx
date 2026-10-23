import { render, screen, within } from "@testing-library/react";
import { LanguageProvider } from "@shared/context/LanguageContext";
import CartaDigitalEcosistemaSection from "../CartaDigitalEcosistemaSection";

const renderWithLanguage = () => {
  return render(
    <LanguageProvider>
      <CartaDigitalEcosistemaSection />
    </LanguageProvider>,
  );
};

describe("CartaDigitalEcosistemaSection", () => {
  it("renders the section heading as an h2", () => {
    renderWithLanguage();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /De la búsqueda en Google al cierre de caja/i,
      }),
    ).toBeInTheDocument();
  });

  it("renders the four stages as an ordered list", () => {
    const { container } = renderWithLanguage();
    const stages = container.querySelectorAll("ol[data-testid='eco-stages'] > li");
    expect(stages).toHaveLength(4);
  });

  it("renders each stage title as an h3 in flow order", () => {
    renderWithLanguage();
    const titles = screen
      .getAllByRole("heading", { level: 3 })
      .map((h) => h.textContent);
    expect(titles).toEqual([
      "Te descubren",
      "Piden",
      "Se prepara",
      "Se cobra y se gestiona",
    ]);
  });

  it("covers waiter PDA, kitchen/bar routing, table payment and Veri*factu", () => {
    renderWithLanguage();
    expect(screen.getByText(/camarero y su PDA/i)).toBeInTheDocument();
    expect(screen.getByText(/cocina y la bebida a barra/i)).toBeInTheDocument();
    expect(screen.getByText(/Pago desde la mesa con propina/i)).toBeInTheDocument();
    expect(screen.getByText("Veri*factu")).toBeInTheDocument();
  });

  it("lists Google reviews from the menu as a discovery channel", () => {
    renderWithLanguage();
    const stages = screen.getAllByRole("listitem");
    const discover = stages.find((li) =>
      within(li).queryByRole("heading", { name: "Te descubren" }),
    );
    expect(discover).toBeDefined();
    expect(
      within(discover as HTMLElement).getByText(/Reseñas en Google desde la carta/i),
    ).toBeInTheDocument();
  });
});
