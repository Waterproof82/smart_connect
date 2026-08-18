# TPV Module Visual Redesign — SDD Change Audit

**Date**: 2026-08-11
**Author**: SDD Pipeline (sdd-apply agent)
**Change**: `digitaliza-tenerife-tpv-visual-redesign`
**Status**: Implementation complete across all 5 chained PRs (PR1–PR5). PR1–PR4 committed on their respective branches, not pushed/opened. PR5 (this audit) completes the chain — none pushed/opened yet, per instructions; ready for the user/orchestrator to open sequentially.

---

## Objective

Give each of the 12 flat TPV module sections (all of `TPV_MODULES` except `tienda-carta-digital`) a real self-hosted photo plus a unique OKLCH accent colour, replacing the single hardcoded emerald icon colour every module previously shared. `tienda-carta-digital` and the "Pilares Tecnológicos" block on `App.tsx` get accent-only treatment (no photos), per the proposal's resolved scope.

## Delivery Strategy

`ask-on-risk` with `feature-branch-chain`: PR1 → tracker branch; PR2 → PR1; PR3 → PR2; PR4 → PR3; PR5 → PR4. Only the tracker branch merges to `main`. Each PR independently revertable (`git revert`); token additions are additive so even a partial revert of `src/index.css` degrades gracefully via the `--color-primary` fallback baked into `accentStyle()`'s consumers.

| PR | Branch | Scope | Commit | Real diff (excl. binary) |
|---|---|---|---|---|
| PR1 | `feature/digitaliza-tenerife-visual-redesign-pr1` | Foundation: 8 new OKLCH tokens, `accents.ts`, `TpvModuleFigure`, all 13 config accents, `tpv-cobro` pilot | 2 commits (`66eca26` tokens, `14aaa33` pilot) | ~841 lines (over the ~330 estimate — accepted one-time foundation cost, driven by 2 new pure-computation test files) |
| PR2 | `.../pr2` | `comandero-movil`, `kds-cocina`, `gestion-reservas` | `75e6a87` (base PR1 `14aaa33`) | 211 lines (140 ins + 71 del) |
| PR3 | `.../pr3` | `fichajes-control-horario`, `delivery-takeaway`, `stock-inventario`, `multi-iva-igic` | `51557cd` (base PR2 `75e6a87`) | 273 lines (182 ins + 91 del) |
| PR4 | `.../pr4` | `rbac-roles`, `food-cost-avanzado`, `sistema-alergenos`, `compras-sialti` (completes 12-of-12) | `b988688` (base PR3 `51557cd`) | 270 lines (179 ins + 91 del) |
| PR5 | `.../pr5` (this change) | Pilares Tecnológicos accents, CREDITS.md integrity pass, CHANGELOG, this audit doc | see below | see below |

PR2–PR4 confirm a stable, linear ~68–70 changed lines per module once the PR1 foundation cost was paid.

## What Changed (PR5 specifically)

- `src/App.tsx` — "Pilares Tecnológicos" 4-item list gains 4 distinct lucide icons (`Workflow`, `Utensils`, `Monitor`, `Bot`) and 4 distinct accent tokens via `accentStyle()` + `.tpv-accent-chip` (`n8n → --color-icon-indigo`, `Carta Digital Premium → --color-icon-emerald`, `Plataforma TPV → --color-icon-coral`, `IA Conversacional → --color-icon-magenta`). No `<img>` added — accent-only, per spec's "Pilares Tecnológicos Accent-Only" requirement.
- `tests/unit/App.home.structure.test.ts` — new source-text test asserting: zero `<img>` in the Pilares block, all 4 lucide icon names present (both in the `lucide-react` import line and inside the block), all 4 accent tokens present and pairwise distinct, `accentStyle(` and `.tpv-accent-chip` both used.
- `public/assets/tpv/CREDITS.md` — reviewed, no edit required: 12 rows ↔ 12 `.webp` files confirmed bidirectionally complete (every filename has a row, every row's filename exists on disk), no duplicate Unsplash photo IDs.
- `CHANGELOG.md` — new `[Unreleased] → Added` entry summarizing the whole 5-PR visual redesign (12 modules photo+accent, Pilares accents, `tienda-carta-digital` accent-only).
- This audit doc.

`tienda-carta-digital` needed no PR5 change: its `iconColor` (`--color-icon-emerald`) was already set atomically in PR1's config edit (all 13 accents landed together in `tpvModules.ts`), and its section tree (`CartaDigitalDemoSection.tsx`) remains untouched — confirmed via `git diff --stat` against the pre-change commit, zero output.

## Full-Chain File Inventory (all 5 PRs)

**New files** (14): `src/shared/config/accents.ts`, `src/shared/components/tpv/TpvModuleFigure.tsx`, `tests/unit/accentTokens.contrast.test.ts`, `tests/unit/tpvModuleFigures.structure.test.ts`, `public/assets/tpv/CREDITS.md`, 12× `public/assets/tpv/{module-id}.webp`, `docs/audit/2026-08-11_tpv-visual-redesign.md` (this file).

**Modified files**: `src/index.css` (+8 OKLCH token pairs, `.tpv-accent-frame`/`.tpv-accent-chip`), `src/shared/config/tpvModules.ts` (13 unique `iconColor` values), 12× `src/shared/components/tpv/{Module}Section.tsx` (accent + figure wiring), 12× `src/shared/i18n/modules/{id}.ts` (+`{module}FigureAlt` key), `src/App.tsx` (Pilares accents), `tests/unit/App.home.structure.test.ts`, `CHANGELOG.md`.

**Untouched, verified not assumed**: `src/entry-server.tsx`, `src/entry-client.tsx`, `TpvModulesSection.tsx`, `TPV_MODULE_SECTIONS`, `TpvModuleSectionProps`, `CartaDigitalDemoSection.tsx`, `CartaDigitalSection.tsx`, `vercel.json`, `scripts/prerender.mjs` — confirmed via `git status --short` / `git diff --stat` showing empty output for these paths across every PR.

## IP-Collision-Check Methodology (design.md D8, used throughout PR1–PR4)

Automated guards (enforced by `tests/unit/tpvModuleFigures.structure.test.ts`):
1. **Completeness** — every `public/assets/tpv/*.webp` has a `CREDITS.md` row with non-empty ID, photographer, and `https://unsplash.com/photos/` URL; every row maps to an existing file.
2. **Uniqueness** — no photo ID repeats across rows.
3. **Origin** — the literal `smartbar.io` and 17 banned smartbar asset basenames (`phone`, `pedidos-qr`, `comanderohero`, `cocina-kds`, `inventario`, `estadisticas-stats`, `reservas`, `control-horario`, `verifactu`, `delivery`, `lara`, `whatsapp`, `smartbar-og`, etc.) appear nowhere under `src/` or `public/assets/tpv/`.

Manual guard (non-automatable, D8 §4 — judgment call, recorded here as the accountability record):
- **PR1** — sourced `tpv-cobro.webp` (Unsplash `ieqmC1QlHG0`, photographer SumUp), confirmed a genuine checkout/POS hospitality scene, visually distinct from smartbar's own screenshots. DevTools contrast spot-check of the coral token performed in both dark and light theme — both cleared the ≥3:1 non-text WCAG 2.1 SC 1.4.11 floor computed in `accentTokens.contrast.test.ts` (browser sRGB gamut-clipping of the authored out-of-gamut OKLCH values shifts real luminance by only a few percent, immaterial against the 6.1:1 dark-theme margin).
- **PR2–PR3** — sourced 3 + 4 photos via the `r.jina.ai` read-proxy technique (see "Sourcing method" below). Rejected candidates showing third-party delivery-app branding (Yandex Eda, Domino's, Glovo courier bags) and visible "Walmart" warehouse signage on separate professionalism grounds, distinct from the automatable smartbar-origin guard. Cross-checked the 2 delivery/stock candidates specifically flagged in `.firecrawl/smartbar-home.json` (CDN hashes `1565299624946-b28f40a0ae38`, `1606787366850-de6330128bfc`) — confirmed avoided.
- **PR4 (completion PR, elevated scrutiny)** — extracted **all 13 unique** `images.unsplash.com/photo-{hash}` CDN URLs embedded in `.firecrawl/smartbar-home.json` (not just the 2 previously flagged), via a Node regex scan. Confirmed zero collisions for all 4 PR4 photos. One near-miss caught by the elevated check: candidate `N_Y88TWmGwA` ("dish on white ceramic plate") resolved to hash `1414235077428-338989a2e8c0` — one of the 13 banned hashes — and was discarded (it was never a serious contender, confirming the check works as a real safety net, not just theatre). Also rejected `rbac-roles` candidate `5Xnv2np708c` after visual inspection revealed a readable third-party uniform logo, extending the brand-avoidance precedent from bag branding to apparel branding.
- **PR5** — no new photos sourced (accent-only scope); re-verified the CREDITS.md ↔ filesystem bidirectional completeness and uniqueness one final time as the closing integrity pass.

**Sourcing method** (recorded for reproducibility, since Unsplash's own search UI is Anubis-gated in this sandbox): `https://r.jina.ai/https://unsplash.com/s/photos/{query}` read-proxy renders search-result markdown with `unsplash.com/photos/{id}` links; the direct `unsplash.com/photos/{id}/download` endpoint (not gated) 302-redirects to the real `images.unsplash.com/photo-{timestamp}-{hash}` CDN URL via its `Location` header. The same CDN query-param WebP export (`?auto=format&fit=crop&w=1400&h=1050&q=82&fm=webp`, functionally equivalent to `cwebp -q 82 -resize 1400 1050`) was used for all 12 photos. Two PR4 photos (`food-cost-avanzado`, `compras-sialti`) exceeded the 150KB budget at the standard 1400×1050 export even down to q=50; both were re-exported at `w=900&h=675&q=75` (same 4:3 ratio) to land under budget — `<TpvModuleFigure width={900} height={675}>` set accordingly in JSX to match the actual intrinsic asset dimensions.

## Verification Summary

### PR1 (foundation + pilot)
- `npx tsc --noEmit`, `npm run lint --max-warnings 0`, `npm test`, `npm run build` — all exit 0.
- `dist/index.html` grepped for `--tpv-accent:var(--color-icon-coral)` — found, confirming the custom property survives SSR.
- Manual DevTools contrast spot-check (coral, both themes) — passed.

### PR2 / PR3 / PR4
- Same 4 commands, all exit 0 at each step. Suite grew from 559 → 583 → 615 → 647 tests as each PR's module template was added. `dist/index.html` grepped for each PR's new tokens every time — all found. `entry-server.tsx`/`entry-client.tsx` confirmed untouched via empty `git status --short` diff at every PR. Zero `React.lazy`/`lazy(`/`Suspense` confirmed in `src/shared/components/tpv/` at every PR.

### PR5 (this change) — full-chain final gate
```
npx tsc --noEmit                    → exit 0, clean
npm run lint --max-warnings 0       → exit 0, clean
npm test                            → 58 suites / 648 tests, all green
                                       (+1 vs PR4's 647 — the new Pilares test)
npm run build                       → client + SSR + prerender succeeded,
                                       6 routes prerendered (/, /about,
                                       /tarjetas-nfc, /legal/aviso,
                                       /legal/privacidad, /legal/cookies)
```
`dist/index.html` grepped for all 4 Pilares accent tokens (`--tpv-accent:var(--color-icon-{indigo,emerald,coral,magenta})`) — all found (indigo and coral each appear twice, once for their Pilares row and once for the module section that also uses that hue — `multi-iva-igic`/`tpv-cobro` respectively — which is expected and not a collision, since Pilares and the module sections are separate DOM subtrees). `src/entry-server.tsx`/`src/entry-client.tsx` confirmed untouched. Zero `React.lazy`/`lazy(`/`Suspense` in `src/App.tsx` beyond the pre-existing, unrelated lazy-loaded non-home routes in `entry-client.tsx` (`AdminPanel`, `AboutPage`, `TapReviewPage`, legal pages, `NotFound` — none of these are the landing/home route tree and none were touched by this change).

### Whole-chain accent consistency spot-check (PR5 acceptance gate)
Grepped every module section's `accentStyle("--color-icon-*")` call against `TPV_MODULES[].iconColor` in `tpvModules.ts` — all 12 match exactly: `tpv-cobro`→coral, `comandero-movil`→jade, `kds-cocina`→purple, `gestion-reservas`→amber, `fichajes-control-horario`→blue, `delivery-takeaway`→rose, `stock-inventario`→green, `multi-iva-igic`→indigo, `rbac-roles`→orange, `food-cost-avanzado`→cyan, `sistema-alergenos`→magenta, `compras-sialti`→lime. `tienda-carta-digital`→emerald confirmed in config (no section-level accent, per accent-only scope). All 13 tokens pairwise distinct — matches design.md's D5 assignment table exactly.

## Deviations from Design/Tasks

None. PR5 implemented exactly the scope in `tasks.md`'s PR5 section: Pilares accents (7.1–7.2), CREDITS/CHANGELOG/audit close-out (8.1–8.3), full-suite verification (9.1–9.4).

## Rollback

Per-PR `git revert`, in reverse chain order (PR5 → PR4 → PR3 → PR2 → PR1). A partial revert of `src/index.css` alone leaves every section's `--tpv-accent` pointing at an undefined custom property, which falls back to `--color-primary` (brand blue) at every `var(--tpv-accent, var(--color-primary))` call site — a graceful degradation, not a broken render. Full revert removes `public/assets/tpv/` entirely and reverts all 12 sections + config + CSS + Pilares.

## Follow-ups (out of scope, logged for future consideration)

- Module photos are not currently referenced in the `Service` JSON-LD `image` field — a real SEO opportunity noted in design.md's open questions (Q3), deferred.
- `jest.config.js`'s `testMatch` still only covers `.ts`, not `.tsx` (pre-existing gap noted in the `landing-two-solutions` change's audit doc) — unrelated to this change, not touched.
