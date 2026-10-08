import fs from "node:fs";
import path from "node:path";

/**
 * Spanish-from-Spain and ordering-channel regression gate.
 *
 * The business and its customers are in Tenerife, so every Spanish string
 * must use tuteo (tú/vosotros), never voseo. The chatbot also ingests the
 * site copy, so voseo here would leak into its answers.
 *
 * Digital-menu orders arrive through Telegram (owner-confirmed 2026-10-08),
 * never WhatsApp; WhatsApp is only a contact channel.
 *
 * Walks src/, public/ and scripts/ (tests excluded) in the same way as
 * brand.guard.test.ts.
 */

const ROOT = path.resolve(__dirname, "..", "..");
const SCAN_DIRS = ["src", "public", "scripts"];
const EXTENSIONS = new Set([".ts", ".tsx", ".js", ".mjs", ".json", ".txt", ".md", ".html"]);

// The eval set lists voseo forms on purpose, as forbidden answer terms.
const EXCLUDED_FILES = new Set(["scripts/kb/eval-set.json"]);

// Explicit voseo verb forms (present tense and imperatives). An explicit list
// avoids false positives on normal words ending in -ás/-és/-ís (más, inglés, país).
// Unicode-aware boundaries: JS `\b` treats accented letters as non-word
// characters, so `\belegí\b` would never match "Elegí".
const VOSEO = new RegExp(
  "(?<![\\p{L}-])(" +
    [
      "vos", "sos", "querés", "podés", "tenés", "sabés", "hacés", "decís", "venís",
      "necesitás", "pagás", "confirmás", "elegí", "publicá", "marcá", "recuperá",
      "contactanos", "escribinos", "contanos", "llamanos", "seguinos", "pedinos",
      "olvidate", "sumate", "registrate", "fijate",
    ].join("|") +
    ")(?![\\p{L}-])",
  "iu",
);

// Matches the claim that digital-menu orders arrive by WhatsApp, in ES or EN.
const WHATSAPP_ORDERS = /pedidos (por|vía|via) whatsapp|whatsapp orders|orders (via|by|through) whatsapp/i;

function walk(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "__tests__" || entry.name === "node_modules") continue;
      walk(full, out);
    } else if (EXTENSIONS.has(path.extname(entry.name)) && !/\.test\./.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

function findMatches(pattern: RegExp): string[] {
  const hits: string[] = [];
  for (const dir of SCAN_DIRS) {
    for (const file of walk(path.join(ROOT, dir))) {
      if (EXCLUDED_FILES.has(path.relative(ROOT, file).replace(/\\/g, "/"))) continue;
      fs.readFileSync(file, "utf-8")
        .split("\n")
        .forEach((line, i) => {
          if (pattern.test(line)) {
            hits.push(`${path.relative(ROOT, file).replace(/\\/g, "/")}:${i + 1}: ${line.trim().slice(0, 120)}`);
          }
        });
    }
  }
  return hits;
}

describe("Spanish locale guard", () => {
  it("contains no voseo forms in Spanish copy (Spanish from Spain only)", () => {
    expect(findMatches(VOSEO)).toEqual([]);
  });

  it("never claims digital-menu orders arrive by WhatsApp (they arrive by Telegram)", () => {
    expect(findMatches(WHATSAPP_ORDERS)).toEqual([]);
  });
});
