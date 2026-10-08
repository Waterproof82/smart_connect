import { execFileSync } from "node:child_process";
import path from "node:path";

// design.md (rag-knowledge-base-refresh) D9 — scripts/kb/sources.mjs is
// plain ESM. ts-jest's CJS-oriented transform for .test.ts files cannot
// import() a .mjs directly (same constraint as scripts/markdown-extract.mjs
// — see tests/unit/scripts/markdownExtract.test.ts), so these tests spawn a
// real `node --input-type=module` subprocess.

const ROOT = path.resolve(__dirname, "../../../");
const SCRIPTS_DIR = path.resolve(ROOT, "scripts");

/** Runs an ESM snippet in a real Node subprocess, cwd = scripts/. */
function runSourcesScript(script: string): string {
  return execFileSync(process.execPath, ["--input-type=module", "-e", script], {
    encoding: "utf-8",
    cwd: SCRIPTS_DIR,
  });
}

describe("scripts/kb/sources.mjs — source tag builders (design.md D9)", () => {
  it("tags a site route as 'site:<route>'", () => {
    const out = runSourcesScript(`
      import { buildSiteSource } from "./kb/sources.mjs";
      process.stdout.write(JSON.stringify(buildSiteSource("/carta-digital")));
    `);
    expect(JSON.parse(out)).toBe("site:/carta-digital");
  });

  it("tags a FAQ route as 'faq:<route>'", () => {
    const out = runSourcesScript(`
      import { buildFaqSource } from "./kb/sources.mjs";
      process.stdout.write(JSON.stringify(buildFaqSource("/")));
    `);
    expect(JSON.parse(out)).toBe("faq:/");
  });

  it("tags a curated file as 'curated:<file>'", () => {
    const out = runSourcesScript(`
      import { buildCuratedSource } from "./kb/sources.mjs";
      process.stdout.write(JSON.stringify(buildCuratedSource("servicios-web.md")));
    `);
    expect(JSON.parse(out)).toBe("curated:servicios-web.md");
  });
});

describe("scripts/kb/sources.mjs — filterIngestableRoutes (design.md D9)", () => {
  it("excludes every route whose path starts with /legal/", () => {
    const routes = [
      { path: "/" },
      { path: "/carta-digital" },
      { path: "/legal/privacidad" },
      { path: "/legal/cookies" },
      { path: "/legal/aviso" },
    ];
    const out = runSourcesScript(`
      import { filterIngestableRoutes } from "./kb/sources.mjs";
      const result = filterIngestableRoutes(${JSON.stringify(routes)});
      process.stdout.write(JSON.stringify(result.map((r) => r.path)));
    `);
    expect(JSON.parse(out)).toEqual(["/", "/carta-digital"]);
  });

  it("keeps routes unrelated to /legal/ untouched, including nested paths", () => {
    const routes = [{ path: "/tarjetas-nfc" }, { path: "/carta-digital/precios" }];
    const out = runSourcesScript(`
      import { filterIngestableRoutes } from "./kb/sources.mjs";
      const result = filterIngestableRoutes(${JSON.stringify(routes)});
      process.stdout.write(JSON.stringify(result.map((r) => r.path)));
    `);
    expect(JSON.parse(out)).toEqual(["/tarjetas-nfc", "/carta-digital/precios"]);
  });
});
