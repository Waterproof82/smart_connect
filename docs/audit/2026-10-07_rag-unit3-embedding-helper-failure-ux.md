# Audit — RAG Knowledge-Base Refresh, Unit 3: Embedding Contract + Grounded Failure UX

**Date:** 2026-10-07
**SDD change:** `rag-knowledge-base-refresh`
**Unit:** 3 of 8 (per tasks artifact `sdd/rag-knowledge-base-refresh/tasks`), plus one
user-approved scope addition (chat link linkification) and one orchestrator addition
(no-Markdown prompt rule)
**Branch:** `feat/rag-unit3-embedding-failure-ux` (from `feat/rag-unit2-prompt-grounding`, stacked)
**Mode:** Strict TDD (RED → GREEN → REFACTOR)

## What changed

### Embedding contract (D4)
- Added `supabase/functions/_shared/embedding.ts` + `embedding.test.ts` (pure,
  import-free, `Deno`-free): exports `buildEmbedRequest(text, {mode, role, title?})`,
  `parseEmbedResponse(data)`, `resolveEmbeddingMode(envValue)`, `EMBED_URL`,
  `EMBEDDING_MODEL`, `EMBEDDING_DIMENSIONS`.
- `EMBEDDING_MODE` env flag: `legacy` (default) produces a byte-identical payload to
  the pre-refactor one — `{content:{parts:[{text}]}}`, nothing else — so existing
  768-dim vectors in `documents` stay valid. `v2` adds `taskType:
  RETRIEVAL_QUERY|RETRIEVAL_DOCUMENT` and `outputDimensionality: 768`, plus an
  optional `title` (document role only).
- Wired into `gemini-embedding/index.ts` (document role) and
  `chat-with-rag/index.ts`'s `getQueryEmbedding` (query role). Model stays
  `gemini-embedding-001` in both modes.

### Grounded failure UX (D7) — ungrounded fallback removed
- `IChatRepository`/`ChatRepositoryImpl`/`GenerateResponseUseCase`: removed
  `useRAG`, `ragOptions` defaults stay, and the `_generateWithoutRAG` method (which
  called `gemini-generate`) is deleted entirely. A `chat-with-rag` failure (e.g. its
  `503 generation_unavailable` once both primary and backup models fail — see
  `_shared/generate.ts`) now propagates as a thrown `Error`, never silently retried
  against an ungrounded model.
- `supabase/functions/gemini-generate/` source deleted from the repo (see Owner
  action required below — the deployed function itself is a separate, later step).
- `ExpertAssistantWithRAG.tsx` now calls `useLanguage()` and shows the new
  `chatbotGroundedFailure` i18n string (ES/EN, `LanguageContext.tsx`) instead of the
  previous generic "Hubo un error al conectar..." message, for any failure on this
  single remaining code path.

### Scope addition — safe chat-link linkification
- New `src/features/chatbot/presentation/utils/linkify.ts` (pure) splits message
  text into `{type:'text'}`/`{type:'link', href, sameSite}` segments. Only `https:`
  URLs become links (never `http:`, `javascript:`, `data:`); trailing punctuation
  (`. , ; : ) ! ?`) is stripped; `digitalizatenerife.es` and its subdomains are
  flagged `sameSite: true`.
- New `LinkifiedText.tsx` renders those segments as real `<a>` elements — no
  `dangerouslySetInnerHTML`, no markdown parser. Same-site links render without
  `target`; external links get `target="_blank" rel="noopener noreferrer"`. Both the
  grounded-failure message and every other bot message now render through it
  (`ChatMessages.tsx`).

### Orchestrator addition — forbid Markdown in model output
- A production smoke test showed the model emitting Markdown (`**15 € a 35 €**`),
  which rendered as literal asterisks since the UI renders plain text.
  `buildSystemInstruction` (`_shared/prompt.ts`) gained rule 7: answer in plain text,
  never Markdown (no `**`, `*`, `#`, backticks, tables); bare `https://` URLs remain
  explicitly allowed since they are linkified client-side. The identity line and all
  6 pre-existing tests from commit `931f878` are untouched.

## Why

Spec `sdd/rag-knowledge-base-refresh/spec` — "Embedding Contract Stability" and
"Grounded Failure UX": the embedding helper must default to legacy behavior so
existing vectors stay valid, and a RAG resilience-path exhaustion must show a static,
grounded message with a contact CTA, never fall back to an ungrounded model. The
linkification addition and the no-Markdown rule both follow from the same underlying
fact established in Unit 2: `ChatMessages.tsx` renders message content as plain text,
so any formatting syntax in the model's answer is user-visible as literal characters.

## Decisions carried from design

- **D4**: one `EMBEDDING_MODE` secret flips both `chat-with-rag` (query side) and
  `gemini-embedding` (document side) together, so they never fall out of sync.
  `parseEmbedResponse` defensively slices to 768 dims regardless of mode (hard
  pgvector-column invariant).
- **D7**: no distinction is made between "RAG resilience exhausted" and other
  `chat-with-rag`/data-layer failures for the frontend message — there is exactly
  one remaining failure path once the ungrounded fallback is gone, so one static
  grounded message with a contact CTA covers it correctly in every case.
- Deviation from the literal task list: `temperature`/`maxTokens` were also removed
  from `GenerateResponseParams`/`IChatRepository` (not explicitly named in task 3.4).
  They existed only to parameterize `_generateWithoutRAG`'s `generationConfig`; with
  that method deleted they were fully dead (never read by the `chat-with-rag` path,
  which builds its own `DEFAULT_GENERATION_CONFIG` server-side). Flagged here as a
  design note, not silently dropped.

## TDD evidence

| # | Area | RED | GREEN |
|---|---|---|---|
| 1 | `_shared/prompt.ts` no-Markdown rule | `npx jest .../prompt.test.ts` — new assertion failed (rule text absent) | added rule 7; 8/8 tests pass |
| 2 | `_shared/embedding.ts` | `npx jest .../embedding.test.ts` — `Cannot find module './embedding'` | implemented; 12/12 tests pass on first implementation |
| 3 | `ChatRepositoryImpl` grounded failure | `tests/unit/features/chatbot/ChatRepositoryImpl.test.ts` — old code swallowed the 503 and called `_generateWithoutRAG` (2 of 4 tests failed) | removed the fallback; 4/4 tests pass |
| 4 | `linkify.ts` | `Cannot find module './linkify'` | implemented; 9/9 tests pass (1 refactor: trailing-punctuation bookkeeping was dropping the punctuation instead of leaving it for the next text segment — fixed before GREEN was reached) |
| 5 | `LinkifiedText.tsx` (Vitest, jsdom/RTL) | `Failed to resolve import "../LinkifiedText"` | implemented; 6/6 tests pass |

Regressions checked: `DeferredExpertAssistant.test.tsx` broke (8 render calls missing
a `LanguageProvider` ancestor, now that `ExpertAssistantWithRAG` calls
`useLanguage()`) — fixed by wrapping every render with the same `LanguageProvider`
the real tree always provides (`entry-client.tsx`/`entry-server.tsx`); 21/21 tests
pass again.

## Full verification

- `npx jest` → 128 of 129 suites (1 network-gated e2e, ran live against the still
  undeployed function and passed), 1540 passed, 0 failed.
- `npx vitest run` → 33 files, 183 passed, 0 failed.
- `npx tsc --noEmit` → clean.
- `npm run lint` → clean.

## Scope boundary (explicitly NOT touched in this unit)

- `scripts/kb/embed.mjs`'s Node-side parity constants (Unit 7 — needs this unit's
  `_shared/embedding.ts` constants as its comparison target, not built yet).
- Markdown extraction, chunking, curated content, schema migrations (Units 4–8).

## Owner action required

1. Deploy both edge functions (no new secrets, `EMBEDDING_MODE` unset = `legacy`,
   byte-identical to today):
   ```
   supabase functions deploy chat-with-rag
   supabase functions deploy gemini-embedding
   ```
2. Ship the frontend (`ChatRepositoryImpl`, `ExpertAssistantWithRAG.tsx`,
   `ChatMessages.tsx`, `LinkifiedText.tsx`, new i18n key) via the normal
   merge-to-`main` → Vercel deploy path.
3. **Only after the new frontend is live** (so nothing can still call it), delete
   the deployed function:
   ```
   supabase functions delete gemini-generate
   ```
   The repo's `supabase/functions/gemini-generate/` source is already deleted in
   this unit — this step removes the still-running deployed copy.

No database migration needed for this unit.
