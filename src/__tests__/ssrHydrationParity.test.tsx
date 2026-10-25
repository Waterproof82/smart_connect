// @vitest-environment node
import { afterEach, describe, expect, it, vi } from "vitest";
import { renderToString } from "react-dom/server";
import { JSDOM } from "jsdom";
import { render } from "../entry-server";
import { ClientApp } from "../ClientApp";
import { routeForPath } from "../clientRoutes";
import { PRERENDERED_PATHS } from "@shared/routing/prerenderedRoutes";

/**
 * Shell Parity Across Entries (design.md shared-app-shell, spec
 * requirement) — the #418/#421 regression guard. Both entries must render
 * byte-identical markup for every prerendered path, plus two unknown
 * paths that fall through to NotFound.
 *
 * `@vitest-environment node`: this whole file imports `render` from
 * `entry-server.tsx` at the top, BEFORE any `window`/`document` exists.
 * `react-helmet-async` bakes its `canUseDOM` flag once at module-eval
 * time (`isDocument = typeof window !== "undefined" && ...`) — under the
 * repo's default jsdom environment that flag is permanently `true`,
 * which leaves `helmetContext.helmet` `null` and crashes `render()`'s own
 * `helmet!.title` access (verified directly: calling `render()` under
 * the default jsdom environment throws `Cannot read properties of null
 * (reading 'title')`). Importing under Node first reproduces the real
 * SSR build's behaviour (`vite build --mode ssr` never has a `window`),
 * so `render()` works exactly like it does in production.
 *
 * `clientHtmlFor` installs a real `jsdom` instance as the global
 * `window`/`document` AFTER that import, purely so `<BrowserRouter>`
 * (inside the already-imported `ClientApp`) can read a location when IT
 * renders. That stubbing happens at render-time, long after
 * `react-helmet-async`'s module-level flag was already fixed, so it
 * cannot change it back — both sides stay on the same Helmet code path,
 * which is what makes the `html` comparison fair.
 */
/**
 * Canonicalizes single-quoted HTML attributes (`attr='value'`) to
 * double-quoted (`attr="value"`). React's own serializer never emits
 * single quotes, so any instance in either side's output can only come
 * from a raw, un-reserialized string passed through
 * `dangerouslySetInnerHTML` — specifically `/legal/cookies`' Google
 * Analytics copy (`LanguageContext.tsx`), which embeds a literal
 * single-quoted `<a>` tag. `sanitizeHTML` (`shared/utils/sanitizer.ts`)
 * only runs DOMPurify when `window` exists, so the server side (no
 * `window`) ships that string byte-for-byte while the client side (real
 * DOM here) gets it re-serialized with double quotes. React does not
 * hydration-diff `dangerouslySetInnerHTML` content, so this is a
 * pre-existing, non-#418 cosmetic gap in `sanitizeHTML`'s SSR path —
 * out of scope for this change — not a regression this guard should
 * fail on. Normalizing both sides here keeps the guard strict about
 * everything React itself renders while not gating on that unrelated,
 * already-filed gap.
 */
const normalizeQuotes = (html: string): string =>
  html.replace(/(\s[\w-]+)='([^']*)'/g, '$1="$2"');

async function clientHtmlFor(path: string): Promise<string> {
  const dom = new JSDOM("<!doctype html><html><body></body></html>", {
    url: `http://localhost${path}`,
  });
  vi.stubGlobal("window", dom.window);
  vi.stubGlobal("document", dom.window.document);
  vi.stubGlobal("navigator", dom.window.navigator);
  vi.stubGlobal("history", dom.window.history);
  vi.stubGlobal("location", dom.window.location);

  const route = routeForPath(path);
  if (route) await route.preload();

  return renderToString(<ClientApp />);
}

describe("Shell Parity Across Entries (ssrHydrationParity, PR2)", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it.each(PRERENDERED_PATHS)(
    "entry-server and entry-client render identical markup for %s",
    async (path) => {
      const serverHtml = render(path).html;
      const clientHtml = await clientHtmlFor(path);
      expect(normalizeQuotes(clientHtml)).toBe(normalizeQuotes(serverHtml));
    },
  );

  it.each(["/no-existe", "/blog/no-existe"])(
    "unknown path %s renders the same NotFound markup on both entries",
    async (path) => {
      const serverHtml = render("/404", { notFound: true }).html;
      const clientHtml = await clientHtmlFor(path);
      expect(normalizeQuotes(clientHtml)).toBe(normalizeQuotes(serverHtml));
    },
  );
});
