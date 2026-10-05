import fs from "node:fs";
import path from "node:path";

/**
 * Trust-claims guard (seo-trust-claims-cleanup, trust-claims spec).
 *
 * PR2a added the home-scoped assertions (Carta Digital reviews, stat strip,
 * FAQ, nav). PR2b (tasks.md 2b.11) adds the NFC-scoped assertions below:
 * Tapstar figures, TrustBadges/TrustFacts, CTASection, HowItWorks, hero
 * feature wording.
 *
 * Deviation from tasks.md 2b.11 (recorded, not silently dropped): the task
 * list's NFC_CLAIMS also named "L'Escale" and bare "400". Both were dropped
 * from the scan below after verification:
 *  - "L'Escale" only ever appears in `contactPlaceholderCompany: "Ej.
 *    Restaurante L'Escale"` — the contact form's example-business
 *    placeholder, unrelated to the tap-review testimonials (which were
 *    "Restaurante El Bodegón" / "Café Central Madrid" / "Bar La Tapa", none
 *    of them "L'Escale"). Scanning for it would fail this guard by removing
 *    legitimate, out-of-scope UI copy for no reason tied to this change.
 *  - bare "400" (vs. the StatsBanner literal "+400") collides with ~34
 *    pre-existing, unrelated occurrences across src/public (font-weight:
 *    400, pixel widths, etc. — confirmed via `grep -rn "400" src/ public/`).
 *    The actual Tapstar figure was "+400" (daily-reviews stat in the now
 *    deleted StatsBanner.tsx); the scan below uses that exact substring.
 */

const ROOT = path.resolve(__dirname, "../../../");
const SRC_DIR = path.join(ROOT, "src");
const PUBLIC_DIR = path.join(ROOT, "public");
const LANGUAGE_CONTEXT_PATH = path.join(
  SRC_DIR,
  "shared/context/LanguageContext.tsx",
);

function walk(dir: string, files: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      walk(fullPath, files);
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

function toRelative(filePath: string): string {
  return path.relative(ROOT, filePath).split(path.sep).join("/");
}

const UNSOURCED_CLAIMS = [
  "Decenas",
  "Hasta 6×",
  "Hasta 45%",
  "Hasta 40%",
  "★★★★★",
  "×6 en 90 días",
  "6x in 90 days",
  "Contactá",
];

describe("trust-claims guard — home scope (PR2a)", () => {
  const files = [...walk(SRC_DIR), ...walk(PUBLIC_DIR)];

  it.each(UNSOURCED_CLAIMS)(
    "no file in src/ or public/ contains %j",
    (claim) => {
      const offenders = files
        .filter((file) => fs.readFileSync(file, "utf-8").includes(claim))
        .map(toRelative);
      expect(offenders).toEqual([]);
    },
  );

  it("LanguageContext.tsx no longer declares successStat1Value…successStat4Author keys", () => {
    const source = fs.readFileSync(LANGUAGE_CONTEXT_PATH, "utf-8");
    const removedKeys = [
      "successStat1Value",
      "successStat1Label",
      "successStat1Quote",
      "successStat1Author",
      "successStat2Label",
      "successStat2Quote",
      "successStat2Author",
      "successStat3Label",
      "successStat3Quote",
      "successStat3Author",
      "successStat4Label",
      "successStat4Quote",
      "successStat4Author",
      "successTitle",
      "successSubtitle",
      "successDesc",
    ];
    for (const key of removedKeys) {
      expect(source).not.toMatch(new RegExp(`\\b${key}\\b`));
    }
  });
});

const NFC_CLAIMS = [
  "Tapstar",
  "4.9/5",
  "600K",
  "+400",
  "Garantía 30 días",
  "30-day guarantee",
  "Envío gratis 24h",
  "Free 24h shipping",
  "Soporte 24/7",
  "24/7 Support",
  "Aparece el primero en Google Maps",
  "Aparece primero en Google",
  "Appear first on Google",
  "Café Central",
  "+20,000",
];

describe("trust-claims guard — NFC scope (PR2b)", () => {
  const files = [...walk(SRC_DIR), ...walk(PUBLIC_DIR)];

  it.each(NFC_CLAIMS)("no file in src/ or public/ contains %j", (claim) => {
    const offenders = files
      .filter((file) => fs.readFileSync(file, "utf-8").includes(claim))
      .map(toRelative);
    expect(offenders).toEqual([]);
  });

  it("LanguageContext.tsx no longer declares the removed NFC keys", () => {
    const source = fs.readFileSync(LANGUAGE_CONTEXT_PATH, "utf-8");
    const removedKeys = [
      "tapReviewStatsBusinesses",
      "tapReviewStatsReviews",
      "tapReviewStatsDaily",
      "tapReviewSocialTitle",
      "tapReviewSocialSubtitle",
      "tapReviewTestimonial1Quote",
      "tapReviewTestimonial1Author",
      "tapReviewTestimonial1Business",
      "tapReviewTestimonial2Quote",
      "tapReviewTestimonial2Author",
      "tapReviewTestimonial2Business",
      "tapReviewTestimonial3Quote",
      "tapReviewTestimonial3Author",
      "tapReviewTestimonial3Business",
      "tapReviewTrust30Days",
      "tapReviewTrust24h",
      "tapReviewTrustSupport",
    ];
    for (const key of removedKeys) {
      expect(source).not.toMatch(new RegExp(`\\b${key}\\b`));
    }
  });
});
