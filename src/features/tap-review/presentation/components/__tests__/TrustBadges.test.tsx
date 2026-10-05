import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "@shared/context/LanguageContext";
import TrustBadges from "../TrustBadges";

const renderWithLanguage = () => {
  return render(
    <LanguageProvider>
      <TrustBadges />
    </LanguageProvider>,
  );
};

describe("TrustBadges (tap-review, PR2b facts strip)", () => {
  it("renders without crashing", () => {
    expect(() => renderWithLanguage()).not.toThrow();
  });

  it("renders the 4-item facts strip (no app, NFC + backup QR, compatibility, no subscriptions)", () => {
    renderWithLanguage();
    expect(screen.getByText("Sin app")).toBeInTheDocument();
    expect(screen.getByText("NFC + QR de respaldo")).toBeInTheDocument();
    expect(
      screen.getByText("iPhone 8+ y Android con NFC"),
    ).toBeInTheDocument();
    expect(screen.getByText("Sin suscripciones")).toBeInTheDocument();
  });

  // Absence of the old unverified guarantee/shipping/support strings is
  // enforced repo-wide by tests/unit/content/trustClaims.guard.test.ts
  // (NFC scope) — not duplicated here so this file doesn't itself contain
  // those literal strings (it lives under src/, which that guard scans).

  it("renders no star-rating group (facts strip, not a rating banner)", () => {
    renderWithLanguage();
    expect(screen.queryByRole("img")).toBeNull();
  });
});
