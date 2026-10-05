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
//
// design.md D9 (seo-audit-followups, S9): also generates the 480w/720w
// responsive variants for the 10 TPV_TARGETS figures (936 stays the
// original, no extra file) and the NFC gallery's 128w thumbnails from
// their byte-copied AVIF mains.

const ROOT = path.resolve(import.meta.dirname, "..");
const TPV_DIR = path.join(ROOT, "public", "assets", "tpv");
const ASSETS_DIR = path.join(ROOT, "public", "assets");
const NFC_DIR = path.join(ROOT, "public", "assets", "nfc");

export const TPV_WIDTH = 936;
export const TPV_HEIGHT = 702;
export const WEBP_QUALITY = 80;

// design.md D9: the 480/720 responsive variants generated for every
// TPV_TARGETS figure; 936 (the original file) needs no extra generated file.
export const TPV_RESPONSIVE_WIDTHS = [480, 720];

// Supplier SKU-style filenames -> descriptive names (byte-copy, same bytes,
// same .avif extension — design.md D9). Order matches ProductGallery.tsx's
// `products` array (2 photos of the white exhibitor, 1 black, 1 stand).
export const NFC_RENAMES = {
  "S0c0ed93c21c345e7ad3f8895ff09cec43.jpg_640x640q75.jpg_.avif":
    "nfc-exhibidor-blanco-1.avif",
  "Se5c21071b09f40a2bd15019ea423800eb.jpg_640x640q75.jpg_.avif":
    "nfc-exhibidor-negro.avif",
  "S3c28dfdc8fbc4adcaab2a58f3b235ca6m.jpg_640x640q75.jpg_.avif":
    "nfc-stand-exhibidor.avif",
  "S90c19838ba374d069994fec4075ffca20.jpg_640x640q75.jpg_.avif":
    "nfc-exhibidor-blanco-2.avif",
};

// design.md D9: 128w thumbnail (64px at 2x DPR) generated from each
// byte-copied AVIF main.
export const NFC_THUMBNAIL_WIDTH = 128;

/**
 * Byte-copies every NFC gallery main from its supplier SKU-style filename to
 * a descriptive one (design.md D9). Old files are left in place — callers
 * decide when it's safe to delete them (kept until production verified).
 */
export async function renameNfcGalleryAssets(dir = NFC_DIR) {
  return Promise.all(
    Object.entries(NFC_RENAMES).map(async ([oldName, newName]) => {
      const destPath = path.join(dir, newName);
      await fs.copyFile(path.join(dir, oldName), destPath);
      return destPath;
    }),
  );
}

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
 * WEBP_QUALITY, same filename. Returns the path it rewrote, or null when the
 * figure was already the right size and was left untouched.
 */
export async function resizeTpvFigure(name, dir = TPV_DIR) {
  const filePath = path.join(dir, `${name}.webp`);
  // Read the full source into memory first — on Windows, piping sharp's
  // input and output through the SAME path (even via .toBuffer()) can race
  // against the still-open read handle and fail with "unable to open for
  // write". Buffering the input decouples read/write entirely.
  const inputBuffer = await fs.readFile(filePath);
  // Idempotent: an already-sized figure is left untouched, because a lossy
  // re-encode would change its bytes on every run.
  const { width, height } = await sharp(inputBuffer).metadata();
  if (width === TPV_WIDTH && height === TPV_HEIGHT) return null;
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

/**
 * Generates responsive WebP images for a given name and directory, at specified widths.
 * Original image is assumed to be `name.{sourceExt}` (defaults to "webp" — pass
 * "avif" to read an AVIF source, e.g. the NFC gallery mains).
 * Generated images are always WebP, named `{name}-{width}w.webp`.
 */
export async function generateResponsiveImage(
  name,
  dir = ASSETS_DIR,
  widths = [],
  { sourceExt = "webp" } = {},
) {
  const srcPath = path.join(dir, `${name}.${sourceExt}`);
  if (widths.length === 0) return [];
  let srcMtime;
  try {
    srcMtime = (await fs.stat(srcPath)).mtimeMs; // Throws if file does not exist
  } catch {
    console.warn(
      `Source file not found for responsive generation: ${srcPath}. Skipping.`,
    );
    return [];
  }
  // Returns only the variants actually (re)written in this run.
  const written = await Promise.all(
    widths.map(async (width) => {
      const outPath = path.join(dir, `${name}-${width}w.webp`);
      // Idempotent: keep a variant that is already newer than its source.
      const outMtime = await fs
        .stat(outPath)
        .then((s) => s.mtimeMs)
        .catch(() => -Infinity);
      if (outMtime >= srcMtime) return null;
      await sharp(srcPath)
        .resize(width, null, { fit: "inside" }) // Resize to width, maintain aspect ratio
        .webp({ quality: WEBP_QUALITY })
        .toFile(outPath);
      return outPath;
    }),
  );
  return written.filter(Boolean);
}

/** Ensures `${name}.webp` exists, converting from PNG if needed; false if impossible. */
async function ensureCartaWebp(name) {
  try {
    await fs.access(path.join(ASSETS_DIR, `${name}.webp`));
    return true;
  } catch {
    console.warn(
      `Original .webp not found for ${name}. Attempting to convert from PNG first.`,
    );
  }
  try {
    await convertCartaDigitalScreenshot(name);
    console.log(`Converted ${name}.png to ${name}.webp.`);
    return true;
  } catch (pngError) {
    console.error(
      `Failed to convert ${name}.png to .webp: ${pngError}. Skipping responsive generation.`,
    );
    return false;
  }
}

async function main() {
  // Stage order matters: TPV variants are generated FROM the resized
  // originals, so resizing must finish first. Items within a stage are
  // independent and run in parallel.
  const resized = await Promise.all(TPV_TARGETS.map((name) => resizeTpvFigure(name)));
  resized.filter(Boolean).forEach((out) => console.log(`resized: ${out}`));

  const tpvVariants = await Promise.all(
    TPV_TARGETS.map((name) =>
      generateResponsiveImage(name, TPV_DIR, TPV_RESPONSIVE_WIDTHS),
    ),
  );
  tpvVariants.flat().forEach((out) => console.log(`generated TPV responsive: ${out}`));

  const nfcRenamed = await renameNfcGalleryAssets();
  nfcRenamed.forEach((out) => console.log(`byte-copied NFC main: ${out}`));
  const thumbs = await Promise.all(
    Object.values(NFC_RENAMES).map((newName) =>
      generateResponsiveImage(
        newName.replace(/\.avif$/, ""),
        NFC_DIR,
        [NFC_THUMBNAIL_WIDTH],
        { sourceExt: "avif" },
      ),
    ),
  );
  thumbs.flat().forEach((out) => console.log(`generated NFC thumbnail: ${out}`));

  const RESPONSIVE_WIDTHS = [320, 640, 1280];
  await Promise.all(
    CARTA_DIGITAL_TARGETS.map(async (name) => {
      if (!(await ensureCartaWebp(name))) return;
      const outs = await generateResponsiveImage(name, ASSETS_DIR, RESPONSIVE_WIDTHS);
      if (outs.length > 0) {
        outs.forEach((out) => console.log(`generated responsive: ${out}`));
      } else {
        console.log(`Responsive images for ${name} already up to date.`);
      }
    }),
  );
}

// Only run when executed directly (`node scripts/optimize-images.mjs`), not
// when imported by tests (which use `node --input-type=module -e "..."`,
// where `process.argv[1]` is undefined). Uses pathToFileURL (not a manual
// `file://` string template) so this comparison is correct on Windows too.
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  try {
    await main();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
