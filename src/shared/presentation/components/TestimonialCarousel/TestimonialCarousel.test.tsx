import { render, screen } from "@testing-library/react";
import TestimonialCarousel, { Testimonial } from "./index";

// Mock Swiper components
vi.mock("swiper/react", () => ({
  Swiper: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  SwiperSlide: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

vi.mock("swiper/modules", () => ({
  Navigation: () => null,
  Pagination: () => null,
  A11y: () => null,
}));

describe("TestimonialCarousel Component", () => {
  const mockTestimonials: Testimonial[] = [
    {
      id: 1,
      quote: "This is a great product!",
      name: "John Doe",
      title: "CEO, Company",
      avatarUrl: "https://via.placeholder.com/150",
    },
    {
      id: 2,
      quote: "I highly recommend it.",
      name: "Jane Smith",
      title: "Marketing Head, Another Co",
      avatarUrl: "https://via.placeholder.com/150",
    },
  ];

  it("should render all testimonials", () => {
    render(<TestimonialCarousel testimonials={mockTestimonials} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("This is a great product!")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("I highly recommend it.")).toBeInTheDocument();
  });

  it("should render the main title", () => {
    render(<TestimonialCarousel testimonials={mockTestimonials} />);
    expect(
      screen.getByText("Lo que nuestros clientes en Canarias dicen"),
    ).toBeInTheDocument();
  });
});
