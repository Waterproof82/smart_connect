# `/legal/privacidad` Content Gap — Fix

**Date**: 2026-08-17
**Author**: Claude Code (SDD `legal-content-gaps`, PR-A, branch `feat/legal-privacidad-content`, PR #69)
**Trigger**: `sdd-verify` pass on the `legal-content-gaps` change surfaced 4 WARNINGs; this entry documents the fix for the CHANGELOG/audit-doc gap (WARNING 4) and the address-wording reconciliation (WARNING 3), both tracked against `sdd/legal-content-gaps/verify-report`.

---

## Objective

Close the "raw translation key rendered as text" bug class on `/legal/privacidad`: `PrivacidadPage.tsx` referenced 12 section title/content keys (`legalPrivacidadSection1..6Title/Content`) that did not exist in `LanguageContext.tsx`, so real visitors saw literal strings like `legalPrivacidadSection1Title` instead of the RGPD art. 13 information notice.

## Fix applied (original apply pass)

- **`src/shared/context/LanguageContext.tsx`**: added the 12 missing key pairs in both `es` and `en`, covering: data controller identity (sole trader, trade name, NIF, address, contact), data collected via the contact form and chatbot (with no fabricated phone field, no persisted chatbot history), legal basis for processing, recipients/processors (worded conditionally per the `n8n_enabled` toggle), international transfers (consistent with `/legal/cookies`), and retention/rights (no fabricated automated retention period).
- **`tests/unit/shared/legalTranslationKeys.test.ts`**: refactored into a `describe.each(LEGAL_PAGES)` harness covering `CookiesPage` and `PrivacidadPage`, with bidirectional key-set equality, non-empty resolution in both locales, content-shape (`<p>...</p>`) checks, sanitizer-allowlist checks, and a NAP-consistency check (`identityContentKeys`) that cross-references `streetAddress`/`postalCode`/`addressLocality` parsed live from `SeoSchema.tsx`.

## Fix applied (this fixup pass, post-verify)

1. **Address wording reconciled with PR-B (`feat/legal-aviso-content`)**: `legalPrivacidadSection1Content` previously omitted the region ("...38001, Santa Cruz de Tenerife, España" / "...Spain"). PR-B's `/legal/aviso` includes the region ("...Canarias, España" / "...Canary Islands, Spain"), which also matches `SeoSchema.tsx`'s `addressRegion: "Canary Islands"`. Updated both locales here to include the region, so the two legal pages read consistently. Note: `addressRegion` is not one of the 3 fields the NAP regression guard checks (`streetAddress`/`postalCode`/`addressLocality`), so this was a wording-consistency fix, not a guarded-field fix.
2. **CHANGELOG.md**: added an `[Unreleased] / Fixed` entry documenting the original content fix (this was missing from the initial apply pass — project protocol §4.2 requires it for every applied change).
3. **This audit doc**: added per project protocol §4.3.

## Verification run

- `npx tsc --noEmit` — clean.
- `npm run lint` — clean, 0 errors/warnings.
- `npm test` — full suite green (see `sdd/legal-content-gaps/verify-report` for the original 866/866 run; this fixup only touches string literals and docs, no new test logic on this branch).
- No build was run (per project's "never build after changes" rule).

## Known follow-ups (unchanged from verify report, not addressed here)

- Merge-order conflict in `tests/unit/shared/legalTranslationKeys.test.ts` when the second of PR-A/PR-B merges — confirmed mechanically safe by the verify pass's real local test-merge, resolves naturally at merge time.
- Post-merge fold-in of `AvisoLegalPage` into this branch's `describe.each(LEGAL_PAGES)` array as a third entry, once merge order is decided.
