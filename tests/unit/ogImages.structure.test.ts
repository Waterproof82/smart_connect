import fs from "node:fs";
import path from "node:path";

// Social share images (docs/SEO_PROTOCOL.md §1 "OG image"): every page
// declares a 1200x630 image from public/og/ with a large Twitter card,
// instead of the 512x512 icon.png.
const ROOT = path.resolve(__dirname, "../../");
const read = (relPath: string) => fs.readFileSync(path.join(ROOT, relPath), "utf-8");

const PAGES = [
  "src/App.tsx",
  "src/features/landing/presentation/components/AboutPage.tsx",
  "src/features/legal/presentation/LegalPage.tsx",
  "src/features/landing/presentation/components/CartaDigitalPage.tsx",
  "src/features/landing/presentation/components/IaChatbotsPage.tsx",
  "src/features/landing/presentation/components/TpvRestaurantesPage.tsx",
  "src/features/tap-review/presentation/TapReviewPage.tsx",
];

describe("Open Graph images", () => {
  it.each(PAGES)("%s uses an existing 1200x630 og image and a large twitter card", (file) => {
    const source = read(file);
    const match = source.match(
      /property="og:image"\s+content="https:\/\/digitalizatenerife\.es\/og\/([a-z-]+\.png)"/,
    );
    expect(match).not.toBeNull();
    expect(fs.existsSync(path.join(ROOT, "public/og", match![1]))).toBe(true);
    expect(source).toMatch(/property="og:image:width"\s+content="1200"/);
    expect(source).toMatch(/property="og:image:height"\s+content="630"/);
    expect(source).toMatch(/property="og:image:alt"/);
    expect(source).toMatch(/name="twitter:card"\s+content="summary_large_image"/);
    expect(source).toMatch(/name="twitter:image"\s+content="https:\/\/digitalizatenerife\.es\/og\//);
  });

  it("every generated og image is under 300 KB", () => {
    for (const file of fs.readdirSync(path.join(ROOT, "public/og"))) {
      expect(fs.statSync(path.join(ROOT, "public/og", file)).size).toBeLessThan(300 * 1024);
    }
  });
});
