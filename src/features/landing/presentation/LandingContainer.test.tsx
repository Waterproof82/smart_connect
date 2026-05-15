import React from "react";
import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "../../../shared/context/LanguageContext";

// Mock child components to isolate the container test
vi.mock("./components/Hero", () => ({ Hero: () => <div>Hero Section</div> }));
vi.mock("./components/Features", () => ({
  Features: () => <div>Features Section</div>,
}));
vi.mock("./components/SuccessStats", () => ({
  SuccessStats: () => <div>SuccessStats Section</div>,
}));
vi.mock("./components/Contact", () => ({
  Contact: () => <div>Contact Section</div>,
}));
vi.mock("./components/Navbar", () => ({ Navbar: () => <div>Navbar</div> }));

import LandingContainer from "./LandingContainer";

const renderWithProviders = (component: React.ReactElement) => {
  return render(<LanguageProvider>{component}</LanguageProvider>);
};

describe("LandingContainer", () => {
  it("renders all main sections", () => {
    renderWithProviders(<LandingContainer />);

    expect(screen.getByText("Hero Section")).toBeInTheDocument();
    expect(screen.getByText("Features Section")).toBeInTheDocument();
    expect(screen.getByText("SuccessStats Section")).toBeInTheDocument();
    expect(screen.getByText("Contact Section")).toBeInTheDocument();
    expect(screen.getByText("Navbar")).toBeInTheDocument();
  });
});
