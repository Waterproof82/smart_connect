import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "@shared/context/LanguageContext";
import CartaDigitalBeneficiosSection from "../CartaDigitalBeneficiosSection";

const renderWithLanguage = () => {
  return render(
    <LanguageProvider>
      <CartaDigitalBeneficiosSection />
    </LanguageProvider>,
  );
};

describe("CartaDigitalBeneficiosSection", () => {
  it("renders without crashing", () => {
    expect(() => renderWithLanguage()).not.toThrow();
  });

  it("displays the benefits section heading", () => {
    renderWithLanguage();
    expect(screen.getByText(/cambian tu negocio/i)).toBeInTheDocument();
  });

  it("renders all 7 benefit items", () => {
    const { container } = renderWithLanguage();
    const items = container.querySelectorAll("[data-testid='beneficio-item']");
    expect(items.length).toBe(7);
  });

  it("renders a lucide svg icon (not an emoji) inside each benefit item", () => {
    const { container } = renderWithLanguage();
    const items = container.querySelectorAll("[data-testid='beneficio-item']");
    items.forEach((item) => {
      expect(item.querySelector("svg")).not.toBeNull();
    });
  });

  it("no longer contains the legacy emoji icons", () => {
    const { container } = renderWithLanguage();
    expect(container.textContent).not.toMatch(
      /🍽️|🌍|💰|👤|💬|🌐|⚙️/,
    );
  });

  // accessibility-baseline spec: "Carta Digital Headings Are Not Split" —
  // the kicker + title fragments must render as a single, whole <h2>, not
  // a kicker <div> sibling to a separate <h2>.
  describe("single h2 (design.md D8 — not split kicker/title)", () => {
    it("renders exactly one h2 in the section, containing the full heading text", () => {
      const { container } = renderWithLanguage();
      const section = container.querySelector("section#beneficios")!;
      const h2s = section.querySelectorAll("h2");
      expect(h2s.length).toBe(1);
      expect(h2s[0].textContent).toMatch(/cambian tu negocio/i);
    });

    it("the kicker text is a span nested inside the h2, not a sibling heading", () => {
      const { container } = renderWithLanguage();
      const h2 = container.querySelector("section#beneficios h2")!;
      const kickerSpan = h2.querySelector("span.ds-kicker");
      expect(kickerSpan).not.toBeNull();
      expect(
        container.querySelectorAll("section#beneficios div.ds-kicker"),
      ).toHaveLength(0);
    });

    it("the section has aria-labelledby pointing at the h2's id", () => {
      const { container } = renderWithLanguage();
      const section = container.querySelector("section#beneficios")!;
      const h2 = section.querySelector("h2")!;
      expect(h2.id).toBeTruthy();
      expect(section.getAttribute("aria-labelledby")).toBe(h2.id);
    });
  });
});
