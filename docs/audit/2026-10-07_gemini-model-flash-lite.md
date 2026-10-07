# Audit — Chatbot F-09: Gemini key rotation and model switch

**Timestamp:** 2026-10-07T18:20Z
**Scope:** `supabase/functions/chat-with-rag/index.ts`, `supabase/functions/gemini-generate/index.ts`

## Diagnosis

- Supabase function logs: every `chat-with-rag` call failed at the embedding step with Gemini `402 RESOURCE_EXHAUSTED`: "Your prepayment credits are depleted".
- The key is read only from the Supabase secret `GEMINI_API_KEY`. The frontend and Vercel never use it (`src/shared/config/env.config.ts`).
- The old key belonged to AI Studio project "Genkit". Its billing account requires prepay and had no prepay balance.

## Actions

1. The owner created a new AI Studio project and set its key in `GEMINI_API_KEY`. Secrets need no redeploy.
2. With the new key, embeddings succeeded. Generation failed with 404: `gemini-2.5-flash` "is no longer available to new users".
3. Switched to `gemini-3.8-flash` with `thinkingLevel: 'low'`. It worked, but generation took 15–60 s and one call returned 503 (high demand).
4. Switched `chat-with-rag` and `gemini-generate` to `gemini-3.1-flash-lite` (stable, the fastest model in the 3.x line). Kept `thinkingLevel: 'low'` in `chat-with-rag`. Verified against the docs at ai.google.dev that the model supports thinking and `generateContent`.
5. The owner redeployed both functions.

## Verification (production, anonymous session, 3 queries)

| Query | Total | Result |
|---|---|---|
| ¿Qué es QRIBAR y cuánto cuesta? | 2.1 s | 200, correct answer |
| ¿Qué son las tarjetas NFC? | 22.5 s | 200 (upstream outlier) |
| ¿Hacen páginas web? | 1.4 s | 200, "no tengo información" (gap in the knowledge base) |

## Follow-ups

- Add a model fallback with a timeout on 503 or slow responses (requires tests first).
- Add a knowledge-base document for web development, or make the bot point to the contact form instead of answering "no information".
