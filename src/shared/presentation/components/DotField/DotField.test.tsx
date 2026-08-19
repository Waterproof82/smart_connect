import { render } from "@testing-library/react";
import { DotField } from "./index";

describe("DotField Component", () => {
  it("should render with aria-hidden and no default positioning classes", () => {
    const { container } = render(<DotField />);
    const el = container.firstChild as HTMLElement;

    expect(el).toHaveAttribute("aria-hidden", "true");
    expect(el.className).toContain("pointer-events-none");
  });

  it("should default to Hero's current literal values (16px grid, 1.4px dot, border color, circular mask)", () => {
    const { container } = render(<DotField />);
    const el = container.firstChild as HTMLElement;
    const style = el.getAttribute("style") ?? "";

    expect(style).toContain(
      "background-image: radial-gradient(var(--color-border) 1.4px, transparent 1.4px)",
    );
    expect(style).toContain("background-size: 16px 16px");
    // jsdom drops mask-image from element.style (CSSOM) — assert on the raw
    // style attribute string instead of toHaveStyle().
    expect(style).toContain(
      "mask-image: radial-gradient(circle at 50% 45%, black 62%, transparent 72%)",
    );
  });

  it("should apply custom prop overrides (mask geometry, dot size, spacing, color)", () => {
    const customMask =
      "radial-gradient(circle at 50% 50%, black 45%, transparent 75%)";
    const { container } = render(
      <DotField mask={customMask} dotSize={2} spacing={24} color="var(--color-accent)" />,
    );
    const el = container.firstChild as HTMLElement;
    const style = el.getAttribute("style") ?? "";

    expect(style).toContain(
      "background-image: radial-gradient(var(--color-accent) 2px, transparent 2px)",
    );
    expect(style).toContain("background-size: 24px 24px");
    expect(style).toContain(`mask-image: ${customMask}`);
  });

  it("should pass through a custom className alongside pointer-events-none", () => {
    const { container } = render(<DotField className="absolute -inset-[8%] rounded-full" />);
    const el = container.firstChild as HTMLElement;

    expect(el.className).toContain("pointer-events-none");
    expect(el.className).toContain("absolute -inset-[8%] rounded-full");
  });
});
