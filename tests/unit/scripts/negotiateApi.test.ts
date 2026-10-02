import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

// design.md (agent-surface-drift) D3/D7/D8 — api/negotiate.mjs is plain ESM
// with a top-level JSON import attribute, so (like scripts/sitemap.mjs,
// see tests/unit/scripts/sitemapGeneration.test.ts) it is spawned in a real
// `node --input-type=module` subprocess rather than transformed by ts-jest.

const ROOT = path.resolve(__dirname, "../../../");
const API_DIR = path.resolve(ROOT, "api");

const readSiteRoutePaths = (): string[] => {
  const data = JSON.parse(
    fs.readFileSync(path.join(ROOT, "scripts/site-routes.json"), "utf-8"),
  );
  return data.routes.map((r: { path: string }) => r.path);
};

/** Runs an ESM snippet in a real Node subprocess, cwd = api/. */
function runNegotiateScript(script: string): string {
  return execFileSync(process.execPath, ["--input-type=module", "-e", script], {
    encoding: "utf-8",
    cwd: API_DIR,
  });
}

describe("api/negotiate.mjs — route allowlist (design.md D3/D7/D8)", () => {
  it("MARKDOWN_ROUTES exactly equals scripts/site-routes.json paths", () => {
    const sitePaths = readSiteRoutePaths();
    const out = runNegotiateScript(`
      import { MARKDOWN_ROUTES } from "./negotiate.mjs";
      process.stdout.write(JSON.stringify(MARKDOWN_ROUTES));
    `);
    expect(JSON.parse(out)).toEqual(sitePaths);
  });

  it("isMarkdownRoute('/contacto') is false — /contacto is a dead route", () => {
    const out = runNegotiateScript(`
      import { isMarkdownRoute } from "./negotiate.mjs";
      process.stdout.write(JSON.stringify(isMarkdownRoute("/contacto")));
    `);
    expect(JSON.parse(out)).toBe(false);
  });

  it("isMarkdownRoute('/tarjetas-nfc') is true — a live route", () => {
    const out = runNegotiateScript(`
      import { isMarkdownRoute } from "./negotiate.mjs";
      process.stdout.write(JSON.stringify(isMarkdownRoute("/tarjetas-nfc")));
    `);
    expect(JSON.parse(out)).toBe(true);
  });

  it("handler returns 404 markdown for an unknown ?path=, with quick-links containing no dead route", () => {
    const out = runNegotiateScript(`
      import handler from "./negotiate.mjs";
      let statusCode, body;
      const req = { query: { path: "/contacto" } };
      const res = {
        setHeader() {},
        status(code) { statusCode = code; return this; },
        send(b) { body = b; },
      };
      handler(req, res);
      process.stdout.write(JSON.stringify({ statusCode, body }));
    `);
    const { statusCode, body } = JSON.parse(out);
    expect(statusCode).toBe(404);
    // The requested (dead) path is echoed back in the error line, so we
    // assert on the quick-links' markdown *link targets* specifically —
    // no hyperlink may point at a dead route.
    const linkTargets = [...body.matchAll(/\]\((https:\/\/[^)]+)\)/g)].map(
      (m: RegExpMatchArray) => m[1],
    );
    expect(linkTargets.length).toBeGreaterThan(0);
    expect(linkTargets).not.toContain(
      "https://digitalizatenerife.es/servicios",
    );
    expect(linkTargets).not.toContain(
      "https://digitalizatenerife.es/contacto",
    );
  });

  it("handler rejects a path-traversal attempt with 404, never reading the filesystem outside dist", () => {
    const out = runNegotiateScript(`
      import handler from "./negotiate.mjs";
      let statusCode, body;
      const req = { query: { path: "/../../etc/passwd" } };
      const res = {
        setHeader() {},
        status(code) { statusCode = code; return this; },
        send(b) { body = b; },
      };
      handler(req, res);
      process.stdout.write(JSON.stringify({ statusCode, body }));
    `);
    const { statusCode } = JSON.parse(out);
    expect(statusCode).toBe(404);
  });

  it("handler returns 200 markdown for a known path, titled from the prerendered <title>", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "negotiate-test-"));
    const routeDir = path.join(tmpDir, "dist", "tarjetas-nfc");
    fs.mkdirSync(routeDir, { recursive: true });
    fs.writeFileSync(
      path.join(routeDir, "index.html"),
      `<html><head><title>Tap-to-Review NFC — Test Title</title></head>` +
        `<body><div id="root"><h1>Hola</h1></div><script></script></body></html>`,
    );

    const modUrl = pathToFileURL(
      path.join(API_DIR, "negotiate.mjs"),
    ).href;
    const out = execFileSync(
      process.execPath,
      [
        "--input-type=module",
        "-e",
        `
        const { default: handler } = await import(${JSON.stringify(modUrl)});
        let statusCode, body;
        const req = { query: { path: "/tarjetas-nfc" } };
        const res = {
          setHeader() {},
          status(code) { statusCode = code; return this; },
          send(b) { body = b; },
        };
        handler(req, res);
        process.stdout.write(JSON.stringify({ statusCode, body }));
      `,
      ],
      { encoding: "utf-8", cwd: tmpDir },
    );

    fs.rmSync(tmpDir, { recursive: true, force: true });

    const { statusCode, body } = JSON.parse(out);
    expect(statusCode).toBe(200);
    expect(body).toContain("# Tap-to-Review NFC — Test Title");
    expect(body).toContain("Hola");
  });

  it("handler falls back to the literal 'SmartConnect AI' title when the prerendered file has no <title>", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "negotiate-test-"));
    const routeDir = path.join(tmpDir, "dist", "about");
    fs.mkdirSync(routeDir, { recursive: true });
    fs.writeFileSync(
      path.join(routeDir, "index.html"),
      `<html><head></head><body><div id="root"><p>Contenido</p></div><script></script></body></html>`,
    );

    const modUrl = pathToFileURL(
      path.join(API_DIR, "negotiate.mjs"),
    ).href;
    const out = execFileSync(
      process.execPath,
      [
        "--input-type=module",
        "-e",
        `
        const { default: handler } = await import(${JSON.stringify(modUrl)});
        let statusCode, body;
        const req = { query: { path: "/about" } };
        const res = {
          setHeader() {},
          status(code) { statusCode = code; return this; },
          send(b) { body = b; },
        };
        handler(req, res);
        process.stdout.write(JSON.stringify({ statusCode, body }));
      `,
      ],
      { encoding: "utf-8", cwd: tmpDir },
    );

    fs.rmSync(tmpDir, { recursive: true, force: true });

    const { statusCode, body } = JSON.parse(out);
    expect(statusCode).toBe(200);
    expect(body).toContain("# SmartConnect AI");
  });
});
