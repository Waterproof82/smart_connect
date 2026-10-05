# Landing main-thread, Ads-signal, contrast and CSP hardening (2026-10-05)

SDD change: `landing-main-thread-tbt`. Each slice (S1–S5) appends its own dated
entry below. Do not remove prior entries when appending.

## S1 — F-01: Ads signals disabled + CSP has no Ads domains — 2026-10-05T12:09:47Z

- **Before:** PSI mobile on `/carta-digital` (2026-10-05) showed Best Practices
  92 with a DevTools Issues panel error: the CSP blocked a
  `pagead2.googlesyndication.com/measurement/conversion` request fired by
  `gtag.js`. The owner runs no Google Ads campaigns — this is an
  unwanted/unconfigured signal, not a legitimate conversion ping.
- **Change:**
  - `index.html` — the `gtag("config", "G-F9KQ7X8TSQ", ...)` call (only
    reached when `window.__scAnalyticsScope` is true) now passes
    `{ allow_google_signals: false, allow_ad_personalization_signals: false }`.
  - Confirmed (did not widen) the CSP in `vercel.json`: it already excludes
    `googlesyndication.com` and `doubleclick.net` in every directive. No CSP
    edit was needed for this slice.
  - `tests/unit/indexHtml.consentMode.structure.test.ts` — new test
    `"disables Ads signals at source in the gtag('config',...) call (F-01)"`
    asserts both flags are present on the config call.
  - `tests/unit/scripts/securityHeaders.test.ts` — new test
    `"does not allow googlesyndication.com or doubleclick.net in any CSP
    directive"` is a regression guard against ever widening the CSP to those
    domains again.
- **After:**
  - RED: the new `indexHtml.consentMode.structure.test.ts` assertion failed
    with the unmodified `index.html` (config call had no flags object) —
    confirmed failing for the right reason before implementing.
  - GREEN: after the `index.html` edit, both new tests pass; full suite —
    `npm test` (Jest): 1463/1466 passing, same 3 pre-existing
    `tests/e2e/chatbotFlow.test.ts` network-dependent failures as before this
    change (unrelated — they call a live Supabase Edge Function and return
    500 in this environment; see `MEMORY.md`); `npm run test:vitest -- --run`:
    135/135 passing; `npx tsc --noEmit` and `npx tsc -p tests/tsconfig.json
    --noEmit`: 0 errors; `npm run lint`: 0 errors/warnings.
- **Regression check:** no other test in either suite references the gtag
  `config` call shape or the CSP's Ads-domain list, so no other assertion
  needed updating. `clientRouteParity` is untouched by this slice (no route or
  SSR markup change).
- **Manual, owner (T1.4, not part of apply):** GA4 → Admin → Google tag →
  confirm no linked `AW-` destination. Flags alone do not stop a
  property-level Ads link; this is tracked as an explicit follow-up, not
  closed by this commit.
- **Manual-verify, post-deploy (T1.6, not part of apply):** PSI mobile on
  `/carta-digital` after deploy — confirm the DevTools Issues panel no longer
  shows the CSP-blocked `googlesyndication.com/measurement/conversion` error.
