# Claims softening, AI-citation policy and OAuth cleanup — 2026-10-01

**Timestamp:** 2026-10-01
**Trigger:** Owner decisions on `2026-10-01_content-seo-geo-audit.md` items 1, 14, 15.

## Actions
- **Claims (item 1):** No verified figures were provided, so claims were softened rather than replaced: "200+" and "850+" businesses → "Decenas / Dozens"; "6×", "40%", "45%" → "Hasta / Up to …"; unsourced "Estudios demuestran…" and "Nuestros clientes multiplican…" reworded as case-based claims (ES + EN in `LanguageContext.tsx`). `SuccessStats.tsx` key stats now use i18n keys (new `successStat1Value`). Named customer testimonials were left unchanged. **Follow-up:** replace with exact, verifiable figures once the owner confirms them.
- **AI citation (item 15):** `Content-Signal` unified to `search=yes, ai-input=yes, ai-train=no` in `public/robots.txt`, `vercel.json`, `vite.config.ts`; `llms.txt` updated and `agent-skills/index.json` sha256 regenerated.
- **OAuth (item 14):** deleted `openid-configuration`, `oauth-protected-resource`, `jwks.json`; removed the `oauth2-authorization-server` link from `api-catalog`, the related `Link` header entries, the `llms.txt` reference and the matching test assertions. `http-message-signatures-directory` (empty key set) and the `api-catalog` `service-desc` links to Supabase Edge Functions were left in place — flagged for a later decision.

## Validation
- `tsc --noEmit` clean; eslint clean on changed TS files; `jest`: 985 passed. The 11 failures in `tests/integration/admin/documents-rls.test.ts` also fail without these changes (they need a live Supabase). No build run.

## Supabase review and follow-up (same day)

**Scope:** read-only review of project `smartconnect-rag` via the Supabase MCP, one function redeploy, repo cleanup. Note: the sandbox env vars `NEXT_PUBLIC_SUPABASE_*` point to a different project (`multi_tienda`) and were not used.

- **Findings:** all 5 deployed functions have `verify_jwt=false`. `chat-with-rag` accepts anonymous callers and had no rate limit (it calls paid Gemini). `gemini-generate` requires a JWT + 10 req/min; `gemini-embedding` requires a logged-in user (per repo code); `notify-lead` is origin-restricted. `test-log` is an unused leftover. Security advisors: only the known warnings (vector in public, anonymous `documents` SELECT, leaked-password protection off).
- **Deployed:** `chat-with-rag` v43 (rate limit + parameter clamps; see CHANGELOG). Smoke test before/after: HTTP 200 with correct RAG answers for "¿Qué es la carta digital?" and the NFC question; CORS preflight 200.
- **Known limitation:** a 24-request burst did **not** trigger HTTP 429. The limiter is in-memory per isolate (same pattern as `gemini-generate`), so requests spread across isolates are not counted together. It reduces nothing against a determined caller. A robust limit needs shared state (e.g. a Postgres counter via RPC) or a quota cap on the Gemini API key — not applied.
- **Removed:** `api-catalog` and `http-message-signatures-directory` (and references). Left in place: `Link: </.well-known/mcp/server-card.json>; rel="api-catalog"` in `vercel.json` (mislabelled rel, harmless; decide separately).
- **Not done:** deleting the `test-log` function (the MCP has no delete tool; remove from the Supabase dashboard or CLI).

## Incident: chatbot HTTP 500 after disabling anonymous sign-ins (same day)

- **Symptom:** after the owner disabled anonymous sign-ins and sign-ups in Supabase Auth, the browser chatbot got HTTP 500 from `chat-with-rag`.
- **Reproduction (production, curl):** `apikey` only → 200; `apikey` + `Authorization: Bearer <publishable key>` → 200; `apikey` + `Authorization: Bearer <expired/invalid JWT>` → **500**.
- **Root cause (pre-existing bug, exposed by the change):** `authenticateRequest` built the Supabase client with the caller's `Authorization` header; when `auth.getUser()` rejected the token it fell back to "anonymous" but kept using that same client, so every `match_documents` RPC was rejected by PostgREST ("Vector search failed" → 500). Browsers holding a stored, now-invalid session hit this.
- **Fix (in repo, NOT yet deployed):** on an invalid token, return a header-less client. Needs `chat-with-rag` redeploy to `tysjedvujvsmrzzrmesr` (the Supabase connector had disconnected). Interim workaround for an affected browser: clear site data / `sb-*-auth-token` in localStorage.
