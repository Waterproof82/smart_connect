import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { HelmetProvider, type HelmetServerState } from "react-helmet-async";
import { Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@shared/context/LanguageContext";
import App from "./App";

export function render(url: string): { html: string; head: string } {
  const helmetContext = {} as { helmet?: HelmetServerState };

  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={url}>
        <LanguageProvider>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/servicios" element={<App />} />
            <Route path="/contacto" element={<App />} />
          </Routes>
        </LanguageProvider>
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
