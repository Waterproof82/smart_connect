/**
 * Single source of truth for the business NAP (Name/Address/Phone), geo
 * coordinates and founder identity. Plain TS, no React import — every
 * public-facing surface (JSON-LD schema, /about, legal texts, WebMCP,
 * Contact fallback, llms.txt) MUST read from this module instead of
 * duplicating hand-synced copies. See openspec/changes/seo-nap-eeat-fixes.
 */

export const ORGANIZATION = {
  name: "Digitaliza Tenerife",
  url: "https://digitalizatenerife.es",
  email: "info@digitalizatenerife.es",
  telephone: "+34 601 39 64 19",
  address: {
    streetAddress: "Calle Médico Ernesto Castro, 57",
    postalCode: "38356",
    addressLocality: "Tacoronte",
    addressRegion: "Santa Cruz de Tenerife",
    addressCountry: "ES",
  },
  geo: {
    latitude: 28.4983,
    longitude: -16.4128,
  },
  founder: {
    name: "José Miguel Aristía",
    jobTitle: "Fundador",
  },
} as const;

/**
 * Formats the full address as one display line, for the Contact fallback,
 * WebMCP tool responses and llms.txt.
 */
export function formatAddressLine(locale: "es" | "en" = "es"): string {
  const { streetAddress, postalCode, addressLocality, addressRegion } =
    ORGANIZATION.address;
  const country = locale === "en" ? "Spain" : "España";
  return `${streetAddress}, ${postalCode} ${addressLocality}, ${addressRegion}, ${country}`;
}
