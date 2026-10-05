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

## S2a — F-02 (part): deferred gtag.js loader + idle/interaction utils (Stream A, T2.1–T2.6) — 2026-10-05

- **Before:** `index.html` loaded `gtag.js` via a static, render-blocking
  `<script async src="https://www.googletagmanager.com/gtag/js?id=…">` tag
  parsed at the very top of `<head>`. The Consent Mode comment above the
  inline `dataLayer`/consent script said `gtag.js itself still loads and
  may send cookieless pings`, describing a synchronous load. `S2` (design.md)
  was forecast at ~550–650 changed lines — over the 400-line review budget —
  so the owner split it into stacked **S2a** (this slice: idle/interaction
  utils + the `index.html` loader rewrite) and **S2b** (theme/language
  mount-time fix + `DeferredExpertAssistant`, not started yet).
- **Change:**
  - New `src/shared/utils/scheduleIdle.ts`: `scheduleIdle(cb, {timeout})`
    runs `cb` via `requestIdleCallback` when available (default timeout
    3000ms), falling back to `setTimeout` otherwise; returns a cancel
    function (`cancelIdleCallback`/`clearTimeout`).
  - New `src/shared/hooks/useIdleOrInteraction.ts`: `false` on SSR/first
    render; becomes `true` once `scheduleIdle`'s callback fires OR the
    first `pointerdown`/`keydown`/`scroll`, whichever is first; cleans up
    its idle cancel + all 3 listeners on unmount. Not yet consumed anywhere
    (S2b wires it into `DeferredExpertAssistant`).
  - `vite.config.ts`: added `src/shared/hooks/**/*.test.tsx` to Vitest's
    `test.include` so the hook's behavioral test (needs a real DOM —
    `renderHook` + fired events) runs under Vitest/jsdom. Kept the `.tsx`
    extension specifically so Jest's own `**/?(*.)+(spec|test).ts`
    `testMatch` pattern does NOT also pick the file up (it only matches
    `.ts`, not `.tsx`) — this repo's Jest config has no
    `jest-environment-jsdom` installed, so it would otherwise crash trying
    to mount a hook with no DOM.
  - `index.html`: removed the static `<script async src=…/gtag/js>` tag.
    Added an inline, self-contained deferred loader (duplicated as plain
    JS, not imported from `scheduleIdle.ts`, because `index.html` is
    evaluated before any TS module exists) at the end of the existing
    Consent Mode `<script>` block: on `window.load`, schedules
    `requestIdleCallback(inject, {timeout:3000})` (or `setTimeout(inject,
    3000)` as a fallback) AND attaches one-shot `pointerdown`/`keydown`/
    `touchstart`/`scroll` listeners; whichever fires first creates and
    appends the real `gtag.js` `<script async>` tag to `<head>` (an
    `injected` flag makes this idempotent). The whole block is skipped when
    `__scAnalyticsScope` is falsy (`/admin`, `/panel`, `/login`). The
    `googletagmanager` `preconnect` link is now `dns-prefetch` (D3 — the
    connection is used late and would otherwise compete with critical
    sockets). The Consent Mode comment now states that this default (plus
    the `dataLayer` stub and the stored-grant restore) runs synchronously
    and first, while `gtag.js` itself loads deferred after `load` + idle/
    interaction (closes the `http-surface-hardening` "Accurate Consent
    Mode Comment" MODIFIED requirement).
  - `tests/unit/indexHtml.consentMode.structure.test.ts`: new describe
    block (14 tests) covering the static-tag removal, the `dns-prefetch`
    change, `<meta charset>` staying the first `<head>` child, the updated
    comment, and — behaviorally — the `dataLayer` call order, no injection
    before `load`, the 3000ms idle schedule, injection on idle, injection
    on each of the 4 interaction events, idempotency when both idle and an
    interaction fire, the `setTimeout` fallback, and the scope-false
    no-op. A real `jsdom` instance (the npm package) was tried first for
    the behavioral tests, but `require("jsdom")` crashes under this repo's
    Jest/ts-jest config — `jsdom`'s own dependency `parse5` ships ESM, and
    this repo's `transformIgnorePatterns` only transforms `@exodus/bytes`
    under `node_modules`, so `parse5`'s `import` statement fails with
    "Cannot use import statement outside a module". Widening
    `transformIgnorePatterns` repo-wide was out of scope for this slice, so
    the tests instead extract the inline script and run it in a minimal
    `node:vm` sandbox implementing just the handful of DOM/BOM primitives
    it touches (`document.createElement`/`head.appendChild`,
    `window.addEventListener`, `location.pathname`, `localStorage`,
    timers) — equivalent behavioral coverage, zero new runtime dependency.
- **After:**
  - RED: `tests/unit/shared/utils/scheduleIdle.test.ts` and
    `src/shared/hooks/useIdleOrInteraction.test.tsx` failed with
    "Could not locate module" / "Failed to resolve import" before their
    implementation files existed — confirmed failing for the right reason.
    The 14 new `indexHtml.consentMode.structure.test.ts` assertions failed
    against the unmodified `index.html` (static tag still present, old
    comment wording, no deferred-loader behavior) — also confirmed failing
    for the right reason, then fixed one test-only bug (asserting on the
    bare `setTimeout` identifier via `toHaveBeenCalledWith` isn't valid
    with Jest's modern fake timers, which aren't `jest.fn()`-wrapped;
    switched to recording calls through the sandbox's own `setTimeout`
    wrapper) before the first real GREEN run.
  - GREEN: `npm test` (Jest): 1483/1486 passing — same 3 pre-existing
    `tests/e2e/chatbotFlow.test.ts` network-dependent failures as S1
    (unrelated, see `MEMORY.md`); 20 new Jest tests added (5
    `scheduleIdle.test.ts` + 14 extended `indexHtml.consentMode.structure.
    test.ts` + 1 net from the file's prior 10). `npm run test:vitest --
    run`: 145/145 passing (10 new `useIdleOrInteraction.test.tsx` tests).
    `npx tsc --noEmit` and `npx tsc -p tests/tsconfig.json --noEmit`: 0
    errors. `npm run lint`: 0 errors/warnings. Did not run `npm run build`
    (global rule).
- **Regression check:** no other test referenced the static gtag `<script>`
  tag, the `preconnect` link, or the Consent Mode comment's exact wording,
  so nothing else needed updating. `clientRouteParity` is untouched (no
  route or SSR markup change — the loader only runs client-side, post-
  `load`). `T2.0`/`T2.7`–`T2.14` (theme/language mount-time fix, deferred
  assistant, wiring) and `T2.15`–`T2.18` (regression/trace/close-out) are
  **not** part of this slice — tracked as S2b.
