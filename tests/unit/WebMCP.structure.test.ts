import fs from "node:fs";
import path from "node:path";

// PR8 scope: WebMCP.ts previously described "Digitaliza Tenerife's two
// solutions" and referenced a QRIBAR live-demo link inside the
// get_product_info / list_products tool copy. This regresses per the
// tpv-platform-modules capability (13 real modules now exist) and the
// chatbot-knowledge-base delta (no QRIBAR references in UI/tool copy).
const COMPONENT_PATH = path.resolve(__dirname, "../../src/WebMCP.ts");

describe("WebMCP tool descriptions (PR8 QRIBAR-free, platform-accurate copy)", () => {
  const source = fs.readFileSync(COMPONENT_PATH, "utf-8");

  it("has zero case-insensitive 'qribar' matches anywhere in the file", () => {
    expect(source).not.toMatch(/qribar/i);
  });

  it("no longer frames the platform as exactly 'two solutions'", () => {
    expect(source).not.toMatch(/two solutions/i);
  });

  it("still registers the four expected WebMCP tools", () => {
    expect(source).toMatch(/name: "get_product_info"/);
    expect(source).toMatch(/name: "get_contact_info"/);
    expect(source).toMatch(/name: "list_products"/);
    expect(source).toMatch(/name: "get_page_content_markdown"/);
  });
});

// seo-nap-eeat-fixes PR1: the description and office line must read the
// address from the organization constant instead of a hand-synced literal.
describe("WebMCP NAP consistency (seo-nap-eeat-fixes)", () => {
  const source = fs.readFileSync(COMPONENT_PATH, "utf-8");

  it("imports the organization constant", () => {
    expect(source).toMatch(
      /from\s+["']@shared\/config\/organization["']/,
    );
  });

  it("no longer hardcodes the legacy office location literal", () => {
    expect(source).not.toMatch(/office location in Santa Cruz de Tenerife/i);
    expect(source).not.toMatch(/Oficina: Santa Cruz de Tenerife, Islas Canarias, España/);
    expect(source).not.toMatch(/Office: Santa Cruz de Tenerife, Canary Islands, Spain/);
  });
});
