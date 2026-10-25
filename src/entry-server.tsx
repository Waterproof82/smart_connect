import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { HelmetProvider, type HelmetServerState } from "react-helmet-async";
import { Routes } from "react-router-dom";
import { Suspense } from "react";
import { LanguageProvider } from "@shared/context/LanguageContext";
import { ThemeProvider } from "@shared/context/ThemeContext";
import { ConsentProvider } from "@shared/context/ConsentContext";
import { ScrollToTop } from "@shared/components/ScrollToTop";
import { CookieConsent } from "@shared/components/CookieConsent";
import { NotFound } from "./features/landing/presentation/components/NotFound";
import { SERVER_PAGES } from "./serverPages";
import { prerenderedRouteElements } from "@shared/routing/prerenderedRouteElements";

/**
 * Renders a prerendered route. With `notFound: true` it renders the 404
 * page instead of the route table — prerender.mjs writes that output to
 * dist/404.html, which Vercel serves with a real HTTP 404 status for any
 * path no rewrite matches.
 */
export function render(
  url: string,
  options: { notFound?: boolean } = {},
): { html: string; head: string } {
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
                {options.notFound ? (
                  <NotFound />
                ) : (
                  <Routes>{prerenderedRouteElements(SERVER_PAGES)}</Routes>
                )}
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
