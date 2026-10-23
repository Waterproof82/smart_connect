import { render, screen, within } from "@testing-library/react";
import { LanguageProvider } from "@shared/context/LanguageContext";
import CartaDigitalVisibilidadSection from "../CartaDigitalVisibilidadSection";

const renderWithLanguage = () => {
  return render(
    <LanguageProvider>
      <CartaDigitalVisibilidadSection />
    </LanguageProvider>,
  );
};

describe("CartaDigitalVisibilidadSection", () => {
  it("renders the section heading as an h2 anchored at #visibilidad", () => {
    const { container } = renderWithLanguage();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /Que te encuentren en Google y en la IA/i,
      }),
    ).toBeInTheDocument();
    expect(container.querySelector("section#visibilidad")).not.toBeNull();
  });

  it("renders SEO and GEO columns with four points each", () => {
    renderWithLanguage();
    const seo = screen.getByRole("list", { name: /SEO local/i });
    const geo = screen.getByRole("list", { name: /^GEO$/i });
    expect(within(seo).getAllByRole("listitem")).toHaveLength(4);
    expect(within(geo).getAllByRole("listitem")).toHaveLength(4);
  });

  it("renders the six-step feedback loop as an ordered list", () => {
    renderWithLanguage();
    const loop = screen.getByRole("list", {
      name: /Cada pedido trae al siguiente cliente/i,
    });
    expect(loop.tagName).toBe("OL");
    expect(within(loop).getAllByRole("listitem")).toHaveLength(6);
  });

  it("connects the Google Business Profile and reviews from the menu", () => {
    renderWithLanguage();
    expect(screen.getByText(/perfil de empresa de Google/i)).toBeInTheDocument();
    expect(screen.getByText(/reseña en Google desde la carta/i)).toBeInTheDocument();
  });
});
