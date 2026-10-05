import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import {
  buildHomeSchema,
  buildAboutSchema,
  ServiceSchema,
  ORGANIZATION_ID,
  WEBSITE_ID,
} from "@shared/presentation/components/SeoSchema";
import { SOLUTIONS } from "@shared/config/solutions";

// structured-data-policy spec (S8, design.md D4): a single LocalBusiness
// entity (`#organization`) and a single WebSite entity (`#website`) are
// declared once on home; every other reference — WebPage.author/
// publisher/isPartOf, every ServiceSchema.provider — is a bare `{"@id"}`,
// never a redeclared inline object. No `sameAs` anywhere.

type Node = Record<string, unknown>;

function parseJsonLd(html: string): Node {
  const match = html.match(
    /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/,
  );
  if (!match) throw new Error("No JSON-LD script found");
  return JSON.parse(match[1]) as Node;
}

describe("entity graph — buildHomeSchema (design.md D4)", () => {
  const schema = buildHomeSchema(SOLUTIONS, [
    { question: "Q", answer: "A" },
  ]);
  const graph = schema["@graph"];

  it("exports ORGANIZATION_ID/WEBSITE_ID matching the node @ids", () => {
    expect(ORGANIZATION_ID).toBe("https://digitalizatenerife.es/#organization");
    expect(WEBSITE_ID).toBe("https://digitalizatenerife.es/#website");
  });

  it("emits exactly one WebSite node, @id ending #website", () => {
    const websites = graph.filter((n) => n["@type"] === "WebSite");
    expect(websites).toHaveLength(1);
    expect(websites[0]["@id"]).toBe(WEBSITE_ID);
    expect(websites[0].publisher).toEqual({ "@id": ORGANIZATION_ID });
    expect(websites[0].inLanguage).toBe("es");
  });

  it("emits exactly one LocalBusiness node, @id ending #organization — the single canonical entity", () => {
    const orgs = graph.filter((n) => n["@type"] === "LocalBusiness");
    expect(orgs).toHaveLength(1);
    expect(orgs[0]["@id"]).toBe(ORGANIZATION_ID);
  });

  it("WebPage.isPartOf/author/publisher are bare @id refs, not inline objects", () => {
    const webPage = graph.find((n) => n["@type"] === "WebPage")!;
    expect(webPage.isPartOf).toEqual({ "@id": WEBSITE_ID });
    expect(webPage.author).toEqual({ "@id": ORGANIZATION_ID });
    expect(webPage.publisher).toEqual({ "@id": ORGANIZATION_ID });
  });

  it("only the organization node carries sameAs, and only the verified Google Business Profile", () => {
    for (const node of graph) {
      if (node["@id"] === ORGANIZATION_ID) {
        expect(node.sameAs).toEqual(["https://maps.google.com/?cid=15389059418085053984"]);
      } else {
        expect(node.sameAs).toBeUndefined();
      }
    }
  });

  it("knowsAbout leads with carta digital / NFC before any n8n/automation term", () => {
    const org = graph.find((n) => n["@type"] === "LocalBusiness") as {
      knowsAbout: string[];
    };
    const coreIndex = org.knowsAbout.findIndex((t) =>
      /carta digital|NFC/i.test(t),
    );
    const automationIndex = org.knowsAbout.findIndex((t) =>
      /n8n|automatizaci[oó]n/i.test(t),
    );
    expect(coreIndex).toBeGreaterThanOrEqual(0);
    expect(automationIndex).toBeGreaterThanOrEqual(0);
    expect(coreIndex).toBeLessThan(automationIndex);
  });

  it("description leads with carta digital / NFC before any n8n/automation term", () => {
    const org = graph.find((n) => n["@type"] === "LocalBusiness") as {
      description: string;
    };
    const coreIndex = org.description.search(/carta digital|NFC/i);
    const automationIndex = org.description.search(/n8n|automatizaci[oó]n/i);
    expect(coreIndex).toBeGreaterThanOrEqual(0);
    // A missing automation mention (-1) also satisfies "leads with core
    // before automation" — only fail if automation appears earlier.
    if (automationIndex >= 0) {
      expect(coreIndex).toBeLessThan(automationIndex);
    }
  });
});

describe("entity graph — buildAboutSchema reuses the shared organization node (design.md D4)", () => {
  const about = buildAboutSchema() as {
    "@id": string;
    url: string;
    isPartOf: { "@id": string };
    mainEntity: Node;
  };

  it("has its own @id/url, and isPartOf references the single WebSite node", () => {
    expect(about["@id"]).toBe("https://digitalizatenerife.es/about#webpage");
    expect(about.url).toBe("https://digitalizatenerife.es/about");
    expect(about.isPartOf).toEqual({ "@id": WEBSITE_ID });
  });

  it("mainEntity is the same organization node (same @id/@type) as home's — never a second, drifted entity", () => {
    expect(about.mainEntity["@type"]).toBe("LocalBusiness");
    expect(about.mainEntity["@id"]).toBe(ORGANIZATION_ID);
    expect(about.mainEntity.sameAs).toEqual(["https://maps.google.com/?cid=15389059418085053984"]);
  });
});

describe("entity graph — ServiceSchema.provider is a bare @id ref (design.md D4, 4 product pages)", () => {
  it("renders provider as {\"@id\": ORGANIZATION_ID} only — no inline Organization object", () => {
    const html = renderToStaticMarkup(
      createElement(ServiceSchema, {
        name: "Carta Digital Premium",
        description: "desc",
        url: "https://digitalizatenerife.es/carta-digital",
      }),
    );
    const schema = parseJsonLd(html);
    expect(schema.provider).toEqual({ "@id": ORGANIZATION_ID });
  });
});
