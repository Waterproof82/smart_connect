#!/usr/bin/env node
/**
 * Knowledge-base ingestion orchestrator (design.md rag-knowledge-base-refresh
 * D8-D15; spec `kb-ingestion`). Pure, injectable core (`runIngestion` +
 * exported helpers) plus a thin CLI entry at the bottom. Run via
 * `npm run ingest-kb`.
 *
 * Pipeline: extract (site `dist/` pages via `extractPageMarkdown`, FAQ
 * JSON-LD via `extractFaqJsonLd`, curated `content/knowledge-base/*.md`) →
 * chunk → TODO guard (hard invariant, D10) → hash (D12) → diff vs existing
 * `documents` rows → embed ONLY new hashes → `upsert_document` → fully
 * replace the keep-set and `delete_stale_documents`.
 *
 * `--dry-run` runs the whole pipeline except the network-writing steps
 * (fetchExistingHashes/embed/upsert/delete) and reports what WOULD happen.
 * `--purge-legacy` lists (and, only with `--confirm-purge`, deletes) rows
 * with `content_hash IS NULL` — see `scripts/kb/store.mjs` module doc for
 * why this is owner-gated and defaults to listing only.
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { extractPageMarkdown, extractFaqJsonLd } from "./markdown-extract.mjs";
import { chunkMarkdown } from "./kb/chunk.mjs";
import { parseCuratedFile } from "./kb/curated.mjs";
import { buildContractVersion, computeContentHash } from "./kb/hash.mjs";
import { buildSiteSource, buildFaqSource, buildCuratedSource, filterIngestableRoutes } from "./kb/sources.mjs";
import { embedAll } from "./kb/embed.mjs";
import { fetchExistingHashes, upsertDocument, deleteStaleDocuments, purgeLegacyRows } from "./kb/store.mjs";

const TODO_LEAK_RE = /TODO/;

/**
 * Hard invariant (design D10): re-checked here across ALL sources
 * (site/faq/curated) as a final safety net — broader than
 * `kb/curated.mjs`'s `containsTodoToken` (which only strips the
 * `TODO(owner)` convention tag per-section). Throws, never silently drops.
 * @param {{ source: string, content: string }[]} records
 */
export function assertNoTodoLeak(records) {
  const leaked = records.filter((r) => TODO_LEAK_RE.test(r.content));
  if (leaked.length > 0) {
    throw new Error(
      `ingest-knowledge-base: refusing to ingest ${leaked.length} chunk(s) still containing 'TODO' — sources: ${leaked
        .map((r) => r.source)
        .join(", ")}`,
    );
  }
}

/** @param {{ routes: {path: string}[], readDistHtml: (route: string) => Promise<string|null>, origin: string }} params */
export async function collectSiteChunks({ routes, readDistHtml, origin }) {
  const records = [];
  for (const route of filterIngestableRoutes(routes)) {
    const html = await readDistHtml(route.path);
    if (!html) continue;

    const { title, markdown } = extractPageMarkdown(html, { route: route.path, scope: "main" });
    const source = buildSiteSource(route.path);
    const url = `${origin}${route.path}`;
    for (const chunk of chunkMarkdown(markdown, { title })) {
      records.push({ source, url, lang: "es", section: chunk.section, content: chunk.content, title });
    }
  }
  return records;
}

/** @param {{ routes: {path: string}[], readDistHtml: (route: string) => Promise<string|null>, origin: string }} params */
export async function collectFaqChunks({ routes, readDistHtml, origin }) {
  const records = [];
  for (const route of filterIngestableRoutes(routes)) {
    const html = await readDistHtml(route.path);
    if (!html) continue;

    const source = buildFaqSource(route.path);
    const url = `${origin}${route.path}`;
    for (const faq of extractFaqJsonLd(html)) {
      records.push({
        source,
        url,
        lang: "es",
        section: faq.question,
        content: `Página: FAQ › ${faq.question}\n\n${faq.answer}`,
        title: "FAQ",
      });
    }
  }
  return records;
}

/** @param {{ files: { filePath: string, raw: string }[] }} params */
export function collectCuratedChunks({ files }) {
  const records = [];
  for (const file of files) {
    const parsed = parseCuratedFile(file.raw, { filePath: file.filePath });
    if (parsed.skip) continue;

    const source = buildCuratedSource(file.filePath);
    for (const chunk of chunkMarkdown(parsed.body, { title: parsed.title })) {
      records.push({
        source,
        url: parsed.url ?? null,
        lang: parsed.lang,
        section: chunk.section,
        content: chunk.content,
        title: parsed.title,
      });
    }
  }
  return records;
}

/**
 * @param {{ source: string, url: string|null, lang: string, section: string, content: string, title?: string }[]} records
 * @param {{ mode: "legacy"|"v2" }} params
 */
export function hashRecords(records, { mode }) {
  const contractVersion = buildContractVersion(mode);
  return records.map((record) => ({
    ...record,
    contractVersion,
    contentHash: computeContentHash({
      contractVersion,
      source: record.source,
      url: record.url ?? "",
      section: record.section,
      content: record.content,
    }),
  }));
}

/**
 * @param {ReturnType<typeof hashRecords>} hashedRecords
 * @param {string[]} existingHashes
 */
export function diffAgainstExisting(hashedRecords, existingHashes) {
  const existingSet = new Set(existingHashes);
  const newRecords = hashedRecords.filter((r) => !existingSet.has(r.contentHash));
  return {
    newRecords,
    keepHashes: hashedRecords.map((r) => r.contentHash),
    unchangedCount: hashedRecords.length - newRecords.length,
  };
}

function buildMetadata(record) {
  return { url: record.url ?? null, title: record.title ?? null, section: record.section, lang: record.lang, source: record.source };
}

/**
 * Runs the full ingestion pipeline. See module doc for the stage order.
 * All I/O is injected so this is unit-testable without real network/DB/fs.
 */
export async function runIngestion({
  env,
  dryRun = false,
  siteRoutesConfig,
  readDistHtml,
  curatedFiles,
  supabase,
  fetchFn,
  sleepFn = (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  log = () => {},
}) {
  const mode = env.EMBEDDING_MODE === "v2" ? "v2" : "legacy";
  const { origin, routes } = siteRoutesConfig;

  const siteRecords = await collectSiteChunks({ routes, readDistHtml, origin });
  const faqRecords = await collectFaqChunks({ routes, readDistHtml, origin });
  const curatedRecords = collectCuratedChunks({ files: curatedFiles });
  const allRecords = [...siteRecords, ...faqRecords, ...curatedRecords];

  assertNoTodoLeak(allRecords);

  if (allRecords.length === 0) {
    throw new Error(
      "ingest-knowledge-base: zero chunks produced — refusing to proceed (would call delete_stale_documents with an empty keep set)",
    );
  }

  const hashed = hashRecords(allRecords, { mode });

  if (dryRun) {
    log(`ingest-kb (dry-run): ${hashed.length} chunks extracted, mode=${mode}. No network calls made.`);
    return { dryRun: true, totalChunks: hashed.length, newCount: null, unchangedCount: null, deletedCount: 0, records: hashed };
  }

  const existingHashes = await fetchExistingHashes({ supabase });
  const { newRecords, keepHashes, unchangedCount } = diffAgainstExisting(hashed, existingHashes);

  log(`ingest-kb: ${hashed.length} chunks total, ${newRecords.length} new, ${unchangedCount} unchanged (mode=${mode}).`);

  let embeddedCount = 0;
  if (newRecords.length > 0) {
    const vectors = await embedAll({
      items: newRecords.map((r) => ({ text: r.content, title: r.title })),
      mode,
      role: "document",
      apiKey: env.GEMINI_API_KEY,
      fetchFn,
      sleepFn,
    });
    for (let i = 0; i < newRecords.length; i++) {
      await upsertDocument({
        supabase,
        content: newRecords[i].content,
        embedding: vectors[i],
        metadata: buildMetadata(newRecords[i]),
        source: newRecords[i].source,
        contentHash: newRecords[i].contentHash,
      });
      embeddedCount++;
    }
  }

  const deletedCount = await deleteStaleDocuments({ supabase, keepHashes });
  log(`ingest-kb: embedded ${embeddedCount} new chunk(s), deleted ${deletedCount} stale row(s).`);

  return { dryRun: false, totalChunks: hashed.length, newCount: newRecords.length, embeddedCount, unchangedCount, deletedCount };
}

// ============================================================
// CLI entry — real fs/env/fetch/Supabase wiring. Not covered by unit tests
// (those exercise runIngestion directly with injected fakes); this block
// only runs when the file is executed directly, e.g. `npm run ingest-kb`.
// ============================================================

async function main() {
  const { createClient } = await import("@supabase/supabase-js");
  const dotenv = await import("dotenv");

  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  dotenv.config({ path: path.join(__dirname, "../.env.local") });

  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const purgeLegacy = args.includes("--purge-legacy");
  const confirmPurge = args.includes("--confirm-purge");

  const env = {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    EMBEDDING_MODE: process.env.EMBEDDING_MODE,
  };

  const missing = Object.entries(env)
    .filter(([key, value]) => key !== "EMBEDDING_MODE" && !value)
    .map(([key]) => key);
  if (missing.length > 0) {
    console.error(`ingest-kb: missing required environment variable(s): ${missing.join(", ")}`);
    process.exit(1);
  }

  const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

  if (purgeLegacy) {
    const result = await purgeLegacyRows({ supabase, confirm: confirmPurge });
    console.log(`ingest-kb --purge-legacy: ${result.rows.length} content_hash-NULL row(s) found.`);
    for (const row of result.rows) console.log(`  - id=${row.id} source=${row.source}`);
    console.log(
      result.deleted
        ? `Deleted ${result.deletedCount} row(s) (--confirm-purge was set).`
        : "Dry-run only (pass --confirm-purge to actually delete). Review the rows above first — see scripts/kb/store.mjs doc.",
    );
    return;
  }

  const siteRoutesRaw = await readFile(path.join(__dirname, "site-routes.json"), "utf-8");
  const siteRoutesConfig = JSON.parse(siteRoutesRaw);

  const distDir = path.join(__dirname, "..", "dist");
  async function readDistHtml(routePath) {
    const file = routePath === "/" ? "index.html" : path.join(routePath.replace(/^\//, ""), "index.html");
    try {
      return await readFile(path.join(distDir, file), "utf-8");
    } catch {
      return null;
    }
  }

  const curatedDir = path.join(__dirname, "..", "content", "knowledge-base");
  let curatedFiles = [];
  try {
    const { readdir } = await import("node:fs/promises");
    const entries = await readdir(curatedDir);
    curatedFiles = await Promise.all(
      entries
        .filter((name) => name.endsWith(".md"))
        .map(async (name) => ({ filePath: name, raw: await readFile(path.join(curatedDir, name), "utf-8") })),
    );
  } catch {
    curatedFiles = [];
  }

  const result = await runIngestion({
    env,
    dryRun,
    siteRoutesConfig,
    readDistHtml,
    curatedFiles,
    supabase,
    fetchFn: fetch,
    log: console.log,
  });

  console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(err.message);
    process.exit(1);
  });
}
