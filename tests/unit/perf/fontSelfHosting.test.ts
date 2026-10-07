import fs from "node:fs";
import path from "node:path";

/**
 * Guards the self-hosted DM Sans + Space Grotesk fonts
 * (sdd/core-web-vitals-perf PR1, design.md Decisions D1-D4, D6).
 *
 * Covers, independent of any build step:
 * - every primary @font-face in tokens.css points to a file that exists in
 *   public/fonts/
 * - the 2 preloaded faces in index.html have hrefs matching the tokens.css
 *   url()s, with crossorigin set
 * - zero fonts.googleapis.com / fonts.gstatic.com references remain in
 *   index.html
 * - vercel.json's CSP font-src is exactly 'self'
 * - every primary @font-face declares font-display: optional (owner
 *   decision on file, 2026-10-07 — zero font-swap CLS by construction)
 */

const ROOT = path.resolve(__dirname, "../../../");
const TOKENS_CSS_PATH = path.join(ROOT, "tokens.css");
const INDEX_HTML_PATH = path.join(ROOT, "index.html");
const VERCEL_JSON_PATH = path.join(ROOT, "vercel.json");
const PUBLIC_FONTS_DIR = path.join(ROOT, "public", "fonts");

function readSource(filePath: string): string {
  return fs.readFileSync(filePath, "utf-8");
}

/** All top-level `@font-face { ... }` blocks in a CSS source string. */
function extractFontFaceBlocks(source: string): string[] {
  return source.match(/@font-face\s*\{[^}]*\}/gs) ?? [];
}

/** Primary (non-"Fallback") @font-face blocks — the self-hosted faces. */
function primaryFontFaceBlocks(source: string): string[] {
  return extractFontFaceBlocks(source).filter(
    (block) => !/font-family:\s*["']?[^"';]*Fallback/.test(block),
  );
}

/** Every root-relative /fonts/*.woff2 url() referenced in a CSS block. */
function fontUrlsIn(block: string): string[] {
  return [...block.matchAll(/url\(\s*["']?(\/fonts\/[^"')]+\.woff2)["']?\s*\)/g)].map(
    (m) => m[1],
  );
}

describe("Self-hosted font delivery (tokens.css + index.html + vercel.json)", () => {
  const tokensCss = readSource(TOKENS_CSS_PATH);
  const indexHtml = readSource(INDEX_HTML_PATH);
  const vercelJson = JSON.parse(readSource(VERCEL_JSON_PATH)) as {
    headers: Array<{
      source: string;
      missing?: unknown[];
      headers: Array<{ key: string; value: string }>;
    }>;
  };

  it("declares exactly 4 primary (non-Fallback) @font-face rules", () => {
    expect(primaryFontFaceBlocks(tokensCss)).toHaveLength(4);
  });

  it("every primary @font-face url() points to a file that exists in public/fonts/", () => {
    const blocks = primaryFontFaceBlocks(tokensCss);
    const allUrls = blocks.flatMap(fontUrlsIn);
    expect(allUrls.length).toBeGreaterThan(0);
    for (const url of allUrls) {
      const filePath = path.join(PUBLIC_FONTS_DIR, path.basename(url));
      expect(fs.existsSync(filePath)).toBe(true);
    }
  });

  it("every primary @font-face declares font-display: optional (owner decision 2026-10-07)", () => {
    const blocks = primaryFontFaceBlocks(tokensCss);
    for (const block of blocks) {
      expect(block).toMatch(/font-display:\s*optional/);
    }
  });

  it("every primary @font-face declares font-weight: 400 700 and unicode-range", () => {
    const blocks = primaryFontFaceBlocks(tokensCss);
    for (const block of blocks) {
      expect(block).toMatch(/font-weight:\s*400\s+700/);
      expect(block).toMatch(/unicode-range:/);
    }
  });

  it("includes both DM Sans and Space Grotesk primary faces", () => {
    const blocks = primaryFontFaceBlocks(tokensCss);
    const families = blocks.map(
      (b) => /font-family:\s*["']?([^"';]+)["']?/.exec(b)?.[1],
    );
    expect(families).toContain("DM Sans");
    expect(families).toContain("Space Grotesk");
  });

  it("index.html preloads exactly 2 same-origin woff2 faces (the latin subsets) with crossorigin set", () => {
    const preloadLinks = [
      ...indexHtml.matchAll(
        /<link\s+rel="preload"\s+as="font"[^>]*>/g,
      ),
    ].map((m) => m[0]);
    expect(preloadLinks).toHaveLength(2);
    for (const link of preloadLinks) {
      expect(link).toMatch(/type="font\/woff2"/);
      expect(link).toMatch(/\bcrossorigin\b/);
      expect(link).toMatch(/href="\/fonts\/[^"]+-latin-[^"]+\.woff2"/);
    }
  });

  it("every index.html font preload href resolves to a @font-face url() in tokens.css", () => {
    const preloadHrefs = [
      ...indexHtml.matchAll(/<link\s+rel="preload"\s+as="font"[^>]*href="([^"]+)"/g),
    ].map((m) => m[1]);
    const tokensUrls = new Set(primaryFontFaceBlocks(tokensCss).flatMap(fontUrlsIn));
    expect(preloadHrefs.length).toBeGreaterThan(0);
    for (const href of preloadHrefs) {
      expect(tokensUrls.has(href)).toBe(true);
    }
  });

  it("index.html has zero fonts.googleapis.com / fonts.gstatic.com references", () => {
    expect(indexHtml).not.toMatch(/fonts\.googleapis\.com/);
    expect(indexHtml).not.toMatch(/fonts\.gstatic\.com/);
  });

  it("vercel.json CSP font-src is exactly 'self'", () => {
    const globalRule = vercelJson.headers.find(
      (h) => h.source === "/(.*)" && !h.missing,
    );
    expect(globalRule).toBeDefined();
    const csp = globalRule!.headers.find(
      (h) => h.key === "Content-Security-Policy",
    )?.value;
    expect(csp).toBeDefined();
    const fontSrcMatch = /font-src ([^;]+);/.exec(csp!);
    expect(fontSrcMatch).not.toBeNull();
    expect(fontSrcMatch![1].trim()).toBe("'self'");
  });

  it("vercel.json has an immutable Cache-Control rule for /fonts/(.*)", () => {
    const fontsRule = vercelJson.headers.find((h) => h.source === "/fonts/(.*)");
    expect(fontsRule).toBeDefined();
    expect(fontsRule!.headers).toContainEqual({
      key: "Cache-Control",
      value: "public, max-age=31536000, immutable",
    });
  });
});

describe("DM Sans wght-only payload (sdd/font-stability PR1, design.md D1)", () => {
  const tokensCss = readSource(TOKENS_CSS_PATH);
  const indexHtml = readSource(INDEX_HTML_PATH);

  /** Root-relative /fonts/ woff2 filenames referenced anywhere in a source string. */
  function fontFilenamesIn(source: string): string[] {
    return [...source.matchAll(/\/fonts\/([^"')\s]+\.woff2)/g)].map((m) => m[1]);
  }

  it("no filename referenced in tokens.css or index.html contains the opsz axis", () => {
    const filenames = [
      ...fontFilenamesIn(tokensCss),
      ...fontFilenamesIn(indexHtml),
    ];
    expect(filenames.length).toBeGreaterThan(0);
    for (const filename of filenames) {
      expect(filename).not.toMatch(/opsz/);
    }
  });

  it("no file in public/fonts/ has an opsz filename", () => {
    const files = fs.readdirSync(PUBLIC_FONTS_DIR);
    const opszFiles = files.filter((f) => /opsz/.test(f));
    expect(opszFiles).toEqual([]);
  });

  it("DM Sans woff2 total payload (latin + latin-ext) is <= 56,000 B", () => {
    const dmSansBlocks = primaryFontFaceBlocks(tokensCss).filter(
      (block) => /font-family:\s*["']?DM Sans["']?/.test(block),
    );
    const dmSansUrls = dmSansBlocks.flatMap(fontUrlsIn);
    expect(dmSansUrls.length).toBeGreaterThan(0);
    const totalBytes = dmSansUrls.reduce((sum, url) => {
      const filePath = path.join(PUBLIC_FONTS_DIR, path.basename(url));
      return sum + fs.statSync(filePath).size;
    }, 0);
    expect(totalBytes).toBeLessThanOrEqual(56_000);
  });
});
