import { hydrateRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Suspense, lazy } from "react";
import { LanguageProvider } from "@shared/context/LanguageContext";
import { ScrollToTop } from "@shared/components/ScrollToTop";
import "./index.css";
import App from "./App";

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

hydrateRoot(
  rootElement,
  <HelmetProvider>
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </LanguageProvider>
    </BrowserRouter>
  </HelmetProvider>,
);

// Listen for system theme changes during session
window
  .matchMedia("(prefers-color-scheme: light)")
  .addEventListener("change", (e) => {
    if (e.matches) {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  });
