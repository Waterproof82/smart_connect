/**
 * The single, shared list of every prerendered path (design.md
 * shared-app-shell, Approach C). Both entry-server.tsx and
 * entry-client.tsx build their exhaustive page maps (serverPages.ts,
 * clientPages.ts) from `PrerenderedPath`, so adding or removing a path
 * here — and only here — keeps both entries, scripts/site-routes.json
 * (checked by routeParity.test.ts) and the sitemap in lockstep.
 *
 * Zero React/lazy imports on purpose: this is pure data, importable from
 * Jest (node env) without pulling in JSX or `react-dom`.
 */
export const PRERENDERED_PATHS = [
  "/",
  "/about",
  "/tarjetas-nfc",
  "/carta-digital",
  "/ia-chatbots-tenerife",
  "/tpv-restaurantes",
  "/blog",
  "/blog/carta-digital-vs-comisiones-glovo",
  "/blog/chatbot-ia-hoteles-alojamientos-pequenos-canarias",
  "/blog/cuanto-cuesta-un-tpv-restaurante",
  "/blog/tarjetas-nfc-mas-resenas-google-restaurante",
  "/legal/aviso",
  "/legal/privacidad",
  "/legal/cookies",
] as const;

export type PrerenderedPath = (typeof PRERENDERED_PATHS)[number];
