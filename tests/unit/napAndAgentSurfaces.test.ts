import fs from "node:fs";
import path from "node:path";
import { ORGANIZATION } from "@shared/config/organization";

// design.md §3.4 (NAP) and §5/D12 (WebMCP.ts, PR#2 scope: 2 string literals
// only — the get_page_content_markdown enum edit was DEFERRED at the time
// to the `agent-surface-drift` change, which has since implemented it
// (see tests/unit/agentSurfaceParity.test.ts).
const SRC = path.resolve(__dirname, "../../src");
const read = (relPath: string) => fs.readFileSync(path.join(SRC, relPath), "utf-8");

// seo-nap-eeat-fixes PR1: AboutPage.tsx no longer hardcodes the telephone —
// it calls buildAboutSchema(), which reads ORGANIZATION.telephone. The
// guard now asserts that wiring instead of a literal in AboutPage.tsx.
describe("AboutPage.tsx — NAP consistency (design.md §3.4)", () => {
  it("renders its JSON-LD via buildAboutSchema (single source of truth)", () => {
    const source = read(
      "features/landing/presentation/components/AboutPage.tsx",
    );
    expect(source).toMatch(/buildAboutSchema\(\)/);
    expect(source).not.toMatch(/\+34922123456/);
  });

  it("ORGANIZATION.telephone matches the canonical number used by llms.txt and SeoSchema.tsx", () => {
    expect(ORGANIZATION.telephone).toBe("+34 601 39 64 19");
  });
});

describe("WebMCP.ts — get_contact_info no longer returns the dead /contacto route (design.md §5/D12)", () => {
  // Scope note: design.md §5/D12 deferred the get_page_content_markdown enum
  // edit (removing /contacto, adding the live routes) to the
  // `agent-surface-drift` change — a schema change requiring markdown-
  // negotiation parity across 4 files, now implemented and guarded by
  // tests/unit/agentSurfaceParity.test.ts. This file's scope stays limited
  // to the 2 get_contact_info string literals (lines ~117/129) that
  // actively hand agents a dead URL — left unchanged here on purpose.
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
