import { render, screen } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "@shared/context/LanguageContext";
import CartaDigitalPage from "../CartaDigitalPage";

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

const renderCartaDigitalPage = () => {
  return render(
    <HelmetProvider>
      <LanguageProvider>
        <MemoryRouter>
          <CartaDigitalPage />
        </MemoryRouter>
      </LanguageProvider>
    </HelmetProvider>,
  );
};

describe("CartaDigitalPage (S8b: mount CartaDigitalReviews)", () => {
  it("renders without crashing", () => {
    expect(() => renderCartaDigitalPage()).not.toThrow();
  });

  it("renders the reviews section wrapped in <section id='opiniones' aria-labelledby='carta-opiniones-title'>", () => {
    const { container } = renderCartaDigitalPage();
    const section = container.querySelector("section#opiniones");
    expect(section).not.toBeNull();
    expect(section?.getAttribute("aria-labelledby")).toBe(
      "carta-opiniones-title",
    );
    expect(section?.className).toMatch(/ds-section/);
  });

  it("wires CartaDigitalReviews' heading id to the section's aria-labelledby, with no duplicate id in the document", () => {
    const { container } = renderCartaDigitalPage();
    const matches = container.querySelectorAll("#carta-opiniones-title");
    expect(matches).toHaveLength(1);
    expect(matches[0].tagName).toBe("H2");
  });

  it("renders the reviews content (title text) on the page", () => {
    renderCartaDigitalPage();
    expect(screen.getByText("Lo que dicen los comensales")).toBeInTheDocument();
  });

  it("mounts the reviews section after CartaDigitalSection and before the FAQ section", () => {
    const { container } = renderCartaDigitalPage();
    const cartaIdx = container.innerHTML.indexOf('id="carta-digital"');
    const opinionesIdx = container.innerHTML.indexOf('id="opiniones"');
    const faqIdx = container.innerHTML.indexOf('id="faq"');

    expect(cartaIdx).toBeGreaterThan(-1);
    expect(opinionesIdx).toBeGreaterThan(cartaIdx);
    expect(faqIdx).toBeGreaterThan(opinionesIdx);
  });
});
