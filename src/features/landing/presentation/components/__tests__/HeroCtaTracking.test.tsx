import { fireEvent, render, screen } from "@testing-library/react";
import { LanguageProvider } from "@shared/context/LanguageContext";
import { Hero } from "../Hero";

const trackCtaClick = vi.fn();
vi.mock("@shared/utils/analyticsEvents", () => ({
  trackCtaClick: (...args: unknown[]) => trackCtaClick(...args),
}));
vi.mock("@shared/hooks", () => ({ useWhatsappPhone: () => "" }));

const renderHero = () =>
  render(
    <LanguageProvider>
      <Hero />
    </LanguageProvider>,
  );

describe("Hero CTA tracking", () => {
  afterEach(() => trackCtaClick.mockClear());

  it("fires cta_contact_click once for the hero contact button", () => {
    renderHero();
    fireEvent.click(screen.getByRole("link", { name: /contactar/i }));
    expect(trackCtaClick).toHaveBeenCalledTimes(1);
    expect(trackCtaClick).toHaveBeenCalledWith("cta_contact_click", "hero");
  });

  it("fires cta_demo_click once for the demo button", () => {
    renderHero();
    fireEvent.click(screen.getByRole("link", { name: /ver demo/i }));
    expect(trackCtaClick).toHaveBeenCalledTimes(1);
    expect(trackCtaClick).toHaveBeenCalledWith("cta_demo_click", "hero");
  });
});
