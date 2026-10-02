import { hydrateRoot, createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Suspense, lazy } from "react";
import { LanguageProvider } from "@shared/context/LanguageContext";
import { ThemeProvider } from "@shared/context/ThemeContext";
import { ConsentProvider } from "@shared/context/ConsentContext";
import { ScrollToTop } from "@shared/components/ScrollToTop";
import { CookieConsent } from "@shared/components/CookieConsent";
import { registerWebMCPTools } from "./WebMCP";
import { registerContactClickTracking } from "@shared/utils/analyticsEvents";
import { PRERENDERED_ROUTES, NOT_FOUND_ROUTE, routeForPath } from "./clientRoutes";
import "./index.css";
import App from "./App";

// Register WebMCP tools for AI agent discovery
registerWebMCPTools();

// GA4: WhatsApp / phone / email link clicks as conversion events
registerContactClickTracking();

// Lazy-loaded route — not prerendered, remains SPA after hydration.
// Every prerendered page's loader lives in ./clientRoutes instead (design.md
// D1/D2, seo-audit-followups S1): their Component is preloaded and awaited
// before hydrateRoot below, which is what prevents React error #421.
const AdminPanel = lazy(() =>
  import("@features/admin/presentation").then((m) => ({
    default: m.AdminPanel,
  })),
);

const AboutPage = PRERENDERED_ROUTES["/about"].Component;
const TapReviewPage = PRERENDERED_ROUTES["/tarjetas-nfc"].Component;
const CartaDigitalPage = PRERENDERED_ROUTES["/carta-digital"].Component;
const IaChatbotsPage = PRERENDERED_ROUTES["/ia-chatbots-tenerife"].Component;
const TpvRestaurantesPage =
  PRERENDERED_ROUTES["/tpv-restaurantes"].Component;
const AvisoLegalPage = PRERENDERED_ROUTES["/legal/aviso"].Component;
const PrivacidadPage = PRERENDERED_ROUTES["/legal/privacidad"].Component;
const CookiesPage = PRERENDERED_ROUTES["/legal/cookies"].Component;
const NotFound = NOT_FOUND_ROUTE.Component;

const LoadingFallback = () => (
  <div className="min-h-screen bg-base flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
  </div>
);

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Could not find root element to mount to");
// Re-bound to a non-nullable local: TS does not carry the narrowing above
// into the nested async boot() closure below, since rootElement itself is
// still typed HTMLElement | null at its declaration site.
const root: HTMLElement = rootElement;

// Prerendered pages (/, /about, /tarjetas-nfc, /carta-digital, /ia-chatbots-tenerife, /tpv-restaurantes, /legal/*) ship SSR HTML inside
// #root → hydrateRoot. SPA routes (/admin) serve _spa.html, which contains only
// the <!--ssr-outlet--> comment → createRoot, to avoid hydration errors.
const hasSSRContent = root.children.length > 0;

const app = (
  <HelmetProvider>
    <BrowserRouter>
      <ThemeProvider>
        <LanguageProvider>
          <ConsentProvider>
            <ScrollToTop />
            <CookieConsent />
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/" element={<App />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/tarjetas-nfc" element={<TapReviewPage />} />
                <Route path="/carta-digital" element={<CartaDigitalPage />} />
                <Route
                  path="/ia-chatbots-tenerife"
                  element={<IaChatbotsPage />}
                />
                <Route
                  path="/tpv-restaurantes"
                  element={<TpvRestaurantesPage />}
                />
                <Route path="/legal/aviso" element={<AvisoLegalPage />} />
                <Route path="/legal/privacidad" element={<PrivacidadPage />} />
                <Route path="/legal/cookies" element={<CookiesPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </ConsentProvider>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  </HelmetProvider>
);

// design.md D1/D2 (seo-audit-followups, S1): on a prerendered route,
// await the matched chunk's preload() before hydrateRoot so the first
// client render mounts the resolved component directly — never
// React.lazy's throw-a-promise path, so hydration never discards the
// SSR HTML (React error #421). "/" is static (routeForPath returns
// null) and /admin never has SSR content, so neither one preloads
// anything here. If the chunk fails to load, hydrate anyway — same
// fallback behaviour as before this change.
async function boot() {
  if (hasSSRContent) {
    const route = routeForPath(window.location.pathname);
    if (route) {
      try {
        await route.preload();
      } catch {
        // Preload failed — fall through and hydrate with the
        // existing Suspense/lazy fallback behaviour.
      }
    }
    hydrateRoot(root, app);
  } else {
    createRoot(root).render(app);
  }
}

void boot();
