import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "@shared/context/LanguageContext";
import CTASection from "../CTASection";

// jsdom has no IntersectionObserver; the component uses it via
// useIntersectionObserver for a scroll-reveal animation, irrelevant to this
// test's className assertions.
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];
  disconnect = vi.fn();
  observe = vi.fn();
  takeRecords = vi.fn(() => []);
  unobserve = vi.fn();
}
globalThis.IntersectionObserver =
  MockIntersectionObserver as unknown as typeof IntersectionObserver;

const renderWithLanguage = () => {
  return render(
    <LanguageProvider>
      <CTASection />
    </LanguageProvider>,
  );
};

describe("CTASection (tap-review)", () => {
  it("renders without crashing", () => {
    expect(() => renderWithLanguage()).not.toThrow();
  });

  it("renders the shared WhatsApp CTA (btn-wa) with the absolute form fallback", () => {
    renderWithLanguage();
    const link = screen.getByRole("link", { name: /Contactar ahora/i });
    expect(link).toHaveClass("btn-wa");
    expect(link).not.toHaveClass("btn-primary-inverse");
    expect(link).toHaveAttribute(
      "href",
      "/#contacto?servicio=Tarjetas%20NFC",
    );
    expect(link).not.toHaveAttribute("target");
  });

  it("does not carry stale conflicting utility classes", () => {
    renderWithLanguage();
    const link = screen.getByRole("link", { name: /Contactar ahora/i });
    expect(link.className).not.toMatch(
      /rounded-xl|bg-white|min-h-\[48px\]|bg-gradient/,
    );
  });

  // Absence of the old unverified shipping/support/figure claims is
  // enforced repo-wide by tests/unit/content/trustClaims.guard.test.ts
  // (NFC scope) — not duplicated here so this file doesn't itself contain
  // those literal strings (it lives under src/, which that guard scans).

  it("renders the reworded feature list (Sin app, Configuración incluida, Sin suscripciones)", () => {
    renderWithLanguage();
    expect(screen.getByText("Sin app")).toBeInTheDocument();
    expect(screen.getByText("Configuración incluida")).toBeInTheDocument();
    expect(screen.getByText("Sin suscripciones")).toBeInTheDocument();
  });
});
