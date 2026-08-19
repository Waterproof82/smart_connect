import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "@shared/context/LanguageContext";
import { TapReviewSection } from "../TapReviewSection";

// jsdom has no IntersectionObserver; CTASection (rendered as a child of
// TapReviewSection) uses it via useIntersectionObserver for a scroll-reveal
// animation, irrelevant to this test's className assertions.
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
      <TapReviewSection />
    </LanguageProvider>,
  );
};

describe("TapReviewSection", () => {
  it("renders without crashing", () => {
    expect(() => renderWithLanguage()).not.toThrow();
  });

  // "Contactar ahora" also appears on CTASection's own CTA further down the
  // page, rendered as a child of TapReviewSection — the hero's is first in
  // DOM order.
  it("renders the primary CTA link with btn-primary", () => {
    renderWithLanguage();
    const [link] = screen.getAllByRole("link", { name: /Contactar ahora/i });
    expect(link).toHaveClass("btn-primary");
  });

  it("renders the secondary CTA link with btn-secondary", () => {
    renderWithLanguage();
    const link = screen.getByRole("link", { name: /Ver producto/i });
    expect(link).toHaveClass("btn-secondary");
  });

  it("does not carry stale conflicting utility classes on either CTA", () => {
    renderWithLanguage();
    const [primary] = screen.getAllByRole("link", { name: /Contactar ahora/i });
    const secondary = screen.getByRole("link", { name: /Ver producto/i });
    expect(primary.className).not.toMatch(
      /rounded-xl|bg-\[var\(--color-accent\)\]|min-h-\[48px\]/,
    );
    expect(secondary.className).not.toMatch(
      /rounded-xl|bg-\[var\(--color-surface\)\]|min-h-\[48px\]/,
    );
  });
});
