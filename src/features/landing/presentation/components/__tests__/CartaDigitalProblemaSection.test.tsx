import { render } from "@testing-library/react";
import { LanguageProvider } from "@shared/context/LanguageContext";
import CartaDigitalProblemaSection from "../CartaDigitalProblemaSection";

const renderWithLanguage = () => {
  return render(
    <LanguageProvider>
      <CartaDigitalProblemaSection />
    </LanguageProvider>,
  );
};

describe("CartaDigitalProblemaSection", () => {
  it("renders without crashing", () => {
    expect(() => renderWithLanguage()).not.toThrow();
  });

  it("renders all 6 problem items", () => {
    const { container } = renderWithLanguage();
    const items = container.querySelectorAll("#problema li");
    expect(items.length).toBe(6);
  });

  // accessibility-baseline spec: "Carta Digital Headings Are Not Split" —
  // the kicker + title fragments must render as a single, whole <h2>, not
  // a kicker <div> sibling to a separate <h2>.
  describe("single h2 (design.md D8 — not split kicker/title)", () => {
    it("renders exactly one h2 in the section, containing the full heading text", () => {
      const { container } = renderWithLanguage();
      const section = container.querySelector("section#problema")!;
      const h2s = section.querySelectorAll("h2");
      expect(h2s.length).toBe(1);
    });

    it("the kicker text is a span nested inside the h2, not a sibling heading", () => {
      const { container } = renderWithLanguage();
      const h2 = container.querySelector("section#problema h2")!;
      const kickerSpan = h2.querySelector("span.ds-kicker");
      expect(kickerSpan).not.toBeNull();
      expect(
        container.querySelectorAll("section#problema div.ds-kicker"),
      ).toHaveLength(0);
    });

    it("the section has aria-labelledby pointing at the h2's id", () => {
      const { container } = renderWithLanguage();
      const section = container.querySelector("section#problema")!;
      const h2 = section.querySelector("h2")!;
      expect(h2.id).toBeTruthy();
      expect(section.getAttribute("aria-labelledby")).toBe(h2.id);
    });
  });
});
