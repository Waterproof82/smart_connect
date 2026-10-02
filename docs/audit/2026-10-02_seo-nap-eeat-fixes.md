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

## Not in this entry

PR2 (lastmod automation, Phase 2 of `tasks.md`) is a separate apply batch and will be appended to this file when applied.
