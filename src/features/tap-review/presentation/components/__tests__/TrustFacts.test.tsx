import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "@shared/context/LanguageContext";
import TrustFacts from "../TrustFacts";

const renderWithLanguage = () => {
  return render(
    <LanguageProvider>
      <TrustFacts />
    </LanguageProvider>,
  );
};

describe("TrustFacts (tap-review, PR2b factual cards — replaces SocialProof)", () => {
  it("renders without crashing", () => {
    expect(() => renderWithLanguage()).not.toThrow();
  });

  it("renders exactly 3 factual cards with their titles", () => {
    renderWithLanguage();
    expect(
      screen.getByRole("heading", { name: "Lo configuramos por ti" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Funciona con casi cualquier móvil",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Trato directo con un equipo de Tenerife",
      }),
    ).toBeInTheDocument();
  });

  it("does not render a star-rating group (no stars on factual cards)", () => {
    renderWithLanguage();
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("does not render fabricated testimonial content (no quotes, business names or avatar initials)", () => {
    renderWithLanguage();
    expect(
      screen.queryByText(/Restaurante El Bodegón|Café Central|Bar La Tapa/),
    ).toBeNull();
    expect(screen.queryByText(/Pasamos de 50 a 500/)).toBeNull();
  });
});
