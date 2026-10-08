# Audit — RAG Knowledge-Base Refresh, Unit 4: Markdown Extraction

**Date:** 2026-10-07
**SDD change:** `rag-knowledge-base-refresh`
**Unit:** 4 of 8 (per tasks artifact `sdd/rag-knowledge-base-refresh/tasks`)
**Branch:** `feat/rag-unit4-markdown-extract` (from `develop` — independent of Units 1-3's files)
**Mode:** Strict TDD (RED → GREEN → REFACTOR)

## What changed

### Shared extraction module (D8)
- New `scripts/markdown-extract.mjs` (pure, no `fs`/Deno/Vercel imports — a
  string-in/object-out module) + `tests/unit/scripts/markdownExtract.test.ts`
  (8 tests, run via the repo's established Node-subprocess convention for
  plain-ESM `.mjs` scripts — see `tests/unit/scripts/lastmod.test.ts`).
- `extractPageMarkdown(html, { route, scope, fallbackTitle })`:
  - `scope: "root"` (default) — reproduces `api/negotiate.mjs`'s pre-refactor
    inline logic exactly: `<title>`/meta-description regex extraction, the
    `<div id="root">...</div>` capture regex, the same 6-step React
    hydration/SSR-marker strip chain, Turndown conversion (identical
    `TurndownService` options), and the same canonical source-footer
    assembly.
  - `scope: "main"` — extracts only the `<main>...</main>` tag's content;
    strips any nested `<script type="application/ld+json">` and `<nav>`
    blocks found inside it; falls back to the `scope: "root"` extraction
    when no `<main>` tag exists. For the upcoming ingestion pipeline
    (Unit 5/7) — not wired to any caller yet.
  - `fallbackTitle` is a required-by-convention caller-supplied string (not
    hardcoded) specifically so this shared module never embeds a historical
    brand string itself — see Deviation below.
- `extractFaqJsonLd(html)`: scans every JSON-LD `<script>` block, parses it,
  and collects `FAQPage` nodes whether they appear top-level (seen in
  `SeoFaqSchema`) or nested inside an `@graph` array (seen in
  `buildHomeSchema`) — both shapes exist in `SeoSchema.tsx`. Returns
  `{question, answer}[]`. Not wired to any caller yet (Unit 7).

### `api/negotiate.mjs` refactor
- Replaced the inline title/description/root-content/hydration-marker/
  Turndown logic with a single call:
  `extractPageMarkdown(html, { route: cleanPath, scope: "root", fallbackTitle: "SmartConnect AI" })`.
  Removed the now-unused direct `turndown` import (moved into the shared
  module).
- No other line in `negotiate.mjs` changed: header-setting, the 404
  not-found path, the catch-block fallback markdown, and
  `MARKDOWN_ROUTES`/`isMarkdownRoute` are untouched.

## Why

Spec `sdd/rag-knowledge-base-refresh/spec`, PR2 "Dual-Source Ingestion
Pipeline" needs a Node-readable HTML→Markdown extractor the ingestion script
can reuse for the built site's pages, without duplicating (and risking
drifting from) the extraction logic `api/negotiate.mjs` already has in
production. Design D8 specifies pulling that logic into
`scripts/markdown-extract.mjs` with a `scope` parameter so one module serves
both call sites with their different needs (negotiate wants the exact
existing output; ingestion wants cleaner body-only content).

## Parity proof (byte-identical requirement)

`tests/unit/scripts/negotiateApi.test.ts` — the pre-existing parity/behavior
suite for `api/negotiate.mjs` — was run **unmodified** after the refactor.
All 9 tests still pass, including the exact-string assertions on the 200
response body, the `Link`/`X-Robots-Tag`/`Vary` headers, the home-path
canonical URL, and the `"SmartConnect AI"` title fallback. This is the parity
contract: no new negotiate-specific test was needed because the existing
suite already pins byte-for-byte output.

## Deviation from literal design wording

Design D8 doesn't mention a `fallbackTitle` parameter. Implementing it was
necessary once `src/__tests__/brand.guard.test.ts` (a hard regression gate,
empty allowlist, scans `src/`, `public/`, **and `scripts/`**) caught the
literal `"SmartConnect AI"` fallback-title string once it was copied as-is
into `scripts/markdown-extract.mjs` (previously it only lived in
`api/negotiate.mjs`, which the guard does not scan). Fix: the shared module
takes `fallbackTitle` as an injected option (default `"Untitled Page"`, a
non-brand placeholder), and `api/negotiate.mjs` is the only caller that
passes the legacy `"SmartConnect AI"` literal — keeping that historical copy
local to the one file that needs it for byte-identical output, per the
guard's own stated intent.

## TDD evidence

| # | Area | RED | GREEN |
|---|---|---|---|
| 1 | `extractPageMarkdown` scope `root` (title/description/footer) | `Cannot find module './markdown-extract.mjs'` | implemented; test passes |
| 2 | `extractPageMarkdown` scope `root` hydration-marker stripping | same RED (module missing) | implemented; test passes |
| 3 | `extractPageMarkdown` scope `main` (nav/footer exclusion) | same RED | implemented; test passes |
| 4 | `extractPageMarkdown` scope `main` (JSON-LD/nav strip inside `<main>`) | same RED | implemented; test passes |
| 5 | `extractPageMarkdown` scope `main` fallback to `#root` | same RED | implemented; test passes |
| 6 | `extractFaqJsonLd` — `@graph`-nested `FAQPage` | same RED | implemented; test passes |
| 7 | `extractFaqJsonLd` — top-level `FAQPage` | same RED | implemented; test passes |
| 8 | `extractFaqJsonLd` — no `FAQPage` present | same RED | implemented; test passes |

All 8 tests confirmed RED together (module did not exist), then GREEN
together on first implementation — no refactor cycle needed for the
extraction logic itself. One post-GREEN regression was caught and fixed
before this unit was considered done: the brand guard failure described
above (not a TDD cycle on `markdown-extract.mjs`'s own tests, but a
repo-wide regression gate run as part of full verification).

## Full verification

- `npx jest tests/unit/scripts/negotiateApi.test.ts tests/unit/scripts/markdownExtract.test.ts tests/unit/agentSurfaceParity.test.ts` → 28/28 passed (run in isolation first, to confirm parity + new tests before the full suite).
- `npx jest` (full suite) → 129 of 130 suites (1 skipped, pre-existing — unrelated to this unit), 1548 passed, 0 failed. Includes the brand guard (`src/__tests__/brand.guard.test.ts`), fixed as described above.
- `npx tsc --noEmit` → clean.
- `npm run lint` → clean (ESLint scope is `--ext ts,tsx`; `.mjs` scripts are not linted by this command, consistent with every other `scripts/*.mjs` file in the repo).
- `npx vitest run` not run — no `.tsx`/Vitest-covered file was touched in this unit.

## Scope boundary (explicitly NOT touched in this unit)

- `vite-plugin-md-negotiation.ts` (the dev-mode SSR equivalent of
  `api/negotiate.mjs`) still has its own inline Turndown/title/description
  assembly logic, independently. It was not in Unit 4's task list and
  touching it would have expanded this unit's blast radius beyond the
  assigned "negotiate parity" scope; it can be folded into the shared
  module later if desired, as a separate, explicit task.
- Nothing wires `scope: "main"` or `extractFaqJsonLd` to any real caller yet
  — that's Units 5 and 7 (chunker/curated parser and the ingestion
  orchestrator), which this unit's module is built to support but does not
  yet invoke.
- Chunking, curated-content parsing, hashing, schema migrations, the
  ingestion orchestrator itself (Units 5-8) — untouched.

## Owner action required

None. This unit only touches `scripts/` and `api/` source files plus tests
and docs — no new environment variables, no deploy step, no database
change. `api/negotiate.mjs` ships to production automatically as part of
Vercel's normal deploy on merge to `main`; its HTTP behavior is proven
unchanged by the parity test suite above, so no special rollout caution is
needed beyond the project's normal PR review and merge process.
