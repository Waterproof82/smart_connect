import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { LanguageProvider } from "@shared/context/LanguageContext";
import { ScrollToTop } from "@shared/components/ScrollToTop";
import "./index.css";
import App from "./App";
import CartaDigitalPremium from "./features/landing/presentation/components/CartaDigitalPremium";
import { TapReviewPage } from "./features/tap-review/presentation/TapReviewPage";
import TapReviewContainer from "./features/tap-review/TapReviewContainer";

// Wrapper component to fetch whatsappPhone before rendering TapReviewPage (Clean Architecture: Presentation Container)
const TapReviewPageWithData: React.FC = () => {
  const [whatsappPhone, setWhatsappPhone] = React.useState<string>("");

  React.useEffect(() => {
    const fetchWhatsApp = async () => {
      try {
        const settings = await TapReviewContainer.getInstance()
          .getGetAppSettingsUseCase()
          .execute();
        if (settings?.value) {
          const pairs = settings.value.split(";");
          for (const pair of pairs) {
            const [key, value] = pair.split("=");
            if (key === "whatsappPhone" && value) {
              setWhatsappPhone(value.replaceAll(/[^\d+]/g, ""));
              break;
            }
          }
        }
      } catch {
        // Silently fail, WhatsApp button will fallback to contacto
      }
    };
    fetchWhatsApp();
  }, []);

  return <TapReviewPage whatsappPhone={whatsappPhone} />;
};

// Theme init moved to inline script in index.html (improves INP)
// Listener for system preference changes during session
window
  .matchMedia("(prefers-color-scheme: light)")
  .addEventListener("change", (e) => {
    if (e.matches) {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  });

// Lazy loading para rutas - AdminPanel solo se carga cuando se necesita
const AdminPanel = React.lazy(() =>
  import("@features/admin/presentation").then((module) => ({
    default: module.AdminPanel,
  })),
);

const NotFound = React.lazy(() =>
  import("@features/landing/presentation/components/NotFound").then(
    (module) => ({
      default: module.NotFound,
    }),
  ),
);

const LoadingFallback = () => (
  <div className="min-h-screen bg-base flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  </div>
);

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <ScrollToTop />
        <LanguageProvider>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/admin" element={<AdminPanel />} />
              <Route path="/carta-digital" element={<CartaDigitalPremium />} />
              <Route path="/tap-review" element={<TapReviewPageWithData />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </LanguageProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
);
