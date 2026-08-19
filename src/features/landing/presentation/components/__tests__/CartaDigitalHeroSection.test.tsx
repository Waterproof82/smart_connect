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

  it("renders the primary CTA (demo) button with btn-primary and type=button", () => {
    renderWithLanguage();
    const button = screen.getByRole("button", { name: /Ver cómo funciona/i });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass("btn-primary");
  });

  it("renders the secondary CTA (calc) button with btn-secondary and type=button", () => {
    renderWithLanguage();
    const button = screen.getByRole("button", { name: /Calcular ahorro/i });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass("btn-secondary");
  });

  it("does not carry stale conflicting utility classes on the primary CTA", () => {
    renderWithLanguage();
    const button = screen.getByRole("button", { name: /Ver cómo funciona/i });
    expect(button.className).not.toMatch(
      /rounded-xl|bg-\[var\(--color-primary\)\]|min-h-\[44px\]/,
    );
  });

  it("does not carry stale conflicting utility classes on the secondary CTA", () => {
    renderWithLanguage();
    const button = screen.getByRole("button", { name: /Calcular ahorro/i });
    expect(button.className).not.toMatch(
      /rounded-xl|bg-\[var\(--color-primary\)\]|min-h-\[44px\]/,
    );
  });

  it("renders the title heading", () => {
    renderWithLanguage();
    expect(
      screen.getByRole("heading", { name: /Tu carta,\s*tu negocio,\s*tus clientes\./ }),
    ).toBeInTheDocument();
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
      '[data-testid="carta-hero-band"] g.animate-float-fancy',
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
