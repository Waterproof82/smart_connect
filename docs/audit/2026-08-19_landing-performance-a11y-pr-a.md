# Audit Log — Landing/TPV Asset Delivery Fixes (PR A: U1+U2)

**Date:** 2026-08-19
**Change:** SDD `landing-performance-a11y` (PR A of 3 — U1+U2 image optimization)
**Type:** Performance fix (Changed)
**Delivery strategy:** ask-on-risk, chain strategy stacked-to-main; PR A ~120 code lines + 13 binary asset diffs, 400-line budget risk Low.

## Summary

Full SDD pipeline (spec → design → tasks → apply, engram-backed) for landing/TPV image
delivery. Two independent units shipped together as PR A because both are pure asset
regeneration + mechanical `src`/`width`/`height` updates with no shared risk surface with
PR B (Supabase chokepoint) or PR C (contrast tokens), which run as separate later apply
passes.

## U1 — TPV figure resize

**Finding:** `TpvModuleFigure.tsx` renders into a fixed `468px` CSS-width column
(`.container.max-w-5xl` 1024px − `px-6` 48 = 976; `lg:grid-cols-2 gap-10` → (976−40)/2 =
468px). At 2x DPR the correct intrinsic size is `936x702`. 10 of the 12 TPV module
sections declared `1400x1050` — ~2.2x oversized transfer even at retina.

**Fix:** Added `scripts/optimize-images.mjs` (new `sharp` devDependency, `npm run
optimize:images`) exporting `resizeTpvFigure()`/`convertCartaDigitalScreenshot()` plus the
exact target-file lists/dimensions/quality as named constants (`TPV_TARGETS`,
`CARTA_DIGITAL_TARGETS`, `TPV_WIDTH`/`TPV_HEIGHT`/`WEBP_QUALITY`). Ran it once to resize,
in place, same filename: `tpv-cobro`, `comandero-movil`, `kds-cocina`, `gestion-reservas`,
`stock-inventario`, `sistema-alergenos`, `multi-iva-igic`, `delivery-takeaway`,
`fichajes-control-horario`, `rbac-roles` → `936x702` WebP q80. Synced the `width`/`height`
props in all 10 caller `*Section.tsx` files from `1400`/`1050` to `936`/`702`.

**Deliberately untouched:** `ComprasSialtiSection.tsx` / `FoodCostAvanzadoSection.tsx`
already declare `900x675` — within 4% of target; regenerating buys nothing and risks a
second lossy re-compression pass. `TpvModuleFigure.tsx` itself is unchanged — no
`srcset`/`sizes`, per design.md's decision that the fixed-width layout can't express
meaningful responsive variation.

## U2 — Carta Digital PNG → WebP

**Finding:** `CartaDigitalDemoSection.tsx`'s 3 demo screenshots
(`carta-digital-cliente`/`-dashboard`/`-pedidos`) were PNG, ~1 MB combined, despite
`CartaDigitalLightbox.tsx` rendering the same `src` up to `max-w-5xl` (~2048px @2x) —
below their existing intrinsic dimensions, so no downscale was applicable.

**Fix:** Converted all 3 to WebP q80 at their **original** dimensions (`1157x906`,
`1895x551`, `1702x887`) via the same script. Updated the 3 `src` refs in
`CartaDigitalDemoSection.tsx` from `.png` to `.webp`. Deleted the 3 superseded PNGs.
Combined output: **~139 KiB** (well under the 300 KiB spec target).

**`carta-digital-admin.png` explicitly out of scope** — not referenced by
`CartaDigitalDemoSection.tsx`'s 3-screen list, left untouched.

**Deviation from tasks.md:** task 3.2 instructed updating `CartaDigitalLightbox.tsx`'s
"same 3 `src` refs `.png`→`.webp`". On inspection, `CartaDigitalLightbox.tsx` has **no
hardcoded image paths** — it receives `image: string | null` as a prop, populated from
`CartaDigitalSection.tsx`'s `lightboxImage` state via `onOpenLightbox(screen.image)`, i.e.
the same string already updated in `CartaDigitalDemoSection.tsx`. No separate edit was
needed or made; the lightbox picks up the `.webp` paths automatically through the existing
data flow.

**Legibility check (task 4.1):** all 3 WebP screenshots inspected at full lightbox
render size — headline/body text, chart axis labels, and small chip text all remained
crisp at q80. No quality adjustment needed.

## Tests

`tests/unit/scripts/optimizeImages.test.ts` (new, Strict TDD — genuine RED→GREEN):
spawns a real `node --input-type=module` subprocess (same pattern as
`sitemapGeneration.test.ts`, since ts-jest can't `import()` plain `.mjs` directly) to
exercise `resizeTpvFigure()`/`convertCartaDigitalScreenshot()` against real fixture images
generated with `sharp`, plus assertions on the exported target-list/dimension constants.

Initial RED run caught two real Windows-specific bugs, fixed before GREEN:
1. `resizeTpvFigure()` piping `sharp(path)` input/output through the same file path raced
   the still-open read handle (`unable to open for write`) — fixed by buffering the input
   via `fs.readFile()` before writing back.
2. The `import.meta.url === \`file://${process.argv[1]}\`` direct-execution guard doesn't
   match on Windows (`argv[1]` uses backslashes); replaced with
   `pathToFileURL(process.argv[1]).href`, guarded against `argv[1]` being `undefined` in
   the `-e` test-harness context.

`CartaDigitalDemoSection.tsx`'s `.png`→`.webp` swap and the 10 TPV
`width`/`height` prop syncs are pure, non-behavioral value changes with zero existing test
coverage precedent for these presentational components (no `*Section.test.tsx` exists for
any TPV or Carta Digital demo component) — no test added, per the project's existing
convention of not force-fitting tests onto mechanical JSX literal changes.

## Verification

- `npx jest --config=jest.config.js`: 71/71 suites, 931/931 tests passing (no regressions).
- `npx tsc --noEmit`: clean.
- `npm run lint`: clean, 0 warnings.
- Manual dimension/size verification via `sharp` metadata on all 13 regenerated files
  (10 TPV @ 936x702, 2 untouched TPV @ 900x675, 3 carta-digital @ original dims).
