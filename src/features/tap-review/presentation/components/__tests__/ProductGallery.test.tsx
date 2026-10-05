import { render, screen } from "@testing-library/react";
import { LanguageProvider } from "@shared/context/LanguageContext";
import ProductGallery from "../ProductGallery";

const renderWithLanguage = () => {
  return render(
    <LanguageProvider>
      <ProductGallery />
    </LanguageProvider>,
  );
};

describe("ProductGallery", () => {
  it("renders without crashing", () => {
    expect(() => renderWithLanguage()).not.toThrow();
  });

  it("every thumbnail button has type=button", () => {
    renderWithLanguage();
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
    for (const button of buttons) {
      expect(button).toHaveAttribute("type", "button");
    }
  });
});

// design.md D9 / responsive-images spec "Alt text and layout dimensions
// unchanged": the 4 NFC AVIFs were byte-copied to descriptive filenames and
// a -128w.webp thumbnail was generated for each; alt text and the declared
// width/height attributes must be exactly as before the asset swap.
describe("ProductGallery NFC asset swap (design.md D9, S9)", () => {
  it("main display images use the descriptive byte-copied filenames, not the supplier SKU names", () => {
    const { container } = renderWithLanguage();
    const mainImgs = Array.from(
      container.querySelectorAll(".aspect-square img"),
    ) as HTMLImageElement[];
    expect(mainImgs.length).toBe(4);
    for (const img of mainImgs) {
      const src = img.getAttribute("src") ?? "";
      expect(src).toMatch(/^\/assets\/nfc\/nfc-[a-z0-9-]+\.avif$/);
      expect(src).not.toMatch(/\/assets\/nfc\/S[a-f0-9]{30,}/);
    }
  });

  it("thumbnail buttons use the generated -128w.webp thumbnail, not the full main", () => {
    const { container } = renderWithLanguage();
    // Thumbnail images are the only <img>s nested inside a <button> — the
    // main display images are not (a `.justify-center` class selector would
    // false-match here too, since each main image's own wrapper div also
    // carries `flex items-center justify-center`).
    const thumbImgs = Array.from(
      container.querySelectorAll("button img"),
    ) as HTMLImageElement[];
    expect(thumbImgs.length).toBe(4);
    for (const img of thumbImgs) {
      const src = img.getAttribute("src") ?? "";
      expect(src).toMatch(/^\/assets\/nfc\/nfc-[a-z0-9-]+-128w\.webp$/);
    }
  });

  it("alt text and width/height attributes are unchanged on both main and thumbnail images", () => {
    const { container } = renderWithLanguage();
    const allImgs = Array.from(container.querySelectorAll("img"));
    expect(allImgs.length).toBeGreaterThan(0);
    for (const img of allImgs) {
      expect(img.getAttribute("alt")).toBeTruthy();
      expect(img.getAttribute("width")).toBe("640");
      expect(img.getAttribute("height")).toBe("640");
    }
  });
});
