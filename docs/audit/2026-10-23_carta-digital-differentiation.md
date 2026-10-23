# Audit — Carta Digital differentiation (2026-10-23)

**Timestamp:** 2026-10-23T14:30:00+01:00
**Branch:** `feature/carta-digital-diferenciacion` (from `develop` @ `f1df115`)
**Requested by:** owner. Goal: differentiate the Carta Digital on `/carta-digital` and feature it as the main service on the home hub.

## Owner inputs (source of every claim)

The owner provided:

- **Real contact person.** There is a real contact person in Tenerife behind the product, who adapts it to each business.
- **Security concern.** Anonymous apps of unknown solidity expose customer and business data.
- **SEO + GEO focus.** The menu is connected to the Google Business Profile and to social media.
- **Ordering.** Orders can be placed:
  - online, for pickup or delivery;
  - from the table;
  - by waiters using a PDA.
- **One-tap reply.** The team answers each order with one tap: "ready in 30 min / 1 h".
- **Kitchen/bar routing.** Food goes to the kitchen and drinks to the bar.
- **POS connection.** The menu connects to the POS, which covers accounting, clock-in, stock, suppliers and Veri*factu.
- **Table payment (already live).** It includes:
  - suggested tips;
  - an even split;
  - each diner paying for what they ordered.
- **Google reviews** can be left from the menu.
- **30-day free trial.** If the business sees no improvement, it leaves with no cost.

No figure beyond these (0 % commission, 5 languages, 30 days, 30 min / 1 h) was introduced.

## Actions

1. **Tests first (TDD).** Wrote failing tests and confirmed red before implementing:
   - five component tests, one per new section;
   - two cases added to `CartaDigitalPage.test.tsx`: section order and the new FAQ entries;
   - one hub assertion in `App.homeHub.structure.test.ts`;
   - a copy guard test, `keywordCopy.cartaDiferenciacion.test.ts`.
2. **Copy module.** Added the i18n module `carta-diferenciacion.ts` (ES/EN) and registered it in the `i18n/modules` barrel. `LanguageContext.tsx` was not reopened, following design.md D3.
3. **New sections.** Added five sections to `CartaDigitalSection.tsx`:
   - `CartaDigitalConfianzaSection`
   - `CartaDigitalEcosistemaSection`
   - `CartaDigitalPagoMesaSection`
   - `CartaDigitalVisibilidadSection`
   - `CartaDigitalPruebaSection`

   They follow the design system in design.md:
   - `ds-section`, `ds-section-head`, `ds-kicker`, `ds-h2` and `ds-lede`;
   - colour tokens only, lucide icons marked `aria-hidden`;
   - one h2 per section;
   - no extra filled CTA, so WhatsApp stays the single primary action.
4. **Existing components.**
   - Extended the comparison table with rows 6–8.
   - Extended `useCartaFaqGroup()` with Q6–Q8. They also feed the FAQPage JSON-LD.
5. **Home hub.** In `HomeSolutionsSection`, the Carta Digital card now spans 2 of 3 columns, with a highlights list and a trial badge. The hub keeps its link-only role: no product content is duplicated.
6. **SEO/GEO surfaces.** Updated:
   - the `solutions.ts` Service description;
   - `public/llms.txt`, with the agent-skills sha256 recomputed;
   - the `site-routes.json` `lastmod` floors and sources (P-20);
   - the KB `carta-digital.md`.

## Validation

See the PR description for the lint, type-check, Jest, Vitest and build results.

## Follow-ups for the owner

- Re-run `npm run ingest-kb` so the chatbot uses the new knowledge base content.
- Review the visual graphics and image prompts in `docs/CARTA_DIGITAL_DIFERENCIACION.md` before publishing them on social media.
