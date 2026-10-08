import fs from "node:fs";
import path from "node:path";

// sdd/project-dead-code-cleanup: guards against test suites that are never
// executed by either runner. Jest only matches `**/tests/**/*.test.ts` and
// `**/?(*.)+(spec|test).ts` (see jest.config.js) — it never picks up
// `.test.tsx` files. Vitest (vite.config.ts `test.include`) only matches
// `.test.tsx` files living under specific `src/` globs. A `.test.tsx` file
// outside `src/` falls through both runners and never runs anywhere.
const ROOT = path.resolve(__dirname, "../../..");
const EXCLUDED_DIRS = new Set(["node_modules", "dist", ".git"]);

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (EXCLUDED_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, acc);
    } else {
      acc.push(full);
    }
  }
  return acc;
}

describe("CI test runner coverage guard", () => {
  it("has no *.test.tsx file outside src/", () => {
    const allFiles = walk(ROOT);
    const srcDir = path.join(ROOT, "src") + path.sep;
    const orphanTsxTests = allFiles.filter(
      (f) => f.endsWith(".test.tsx") && !f.startsWith(srcDir),
    );

    expect(orphanTsxTests).toEqual([]);
  });

  it("vite.config.ts declares the src/**/*.test.tsx include glob", () => {
    const viteConfig = fs.readFileSync(
      path.join(ROOT, "vite.config.ts"),
      "utf-8",
    );

    expect(viteConfig).toContain("src/**/*.test.tsx");
  });

  it("CI workflow runs vitest (jsdom .tsx suites)", () => {
    const workflow = fs.readFileSync(
      path.join(ROOT, ".github/workflows/ci-cd.yml"),
      "utf-8",
    );

    expect(workflow).toContain("npx vitest run");
  });
});
