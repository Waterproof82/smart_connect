import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import sharp from "sharp";

// See design.md U1/U2 (landing-performance-a11y, PR A).
//
// scripts/optimize-images.mjs is plain ESM (no TS/JSX) — same ts-jest/ESM
// import limitation documented in sitemapGeneration.test.ts. We spawn a real
// `node --input-type=module` subprocess to import and execute the script's
// exported functions directly against real temp fixture images (via
// `sharp`), giving genuine behavioral coverage of the resize/convert logic
// rather than source-text regex assertions.

const ROOT = path.resolve(__dirname, "../../../");
const SCRIPTS_DIR = path.resolve(ROOT, "scripts");

/** Runs an ESM snippet in a real Node subprocess, cwd = scripts/. */
function runOptimizeImagesScript(script: string): string {
  return execFileSync(
    process.execPath,
    ["--input-type=module", "-e", script],
    { encoding: "utf-8", cwd: SCRIPTS_DIR },
  );
}

describe("scripts/optimize-images.mjs — target lists (design.md U1/U2)", () => {
  it("exports exactly the 10 TPV targets that declare 1400x1050, excluding ComprasSialti/FoodCostAvanzado", () => {
    const out = runOptimizeImagesScript(`
      import { TPV_TARGETS } from "./optimize-images.mjs";
      process.stdout.write(JSON.stringify(TPV_TARGETS));
    `);
    const targets = JSON.parse(out);
    expect(targets).toEqual([
      "tpv-cobro",
      "comandero-movil",
      "kds-cocina",
      "gestion-reservas",
      "stock-inventario",
      "sistema-alergenos",
      "multi-iva-igic",
      "delivery-takeaway",
      "fichajes-control-horario",
      "rbac-roles",
    ]);
    expect(targets).not.toContain("compras-sialti");
    expect(targets).not.toContain("food-cost-avanzado");
  });

  it("exports exactly the 3 carta-digital targets, excluding carta-digital-admin", () => {
    const out = runOptimizeImagesScript(`
      import { CARTA_DIGITAL_TARGETS } from "./optimize-images.mjs";
      process.stdout.write(JSON.stringify(CARTA_DIGITAL_TARGETS));
    `);
    expect(JSON.parse(out)).toEqual([
      "carta-digital-cliente",
      "carta-digital-dashboard",
      "carta-digital-pedidos",
    ]);
  });

  it("exports the exact target dimensions and quality from design.md", () => {
    const out = runOptimizeImagesScript(`
      import { TPV_WIDTH, TPV_HEIGHT, WEBP_QUALITY } from "./optimize-images.mjs";
      process.stdout.write(JSON.stringify({ TPV_WIDTH, TPV_HEIGHT, WEBP_QUALITY }));
    `);
    expect(JSON.parse(out)).toEqual({
      TPV_WIDTH: 936,
      TPV_HEIGHT: 702,
      WEBP_QUALITY: 80,
    });
  });
});

describe("scripts/optimize-images.mjs — resizeTpvFigure", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "optimize-images-tpv-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  });

  it("resizes a 1400x1050 WebP in place to 936x702, same filename, quality 80", async () => {
    await sharp({
      create: {
        width: 1400,
        height: 1050,
        channels: 3,
        background: { r: 10, g: 20, b: 200 },
      },
    })
      .webp()
      .toFile(path.join(tmpDir, "tpv-cobro.webp"));

    runOptimizeImagesScript(`
      import { resizeTpvFigure } from "./optimize-images.mjs";
      await resizeTpvFigure("tpv-cobro", ${JSON.stringify(tmpDir)});
    `);

    const outPath = path.join(tmpDir, "tpv-cobro.webp");
    // Read into a buffer before inspecting metadata — sharp(path) can keep a
    // lazy handle open on the file, which races the immediately-following
    // afterEach rmSync on Windows.
    const outBuffer = fs.readFileSync(outPath);
    const meta = await sharp(outBuffer).metadata();
    expect(meta.width).toBe(936);
    expect(meta.height).toBe(702);
    expect(meta.format).toBe("webp");
  });
});

describe("scripts/optimize-images.mjs — convertCartaDigitalScreenshot", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "optimize-images-carta-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  });

  it("writes a WebP at the original dimensions (no downscale), leaving the source PNG untouched", async () => {
    await sharp({
      create: {
        width: 1157,
        height: 906,
        channels: 3,
        background: { r: 200, g: 20, b: 20 },
      },
    })
      .png()
      .toFile(path.join(tmpDir, "carta-digital-cliente.png"));

    runOptimizeImagesScript(`
      import { convertCartaDigitalScreenshot } from "./optimize-images.mjs";
      await convertCartaDigitalScreenshot("carta-digital-cliente", ${JSON.stringify(tmpDir)});
    `);

    expect(
      fs.existsSync(path.join(tmpDir, "carta-digital-cliente.png")),
    ).toBe(true);

    const outPath = path.join(tmpDir, "carta-digital-cliente.webp");
    const outBuffer = fs.readFileSync(outPath);
    const meta = await sharp(outBuffer).metadata();
    expect(meta.width).toBe(1157);
    expect(meta.height).toBe(906);
    expect(meta.format).toBe("webp");
  });
});
