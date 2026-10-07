# Audit — Drop DM Sans preload

- **Timestamp:** 2026-10-07T18:45 WEST
- **Branch:** `perf/drop-dm-sans-preload` (base `develop`)
- **Type:** performance follow-up to the SDD changes `core-web-vitals-perf` and `font-stability`

## Context

These are post-deploy PageSpeed Insights results after `font-stability` (PRs #138–#140):

| Form factor | Runs | Result |
|---|---|---|
| Desktop | 1 | 100, CLS 0.004 |
| Mobile | 5 | 99, ~88, ~85, ~76, ~74. CLS 0 on every run. |

On mobile, the LCP element depended on the run:

- **99 run:** `h1.ds-h1`, LCP 1.4 s.
- **Other runs:** `p.ds-lede`, with an element render delay of up to 2.5 s and LCP of 2.9–4.8 s.

## Root cause

Lighthouse does not run on a throttled network. It runs an unthrottled pass, then simulates slow 4G from that trace.

- When the preloaded DM Sans file (36.9 KB) arrived inside the ~100 ms `font-display: optional` block window during that unthrottled pass, the lede was painted in DM Sans and became the largest text element.
- The simulation then put the font request in the LCP dependency chain, so the LCP came out late.
- When the font missed the window, the h1 (Space Grotesk, preloaded) remained the LCP element.

## Change

- `index.html`: removed the DM Sans `<link rel="preload" as="font">`. The Space Grotesk preload is kept.
- `tests/unit/perf/fontSelfHosting.test.ts`: the assertion now requires exactly one font preload, the Space Grotesk latin face. TDD: it failed first (1 failed / 12 passed), then passed after the change.

## Verification

- Full `npm test`: 1488 passed, 52 skipped (dist-gated), 3 failed. The 3 failures are the existing unrelated `tests/e2e/chatbotFlow.test.ts` failures (live API 500).
- No build was run, following the user rule. Post-deploy PSI is the acceptance check.

## Tradeoff and rollback

- **Tradeoff:** on slow first visits the body text is more likely to stay in the metric-matched fallback for that page view. From the second page view on, DM Sans is served from cache.
- **Rollback:** restore the single `<link>` in `index.html` and set the test back to 2 preloads.
