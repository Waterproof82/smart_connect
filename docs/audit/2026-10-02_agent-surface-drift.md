# Agent Surface Route Drift — 2026-10-02

**Timestamp:** 2026-10-02
**Change:** `openspec/changes/agent-surface-drift`
**Scope of this entry:** Single PR (all 6 phases of `tasks.md`, except the manual post-deploy smoke test 6.5).

## Why

6 of the 9 live pages never returned Markdown to `Accept: text/markdown` agents, and WebMCP's `get_page_content_markdown` tool offered the dead `/contacto` route. Root cause: the agent-surface route allowlist was hand-copied across 4 independent files (`middleware.ts`, `vite-plugin-md-negotiation.ts`, `api/negotiate.mjs`, `src/WebMCP.ts`), each one drifting from `scripts/site-routes.json` (the sitemap/prerender source of truth) with nothing forcing them to agree. `middleware.ts` also still ran on the deprecated `@vercel/edge` runtime.

## Actions taken

1. **New `src/shared/config/agentRoutes.ts`**: `AGENT_PAGE_PATHS` (array) and `isAgentPagePath(path)` derived from `scripts/site-routes.json` via a static import. Pure module, no Node libs, safe to import from both the client bundle (WebMCP) and the dev-only Vite plugin.
2. **`middleware.ts`** (D1/D2): matcher is a static 9-path literal (Vercel extracts `config` via static analysis, so it cannot be computed at runtime); `export const config = { runtime: "nodejs", matcher }`; swapped `@vercel/edge`'s `next`/`rewrite` for the identical exports from `@vercel/functions` (verified by inspecting `node_modules/@vercel/functions/middleware.d.ts` before editing — same signatures, drop-in replacement, no header-fallback needed). Non-markdown passthrough behavior is unchanged.
3. **`api/negotiate.mjs`** (D3/D7/D8): imports `scripts/site-routes.json` directly via `with { type: "json" }` (Node 22+ import attributes; Vercel's file-tracing follows the static import edge); exports `MARKDOWN_ROUTES` and `isMarkdownRoute`. Deleted the duplicated `PAGE_TITLES` map — the title now comes from the prerendered `<title>`, falling back to the literal `"SmartConnect AI"`. Any `?path=` outside the allowlist is rejected with a 404 Markdown body *before* any filesystem access, replacing the old `_spa.html` fallback — this also closes a `?path=../../etc/passwd`-style traversal (OWASP A01), since the allowlist check short-circuits before `fs.readFileSync` ever runs.
4. **`src/WebMCP.ts`** (D4): `get_page_content_markdown`'s `path` enum is now `[...AGENT_PAGE_PATHS]`, replacing the hand-written array that still listed the dead `/contacto` and was missing 5 live routes. The 2 `get_contact_info` string literals (pointing at the live `#contacto` anchor) are untouched — out of scope, already fixed in a prior change.
5. **`vite-plugin-md-negotiation.ts`** (D4): replaced the inline `pageRoutes` literal with `isAgentPagePath` from `agentRoutes.ts`, imported with an explicit `.ts` extension to avoid Vite's native config-loader resolution warning.
6. **`vite.config.ts`** (D6): the `vite-plugin-md-negotiation` import now uses an explicit `.ts` extension for the same reason.
7. **`package.json`**: `@vercel/edge` removed from `devDependencies` (verified by repo-wide grep that `middleware.ts` was its only importer); `@vercel/functions@^3.9.9` added to `dependencies` (it runs at request time, not build time). `package-lock.json` updated via `npm install`/`npm uninstall`.
8. **New `tests/unit/agentSurfaceParity.test.ts`**: single guard covering all 4 consumers plus `vite.config.ts`'s import extension — fails if any consumer's route set diverges from `scripts/site-routes.json` in either direction (missing live route or lingering dead route).
9. **New `tests/unit/scripts/negotiateApi.test.ts`**: `node --input-type=module` subprocess tests (same pattern as `tests/unit/scripts/sitemapGeneration.test.ts`) exercising `negotiate.mjs`'s real handler — known-path 200 with title extraction, title fallback, unknown-path 404 with no dead quick-links, and the path-traversal regression case.
10. **`tests/unit/napAndAgentSurfaces.test.ts`**: only the deferral comments (previously pointing at this change as *future* work) were rewritten to reflect that the WebMCP enum parity work is now implemented and guarded by `agentSurfaceParity.test.ts`. The 2 `#contacto` assertions are byte-for-byte unchanged and still pass.

## TDD evidence (strict mode, RED → GREEN)

| Task | Test file | RED cause | GREEN fix |
|------|-----------|-----------|-----------|
| 1.2/1.3 | `tests/unit/agentSurfaceParity.test.ts` | `@shared/config/agentRoutes` module did not exist (Jest config error) | created `agentRoutes.ts` |
| 2.1/2.2 | same (middleware describe block) | matcher had the old drifted 10-path list, no `runtime`, imported `@vercel/edge` | rewrote `middleware.ts`'s `config` + import |
| 3.1/3.2 | `tests/unit/scripts/negotiateApi.test.ts` | `negotiate.mjs` exported neither `MARKDOWN_ROUTES` nor `isMarkdownRoute`; unknown-path handler returned 200 via `_spa.html` | rewrote `negotiate.mjs` per D3/D7/D8 |
| 3.3 | same (path-traversal case) | same (no allowlist check existed) | same |
| — (triangulation) | same (known-path 200 + title-fallback cases) | n/a — added for real-behavior coverage of the GREEN implementation, not hardcoded Fake It | confirmed real file I/O + regex title extraction, not a trivial pass |
| 4.1/4.2 | same (WebMCP describe block) | enum was a hand-written 6-path array still containing `/contacto` | `get_page_content_markdown` enum → `[...AGENT_PAGE_PATHS]` |
| 4.1/4.3 | same (plugin describe block) | `pageRoutes` was a hand-written 10-path array (drifted) | replaced with `isAgentPagePath` |
| 5.1 | same (vite.config.ts describe block) | import had no `.ts` extension | added explicit extension |
| 5.2 | `tests/unit/napAndAgentSurfaces.test.ts` (pre-existing) | comment-only change; the 4 existing assertions already passed and were re-run unchanged to prove no regression | rewrote deferral comments |

Triangulation note: tasks 1.2/1.3 (`agentRoutes.ts`) are purely structural (one JSON source, one array derivation, no branching) — covered by a length sanity check plus a full deep-equal against the live JSON, per the Strict TDD module's skip-with-note allowance.

## Verification

- `npx jest` — 1159 passed, 3 failed, 13 skipped (93 suites). The 3 failures are all in `tests/e2e/chatbotFlow.test.ts` (network/Supabase-dependent E2E expecting a live backend — pre-existing on `develop`, unrelated to and untouched by this change).
- `npm run test:vitest -- --run` — 107 passed, 0 failed (22 files).
- `npx tsc --noEmit` — clean.
- `npm run lint` (`eslint . --ext ts,tsx --max-warnings 0`) — clean; explicitly re-linted `middleware.ts`, `vite-plugin-md-negotiation.ts`, `src/shared/config/agentRoutes.ts`, `src/WebMCP.ts` individually to confirm (`vite.config.ts` is excluded by the project's own ESLint ignore pattern, pre-existing).
- `api/negotiate.mjs` is plain `.mjs`, outside the configured ESLint/tsc scope — consistent with `scripts/sitemap.mjs`/`scripts/critical-css.mjs` in prior changes; verified instead via the Node subprocess tests above.

## Deviations from design.md

- None of substance. One ordering deviation from `tasks.md`'s literal phase order: task 1.4 (remove `@vercel/edge` from `devDependencies`) was executed *after* Phase 2.2 (rewriting `middleware.ts`'s import), not immediately after 1.1-1.3, per this apply batch's own Project Standards gate ("Remove `@vercel/edge` devDependency only once nothing imports it"). The final state matches `tasks.md` and `design.md` exactly; only the sequencing within the single commit batch differs.
- `vite-plugin-md-negotiation.ts`'s own import of `agentRoutes.ts` was also given an explicit `.ts` extension (not explicitly required by `tasks.md` 4.3, only by 5.1 for `vite.config.ts`'s import). This removed half of a new Vite native-config-loader warning introduced by Phase 4's import chain. The other half of that warning — `agentRoutes.ts`'s JSON import lacking `with { type: 'json' }` — was deliberately left as-is: `design.md` D5 explicitly rejected import attributes there because `ts-jest`'s CJS-oriented transform rejects them (TS2821), which would have broken Jest's ability to import `agentRoutes.ts` from `WebMCP.ts`. This residual warning is a known, accepted design tradeoff, not a regression.

## Risks / follow-ups for verify

- Task 6.5 (manual post-deploy smoke test: 9 routes return `text/markdown` with correct titles, `/api/negotiate?path=/contacto` returns 404, a plain `curl` of `/tarjetas-nfc` returns `text/html`, no edge-runtime deprecation warning in the Vercel build log) is explicitly out of scope for this apply batch — it requires a live preview/production deployment and is the orchestrator/user's responsibility per the proposal's Success Criteria.
- `api/negotiate.mjs`'s `import ... with { type: "json" }` (Node 22+ import attributes) was verified to work correctly in the Node subprocess tests (Node v24 in this environment) but has not been verified against Vercel's actual Node runtime version for serverless functions — flagging for the post-deploy smoke test.
