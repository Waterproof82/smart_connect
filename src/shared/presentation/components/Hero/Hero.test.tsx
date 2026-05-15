import { render, screen } from "@testing-library/react";
import Hero from "./index";

describe("Hero Component", () => {
  it("should render the title and subtitle", () => {
    const title = "Test Title";
    const subtitle = "Test Subtitle";

    render(<Hero title={title} subtitle={subtitle} />);

    expect(screen.getByText(title)).toBeInTheDocument();
    expect(screen.getByText(subtitle)).toBeInTheDocument();
  });

  it("should render children when provided", () => {
    const title = "Test Title";
    const subtitle = "Test Subtitle";
    const childText = "Click Me";

    render(
      <Hero title={title} subtitle={subtitle}>
        <button>{childText}</button>
      </Hero>,
    );

    expect(screen.getByText(childText)).toBeInTheDocument();
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
