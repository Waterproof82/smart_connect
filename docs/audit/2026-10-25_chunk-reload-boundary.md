# ChunkReloadBoundary — reload once on a missing lazy chunk

**Timestamp:** 2026-10-25 10:35 UTC
**Type:** fix (deploy safety, second layer after the HTML Cache-Control change), TDD

## Actions
- New `src/shared/presentation/ChunkReloadBoundary.tsx`: class error boundary. On a chunk-load error (Chrome/Firefox/Safari dynamic-import messages, Vite "Unable to preload CSS") it stores a timestamp in `sessionStorage` and calls `location.reload()` once. Within 10 s of that timestamp, or if storage is blocked, it re-throws instead (no loop). Any other error is re-thrown unchanged. Renders only `children`.
- `src/shared/presentation/AppShell.tsx`: `ChunkReloadBoundary` wraps the `Suspense` (Consent > ScrollToTop + CookieConsent + ChunkReloadBoundary > Suspense > children).
- New `src/__tests__/ChunkReloadBoundary.test.tsx`: renders children; reloads once on a chunk error; no second reload right after one (error reaches the parent); other errors reach the parent without reload. RED (module missing) then GREEN.
- `src/__tests__/AppShell.test.tsx`: element-tree walk updated for the new level (RED before wiring, GREEN after).

## Validation
- `ssrHydrationParity.test.tsx` 16/16: SSR and client markup unchanged.
- `npx tsc --noEmit`, `npm run lint`, `npx knip`: pass.
- Jest: 1786 passed, 30 skipped. Vitest: 47 files, 249 tests passed.
