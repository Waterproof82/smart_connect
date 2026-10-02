import { lazy, useState, type ComponentType } from "react";

/**
 * Hydration fix for React error #421 (design.md D1/D2, seo-audit-followups
 * S1). `React.lazy` throws its loader promise on first render even if that
 * promise already resolved before mounting (`lazyInitializer` only flips
 * `_status` inside an async `.then`), so an unpreloaded prerendered route
 * always suspends on its first hydration pass, discarding the SSR HTML.
 *
 * `preloadable()` memoizes the loader into one promise and tracks its
 * resolved component in a closure. `Component` picks, via a mount-only
 * `useState` initializer, between the resolved component (if `preload()`
 * already settled) and a `React.lazy` fallback. `entry-client.tsx` awaits
 * `routeForPath(pathname)?.preload()` before `hydrateRoot`, so the resolved
 * branch is the one that mounts — zero throws, zero dehydrated boundary.
 */

export interface PageModule {
  default: ComponentType;
}

export interface PreloadableRoute {
  readonly Component: ComponentType;
  preload(): Promise<void>;
}

export function preloadable(
  load: () => Promise<PageModule>,
): PreloadableRoute {
  let promise: Promise<PageModule> | null = null;
  let resolved: ComponentType | null = null;

  // Shared by preload() and the Lazy fallback below, so the loader
  // function itself only ever runs once no matter how many times
  // preload() is called or how many times Lazy's ctor is invoked.
  const loadOnce = (): Promise<PageModule> => {
    if (!promise) {
      promise = load().then((mod) => {
        resolved = mod.default;
        return mod;
      });
    }
    return promise;
  };

  const Lazy = lazy(loadOnce);

  const Component: ComponentType = () => {
    const [Resolved] = useState(() => resolved ?? Lazy);
    return <Resolved />;
  };

  return {
    Component,
    preload: () => loadOnce().then(() => undefined),
  };
}

type PrerenderedPath =
  | "/about"
  | "/tarjetas-nfc"
  | "/carta-digital"
  | "/ia-chatbots-tenerife"
  | "/tpv-restaurantes"
  | "/legal/aviso"
  | "/legal/privacidad"
  | "/legal/cookies";

// Every page module below uses a named default export re-wrapped as
// `{ default }`, so this one helper replaces 8 near-identical `.then()`s.
const asPageModule = (mod: { default: ComponentType }): PageModule => ({
  default: mod.default,
});

export const PRERENDERED_ROUTES: Readonly<
  Record<PrerenderedPath, PreloadableRoute>
> = {
  "/about": preloadable(() =>
    import("@features/landing/presentation/components/AboutPage").then(
      asPageModule,
    ),
  ),
  "/tarjetas-nfc": preloadable(() =>
    import("@features/tap-review/presentation/TapReviewPage").then(
      asPageModule,
    ),
  ),
  "/carta-digital": preloadable(() =>
    import(
      "@features/landing/presentation/components/CartaDigitalPage"
    ).then(asPageModule),
  ),
  "/ia-chatbots-tenerife": preloadable(() =>
    import("@features/landing/presentation/components/IaChatbotsPage").then(
      asPageModule,
    ),
  ),
  "/tpv-restaurantes": preloadable(() =>
    import(
      "@features/landing/presentation/components/TpvRestaurantesPage"
    ).then(asPageModule),
  ),
  "/legal/aviso": preloadable(() =>
    import("@features/legal/presentation/AvisoLegalPage").then(asPageModule),
  ),
  "/legal/privacidad": preloadable(() =>
    import("@features/legal/presentation/PrivacidadPage").then(asPageModule),
  ),
  "/legal/cookies": preloadable(() =>
    import("@features/legal/presentation/CookiesPage").then(asPageModule),
  ),
};

/**
 * Covers both the client-side `*` catch-all route and `dist/404.html`,
 * which ships real SSR markup from entry-server.tsx's `notFound: true`
 * branch — so it needs the same preload-before-hydrate treatment as
 * every other prerendered route.
 */
export const NOT_FOUND_ROUTE: PreloadableRoute = preloadable(() =>
  import("@features/landing/presentation/components/NotFound").then((m) => ({
    default: m.NotFound,
  })),
);

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

/**
 * `"/"` renders `<App />` directly and statically (not lazy), so it
 * returns `null` — there is nothing to preload. Any other known
 * prerendered path returns its route; anything else (including a 404)
 * returns `NOT_FOUND_ROUTE`.
 */
export function routeForPath(pathname: string): PreloadableRoute | null {
  const normalized = normalizePath(pathname);
  if (normalized === "/") return null;
  if (Object.prototype.hasOwnProperty.call(PRERENDERED_ROUTES, normalized)) {
    return PRERENDERED_ROUTES[normalized as PrerenderedPath];
  }
  return NOT_FOUND_ROUTE;
}
