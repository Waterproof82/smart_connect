# WebMCP document.modelContext + /legal/cookies quote parity

**Timestamp:** 2026-10-25 10:10 UTC
**Scope:** two follow-ups left open by the `shared-app-shell` change.
**Type:** fix, TDD

## Actions
- `src/WebMCP.ts`: `registerWebMCPTools()` reads `document.modelContext` first, `navigator.modelContext` only as a fallback. `@mcp-b/webmcp-polyfill` 3.0.0 exposes `document.modelContext` as the primary surface and warns on every `navigator.modelContext` access (WebMCP draft, May 2026, webmcp PR #184).
- New `src/__tests__/webmcpRegistration.test.tsx`: registers on `document.modelContext` without touching `navigator.modelContext`; falls back to `navigator` when `document` has none. RED observed on the first case before the fix.
- `src/shared/context/LanguageContext.tsx`: the Google Analytics `<a>` in `legalCookiesSection3Content` (ES and EN) now uses double-quoted attributes.
- `src/__tests__/ssrHydrationParity.test.tsx`: removed the `normalizeQuotes` workaround. Without the content fix, `/legal/cookies` failed (RED); with it, 16/16 pass.
- New `src/__tests__/i18nHtmlQuotes.guard.test.tsx`: fails on any single-quoted attribute inside an HTML tag in `LanguageContext.tsx` (verified failing against the old strings). Covers EN, which the prerender never renders.
- `tests/unit/shared/legalTranslationKeys.test.ts`: `resolveKey()` parsed values with `"([^"]*)"` and stopped at the first `\"`. It is now escape-aware.
- `.atl/skill-registry.md`, `.atl/smart-connect-standards.md`: WebMCP rules now say `document.modelContext` (fallback `navigator`), so sub-agents do not revert the change.

## Validation
- `npx tsc --noEmit`, `npm run lint`, `npx knip`: pass.
- Jest: 1782 passed, 30 skipped.
- Vitest: 46 files, 245 tests passed.
