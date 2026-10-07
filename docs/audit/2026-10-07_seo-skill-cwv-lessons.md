# Audit — `seo-geo-expert` skill: Core Web Vitals lessons

- **Timestamp:** 2026-10-07T19:00 WEST
- **Branch:** `docs/seo-skill-cwv-lessons` (base `develop`)
- **Type:** documentation only (project skill). No code changes.

## Why

The owner asked for every SEO and best-practice finding from the 2026-10-07 session to be recorded in the project skill `.claude/skills/seo-geo-expert`. That session covered the SDD changes `core-web-vitals-perf` and `font-stability` and PRs #135–#141. On PSI, desktop went from 66 to 100 and mobile from about 88 to 95–96, with CLS at 0.

## Changes

| File | Change |
|---|---|
| `references/performance-cwv.md` | **Evidence:** the lab score does not depend on indexing, and "Sin puntuar" diagnostics don't count toward the score (metric weights listed). **New section "lessons from 2026-10-07":** median of several runs from the same PSI region, `benchmarkIndex` for local runs, bimodal LCP diagnosis, Lantern + `font-display: optional` + preload, CLS inside "Agentic navigation", and measuring eager gzip bytes before crediting a chunking change. **New section "Fonts and CLS":** self-hosting, fallback faces with only `local()`, `size-adjust` calibrated by measurement, `text-wrap` on the LCP heading, unused variable-font axes, and post-hydration `position: fixed` elements. |
| `references/findings-log.md` | **Closed:** F-05, plus new F-10 and F-11, with PRs and PSI evidence. **New open INFO:** F-13 (entry chunk and critical CSS size) and F-14 (`font-black` 900). **Updated:** F-09, the chatbot still returns 500. |
| `references/regression-testing.md` | New table of CWV guard tests. Three local-verification traps: stale `dist/`, the `/admin` rewrite missing in `vite preview`, and the bare `build` entry in `.gitignore`. |

## Verification

- Every test path cited in `regression-testing.md` exists in the repo (checked with a shell loop).
- The PSI figures cited come from the runs made during the session, from the browser in Spain: mobile 96/95, desktop 100.
