import fs from "node:fs";
import path from "node:path";

// See CartaDigitalSection.structure.test.ts for why these are source-text
// checks instead of RTL renders (no jest-environment-jsdom in this repo).
const SECTION_PATH = path.resolve(
  __dirname,
  "../../../../src/features/tap-review/presentation/TapReviewSection.tsx",
);

describe("TapReviewSection (merged into home)", () => {
  const source = fs.readFileSync(SECTION_PATH, "utf-8");

  it("exists at the renamed path (git mv from TapReviewPage.tsx)", () => {
    expect(fs.existsSync(SECTION_PATH)).toBe(true);
  });

  it("does not render an <h1> (only the page Hero keeps it)", () => {
    expect(source).not.toMatch(/<h1[\s>]/);
  });

  it("does not import react-helmet-async (no per-section head tags)", () => {
    expect(source).not.toMatch(/from ["']react-helmet-async["']/);
  });

  it("does not import its own Navbar or Footer", () => {
    expect(source).not.toMatch(/from ["']\.\/components\/Navbar["']/);
    expect(source).not.toMatch(/from ["']\.\/components\/Footer["']/);
  });

  it("does not emit its own JSON-LD <script> (JSON-LD is now App-level only)", () => {
    expect(source).not.toMatch(/application\/ld\+json/);
  });

  it("accepts whatsappPhone as a prop, same shape as before", () => {
    expect(source).toMatch(/whatsappPhone/);
  });
});
