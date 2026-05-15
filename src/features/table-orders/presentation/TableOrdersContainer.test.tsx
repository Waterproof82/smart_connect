import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "@shared/context/LanguageContext";
import TableOrdersContainer from "./TableOrdersContainer";

// Mock shared components
vi.mock("@shared/presentation/components/Hero", () => ({
  default: ({ title, subtitle }: { title: string; subtitle: string }) => (
    <div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  ),
}));
vi.mock("@shared/presentation/components/TestimonialCarousel", () => ({
  default: () => <div>Testimonial Carousel</div>,
}));
vi.mock("@shared/presentation/components/FAQAccordion", () => ({
  default: () => <div>FAQ Accordion</div>,
}));
vi.mock("@features/landing/presentation/components/Navbar", () => ({
  Navbar: () => <div>Navbar</div>,
}));
vi.mock("@features/landing/presentation/components/Contact", () => ({
  Contact: () => <div>Contact Form</div>,
}));

describe("TableOrdersContainer", () => {
  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <LanguageProvider>
          <TableOrdersContainer />
        </LanguageProvider>
      </MemoryRouter>,
    );
  };

  it("should render the hero section with the correct title and subtitle", () => {
    renderComponent();
    expect(
      screen.getByText("Pedidos a Mesa con QR: Más Rápido, Más Ventas"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Elimina las esperas y aumenta el ticket medio/),
    ).toBeInTheDocument();
  });

  it("should render the main sections of the page", () => {
    renderComponent();
    expect(screen.getByText("Testimonial Carousel")).toBeInTheDocument();
    expect(screen.getByText("FAQ Accordion")).toBeInTheDocument();
    expect(screen.getByText("Contact Form")).toBeInTheDocument();
  });
});
