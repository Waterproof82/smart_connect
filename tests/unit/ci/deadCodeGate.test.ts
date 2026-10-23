import fs from "node:fs";
import path from "node:path";

// sdd/code-unused-exports-cleanup: guards the knip-based dead-code gate.
// Ensures knip is pinned exact, the script exists, knip.json keeps the
// known-safe ignore/entry sets, and the CI workflow runs the gate right
// after type-check (narrow in PR1-2, full --include-less in PR3).
const ROOT = path.resolve(__dirname, "../../..");

function readJson(relPath: string): Record<string, unknown> {
  const raw = fs.readFileSync(path.join(ROOT, relPath), "utf-8");
  return JSON.parse(raw) as Record<string, unknown>;
}

function readFile(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf-8");
}

describe("Dead code gate (knip)", () => {
  it("pins devDependencies.knip to an exact version (no ^ or ~)", () => {
    const pkg = readJson("package.json");
    const devDeps = pkg.devDependencies as Record<string, string>;

    expect(devDeps.knip).toBeDefined();
    expect(devDeps.knip).toMatch(/^\d/);
  });

  it("declares a knip script", () => {
    const pkg = readJson("package.json");
    const scripts = pkg.scripts as Record<string, string>;

    expect(scripts.knip).toBe("knip");
  });

  it("knip.json ignores supabase/functions/**", () => {
    const knipConfig = readJson("knip.json");
    const ignore = knipConfig.ignore as string[];

    expect(ignore).toContain("supabase/functions/**");
  });

  it("knip.json entry includes entry-server and middleware", () => {
    const knipConfig = readJson("knip.json");
    const entry = knipConfig.entry as string[];

    expect(entry.some((e) => e.includes("entry-server"))).toBe(true);
    expect(entry.some((e) => e.includes("middleware"))).toBe(true);
  });

  it("CI workflow runs the dead code (knip) step after type-check", () => {
    const workflow = readFile(".github/workflows/ci-cd.yml");
    const knipIndex = workflow.indexOf("npm run knip");
    const typeCheckIndex = workflow.indexOf("npm run type-check");

    expect(knipIndex).toBeGreaterThan(-1);
    expect(typeCheckIndex).toBeGreaterThan(-1);
    expect(knipIndex).toBeGreaterThan(typeCheckIndex);
  });
});
