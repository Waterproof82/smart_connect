# Audit — RAG Knowledge-Base Refresh, Unit 2: Prompt Grounding + Redirect

**Date:** 2026-10-07
**SDD change:** `rag-knowledge-base-refresh`
**Unit:** 2 of 8 (per tasks artifact `sdd/rag-knowledge-base-refresh/tasks`)
**Branch:** `feat/rag-unit2-prompt-grounding` (from `feat/rag-unit1-generation-failover`, stacked)
**Mode:** Strict TDD (RED → GREEN → REFACTOR)

## What changed

- Added `supabase/functions/_shared/prompt.ts` and `prompt.test.ts`: a pure,
  import-free, `Deno`-free module (same pattern as `_shared/generate.ts` and
  `notify-lead/_lib.ts`) exporting `buildSystemInstruction({ documents })`,
  `CONTACT_URL` and `LEGAL_URLS`.
- Extended `supabase/functions/_shared/generate.ts`: `GenerateRequestConfig`
  gains an optional `systemInstruction?: string`, sent as Gemini's top-level
  `systemInstruction: { parts: [{ text }] }` field when present. Backward
  compatible — omitted entirely when not supplied, so Unit 1's 15 tests still
  pass unchanged.
- Modified `supabase/functions/chat-with-rag/index.ts`: step 5 ("CONSTRUCT
  PROMPT WITH RAG CONTEXT") is replaced by a call to `buildSystemInstruction`.
  The user turn sent to Gemini is now the raw `query` (context lives in the
  `systemInstruction`, not inlined into the conversation). The early-return
  dead end for zero search results (`"No encontré información relevante..."`)
  is removed — the request now always reaches generation, with an empty
  documents array producing an instruction that still lets the model answer
  greetings/small talk and apply the same redirect rules.

## Why

Spec `sdd/rag-knowledge-base-refresh/spec` — "Prompt Redirect and Language
Behavior": unknown questions must get a contact CTA instead of a dead end;
privacy/legal questions must redirect to footer links, never be answered from
KB content. Design D6 chose `systemInstruction` over inlining the prompt in
the user turn because it survives multi-turn conversation history better.

## Decisions carried from design

- **D6 rules, in priority order:** answer in the user's input language;
  ground strictly in CONTEXT, never invent prices/timelines/claims; unknown →
  redirect to `https://digitalizatenerife.es/#contacto`; privacy/cookies/legal
  → redirect to `/legal/privacidad`, `/legal/cookies`, `/legal/aviso`, never
  answered from KB content; zero documents → still answer (greetings), not a
  hard refusal.
- **Plain-text URLs, not markdown links.** Checked
  `src/features/chatbot/presentation/components/ChatMessages.tsx`: message
  content is rendered as a plain React child (`{m.content}`), with no
  markdown parser and no `dangerouslySetInnerHTML`/DOMPurify step anywhere in
  the chatbot presentation layer. Markdown link syntax (`[text](url)`) would
  render as literal text, and relative paths (`/legal/privacidad`) would be
  unreadable out of context since the chat has no base-URL affordance for the
  user. The prompt therefore spells out the full
  `https://digitalizatenerife.es/...` URL for every redirect so it reads as a
  clear, copyable reference even though it is not clickable. This is a
  **design risk carried forward, not fixed**: if the renderer later gains
  markdown/link support, these URLs will keep working as plain text but could
  be revisited to use markdown link syntax for a better UX. No frontend
  changes were made in this unit.

## TDD evidence

1. RED: `npx jest supabase/functions/_shared/prompt.test.ts` failed with
   `Cannot find module './prompt'` (module did not exist yet).
2. GREEN: after implementing `prompt.ts`, all 6 tests (language-match rule
   present, CTA redirect present + no dead-end string, legal-redirect links
   present, no-invented-prices rule present, documents/source/url included in
   context block, empty-documents array still answerable) passed on first
   implementation.
3. Regression: `supabase/functions/_shared/generate.test.ts` — still 15/15
   passing after adding the optional `systemInstruction` field.
4. Full suite: `npx jest` → 125 of 126 suites run (1 network-gated e2e suite;
   ran live here against the currently deployed, unmodified function and
   passed), 1513 passed (1507 + 6 new), 0 failed.
5. `npx tsc --noEmit` → clean (`tsconfig.json` excludes `supabase/functions`,
   same as Unit 1; `ts-jest`'s inline tsconfig is the type-safety net for
   `_shared/*.ts`).
6. `npm run lint` → clean (`.eslintrc.json` also excludes
   `supabase/functions`).

## Scope boundary (explicitly NOT touched in this unit)

- Embedding request/response shape, `gemini-embedding` function, removal of
  the ungrounded `gemini-generate` fallback, `ChatRepositoryImpl`/
  `ExpertAssistantWithRAG.tsx` grounded-failure UX (Unit 3).
- Frontend chat renderer — confirmed plain-text rendering (see above) but did
  not change it.
- `thinkingConfig: { thinkingLevel: 'low' }` — unchanged.

## Owner action required

`chat-with-rag` must be redeployed for this to take effect in production:

```
supabase functions deploy chat-with-rag
```

No new secrets, no database migration, no frontend deploy needed for this
unit.
