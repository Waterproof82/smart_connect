import fs from "node:fs";
import path from "node:path";

/**
 * Guard for the NAP (Name/Address/Phone) fix in seo-nap-eeat-fixes PR1:
 * the legacy address ("38001" postal code, "Puerta 501" door-number
 * suffix) must never reappear in production source or public files.
 *
 * Test files are excluded: this guard scans the surfaces that ship to
 * users/crawlers, not specs that legitimately assert the strings' absence
 * (e.g. `expect(screen.queryByText(/Puerta/)).not.toBeInTheDocument()`).
 */

const ROOT = path.resolve(__dirname, "../../");
const SCAN_DIRS = ["src", "public"];
const FORBIDDEN = ["38001", "Puerta"];

const IGNORED_DIR_NAMES = new Set(["node_modules", "__tests__", "coverage"]);
const TEST_FILE_RE = /\.(test|spec)\.[tj]sx?$/;

function collectFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    if (IGNORED_DIR_NAMES.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(fullPath));
    } else if (!TEST_FILE_RE.test(entry.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

describe("NAP consistency guard — no stale address anywhere (seo-nap-eeat-fixes)", () => {
  it("src/ and public/ contain zero occurrences of the legacy postal code or door-number suffix", () => {
    const violations: string[] = [];

    for (const dirName of SCAN_DIRS) {
      const dir = path.join(ROOT, dirName);
      for (const file of collectFiles(dir)) {
        const content = fs.readFileSync(file, "utf-8");
        for (const forbidden of FORBIDDEN) {
          if (content.includes(forbidden)) {
            violations.push(`${path.relative(ROOT, file)}: "${forbidden}"`);
          }
        }
      }
    }

    expect(violations).toEqual([]);
  });
});
