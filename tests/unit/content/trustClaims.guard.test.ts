import fs from "node:fs";
import path from "node:path";

/**
 * Trust-claims guard (seo-trust-claims-cleanup, trust-claims spec).
 *
 * PR2a scope: home-scoped assertions only (Carta Digital reviews, stat
 * strip, FAQ, nav). NFC-scoped assertions (Tapstar, TrustBadges/TrustFacts,
 * CTASection, HowItWorks, hero feature) are added in PR2b (tasks.md 2b.11)
 * so a still-red NFC-scoped assertion never lands on this branch.
 */

const ROOT = path.resolve(__dirname, "../../../");
const SRC_DIR = path.join(ROOT, "src");
const PUBLIC_DIR = path.join(ROOT, "public");
const LANGUAGE_CONTEXT_PATH = path.join(
  SRC_DIR,
  "shared/context/LanguageContext.tsx",
);

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

const UNSOURCED_CLAIMS = [
  "Decenas",
  "Hasta 6×",
  "Hasta 45%",
  "Hasta 40%",
  "★★★★★",
  "×6 en 90 días",
  "6x in 90 days",
  "Contactá",
];

describe("trust-claims guard — home scope (PR2a)", () => {
  const files = [...walk(SRC_DIR), ...walk(PUBLIC_DIR)];

  it.each(UNSOURCED_CLAIMS)(
    "no file in src/ or public/ contains %j",
    (claim) => {
      const offenders = files
        .filter((file) => fs.readFileSync(file, "utf-8").includes(claim))
        .map(toRelative);
      expect(offenders).toEqual([]);
    },
  );

  it("LanguageContext.tsx no longer declares successStat1Value…successStat4Author keys", () => {
    const source = fs.readFileSync(LANGUAGE_CONTEXT_PATH, "utf-8");
    const removedKeys = [
      "successStat1Value",
      "successStat1Label",
      "successStat1Quote",
      "successStat1Author",
      "successStat2Label",
      "successStat2Quote",
      "successStat2Author",
      "successStat3Label",
      "successStat3Quote",
      "successStat3Author",
      "successStat4Label",
      "successStat4Quote",
      "successStat4Author",
      "successTitle",
      "successSubtitle",
      "successDesc",
    ];
    for (const key of removedKeys) {
      expect(source).not.toMatch(new RegExp(`\\b${key}\\b`));
    }
  });
});
