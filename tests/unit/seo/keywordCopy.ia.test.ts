import fs from "node:fs";
import path from "node:path";

/**
 * SEO keyword copy — /ia-chatbots-tenerife slice (SDD `seo-keyword-copy`,
 * Phase 1 / PR A, design.md D1-D3, spec.md "IA Title ≤60 Chars...",
 * "IA H1/H2s Describe Capabilities, Not Case Studies", "IA FAQ6 Added With
 * JSON-LD Parity").
 *
 * Same convention as `nfcFrozenSurface.guard.test.ts`: this repo's jest
 * config runs in a Node environment without jsdom, so assertions read
 * source files as text instead of rendering the page.
 */

const ROOT = path.resolve(__dirname, "../../../");
const IA_PAGE_PATH = path.join(
  ROOT,
  "src/features/landing/presentation/components/IaChatbotsPage.tsx",
);
const PAGE_COPY_PATH = path.join(
  ROOT,
  "src/shared/i18n/modules/page-copy.ts",
);

const iaPageSource = fs.readFileSync(IA_PAGE_PATH, "utf-8");
const pageCopySource = fs.readFileSync(PAGE_COPY_PATH, "utf-8");

function extractLiteral(source: string, name: string): string {
  const match = source.match(
    new RegExp(`const ${name} =\\s*\\n?\\s*"([^"]*)"`),
  );
  expect(match).not.toBeNull();
  return match![1];
}

describe("PAGE_TITLE — ≤60 chars, starts with 'Chatbots' (spec.md)", () => {
  const title = extractLiteral(iaPageSource, "PAGE_TITLE");

  it("is at most 60 characters", () => {
    expect(title.length).toBeLessThanOrEqual(60);
  });

  it("starts with 'Chatbots' and keeps the brand suffix (design.md D1)", () => {
    expect(title.startsWith("Chatbots")).toBe(true);
    expect(title.endsWith("| Digitaliza Tenerife")).toBe(true);
  });

  it("exact shipped value", () => {
    expect(title).toBe(
      "Chatbots IA para empresas en Tenerife | Digitaliza Tenerife",
    );
  });
});

describe("PAGE_DESCRIPTION — ≤155 chars", () => {
  const description = extractLiteral(iaPageSource, "PAGE_DESCRIPTION");

  it("is at most 155 characters", () => {
    expect(description.length).toBeLessThanOrEqual(155);
  });

  it("exact shipped value", () => {
    expect(description).toBe(
      "Chatbots con IA para web y WhatsApp y automatización de procesos para empresas de Tenerife y Canarias. Atiende a tus clientes a cualquier hora.",
    );
  });
});

describe("og:image:alt — matches shipped copy", () => {
  it("exact shipped value", () => {
    expect(iaPageSource).toMatch(
      /og:image:alt"\s*\n?\s*content="Chatbots de IA y automatización para empresas en Tenerife"/,
    );
  });
});

describe("iaH1 — capability-framed, no case-study language (design.md D2/D3)", () => {
  it("es", () => {
    expect(pageCopySource).toMatch(
      /iaH1:\s*"Inteligencia artificial y automatización para empresas en Tenerife y Canarias"/,
    );
  });

  it("en", () => {
    expect(pageCopySource).toMatch(
      /iaH1:\s*"Artificial intelligence and automation for businesses in Tenerife and the Canary Islands"/,
    );
  });
});

describe("iaChatbotsTitle — new H2 for the chatbot card grid (design.md D2)", () => {
  it("es", () => {
    expect(pageCopySource).toMatch(
      /iaChatbotsTitle:\s*"Chatbots con IA y robots de atención al público"/,
    );
  });

  it("en", () => {
    expect(pageCopySource).toMatch(
      /iaChatbotsTitle:\s*"AI chatbots and customer-service bots"/,
    );
  });
});

describe("iaCasesTitle — renamed away from 'Casos' (design.md D3)", () => {
  it("es", () => {
    expect(pageCopySource).toMatch(
      /iaCasesTitle:\s*"Aplicaciones prácticas de IA para pymes y negocios locales"/,
    );
    expect(pageCopySource).not.toMatch(
      /iaCasesTitle:\s*"Casos para hostelería y comercio local"/,
    );
  });

  it("en", () => {
    expect(pageCopySource).toMatch(
      /iaCasesTitle:\s*"Practical AI applications for SMEs and local businesses"/,
    );
    expect(pageCopySource).not.toMatch(
      /iaCasesTitle:\s*"Use cases for hospitality and local retail"/,
    );
  });
});

describe("iaCasesIntro — new intro for the cases section (design.md D3)", () => {
  it("es", () => {
    expect(pageCopySource).toMatch(
      /iaCasesIntro:\s*"Algunas tareas que un asistente de IA puede cubrir en un negocio local, según el sector\."/,
    );
  });

  it("en", () => {
    expect(pageCopySource).toMatch(
      /iaCasesIntro:\s*"Some tasks an AI assistant can handle in a local business, by sector\."/,
    );
  });
});

describe("iaCase1-3Desc — rewritten as capabilities ('Puede…'), no named client/metric (design.md D3)", () => {
  it("es", () => {
    expect(pageCopySource).toMatch(
      /iaCase1Desc:\s*\n?\s*"Puede responder dudas sobre la carta, alérgenos, horarios y cómo llegar, sin que nadie tenga que coger el teléfono en plena hora punta\."/,
    );
    expect(pageCopySource).toMatch(
      /iaCase2Desc:\s*\n?\s*"Puede recoger peticiones de reserva por WhatsApp y avisar a tu equipo con todos los datos para confirmarlas\."/,
    );
    expect(pageCopySource).toMatch(
      /iaCase3Desc:\s*\n?\s*"Puede atender preguntas sobre productos, precios y disponibilidad, y dejar cada consulta registrada como contacto\."/,
    );
  });

  it("en", () => {
    expect(pageCopySource).toMatch(
      /iaCase1Desc:\s*\n?\s*"It can answer questions about the menu, allergens, opening hours and directions, so nobody has to pick up the phone during the rush\."/,
    );
    expect(pageCopySource).toMatch(
      /iaCase2Desc:\s*\n?\s*"It can collect booking requests on WhatsApp and notify your team with all the details to confirm them\."/,
    );
    expect(pageCopySource).toMatch(
      /iaCase3Desc:\s*\n?\s*"It can answer questions about products, prices and availability, and log every enquiry as a contact\."/,
    );
  });

  it("none of the 3 descriptions name a client, a metric, or frame a case study", () => {
    const descs = [
      ...pageCopySource.matchAll(/iaCase[123]Desc:\s*\n?\s*"([^"]*)"/g),
    ].map((m) => m[1]);
    expect(descs.length).toBeGreaterThanOrEqual(6); // es + en, 3 each
    for (const desc of descs) {
      expect(desc).not.toMatch(/\d+%|\bclient(e)?\b.*dijo|caso de éxito|case study/i);
    }
  });
});

describe("iaFaqQ6/A6 — new FAQ pair (design.md, spec.md 'IA FAQ6 Added With JSON-LD Parity')", () => {
  it("es", () => {
    expect(pageCopySource).toMatch(
      /iaFaqQ6:\s*"¿Cómo puede usar la inteligencia artificial una pyme de Tenerife\?"/,
    );
    expect(pageCopySource).toMatch(
      /iaFaqA6:\s*\n?\s*"Con aplicaciones prácticas: un chatbot que responde a tus clientes en la web o en WhatsApp, la recogida de reservas y contactos, y automatizaciones que envían avisos o registran datos sin trabajo manual\. Empezamos por la tarea que más tiempo te quita cada día\."/,
    );
  });

  it("en", () => {
    expect(pageCopySource).toMatch(
      /iaFaqQ6:\s*"How can a small business in Tenerife use artificial intelligence\?"/,
    );
    expect(pageCopySource).toMatch(
      /iaFaqA6:\s*\n?\s*"Through practical applications: a chatbot that answers your customers on your website or WhatsApp, collecting bookings and contacts, and automations that send notifications or record data without manual work\. We start with the task that takes up most of your time each day\."/,
    );
  });

  it("the Translation/PageCopy interface declares both keys", () => {
    expect(pageCopySource).toMatch(/iaFaqQ6:\s*string;/);
    expect(pageCopySource).toMatch(/iaFaqA6:\s*string;/);
  });
});

describe("IaChatbotsPage.tsx wiring", () => {
  it("faqs array includes { question: t.iaFaqQ6, answer: t.iaFaqA6 }", () => {
    expect(iaPageSource).toMatch(
      /\{\s*question:\s*t\.iaFaqQ6,\s*answer:\s*t\.iaFaqA6\s*\}/,
    );
  });

  it("the chatbot card grid section becomes <Section id=\"ia-chatbots\" title={t.iaChatbotsTitle}>", () => {
    expect(iaPageSource).toMatch(
      /<Section id="ia-chatbots" title=\{t\.iaChatbotsTitle\}>/,
    );
    expect(iaPageSource).not.toMatch(/<Section label=\{t\.iaH1\}>/);
  });

  it("the cards render as <h3>, not <h2> (fixes the flat 4-H2 outline)", () => {
    const cardsBlock = iaPageSource.match(
      /cards\.map\(\(\{ icon: Icon, title, desc \}\) => \([\s\S]*?\)\)\}/,
    );
    expect(cardsBlock).not.toBeNull();
    expect(cardsBlock![0]).toMatch(/<h3 className="ds-h3 mb-2">\{title\}<\/h3>/);
    expect(cardsBlock![0]).not.toMatch(/<h2/);
  });

  it("#ia-cases Section passes intro={t.iaCasesIntro}", () => {
    expect(iaPageSource).toMatch(
      /<Section id="ia-cases" title=\{t\.iaCasesTitle\} intro=\{t\.iaCasesIntro\}>/,
    );
  });

  it("SeoFaqSchema and the visible FaqList both render from the same faqs array (no second literal)", () => {
    expect(iaPageSource).toMatch(/<SeoFaqSchema faqs=\{faqs\} \/>/);
    expect(iaPageSource).toMatch(
      /<FaqList\s*\n?\s*items=\{faqs\.map\(\(f\) => \(\{ q: f\.question, a: f\.answer \}\)\)\}\s*\n?\s*\/>/,
    );
  });
});
