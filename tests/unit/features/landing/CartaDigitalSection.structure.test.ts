import fs from "node:fs";
import path from "node:path";

// NOTE: real DOM rendering via React Testing Library is not available in
// this repo's jest setup (node test environment, no jest-environment-jsdom
// installed — see apply-progress notes). These structural checks are
// source-text based instead: they assert the merged section neither
// declares its own <h1>, nor re-imports Helmet/Navbar/Footer, which is
// exactly the class of regression this task is meant to catch.
const SECTION_PATH = path.resolve(
  __dirname,
  "../../../../src/features/landing/presentation/components/CartaDigitalSection.tsx",
);

describe("CartaDigitalSection (merged into home)", () => {
  const source = fs.readFileSync(SECTION_PATH, "utf-8");

  it("exists at the renamed path (git mv from CartaDigitalPremium.tsx)", () => {
    expect(fs.existsSync(SECTION_PATH)).toBe(true);
  });

  it("does not render an <h1> (only the page Hero keeps it)", () => {
    expect(source).not.toMatch(/<h1[\s>]/);
  });

  it("does not import react-helmet-async (no per-section head tags)", () => {
    expect(source).not.toMatch(/from ["']react-helmet-async["']/);
  });

  it("does not import its own Navbar or Footer", () => {
    expect(source).not.toMatch(/CartaDigitalNavbar/);
    expect(source).not.toMatch(/CartaDigitalFooter/);
  });

  it("does not emit its own JSON-LD <script> (JSON-LD is now App-level only)", () => {
    expect(source).not.toMatch(/application\/ld\+json/);
  });

  it("accepts whatsappPhone as a prop instead of fetching it itself", () => {
    expect(source).toMatch(/whatsappPhone/);
    expect(source).not.toMatch(/getAppSettings/);
  });
});
