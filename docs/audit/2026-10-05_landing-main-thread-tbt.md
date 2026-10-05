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

## S2b — F-02 (part): mount-time relayout fix + deferred assistant (Streams B+C, T2.0, T2.7–T2.18) — 2026-10-05

- **T2.0 — trace confirmation of the forced-reflow hypothesis (before
  Stream B/C code changes):** built the project (`npm run build`, local
  exception granted for this diagnosis only — `dist/` is gitignored, not
  committed) and served it via `npx vite preview --port 4173`. Ran
  `npx lighthouse@12 http://localhost:4173/carta-digital
  --throttling-method=devtools --only-categories=performance
  --save-assets --output=json` (headless Chrome). `forced-reflow-insight`
  audit: score 0, total reflow time 267.0ms, all under a single
  `[unattributed]` source bucket (no symbol attribution surfaced by this
  audit). Inspecting the raw trace's `Layout` events directly: one
  dominant event at `dirtyObjects=totalObjects=1141`, `dur≈377.5ms`,
  immediately preceded (at the microsecond level) by a 45ms
  `UpdateLayoutTree`. Neither carried a `stackTrace` (Lighthouse's default
  categories don't capture per-frame JS stacks for `Layout`), but the
  surrounding `InvalidateLayout`/`ScheduleStyleRecalculation` events in
  the same window did: their stacks bottom out at `lc()` in
  `index-BnL8IeSw.js` — the app's own entry point, specifically the
  `(0, Ee.hydrateRoot)(oc, cc)` call — confirming the big layout is
  triggered during/immediately after React's first commit on hydration,
  consistent with design.md's premise that a mount-time effect is the
  trigger. `document.documentElement.className`'s own mutation sequence
  was not independently instrumented beyond the unit-level
  `MutationObserver` tests added below (headless Lighthouse's default
  trace categories don't expose attribute-mutation events either). Given
  the source-level read of `ThemeContext.tsx:51-68` (two `applyTheme`
  calls in the same mount commit, the second with a stale value for
  light-preference visitors) and that it is the only context performing
  an unconditional `<html>` class mutation on every page, the hypothesis
  was accepted as plausible enough to implement and then verify causally
  (T2.16) rather than instrument further — see T2.16 below for the
  **important caveat this surfaced**.
- **Before (Stream B):** `ThemeContext.tsx`'s mount-sync effect called
  `applyTheme(systemTheme)` directly, and its separate `[theme]` effect
  (dependency `theme`, initial value hardcoded `"dark"`) also ran once in
  the same initial commit, applying the stale `"dark"` value. For a
  light-preference visitor this flipped `<html>` to `dark` then back to
  `light` within the same hydration flush — two real DOM mutations where
  zero were needed, each invalidating Tailwind's `:where(.dark, .dark *)`
  subtree. `LanguageContext.tsx:1725` unconditionally wrote
  `document.documentElement.lang = lang`, even when the value already
  matched (D5).
- **Change (Stream B, T2.7–T2.10):**
  - New `src/shared/context/ThemeContext.test.tsx` /
    `LanguageContext.test.tsx` — filed beside the source files (not the
    literal `tests/unit/shared/context/...` path from tasks.md) and
    routed to Vitest via a new `src/shared/context/**/*.test.tsx` entry in
    `vite.config.ts`'s `test.include` — same required deviation already
    applied to `useIdleOrInteraction.test.tsx` in S2a (behavioral
    MutationObserver + React render tests need a real DOM, which this
    repo's Jest has no `jest-environment-jsdom` for).
  - `ThemeContext.tsx`: the mount-sync effect no longer calls `applyTheme`
    directly (it only reads the class and syncs React state). The
    `[theme]` effect now skips its own first invocation via a
    `useRef(true)` flag, so it never re-applies the stale initial `"dark"`
    value; a later `matchMedia` change still runs the effect normally
    (ref already flipped to `false`).
  - `LanguageContext.tsx`: the `lang` write is now guarded by
    `document.documentElement.lang !== lang`.
- **Before (Stream C):** `<ExpertAssistant />` (global chat widget) was
  mounted unconditionally and eagerly in `PageShell`'s `extras` slot at
  `App.tsx:167` and `IaChatbotsPage.tsx:118`, running its own
  `getAppSettings()` effect for the WhatsApp number on every mount — a
  second, duplicate Supabase settings read alongside `useWhatsappPhone`'s
  own (`WhatsAppCta`).
- **Change (Stream C, T2.11–T2.14):**
  - New `src/features/chatbot/presentation/__tests__/
    DeferredExpertAssistant.test.tsx` — filed beside
    `ExpertAssistantWithRAG`'s own `components/__tests__` convention (not
    the literal `tests/unit/features/chatbot/...` path from tasks.md,
    which is covered by neither Jest's `testMatch` for a `.tsx` file nor
    Vitest's `src/**` `test.include` globs) — asserts `renderToString`
    returns `""` (SSR), the first client render is empty, idle fires the
    mount (stubbed `requestIdleCallback`), a first `pointerdown` mounts it
    even before idle, and `OPEN_ASSISTANT_EVENT` mounts it immediately,
    already open.
  - New `src/features/chatbot/presentation/DeferredExpertAssistant.tsx`
    (+ `index.ts` export): `null` until `useIdleOrInteraction()` (reused
    from S2a, unmodified) returns `true` or an `OPEN_ASSISTANT_EVENT`
    listener (registered independently of `ExpertAssistant`'s own, since
    it isn't mounted yet) fires first; renders `<ExpertAssistant
    initialOpen={openedEarly} />` once either happens.
  - `ExpertAssistantWithRAG.tsx`: added an `initialOpen?: boolean` prop
    (`useState(initialOpen)`); removed the component's own
    `getAppSettings()` effect and its `whatsappPhone`/`setWhatsappPhone`
    state in favor of `useWhatsappPhone()` (D7) — same sanitization
    (`[^\d+]`), same shared cache as the WhatsApp CTA.
  - Extended `tests/unit/features/chatbot/
    ExpertAssistantWithRAG.structure.test.ts` (2 new source-text
    assertions: calls `useWhatsappPhone()`, no `getAppSettings` import or
    call; accepts `initialOpen` and uses it as the `isOpen` initial
    state).
  - `src/App.tsx` and `IaChatbotsPage.tsx`: `PageShell`'s `extras` prop now
    mounts `<DeferredExpertAssistant />` instead of `<ExpertAssistant />`
    directly; `IaChatbotsPage.tsx` keeps importing `OPEN_ASSISTANT_EVENT`
    for its "Pruébalo ahora" dispatch (unchanged — both the deferred
    wrapper and, once mounted, `ExpertAssistant` itself listen for it).
- **After:**
  - RED: `ThemeContext.test.tsx`'s light-theme mount case failed with 4
    recorded `<html>` class mutations (expected 0); `LanguageContext.
    test.tsx`'s "already matches" case failed with 1 recorded `lang`
    mutation (expected 0) — both against the unmodified source, confirmed
    failing for the right reason. `DeferredExpertAssistant.test.tsx`
    failed to resolve the (nonexistent) module import — confirmed failing
    for the right reason.
  - GREEN: all 5 new Vitest spec files pass (3 `ThemeContext`, 2
    `LanguageContext`, 5 `DeferredExpertAssistant` — 10 new Vitest tests
    total). Extended `ExpertAssistantWithRAG.structure.test.ts`: 10/10
    (2 new, pinned directly against the already-changed source — same
    "pin, not RED" precedent as S1's T1.2).
  - Full regression (T2.15): `npx tsc --noEmit`: 0 errors. `npx tsc -p
    tests/tsconfig.json --noEmit`: 0 errors. `npm run lint`: 0
    errors/warnings. `npm test` (Jest, includes `clientRouteParity`):
    1481/1488 — same 3 pre-existing unrelated `tests/e2e/
    chatbotFlow.test.ts` live-network failures (documented in
    `MEMORY.md`), no new failures, no regression attributable to the
    theme fix or the assistant deferral. `npm run test:vitest -- --run`:
    155/155 (135 before S2a → 145 after S2a → 155 after S2b).
- **T2.16 — post-fix trace re-capture (relative comparison only, Windows
  inflates absolute numbers per explore.md):** rebuilt (`npm run build`)
  and re-ran the identical Lighthouse command against the same running
  `vite preview` server.
  | Metric | Before (T2.0) | After (T2.16) | Delta |
  |---|---|---|---|
  | Total Blocking Time | 1168.0ms | 1012.9ms | **-13.3%** |
  | `forced-reflow-insight` total | 267.0ms | 277.5ms | +3.9% (noise) |
  | Dominant `Layout` event (`dirty=total≈1141-1142`) | dur≈377.5ms | dur≈341.2ms | -9.6% |
  | Performance category score | 0.76 | 0.78 | +0.02 |

  **Finding — the D4 hypothesis is only partially confirmed.** TBT
  improved directionally (~13%, single local run, Windows-timing noise
  applies per explore.md), and the unit-level `MutationObserver` tests
  prove the redundant `<html>` class/lang mutations are genuinely gone
  (0 mutations on mount, confirmed in jsdom). However, the single
  dominant ~340-380ms `Layout` event with `dirtyObjects=totalObjects≈
  1141-1142` is **still present essentially unchanged** after the fix —
  same object count, same relative position in the trace (right after
  hydration), nearly the same duration. This strongly suggests that
  specific event is the intrinsic cost of the page's **first** full
  layout pass (~1141 layout objects, computed once, under 4x CPU
  throttling), not a mutation-triggered *re*-layout caused by
  `ThemeContext`'s double-`applyTheme` bug. The fix itself remains
  correct and worth keeping (design.md D4/D5, independently verified via
  unit tests, and it does correlate with the measured TBT improvement),
  but closing F-02's full `/carta-digital` TBT/Perf success criteria
  (T2.18, post-deploy PSI) will very likely require further main-thread
  work beyond this slice's scope (e.g. deferring/virtualizing below-fold
  content, reducing the initial layout object count) — **flagged as a
  follow-up finding, not addressed in S2b.**
- **Regression check:** no SSR-markup/snapshot test asserted the chat
  widget's presence in prerendered HTML (`clientRouteParity` only checks
  the route-loader map, not widget markup), so none needed updating.
  `DeferredExpertAssistant` renders identically (`null`) on SSR and the
  first client render, so no #421 risk. `T1.4`/`T1.6` (S1) and
  `T2.18` (S2, manual-verify, post-deploy) remain out of apply scope.

## S3 — F-03: Accent/on-accent contrast (+ orchestrator-added on-accent-muted and inverse-CTA fixes) — 2026-10-05

- **Before:** Lighthouse/PSI flagged a contrast failure on `/carta-digital`.
  Computing the actual OKLCH→WCAG ratio for every affected token pair
  (helper math verified against design.md's own cited values — see
  `tests/unit/theme/oklchContrast.test.ts`):

  | Pair | Theme | Old ratio | Status |
  |---|---|---|---|
  | `--color-accent` / `--color-on-accent` | dark | 3.06:1 | FAIL |
  | `--color-accent` / `--color-on-accent` | light | 4.52:1 | marginal pass |
  | `--color-accent-hover` / `--color-on-accent` | dark | 4.52:1 | marginal pass |
  | `--color-accent-hover` / `--color-on-accent` | light | 6.85:1 | pass |
  | `--color-accent` (new, 52%) / `--color-on-accent-muted` (old) | dark | 2.43:1 | FAIL (new failure, see below) |
  | `--color-accent` (new, 52%) / `--color-on-accent-muted` (old) | light | 2.09:1 | FAIL (new failure, see below) |
  | `--color-text` / `--color-accent` (DashboardPreview.tsx:133 title, :139 inverted CTA) | dark | 2.80:1 (old) / 4.68:1 (new accent) | pre-existing FAIL, improves to pass with the new accent |
  | `--color-text` / `--color-accent` | light | 4.11:1 (old) / 3.63:1 (new accent) | pre-existing FAIL both before and after — see finding below |
  | `--color-text-muted` (carta step numbers) / `--color-surface` | dark/light | 5.05:1 / 5.86:1 | already passing (regression guard added, no change needed) |

- **Change:**
  - `src/index.css` — `--color-accent`: dark `65%`→`52%`, light `55%`→`52%`
    (both now `oklch(52% 0.18 250)`, hue/chroma unchanged — D8).
    `--color-accent-hover`: dark `55%`→`45%` (`oklch(45% 0.18 250)`); light
    stays `45%` (already matched the target, no edit). Reaching the new
    accent's contrast floor converged both themes on the same lightness.
  - `--color-on-accent-muted` (chat header footer text at
    `ExpertAssistantWithRAG.tsx:217,228`, `DashboardPreview.tsx:136`):
    retuned lightness-only to `oklch(95% 0.008 250)` (dark, was 75%) and
    `oklch(95% 0.01 250)` (light, was 35%) — the new, darker accent made
    both old values fail (2.43:1/2.09:1); only the "much lighter than
    accent" direction is mathematically reachable (going darker tops out
    at ~3.87:1 — accent's own luminance is already low, so a darker text
    color can never clear 4.5:1 against it; see the derivation in
    `tests/unit/theme/accentContrast.test.ts`'s header comment). New value
    clears 4.68:1/4.68:1.
  - `CartaDigitalBeneficiosSection.tsx:96` (D9) — the decorative "01"-"04"
    step number: `text-[var(--color-accent-subtle)]` → `text-muted` +
    `aria-hidden="true"` (already repeated in the chip at line 115/below).
  - **Orchestrator-addition finding, not resolvable at the token level:**
    `--color-text`/`--color-accent` (DashboardPreview.tsx's "Plan Pro"
    card title at line 133 and its inverted CTA pill at line 139) is
    mathematically impossible to clear 4.5:1 in light mode at the same
    time as `--color-accent`/`--color-on-accent` ≥4.5:1, given hue 250 +
    chroma 0.18 are fixed and `--color-text`/`--color-on-accent` are each
    used for dozens of other passing pairs. Proof: let `Y_accent` be the
    accent's relative luminance. The on-accent pair requires
    `(Y_on-accent + 0.05) / (Y_accent + 0.05) ≥ 4.5` → `Y_accent ≤ 0.170`
    (using light `--color-on-accent`'s `Y = 0.942`). The text pair
    requires `(Y_accent + 0.05) / (Y_text + 0.05) ≥ 4.5` → `Y_accent ≥
    0.197` (using light `--color-text`'s `Y = 0.0048`). `0.197 > 0.170` —
    no single accent lightness satisfies both. (Dark mode has no such
    conflict: the new accent's `Y = 0.144` already clears both pairs.)
    **Fix:** component-level, not a token retune — `DashboardPreview.tsx`
    no longer pairs `--color-text` with `--color-accent` for normal text.
    The title (`text-default` → `text-[var(--color-on-accent)]`) and the
    CTA pill (`bg-[var(--color-text)]` → `bg-[var(--color-on-accent)]`,
    dropped the redundant/conflicting trailing `text-default` class that
    was fighting the pill's own `text-[var(--color-accent)]`) both now use
    the same `--color-on-accent`/`--color-accent` pairing as
    `.btn-primary-inverse`, which already clears 5.11:1 in both themes.
  - New `tests/unit/theme/oklchContrast.test.ts`: known-value sanity for
    the shared OKLCH→WCAG helper (`tests/helpers/oklchContrast.ts` —
    **reused unmodified**, it already existed from an earlier, unrelated
    change (`seo-audit-followups`/S7) with gamut-clamped math verified to
    reproduce design.md's own cited ratios exactly; T3.2 did not need a
    new helper). Pure-white-vs-black ≈21:1, identical colors =1:1,
    symmetry, and 3 of design.md's own cited ratios reproduced exactly.
  - New `tests/unit/theme/accentContrast.test.ts`: parses `:root`/`.light`
    from `src/index.css` and asserts, in both themes: accent/on-accent,
    accent-hover/on-accent, accent/on-accent-muted, text-muted/surface,
    text-muted/bg, text/bg, text/surface all ≥4.5:1; accent and
    accent-hover hue stay 250 and accent chroma stays 0.18 after the
    retune; plus 3 source-text assertions that `DashboardPreview.tsx` no
    longer uses the unsatisfiable `--color-text`/`--color-accent` pairing.
  - Extended `src/features/landing/presentation/components/__tests__/
    CartaDigitalBeneficiosSection.test.tsx`: the decorative step number
    uses `text-muted` (not `--color-accent-subtle`) and is `aria-hidden`.
- **After:**
  - RED: `tests/unit/theme/accentContrast.test.ts` failed 6/27 against the
    unmodified `src/index.css`/`DashboardPreview.tsx` — exactly the dark
    accent/on-accent ratio, both themes' accent/on-accent-muted ratios,
    and the 3 DashboardPreview source-text checks — confirmed failing for
    the right reason (the other 21 assertions, covering pairs that were
    already passing, were green from the start — a deliberate broader
    regression sweep per the orchestrator's instruction, not a RED/GREEN
    pair). `oklchContrast.test.ts` passed immediately (the helper
    implementation predates this slice — pinned, not a RED/GREEN cycle).
  - GREEN: `tests/unit/theme/` 27/27 passing after the CSS + component
    changes. Full suite: `npx tsc --noEmit` and `npx tsc -p
    tests/tsconfig.json --noEmit`: 0 errors. `npm run lint`: 0
    errors/warnings. `npm test` (Jest): 1508/1515 — same 3 pre-existing
    unrelated `tests/e2e/chatbotFlow.test.ts` live-network failures
    (documented in `MEMORY.md`), no new failures. `npm run test:vitest --
    run`: 156/156 (155 before S3 → 156 after, +1 net: the new
    `CartaDigitalBeneficiosSection.test.tsx` assertion).
- **Regression check:** `tests/unit/accentTokens.contrast.test.ts` and
  `tests/unit/lightModeContrast.tokens.test.ts` keep their own older,
  deliberately-unclamped local OKLCH math (per their own file-header
  comments) and assert exact values only for `--color-icon-*`,
  `--color-primary`, `--color-success-text` and `--color-accent-strong`
  (via `tests/unit/a11y/contrastTokens.test.ts`, using the shared helper)
  — none of those tokens changed in this slice, and the one indirectly
  affected check (`--color-accent-strong` vs `--color-accent-hover`
  visual-distinctness, ≥0.02 L points) still passes: dark
  `0.50 - 0.45 = 0.05`, light `0.42 - 0.45 = 0.03` (both ≥0.02).
  `scripts/critical-css.mjs`'s `collectThemeTokenCss` slices `:root`/
  `.light` from the built CSS by selector, not by value, so it picks up
  the new token values automatically — no edit needed (confirmed by
  reading the function; did not run `npm run build` locally, per the
  global no-build rule).
- **T3.6 [Manual, not part of apply]:** visual check in both themes —
  `.btn-primary`, the chat header, `DashboardPreview`'s "Plan Pro" card,
  the carta step numbers — not performed by the agent; flagged for the
  owner/reviewer before merge.
- **T3.9 [Manual-verify, post-deploy, not part of apply]:** Lighthouse
  a11y on `/carta-digital` and `/tpv-restaurantes`, both themes — remains
  outstanding until after deploy.

## S5 — Public settings read without the Supabase SDK — 2026-10-05

- **BEFORE:** `settingsService.getAppSettings()` resolved the Supabase SDK client through `getSupabase()`. `useWhatsappPhone` (mounted on almost every public page through `WhatsAppCta`) and `Contact.tsx` therefore pulled the `vendor-supabase` chunk onto every public page just to read one settings row. Each kept its own cache.
- **CHANGE:**
  - `src/shared/services/settingsService.ts` reads `app_settings?id=eq.global&select=*` with a plain PostgREST `fetch`. The query is the same as the previous `.eq("id","global").single()`.
  - The request uses anon key headers and a 5 s `AbortController` timeout, and validates the response shape before use.
  - One `memoizeAsync` cache is shared by all public consumers. A rejected call is not cached, so the next call retries.
  - `useWhatsappPhone` drops its local cache.
  - The admin Supabase client is untouched. The chatbot RAG backend still loads the SDK lazily, on the first open of the widget.
- **AFTER:** tests show one settings request per page load, even with `Contact` and `WhatsAppCta` mounted together. The guard test `tests/unit/shared/settingsServiceNoVendorSupabase.guard.test.ts` keeps Supabase SDK references out of the public settings path.
- **REGRESSION CHECK:**
  - `npx tsc --noEmit` passes for the root and `tests/` configs.
  - `npm run lint` is clean.
  - Jest: 1364 passed, 43 skipped (dist-dependent suites; no fresh `dist/`), 3 failing. The 3 failures are the known `tests/e2e/chatbotFlow.test.ts` tests, which depend on the live network.
  - Vitest: 165/165.
  - The no-number fallback (the WhatsApp CTA falls back to the contact form) is unchanged: on error, `getAppSettings()` still returns the default empty settings.

### Post-deploy PSI (mobile, Linux), 2026-10-05 ~14:20, with S1–S3 live

| Page | Perf | TBT | FCP | LCP | CLS | A11y / BP / SEO |
|---|---|---|---|---|---|---|
| /carta-digital, before | 75 | 390 ms | 3.2 s | 3.5 s | 0.014 | 100 / 92 / 100 |
| /carta-digital, after | **99** | **50 ms** | 1.7 s | 1.7 s | 0.014 | 100 / 100 / 100 |
| home, before | 94 | 110 ms | 1.7 s | 2.7 s | 0.049 | 100 / 100 / 100 |
| home, after | **97** | 100 ms | 1.8 s | 1.8 s | 0.053 | 100 / 100 / 100 |

All success criteria in proposal.md are met: carta TBT < 200 ms, Perf ≥ 85, Best Practices 100, and no home regression. The home CLS of 0.053 is within noise and well under 0.1. F-02 is closed.
