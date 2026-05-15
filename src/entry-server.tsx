import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { HelmetProvider, type HelmetServerState } from "react-helmet-async";
import { Routes, Route } from "react-router-dom";
import { Suspense } from "react";
import { LanguageProvider } from "@shared/context/LanguageContext";
import { ThemeProvider } from "@shared/context/ThemeContext";
import { ScrollToTop } from "@shared/components/ScrollToTop";
import App from "./App";

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
