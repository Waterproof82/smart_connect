# 2026-10-08 — RAG Knowledge-Base Refresh, Unit 8 (final): Curated Content, Eval Set, Docs

**SDD change**: `rag-knowledge-base-refresh` — Unit 8 of 8 (last unit). Branch `feat/rag-unit8-curated-eval`, off `feat/rag-unit7-ingest`.

## What was done

1. **Curated knowledge-base content** — `content/knowledge-base/{servicios-web,carta-digital,preguntas-clave}.md`. Frontmatter `title`/`lang`/`url?`. Every fact is owner-confirmed (per the 2026-10-07 business-facts brief); anything not yet confirmed is fenced under a dedicated `## ... TODO(owner)` heading so `scripts/kb/curated.mjs`'s per-section exclusion drops it before it ever reaches `documents`.
2. **Grounded-answer eval set** — `scripts/kb/eval-set.json`: 16 Spanish + 6 English questions (spec requires ≥15/≥5), each with `mustInclude` (plain string = must appear; array = OR-group, at least one must appear) and `mustNotInclude` (must never appear) criteria.
3. **Eval runner** — `scripts/kb/evalCriteria.mjs` (pure: `checkCriteria`, `summarizeResults`, `percentile`) + `scripts/eval-knowledge-base.mjs` (`runEval` pure injectable core + thin CLI, `npm run eval-kb`).
4. **Docs** — `docs/CHATBOT_RAG_ARCHITECTURE.md` and `docs/GUIA_IMPLEMENTACION_RAG.md` both gained a prominent "current architecture" section superseding their stale `gemini-2.5-flash`/`gemini-generate`/Admin-Panel-embeds/`train_rag.js` content (left in place, marked historical, rather than deleted — those sections still have illustrative value for understanding how the system evolved). `.atl/skill-registry.md`'s "RAG Chatbot" compact rule and Edge Functions list updated to match (removed `gemini-generate`, added ingest/eval/EMBEDDING_MODE facts).

## TDD

RED confirmed first: all 4 new test files failed with `ERR_MODULE_NOT_FOUND` (for the two `.mjs`-importing subprocess suites) or a missing-directory error (`content/knowledge-base/*.md` test) before any implementation existed — 34/34 new tests failing. GREEN after implementation, with one refactor cycle: two tests used `mustInclude: ["página web"]` against text containing the plural "páginas web" — not a bug in `checkCriteria` (exact-substring semantics are correct and intentional), just a test-fixture typo; fixed to `"páginas web"` and re-confirmed GREEN. No other refactor needed.

## Brand-guard interaction (real deviation worth documenting)

`src/__tests__/brand.guard.test.ts` scans `src/`, `public/`, and `scripts/` for the literal strings "smartconnect"/"qribar" with a **permanently empty allowlist** (by design, per the guard's own docblock). The first draft of `scripts/kb/eval-set.json` included `"smartconnect"` and `"qribar"` inside several `mustNotInclude` arrays, as a defensive regression guard for the eval runner itself. Since `eval-set.json` lives under `scripts/`, the brand guard's own test immediately flagged those two literal tokens as "offenders" — correctly, from its perspective, since it cannot tell a denylist entry from an actual brand mention.

Resolution: removed `"smartconnect"`/`"qribar"` from every `mustNotInclude` array in `eval-set.json`. This is not a real regression risk — the model's system prompt identity line (`_shared/prompt.ts`) and its own dedicated unit test (`prompt.test.ts`, added in Unit 2) already guard against the chatbot ever naming the old brand; the eval set's job is to catch *content* regressions (invented prices, missing redirects), not brand-identity regressions, which are already covered elsewhere. `content/knowledge-base/*.md` was written brand-clean from the start and is covered by a dedicated check in the new curated-content test (even though the brand guard itself does not scan `content/` — confirmed by reading its `SCAN_DIRS`). The guard's allowlists remain permanently empty, unmodified.

## Confirmed facts used (owner-stated 2026-10-07, see business-facts brief)

- Business: Digitaliza Tenerife. Serves restaurants, bars, cafés, AND shops.
- Services: custom (non-template) websites; digital menu (carta digital) via QR/NFC for restaurants and shops, no app/registration, multilingual, instant price/dish/allergen updates, table orders reach bar+kitchen in restaurants; TPV for restaurants; AI chatbots; NFC cards for Google reviews (one tap opens the review profile).
- Pricing policy: no prices for websites/carta digital/TPV/chatbots → "depende del tipo de proyecto y de su complejidad" + contact CTA. Only NFC has a confirmed price: 15–35 € per unit, volume discounts (never "39 €").
- Contact: `https://digitalizatenerife.es/#contacto`. Legal: `/legal/privacidad`, `/legal/cookies`, `/legal/aviso`.
- Language: Spanish from Spain (tuteo; no voseo, no "celular"/"computadora").

## TODO(owner) items — full list (what the owner must fill in before these are no longer gaps)

From `content/knowledge-base/servicios-web.md`:
- Confirm what a website project includes: number of pages, hosting, maintenance, delivery timelines.

From `content/knowledge-base/carta-digital.md`:
- Confirm which extra features (payment gateway, delivery orders, external TPV integration, number of included languages) are part of the base plan vs. paid extras.

From `content/knowledge-base/preguntas-clave.md`:
- Confirm exact TPV modules/features (comandas, caja, informes, integración con la carta digital).
- Confirm exact chatbot scope (supported channels, languages, WhatsApp integration or similar).

None of these TODO sections reach `documents` — verified by `tests/unit/scripts/kbCuratedContent.test.ts` (asserts `parseCuratedFile(...).body` never contains the literal token, for all 3 files) and by the existing Unit 7 `assertNoTodoLeak` broad `/TODO/` guard in the orchestrator.

## Testing summary

- New tests: `kbCuratedContent.test.ts` (18), `kbEvalCriteria.test.ts` (8), `evalKnowledgeBase.test.ts` (2), `kbEvalSet.test.ts` (6) — 34/34 passing after the one fixture fix above.
- `src/__tests__/brand.guard.test.ts` and `tests/unit/scripts.structure.test.ts` re-verified green after the `eval-set.json` fix.
- Full `npx jest` → 139/142 suites run (3 skipped, pre-existing/environment-gated), 1635/1701 tests passed, 66 skipped, 0 failed.
- `npx tsc --noEmit` and `npm run lint` both clean.

## Not done in this session (by instruction)

No `npm run build`, no ingestion/eval run against production, no Supabase MCP calls, no push/merge. Branch `feat/rag-unit8-curated-eval` has 2 commits, not pushed.

## Owner rollout (unchanged from Unit 7's documented sequence, now ready to execute for real)

See `docs/CHATBOT_RAG_ARCHITECTURE.md` → "Arquitectura Actual (2026-10-08)" → "Rollout y rollback". In short: deploy functions → migrations (already applied to production) → `npm run build` → `npm run ingest-kb --dry-run` → `npm run ingest-kb` → `EMBEDDING_MODE=v2` → re-run `npm run ingest-kb` → `npm run eval-kb` → `npm run ingest-kb --purge-legacy --confirm-purge`. Rollback: `EMBEDDING_MODE=legacy` + restore from `kb_backup.documents_20261008` + recreate `ivfflat` if needed.

## Remaining work after Unit 8

All 8 units of `rag-knowledge-base-refresh` are now implemented, each on its own branch. Someone must decide the final merge/PR strategy for the full stack (1→2→3 stacked; 4→5→6-integration→7→8 stacked) and execute the real owner rollout above — neither was done in any apply session, per instructions (isolated worktrees, no production calls, no build).
