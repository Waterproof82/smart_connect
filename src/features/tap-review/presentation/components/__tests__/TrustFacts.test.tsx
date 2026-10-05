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

  // Absence of the old fabricated testimonial businesses and quotes is
  // enforced repo-wide by tests/unit/content/trustClaims.guard.test.ts
  // (NFC scope) — not duplicated here so this file doesn't itself contain
  // those literal strings (it lives under src/, which that guard scans).
});
