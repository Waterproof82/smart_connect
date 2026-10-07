# Audit — RAG Knowledge-Base Refresh, Unit 1: Generation Timeout + Backup-Model Failover

**Date:** 2026-10-07
**SDD change:** `rag-knowledge-base-refresh`
**Unit:** 1 of 8 (per tasks artifact `sdd/rag-knowledge-base-refresh/tasks`)
**Branch:** `feat/rag-unit1-generation-failover` (from `develop`)
**Mode:** Strict TDD (RED → GREEN → REFACTOR)

## What changed

- Added `supabase/functions/_shared/generate.ts` and `generate.test.ts`: a pure,
  import-free, `Deno`-free module (same pattern as `notify-lead/_lib.ts`)
  exporting `generateWithFailover({ models, apiKey, request, fetchFn, now,
  deadlineMs, ... })`.
- Modified `supabase/functions/chat-with-rag/index.ts`: the inline Gemini
  `fetch` call in step 6 ("GENERATE RESPONSE WITH GEMINI") is replaced with a
  call to `generateWithFailover`. Primary/backup model names are read from
  `GEMINI_PRIMARY_MODEL`/`GEMINI_BACKUP_MODEL` env vars (validated against
  `MODEL_NAME_REGEX`, falling back to safe defaults on invalid/missing
  values). On total failure the handler now returns `503
  {"error":"generation_unavailable"}` instead of throwing into the generic
  500 catch-all. Response `metadata` gains a `modelUsed` field.

## Why

Design `sdd/rag-knowledge-base-refresh/design` (D1-D3): the chatbot had no
timeout/backup path — a slow or erroring primary model (503s/15-60s seen in
production per the 2026-10-07 model-switch incident) left users without an
answer. A single retry on a distinct model/capacity pool, bounded by a hard
20s wall-clock ceiling, trades a small latency cost for resilience without
risking a runaway request.

## Decisions carried from design

- **Budget split:** 20s total (from handler start, computed as
  `20000 - elapsed-before-generation`), primary capped at 10s, backup capped
  at `min(8s, remaining - 500ms)`, backup skipped entirely if remaining
  budget < 3s.
- **Failover triggers:** `AbortError`/timeout, network `TypeError`, `429`,
  `404`, any `5xx`, or a `200` with no `candidates` and no
  `promptFeedback.blockReason`.
- **No-retry triggers:** `400`/`401`/`403` — identical fault on both models,
  retrying wastes the remaining budget.
- **Model defaults:** `gemini-3.1-flash-lite` (primary, current production
  model) / `gemini-3.5-flash-lite` (backup) — same latency/cost tier so the
  8s backup budget is realistic; env-only swap, no redeploy needed to change
  models.
- **generationConfig unchanged:** `temperature:0.3, topK:40, topP:0.95,
  maxOutputTokens:2048, thinkingConfig:{thinkingLevel:'low'}` (now the
  module's `DEFAULT_GENERATION_CONFIG`).

## TDD evidence

1. RED: `npx jest supabase/functions/_shared/generate.test.ts` failed with
   `Cannot find module './generate'` (module did not exist yet).
2. GREEN: after implementing `generate.ts`, the same 15 tests (model-name
   regex, primary success, timeout+failover via `jest.useFakeTimers()` +
   injected `AbortSignal`-aware fetch, 429/404/503 failover, 400/401/403
   no-retry, empty-response retry vs. safety-block no-retry, deadline-skip
   via injected `now()`, exhausted-budget short-circuit, invalid model name
   throw) passed on first implementation.
3. Full suite: `npx jest` → 124 of 125 suites run (1 network-gated e2e suite
   auto-skipped without credentials in some environments; here it ran live
   against the current deployed function and passed), 1507 passed, 0
   failed.
4. `npx tsc --noEmit` → clean (note: `tsconfig.json` excludes
   `supabase/functions`, so this does not type-check the Edge code itself;
   `ts-jest`'s inline tsconfig, used via the `generate.test.ts` run, is the
   type-safety net for the new module).
5. `npm run lint` → clean (`.eslintrc.json` also excludes
   `supabase/functions`).

## Scope boundary (explicitly NOT touched in this unit)

- Prompt content/grounding rules (Unit 2).
- Embedding request/response shape, `gemini-embedding` function, removal of
  the ungrounded `gemini-generate` fallback (Unit 3).
- Frontend (`ExpertAssistantWithRAG.tsx`, `ChatRepositoryImpl`) — still
  calls the function the same way; the only externally visible contract
  change is the new `503 generation_unavailable` shape on double failure,
  which the frontend does not yet special-case (tracked for Unit 3 per
  design D7).

## Owner action required

`chat-with-rag` must be redeployed for this to take effect in production:

```
supabase functions deploy chat-with-rag
```

No new secrets are required — `GEMINI_PRIMARY_MODEL`/`GEMINI_BACKUP_MODEL`
are optional and default to the values above if unset. To override:

```
supabase secrets set GEMINI_PRIMARY_MODEL=gemini-3.1-flash-lite
supabase secrets set GEMINI_BACKUP_MODEL=gemini-3.5-flash-lite
```

No database migration, no frontend deploy needed for this unit.
