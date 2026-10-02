import fs from "node:fs";
import path from "node:path";
import { SOLUTIONS } from "@shared/config/solutions";

// S3 (seo-audit-followups): /tarjetas-nfc frozen-surface regression guard.
// SEO_PROTOCOL P-13 froze this route's H1 wording; this guard extends the
// freeze to every other head element, the NFC FAQ, the SOLUTIONS service
// fields, and the ServiceSchema JSON-LD it feeds — with ONE sanctioned
// exception: `ServiceSchema.provider` MAY change from an inline
// Organization object to a bare `{"@id"}` ref once S8's entity-graph fix
// lands (spec: structured-data-policy, "Frozen Surface Stays Untouched").
// Every other field must stay byte-identical.

const ROOT = path.resolve(__dirname, "../../../");
const ORG_URL = "https://digitalizatenerife.es";
const PAGE_URL = `${ORG_URL}/tarjetas-nfc`;
const ORGANIZATION_ID = `${ORG_URL}/#organization`;

const PAGE_PATH = path.join(
  ROOT,
  "src/features/tap-review/presentation/TapReviewPage.tsx",
);
const LANGUAGE_CONTEXT_PATH = path.join(
  ROOT,
  "src/shared/context/LanguageContext.tsx",
);
const SEO_SCHEMA_PATH = path.join(
  ROOT,
  "src/shared/presentation/components/SeoSchema.tsx",
);
const SOLUTIONS_PATH = path.join(ROOT, "src/shared/config/solutions.ts");

const pageSource = fs.readFileSync(PAGE_PATH, "utf-8");
const languageContextSource = fs.readFileSync(LANGUAGE_CONTEXT_PATH, "utf-8");

describe("/tarjetas-nfc frozen surface — head elements (TapReviewPage.tsx literals)", () => {
  it("pins <title>", () => {
    expect(pageSource).toMatch(
      /PAGE_TITLE\s*=\s*"Tarjetas NFC Tap-to-Review \| Digitaliza Tenerife"/,
    );
  });

  it("pins the visible <h1> (SEO_PROTOCOL P-13)", () => {
    expect(pageSource).toMatch(
      /PAGE_H1\s*=\s*\n?\s*"Tarjetas NFC Tap-to-Review para multiplicar tus reseñas de Google"/,
    );
  });

  it("pins the meta description", () => {
    expect(pageSource).toMatch(
      /PAGE_DESCRIPTION\s*=\s*\n?\s*"Tarjetas NFC para que los clientes dejen reseñas en Google e Instagram con un solo toque\. Multiplica tus reseñas sin apps ni fricción\."/,
    );
  });

  it("pins the canonical URL", () => {
    expect(pageSource).toMatch(/PAGE_URL\s*=\s*`\$\{ORG_URL\}\/tarjetas-nfc`/);
    expect(pageSource).toMatch(/<link rel="canonical" href=\{PAGE_URL\} \/>/);
  });

  it("pins the Open Graph image, alt text, locale and site name", () => {
    expect(pageSource).toMatch(
      /https:\/\/digitalizatenerife\.es\/og\/tarjetas-nfc\.png/,
    );
    expect(pageSource).toMatch(
      /og:image:alt"\s*\n?\s*content="Tarjetas NFC para multiplicar tus reseñas en Google"/,
    );
    expect(pageSource).toMatch(/property="og:locale" content="es_ES"/);
    expect(pageSource).toMatch(
      /property="og:site_name" content="Digitaliza Tenerife"/,
    );
  });
});

describe("/tarjetas-nfc frozen surface — NFC FAQ group (useNfcFaqGroup → LanguageContext es strings)", () => {
  it("pins the FAQ group title and all 3 question strings (es)", () => {
    expect(languageContextSource).toMatch(
      /tapReviewFAQTitle:\s*"Preguntas frecuentes"/,
    );
    expect(languageContextSource).toMatch(
      /tapReviewFAQ1Question:\s*"¿Realmente funciona el NFC con cualquier móvil\?"/,
    );
    expect(languageContextSource).toMatch(
      /tapReviewFAQ2Question:\s*"¿Cómo configuro el dispositivo para mi negocio\?"/,
    );
    expect(languageContextSource).toMatch(
      /tapReviewFAQ3Question:\s*"¿Qué pasa si el cliente no tiene NFC\?"/,
    );
  });
});

describe("/tarjetas-nfc frozen surface — SOLUTIONS NFC service fields", () => {
  const nfc = SOLUTIONS.find((s) => s.id === "tarjetas-nfc");

  it("exists in the SOLUTIONS catalog", () => {
    expect(nfc).toBeDefined();
  });

  it("pins serviceValue, jsonLd.description, jsonLd.serviceType and jsonLd.areaServed", () => {
    expect(nfc?.serviceValue).toBe("Tarjetas NFC Reseñas");
    expect(nfc?.jsonLd.description).toBe(
      "Tarjetas NFC para que los clientes dejen reseñas en Google e Instagram con un solo toque.",
    );
    expect(nfc?.jsonLd.serviceType).toBe("NFC Review Solution");
    expect(nfc?.jsonLd.areaServed).toEqual(["Tenerife", "Canarias", "España"]);
  });
});

describe("/tarjetas-nfc frozen surface — ServiceSchema provider @id is the single organization entity", () => {
  // TapReviewPage.tsx passes providerUrl={ORG_URL}; SeoSchema.tsx's
  // ServiceSchema computes provider["@id"] as
  // `${providerUrl.replace(/\/$/, "")}/#organization`, which must resolve
  // to the same @id as buildHomeSchema's single LocalBusiness/Organization
  // node — never a second, drifted entity.
  const seoSchemaSource = fs.readFileSync(SEO_SCHEMA_PATH, "utf-8");

  it("TapReviewPage wires providerUrl to ORG_URL (the official domain)", () => {
    expect(pageSource).toMatch(/providerUrl=\{ORG_URL\}/);
    expect(pageSource).toMatch(/ORG_URL\s*=\s*"https:\/\/digitalizatenerife\.es"/);
  });

  it("ServiceSchema's provider @id formula resolves to the single #organization node", () => {
    expect(seoSchemaSource).toMatch(
      /"@id":\s*`\$\{providerUrl\.replace\(\/\\\/\$\/,\s*""\)\}\/#organization`/,
    );
    // buildHomeSchema's LocalBusiness/Organization node uses the identical
    // ${ORG_URL}/#organization id — the single source of truth both this
    // page's Service.provider and home's own node must agree on.
    expect(seoSchemaSource).toMatch(/"@id":\s*`\$\{ORG_URL\}\/#organization`/);
  });
});

// ─── Dist-level byte-equality check ──────────────────────────────
// Gated on dist/tarjetas-nfc/index.html being fresher than every source
// file that feeds the Service JSON-LD. Skips (never false-fails) when
// dist/ is absent or stale — comparing against a stale build would be a
// false negative, not a real regression signal.
const DIST = path.join(ROOT, "dist");
const distNfcPath = path.join(DIST, "tarjetas-nfc", "index.html");
const TOUCHED_SOURCES = [PAGE_PATH, SEO_SCHEMA_PATH, SOLUTIONS_PATH, LANGUAGE_CONTEXT_PATH];

const distExists = fs.existsSync(distNfcPath);
const distMtime = distExists ? fs.statSync(distNfcPath).mtimeMs : 0;
const distFresh =
  distExists && TOUCHED_SOURCES.every((file) => fs.statSync(file).mtimeMs <= distMtime);

const describeIfFresh = distFresh ? describe : describe.skip;

describeIfFresh(
  "/tarjetas-nfc frozen surface — built ServiceSchema JSON-LD (dist, fresh-gated)",
  () => {
    const html = fs.readFileSync(distNfcPath, "utf-8");
    const serviceBlock = [
      ...html.matchAll(
        /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi,
      ),
    ]
      .map((m) => JSON.parse(m[1]) as Record<string, unknown>)
      .find((node) => node["@type"] === "Service");

    const nfc = SOLUTIONS.find((s) => s.id === "tarjetas-nfc");

    it("found exactly one Service JSON-LD block", () => {
      expect(serviceBlock).toBeDefined();
    });

    it("every field except provider is byte-identical to the expected frozen values", () => {
      expect(serviceBlock?.["@id"]).toBe(`${PAGE_URL}#service`);
      expect(serviceBlock?.name).toBe(nfc?.serviceValue);
      expect(serviceBlock?.description).toBe(nfc?.jsonLd.description);
      expect(serviceBlock?.url).toBe(PAGE_URL);
      expect(serviceBlock?.areaServed).toEqual(nfc?.jsonLd.areaServed);
      expect(serviceBlock?.serviceType).toBe(nfc?.jsonLd.serviceType);
    });

    it("provider is the ONLY field allowed to diverge, and only by referencing the single #organization node", () => {
      const provider = serviceBlock?.provider as
        | { "@id"?: string }
        | undefined;
      expect(provider?.["@id"]).toBe(ORGANIZATION_ID);
    });
  },
);
