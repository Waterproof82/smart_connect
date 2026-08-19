import { render, screen } from "@testing-library/react";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import { NotFound } from "../NotFound";

const renderNotFound = () => {
  return render(
    <HelmetProvider>
      <MemoryRouter>
        <NotFound />
      </MemoryRouter>
    </HelmetProvider>,
  );
};

describe("NotFound", () => {
  it("renders without crashing", () => {
    expect(() => renderNotFound()).not.toThrow();
  });

  it("renders the home link with btn-primary", () => {
    renderNotFound();
    const link = screen.getByRole("link", { name: /Volver al inicio/i });
    expect(link).toHaveClass("btn-primary");
  });

  it("does not carry stale conflicting utility classes", () => {
    renderNotFound();
    const link = screen.getByRole("link", { name: /Volver al inicio/i });
    expect(link.className).not.toMatch(
      /rounded-xl|bg-\[var\(--color-accent\)\]/,
    );
  });
});
