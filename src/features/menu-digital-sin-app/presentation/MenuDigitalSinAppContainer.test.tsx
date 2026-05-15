import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { LanguageProvider } from "@shared/context/LanguageContext";
import { HelmetProvider } from "react-helmet-async";
import MenuDigitalSinAppContainer from "./MenuDigitalSinAppContainer";

// Mock shared components to isolate the container test
jest.mock("@features/landing/presentation/components/Hero", () => ({
  Hero: () => <div>Hero Component</div>,
}));

jest.mock("@shared/presentation/components/TestimonialCarousel", () => ({
  default: () => <div>Testimonial Carousel</div>,
}));

jest.mock("@shared/presentation/components/FAQAccordion", () => ({
  default: () => <div>FAQ Accordion</div>,
}));

jest.mock("@features/landing/presentation/components/Navbar", () => ({
  Navbar: () => <div>Navbar</div>,
}));

jest.mock("@features/landing/presentation/components/Contact", () => ({
  Contact: () => <div>Contact Form</div>,
}));

describe("MenuDigitalSinAppContainer", () => {
  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <HelmetProvider>
          <LanguageProvider>
            <MenuDigitalSinAppContainer />
          </LanguageProvider>
        </HelmetProvider>
      </MemoryRouter>,
    );
  };

  it("should render the hero title and subtitle", () => {
    renderComponent();
    expect(
      screen.getByRole("heading", {
        name: "Menú Digital sin App",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Menú digital QR para tu restaurante en Tenerife/),
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
