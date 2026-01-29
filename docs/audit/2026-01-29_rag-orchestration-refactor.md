# 2026-01-29_rag-orchestration-refactor.md

**Timestamp:** 2026-01-29

## Operation: RAG Orchestration Refactor & Env Handling Improvement

- Refactored `GenerateResponseUseCase` to delegate all RAG (embedding + document search) to backend Edge Function when using GeminiDataSource. Frontend no longer attempts local semantic search in this mode.
- Updated universal environment variable resolver (`env.config.ts`) to use `globalThis.window` and optional chaining for robust hybrid (Node/browser) support.
- Unified `.env.local` for both frontend (VITE_*) and backend (no prefix) secrets. Ensured no secrets are exposed in browser bundles.
- Verified: No compile/runtime errors, chatbot works as expected, and all tests pass.

**Files affected:**
- `src/features/chatbot/domain/usecases/GenerateResponseUseCase.ts`
- `src/shared/config/env.config.ts`
- `.env.local`
- `CHANGELOG.md`

**Result:**
- RAG orchestration is robust, secure, and follows best practices for hybrid apps.
- Environment variable handling is universal and error-free.

## 2026-01-29 - SecurityLogger/env robust refactor

- Refactored `SecurityLogger` and all consumers (sanitizer, rateLimiter) to only instantiate Supabase client if both SUPABASE_URL and SUPABASE_ANON_KEY are present in the environment.
- If missing, logger now falls back to console-only mode, preventing frontend and SSR crashes due to missing env vars.
- Fix validated: App no longer throws 'supabaseUrl is required' in production, preview, or dev when envs are absent.
- Ensured robust universal env handling for all shared code.

---
