# `/legal/aviso` Content Gap — Fix

**Date**: 2026-08-17
**Author**: Claude Code (SDD `legal-content-gaps`, PR-B, branch `feat/legal-aviso-content`, PR #70)
**Trigger**: `sdd-verify` pass on the `legal-content-gaps` change surfaced 4 WARNINGs; this entry documents the fix for the CHANGELOG/audit-doc gap (WARNING 4), the weaker automated NAP guard (WARNING 2), and the address-wording reconciliation (WARNING 3), all tracked against `sdd/legal-content-gaps/verify-report`.

---

## Objective

Close the "raw translation key rendered as text" bug class on `/legal/aviso`: `AvisoLegalPage.tsx` referenced 12 section title/content keys (`legalAvisoSection1..6Title/Content`) that did not exist in `LanguageContext.tsx`, so real visitors saw literal strings like `legalAvisoSection1Title` instead of the LSSI-CE art. 10 provider-identification notice.

## Fix applied (original apply pass)

- **`src/shared/context/LanguageContext.tsx`**: added the 12 missing key pairs in both `es` and `en`, covering: identification of the site owner (trade name "Digitaliza Tenerife", sole trader/autónomo, NIF `02670352Y`, address, contact), site purpose/terms of use, intellectual property (using "Carta Digital" — corrected from a stale "QRIBAR" reference; QRIBAR was purged from the codebase in an earlier rebrand and is enforced by `src/__tests__/brand.guard.test.ts`), liability/disclaimer (the AI chatbot's output is informational and non-contractual), external links, and applicable law/jurisdiction (Santa Cruz de Tenerife courts).
- **`tests/unit/shared/legalTranslationKeys.test.ts`**: added a standalone `describe("Aviso legal translation keys (PR-B regression guard)")` block (this branch predates PR-A's `describe.each` harness refactor) with exact key-set equality, non-empty resolution in both locales, content-shape (`<p>...</p>`) checks, and a manual identity-consistency check (substring match for trade name/NIF/email).

## Fix applied (this fixup pass, post-verify)

1. **NAP-consistency guard wired to `SeoSchema.tsx` (closes WARNING 2)**: the original manual identity check only asserted 3 hardcoded substrings, so nothing would catch the address itself drifting from the canonical source. Added a `seoAddressParts()` helper (mirrors the one added on `feat/legal-privacidad-content`) that parses `streetAddress`/`postalCode`/`addressLocality` live from `src/shared/presentation/components/SeoSchema.tsx`, plus a new test asserting `legalAvisoSection1Content` contains all three in both locales. This test fails if the address text in this file and `SeoSchema.tsx` ever diverge.
2. **Address wording reconciled with PR-A (`feat/legal-privacidad-content`)**: `legalAvisoSection1Content` already included the region ("...38001, Santa Cruz de Tenerife, Canarias, España" / "...Canary Islands, Spain"), matching `SeoSchema.tsx`'s `addressRegion: "Canary Islands"`. This is now also the canonical phrasing used by `/legal/privacidad` (PR-A was updated to add the region for consistency) — no content change needed on this branch. Note: `addressRegion` is not one of the 3 fields the automated NAP guard checks (`streetAddress`/`postalCode`/`addressLocality`), so this was a wording-consistency decision, not a guarded-field fix.
3. **CHANGELOG.md**: added an `[Unreleased] / Fixed` entry documenting the original content fix (this was missing from the initial apply pass — project protocol §4.2 requires it for every applied change).
4. **This audit doc**: added per project protocol §4.3.

## Verification run

- `npx tsc --noEmit` — clean.
- `npm run lint` — clean, 0 errors/warnings.
- `npm test` — full suite green, including the new NAP-consistency assertion for `legalAvisoSection1Content`.
- No build was run (per project's "never build after changes" rule).

## Known follow-ups (unchanged from verify report, not addressed here)

- Merge-order conflict in `tests/unit/shared/legalTranslationKeys.test.ts` when the second of PR-A/PR-B merges — confirmed mechanically safe by the verify pass's real local test-merge, resolves naturally at merge time.
- Post-merge fold-in: once merge order is decided, fold this branch's standalone Aviso `describe` block (including the new NAP-consistency test added here) into the surviving branch's `describe.each(LEGAL_PAGES)` array as a third `AvisoLegalPage` entry with `identityContentKeys: ["legalAvisoSection1Content"]`, per design §3.2's anticipated shape.
