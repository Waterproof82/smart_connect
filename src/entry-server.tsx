import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { HelmetProvider, type HelmetServerState } from "react-helmet-async";
import { Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import { LanguageProvider } from "@shared/context/LanguageContext";
import { ThemeProvider } from "@shared/context/ThemeContext";
import { ScrollToTop } from "@shared/components/ScrollToTop";
import App from "./App";
import CartaDigitalPremium from "./features/landing/presentation/components/CartaDigitalPremium";
import { TapReviewPage } from "./features/tap-review/presentation/TapReviewPage";
import AutomationN8nContainer from "./features/automation-n8n/presentation/AutomationN8nContainer";
import WhatsappAutomationContainer from "./features/whatsapp-automation/presentation/WhatsappAutomationContainer";
import SoftwareCanariasContainer from "./features/software-canarias/presentation/SoftwareCanariasContainer";
import DigitalizationTenerifeContainer from "./features/digitalization-tenerife/presentation/DigitalizationTenerifeContainer";
import AboutPage from "./features/landing/presentation/components/AboutPage";
import AvisoLegalPage from "./features/legal/presentation/AvisoLegalPage";
import PrivacidadPage from "./features/legal/presentation/PrivacidadPage";
import CookiesPage from "./features/legal/presentation/CookiesPage";

export function render(url: string): { html: string; head: string } {
  const helmetContext = {} as { helmet?: HelmetServerState };

  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={url}>
        <ThemeProvider>
          <LanguageProvider>
            <ScrollToTop />
            <Suspense fallback={null}>
              <Routes>
                <Route path="/" element={<App />} />
                <Route path="/servicios" element={<App />} />
                <Route path="/contacto" element={<App />} />
                <Route
                  path="/carta-digital"
                  element={<CartaDigitalPremium />}
                />
                <Route path="/tap-review" element={<TapReviewPage />} />
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
                <Route path="/legal/aviso" element={<AvisoLegalPage />} />
                <Route path="/legal/privacidad" element={<PrivacidadPage />} />
                <Route path="/legal/cookies" element={<CookiesPage />} />
              </Routes>
            </Suspense>
          </LanguageProvider>
        </ThemeProvider>
      </StaticRouter>
    </HelmetProvider>,
  );

  const { helmet } = helmetContext;

  return {
    html,
    head: [
      helmet!.title.toString(),
      helmet!.meta.toString(),
      helmet!.link.toString(),
      helmet!.script.toString(),
    ]
      .filter(Boolean)
      .join("\n"),
  };
}
