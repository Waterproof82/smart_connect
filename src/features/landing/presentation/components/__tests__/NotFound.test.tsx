import { render, screen } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "@shared/context/LanguageContext";
import { NotFound } from "../NotFound";

// jsdom has no IntersectionObserver; PageShell uses it for the nav state.
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

const renderNotFound = () => {
  return render(
    <HelmetProvider>
      <LanguageProvider>
        <MemoryRouter>
          <NotFound />
        </MemoryRouter>
      </LanguageProvider>
    </HelmetProvider>,
  );
};

describe("NotFound", () => {
  it("renders without crashing", () => {
    expect(() => renderNotFound()).not.toThrow();
  });

  it("renders a single h1", () => {
    renderNotFound();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });

  it("renders the home link with the shared ghost button", () => {
    renderNotFound();
    const link = screen.getByRole("link", { name: /Volver al inicio/i });
    expect(link).toHaveClass("btn-ghost");
    expect(link).toHaveAttribute("href", "/");
  });

  it("does not carry stale conflicting utility classes", () => {
    renderNotFound();
    const link = screen.getByRole("link", { name: /Volver al inicio/i });
    expect(link.className).not.toMatch(
      /rounded-xl|bg-\[var\(--color-accent\)\]/,
    );
  });
});
