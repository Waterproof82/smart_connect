import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "@shared/context/LanguageContext";
import CartaDigitalHeroSection from "../CartaDigitalHeroSection";

const noop = () => {};

const renderWithLanguage = () => {
  return render(
    <LanguageProvider>
      <CartaDigitalHeroSection onScrollToSection={noop} />
    </LanguageProvider>,
  );
};

describe("CartaDigitalHeroSection", () => {
  it("renders without crashing", () => {
    expect(() => renderWithLanguage()).not.toThrow();
  });

  it("renders a lucide MapPin icon instead of the 📍 emoji prefix", () => {
    const { container } = renderWithLanguage();
    expect(container.textContent).not.toMatch(/📍/);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("renders WhatsApp as the single primary CTA (shared btn-wa)", () => {
    const { container } = renderWithLanguage();
    const link = screen.getByRole("link", { name: /WhatsApp/i });
    expect(link).toHaveClass("btn-wa");
    expect(link.getAttribute("href")).toMatch(/^\/#contacto\?servicio=Carta%20Digital/);
    expect(container.querySelectorAll(".btn-primary, .btn-wa")).toHaveLength(1);
  });

  it("renders the demo scroll button as a ghost button with type=button", () => {
    renderWithLanguage();
    const button = screen.getByRole("button", { name: /Ver cómo funciona/i });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass("btn-ghost");
  });

  it("renders the calc scroll button as a ghost button with type=button", () => {
    renderWithLanguage();
    const button = screen.getByRole("button", { name: /Calcular ahorro/i });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass("btn-ghost");
  });

  it("does not carry stale conflicting utility classes on the demo CTA", () => {
    renderWithLanguage();
    const button = screen.getByRole("button", { name: /Ver cómo funciona/i });
    expect(button.className).not.toMatch(
      /rounded-xl|bg-\[var\(--color-primary\)\]|min-h-\[44px\]|uppercase/,
    );
  });

  it("does not carry stale conflicting utility classes on the secondary CTA", () => {
    renderWithLanguage();
    const button = screen.getByRole("button", { name: /Calcular ahorro/i });
    expect(button.className).not.toMatch(
      /rounded-xl|bg-\[var\(--color-primary\)\]|min-h-\[44px\]/,
    );
  });

  it("renders the page's only h1, visible, with the SEO keyword wording", () => {
    renderWithLanguage();
    const h1 = screen.getByRole("heading", { level: 1 });
    expect(h1).toHaveTextContent(
      /Carta digital para restaurantes: pedidos sin pagar comisión a Glovo/,
    );
    expect(h1.className).not.toMatch(/sr-only/);
  });

  it("renders the slogan as display text, not as a competing heading", () => {
    renderWithLanguage();
    const slogan = screen.getByText(/Tu carta,/);
    expect(slogan.closest("h1,h2,h3")).toBeNull();
    expect(slogan.closest("p")).toHaveClass("ds-h1");
  });

  it("renders both CTA buttons", () => {
    renderWithLanguage();
    expect(
      screen.getByRole("button", { name: /Ver cómo funciona/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Calcular ahorro/i }),
    ).toBeInTheDocument();
  });

  it("renders all 4 stat labels", () => {
    renderWithLanguage();
    expect(screen.getByText("Idiomas")).toBeInTheDocument();
    expect(screen.getByText("Comisiones")).toBeInTheDocument();
    expect(screen.getByText("Pedidos online")).toBeInTheDocument();
    expect(screen.getByText("Clientes")).toBeInTheDocument();
  });

  it("renders the horizon band illustration with exactly 4 motif groups", () => {
    const { container } = renderWithLanguage();
    const band = container.querySelector('[data-testid="carta-hero-band"]');
    expect(band).toBeInTheDocument();

    const motifs = container.querySelectorAll(
      '[data-testid="carta-hero-band"] g[data-motif]',
    );
    expect(motifs.length).toBe(4);
  });

  it("band has no focusable node and is aria-hidden", () => {
    const { container } = renderWithLanguage();
    const band = container.querySelector('[data-testid="carta-hero-band"]');
    expect(band).toHaveAttribute("aria-hidden", "true");
    expect(band).toHaveAttribute("focusable", "false");

    const focusable = band?.querySelectorAll(
      "a, button, input, select, textarea, [tabindex]",
    );
    expect(focusable?.length ?? 0).toBe(0);
  });
});
