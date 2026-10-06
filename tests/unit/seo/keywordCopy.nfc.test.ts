import fs from "node:fs";
import path from "node:path";

/**
 * SEO keyword copy — NFC slice (SDD `seo-keyword-copy`, Phase 1 / PR A,
 * design.md D4/D5, spec.md "NFC H2 Wording Targets Tap-to-Review Intent" +
 * "NFC FAQ4 Added With JSON-LD Parity").
 *
 * Same convention as `nfcFrozenSurface.guard.test.ts` / `structuredDataPolicy
 * .test.ts`: this repo's jest config (`jest.config.js`) runs in a Node
 * environment without `jest-environment-jsdom`, so React hooks/components
 * cannot be rendered here. FAQ JSON-LD parity for `/tarjetas-nfc` is
 * structural by construction (`TapReviewPage.tsx` maps
 * `nfcFaqGroup.items` into both the visible `<FaqList>` and
 * `<SeoFaqSchema>` — never a second literal), so this is asserted at the
 * source level instead of via `renderHook`.
 */

const ROOT = path.resolve(__dirname, "../../../");
const LANGUAGE_CONTEXT_PATH = path.join(
  ROOT,
  "src/shared/context/LanguageContext.tsx",
);
const HOME_FAQ_SECTION_PATH = path.join(
  ROOT,
  "src/features/landing/presentation/components/HomeFaqSection.tsx",
);
const TAP_REVIEW_PAGE_PATH = path.join(
  ROOT,
  "src/features/tap-review/presentation/TapReviewPage.tsx",
);

const languageContextSource = fs.readFileSync(LANGUAGE_CONTEXT_PATH, "utf-8");
const homeFaqSectionSource = fs.readFileSync(HOME_FAQ_SECTION_PATH, "utf-8");
const tapReviewPageSource = fs.readFileSync(TAP_REVIEW_PAGE_PATH, "utf-8");

function useNfcFaqGroupBody(source: string): string {
  const match = source.match(
    /export function useNfcFaqGroup\(\)[\s\S]*?\n}\n/,
  );
  expect(match).not.toBeNull();
  return match![0];
}

describe("useNfcFaqGroup() has 4 items (FAQ4 added)", () => {
  const body = useNfcFaqGroupBody(homeFaqSectionSource);

  it("includes 4 { q, a } entries", () => {
    const entries = [...body.matchAll(/\{\s*q:\s*t\.tapReviewFAQ\dQuestion/g)];
    expect(entries).toHaveLength(4);
  });

  it("the 4th entry wires tapReviewFAQ4Question/Answer", () => {
    expect(body).toMatch(
      /\{\s*q:\s*t\.tapReviewFAQ4Question,\s*a:\s*t\.tapReviewFAQ4Answer\s*\}/,
    );
  });
});

describe("FAQ JSON-LD parity — /tarjetas-nfc (structural, unchanged wiring)", () => {
  it("TapReviewPage derives SeoFaqSchema from the same nfcFaqGroup.items FaqList renders (no second literal)", () => {
    expect(tapReviewPageSource).toMatch(
      /<FaqList items=\{nfcFaqGroup\.items\} \/>/,
    );
    expect(tapReviewPageSource).toMatch(
      /faqs=\{nfcFaqGroup\.items\.map\(\(item\) => \(\{\s*question:\s*item\.q,\s*answer:\s*item\.a,?\s*\}\)\)\}/,
    );
  });
});

describe("tapReviewFAQ4Question/Answer — exact copy (design.md)", () => {
  it("es", () => {
    expect(languageContextSource).toMatch(
      /tapReviewFAQ4Question:\s*"¿Qué diferencia hay entre una tarjeta NFC y un código QR para reseñas\?"/,
    );
    expect(languageContextSource).toMatch(
      /tapReviewFAQ4Answer:\s*\n?\s*"Con NFC, el cliente solo acerca el móvil a la tarjeta y se abre tu página de reseñas de Google; necesita un móvil con NFC \(iPhone 8 en adelante o Android con NFC\)\. El código QR funciona con la cámara de casi cualquier móvil, pero hay que abrirla y enfocar\. Por eso nuestros dispositivos incluyen los dos: NFC para ir más rápido y QR de respaldo\."/,
    );
  });

  it("en", () => {
    expect(languageContextSource).toMatch(
      /tapReviewFAQ4Question:\s*"What is the difference between an NFC card and a QR code for reviews\?"/,
    );
    expect(languageContextSource).toMatch(
      /tapReviewFAQ4Answer:\s*\n?\s*"With NFC, customers just hold their phone near the card and your Google review page opens; it needs an NFC-enabled phone \(iPhone 8 or newer, or Android with NFC\)\. A QR code works with almost any phone camera, but they have to open the camera and scan it\. That is why our devices include both: NFC for speed and a backup QR code\."/,
    );
  });

  it("the Translation interface declares both keys", () => {
    expect(languageContextSource).toMatch(/tapReviewFAQ4Question:\s*string;/);
    expect(languageContextSource).toMatch(/tapReviewFAQ4Answer:\s*string;/);
  });
});

describe("tapReviewHowTitle / tapReviewFeatTitle — reworded toward tap-to-review intent (design.md D4)", () => {
  it("es", () => {
    expect(languageContextSource).toMatch(
      /tapReviewHowTitle:\s*"¿Cómo funciona la tecnología Tap NFC para conseguir reseñas en Google\?"/,
    );
    expect(languageContextSource).toMatch(
      /tapReviewFeatTitle:\s*"Dispositivos Tap to Review listos para usar en Canarias"/,
    );
  });

  it("en", () => {
    expect(languageContextSource).toMatch(
      /tapReviewHowTitle:\s*"How does Tap NFC technology work for Google reviews\?"/,
    );
    expect(languageContextSource).toMatch(
      /tapReviewFeatTitle:\s*"Tap to Review devices, ready to use in the Canary Islands"/,
    );
  });

  it("no longer uses the baseline generic wording", () => {
    expect(languageContextSource).not.toMatch(
      /tapReviewHowTitle:\s*"¿Cómo funciona\?"/,
    );
    expect(languageContextSource).not.toMatch(
      /tapReviewHowTitle:\s*"How does it work\?"/,
    );
    expect(languageContextSource).not.toMatch(
      /tapReviewFeatTitle:\s*"Ventajas Tap-to-Review"/,
    );
    expect(languageContextSource).not.toMatch(
      /tapReviewFeatTitle:\s*"Tap-to-Review Advantages"/,
    );
  });

  it("neither new title hardcodes a specific timing duration", () => {
    for (const value of [
      "¿Cómo funciona la tecnología Tap NFC para conseguir reseñas en Google?",
      "Dispositivos Tap to Review listos para usar en Canarias",
      "How does Tap NFC technology work for Google reviews?",
      "Tap to Review devices, ready to use in the Canary Islands",
    ]) {
      expect(value).not.toMatch(/\d+\s*(segundos|seconds)/i);
    }
  });
});
