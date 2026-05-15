import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "@shared/context/LanguageContext";
import { HelmetProvider } from "react-helmet-async";
import NfcReviewsContainer from "./NfcReviewsContainer";

// Mock shared components to isolate the container test
vi.mock("@features/landing/presentation/components/Hero", () => ({
  Hero: () => <div>Hero Component</div>,
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

describe("NfcReviewsContainer", () => {
  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <HelmetProvider>
          <LanguageProvider>
            <NfcReviewsContainer />
          </LanguageProvider>
        </HelmetProvider>
      </MemoryRouter>,
    );
  };

  it("should render the hero title and subtitle", () => {
    renderComponent();
    expect(
      screen.getByRole("heading", {
        name: "Tapstar NFC: Tarjetas que Potencian tus Google Reviews",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Aumenta la visibilidad de tu restaurante con NFC/),
    ).toBeInTheDocument();
  });

  it("should render the main sections of the page", () => {
    renderComponent();
    expect(screen.getByText("Testimonial Carousel")).toBeInTheDocument();
    expect(screen.getByText("FAQ Accordion")).toBeInTheDocument();
    expect(screen.getByText("Contact Form")).toBeInTheDocument();
    expect(screen.getByText("Hero Component")).toBeInTheDocument();
  });
});
