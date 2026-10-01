import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "@shared/context/LanguageContext";
import { WhatsAppCta } from "../WhatsAppCta";

const mockPhone = { value: "" };
vi.mock("@shared/hooks", () => ({
  useWhatsappPhone: () => mockPhone.value,
}));

const renderCta = (props: React.ComponentProps<typeof WhatsAppCta> = {}) =>
  render(
    <LanguageProvider>
      <WhatsAppCta {...props} />
    </LanguageProvider>,
  );

describe("WhatsAppCta", () => {
  afterEach(() => {
    mockPhone.value = "";
  });

  it("falls back to the absolute contact form when no phone is known", () => {
    renderCta({ servicio: "Carta Digital" });
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/#contacto?servicio=Carta%20Digital");
    expect(link).not.toHaveAttribute("target");
    expect(link).toHaveClass("btn-wa");
  });

  it("links to wa.me with a pre-filled message once the phone is known", () => {
    mockPhone.value = "34600000000";
    renderCta({ message: "Hola, info" });
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute(
      "href",
      "https://wa.me/34600000000?text=Hola%2C%20info",
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("uses the default label and supports the compact size", () => {
    renderCta({ size: "sm" });
    const link = screen.getByRole("link", { name: /WhatsApp/i });
    expect(link).toHaveClass("btn-wa--sm");
  });
});
