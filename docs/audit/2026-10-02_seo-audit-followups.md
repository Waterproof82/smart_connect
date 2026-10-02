# SEO audit follow-ups — 2026-10-02

**Change:** `openspec/changes/seo-audit-followups`
**Origin audit:** `docs/audit/2026-10-02_full-site-seo-geo-audit.md` (P1–P4 findings)
**Chain strategy:** stacked-to-main, 9 branches, merge order S1 → S9. Appended per slice; today covers S1 only.

## S1 — Hydration: React error #421 (branch `feat/followups-s1-hydration`, 2026-10-02)
**Why / root cause.** Production showed React error #421 on `/carta-digital`, `/tarjetas-nfc` and `/tpv-restaurantes` (lab LCP 6.4s on carta, CLS 0.225 on NFC). `entry-client.tsx` called `hydrateRoot` immediately while every prerendered page was a bare `React.lazy(...)`. `React.lazy` throws its loader promise on a component's first render even if that promise already resolved, because the resolved payload only flips internally inside an async `.then`. With nothing preloaded first, the first hydration pass always suspended and React discarded the SSR DOM for a full client re-render — exactly what #421 reports.

**What changed:**
- **New `src/clientRoutes.tsx`** (design.md D1/D2): `preloadable(load)` memoizes one loader promise and tracks its resolved component. `Component` picks, via a mount-only `useState` initializer, between the resolved component (if `preload()` already settled) and a `React.lazy` fallback — so a preloaded route mounts its real component directly, no throw, no dehydrated boundary. `PRERENDERED_ROUTES` (8 non-home paths), `NOT_FOUND_ROUTE` (covers `*` and `dist/404.html`), `routeForPath()` (`"/"` → `null`, since App is static).
- **`src/entry-client.tsx`**: awaits `routeForPath(pathname)?.preload()` (catch → hydrate anyway) before `hydrateRoot`. Every page's `lazy(...)` became `PRERENDERED_ROUTES["/path"].Component`. `/admin` unchanged (`lazy()` + `createRoot`, never preloaded).
- **New tests:** `tests/unit/clientRoutes.test.ts` (loader called once, fallback before preload, resolved content with no Suspense needed after); `tests/unit/scripts/clientRouteParity.test.ts` (loader map ∪ `{"/"}` = `site-routes.json` = `entry-server.tsx` routes; only one `lazy(` left in `entry-client.tsx`, for `AdminPanel`).
- **Updated pre-existing test:** `tests/unit/route-registration.tarjetas-nfc.structure.test.ts` point 1 now asserts the `PRERENDERED_ROUTES[...].Component` shape instead of the removed `lazy()` shape. Points 2–4 untouched.

**Verification.** `npx jest` 1345/1348 (3 pre-existing unrelated `chatbotFlow.test.ts` network failures, same on `develop`). `npm run test:vitest -- --run` 112/112. `npx tsc --noEmit` clean. `npm run lint` clean. `npm run build` (owner-authorized): client+SSR+prerender succeeded, every prerendered page still ships its own chunk (no single-bundle regression), and the build's own `assertBodyUnchanged()` check passed for all 9 routes. `npx jest tests/unit/seo` 149/149 against the fresh `dist/`.

**Manual console check (task 1.8).** First pass against `vite preview` showed 18 `#418` hydration-mismatch errors on `/carta-digital` — a false alarm: `vite preview`'s default SPA fallback served `dist/index.html` (home) for the path `/carta-digital` instead of the nested `dist/carta-digital/index.html` (confirmed by byte/content comparison), a tooling gap unrelated to this fix (the old `lazy()` code hit the same wrong file and just masked it as another #421). Re-run against `npx serve dist` (clean-URL resolution, matching the real Vercel rewrites): **zero console errors on all 9 routes, `404.html` and the `/admin` SPA shell.** Local LCP/CLS (unthrottled loopback, not directly comparable to the networked lab numbers above): carta-digital 2892ms/0.0025, tarjetas-nfc 3174ms/0.3372, tpv-restaurantes 2603ms/0.0009, home 2271ms/0.0035. The #421 console error — this slice's actual target — is fully eliminated on every route that previously carried it.

**Deviations from design:** none — matches design.md D1/D2 exactly. **Follow-ups:** S2–S9 remain, in merge order, on top of this branch, per `tasks.md`.
