# Design — Digitaliza Tenerife

A locked design system for every public page of digitalizatenerife.es. Every
page redesign reads this file before emitting code. Do not regenerate per
page — extend or amend this file when the system needs to grow.

> Produced by `hallmark redesign` (multi-page flow), 2026-10-01.
> Stamp: `/* Hallmark · genre: modern-minimal · design-system: design.md · designed-as-app */` (see `tokens.css`).

## Audience & job

- **Who:** owners of restaurants, bars and cafés, plus shops and businesses in
  Tenerife / Canarias that need IT services or NFC review cards. Mostly
  non-technical.
- **One action:** start a WhatsApp conversation. Every page has exactly one
  filled CTA, and it is WhatsApp green.
- **Tone:** utilitarian — plain, specific, no hype, no invented metrics.

## Genre

modern-minimal (confident sans display, composed page, no scroll reveals,
pill CTAs, a single brand accent).

## Macrostructure family

- **Home (`/`):** Marquee Hero → solutions hub → why-us stat strip → results →
  FAQ → contact form.
- **Product pages** (`/carta-digital`, `/tarjetas-nfc`, `/ia-chatbots-tenerife`,
  `/tpv-restaurantes`): Long Document rhythm — `PageHero` → alternating
  `Section`s (base / alt tone) → FAQ (`FaqList`) → `ClosingCta` →
  `RelatedServices`.
- **Content pages** (`/about`, `/legal/*`, 404): `PageHero` + prose
  `Section`s, typography only.

## Theme (preserved brand palette — tokens live in `src/index.css`)

Dark is `:root`, light is `.light`. Both are first-class.

| Token | Dark | Light |
| --- | --- | --- |
| `--color-bg` (paper) | `oklch(8% 0.012 250)` | `oklch(98% 0.005 250)` |
| `--color-bg-alt` (paper-2) | `oklch(12% 0.015 250)` | `oklch(95% 0.008 250)` |
| `--color-text` (ink) | `oklch(95% 0.008 250)` | `oklch(15% 0.015 250)` |
| `--color-text-muted` (ink-2) | `oklch(60% 0.015 250)` | `oklch(45% 0.02 250)` |
| `--color-border` (rule) | `oklch(20% 0.018 250)` | `oklch(80% 0.012 250)` |
| `--color-primary` / `--color-accent` | `oklch(65% 0.18 250)` | `oklch(47% / 55% 0.18 250)` |
| `--color-whatsapp` (CTA) | `oklch(48% 0.18 150)` | `oklch(48% 0.18 150)` |
| `--color-on-whatsapp` | `oklch(99% 0.005 150)` | `oklch(99% 0.005 150)` |
| `--focus-ring` | `oklch(70% 0.15 250)` | `oklch(60% 0.15 250)` |

Accent discipline: brand blue marks emphasis words, icons and links only.
The WhatsApp green is reserved for the primary action.

## Typography

- **Display:** Space Grotesk 700 (h1/h2), 600 (h3) — `var(--font-display)`.
- **Body:** DM Sans 400/500/600 — `var(--font-body)`.
- Two families only. Instrument Sans was removed.
- Metric-matched local fallbacks (`DM Sans Fallback`, `Space Grotesk
  Fallback`: Arial + `size-adjust`/ascent/descent overrides, values from
  `@capsizecss/metrics`) keep the font swap free of layout shift.
- Self-hosted (sdd/core-web-vitals-perf PR1, 2026-10-07): variable woff2
  pulled from the Google Fonts CSS2 API, served from `public/fonts/`,
  `font-display: optional` on all 4 primary faces (zero font-swap CLS by
  construction — see owner decision on file). Real file sizes:
  `dm-sans-latin-opsz-wght.woff2` 62,724 B, `dm-sans-latin-ext-opsz-wght.woff2`
  31,292 B, `space-grotesk-latin-wght.woff2` 22,288 B,
  `space-grotesk-latin-ext-wght.woff2` 18,940 B. Only 2 faces (latin) are
  preloaded in `index.html`; latin-ext loads on demand via `unicode-range`.
  Risk: the DM Sans latin face (~61 KB) is noticeably larger than the ~40 KB
  budget assumed in design — it carries the full opsz 9..40 + wght 400..700
  variable axes; not changing the plan, flagging for verify/future
  subsetting.
- Display tracking `-0.025em`, leading `1.05`. All headings roman — never italic.
- Scale (`tokens.css`): `--text-display`, `--text-display-s`, `--text-h2`,
  `--text-h3`, `--text-lede`. Classes: `.ds-h1`, `.ds-h1--s`, `.ds-h2`,
  `.ds-h3`, `.ds-lede`, `.ds-kicker`.
- `.ds-kicker` is the only label-above-a-heading style: sentence case,
  primary colour, no uppercase tracking.

## Spacing & layout

4-pt named scale `--space-3xs … --space-3xl`. Section rhythm is one token:
`--section-y`. Containers: `.ds-container` (72rem) and
`.ds-container--prose` (46rem). Gutter: `--page-gutter`. Section heads are
always stacked (heading above intro) — never a left-label / right-heading
split.

## Motion

- Easings: `--ease-out`, `--ease-in`, `--ease-in-out`; durations `--dur-short`
  (150 ms), `--dur-med` (220 ms).
- Reveal pattern: **none**. Content is never rendered at `opacity: 0`; the
  hero h1 (LCP) is never animated.
- Reduced motion: global 0.01 ms override in `src/index.css`.

## Microinteractions stance

- Silent success; no celebratory toasts.
- Buttons: colour change on hover, 1 px press on `:active`, focus ring at
  3 px offset shown instantly.
- FAQ uses native `<details>`; answers stay in the DOM.

## CTA voice

- **Primary:** `<WhatsAppCta/>` (`.btn-wa`) — pill, WhatsApp green, message
  icon, verb-first label ("Escríbenos por WhatsApp", "Contactar", "Pedir una
  demo"). Links to `https://wa.me/<phone>?text=<pre-filled per service>`;
  SSR / no-phone fallback is the absolute `/#contacto?servicio=…`.
  Every WhatsApp URL on the site is built by
  `buildWhatsappLink()` (`src/shared/utils/whatsappLink.ts`) — never
  hand-build `wa.me` links. Secondary in-section links (TPV modules) use it
  too, styled as typographic links.
- **Secondary:** `.btn-ghost` — pill, hairline border, transparent.
- **Mobile:** `MobileWhatsAppBar` (C4 sticky bottom bar) below 768 px; space
  reserved via `--wa-bar-h` so chatbot and cookie reopener sit above it.

## Nav & footer

- **Nav:** N1b three-section — wordmark · solutions dropdown + anchors ·
  language + WhatsApp CTA. Mobile: ghost menu trigger, drawer ends on a
  full-width WhatsApp CTA. Anchors are absolute (`/#contacto`).
- **Footer:** Ft5 Statement — one closing sentence + WhatsApp CTA, then the
  internal-linking map (all solutions, about, legal). Do not remove those
  links (SEO_PROTOCOL §3).

## Shared building blocks

| Component | Path |
| --- | --- |
| `PageShell` | `src/features/landing/presentation/components/PageShell.tsx` |
| `PageHero`, `Section`, `FaqList`, `ClosingCta`, `WhatsAppCta`, `MobileWhatsAppBar` | `src/shared/presentation/layout/` |

## Per-page allowances

- Marketing pages MAY use Tier-B hand-built SVG (home hero illustration) and
  product photography (NFC gallery).
- Content pages: typography only.
- Admin and chatbot app surfaces are out of scope for this file.

## What pages MUST share

- The wordmark, nav and footer (via `PageShell`).
- The WhatsApp primary CTA and its placement (hero + closing + mobile bar).
- Display + body fonts, heading classes, section rhythm, container widths.
- Exactly one visible `<h1>` per route (exception: `/tarjetas-nfc` keeps its
  frozen sr-only h1, SEO_PROTOCOL P-13). On `/carta-digital` the keyword h1
  sits above the display slogan, which is a `<p>`, not a heading.
- `og:locale` + `og:site_name` on every page; no `hreflang` anywhere until
  URLs are language-addressable.

## What pages MAY differ on

- Section count and order within the product-page family.
- Hero aside content (lede, gallery, illustration).

## Exports

### tokens.css

See [`tokens.css`](tokens.css) (structural tokens) and `src/index.css`
(`:root` / `.light` colour tokens).

### Tailwind v4 `@theme`

```css
@theme {
  --color-paper:   oklch(8% 0.012 250);
  --color-ink:     oklch(95% 0.008 250);
  --color-accent:  oklch(65% 0.18 250);
  --color-cta:     oklch(48% 0.18 150);
  --font-display:  "Space Grotesk", system-ui, sans-serif;
  --font-body:     "DM Sans", system-ui, sans-serif;
  --spacing-md:    1.5rem;
  --ease-out:      cubic-bezier(0.23, 1, 0.32, 1);
}
```

### DTCG `tokens.json`

```json
{
  "color": {
    "paper":  { "$value": "oklch(8% 0.012 250)",  "$type": "color" },
    "ink":    { "$value": "oklch(95% 0.008 250)", "$type": "color" },
    "accent": { "$value": "oklch(65% 0.18 250)",  "$type": "color" },
    "cta":    { "$value": "oklch(48% 0.18 150)",  "$type": "color" }
  },
  "font": {
    "display": { "$value": "Space Grotesk", "$type": "fontFamily" },
    "body":    { "$value": "DM Sans",       "$type": "fontFamily" }
  },
  "space": { "md": { "$value": "1.5rem", "$type": "dimension" } }
}
```

### shadcn/ui CSS variables

```css
:root {
  --background: 8% 0.012 250;
  --foreground: 95% 0.008 250;
  --primary: 65% 0.18 250;
  --primary-foreground: 98% 0.005 250;
  --border: 20% 0.018 250;
  --ring: 70% 0.15 250;
  --radius: 0.75rem;
}
```
