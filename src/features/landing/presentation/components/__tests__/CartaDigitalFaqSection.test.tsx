import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "@shared/context/LanguageContext";
import CartaDigitalFaqSection from "../CartaDigitalFaqSection";

const renderWithLanguage = () => {
  return render(
    <LanguageProvider>
      <CartaDigitalFaqSection />
    </LanguageProvider>,
  );
};

describe("CartaDigitalFaqSection", () => {
  it("renders the FAQ section title", () => {
    renderWithLanguage();
    expect(
      screen.getByText(/Preguntas Frecuentes — Carta Digital/i),
    ).toBeInTheDocument();
  });

  it("renders at least 5 FAQ questions", () => {
    renderWithLanguage();
    expect(screen.getByText(/¿Qué es la Carta Digital\?/)).toBeInTheDocument();
    expect(screen.getByText(/¿Necesito una app para usar el menú digital\?/)).toBeInTheDocument();
    expect(screen.getByText(/¿Cuántos idiomas soporta la carta\?/)).toBeInTheDocument();
    expect(screen.getByText(/¿Hay comisiones por pedido\?/)).toBeInTheDocument();
    expect(screen.getByText(/¿Cuánto tiempo lleva la puesta en marcha\?/)).toBeInTheDocument();
  });

  it("renders the HowTo section title", () => {
    renderWithLanguage();
    expect(
      screen.getByText(/Cómo funciona la Carta Digital/i),
    ).toBeInTheDocument();
  });

  it("renders 3 HowTo steps", () => {
    renderWithLanguage();
    expect(screen.getByText(/Escanear el QR/)).toBeInTheDocument();
    expect(screen.getByText(/Hacer el pedido/)).toBeInTheDocument();
    expect(screen.getByText(/Telegram recibe el pedido/)).toBeInTheDocument();
  });

  it("renders both FAQ and HowTo JSON-LD schema scripts", () => {
    const { container } = renderWithLanguage();
    const scripts = container.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts.length).toBeGreaterThanOrEqual(2);
  });
});
