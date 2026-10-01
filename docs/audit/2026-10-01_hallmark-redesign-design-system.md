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

## Follow-ups (not done)

- Metric-matched `@font-face` fallbacks (`size-adjust`) for DM Sans / Space Grotesk to further reduce font-swap CLS (needs measured metrics).
- `hreflang` is inconsistent between pages (About and NFC declare it, home does not) — needs a decision.
- Carta Digital keeps an sr-only h1 with the visible hero as h2; promoting it is an SEO copy decision.
