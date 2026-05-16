import { hydrateRoot, createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Suspense, lazy } from "react";
import { LanguageProvider } from "@shared/context/LanguageContext";
import { ThemeProvider } from "@shared/context/ThemeContext";
import { ScrollToTop } from "@shared/components/ScrollToTop";
import { registerWebMCPTools } from "./WebMCP";
import "./index.css";
import App from "./App";

// Register WebMCP tools for AI agent discovery
registerWebMCPTools();

// Lazy-loaded routes — not prerendered, remain SPA after hydration
const AdminPanel = lazy(() =>
  import("@features/admin/presentation").then((m) => ({
    default: m.AdminPanel,
  })),
);

const CartaDigitalPremium = lazy(() =>
  import("@features/landing/presentation/components/CartaDigitalPremium").then(
    (m) => ({ default: m.default }),
  ),
);

const TapReviewPageWithData = lazy(() => import("./TapReviewHydrator"));

const AutomationN8nContainer = lazy(() =>
  import("@features/automation-n8n/presentation/AutomationN8nContainer").then(
    (m) => ({ default: m.default }),
  ),
);

const WhatsappAutomationContainer = lazy(() =>
  import("@features/whatsapp-automation/presentation/WhatsappAutomationContainer").then(
    (m) => ({ default: m.default }),
  ),
);

const SoftwareCanariasContainer = lazy(() =>
  import("@features/software-canarias/presentation/SoftwareCanariasContainer").then(
    (m) => ({ default: m.default }),
  ),
);

const DigitalizationTenerifeContainer = lazy(() =>
  import("@features/digitalization-tenerife/presentation/DigitalizationTenerifeContainer").then(
    (m) => ({ default: m.default }),
  ),
);

const AboutPage = lazy(() =>
  import("@features/landing/presentation/components/AboutPage").then((m) => ({
    default: m.default,
  })),
);

const NotFound = lazy(() =>
  import("@features/landing/presentation/components/NotFound").then((m) => ({
    default: m.NotFound,
  })),
);

const LoadingFallback = () => (
  <div className="min-h-screen bg-base flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
  </div>
);

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Could not find root element to mount to");

// Prerendered pages (/, /servicios, /contacto) have SSR HTML content inside #root
// → use hydrateRoot. SPA routes (tap-review, carta-digital, admin) serve _spa.html
// with only a <!--ssr-outlet--> comment → use createRoot to avoid hydration errors.
const hasSSRContent = rootElement.children.length > 0;

const app = (
  <HelmetProvider>
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <ThemeProvider>
        <LanguageProvider>
          <ScrollToTop />
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/servicios" element={<App />} />
              <Route path="/contacto" element={<App />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/carta-digital" element={<CartaDigitalPremium />} />
              <Route path="/tap-review" element={<TapReviewPageWithData />} />
              <Route
                path="/automatizacion-restaurantes-n8n"
                element={<AutomationN8nContainer />}
              />
              <Route
                path="/automatizacion-whatsapp-restaurante"
                element={<WhatsappAutomationContainer />}
              />
              <Route
                path="/software-restaurantes-canarias"
                element={<SoftwareCanariasContainer />}
              />
              <Route
                path="/digitalizacion-hosteleria-tenerife"
                element={<DigitalizationTenerifeContainer />}
              />
              <Route path="/about" element={<AboutPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </LanguageProvider>
      </ThemeProvider>
    </BrowserRouter>
  </HelmetProvider>
);

if (hasSSRContent) {
  hydrateRoot(rootElement, app);
} else {
  createRoot(rootElement).render(app);
}
