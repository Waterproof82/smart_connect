import type { PageMap } from "@shared/routing/prerenderedRouteElements";
import App from "./App";
import AboutPage from "./features/landing/presentation/components/AboutPage";
import TapReviewPage from "./features/tap-review/presentation/TapReviewPage";
import CartaDigitalPage from "./features/landing/presentation/components/CartaDigitalPage";
import IaChatbotsPage from "./features/landing/presentation/components/IaChatbotsPage";
import TpvRestaurantesPage from "./features/landing/presentation/components/TpvRestaurantesPage";
import BlogIndexPage from "./features/landing/presentation/components/BlogIndexPage";
import BlogPostPage from "./features/landing/presentation/components/BlogPostPage";
import AvisoLegalPage from "./features/legal/presentation/AvisoLegalPage";
import PrivacidadPage from "./features/legal/presentation/PrivacidadPage";
import CookiesPage from "./features/legal/presentation/CookiesPage";

/**
 * Exhaustive server-side page map (design.md shared-app-shell). Every
 * import is eager — "Server Pages Never Lazy" — so `renderToString` never
 * suspends on a prerendered path. The 4 blog article paths all render the
 * same `BlogPostPage`, which reads the slug from `useLocation` rather than
 * route params.
 */
export const SERVER_PAGES: PageMap = {
  "/": App,
  "/about": AboutPage,
  "/tarjetas-nfc": TapReviewPage,
  "/carta-digital": CartaDigitalPage,
  "/ia-chatbots-tenerife": IaChatbotsPage,
  "/tpv-restaurantes": TpvRestaurantesPage,
  "/blog": BlogIndexPage,
  "/blog/carta-digital-vs-comisiones-glovo": BlogPostPage,
  "/blog/chatbot-ia-hoteles-alojamientos-pequenos-canarias": BlogPostPage,
  "/blog/cuanto-cuesta-un-tpv-restaurante": BlogPostPage,
  "/blog/tarjetas-nfc-mas-resenas-google-restaurante": BlogPostPage,
  "/legal/aviso": AvisoLegalPage,
  "/legal/privacidad": PrivacidadPage,
  "/legal/cookies": CookiesPage,
};
