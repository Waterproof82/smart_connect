import { buildHomeSchema } from "@shared/presentation/components/SeoSchema";
import { SOLUTIONS } from "@shared/config/solutions";

describe("buildHomeSchema", () => {
  it("emits exactly one Service node per solution passed in", () => {
    const schema = buildHomeSchema(SOLUTIONS);
    const serviceNodes = schema["@graph"].filter(
      (node) => (node as { "@type"?: string })["@type"] === "Service",
    );
    expect(serviceNodes).toHaveLength(SOLUTIONS.length);
  });

  it("emits exactly one ItemList referencing every solution", () => {
    const schema = buildHomeSchema(SOLUTIONS);
    const itemLists = schema["@graph"].filter(
      (node) => (node as { "@type"?: string })["@type"] === "ItemList",
    );
    expect(itemLists).toHaveLength(1);
    const itemList = itemLists[0] as {
      itemListElement: Array<Record<string, unknown>>;
    };
    expect(itemList.itemListElement).toHaveLength(SOLUTIONS.length);
  });

  it("no longer carries a qribar.es sameAs on the carta-digital Service node (purged)", () => {
    const schema = buildHomeSchema(SOLUTIONS);
    const cartaDigitalNode = schema["@graph"].find(
      (node) =>
        (node as { "@id"?: string })["@id"] ===
        "https://digitalizatenerife.es/#service-carta-digital",
    ) as { sameAs?: string[] } | undefined;
    expect(cartaDigitalNode?.sameAs).toBeUndefined();
  });

  it("includes a LocalBusiness and WebPage node", () => {
    const schema = buildHomeSchema(SOLUTIONS);
    const types = schema["@graph"].map(
      (node) => (node as { "@type"?: string })["@type"],
    );
    expect(types).toContain("LocalBusiness");
    expect(types).toContain("WebPage");
  });

  it("emits no FAQPage node when no faqs are passed", () => {
    const schema = buildHomeSchema(SOLUTIONS);
    const faqNodes = schema["@graph"].filter(
      (node) => (node as { "@type"?: string })["@type"] === "FAQPage",
    );
    expect(faqNodes).toHaveLength(0);
  });

  it("emits exactly one FAQPage node with all provided questions when faqs are passed", () => {
    const schema = buildHomeSchema(SOLUTIONS, [
      { question: "¿Qué es la Carta Digital?", answer: "Un menú digital." },
      { question: "¿Cuánto cuesta?", answer: "Consulta con nosotros." },
    ]);
    const faqNodes = schema["@graph"].filter(
      (node) => (node as { "@type"?: string })["@type"] === "FAQPage",
    );
    expect(faqNodes).toHaveLength(1);
    const faqNode = faqNodes[0] as { mainEntity: Array<Record<string, unknown>> };
    expect(faqNode.mainEntity).toHaveLength(2);
  });

  it("emits exactly 2 Service nodes for the final two-solution catalog", () => {
    const schema = buildHomeSchema(SOLUTIONS);
    const serviceNodes = schema["@graph"].filter(
      (node) => (node as { "@type"?: string })["@type"] === "Service",
    );
    expect(serviceNodes).toHaveLength(2);
  });

  it("never emits a BreadcrumbList node (home is the site root)", () => {
    const schema = buildHomeSchema(SOLUTIONS, [
      { question: "Q", answer: "A" },
    ]);
    const breadcrumbNodes = schema["@graph"].filter(
      (node) => (node as { "@type"?: string })["@type"] === "BreadcrumbList",
    );
    expect(breadcrumbNodes).toHaveLength(0);
  });

  it("merges all 14 audited home + carta-digital + tap-review FAQ entries into one node", () => {
    const fourteenFaqs = Array.from({ length: 14 }, (_, i) => ({
      question: `Q${i + 1}`,
      answer: `A${i + 1}`,
    }));
    const schema = buildHomeSchema(SOLUTIONS, fourteenFaqs);
    const faqNode = schema["@graph"].find(
      (node) => (node as { "@type"?: string })["@type"] === "FAQPage",
    ) as { mainEntity: Array<Record<string, unknown>> };
    expect(faqNode.mainEntity).toHaveLength(14);
  });
});
