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

  it("renders the CTA link with btn-primary-inverse, not btn-primary", () => {
    renderWithLanguage();
    const link = screen.getByRole("link", { name: /Contactar ahora/i });
    expect(link).toHaveClass("btn-primary-inverse");
    expect(link).not.toHaveClass("btn-primary");
  });

  it("does not carry stale conflicting utility classes", () => {
    renderWithLanguage();
    const link = screen.getByRole("link", { name: /Contactar ahora/i });
    expect(link.className).not.toMatch(
      /rounded-xl|bg-white|min-h-\[48px\]/,
    );
  });
});
