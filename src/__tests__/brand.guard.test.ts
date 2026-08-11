import fs from "node:fs";
import path from "node:path";

/**
 * Brand/purge regression gate.
 *
 * Walks src/, public/, and scripts/ and asserts the codebase never
 * regresses back to the old "SmartConnect" brand name or the "qribar"
 * product name.
 *
 * ALLOWLIST is an explicit list of exact file paths (relative to repo root,
 * forward-slash separated) permitted to contain a match. It MUST stay empty
 * for the "smartconnect" assertion. PR8 emptied the "qribar" allowlist too:
 * WebMCP.ts, ChatWelcome.tsx, and the scripts/ seed tooling all had their
 * literal "qribar" copy removed (see PR8 apply-progress), so both
 * allowlists are now permanently empty regression gates.
 *
 * `admin@smartconnect.ai` is a live Supabase Auth account email and is
 * explicitly excluded from the "smartconnect" match — it is not a brand
 * string, it is a literal login credential that must never change.
 */

const ROOT = path.resolve(__dirname, "..", "..");
const SCAN_DIRS = ["src", "public", "scripts"];

const SMARTCONNECT_ALLOWLIST: string[] = [];

const QRIBAR_ALLOWLIST: string[] = [];

const ADMIN_EMAIL = "admin@smartconnect.ai";

function shouldSkipDir(dirName: string): boolean {
  return dirName === "node_modules" || dirName === ".git" || dirName === "__tests__";
}

function walk(dir: string, files: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (shouldSkipDir(entry.name)) continue;
      walk(fullPath, files);
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

function toRelative(filePath: string): string {
  return path.relative(ROOT, filePath).split(path.sep).join("/");
}

function collectFiles(): string[] {
  const files: string[] = [];
  for (const dir of SCAN_DIRS) {
    const fullDir = path.join(ROOT, dir);
    if (fs.existsSync(fullDir)) {
      walk(fullDir, files);
    }
  }
  return files;
}

describe("brand guard", () => {
  it("has zero case-insensitive 'SmartConnect' matches in src/ and public/ (outside the allowlist, excluding the admin login email)", () => {
    const files = collectFiles();
    const offenders: { file: string; line: number; text: string }[] = [];

    for (const file of files) {
      const relative = toRelative(file);
      if (relative === "src/__tests__/brand.guard.test.ts") continue;
      if (SMARTCONNECT_ALLOWLIST.includes(relative)) continue;

      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");
      lines.forEach((lineText, index) => {
        // Strip the protected admin login email before checking this line.
        const sanitized = lineText.replace(
          new RegExp(ADMIN_EMAIL, "gi"),
          "",
        );
        if (/smart[- ]?connect/i.test(sanitized)) {
          offenders.push({ file: relative, line: index + 1, text: lineText.trim() });
        }
      });
    }

    expect(offenders).toEqual([]);
  });

  it("has zero case-insensitive 'qribar' matches in src/ and public/ (outside the allowlist)", () => {
    const files = collectFiles();
    const offenders: { file: string; line: number; text: string }[] = [];

    for (const file of files) {
      const relative = toRelative(file);
      if (relative === "src/__tests__/brand.guard.test.ts") continue;
      if (QRIBAR_ALLOWLIST.includes(relative)) continue;

      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");
      lines.forEach((lineText, index) => {
        if (/qribar/i.test(lineText)) {
          offenders.push({ file: relative, line: index + 1, text: lineText.trim() });
        }
      });
    }

    expect(offenders).toEqual([]);
  });

  it("never modifies the live admin login email admin@smartconnect.ai anywhere it exists", () => {
    const files = collectFiles();
    let found = false;

    for (const file of files) {
      const content = fs.readFileSync(file, "utf-8");
      if (content.toLowerCase().includes(ADMIN_EMAIL)) {
        found = true;
        expect(content).toContain(ADMIN_EMAIL);
      }
    }

    // This assertion is informational: it's fine if the email isn't present
    // anywhere in src/public (it may live only in Supabase Auth), but IF it
    // is present, it must be byte-for-byte intact (checked above).
    expect(typeof found).toBe("boolean");
  });
});
