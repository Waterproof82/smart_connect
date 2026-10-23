import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "@shared/context/LanguageContext";
import CartaDigitalPruebaSection from "../CartaDigitalPruebaSection";

const renderWithLanguage = () => {
  return render(
    <LanguageProvider>
      <CartaDigitalPruebaSection />
    </LanguageProvider>,
  );
};

describe("CartaDigitalPruebaSection", () => {
  it("renders the 30-day free trial heading as an h2 anchored at #prueba-gratis", () => {
    const { container } = renderWithLanguage();
    expect(
      screen.getByRole("heading", { level: 2, name: /30 días gratis/i }),
    ).toBeInTheDocument();
    expect(container.querySelector("section#prueba-gratis")).not.toBeNull();
  });

  it("renders the three trial steps as an ordered list", () => {
    const { container } = renderWithLanguage();
    expect(container.querySelectorAll("ol[data-testid='prueba-steps'] > li")).toHaveLength(3);
  });

  it("states both outcomes, including leaving with no cost", () => {
    renderWithLanguage();
    expect(screen.getByRole("heading", { level: 3, name: /¿Ves mejora\?/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: /¿No la ves\?/i })).toBeInTheDocument();
    expect(screen.getByText(/sin coste y sin permanencia/i)).toBeInTheDocument();
  });

  it("never uses guarantee wording", () => {
    const { container } = renderWithLanguage();
    expect(container.textContent).not.toMatch(/garant/i);
  });
});
