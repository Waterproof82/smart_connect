# 2026-10-08 — RAG knowledge-base refresh, Unit 7: ingestion orchestrator

SDD change `rag-knowledge-base-refresh`, Unit 7 of 8 (spec `kb-ingestion`;
design D5, D8-D15). Builds on Units 4 (markdown extraction), 5 (chunker,
curated parser, hashing) and 6 (schema migrations, already applied to
production — see `docs/audit/2026-10-08_rag-unit6-migrations.md`), merged in
branch `feat/rag-units-4-6-integration`.

## What changed

New files:

- `scripts/kb/embed.mjs` — document-side embedding. `EMBED_MODEL`/
  `EMBED_DIMENSIONS` mirror (parity-tested against)
  `supabase/functions/_shared/embedding.ts`'s `EMBEDDING_MODEL`/
  `EMBEDDING_DIMENSIONS`. `embedAll()` batches up to 50 items per
  `batchEmbedContents` call, sleeps 1s between batches (not after the
  last), retries 429/5xx up to 3 tries honoring `Retry-After` when present,
  and defensively slices every returned vector to 768 dimensions.
- `scripts/kb/store.mjs` — thin wrapper around the Unit 6 RPCs
  (`upsert_document`, `delete_stale_documents`) plus `fetchExistingHashes`
  (reads all non-null `content_hash` rows, filters client-side to
  `source ~ ^(site|faq|curated):` so admin rows are never treated as
  ingestion-managed) and `listLegacyRows`/`purgeLegacyRows` (see "Production
  safety" below).
- `scripts/ingest-knowledge-base.mjs` — the orchestrator. Pure, injectable
  core (`runIngestion` + exported helpers: `collectSiteChunks`,
  `collectFaqChunks`, `collectCuratedChunks`, `assertNoTodoLeak`,
  `hashRecords`, `diffAgainstExisting`) plus a thin CLI entry
  (`npm run ingest-kb`) that wires real `fs`/`dotenv`/`@supabase/supabase-js`/
  `fetch`.
- `tests/unit/scripts/kbEmbed.test.ts` (9 tests), `kbStore.test.ts` (10
  tests), `ingestKnowledgeBase.test.ts` (10 tests) — 29 new tests, all
  RED-confirmed (`ERR_MODULE_NOT_FOUND`) before implementation, all GREEN on
  first implementation, no refactor cycle needed.

Modified:

- `package.json` — added `"ingest-kb": "node scripts/ingest-knowledge-base.mjs"`.
- `tests/unit/scripts.structure.test.ts` — removed the 2 brand-guard
  assertions against the now-deleted `populate-knowledge-base.mjs`
  (`check-documents.mjs`/`deploy-edge-functions.ps1` assertions untouched).
- `CHANGELOG.md` — `[Unreleased] / Added` entry.

Deleted:

- `scripts/populate-knowledge-base.mjs`, `scripts/clean-knowledge-base.mjs`
  — the old truncate-and-reinsert seed/clean pair, superseded by the
  idempotent upsert/stale-delete pipeline above.

## Pipeline order

`extract (dist/ pages scope "main" + FAQ JSON-LD + content/knowledge-base/*.md)`
→ `chunk` (heading-aware, `scripts/kb/chunk.mjs`) → `assertNoTodoLeak` (hard
invariant, see below) → `hash` (`contentHash = sha256(contractVersion,
source, url, section, content)`) → `diff` against existing `content_hash`
rows → `embed` ONLY new hashes → `upsert_document` per new row →
`delete_stale_documents(keepHashes)` (all current hashes, so unchanged rows
are kept and anything no longer produced is removed).

## TODO double-guard (design D10)

Two independent layers, deliberately not merged into one:

1. `scripts/kb/curated.mjs`'s `containsTodoToken` — exact match on the
   convention tag `TODO(owner)` only, applied per-section while parsing a
   curated file. Does **not** match the Spanish word "todo" (e.g. "Todo lo
   que necesitas…" in real marketing copy), which a naive case-insensitive
   match would have false-positived on.
2. `scripts/ingest-knowledge-base.mjs`'s `assertNoTodoLeak` — a broader,
   final safety net over **every** chunk from **all three** sources
   (site/faq/curated), matching the literal substring `TODO` anywhere.
   Throws and aborts the whole run rather than silently dropping a chunk —
   if this ever fires, it means something upstream (a new site page, a
   curated file bypassing the parser) leaked a TODO marker that layer 1
   didn't catch, and that is a hard stop, not a warning.

## Production safety: `--purge-legacy` is list-only by default

Design D15 originally said `--purge-legacy` deletes `content_hash IS NULL`
rows. As of 2026-10-08, production's `documents` table has exactly 3 such
rows — real, owner-authored content (`source` = 'Carta Digital', 'Páginas
web', 'nfc') — not leftover rows from an old ingestion run. `purgeLegacyRows`
therefore:

- always lists these rows (`listLegacyRows`) regardless of flags;
- only deletes when the caller explicitly passes `confirm: true` (CLI:
  `--purge-legacy --confirm-purge`);
- normal ingestion (`delete_stale_documents`) can never touch them anyway —
  that RPC is scoped to `source ~ '^(site|faq|curated):'` and these 3 rows'
  sources don't match that prefix.

The owner must review the CLI's printed row list before ever adding
`--confirm-purge`.

## Dry-run contract

`--dry-run` runs extraction → chunking → the TODO guard → hashing, then
returns immediately — `fetchExistingHashes`, `embedAll`, `upsertDocument`
and `deleteStaleDocuments` are never called (no `supabase`/`fetch` I/O at
all). Covered by a dedicated test asserting the injected `supabase`/`fetch`
fakes are never invoked.

## Empty-keep-set guard

If extraction yields zero chunks across all three sources (e.g. `dist/`
wasn't built, or every curated file is `draft: true`), `runIngestion` throws
before doing anything else — this is the same invariant
`delete_stale_documents` enforces server-side (refuses an empty
`p_keep_hashes`), surfaced client-side with a clearer message.

## Testing

- All 29 new tests pass as described above (subprocess convention — a real
  `node --input-type=module -e <script>` child process per assertion, same
  pattern as `tests/unit/scripts/kbHash.test.ts` — ts-jest cannot `import()`
  a `.mjs` directly).
- The parity test (`kbEmbed.test.ts`) imports
  `supabase/functions/_shared/embedding.ts` directly via ts-jest (same file
  both `_shared/embedding.test.ts` and this suite exercise) and compares its
  `EMBEDDING_MODEL`/`EMBEDDING_DIMENSIONS` against `scripts/kb/embed.mjs`'s
  `EMBED_MODEL`/`EMBED_DIMENSIONS` read out of a subprocess.
- The "run twice" integration scenario (spec `kb-ingestion`, "Running
  ingestion twice") uses an in-memory fake Supabase client (a `Map` keyed by
  `content_hash`, implementing only the `.from()/.rpc()` shape this module
  actually calls) and a fake `fetchFn` that returns deterministic
  768-length vectors — asserts the second run embeds 0 new chunks and the
  final row count is identical to the first run; a second scenario asserts
  a route removed between runs gets its rows deleted via
  `delete_stale_documents`.
- Full `npx jest` → 135/138 suites passed, 1601/1667 tests passed, 66
  skipped (pre-existing/environment-gated, unrelated), 0 failed.
- `npx tsc --noEmit` and `npm run lint` both clean.
- `npx jest src/__tests__/brand.guard.test.ts tests/unit/scripts.structure.test.ts tests/unit/kbSchemaMigration.structure.test.ts`
  → 22/22 passed (brand guard scans `scripts/` including the 3 new `.mjs`
  files and their comments).

## Owner rollout (none of this run's steps execute network/DB calls)

This branch does not deploy, migrate, or run ingestion against production.
When the owner is ready (after Unit 8's curated content + eval set land),
the full sequence is:

```bash
# 1. Build the site so dist/ has the pages to extract
npm run build

# 2. Dry run — review chunk counts and the TODO-exclusion report, no network writes
npm run ingest-kb -- --dry-run

# 3. Real run (uses EMBEDDING_MODE from env; defaults to legacy if unset)
npm run ingest-kb

# 4. Flip the query-side flag only AFTER a successful v2 ingest
#    (set EMBEDDING_MODE=v2 as a Supabase secret for chat-with-rag + gemini-embedding, redeploy)

# 5. Run the eval set (Unit 8) against the deployed chatbot

# 6. Only after eval passes, review legacy rows and optionally purge:
npm run ingest-kb -- --purge-legacy            # list only
npm run ingest-kb -- --purge-legacy --confirm-purge   # actually delete (owner-reviewed)
```

Rollback: set `EMBEDDING_MODE=legacy` (or unset) and redeploy
`chat-with-rag`/`gemini-embedding`; restore `documents` from
`kb_backup.documents_20261008` if a bad ingest needs to be undone (snapshot
taken by Unit 6's first migration, before this run touches anything).

## Branch

`feat/rag-unit7-ingest`, based on `feat/rag-units-4-6-integration` (which
already merges Units 4, 5 and 6). Not pushed, not merged, not run against
production. No `npm run build` was run in this session (per instruction).

## Production rollout — 2026-10-08

1. Build + dry-run (fake credentials, invalid URL, zero network writes): 103 chunks.
   - Breakdown: site 69, FAQ JSON-LD 21, curated 13.
   - Scan results: the only price is NFC 15–35 €; 0 old-brand hits; 0 `TODO(owner)`; no legal pages.
2. First real run (`EMBEDDING_MODE=v2`) aborted on the first upsert, with nothing written: `column "updated_at" of relation "documents" does not exist`.
   - Cause: `upsert_document` writes `updated_at`, but production never had that column. It existed only in an old repo migration that was never applied remotely.
   - Fix: additive migration `20261008075727_add_documents_updated_at.sql`, with a structure test written first.
3. Second real run: 103 chunks embedded (v2) and upserted, 0 stale rows deleted. The 3 manual rows were untouched.
4. `supabase secrets set EMBEDDING_MODE=v2` (takes effect without a redeploy).
5. `npm run eval-kb`: 22/22 passed (16 ES + 6 EN), 100%; latency p95 4473 ms.
   - The runner previously signed in anonymously. That fails in production because anonymous sign-ins are disabled, and `chat-with-rag` accepts the publishable key alone, as the public widget does. The runner now calls it the same way.

Rollback: `supabase secrets set EMBEDDING_MODE=legacy`, then restore `documents` from `kb_backup.documents_20261008`.
