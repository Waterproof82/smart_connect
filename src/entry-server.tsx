import { renderToString } from "react-dom/server";
import { StaticRouter, Routes } from "react-router-dom";
import { type HelmetServerState } from "react-helmet-async";
import { AppShell } from "@shared/presentation/AppShell";
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
    <StaticRouter location={url}>
      <AppShell helmetContext={helmetContext}>
        {options.notFound ? (
          <NotFound />
        ) : (
          <Routes>{prerenderedRouteElements(SERVER_PAGES)}</Routes>
        )}
      </AppShell>
    </StaticRouter>,
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
