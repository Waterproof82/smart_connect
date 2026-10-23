import { render, screen, within } from "@testing-library/react";
import { LanguageProvider } from "@shared/context/LanguageContext";
import CartaDigitalConfianzaSection from "../CartaDigitalConfianzaSection";

const renderWithLanguage = () => {
  return render(
    <LanguageProvider>
      <CartaDigitalConfianzaSection />
    </LanguageProvider>,
  );
};

describe("CartaDigitalConfianzaSection", () => {
  it("renders the section heading as an h2", () => {
    renderWithLanguage();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /¿Quién hay detrás de tu carta digital\?/i,
      }),
    ).toBeInTheDocument();
  });

  it("is labelled by its heading and anchored at #confianza", () => {
    const { container } = renderWithLanguage();
    const section = container.querySelector("section#confianza");
    expect(section).not.toBeNull();
    expect(section?.getAttribute("aria-labelledby")).toBe(
      "carta-confianza-title",
    );
  });

  it("lists the six kinds of data at stake", () => {
    renderWithLanguage();
    const stakes = screen.getByRole("list", { name: /Lo que pones en juego/i });
    expect(within(stakes).getAllByRole("listitem")).toHaveLength(6);
  });

  it("compares an anonymous app against Digitaliza Tenerife with five points each", () => {
    renderWithLanguage();
    const anon = screen.getByRole("list", { name: /App anónima/i });
    const own = screen.getByRole("list", { name: /Digitaliza Tenerife/i });
    expect(within(anon).getAllByRole("listitem")).toHaveLength(5);
    expect(within(own).getAllByRole("listitem")).toHaveLength(5);
  });

  it("names the real contact person in Tenerife and the WhatsApp support", () => {
    renderWithLanguage();
    expect(screen.getByText(/persona real de Tenerife/i)).toBeInTheDocument();
    expect(screen.getByText(/WhatsApp/i)).toBeInTheDocument();
  });

  it("marks every icon as decorative", () => {
    const { container } = renderWithLanguage();
    const icons = container.querySelectorAll("svg");
    expect(icons.length).toBeGreaterThan(0);
    icons.forEach((icon) => {
      expect(icon.getAttribute("aria-hidden")).toBe("true");
    });
  });
});
