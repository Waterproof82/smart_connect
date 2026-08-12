import fs from "node:fs";
import path from "node:path";

// PR8 scope: both llms.txt copies still pointed the Tap-to-Review NFC link
// at the retired /tap-review URL instead of the real /tarjetas-nfc route
// registered in PR3 (see design.md D5 and the PR3 apply-progress deviation
// #4 that originally flagged this). Also the service listing still framed
// the site as exactly "Carta Digital + NFC", predating the TPV platform
// (PR4-PR7).
const PUBLIC_LLMS = path.resolve(__dirname, "../../public/llms.txt");
const WELL_KNOWN_LLMS = path.resolve(
  __dirname,
  "../../public/.well-known/llms.txt",
);

describe("llms.txt (PR8 platform + route fix)", () => {
  it("public/llms.txt no longer links to the retired /tap-review URL", () => {
    const source = fs.readFileSync(PUBLIC_LLMS, "utf-8");
    expect(source).not.toMatch(/\/tap-review\b/);
    expect(source).toMatch(/\/tarjetas-nfc/);
  });

  it("public/.well-known/llms.txt no longer links to the retired /tap-review URL", () => {
    const source = fs.readFileSync(WELL_KNOWN_LLMS, "utf-8");
    expect(source).not.toMatch(/\/tap-review\b/);
    expect(source).toMatch(/\/tarjetas-nfc/);
  });

  it("public/llms.txt mentions the TPV platform, not just the two legacy solutions", () => {
    const source = fs.readFileSync(PUBLIC_LLMS, "utf-8");
    expect(source).toMatch(/TPV/);
  });
});
