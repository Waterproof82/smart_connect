import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "@shared/context/LanguageContext";
import CartaDigitalTelegramSection from "../CartaDigitalTelegramSection";

const renderWithLanguage = () => {
  return render(
    <LanguageProvider>
      <CartaDigitalTelegramSection />
    </LanguageProvider>,
  );
};

describe("CartaDigitalTelegramSection", () => {
  it("renders without crashing", () => {
    expect(() => renderWithLanguage()).not.toThrow();
  });

  it("displays the Telegram section heading", () => {
    renderWithLanguage();
    expect(
      screen.getByText(/Pedidos en mesa y para recoger/i),
    ).toBeInTheDocument();
  });

  it("renders at least 3 feature items", () => {
    const { container } = renderWithLanguage();
    const featureItems = container.querySelectorAll("[data-testid='telegram-feature']");
    expect(featureItems.length).toBeGreaterThanOrEqual(3);
  });

  it("displays the subtitle text", () => {
    renderWithLanguage();
    expect(
      screen.getByText(/En mesa, el pedido llega a la app de tu equipo/i),
    ).toBeInTheDocument();
  });

  it("displays all 4 feature titles", () => {
    renderWithLanguage();
    expect(screen.getByText(/Pedido en mesa desde el QR/i)).toBeInTheDocument();
    expect(screen.getByText(/App propia para camareros/i)).toBeInTheDocument();
    expect(screen.getByText(/Barra y cocina en tiempo real/i)).toBeInTheDocument();
    expect(screen.getByText(/Recoger en el local: aviso por Telegram/i)).toBeInTheDocument();
  });

  it("renders a lucide svg icon (not an emoji) inside each feature item", () => {
    const { container } = renderWithLanguage();
    const items = container.querySelectorAll("[data-testid='telegram-feature']");
    items.forEach((item) => {
      expect(item.querySelector("svg")).not.toBeNull();
    });
  });

  it("no longer contains the legacy emoji icons", () => {
    const { container } = renderWithLanguage();
    expect(container.textContent).not.toMatch(/📱|👥|✅|🍽️/);
  });

  it("displays the smart-restaurants closing heading", () => {
    renderWithLanguage();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /restaurantes inteligentes/i,
      }),
    ).toBeInTheDocument();
  });

  it("the smart-restaurants block links digital menu, Telegram orders and NFC cards", () => {
    renderWithLanguage();
    const heading = screen.getByRole("heading", {
      level: 2,
      name: /restaurantes inteligentes/i,
    });
    const desc = heading.nextElementSibling;
    expect(desc?.textContent).toMatch(/carta digital/i);
    expect(desc?.textContent).toMatch(/Telegram/i);
    expect(desc?.textContent).toMatch(/NFC/i);
  });

  it("renders no second <h1> and no <a> link inside this component", () => {
    const { container } = renderWithLanguage();
    expect(container.querySelectorAll("h1")).toHaveLength(0);
    expect(container.querySelector("a")).toBeNull();
  });
});
