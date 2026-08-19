import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import sharp from "sharp";

// One-off asset-optimization script for landing-performance-a11y PR A (U1+U2).
// See design.md U1/U2: TPV figures are resized to the fixed 468px CSS-width
// column at 2x DPR (936x702), and the 3 carta-digital demo screenshots are
// converted PNG -> WebP at their ORIGINAL dimensions (no downscale — the
// lightbox renders them up to ~2048px wide). Deliberately excludes
// ComprasSialtiSection / FoodCostAvanzadoSection source images: those already
// ship at 900x675, within 4% of target, and re-compressing buys nothing.
//
// Not part of the app build graph — run manually via `npm run optimize:images`
// whenever source assets are re-exported.

const ROOT = path.resolve(import.meta.dirname, "..");
const TPV_DIR = path.join(ROOT, "public", "assets", "tpv");
const ASSETS_DIR = path.join(ROOT, "public", "assets");

export const TPV_WIDTH = 936;
export const TPV_HEIGHT = 702;
export const WEBP_QUALITY = 80;

// Exactly the 10 TPV figures declaring 1400x1050 in their caller sections.
// ComprasSialtiSection/FoodCostAvanzadoSection intentionally NOT listed here.
export const TPV_TARGETS = [
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
];

// carta-digital-admin.png is explicitly out of scope for this PR.
export const CARTA_DIGITAL_TARGETS = [
  "carta-digital-cliente",
  "carta-digital-dashboard",
  "carta-digital-pedidos",
];

/**
 * Resizes a single TPV WebP figure in place to TPV_WIDTH x TPV_HEIGHT at
 * WEBP_QUALITY, same filename.
 */
export async function resizeTpvFigure(name, dir = TPV_DIR) {
  const filePath = path.join(dir, `${name}.webp`);
  // Read the full source into memory first — on Windows, piping sharp's
  // input and output through the SAME path (even via .toBuffer()) can race
  // against the still-open read handle and fail with "unable to open for
  // write". Buffering the input decouples read/write entirely.
  const inputBuffer = await fs.readFile(filePath);
  const outputBuffer = await sharp(inputBuffer)
    .resize(TPV_WIDTH, TPV_HEIGHT, { fit: "cover" })
    .webp({ quality: WEBP_QUALITY })
    .toBuffer();
  await fs.writeFile(filePath, outputBuffer);
  return filePath;
}

/**
 * Converts a single carta-digital PNG to WebP at its original dimensions,
 * writing `{name}.webp` alongside the source PNG (source PNG is left
 * untouched here — deletion happens separately once callers are updated).
 */
export async function convertCartaDigitalScreenshot(name, dir = ASSETS_DIR) {
  const srcPath = path.join(dir, `${name}.png`);
  const outPath = path.join(dir, `${name}.webp`);
  await sharp(srcPath).webp({ quality: WEBP_QUALITY }).toFile(outPath);
  return outPath;
}

async function main() {
  for (const name of TPV_TARGETS) {
    const out = await resizeTpvFigure(name);
    console.log(`resized: ${out}`);
  }
  for (const name of CARTA_DIGITAL_TARGETS) {
    const out = await convertCartaDigitalScreenshot(name);
    console.log(`converted: ${out}`);
  }
}

// Only run when executed directly (`node scripts/optimize-images.mjs`), not
// when imported by tests (which use `node --input-type=module -e "..."`,
// where `process.argv[1]` is undefined). Uses pathToFileURL (not a manual
// `file://` string template) so this comparison is correct on Windows too.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
