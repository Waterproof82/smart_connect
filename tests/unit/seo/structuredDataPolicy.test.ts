import fs from "node:fs";
import path from "node:path";
import * as SeoSchema from "@shared/presentation/components/SeoSchema";

/**
 * Structured Data Policy guard (seo-trust-claims-cleanup, PR1).
 *
 * Google treats self-serving `Review`/`AggregateRating` markup as spam, and
 * `HowTo` rich results are retired. This guard asserts both schema builders
 * are gone from `SeoSchema.tsx` and that no `"@type":"Review"` /
 * `"@type":"HowTo*"` literal survives anywhere in `src/`.
 */

const ROOT = path.resolve(__dirname, "../../../");
const SRC_DIR = path.join(ROOT, "src");

function walk(dir: string, files: string[] = []): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
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

const TYPE_LITERAL = /["']@type["']\s*:\s*["'](Review|HowTo\w*)["']/g;

describe("structured data policy", () => {
  it("SeoSchema module exports no ReviewSchema or HowToSchema", () => {
    expect((SeoSchema as Record<string, unknown>).ReviewSchema).toBeUndefined();
    expect((SeoSchema as Record<string, unknown>).HowToSchema).toBeUndefined();
  });

  it("has no Review or HowTo @type literal anywhere in src/", () => {
    const offenders: { file: string; line: number; text: string }[] = [];

    for (const file of walk(SRC_DIR)) {
      const relative = toRelative(file);
      const content = fs.readFileSync(file, "utf-8");
      const lines = content.split("\n");
      lines.forEach((lineText, index) => {
        if (TYPE_LITERAL.test(lineText)) {
          offenders.push({ file: relative, line: index + 1, text: lineText.trim() });
        }
        TYPE_LITERAL.lastIndex = 0;
      });
    }

    expect(offenders).toEqual([]);
  });
});
