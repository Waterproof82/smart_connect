# SEO Keyword Copy — Slice A / PR A (2026-10-05)

SDD change: `seo-keyword-copy`. Slice A covers `/tarjetas-nfc` H2 wording +
FAQ4, the `/ia-chatbots-tenerife` title/H1/H2/FAQ6 rewrite, the
`docs/SEO_PROTOCOL.md` row updates and the `scripts/site-routes.json`
`lastmod` bump for both routes. Slice B (Carta Digital H2, home anchors,
About paragraph) ships in a separate chained PR and will append its own
entry below — do not remove this entry when it does.

## Before

- `/tarjetas-nfc`: `tapReviewHowTitle` read the generic "¿Cómo funciona?" /
  "How does it work?"; `tapReviewFeatTitle` read "Ventajas Tap-to-Review" /
  "Tap-to-Review Advantages" — neither matched the GSC "tap to review" / "tap
  nfc" intent queries. `useNfcFaqGroup()` had 3 items, no NFC-vs-QR pair.
- `/ia-chatbots-tenerife`: `PAGE_TITLE` was "Chatbots IA y Automatización en
  Tenerife | Digitaliza Tenerife" (62 chars — over the 60-char budget).
  `iaH1`/`iaIntro` led with "chatbots de IA" rather than the larger
  "inteligencia artificial"/"automatización" clusters (84 + 20 GSC
  impressions). The 4-card chatbot grid had no section H2 of its own
  (`<Section label={t.iaH1}>`, headless), each card rendered `<h2>` — a flat
  4-H2 outline. `iaCasesTitle` read "Casos para hostelería y comercio
  local", and the 3 case descriptions ("Responde dudas…", "Recoge las
  peticiones…", "Atiende preguntas…") were phrased close enough to a
  client-result narrative to risk reading as an unsourced case study.

## Change

- `src/shared/context/LanguageContext.tsx`: reworded `tapReviewHowTitle`
  (es/en) to "¿Cómo funciona la tecnología Tap NFC para conseguir reseñas en
  Google?" / "How does Tap NFC technology work for Google reviews?" and
  `tapReviewFeatTitle` to "Dispositivos Tap to Review listos para usar en
  Canarias" / "Tap to Review devices, ready to use in the Canary Islands".
  Added `tapReviewFAQ4Question`/`tapReviewFAQ4Answer` (es/en) — NFC vs QR for
  reviews — to the `Translation` interface and both locale blocks. The
  existing frozen `tapReviewFAQ1-3*`, `tapReviewCTA*`, and the "5 segundos"
  keys (design.md D9) are untouched.
- `src/features/landing/presentation/components/HomeFaqSection.tsx`:
  `useNfcFaqGroup()` now returns 4 items, the 4th wired from
  `tapReviewFAQ4Question`/`Answer`. `TapReviewPage.tsx`'s existing
  `nfcFaqGroup.items` → `<FaqList>` / `<SeoFaqSchema>` wiring is unchanged
  and structurally guarantees JSON-LD parity (same array feeds both).
- `src/shared/i18n/modules/page-copy.ts`: added `iaChatbotsTitle`,
  `iaCasesIntro`, `iaFaqQ6`/`iaFaqA6` to `PageCopy`; reworded `iaH1` to
  "Inteligencia artificial y automatización para empresas en Tenerife y
  Canarias" / "Artificial intelligence and automation for businesses in
  Tenerife and the Canary Islands"; renamed `iaCasesTitle` to "Aplicaciones
  prácticas de IA para pymes y negocios locales" / "Practical AI
  applications for SMEs and local businesses"; rewrote `iaCase1-3Desc` as
  "Puede…" / "It can…" capability statements (no named client, no metric);
  added `iaFaqQ6`/`A6` on how a local pyme can use AI. `iaCase1-3Title` are
  unchanged.
- `src/features/landing/presentation/components/IaChatbotsPage.tsx`: shortened
  `PAGE_TITLE` to "Chatbots IA para empresas en Tenerife | Digitaliza
  Tenerife" (59 chars, leads with "Chatbots", keeps the brand suffix per
  design.md D1); `PAGE_DESCRIPTION` rewritten (143 chars); `og:image:alt`
  updated to match. `faqs` array gains `{ question: t.iaFaqQ6, answer:
  t.iaFaqA6 }`. The chatbot-card grid section changed from the headless
  `<Section label={t.iaH1}>` to `<Section id="ia-chatbots"
  title={t.iaChatbotsTitle}>`, and each card's heading changed from `<h2>`
  to `<h3>` (fixes the flat 4-H2 outline — SEO_PROTOCOL outline item 1). The
  `#ia-cases` section now passes `intro={t.iaCasesIntro}`.
- `scripts/site-routes.json`: `lastmod` bumped from `2026-10-01` to
  `2026-10-05` for `/tarjetas-nfc` and `/ia-chatbots-tenerife`. Neither
  route's `sources` list includes `LanguageContext.tsx`, so `git log`-based
  resolution would not have detected this content change — the floor bump is
  required per SEO_PROTOCOL P-20.
- `docs/SEO_PROTOCOL.md`: row 22 (title/description/H1 columns) updated to
  the shipped `/ia-chatbots-tenerife` copy and exact character counts (59 /
  143 / 77). Row 40 (`/tarjetas-nfc`) notes the reworded `HowItWorks`/
  `Features` H2s and the FAQ group now at 4 entries. Row 41
  (`/ia-chatbots-tenerife`) outline updated: new H2 "Chatbots con IA y
  robots de atención al público", renamed "Aplicaciones prácticas…" H2, and
  FAQ count (6).
- `CHANGELOG.md`: `[Unreleased]` → `### Changed` entry added.
- New tests (strict TDD, RED written and run before any implementation
  edit): `tests/unit/seo/keywordCopy.nfc.test.ts`,
  `tests/unit/seo/keywordCopy.ia.test.ts`,
  `tests/unit/seo/keywordCopy.claims.test.ts`.

## After

- **RED**: ran the 3 new test files against the unmodified codebase —
  `npm test -- tests/unit/seo/keywordCopy.nfc.test.ts
  tests/unit/seo/keywordCopy.ia.test.ts
  tests/unit/seo/keywordCopy.claims.test.ts`: 35 failed / 16 passed / 51
  total (the 16 pre-pass were either "must-not-contain-banned-term" checks
  already true on the baseline copy, or the pre-existing
  `nfcFaqGroup.items`/`faqs` structural wiring, both correctly un-changed by
  this slice).
- **GREEN**: after the `LanguageContext.tsx`, `HomeFaqSection.tsx`,
  `page-copy.ts` and `IaChatbotsPage.tsx` edits — same 3 files: 51/51
  passing.
- **REFACTOR / regression**: `nfcFrozenSurface.guard.test.ts`,
  `trustClaims.guard.test.ts`, `localeParity.test.ts` (ran via
  `structuredDataPolicy.test.ts`'s FAQ-parity describe block, which is the
  file that actually hosts the home FAQ JSON-LD-parity assertions),
  `internalLinking.structure.test.ts`, `ogImages.structure.test.ts`,
  `lastmod.test.ts`, `routeParity.test.ts`, `clientRouteParity.test.ts`: all
  green, 0 failures. `npx tsc --noEmit`: 0 errors. `npx tsc -p
  tests/tsconfig.json --noEmit`: 0 errors. `npm run lint`: 0 errors/0
  warnings. Full `npm test` (Jest): see command output recorded in the
  apply-progress artifact (`sdd/seo-keyword-copy/apply-progress`) — same
  pre-existing 3 network-dependent `tests/e2e/chatbotFlow.test.ts` failures
  as every other recent audit log (live Supabase Edge Function call, 500 in
  this environment), no new failures introduced by this slice.

## Regression check

- `nfcFrozenSurface.guard.test.ts` pins only `tapReviewFAQ1-3Question` (es)
  and the `<title>`/`<h1>`/meta description/canonical/OG literals on
  `TapReviewPage.tsx` — none of those were touched; the guard is
  deliberately silent on `tapReviewHowTitle`/`tapReviewFeatTitle` and on
  `tapReviewFAQ4*`, so it stays green without modification.
- `trustClaims.guard.test.ts` NFC-scope list does not overlap with any new
  string this slice adds (checked directly in
  `keywordCopy.claims.test.ts`).
- `localeParity`-equivalent checks (in `structuredDataPolicy.test.ts`'s FAQ
  describe block) only assert the home FAQ group's wiring, unaffected by the
  NFC/IA FAQ changes made here.
- No other test in the repo asserted the previous `iaCasesTitle`,
  `iaCase1-3Desc`, `tapReviewHowTitle`/`tapReviewFeatTitle` wording, or the
  old `PAGE_TITLE`/`PAGE_DESCRIPTION` literals, so no other assertion needed
  updating for this slice.

## Deviations from tasks.md

- The audit filename is `docs/audit/2026-10-05_seo-keyword-copy.md` (no
  `-a` suffix), per the orchestrator's explicit instruction for this run,
  rather than tasks.md 1.10's `seo-keyword-copy-a.md`.
- tasks.md 1.5 attributes `PAGE_TITLE`/`PAGE_DESCRIPTION`/`og:alt` to
  `page-copy.ts`; in the actual codebase those three are es-only literals
  declared directly in `IaChatbotsPage.tsx` (consistent with
  `design.md`'s own File Changes table, which lists `IaChatbotsPage.tsx` as
  a separately modified file). `iaH1`/`iaChatbotsTitle`/`iaCasesIntro`/
  `iaCase1-3Desc`/`iaFaqQ6`/`A6` are in `page-copy.ts` as designed. No
  content deviation — only which file each literal physically lives in.
- Slice A's new tests run under this repo's `jest.config.js` (Node
  environment, no `jest-environment-jsdom`), so `useNfcFaqGroup()` is
  exercised via a source-level regex on its function body rather than
  `renderHook()`, and FAQ JSON-LD parity is asserted as the structural
  invariant it already is (same array feeds `<FaqList>` and
  `<SeoFaqSchema>`) rather than by rendering and diffing JSON-LD output.
  This follows the repo's existing convention
  (`nfcFrozenSurface.guard.test.ts`, `structuredDataPolicy.test.ts`,
  `useWhatsappPhone.test.ts`'s documented comment) rather than design.md's
  literal `renderHook(useNfcFaqGroup)` wording.

## Owner decisions still pending (do not block this slice's merge of code,
only its sign-off)

- D4: owner sign-off on "Tap to Review" (vs. "Tap and Review") wording.
