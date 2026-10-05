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

  // Idempotency: re-encoding an already-sized WebP changes its bytes on every
  // run, so `npm run optimize:images` used to dirty 30 committed TPV assets.
  it("leaves a figure that is already 936x702 byte-identical (no re-encode)", async () => {
    const filePath = path.join(tmpDir, "tpv-cobro.webp");
    await sharp({
      create: { width: 936, height: 702, channels: 3, background: { r: 1, g: 2, b: 3 } },
    })
      // Different quality than the script's 80, so a re-encode WOULD change
      // the bytes (a same-quality re-encode of a flat synthetic image can
      // come out identical and mask the bug).
      .webp({ quality: 50 })
      .toFile(filePath);
    const before = fs.readFileSync(filePath);

    runOptimizeImagesScript(`
      import { resizeTpvFigure } from "./optimize-images.mjs";
      await resizeTpvFigure("tpv-cobro", ${JSON.stringify(tmpDir)});
    `);

    expect(fs.readFileSync(filePath).equals(before)).toBe(true);
  });
});

describe("scripts/optimize-images.mjs — generateResponsiveImage idempotency", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "optimize-images-idem-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  });

  const makeSource = () =>
    sharp({
      create: { width: 936, height: 702, channels: 3, background: { r: 9, g: 9, b: 9 } },
    })
      .webp()
      .toFile(path.join(tmpDir, "tpv-cobro.webp"));

  it("skips a variant that already exists and is newer than its source", async () => {
    await makeSource();
    const variant = path.join(tmpDir, "tpv-cobro-480w.webp");
    fs.writeFileSync(variant, "existing-variant");
    const later = new Date(Date.now() + 60_000);
    fs.utimesSync(variant, later, later);

    runOptimizeImagesScript(`
      import { generateResponsiveImage } from "./optimize-images.mjs";
      await generateResponsiveImage("tpv-cobro", ${JSON.stringify(tmpDir)}, [480]);
    `);

    expect(fs.readFileSync(variant, "utf-8")).toBe("existing-variant");
  });

  it("regenerates a variant when its source is newer", async () => {
    const variant = path.join(tmpDir, "tpv-cobro-480w.webp");
    fs.writeFileSync(variant, "stale-variant");
    const earlier = new Date(Date.now() - 60_000);
    fs.utimesSync(variant, earlier, earlier);
    await makeSource();

    runOptimizeImagesScript(`
      import { generateResponsiveImage } from "./optimize-images.mjs";
      await generateResponsiveImage("tpv-cobro", ${JSON.stringify(tmpDir)}, [480]);
    `);

    const meta = await sharp(fs.readFileSync(variant)).metadata();
    expect(meta.width).toBe(480);
  });
});

describe("scripts/optimize-images.mjs — generateResponsiveImage (design.md D9: optional {sourceExt})", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "optimize-images-responsive-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
  });

  it("defaults to a .webp source and writes {name}-{width}w.webp for each requested width", async () => {
    await sharp({
      create: {
        width: 936,
        height: 702,
        channels: 3,
        background: { r: 10, g: 20, b: 200 },
      },
    })
      .webp()
      .toFile(path.join(tmpDir, "tpv-cobro.webp"));

    runOptimizeImagesScript(`
      import { generateResponsiveImage } from "./optimize-images.mjs";
      await generateResponsiveImage("tpv-cobro", ${JSON.stringify(tmpDir)}, [480, 720]);
    `);

    for (const w of [480, 720]) {
      const outPath = path.join(tmpDir, `tpv-cobro-${w}w.webp`);
      expect(fs.existsSync(outPath)).toBe(true);
      const meta = await sharp(fs.readFileSync(outPath)).metadata();
      expect(meta.width).toBe(w);
      expect(meta.format).toBe("webp");
    }
  });

  it("reads a non-.webp source when {sourceExt} is given, and still writes .webp output", async () => {
    await sharp({
      create: {
        width: 640,
        height: 640,
        channels: 3,
        background: { r: 200, g: 20, b: 20 },
      },
    })
      .avif()
      .toFile(path.join(tmpDir, "nfc-exhibidor-blanco-1.avif"));

    runOptimizeImagesScript(`
      import { generateResponsiveImage } from "./optimize-images.mjs";
      await generateResponsiveImage("nfc-exhibidor-blanco-1", ${JSON.stringify(tmpDir)}, [128], { sourceExt: "avif" });
    `);

    const outPath = path.join(tmpDir, "nfc-exhibidor-blanco-1-128w.webp");
    expect(fs.existsSync(outPath)).toBe(true);
    const meta = await sharp(fs.readFileSync(outPath)).metadata();
    expect(meta.width).toBe(128);
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
