import { execFileSync } from "node:child_process";
import path from "node:path";

// design.md (rag-knowledge-base-refresh) D8 — scripts/markdown-extract.mjs is
// plain ESM, no top-level JSON import attribute. ts-jest's CJS-oriented
// transform for .test.ts files still cannot import() a .mjs directly (same
// constraint as scripts/lastmod.mjs — see tests/unit/scripts/lastmod.test.ts),
// so these tests spawn a real `node --input-type=module` subprocess.
//
// api/negotiate.mjs (scope 'root') is covered by its own byte-identical
// parity assertions in tests/unit/scripts/negotiateApi.test.ts, which MUST
// stay green unmodified after the Unit 4 refactor — that is the parity
// contract for this change, not duplicated here.

const ROOT = path.resolve(__dirname, "../../../");
const SCRIPTS_DIR = path.resolve(ROOT, "scripts");

/** Runs an ESM snippet in a real Node subprocess, cwd = scripts/. */
function runMarkdownExtractScript(script: string): string {
  return execFileSync(process.execPath, ["--input-type=module", "-e", script], {
    encoding: "utf-8",
    cwd: SCRIPTS_DIR,
  });
}

describe("scripts/markdown-extract.mjs — extractPageMarkdown (design.md D8)", () => {
  it("scope 'root': extracts title, description and body markdown, with a canonical source footer", () => {
    const html =
      `<html><head><title>Tap-to-Review NFC — Test Title</title>` +
      `<meta name="description" content="Test description"></head>` +
      `<body><div id="root"><h1>Hola</h1></div><script></script></body></html>`;
    const out = runMarkdownExtractScript(`
      import { extractPageMarkdown } from "./markdown-extract.mjs";
      const result = extractPageMarkdown(${JSON.stringify(html)}, {
        route: "/tarjetas-nfc",
        scope: "root",
      });
      process.stdout.write(JSON.stringify(result));
    `);
    const result = JSON.parse(out);
    expect(result.title).toBe("Tap-to-Review NFC — Test Title");
    expect(result.description).toBe("Test description");
    expect(result.markdown).toContain("# Tap-to-Review NFC — Test Title");
    expect(result.markdown).toContain("> Test description");
    expect(result.markdown).toContain("Hola");
    expect(result.markdown).toContain(
      "_Source: [https://digitalizatenerife.es/tarjetas-nfc](https://digitalizatenerife.es/tarjetas-nfc)_",
    );
  });

  it("scope 'root': strips React hydration/SSR markers before conversion", () => {
    const html =
      `<html><head><title>T</title></head><body>` +
      `<div id="root"><!--$--><!--[-->  <p>Contenido real</p><!--]--><!--/$--><!--ssr-outlet--></div>` +
      `<script></script></body></html>`;
    const out = runMarkdownExtractScript(`
      import { extractPageMarkdown } from "./markdown-extract.mjs";
      const result = extractPageMarkdown(${JSON.stringify(html)}, {
        route: "/about",
        scope: "root",
      });
      process.stdout.write(JSON.stringify(result));
    `);
    const result = JSON.parse(out);
    expect(result.markdown).toContain("Contenido real");
    expect(result.markdown).not.toMatch(/<!--/);
  });

  it("scope 'main': extracts only content inside <main>, excluding nav/footer siblings", () => {
    const html =
      `<html><head><title>T</title></head><body>` +
      `<nav>Menu principal</nav>` +
      `<main id="main"><h1>Contenido principal</h1></main>` +
      `<footer>Pie de pagina</footer>` +
      `</body></html>`;
    const out = runMarkdownExtractScript(`
      import { extractPageMarkdown } from "./markdown-extract.mjs";
      const result = extractPageMarkdown(${JSON.stringify(html)}, {
        route: "/servicios",
        scope: "main",
      });
      process.stdout.write(JSON.stringify(result));
    `);
    const result = JSON.parse(out);
    expect(result.markdown).toContain("Contenido principal");
    expect(result.markdown).not.toContain("Menu principal");
    expect(result.markdown).not.toContain("Pie de pagina");
  });

  it("scope 'main': strips JSON-LD scripts and nested <nav> blocks found inside <main>", () => {
    const html =
      `<html><head><title>T</title></head><body>` +
      `<main id="main">` +
      `<script type="application/ld+json">{"@type":"WebPage"}</script>` +
      `<nav>Submenu interno</nav>` +
      `<h1>Contenido real</h1>` +
      `</main>` +
      `</body></html>`;
    const out = runMarkdownExtractScript(`
      import { extractPageMarkdown } from "./markdown-extract.mjs";
      const result = extractPageMarkdown(${JSON.stringify(html)}, {
        route: "/servicios",
        scope: "main",
      });
      process.stdout.write(JSON.stringify(result));
    `);
    const result = JSON.parse(out);
    expect(result.markdown).toContain("Contenido real");
    expect(result.markdown).not.toContain("Submenu interno");
    expect(result.markdown).not.toContain("WebPage");
  });

  it("scope 'main': falls back to the #root div content when no <main> tag exists", () => {
    const html =
      `<html><head><title>T</title></head><body>` +
      `<div id="root"><h1>Solo root, sin main</h1></div>` +
      `<script></script></body></html>`;
    const out = runMarkdownExtractScript(`
      import { extractPageMarkdown } from "./markdown-extract.mjs";
      const result = extractPageMarkdown(${JSON.stringify(html)}, {
        route: "/about",
        scope: "main",
      });
      process.stdout.write(JSON.stringify(result));
    `);
    const result = JSON.parse(out);
    expect(result.markdown).toContain("Solo root, sin main");
  });
});

describe("scripts/markdown-extract.mjs — extractFaqJsonLd (design.md D8/D9)", () => {
  it("extracts Q&A pairs from a FAQPage node nested inside an @graph array", () => {
    const schema = {
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "Organization", name: "Digitaliza Tenerife" },
        {
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "¿Hacen páginas web?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Sí, hacemos páginas web personalizadas.",
              },
            },
          ],
        },
      ],
    };
    const html = `<html><head><script type="application/ld+json">${JSON.stringify(
      schema,
    )}</script></head><body></body></html>`;
    const out = runMarkdownExtractScript(`
      import { extractFaqJsonLd } from "./markdown-extract.mjs";
      const result = extractFaqJsonLd(${JSON.stringify(html)});
      process.stdout.write(JSON.stringify(result));
    `);
    const result = JSON.parse(out);
    expect(result).toEqual([
      {
        question: "¿Hacen páginas web?",
        answer: "Sí, hacemos páginas web personalizadas.",
      },
    ]);
  });

  it("extracts Q&A pairs from a standalone top-level FAQPage JSON-LD script", () => {
    const schema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "¿Tienen carta digital para tiendas?",
          acceptedAnswer: { "@type": "Answer", text: "Sí." },
        },
      ],
    };
    const html = `<html><head><script type="application/ld+json">${JSON.stringify(
      schema,
    )}</script></head><body></body></html>`;
    const out = runMarkdownExtractScript(`
      import { extractFaqJsonLd } from "./markdown-extract.mjs";
      const result = extractFaqJsonLd(${JSON.stringify(html)});
      process.stdout.write(JSON.stringify(result));
    `);
    const result = JSON.parse(out);
    expect(result).toEqual([
      { question: "¿Tienen carta digital para tiendas?", answer: "Sí." },
    ]);
  });

  it("returns an empty array when no FAQPage JSON-LD is present", () => {
    const html =
      `<html><head><script type="application/ld+json">{"@type":"Organization"}</script></head>` +
      `<body></body></html>`;
    const out = runMarkdownExtractScript(`
      import { extractFaqJsonLd } from "./markdown-extract.mjs";
      const result = extractFaqJsonLd(${JSON.stringify(html)});
      process.stdout.write(JSON.stringify(result));
    `);
    expect(JSON.parse(out)).toEqual([]);
  });
});
