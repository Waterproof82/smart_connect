import fs from "node:fs";
import path from "node:path";

// PR8 scope: the RAG seed/maintenance scripts under scripts/ are source
// code (not Supabase `documents` table content) and were explicitly
// confirmed in-scope for QRIBAR/SmartConnect cleanup. This test does NOT
// run any script or touch the database — the `documents` table itself
// stays untouched; the user re-indexes manually via the admin panel.
const SCRIPTS_DIR = path.resolve(__dirname, "../../scripts");

function readScript(name: string): string {
  return fs.readFileSync(path.join(SCRIPTS_DIR, name), "utf-8");
}

describe("scripts/ source cleanup (PR8)", () => {
  it("populate-knowledge-base.mjs has zero 'qribar' matches", () => {
    expect(readScript("populate-knowledge-base.mjs")).not.toMatch(/qribar/i);
  });

  it("populate-knowledge-base.mjs has zero 'SmartConnect' matches", () => {
    expect(readScript("populate-knowledge-base.mjs")).not.toMatch(
      /smart[- ]?connect/i,
    );
  });

  it("check-documents.mjs has zero 'qribar' matches", () => {
    expect(readScript("check-documents.mjs")).not.toMatch(/qribar/i);
  });

  it("deploy-edge-functions.ps1 has zero 'SmartConnect' matches", () => {
    expect(readScript("deploy-edge-functions.ps1")).not.toMatch(
      /smart[- ]?connect/i,
    );
  });
});
