# Audit — Spanish from Spain across the site; Telegram as the ordering channel

**Timestamp:** 2026-10-08
**Trigger:** The owner asked for the whole site to be in Spanish from Spain, and confirmed that digital-menu orders arrive through Telegram, not WhatsApp.

## Findings

- **Voseo in public copy.** Six strings on `/carta-digital`, all in `src/shared/context/LanguageContext.tsx`:
  - `cartaFaqA4` ("Pagás")
  - `cartaTelegramFeature3Desc` ("Confirmás")
  - `cartaModosSubtitle` ("Elegí")
  - `cartaAntidesperdicioDesc` ("Publicá")
  - `cartaAntidesperdicioFeature1Desc` ("Marcá")
  - `cartaAntidesperdicioFeature3Desc` ("Recuperá")
- **Voseo in admin copy.** "necesitás" appears in `UpdateSettingsUseCase.ts` (2 occurrences) and `settingsSchema.ts`.
- **Wrong ordering channel.** The site said orders arrive by WhatsApp in 4 places:
  - `LanguageContext.tsx`, the carta digital page's final call to action (ES and EN);
  - `src/WebMCP.ts`, the carta digital product description served to AI agents (ES and EN).
- **No Latin American vocabulary found** (celular, computadora, ustedes, mesero…).

## Actions (TDD)

1. Wrote `src/__tests__/spanishLocale.guard.test.ts` first. It failed as expected.
   - The first version of the guard had two false positives: Tailwind `animate-*` classes, and the eval set's own forbidden-terms list.
   - It also had false negatives on forms ending in an accented letter: JS `\b` treats `í`/`á` as non-word characters.
   - Fixed with Unicode-aware lookarounds (`(?<![\p{L}-])…(?![\p{L}-])`, `u` flag) and an explicit file exclusion. After the fix, the guard reported exactly the 13 real occurrences.
2. Replaced every occurrence, one line each. Updated the admin use-case test to expect the corrected message.
3. Curated KB (`content/knowledge-base/carta-digital.md`): new section on why orders arrive by Telegram, using only the owner's reasons.
   - Scheduled one-tap replies, for example "recoger en 10 minutos".
   - Cleaner message handling: messages can be deleted or managed automatically once answered.
   - WhatsApp is a contact channel only.
4. Eval set: added `pedidos-telegram`.
5. Full suite: 1815 tests passed. `tsc` and `lint` are clean.

## Follow-up

Rebuild and re-ingest, so the chatbot drops the old voseo and WhatsApp-orders chunks: `delete_stale_documents` removes the superseded site chunks. Then run `npm run eval-kb`.
