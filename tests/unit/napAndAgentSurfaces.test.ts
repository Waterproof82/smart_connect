import fs from "node:fs";
import path from "node:path";

// design.md §3.4 (NAP) and §5/D12 (WebMCP.ts, PR#2 scope: 2 string literals
// only — the get_page_content_markdown enum edit is explicitly DEFERRED to
// a future change `agent-surface-drift`, see design.md §5).
const SRC = path.resolve(__dirname, "../../src");
const read = (relPath: string) => fs.readFileSync(path.join(SRC, relPath), "utf-8");

describe("AboutPage.tsx — NAP consistency (design.md §3.4)", () => {
  it("telephone matches the canonical number used by llms.txt and SeoSchema.tsx", () => {
    const source = read(
      "features/landing/presentation/components/AboutPage.tsx",
    );
    expect(source).toMatch(/telephone:\s*"\+34 601 39 64 19"/);
    expect(source).not.toMatch(/\+34922123456/);
  });
});

describe("WebMCP.ts — get_contact_info no longer returns the dead /contacto route (design.md §5/D12)", () => {
  // Scope note: design.md §5/D12 explicitly DEFERS the get_page_content_markdown
  // enum edit (removing /contacto, adding /tarjetas-nfc) to a future change
  // `agent-surface-drift` — that is a schema change requiring markdown-
  // negotiation parity across 4 files. This PR fixes only the 2 get_contact_info
  // string literals (lines ~117/129) that actively hand agents a dead URL.
  // The enum's own "/contacto" entry is intentionally left untouched here.
  it("EN and ES get_contact_info branches point at the live #contacto anchor, not the dead route", () => {
    const source = read("WebMCP.ts");
    expect(source).toMatch(
      /Contact page: https:\/\/digitalizatenerife\.es\/#contacto/,
    );
    expect(source).toMatch(
      /Página de contacto: https:\/\/digitalizatenerife\.es\/#contacto/,
    );
  });

  it("no longer references the dead https://digitalizatenerife.es/contacto (bare, non-anchor) in get_contact_info copy", () => {
    const source = read("WebMCP.ts");
    expect(source).not.toMatch(/contacto: https:\/\/digitalizatenerife\.es\/contacto\b/i);
  });
});
