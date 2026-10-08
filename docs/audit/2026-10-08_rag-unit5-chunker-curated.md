# Audit — RAG Knowledge-Base Refresh, Unit 5: Chunker + Curated Parser + Hashing

**Date:** 2026-10-08
**SDD change:** `rag-knowledge-base-refresh`
**Unit:** 5 of 8 (per tasks artifact `sdd/rag-knowledge-base-refresh/tasks`)
**Branch:** `feat/rag-unit5-chunker-curated` (from `feat/rag-unit4-markdown-extract` — sequential, consumes `extractPageMarkdown`'s `scope: "main"` output as input in the later orchestrator unit)
**Mode:** Strict TDD (RED → GREEN), run in an isolated git worktree in parallel with another agent implementing Unit 6 (schema migrations) in a separate worktree. No `supabase/migrations/` files touched. No database/network code in this unit.

## What changed

Four new pure, injectable `scripts/kb/*.mjs` modules (no `fs`/Deno/network
imports) for the knowledge-base ingestion pipeline. The orchestrator that
wires them together, reads files/routes from disk, embeds, and writes to the
database is Unit 7 — out of scope here.

### `scripts/kb/chunk.mjs` (design D11)
- `chunkMarkdown(markdown, { title })`:
  - Splits by `##`/`###` headings into one section per heading (content
    before the first heading is `"Introducción"`).
  - Merges any section whose content is under `MIN_CHUNK_CHARS` (80) into a
    neighbour — forward into the next section, or backward into the
    previous one if it's the last section.
  - Splits any section over `MAX_CHUNK_CHARS` (1200) by paragraph
    (`\n\n`-delimited), carrying the last `OVERLAP_CHARS` (150) characters
    of the previous part into the next part for retrieval continuity.
  - Drops any resulting chunk still under 80 chars (safety net for e.g. a
    single orphan section with no neighbour to merge into).
  - Prefixes every surviving chunk's `content` with
    `Página: {title} › {section}` so heading context travels with the text
    sent to the embedding model.

### `scripts/kb/curated.mjs` (design D9/D10)
- `parseFrontmatter(raw)`: minimal in-house `---\nkey: value\n---` parser
  (no `gray-matter` dependency — Project Standards: no new Node libs beyond
  what's already in the repo). Parses `true`/`false` and quoted strings.
- `parseCuratedFile(raw, { filePath })`:
  - `draft: true` in frontmatter → `{ skip: true, reason: "draft", body: "" }`,
    the whole file is excluded.
  - Otherwise, splits the body into heading sections (same `##`/`###`
    convention as `chunk.mjs`, independently implemented here so this module
    stays a self-contained unit with its own test coverage) and removes any
    section whose text contains the literal token `TODO(owner)`, returning
    the remaining body with headings intact and the removed headings in
    `excludedSections` for reporting (e.g. by `--dry-run` in Unit 7).
- `containsTodoToken(text)`: exported standalone so Unit 7's hard invariant
  check (design D10: "pipeline throws if any chunk to upsert matches
  `/TODO/`") can reuse the exact same, deliberately case-sensitive match —
  it matches only the parenthesised `TODO(owner)` tag, never the common
  Spanish word "todo" (e.g. "Todo lo que necesitas…", frequent marketing
  copy in this project).

### `scripts/kb/hash.mjs` (design D4/D12)
- `buildContractVersion(mode)` → `"gemini-embedding-001:<mode>:768"`,
  mirroring `supabase/functions/_shared/embedding.ts`'s `EMBEDDING_MODEL`
  (`"gemini-embedding-001"`) and `EMBEDDING_DIMENSIONS` (`768`) constants —
  duplicated as local constants here rather than imported, because this is
  a plain Node `.mjs` script and that file is a Deno-free *TypeScript*
  module consumed by `ts-jest`/the Edge runtime, not importable from Node
  without a build step (same reasoning as design D5's embed-parity test
  pattern).
- `computeContentHash({ contractVersion, source, url, section, content })`
  → sha256 hex digest (`node:crypto`) of
  `contractVersion\nsource\nurl\nsection\nnormalizedContent`, where
  `normalizedContent = content.trim()`. Changing any of the 5 inputs changes
  the hash; flipping `EMBEDDING_MODE` (legacy→v2) changes `contractVersion`
  and therefore forces a full re-embed instead of silently reusing stale
  vectors under an unchanged hash.

### `scripts/kb/sources.mjs` (design D9)
- `buildSiteSource`/`buildFaqSource`/`buildCuratedSource`: thin
  `site:`/`faq:`/`curated:` prefix builders.
- `filterIngestableRoutes(routes)`: excludes every route whose `path`
  starts with `/legal/` — legal pages are redirected to by the chatbot
  prompt's rules (Unit 2), never answered from retrieved KB text.

## Why

Spec `sdd/rag-knowledge-base-refresh/spec` (PR2, "Chunking and Metadata
Contract" + "Curated Content Integrity") and design D9-D12 require: a
heading-aware chunker so chunks carry retrieval-friendly context; a
curated-file parser that is fail-closed on unconfirmed facts (never let an
owner-pending `TODO(owner)` price/timeline reach the `documents` table); and
a content-hash scheme that makes re-ingestion idempotent and ties cleanly to
the embedding contract so a mode flip forces re-embedding instead of a
silent mismatch.

## TDD evidence

All four modules were implemented strictly RED → GREEN, confirming RED via
`npx jest <file>.test.ts` showing `Cannot find module` before writing any
implementation code.

| # | Module | Tests | RED confirmed | GREEN |
|---|---|---|---|---|
| 1 | `chunk.mjs` | 4 (heading split+prefix, short-section merge, long-section split+overlap, single-orphan drop) | 4/4 failed, `ERR_MODULE_NOT_FOUND` | 4/4 passed on first implementation |
| 2 | `curated.mjs` | 6 (frontmatter parse, `draft:true` skip, TODO-section exclusion+report, no-TODO passthrough, `containsTodoToken` positive, `containsTodoToken` false-positive guard against "todo") | 6/6 failed, `ERR_MODULE_NOT_FOUND` | 6/6 passed on first implementation |
| 3 | `hash.mjs` | 6 (contract version format ×2 modes, determinism, mode-change sensitivity, content/section/source/url sensitivity ×4 variants, whitespace normalization) | 6/6 failed, `ERR_MODULE_NOT_FOUND` | 6/6 passed on first implementation |
| 4 | `sources.mjs` | 5 (3 source-tag builders, `/legal/*` exclusion, non-`/legal/` passthrough incl. nested paths) | 5/5 failed, `ERR_MODULE_NOT_FOUND` | 5/5 passed on first implementation |

No refactor cycle was needed — each module's test suite passed on the first
implementation attempt. Tests follow the repo's established Node-subprocess
convention for plain-ESM `.mjs` scripts (ts-jest cannot `import()` a `.mjs`
directly from a `.test.ts` file) — see `tests/unit/scripts/markdownExtract.test.ts`
and `tests/unit/scripts/lastmod.test.ts` for the established pattern this
unit's 4 new test files (`kbChunk.test.ts`, `kbCurated.test.ts`,
`kbHash.test.ts`, `kbSources.test.ts`) follow exactly.

## Full verification

- `npx jest kbChunk.test.ts kbCurated.test.ts kbHash.test.ts kbSources.test.ts` → 21/21 passed.
- `npx jest` (full suite) → 131 of 134 suites, 1555 passed, 0 failed, 66 skipped (pre-existing/environment-gated skips, e.g. network-gated e2e tests — unrelated to this unit; confirmed no new failures).
- `npx jest src/__tests__/brand.guard.test.ts` → 3/3 passed (new `scripts/kb/*.mjs` files and comments were written avoiding the brand/product-name tokens the guard scans `scripts/` for, learned the hard way in Unit 4's audit).
- `npx tsc --noEmit` → clean.
- `npm run lint` → clean (`--ext ts,tsx`; `.mjs` scripts are not linted by this command, consistent with every other `scripts/*.mjs` file in the repo).

## Scope boundary (explicitly NOT touched in this unit)

- No database code: no migrations, no RPC calls, no Supabase client usage.
  `supabase/migrations/` was not touched (Unit 6, implemented concurrently
  by another agent in a separate worktree).
- No orchestrator: `scripts/ingest-knowledge-base.mjs`, `scripts/kb/embed.mjs`
  and `scripts/kb/store.mjs` (Unit 7) do not exist yet — nothing in this
  unit reads `content/knowledge-base/*.md`, `scripts/site-routes.json`, or
  the built `dist/` from disk; nothing calls Gemini's `batchEmbedContents`.
- No `content/knowledge-base/*.md` curated files authored yet — that's
  Unit 8, which needs the ingestion pipeline (Unit 7) to exist first.
- The design D10 "hard invariant: pipeline throws if any chunk to upsert
  matches `/TODO/`" is a pipeline-level (Unit 7) responsibility; this unit
  only exports the reusable `containsTodoToken()` predicate the orchestrator
  will call on the final combined chunk set before upsert.

## Owner action required

None. This unit only adds new files under `scripts/kb/` plus tests and
docs — no new environment variable, no deploy step, no database change, and
nothing wired to any running code path yet.
