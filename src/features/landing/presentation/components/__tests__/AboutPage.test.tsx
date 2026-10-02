import { render, screen } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "@shared/context/LanguageContext";
import AboutPage from "../AboutPage";

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

const renderAboutPage = () => {
  return render(
    <HelmetProvider>
      <LanguageProvider>
        <MemoryRouter>
          <AboutPage />
        </MemoryRouter>
      </LanguageProvider>
    </HelmetProvider>,
  );
};

describe("AboutPage", () => {
  it("renders without crashing", () => {
    expect(() => renderAboutPage()).not.toThrow();
  });

  it("renders a visible founder block naming José Miguel Aristía as Fundador", () => {
    renderAboutPage();
    expect(screen.getByText("Fundador")).toBeInTheDocument();
    expect(screen.getByText("José Miguel Aristía")).toBeInTheDocument();
  });

  it("renders the Tacoronte address in the Oficina block, not the old locality", () => {
    renderAboutPage();
    expect(screen.getAllByText(/Tacoronte/).length).toBeGreaterThan(0);
    expect(screen.queryByText(/Puerta/)).not.toBeInTheDocument();
    expect(screen.queryByText(/38001/)).not.toBeInTheDocument();
  });
});
