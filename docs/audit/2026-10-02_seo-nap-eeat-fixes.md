# SEO NAP + E-E-A-T fixes — 2026-10-02

**Timestamp:** 2026-10-02
**Change:** `openspec/changes/seo-nap-eeat-fixes`
**Scope of this entry:** PR1 (Phase 0 spec alignment + Phase 1, organization identity). PR2 (lastmod automation) is tracked separately in this same file once applied.

## Why

`2026-10-01_content-seo-geo-audit.md` (P0 #17, P1 #11) and the SEO NAP spec flagged that the published business address was wrong and inconsistent across surfaces: the home/about JSON-LD, the Contact.tsx fallback, the WebMCP `get_contact_info` tool, `llms.txt`, and the ES/EN legal texts in `LanguageContext.tsx` each hand-synced their own copy of `"c/ Ernesto Castro, 57, Puerta 501, 38001, Santa Cruz de Tenerife"` — the real address is `"Calle Médico Ernesto Castro, 57, 38356 Tacoronte, Santa Cruz de Tenerife"`. The `/about` page also published a placeholder founder (`"Digitaliza Tenerife Team"`) and a fabricated `sameAs` list with no real social profiles behind it — both E-E-A-T red flags for an AI-crawled site. Fixing N independent copies by hand practically guarantees drift the next time any one of them changes.

## Actions taken (PR1)

1. **Phase 0** — `specs/sitemap-lastmod/spec.md`'s Git-Derived requirement updated to the D6 `max(gitDate, floor)` semantics agreed in `design.md`, so Phase 2 (PR2) specs and design stay aligned before any lastmod code is written.
2. **New single source of truth**: `src/shared/config/organization.ts` exports `ORGANIZATION` (name, url, email, telephone, address, geo, founder) and `formatAddressLine(locale)`. Plain TS, no React import, so WebMCP/Contact/tests can all import it directly.
3. **`SeoSchema.tsx`**: `buildHomeSchema`'s `LocalBusiness` node now sources `address`/`geo`/`founder` from the constant (previously a hardcoded, wrong address with no `geo`/`founder` at all). New `buildAboutSchema()` builds the `/about` JSON-LD from the same private `postalAddressNode`/`geoNode`/`founderNode` helpers, so home and about can never state two different addresses or founders again.
4. **`AboutPage.tsx`**: now calls `buildAboutSchema()` instead of an inline, hand-synced JSON-LD object (which also hardcoded the placeholder founder and the fabricated `sameAs` list — both removed, not replaced). Meta description and mission copy now say "Tacoronte (Tenerife)" instead of the old locality. Added a visible founder block (`dl`: "Fundador" / "José Miguel Aristía") inside `#mision`, and corrected the visible "Oficina" address in the contact block.
5. **`Contact.tsx`**: the address fallback shown before the Supabase `app_settings` fetch resolves now computes `formatAddressLine("es")` once and reuses it for both the displayed value and the Google Maps link (previously two independent literals).
6. **`WebMCP.ts`**: `get_contact_info`'s ES/EN "Oficina"/"Office" lines and the tool description now read from the constant instead of a hardcoded `"Santa Cruz de Tenerife"` line.
7. **`LanguageContext.tsx`**: corrected the 4 legal-address lines (ES aviso legal + privacidad, EN aviso legal + privacidad). The jurisdiction clauses ("se someten a los juzgados y tribunales de Santa Cruz de Tenerife" / "the parties submit to the courts of Santa Cruz de Tenerife") were deliberately left untouched — venue/jurisdiction is a legal choice, not a NAP fact, and the spec calls this out explicitly.
8. **`llms.txt` + `agent-skills/index.json`**: corrected the `Dirección:` line and recomputed `product-information.sha256` (LF-normalized) so `geoSurfaces.test.ts`'s hash guard stays honest.
9. **Dead code removed**: `GeoCoverage`/`GeoCoverageProps` and `InternalLinks`/`InternalLinksProps`/`RelatedLink` in `SeoSchema.tsx` had zero consumers anywhere in the codebase (confirmed by repo-wide grep before deleting); removed. `docs/SEO_PROTOCOL.md`'s P-23 row, which referenced `InternalLinks` as if it were live, was dropped.
10. **Test refactor (D4)**: `tests/unit/shared/legalTranslationKeys.test.ts`'s `seoAddressParts()` helper previously regex-parsed `SeoSchema.tsx` source as the "canonical" address; it now imports `ORGANIZATION` directly, since `SeoSchema.tsx` no longer contains the address as a literal (it reads the constant).
11. **New regression guard**: `tests/unit/napConsistency.test.ts` scans every file under `src/` and `public/` (excluding test files) for the legacy `"38001"` postal code and `"Puerta"` door-number suffix; zero matches required. Verified the guard actually fails by temporarily injecting a violation into a scratch file, then removing it (RED → GREEN proof, not left in the tree).
12. **Pre-existing test adapted to the new architecture**: `tests/unit/napAndAgentSurfaces.test.ts` previously asserted the telephone number was hardcoded as a literal inside `AboutPage.tsx`'s source; since that literal moved into `organization.ts`/`SeoSchema.tsx`, the test now asserts `AboutPage.tsx` calls `buildAboutSchema()` and that `ORGANIZATION.telephone` holds the canonical number.

## TDD evidence

Every code task in this PR followed RED → GREEN (strict TDD):

| # | Test file | RED cause | GREEN fix |
|---|-----------|-----------|-----------|
| 1 | `tests/unit/shared/config/organization.test.ts` | module did not exist | created `organization.ts` |
| 2 | `tests/unit/shared/presentation/homeSchema.test.ts` | `LocalBusiness` had no `geo`/`founder`, wrong address | `buildHomeSchema` reads the constant |
| 3 | `tests/unit/shared/presentation/aboutSchema.test.ts` | `buildAboutSchema` did not exist | added builder + shared node helpers |
| 4 | `src/features/landing/presentation/components/__tests__/AboutPage.test.tsx` | no visible Fundador/Tacoronte text | `AboutPage.tsx` founder `dl` + Oficina `dd` |
| 5 | `src/features/landing/presentation/components/__tests__/Contact.test.tsx` (new case) | fallback still showed the old literal | one `formatAddressLine("es")` const |
| 6 | `tests/unit/WebMCP.structure.test.ts` (new cases) | office line still hardcoded | `WebMCP.ts` reads the constant |
| 7 | `tests/unit/shared/legalTranslationKeys.test.ts` | legal text still had the old address | corrected the 4 literal lines |
| 8 | `tests/unit/scripts/geoSurfaces.test.ts` | hash mismatch after editing `llms.txt` | recomputed `product-information.sha256` |
| 9 | `tests/unit/napConsistency.test.ts` | (sanity-checked with an injected scratch violation) | guard passes on the real tree |
| 10 | `tests/unit/napAndAgentSurfaces.test.ts` | literal telephone assertion broke after the refactor | reworked to assert the new wiring |

## Verification

- `npx tsc --noEmit` — clean.
- `npm run lint` — clean (`eslint . --ext ts,tsx --max-warnings 0`).
- `npx jest` — 1101 passed, 0 failed among tests touched by this change. 3 pre-existing failures in `tests/e2e/chatbotFlow.test.ts` (network/Supabase-dependent E2E, expects a live backend) reproduce identically on the `develop` baseline before this change — unrelated and untouched by this PR.
- `npm run test:vitest -- --run` — 107 passed, 0 failed (22 files).

## Deviations from design.md

- `design.md`'s Interfaces section doesn't give an explicit `buildAboutSchema()` return shape; implemented it as a single `AboutPage` JSON-LD object (matching the previous inline shape minus the placeholder founder and fabricated `sameAs`), reusing the same `postalAddressNode`/`geoNode`/`founderNode` helpers as `buildHomeSchema`, per D2.
- Added one test file not explicitly named in tasks.md: extended `tests/unit/napAndAgentSurfaces.test.ts` (pre-existing, unrelated to this change's task list) because moving the telephone literal out of `AboutPage.tsx` broke its existing assertion — necessary consequence of D1/D2, not a scope deviation.

## Not in this entry (superseded below)

PR2 (lastmod automation, Phase 2 of `tasks.md`) was a separate apply batch; its record follows.

---

## PR2 — Lastmod Automation (Phase 2)

**Timestamp:** 2026-10-02
**Base branch:** `feat/seo-nap-identity` (PR1), stacked — `feat/seo-sitemap-lastmod`
**Scope of this entry:** Phase 2 only — `scripts/lastmod.mjs`, `site-routes.json` `sources` + floor corrections, `prerender.mjs` wiring, `docs/SEO_PROTOCOL.md` P-20. Phase 3 (setting `VERCEL_DEEP_CLONE=true` and confirming the build log) is a manual Vercel-dashboard step for the user, out of scope for this apply batch.

### Why

`specs/sitemap-lastmod/spec.md` (aligned to design.md D6 in Phase 0) requires per-route `lastmod` to reflect real content freshness instead of a hand-maintained value someone has to remember to bump. `/about` and `/tarjetas-nfc` carried stale floors (2026-08-12 / 2026-08-11); `docs/SEO_PROTOCOL.md` P-20 flagged this as a known issue. Since Google ignores `priority`/`changefreq` and only trusts `lastmod`, a stale or manually-forgotten value actively hurts recrawl signals.

### Actions taken (PR2)

1. **`scripts/lastmod.mjs` (new)**: `defaultExec` (shells out to `git` with `stdio: ["ignore","pipe","ignore"]`), `hasFullHistory(exec)` (true only when `git rev-parse --is-shallow-repository` returns exactly `"false"`; any thrown error → `false`), `gitLastmod(sources, exec)` (`git log -1 --first-parent --format=%cs -- <sources>`, regex-validated `YYYY-MM-DD`, `null` on empty sources/throw/malformed output), `resolveRouteLastmods(routes, { exec })` (per design.md D6: `lastmod = max(gitDate, hardcodedFloor)` when full history is available, the floor alone otherwise; strips the internal `sources` field from its output; never throws).
2. **`scripts/site-routes.json`**: every route now declares `sources` — the repo-relative file paths whose git history determines that route's freshness (D7: explicit paths, no globs, no shared chrome like `LanguageContext.tsx`/`PageShell.tsx`/layout/CSS). Corrected floor dates:
   - `/about`: `2026-08-12` → `2026-10-02` (matches today's `AboutPage.tsx`/`organization.ts` work from PR1)
   - `/tarjetas-nfc`: `2026-08-11` → `2026-10-01` (last real git-confirmed change to its own sources)
   - `/legal/aviso`, `/legal/privacidad`: `2026-05-18` → `2026-10-02` — PR1's NAP address fix changed their legal text, but that text lives in the shared `LanguageContext.tsx`, which is deliberately excluded from `sources` (D7); without a manual floor bump, git-derived freshness alone would have under-reported these two routes' real freshness. This is exactly the scenario D6's floor mechanism exists to cover.
   - `/legal/cookies`: left at `2026-05-18` — its content did not change in PR1 and design.md's File Changes table scopes the floor correction to `/about`, `/tarjetas-nfc`, `/legal/aviso`, `/legal/privacidad` only (not cookies); `tasks.md` 2.3's shorthand `/legal/*` is read as "the legal routes actually affected," not literally all three.
3. **`scripts/prerender.mjs`**: imports `resolveRouteLastmods` from `./lastmod.mjs`, calls it on `routeTable` immediately before `writeSitemap`, and logs the resolved mode (`🗓️ lastmod: mode=git` or `mode=fallback (<reason>)`). `scripts/sitemap.mjs` is untouched — it remains pure and git-free, receiving already-resolved date strings.
4. **`docs/SEO_PROTOCOL.md`**: P-20 rewritten from a manual-update instruction to describe the automation, the floor semantics (and why `LanguageContext.tsx`-only edits need a manual floor bump), and the Vercel shallow-clone caveat. The routing/build pre-merge checklist's `site-routes.json` line now also calls out `sources`.

### TDD evidence (strict mode, RED → GREEN)

| # | Test | RED cause | GREEN fix |
|---|------|-----------|-----------|
| 1 | `tests/unit/scripts/lastmod.test.ts` — success (git date newer than floor, `sources` stripped) | `scripts/lastmod.mjs` did not exist (module not found) | created the module |
| 2 | ...floor-wins (stale git date never overrides a newer floor) | same | same |
| 3 | ...git missing (`ENOENT` on the shallow-check call) → fallback mode | same | `hasFullHistory` catches and returns `false` |
| 4 | ...shallow clone (`rev-parse` reports `"true"`) → fallback mode | same | same |
| 5 | ...git log throws for one route's sources → that route alone falls back, others unaffected | same | `gitLastmod` catches per-call, `resolveRouteLastmods` applies the floor only to that route |
| 6 | ...malformed git output (non-date string) → floor used | same | `gitLastmod`'s `YYYY-MM-DD` regex guard |
| 7 | ...build never throws across a success/error/malformed mix | same | same |
| 8 | `hasFullHistory` / `gitLastmod` direct injectable-exec cases | same | same |
| 9 | every `site-routes.json` route has non-empty `sources` and each path resolves on disk | `site-routes.json` had no `sources` field | added `sources` per route |
| 10 | `prerender.mjs` imports and calls `resolveRouteLastmods` before `writeSitemap`; logs the mode | `prerender.mjs` had no such import/call/log | wired the import, the call, and the log line |
| 11 | `sitemap.mjs` stays git-free | already true (no code change needed) | confirmed, guarded by test |

### Verification

- `npx tsc --noEmit` — clean.
- `npm run lint` — clean (0 errors/warnings; `.mjs` files are outside the configured ESLint scope, consistent with `sitemap.mjs`/`critical-css.mjs`).
- `npx jest` — **1114 passed**, 3 failed (all in `tests/e2e/chatbotFlow.test.ts`, the same pre-existing network/Supabase-dependent failures documented in PR1's entry), 12 skipped.
- `npm run test:vitest -- --run` — **107 passed**, 0 failed (22 files) — unaffected by this PR, re-run for completeness.
- No real `npm run build`/prerender was executed (project rule: never run a build); the `mode=git`/`mode=fallback` log line and the resolver-before-`writeSitemap` ordering were verified via the injectable-`exec` unit tests and a source-level structure test instead.

### Deviations from design.md / tasks.md

1. `tasks.md` 2.3 says "correct floor dates for `/about`, `/tarjetas-nfc`, `/legal/*`" (wildcard), but `design.md`'s File Changes table scopes the correction to `/about`, `/tarjetas-nfc`, `/legal/aviso`, `/legal/privacidad` only. Followed `design.md` (the more specific, rationale-backed source) and left `/legal/cookies`'s floor untouched, since its content did not change in PR1. Flagging for `sdd-verify`.
2. `resolveRouteLastmods`'s `reason` string is a fixed generic sentence ("git unavailable, errored, or repository is a shallow clone") rather than a per-case-specific reason (e.g. distinguishing ENOENT from a non-zero exit from an actual shallow repo). `design.md`'s interface contract only specifies the field's presence/type (`reason: string | null`), not its exact wording, and the spec's scenarios only require that the *mode* correctly falls back and that *no error ever stops the build* — both hold. Not a scope deviation, just noting the contract left this open.
3. Added one extra test block beyond `tasks.md`'s explicit list: direct `hasFullHistory`/`gitLastmod` unit cases (Requirement "Injectable Git Execution"'s own scenario), to pin the injectable-exec contract independently of the higher-level `resolveRouteLastmods` integration tests.

### Risks / follow-ups for verify

- Phase 3 (`VERCEL_DEEP_CLONE=true` + build-log confirmation) is **not started** — it is an explicit manual, non-code Vercel dashboard step for the user, out of scope for `sdd-apply`.
- The Vercel shallow-clone behavior and the `VERCEL_DEEP_CLONE` variable are community-reported, not officially documented by Vercel (see design.md "Open Questions"); until the user confirms the build log, production will most likely run in `mode=fallback (...)`, which is safe (floors still apply) but not git-fresh.
