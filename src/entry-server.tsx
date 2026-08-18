import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { HelmetProvider, type HelmetServerState } from "react-helmet-async";
import { Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import { LanguageProvider } from "@shared/context/LanguageContext";
import { ThemeProvider } from "@shared/context/ThemeContext";
import { ConsentProvider } from "@shared/context/ConsentContext";
import { ScrollToTop } from "@shared/components/ScrollToTop";
import { CookieConsent } from "@shared/components/CookieConsent";
import App from "./App";
import AboutPage from "./features/landing/presentation/components/AboutPage";
import TapReviewPage from "./features/tap-review/presentation/TapReviewPage";
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
            <ConsentProvider>
              <ScrollToTop />
              <CookieConsent />
              <Suspense fallback={null}>
                <Routes>
                  <Route path="/" element={<App />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/tarjetas-nfc" element={<TapReviewPage />} />
                  <Route path="/legal/aviso" element={<AvisoLegalPage />} />
                  <Route path="/legal/privacidad" element={<PrivacidadPage />} />
                  <Route path="/legal/cookies" element={<CookiesPage />} />
                </Routes>
              </Suspense>
            </ConsentProvider>
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
