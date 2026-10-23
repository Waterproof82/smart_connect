import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "@shared/context/LanguageContext";
import CartaDigitalPagoMesaSection from "../CartaDigitalPagoMesaSection";

const renderWithLanguage = () => {
  return render(
    <LanguageProvider>
      <CartaDigitalPagoMesaSection />
    </LanguageProvider>,
  );
};

describe("CartaDigitalPagoMesaSection", () => {
  it("renders the section heading as an h2 anchored at #pago-en-mesa", () => {
    const { container } = renderWithLanguage();
    expect(
      screen.getByRole("heading", { level: 2, name: /recuperas las propinas/i }),
    ).toBeInTheDocument();
    expect(container.querySelector("section#pago-en-mesa")).not.toBeNull();
  });

  it("renders the four payment features as h3 headings", () => {
    renderWithLanguage();
    expect(
      screen.getByRole("heading", { level: 3, name: /Propina sugerida en el ticket/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: /Cuenta a partes iguales/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: /Cada uno paga lo suyo/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: /Reseña después del pago/i }),
    ).toBeInTheDocument();
  });

  it("mentions the TPV and Veri*factu record", () => {
    renderWithLanguage();
    expect(screen.getByText(/Veri\*factu/)).toBeInTheDocument();
  });

  it("renders no filled call-to-action button (one primary CTA per page)", () => {
    renderWithLanguage();
    expect(screen.queryByRole("button")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
  });
});
