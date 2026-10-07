# Audit Log — Post-Hydration Fixed-Element Mount Gate (PR 3 of 3: font-stability)

**Date:** 2026-10-07
**Change:** SDD `font-stability`
**Type:** Performance/CLS fix (Changed)
**Branch:** `feat/font-stability-fixed-mount-gate` (base: `develop`, independent PR — not stacked on PR1/PR2's unmerged branches)

## Summary

Third of three independent PRs (user-resolved delivery strategy: three independent PRs from
`develop`, chain strategy `stacked-to-main`, each individually revertable) addressing font-driven
and layout-driven CLS. This PR stops `CookieConsent` (banner + reopener) and
`DeferredExpertAssistant` (chat FAB) from mounting before the deferred, non-critical app
stylesheet has applied:

1. New `src/shared/utils/appStylesheet.ts` exports `APP_STYLESHEET_DEFERRED_SELECTOR` — the exact
   CSS selector matching the `<link media="print">` `scripts/critical-css.mjs`'s
   `deferStylesheetLink` writes — and `onAppStylesheetApplied(callback, doc?)`, which fires once
   that link's `load` or `error` event has happened, or immediately/synchronously when there's
   nothing to wait for: no such link exists (no-SSR `dist/_spa.html`, whose stylesheet is a plain
   blocking `<link>`, or dev), or the link had already finished before this ran (`link.sheet` set,
   or `media` already swapped away from `"print"`).
2. New `src/shared/hooks/useAppStylesheetApplied.ts` wraps it as an SSR/hydration-safe hook:
   `false` on the server and the first client render, `true` once applied — same pattern as the
   pre-existing `useIdleOrInteraction`.
3. `CookieConsent.tsx` calls the hook unconditionally (hook rules) before its existing early
   returns, and gains one more: `if (!stylesheetApplied) return null;`, placed after the
   `status === "unknown"` check (regression-tested to stay in place) and before the
   banner/reopener branch.
4. `DeferredExpertAssistant.tsx`'s idle-mount condition becomes
   `(idleOrInteracted && stylesheetApplied) || openedEarly` — the pre-existing `openedEarly`
   (user-initiated, via `OPEN_ASSISTANT_EVENT`) path bypasses the gate, per design.md's rationale
   that user input is excluded from CLS scoring (`hadRecentInput`).

## What was implemented (Strict TDD, RED confirmed before GREEN)

| Task | File(s) | RED → GREEN |
|---|---|---|
| 3.1–3.2 | `src/shared/utils/appStylesheet.ts`, `appStylesheet.test.ts` (new) | 10 cases written first against a non-existent module — confirmed RED via `Cannot find module './appStylesheet'`. This repo's Jest config has no jsdom (`testEnvironment: "node"`), so the tests exercise `onAppStylesheetApplied`'s injectable `doc` parameter with a hand-written fake link/doc (no real DOM anywhere) — exactly what that parameter exists for. Implemented `onAppStylesheetApplied`: calls back immediately when no link is found, or when `link.sheet` is already set, or when `link.media !== "print"` (covers the already-applied race); otherwise attaches `load`/`error` listeners (once-only via a `settled` flag) and returns a cleanup that detaches both. 10/10 pass. |
| 3.3–3.4 | `src/shared/hooks/useAppStylesheetApplied.ts`, `.test.tsx` (new) | 6 cases written first (Vitest/jsdom, matched by `vite.config.ts`'s `src/shared/hooks/**/*.test.tsx` include) against a non-existent module — confirmed RED via Vite's "Failed to resolve import" error. Tests create real `<link>` elements in jsdom and dispatch real `load`/`error` events, plus a `renderToString` case proving `false` under SSR with zero DOM access (#421-safety). Implemented `useAppStylesheetApplied` as a thin `useState`/`useEffect` wrapper around `onAppStylesheetApplied`, mirroring `useIdleOrInteraction`'s shape. 6/6 pass. |
| 3.5–3.6 | `src/shared/components/CookieConsent.tsx`, `tests/unit/shared/CookieConsent.structure.test.ts` | 3 source-text assertions added first (this file is Jest/node, no jsdom — source-text checks only, same convention as the rest of the suite): imports `useAppStylesheetApplied`; calls it (by source-index) before the first `return null;`; has `if (!stylesheetApplied) return null;`. Confirmed RED: 3/18 failed against the unmodified component. Implemented: hook call added as the component's first line, new early return added right after the existing `status === "unknown"` check (that check's own regression test — already present — stays green, proving the new gate didn't replace it). 18/18 pass. |
| 3.7–3.8 | `src/features/chatbot/presentation/DeferredExpertAssistant.tsx`, `__tests__/DeferredExpertAssistant.test.tsx` | 3 new behavioral cases added first, with `useAppStylesheetApplied` mocked at its own import path (`vi.mock("@shared/hooks/useAppStylesheetApplied", ...)` — its own detection logic has its dedicated suite above, this file only tests the component's gating decision): idle-but-not-applied → stays empty; idle-and-applied → mounts; `openedEarly` bypasses the gate even when not applied. Confirmed RED: 1/8 failed (idle-but-not-applied still mounted) against the unmodified component; the other 2 new cases passed trivially against old behavior (expected — they don't yet prove the gate exists on their own). Implemented: `readyToMount = (idleOrInteracted && stylesheetApplied) || openedEarly`, used for both the early-return check and the `OPEN_ASSISTANT_EVENT` listener's own early-exit. 8/8 pass. |
| 3.9 | `tests/unit/scripts/criticalCssOutput.test.ts` | New contract suite (RED+GREEN in one — no new source to implement, this binds two already-correct pieces together so they can't drift independently). `scripts/critical-css.mjs` is plain ESM with no TS/JSX, so it reuses `criticalCss.test.ts`'s `runScript` subprocess pattern (`node --input-type=module`) rather than a direct `ts-jest` import. Runs `deferStylesheetLink` on a sample page, extracts every `<link>` tag via regex, and checks each against a tiny purpose-built attribute-selector matcher (NOT a general CSS engine — this repo has no jsdom-under-Jest capability, see `indexHtml.consentMode.structure.test.ts`'s header comment on why) that interprets `APP_STYLESHEET_DEFERRED_SELECTOR` itself (tag + `[attr="value"]`/`[attr^="value"]` conditions) rather than hardcoding its shape. Asserts exactly one match post-deferral, zero matches pre-deferral. 2/2 pass immediately (both pieces were already correct from 3.1–3.8; this is the drift-proofing contract, not a fix). |
| 3.10 | — (no file change) | Confirmed, not a code change: `CookieBanner.tsx`'s and the reopener/FAB's fixed-geometry classes (`fixed inset-x-0 bottom-0 z-[250]`, `fixed bottom-[...] left-4 md:bottom-4`, `fixed bottom-[...] right-4 md:bottom-8 md:right-8 z-[100]`) are theme-independent Tailwind utilities — only their `--color-*` custom-property values differ between `.light`/dark, and those live in the SAME deferred stylesheet the new gate waits for. Since the gate waits for that one stylesheet to finish applying (not for a specific theme), geometry and theme-dependent colors always arrive together, under either theme — no asymmetry possible by construction. No new test needed; the existing `CookieConsent.structure.test.ts` checks already cover the geometry class strings and they are unchanged by this PR. |
| 3.11 | `CHANGELOG.md`, this file | Per protocol. |

## Verification (this apply batch — `sdd-verify` still owns the full build-based check)

- `npx tsc --noEmit` — clean.
- `npm run lint` — clean, 0 errors/0 warnings.
- `npm test` (full Jest suite) — **1482/1537 pass**, **52 skipped** (dist-gated
  `criticalCssOutput.test.ts` guards — a stale gitignored `dist/` leftover from a prior session was
  removed so these skip gracefully, same precedent as the PR1/PR2 apply batches; full build-based
  dist verification is explicitly deferred to `sdd-verify` per design.md), **3 pre-existing
  failures** in `tests/e2e/chatbotFlow.test.ts` (live RAG chatbot API returning 500 — unrelated to
  this change, same failures seen in every prior apply batch this session).
- `npx vitest run` (full Vitest suite) — **177/177 pass**, 32 test files, including the 2 new
  suites (`appStylesheet` has no Vitest counterpart — it's Jest-only per its no-jsdom design) and
  all 3 extended suites.
- `npm run build`/`vite build` was **not** run (user rule: never build after changes). The
  dist-gated output checks, and any production CLS measurement (DevTools Performance trace, "no
  intermediate normal-flow render" scenario from spec.md), are deferred to `sdd-verify`.
- Manual source review: `CookieConsent.tsx`'s hook-call ordering (hooks rule — unconditional, no
  early return before it) and `DeferredExpertAssistant.tsx`'s `readyToMount` boolean are both used
  consistently for the render gate AND the `useEffect`'s own early-exit, so the
  `OPEN_ASSISTANT_EVENT` listener is torn down the instant either idle+applied or openedEarly makes
  mounting unconditional — no dangling listener after mount.

## Review budget

`git diff --cached --stat` (excluding this audit doc, not yet staged): **10 files changed, 532
insertions(+), 5 deletions(-)**. This is above the tasks artifact's PR3 forecast (~280 lines) and
above the 400-line review-budget guideline. Breakdown: ~145 lines are production code
(`appStylesheet.ts` 86, `useAppStylesheetApplied.ts` 28, `CookieConsent.tsx` +14,
`DeferredExpertAssistant.tsx` net +17) and ~385 lines are test code across 3 new/extended test
files, consistent with Strict TDD authoring a dedicated RED suite per new module plus gating
assertions in the 2 existing component suites. Flagged here for the reviewer/`sdd-verify`: this
slice was kept as one deliverable (a single feature — the mount gate — touching its 2 consumers)
rather than split further, since the util, its hook, and both call sites are not independently
revertable/meaningful on their own. No `size:exception` was pre-declared for this run; the
maintainer should treat this review-budget overrun as a flag to resolve at review time (e.g.
accept as `size:exception` given the test-to-code ratio, or request a smaller slice) rather than a
silent pass.

## Untouched (hard constraints, carried from design/spec)

Consent Mode v2 + deferred `gtag` loader (`index.html`'s inline `<script>`), consent banner
behaviour/labels (AEPD: Accept/Reject equal prominence — `CookieBanner.tsx` untouched), the
`status === "unknown"` SSR/hydration-safety check (still present, still first), light-mode
no-flash handling, WebMCP scheduling (PR3 of the separate `core-web-vitals-perf` change, already
merged to `develop`), PR1 (DM Sans wght-only) and PR2 (`.ds-h1` fallback metrics) of this same
`font-stability` change — both on their own unmerged branches, not based on here.

## Next

No further PR in this SDD change. `sdd-verify` owns the build-based checks for all three PRs
(DM Sans payload, h1 fallback metrics, fixed-element mount gate) before any of them merge.
