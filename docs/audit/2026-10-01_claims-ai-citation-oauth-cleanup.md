# Claims softening, AI-citation policy and OAuth cleanup — 2026-10-01

**Timestamp:** 2026-10-01
**Trigger:** Owner decisions on `2026-10-01_content-seo-geo-audit.md` items 1, 14, 15.

## Actions
- **Claims (item 1):** No verified figures were provided, so claims were softened rather than replaced: "200+" and "850+" businesses → "Decenas / Dozens"; "6×", "40%", "45%" → "Hasta / Up to …"; unsourced "Estudios demuestran…" and "Nuestros clientes multiplican…" reworded as case-based claims (ES + EN in `LanguageContext.tsx`). `SuccessStats.tsx` key stats now use i18n keys (new `successStat1Value`). Named customer testimonials were left unchanged. **Follow-up:** replace with exact, verifiable figures once the owner confirms them.
- **AI citation (item 15):** `Content-Signal` unified to `search=yes, ai-input=yes, ai-train=no` in `public/robots.txt`, `vercel.json`, `vite.config.ts`; `llms.txt` updated and `agent-skills/index.json` sha256 regenerated.
- **OAuth (item 14):** deleted `openid-configuration`, `oauth-protected-resource`, `jwks.json`; removed the `oauth2-authorization-server` link from `api-catalog`, the related `Link` header entries, the `llms.txt` reference and the matching test assertions. `http-message-signatures-directory` (empty key set) and the `api-catalog` `service-desc` links to Supabase Edge Functions were left in place — flagged for a later decision.

## Validation
- `tsc --noEmit` clean; eslint clean on changed TS files; `jest`: 985 passed. The 11 failures in `tests/integration/admin/documents-rls.test.ts` also fail without these changes (they need a live Supabase). No build run.
