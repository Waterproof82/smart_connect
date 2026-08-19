# Audit Log — Carta Digital Emoji-to-Icon System

**Date:** 2026-08-19
**Components:** 6 files under `src/features/landing/presentation/components/CartaDigital*.tsx`
**Type:** Refactor / consistency fix (Changed)

## Summary

Last open item from the sitewide theme audit (`sdd/sitewide-theme/explore`, Engram): 6 Carta
Digital sections used raw emoji characters as feature icons instead of the `lucide-react`
components used everywhere else on the site (Hero, tap-review, chatbot, admin). Because this
touches 6 files and requires real design judgment (mapping 18 emoji to semantically equivalent
icons, choosing a color treatment), it crosses this project's own SDD Enforcement Threshold.
Proposed the full mapping + styling approach to the user for confirmation before writing any
code (matches this session's established "confirm visual changes first" pattern), got explicit
sign-off, then implemented directly under Strict TDD.

## Icon mapping

| File | Emoji | Feature (real copy) | Icon |
|---|---|---|---|
| `CartaDigitalAntidesperdicioSection.tsx` | ⏱️ | Descuentos por tiempo limitado | `Timer` |
| | 📣 | Notificación a clientes frecuentes | `Megaphone` |
| | 📈 | Menos pérdidas, más margen | `TrendingUp` |
| `CartaDigitalBeneficiosSection.tsx` | 🍽️ | Experiencia premium en mesa | `UtensilsCrossed` |
| | 🌍 | Sin barreras de idioma | `Languages` |
| | 💰 | Cero comisiones | `Coins` |
| | 👤 | Tus clientes, tu base | `UserCheck` |
| | 💬 | Pedidos por Telegram | `MessageCircle` |
| | 🌐 | Presencia digital | `Globe` |
| | ⚙️ | Gestión total | `Settings` |
| `CartaDigitalDineroSection.tsx` | 📈 | decorative growth badge (all other icons in this file were already lucide) | `TrendingUp` |
| `CartaDigitalHeroSection.tsx` | 📍 | inline prefix before the Tenerife location line | `MapPin` |
| `CartaDigitalModosSection.tsx` | 🍽️ | Modo Restaurante | `UtensilsCrossed` |
| | 🛒 | Modo Tienda | `ShoppingCart` |
| `CartaDigitalTelegramSection.tsx` | 📱 | Pedido online al instante | `Smartphone` |
| | 👥 | Grupo de Telegram del equipo | `Users` |
| | ✅ | Respuesta con un botón | `CheckCircle2` |
| | 🍽️ | Camarero en mesa desde el móvil | `UtensilsCrossed` |

## Styling decision

Emoji glyphs render in their own native color regardless of CSS `color`; swapping to `lucide`
SVGs (which use `currentColor`/`stroke`) means every icon needed an explicit color for the first
time. Chose a single flat `text-[var(--color-primary)]` accent (not a per-item `--color-icon-*`
rotation) — matches the existing icon-badge idiom already used by `Hero.tsx`'s eyebrow badge and
`AboutPage.tsx`'s contact circles, and keeps this a scoped "fix the anti-pattern" change rather
than introducing a new multi-color design statement. Wrapper containers kept their original
sizing intent, converted from font-size classes (`text-2xl`/`text-3xl`, meaningless for an SVG)
to explicit box dimensions (`w-6 h-6`, `w-7 h-7`) plus `w-full h-full` on the icon itself where
the icon sits inside a sized wrapper div.

## Explicitly out of scope

- `SuccessStats.tsx`'s `★★★★★` rating string — a decorative rating glyph, not an icon standing
  in for a concept.
- `CartaDigitalModosSection.tsx`'s `✓` checkmark bullets — same reasoning, list-bullet glyph, not
  a feature icon. Both were already flagged as correctly-excluded in the original sitewide audit.

## Testing (Strict TDD)

Extended the 3 existing colocated test files (`CartaDigitalAntidesperdicioSection`,
`CartaDigitalModosSection`, `CartaDigitalTelegramSection` — each already covered basic rendering)
with two new assertions per file: an `<svg>` is present inside each feature/card container, and
the container's `textContent` no longer matches any of that file's old emoji characters. Added 3
new test files for the previously-uncovered `CartaDigitalBeneficiosSection`,
`CartaDigitalDineroSection`, and `CartaDigitalHeroSection`, following the same pattern.
`CartaDigitalBeneficiosSection.tsx` also gained a `data-testid="beneficio-item"` on its list
items (it had none before), matching the testid convention already used by the Antidesperdicio
and Telegram sections' feature cards.

## Verification

- `npx tsc --noEmit` — 0 errors.
- `npm run lint` — 0 warnings.
- `npx vitest run` — 46/49 passing on this branch (this branch doesn't carry the unrelated
  `feat/button-system-unification` test files); the 3 failures are the same pre-existing,
  unrelated failures present all session (`TestimonialCarousel.test.tsx` ×1,
  `HomeFaqSection.test.tsx` ×2).
- `npm run test -- --silent` (Jest) — 926/926, 0 regressions.
- Full-tree grep for the emoji Unicode ranges confirms zero remaining icon-concept emoji in
  `src/features/landing/presentation/components/*.tsx`; the only 2 remaining matches
  (`SuccessStats.tsx`'s ★, `CartaDigitalModosSection.tsx`'s ✓) are the confirmed-out-of-scope
  decorative glyphs above.
