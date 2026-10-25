import type { PageMap } from "@shared/routing/prerenderedRouteElements";
import App from "./App";
import { PRERENDERED_ROUTES } from "./clientRoutes";

/**
 * Exhaustive client-side page map (design.md shared-app-shell). `"/"`
 * renders `<App/>` directly and statically (not preloaded — it never
 * ships a loading chunk); every other path resolves to the matching
 * `preloadable()` route's `Component` from `clientRoutes.ts`, so the 4
 * blog paths all share the exact same component reference.
 */
export const CLIENT_PAGES: PageMap = {
  "/": App,
  "/about": PRERENDERED_ROUTES["/about"].Component,
  "/tarjetas-nfc": PRERENDERED_ROUTES["/tarjetas-nfc"].Component,
  "/carta-digital": PRERENDERED_ROUTES["/carta-digital"].Component,
  "/ia-chatbots-tenerife":
    PRERENDERED_ROUTES["/ia-chatbots-tenerife"].Component,
  "/tpv-restaurantes": PRERENDERED_ROUTES["/tpv-restaurantes"].Component,
  "/blog": PRERENDERED_ROUTES["/blog"].Component,
  "/blog/carta-digital-vs-comisiones-glovo":
    PRERENDERED_ROUTES["/blog/carta-digital-vs-comisiones-glovo"].Component,
  "/blog/chatbot-ia-hoteles-alojamientos-pequenos-canarias":
    PRERENDERED_ROUTES["/blog/chatbot-ia-hoteles-alojamientos-pequenos-canarias"]
      .Component,
  "/blog/cuanto-cuesta-un-tpv-restaurante":
    PRERENDERED_ROUTES["/blog/cuanto-cuesta-un-tpv-restaurante"].Component,
  "/blog/tarjetas-nfc-mas-resenas-google-restaurante":
    PRERENDERED_ROUTES["/blog/tarjetas-nfc-mas-resenas-google-restaurante"]
      .Component,
  "/legal/aviso": PRERENDERED_ROUTES["/legal/aviso"].Component,
  "/legal/privacidad": PRERENDERED_ROUTES["/legal/privacidad"].Component,
  "/legal/cookies": PRERENDERED_ROUTES["/legal/cookies"].Component,
};
