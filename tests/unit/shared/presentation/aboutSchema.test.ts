import { buildAboutSchema } from "@shared/presentation/components/SeoSchema";
import { ORGANIZATION } from "@shared/config/organization";

describe("buildAboutSchema", () => {
  it("builds an AboutPage node with the shared LocalBusiness mainEntity (design.md D4, S8)", () => {
    const schema = buildAboutSchema();
    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("AboutPage");
    // S8 (entity graph): mainEntity now embeds organizationNode() — the
    // exact same LocalBusiness node home declares (@id #organization),
    // not a second, independently-typed Organization redeclaration.
    expect((schema.mainEntity as Record<string, unknown>)["@type"]).toBe(
      "LocalBusiness",
    );
    expect((schema.mainEntity as Record<string, unknown>)["@id"]).toBe(
      "https://digitalizatenerife.es/#organization",
    );
  });

  it("mainEntity address matches the ORGANIZATION constant exactly", () => {
    const schema = buildAboutSchema();
    const mainEntity = schema.mainEntity as { address: Record<string, unknown> };
    expect(mainEntity.address).toEqual({
      "@type": "PostalAddress",
      ...ORGANIZATION.address,
    });
  });

  it("mainEntity carries a geo property with the correct latitude/longitude", () => {
    const schema = buildAboutSchema();
    const mainEntity = schema.mainEntity as { geo: Record<string, unknown> };
    expect(mainEntity.geo).toEqual({
      "@type": "GeoCoordinates",
      latitude: ORGANIZATION.geo.latitude,
      longitude: ORGANIZATION.geo.longitude,
    });
  });

  it("founder is a Person node with the real name and jobTitle, no placeholder", () => {
    const schema = buildAboutSchema();
    const mainEntity = schema.mainEntity as { founder: Record<string, unknown> };
    expect(mainEntity.founder).toEqual({
      "@type": "Person",
      name: "José Miguel Aristía",
      jobTitle: "Fundador",
    });
    expect(mainEntity.founder.name).not.toBe("Digitaliza Tenerife Team");
  });

  it("carries only the verified Google Business Profile as sameAs on the Organization mainEntity", () => {
    const schema = buildAboutSchema();
    const mainEntity = schema.mainEntity as Record<string, unknown>;
    expect(mainEntity.sameAs).toEqual(["https://maps.google.com/?cid=15389059418085053984"]);
  });
});
