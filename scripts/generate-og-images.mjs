/**
 * Generates the 1200x630 Open Graph / Twitter card images in public/og/.
 * Run manually after changing copy: `node scripts/generate-og-images.mjs`.
 * Output PNGs are committed (the Vercel build does not run this script).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(__dirname, "../public/og");

export const OG_IMAGES = [
  {
    file: "home.png",
    eyebrow: "Digitaliza Tenerife",
    title: ["Carta digital, NFC e IA", "para negocios locales"],
    subtitle: "Tenerife y Canarias",
  },
  {
    file: "carta-digital.png",
    eyebrow: "Carta digital",
    title: ["Ahorra el 30 % que se", "lleva Glovo de cada pedido"],
    subtitle: "Pedidos en mesa y para recoger, sin comisiones",
  },
  {
    file: "tarjetas-nfc.png",
    eyebrow: "Tarjetas NFC",
    title: ["Multiplica tus reseñas", "en Google con un toque"],
    subtitle: "Tap-to-Review para restaurantes y comercios",
  },
  {
    file: "ia-chatbots.png",
    eyebrow: "Chatbots IA",
    title: ["Chatbots de IA y", "automatización en Tenerife"],
    subtitle: "Atiende a tus clientes 24/7 en web y WhatsApp",
  },
  {
    file: "tpv-restaurantes.png",
    eyebrow: "TPV para restaurantes",
    title: ["Todo tu restaurante", "en un solo sistema"],
    subtitle: "13 módulos: cobro, comandero, cocina, reservas y más",
  },
];

const escapeXml = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function buildSvg({ eyebrow, title, subtitle }) {
  const titleLines = title
    .map(
      (line, i) =>
        `<text x="80" y="${290 + i * 76}" font-size="60" font-weight="700" fill="#ffffff">${escapeXml(line)}</text>`,
    )
    .join("");
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0a1020"/>
      <stop offset="1" stop-color="#1b1747"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.85" cy="0.15" r="0.6">
      <stop offset="0" stop-color="#3b82f6" stop-opacity="0.45"/>
      <stop offset="1" stop-color="#3b82f6" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect width="1200" height="630" fill="url(#glow)"/>
  <rect x="80" y="150" width="56" height="6" rx="3" fill="#6d8bff"/>
  <g font-family="DejaVu Sans, Liberation Sans, Arial, sans-serif">
    <text x="80" y="128" font-size="26" font-weight="700" letter-spacing="6" fill="#8fb2ff">${escapeXml(eyebrow.toUpperCase())}</text>
    ${titleLines}
    <text x="80" y="${290 + title.length * 76 + 10}" font-size="32" fill="#c7d2fe">${escapeXml(subtitle)}</text>
    <text x="80" y="570" font-size="28" font-weight="700" fill="#ffffff">Digitaliza <tspan fill="#6d8bff">Tenerife</tspan></text>
    <text x="1120" y="570" font-size="24" text-anchor="end" fill="#94a3b8">digitalizatenerife.es</text>
  </g>
</svg>`;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const image of OG_IMAGES) {
    const out = path.join(OUT_DIR, image.file);
    await sharp(Buffer.from(buildSvg(image)))
      .png({ compressionLevel: 9, palette: true })
      .toFile(out);
    console.log(`og: ${out} (${fs.statSync(out).size} bytes)`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
