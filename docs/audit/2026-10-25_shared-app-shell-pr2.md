# Shared AppShell + prerendered route table — PR2 (AppShell + shell parity)

**Timestamp:** 2026-10-25 10:30 WEST (09:30 UTC)
**Scope:** `shared-app-shell` change, PR2 of 2 (stacked on PR1, commit 14e0b76). Extracts the provider tree both entries hand-copied into one `AppShell`, moves the client tree into `ClientApp`, and adds the render-based shell-parity guard.
**Type:** refactor (SSR/hydration), TDD

## Actions
- Created `src/shared/presentation/AppShell.tsx` — Helmet > Theme > Language > Consent > ScrollToTop + CookieConsent + Suspense(children). Props: `children`, `fallback` (default `null`), `helmetContext` (server only). The Router stays outside, per entry.
- Created `src/ClientApp.tsx` — `BrowserRouter` + `AppShell` + shared prerendered routes, then `/admin` (lazy) and `*` (NotFound), `*` last. No props, so tests can render it.
- Edited `src/entry-client.tsx` — now only `const app = <ClientApp />`; preload-before-hydrate, `hydrateRoot`/`createRoot` and WebMCP scheduling unchanged.
- Edited `src/entry-server.tsx` — `StaticRouter` > `AppShell helmetContext` > NotFound or routes. `render(url, { notFound })` signature and output unchanged.
- New Vitest tests: `src/__tests__/AppShell.test.tsx` (provider order by element-tree walk, Suspense fallback smoke), `src/__tests__/notFoundRender.test.tsx` (real `render("/404", { notFound: true })`: NotFound h1 + noindex), `src/__tests__/ssrHydrationParity.test.tsx` (14 prerendered paths + `/no-existe` + `/blog/no-existe`: server `render()` html must equal client `renderToString(<ClientApp/>)`).
- Rewrote Jest structure tests that read entry source:
  - `tests/unit/shared/entryWiring.structure.test.ts` — provider-order regexes removed (now covered by the Vitest tests above); new guard that `ClientApp.tsx` and `entry-server.tsx` import `AppShell` and mount none of the providers themselves, and that `entry-client.tsx` only mounts `<ClientApp />`. WebMCP boot-order checks kept.
  - `tests/unit/scripts/vercelNotFound.test.ts` — dropped the `entry-server.tsx` source regex; `notFoundRender.test.tsx` covers it.
  - `tests/unit/App.routing.structure.test.ts`, `tests/unit/scripts/clientRouteParity.test.ts` — route and lazy-chunk assertions now read `ClientApp.tsx`.

## TDD evidence
- `notFoundRender.test.tsx`: RED observed with the notFound branch disabled (`html` was `<!--$--><!--/$-->`, no h1), GREEN after restoring `options.notFound`. The old Jest source regex passed in that same broken state — it never guarded the behavior.
- `entryWiring` provider guard: first draft used `\s` inside a template literal (became `[s>/]`, missed `<HelmetProvider context=…>`); fixed with `String.raw` and checked against sample strings.

## Validation
- `npx tsc --noEmit`: pass.
- `npm run lint`: pass, 0 warnings.
- `npx knip`: pass, 0 findings.
- Jest: 146/147 suites pass, 1782/1812 tests pass, 30 skipped; 1 suite skipped (`prerenderedSeo.regression.test.ts`, needs a built `dist/`, pre-existing).
- Vitest: 42/42 files pass, 240/240 tests pass.

## Deviations from design
- `ssrHydrationParity.test.tsx` normalizes single-quoted attributes on both sides: `/legal/cookies` ships a raw `dangerouslySetInnerHTML` string that DOMPurify re-serializes only when `window` exists. React does not hydration-diff that content, so it is not a #418 source; left as a separate follow-up.
- Runs under `@vitest-environment node` because `react-helmet-async` fixes `canUseDOM` at import time; jsdom globals are stubbed only while rendering the client side.

## Follow-ups
- Phase 4 (owner-gated): build, diff `dist/` HTML (14 routes + 404.html) against main, serve and check for #418/#421.
- `sanitizeHTML` SSR path: run sanitization (or emit the same quoting) without `window`.
