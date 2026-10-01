# Audit — Hallmark redesign: unified design system for all public pages

- **Timestamp:** 2026-10-01T21:30:00Z
- **Operation:** Redesign (Hallmark `redesign`, multi-page flow) + SEO Specialist review
- **Scope:** every public route — `/`, `/carta-digital`, `/tarjetas-nfc`, `/ia-chatbots-tenerife`, `/tpv-restaurantes`, `/about`, `/legal/*`, 404. Admin and chatbot app surfaces untouched.

## Brief (confirmed by the user)

- Audience: hospitality (restaurants, bars, cafés) plus shops and businesses that need IT services or NFC cards.
- Primary action: contact via WhatsApp.
- Goal: every page homogeneous, same structure.

## Actions

1. Pre-flight scan: React + Vite + Tailwind 4 + SSR prerender; brand OKLCH palette (hue 250) preserved; three web fonts found (Space Grotesk, DM Sans, Instrument Sans).
2. SEO Specialist (sub-agent) produced guardrails before any edit: one h1 per route, untouched meta/JSON-LD, FAQ visible == FAQPage, anchors kept, WhatsApp link rules, CWV risks.
3. Created the locked system: `design.md`, `tokens.css`, `.ds-*` classes in `src/index.css`, shared components `PageShell`, `PageHero`, `Section`, `FaqList`, `ClosingCta`, `WhatsAppCta`, `MobileWhatsAppBar`, i18n module `design-system.ts`.
4. Refactored every page onto `PageShell` (removed 6 copies of the nav/sentinel/footer shell); normalised section padding, containers and heading classes across Carta Digital, NFC, TPV module and home sections.
5. WhatsApp-first CTA: nav, heroes, closing blocks, footer and a mobile sticky bar; pre-filled message per service; absolute `/#contacto?servicio=` fallback in SSR. `useWhatsappPhone` now shares one request per page load.
6. Removed scroll-reveal animations, the animated home h1 (LCP), perpetual float loops, gradient text, the italic heading word, eyebrow pills and Instrument Sans.
7. Low-risk SEO fixes found by the guardrail pass: nav anchors made absolute; IA card titles h2→h3; home FAQ + contact now in prerendered HTML (lazy split was ineffective); contact values no longer emit "Cargando..." headings; TPV module fallbacks point to `/#contacto?servicio=`.

## Validation

- `npm run lint` — 0 errors / 0 warnings. `tsc --noEmit` — pass.
- Vitest — 98 passed, 3 failed (pre-existing on the base branch: TestimonialCarousel ×1, HomeFaqSection ×2; verified with `git stash`).
- Jest — 1062 passed; only `tests/integration/admin/documents-rls.test.ts` fails (needs Supabase credentials, unrelated).
- `npm run build` + prerender — 9 routes + 404; each has exactly one `<h1>`; JSON-LD and canonical present; no `smartconnectai`.
- Playwright at 320/375/414/768/1280 px on 7 routes — no horizontal overflow, one h1, no two-line CTA buttons.
- SEO Specialist final review — all guardrails pass; its two follow-ups fixed in this change.

## Follow-up pass — pending items resolved (2026-10-01T22:30:00Z)

User asked to fix everything left pending. Actions:

1. `buildWhatsappLink()` (`src/shared/utils/whatsappLink.ts`, TDD: tests/unit/shared/utils/whatsappLink.test.ts) is now the only WhatsApp URL builder: WhatsAppCta, 12 TPV module sections, Contact card, Carta Digital Glovo / closing / hero CTAs. Phone sanitised to digits (wa.me rejects `+`).
2. Carta Digital: closing + Glovo + hero CTAs moved to the shared WhatsApp button; hero rebuilt on the PageHero grammar; sr-only h1 replaced by the same keyword h1 shown on screen, slogan demoted to display `<p>`. Typo "Habar" fixed.
3. One `.ds-kicker` style replaces ~25 uppercase tracked eyebrows; card radii unified to `--radius-card` (rounded-xl).
4. Hreflang removed from About and NFC (site-wide rule: absent until language-addressable URLs; guarded by a new test). `og:locale`/`og:site_name` added to About, NFC, legal (new test). Home WebPage JSON-LD `@id`/`url` aligned with the canonical. Stale index.html SEO comment corrected.
5. Metric-matched `@font-face` fallbacks for DM Sans and Space Grotesk (values from @capsizecss/metrics).
6. Pre-existing failing tests fixed: HomeFaqSection (stale: FAQPage JSON-LD moved to App in e1f1461; duplicate "Preguntas frecuentes" heading match), TestimonialCarousel (quote rendered in typographic quotes); `documents-rls` integration guard now requires URL + anon + service key (it crashed when only the service key was set). HomeFaqSection now uses FaqList.

Validation: lint 0/0, tsc pass, Vitest 103/103, Jest 1082 passed / 14 skipped / 0 failed, build + prerender OK, Playwright 7 routes × 5 widths clean, SEO Specialist re-review.

## Follow-ups

- None open from this redesign. The chatbot widget's WhatsApp button (`ChatToggleButton`) now also uses `buildWhatsappLink` and hides below 768 px, where the sticky bar owns WhatsApp; a guard test forbids hand-built `wa.me` links anywhere in `src`. Admin panel untouched (out of scope).
