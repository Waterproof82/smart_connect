# Added `seo-geo-expert` project skill

**Timestamp:** 2026-10-02 UTC
**Scope:** `.claude/skills/seo-geo-expert/`
**Type:** implementation

## Actions
- Created the project skill `seo-geo-expert` (`SKILL.md` plus six reference files) from the user-supplied SEO/GEO/Google Search prompt.
- Restructured the prompt into a lean entry point with progressive disclosure: technical audit, content/entity/E-E-A-T, GEO/AEO, structured data, Search Console/GA4/local/international, and report templates.
- Corrected points that would otherwise mislead: Next.js sections made conditional (project is React + Vite with custom SSR), FAQ rich results restricted by Google, HowTo retired, `llms.txt` not used by Google Search, no special markup for AI Overviews/AI Mode, self-serving review markup prohibited.
- Added project context: official domain `https://digitalizatenerife.es/`, `Content-Signal` consistency, `llms.txt` sha256 sync, prior GSC audit reference.

- Iteration 2 (review feedback): added source-authority hierarchy, Google Search Essentials gate, evidence levels E0-E5, PASS/FAIL/WARNING/NOT VERIFIED/NOT APPLICABLE statuses, Before/Change/After/Regression rule, NO CHANGE REQUIRED rule, Rendering Triad, canonical reconciliation, URL Inspection as evidence, query-to-URL analysis, temporal comparison, SEO regression testing, Citation Readiness, non-numeric Quality Gate.
- Reclassified `llms.txt` as an experimental, non-standard resource (never equivalent to robots.txt/sitemap/canonical; label EXPERIMENT/OPTIMIZATION).
- Split references into dedicated files: rendering-javascript-seo, performance-cwv, accessibility, security, spam-policies, validation-protocol, regression-testing.
- Iteration 3: converted the SEO regression checklist into automated Jest tests (`tests/unit/seo/seoSources.regression.test.ts`, `tests/unit/seo/prerenderedSeo.regression.test.ts`) and documented them in `references/regression-testing.md`.
- Finding (not fixed, out of scope): `/ia-chatbots-tenerife` jumps from H1 to H3 (four H3 cards before the first H2). Fixed in iteration 4: the four cards in `IaChatbotsPage.tsx` are now `<h2>` (same `ds-h3` styling); the temporary `it.failing` exception was removed.
- Finding: `CLAUDE.md` still lists `.well-known` files (`api-catalog`, `openid-configuration`, `oauth-protected-resource`, `jwks.json`) that no longer exist in `public/.well-known/`; the tests assert only what is published. Fixed in iteration 4: `CLAUDE.md` now documents the files actually published.
- Iteration 4: added a CI step running `tests/unit/seo` after `npm run build` so the dist-based checks are not skipped in CI.
- Iteration 5: GitHub Actions run 36983301445 (workflow_dispatch on develop) failed in `npm test` because `describe.each` received an empty array when `dist/` was absent. Fixed by registering the prerender suite only when `dist/` exists; verified with and without `dist/`.

## Validation
- `npm test`: 85 suites passed, 2 skipped (1225 tests passed). `npm run lint` and `npm run type-check`: pass. `npm run build` run to generate `dist/` for the prerender tests.
- Mutation checks: disallowing `/` in robots.txt and altering a built canonical each made the new tests fail, as intended.

## Follow-ups
- Invoke the skill in a new session (`/seo-geo-expert`) and refine on first real use.
