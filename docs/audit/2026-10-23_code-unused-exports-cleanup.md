# Audit Log: code-unused-exports-cleanup

## PR1 — 2026-10-23 — knip config + confirmed deletions + narrow CI gate

**Branch**: `fix/knip-config-dead-barrels` (from `develop`)

### Actions

1. **2026-10-23** — Added `tests/unit/ci/deadCodeGate.test.ts` (RED): asserts `devDependencies.knip` is pinned exact (no `^`/`~`), `scripts.knip` exists, `knip.json` `ignore` contains `supabase/functions/**`, `knip.json` `entry` contains `entry-server`/`middleware`, and the CI workflow runs `npm run knip` after `npm run type-check`.
2. **2026-10-23** — Added `knip.json` (entry: `src/entry-client.tsx`, `src/entry-server.tsx`, `middleware.ts`, `api/**/*.mjs`, `scripts/**/*.mjs`; ignore: `.claude/**`, `.opencode/**`, `supabase/functions/**`; `ignoreExportsUsedInFile: true`). Installed `knip@5.88.1` as an exact-pinned devDependency (`npm i -D -E knip@5`). Added `"knip": "knip"` script. Guard test green.
3. **2026-10-23** — Ran `npx knip` (full) to confirm the config matches the discovery: 10 unused files, 27 duplicate exports, 2 unused exported types match exactly. Unused-export count differs in presentation only (knip reports 28 individual `unused exports` lines vs. discovery's 21 — the 7-item delta is the `ChatInput`/`ChatMessages`/`ChatToggleButton`/`ChatWelcome`/`LinkifiedText` group plus others that knip buckets under `Duplicate exports` instead once both a named and a default export exist for the same symbol; no new dead-code candidates beyond what design/tasks already enumerate). Ran `npx knip --include files,dependencies,devDependencies,unlisted,unresolved`: only the 10 unused files, zero deps/unlisted/unresolved — matches the orchestrator-verified trial run exactly.
4. **2026-10-23** — Verified via `rg` that all 10 orphan barrels have zero alias/relative/dynamic-import references in `src/` and the wider repo (one stale `README.md` code example references `@core/domain/entities`, not real code — left untouched, out of scope). Deleted:
   - `src/core/domain/entities/index.ts`
   - `src/features/admin/data/repositories/index.ts`
   - `src/features/admin/domain/entities/index.ts`
   - `src/features/admin/domain/repositories/index.ts`
   - `src/features/admin/domain/usecases/index.ts`
   - `src/features/chatbot/data/datasources/index.ts`
   - `src/features/chatbot/data/repositories/index.ts`
   - `src/features/chatbot/domain/repositories/index.ts`
   - `src/features/chatbot/domain/usecases/index.ts`
   - `src/features/landing/presentation/components/index.ts`
5. **2026-10-23** — Deleted the 18 orphaned `dashboard*` i18n keys (interface block, `es` block, `en` block, including the `// Dashboard Preview` comment) from `src/shared/context/LanguageContext.tsx`. Confirmed zero references outside the file via `rg` before and after.
6. **2026-10-23** — Added CI step `Dead code (knip)` to `.github/workflows/ci-cd.yml`, running `npm run knip -- --include files,dependencies,devDependencies,unlisted,unresolved` immediately after `Type check`. Guard test extended/confirmed green.
7. **2026-10-23** — Verification per commit: `npx tsc --noEmit` (clean), `npm run lint` (clean), `npm test` (145/145 suites, 1856 passed, 4 skipped), `npx vitest run` (33/33 files, 187 passed), `npx knip --include files,dependencies,devDependencies,unlisted,unresolved` (exit 0). `git diff -- supabase/functions/` confirmed empty throughout.

### Deviation from design

None functionally. Noted a cosmetic knip count mismatch (28 vs. discovery's 21 "unused exports" lines) caused by knip's duplicate-export bucketing — does not change the deletion scope for PR2/PR3.

## PR2 — 2026-10-23 — named-only convention + dead modules

**Branch**: `fix/single-export-convention` (from `fix/knip-config-dead-barrels`)

### Actions

1. Updated `ExpertAssistantWithRAG.structure.test.ts` FIRST (asserts named-only, `not.toMatch(/export default ExpertAssistant/)`) — confirmed RED against the still-unchanged source before touching the export.
2. Named-only (dropped `export default`, fixed importers to use named imports): `ChatInput`, `ChatMessages`, `ChatToggleButton`, `ChatWelcome`, `LinkifiedText` (also fixed `ChatMessages.tsx`'s own import of `LinkifiedText` and `LinkifiedText.test.tsx`), `ExpertAssistantWithRAG` (`ExpertAssistant`), `DeferredExpertAssistant`, `DocumentList` + 6 admin siblings (`DeleteConfirmDialog`, `DocumentCreateModal`, `DocumentEmptyState`, `DocumentFilters`, `DocumentPagination`, `DocumentViewModal`), `LanguageSelector` (fixed `Navbar.tsx`), and 12 shared/landing components confirmed to have zero importers at all (`CartaDigitalReviews`, `PageShell`, `CookieBanner`, `CookieConsent`, `RelatedServices`, `SiteFooter`, `ClosingCta`, `FaqList`, `MobileWhatsAppBar`, `PageHero`, `Section`, `WhatsAppCta`).
3. Deleted `ChatbotContainer.ts`'s `getChatbotContainer` alias (zero consumers) and the chatbot presentation barrel's `ExpertAssistant` re-export (zero consumers via barrel; `OPEN_ASSISTANT_EVENT` on the same line is still consumed via the barrel by `IaChatbotsPage.tsx`, kept).
4. Deleted 5 re-exports in `admin/presentation/index.tsx` (`Login`, `AdminDashboard`, `DocumentList`, `StatsDashboard`, `SettingsPanel`) — zero real consumers outside the module; `AdminPanel` is the only public surface (consumed by `entry-client.tsx`).
5. Deleted `admin/components/document/DocumentModal.tsx` + its barrel line (zero consumers).
6. Deleted `chatbot/domain/entities/Document.ts` + its `export * from './Document'` barrel line (zero consumers — distinct from the unrelated `admin` feature's own `Document` entity).
7. Deleted `shared/hooks/useIntersectionObserver.ts` + its barrel line (zero consumers); dropped `sanitizeWhatsappPhone` from the same barrel (every consumer — including both test files — already imports it from the direct `useWhatsappPhone` module path); `useWhatsappPhone` itself stays barrel-exported (3 real barrel consumers).
8. Deleted `ThemeContext.useTheme` (zero consumers) and its now-orphaned `useContext` import; deleted `agentRoutes.isAgentPagePath` (zero real consumers — `vite-plugin-md-negotiation.ts` independently re-derives the same logic, it does not import this function, despite an older audit doc implying otherwise).
9. Trimmed `core/domain/usecases/index.ts` to `export { ConsoleLogger }` only — the only barrel member with a real consumer (`NotifyLeadDataSource.ts`); `ILogger`, `LogLevel`, `SecurityLogger`, `SecurityEvent*`, `createSecurityLogger` keep working for their direct-path consumers.
10. Removed dead type re-exports: `layout/index.ts` (`FaqItem`, `WhatsAppCtaProps`), `landing/domain/usecases/index.ts` (`SubmitLeadResult`) — all three types remain declared and used within their own file, only the barrel re-export (zero outside consumers) was removed.
11. **T2.15**: `Logger.ts`'s `LogLevel` enum and `accents.ts`'s `AccentTokenOf` type had zero consumers anywhere, including their own file — per `noUnusedLocals`, deleted the declarations outright rather than dropping `export`.
12. **T2.16 decision (R1)**: kept PR1's narrow CI gate unchanged in PR2; the full ungated `npm run knip` widening is deferred to PR3, per design and the owner's 2026-10-23 resolution of R1.
13. Verification per commit: `npx tsc --noEmit` (clean), `npm run lint` (clean), `npm test` (145/145, 1856 passed), `npx vitest run` (33/33, 187 passed). `npx knip` (full) now reports **0** unused files, **0** duplicate exports, **0** unused exported types — only the 8 `SeoSchema` unused exports remain (PR3 scope), exactly matching the design's prediction. `git diff -- supabase/functions/` stayed empty throughout.

### Deviation from design

None functionally. One commit-grouping deviation: because `git rm` stages deletions independently of `git add <specific-files>`, two early commits (`test(ci): add knip dead-code gate guard test and config` in PR1, and `refactor(chatbot): drop dead getChatbotContainer alias and barrel re-export` in PR2) absorbed file deletions that were intended for separate commits (the 10 barrels, and `DocumentModal.tsx`, respectively). All deletions were still verified pre-delete via `rg` and the full suite stayed green throughout — this is a commit-history organization note only, not a functional or review-risk issue.

## PR3 — 2026-10-23 — SeoSchema deletions + full CI gate (`size:exception`)

**Branch**: `fix/seo-schema-dead-components` (from `fix/single-export-convention`)

### Actions

1. Confirmed via `rg` that none of the 8 target symbols (`PageHero`, `LocalBusinessSchema`, `BenefitsGrid`, `HowItWorks`, `StatsBar`, `CollectionPageSchema`, `SoftwareApplicationSchema`, `WebApplicationSchema`) are imported from `SeoSchema.tsx` anywhere — same-named symbols elsewhere (`PageHero` from `@shared/presentation/layout`, `HowItWorks` from the `tap-review` feature) resolve to different, unrelated files.
2. Deleted all 8 components, their Props interfaces, and the page-local type helpers only used by them (`BenefitCard`, `StepInfo`, `StatItem`, `CollectionPageItem`) — confirmed none of those helper types are used elsewhere. `SeoSchema.tsx` shrank from 729 to 310 lines; the still-live exports (`organizationNode`, `buildHomeSchema`, `buildAboutSchema`, `SeoFaqSchema`, `ServiceSchema`, `BreadcrumbListSchema`, `ORGANIZATION_ID`, `WEBSITE_ID`, `HomeSchemaFaq`) are untouched.
3. Extended `tests/unit/ci/deadCodeGate.test.ts` FIRST (RED) to assert the workflow's knip step has no `--include` flag, then widened `.github/workflows/ci-cd.yml`'s `Dead code (knip)` step from the narrow `--include` set to the full `npm run knip` (GREEN).
4. Verification: `npx tsc --noEmit` (clean), `npm run lint` (clean), `npm test` (145/145 suites, 1857 passed — +1 for the new guard assertion), `npx vitest run` (33/33, 187 passed), `npm run knip` (full, no flags) exits 0 with **zero** findings of any kind. Ran the existing SEO regression suite (`tests/unit/seo`, 9 suites, 230 passed, 4 skipped — the 4 "fresh-gated" tests require a `dist` build and only run inside the CI job that builds first, per the no-local-build rule) to confirm prerendered JSON-LD and route structure are unaffected; `clientRoutes.tsx` and `vite-manual-chunks.ts` were never touched. `git diff -- supabase/functions/` stayed empty.
5. **T3.5 decision**: this PR is ~420 lines of pure deletion, over the 400-line review budget. Per the `ask-on-risk` delivery strategy this would normally block for a maintainer decision; the owner pre-resolved it on 2026-10-23 as `size:exception` (one cohesive file, no logic changes, straightforward to review as a deletion diff) rather than splitting into 3a/3b.

### Final state

All 3 PRs (knip config, named-only convention, SeoSchema deletions) complete. `npx knip` reports 0 unused files, 0 unused exports, 0 unused exported types, 0 duplicate exports. CI's `Dead code (knip)` gate runs the full, unfiltered check after type-check — any future regression on any of these four fronts now fails CI.

### Deviation from design

None.
