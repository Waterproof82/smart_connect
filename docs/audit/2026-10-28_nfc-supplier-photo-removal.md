# 2026-10-28 — NFC supplier photo removal (F-07)

**Timestamp:** 2026-10-28T18:00:00Z

## Context

CI on `main` had been red since PR #165 (runs #414–#416). PR #165 put `Tarjeta_NFC_negra_MontesTAP.webp` on the home flagship NFC card, and the F-07 guard in `tests/unit/seo/keywordAlignment.gsc.test.ts:42` failed. The owner confirmed that the business has no permission to use the MontesTAP supplier photo.

## Actions

- Added the guard test `tests/unit/seo/nfcImageRights.test.ts` first (RED: 5/5 failing). It checks that nothing in `src/` references MontesTAP, that the file is not in `public/`, and which own images each surface uses.
- Converted the owner-supplied PNGs to WebP at q80, keeping the original dimensions: `tarjeta_nfc_google` 428x404 (132 KB → 16 KB) and `tarjeta_nfc` 625x436 (158 KB → 22 KB).
- `HomeSolutionsSection.tsx` uses `/assets/nfc/tarjeta_nfc_google.webp`, with width/height set to the real size.
- `CartaDigitalSolucionSection.tsx` uses `/assets/nfc/tarjeta_nfc_google.webp` for its decorative background.
- The fallback in `ProductGallery.tsx` (NFC page) uses `/assets/nfc/tarjeta_nfc.webp`, with width/height set to 625x436.
- Deleted `public/assets/Tarjeta_NFC_negra_MontesTAP.webp`.

- Re-converted `tarjeta_nfc_google.png` after the owner replaced it (428x404, now 21 KB).
- Deleted the 4 supplier SKU-named gallery originals (`S…jpg_640x640q75.jpg_.avif`), after checking with `cmp` that each one is byte-identical to its descriptive copy. `scripts/optimize-images.mjs` now lists `NFC_GALLERY_MAINS` instead of using `NFC_RENAMES`/`renameNfcGalleryAssets`. A guard was added to `nfcImageRights.test.ts`; it was RED first.
- `HowItWorks.tsx` step 1: replaced `put_exibitor.webp` (3200x3200) with `tarjeta_nfc.webp` (625x436) and deleted the old file. A guard assertion was added first and was RED before the change.
- Image rights metadata: exiftool 13.60 wrote the XMP fields `dc:Creator`, `dc:Rights` (`© 2026 Digitaliza Tenerife`), `photoshop:Credit`, `xmpRights:Marked/WebStatement`, `plus:Licensor*` and `iptcCore:CreatorWorkURL` into the 12 own NFC images. A SHA-1 of the raw pixels is identical before and after, so nothing was re-encoded. Gotcha: on Windows, a `©` passed as a command-line argument is stored as `?`, so the value has to go through a UTF-8 `-@` argfile. The guard is `tests/unit/seo/imageRights.metadata.test.ts`, which was RED first.
- Added `ImageRightsSchema` (in `SeoSchema.tsx`) with `ImageObject` nodes for creator, copyrightHolder (`@id` organisation), creditText, copyrightNotice and license. It is rendered on `TapReviewPage`.
- Caution: `sharp` drops metadata by default. If `optimize-images.mjs` regenerates the 128w thumbnails, the XMP has to be written again (the guard test will fail until it is).
- Unused-image sweep of `public/`: no orphan images found. Every `-320w`/`-480w`/`-720w`/`-1280w` variant is referenced through template strings (`TpvModuleFigure.tsx:38`, `CartaDigitalDemoSection.tsx:134`).

## Verification

- Jest: every unit suite passes. The only failure is `tests/e2e/chatbotFlow.test.ts`, which returns 503 from the live chatbot endpoint. That test is unrelated to this change and is skipped in CI.
- `npm run lint` and `npm run type-check` are clean.

## Follow-up

- None. The owner confirmed on 2026-10-28 that the remaining NFC page photos are their own: the gallery `nfc-*.avif` mains and thumbnails, `place_device.jpg` and `review.webp`. F-07 is closed.
