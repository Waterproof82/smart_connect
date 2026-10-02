import { ORGANIZATION, formatAddressLine } from "@shared/config/organization";

describe("ORGANIZATION", () => {
  it("exposes the correct name, url, email and telephone", () => {
    expect(ORGANIZATION.name).toBe("Digitaliza Tenerife");
    expect(ORGANIZATION.url).toBe("https://digitalizatenerife.es");
    expect(ORGANIZATION.email).toBe("info@digitalizatenerife.es");
    expect(ORGANIZATION.telephone).toBe("+34 601 39 64 19");
  });

  it("exposes the correct address (NAP), with no door-number suffix", () => {
    expect(ORGANIZATION.address).toEqual({
      streetAddress: "Calle Médico Ernesto Castro, 57",
      postalCode: "38356",
      addressLocality: "Tacoronte",
      addressRegion: "Santa Cruz de Tenerife",
      addressCountry: "ES",
    });
    expect(ORGANIZATION.address.streetAddress).not.toMatch(/Puerta/);
    expect(ORGANIZATION.address.postalCode).not.toBe("38001");
  });

  it("exposes the correct geo coordinates", () => {
    expect(ORGANIZATION.geo).toEqual({
      latitude: 28.4983,
      longitude: -16.4128,
    });
  });

  it("exposes the correct founder identity, with no fabricated sameAs", () => {
    expect(ORGANIZATION.founder).toEqual({
      name: "José Miguel Aristía",
      jobTitle: "Fundador",
    });
    expect(ORGANIZATION).not.toHaveProperty("sameAs");
  });
});

describe("formatAddressLine", () => {
  it("formats the Spanish (es) address line by default", () => {
    expect(formatAddressLine()).toBe(
      "Calle Médico Ernesto Castro, 57, 38356 Tacoronte, Santa Cruz de Tenerife, España",
    );
  });

  it("formats the Spanish (es) address line explicitly", () => {
    expect(formatAddressLine("es")).toBe(
      "Calle Médico Ernesto Castro, 57, 38356 Tacoronte, Santa Cruz de Tenerife, España",
    );
  });

  it("formats the English (en) address line", () => {
    expect(formatAddressLine("en")).toBe(
      "Calle Médico Ernesto Castro, 57, 38356 Tacoronte, Santa Cruz de Tenerife, Spain",
    );
  });
});
