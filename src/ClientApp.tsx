import { lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppShell } from "@shared/presentation/AppShell";
import { NOT_FOUND_ROUTE } from "./clientRoutes";
import { CLIENT_PAGES } from "./clientPages";
import { prerenderedRouteElements } from "@shared/routing/prerenderedRouteElements";

// Lazy-loaded route — not prerendered, remains SPA after hydration.
// Every prerendered page's loader lives in ./clientRoutes instead (design.md
// D1/D2, seo-audit-followups S1): their Component is preloaded and awaited
// before hydrateRoot, which is what prevents React error #421.
const AdminPanel = lazy(() =>
  import("@features/admin/presentation").then((m) => ({
    default: m.AdminPanel,
  })),
);

const NotFound = NOT_FOUND_ROUTE.Component;

const LoadingFallback = () => (
  <div className="min-h-screen bg-base flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500" />
  </div>
);

/**
 * The client's whole app tree (design.md shared-app-shell): `BrowserRouter`
 * (entry-specific, outside `AppShell`) + the shared `AppShell` + the
 * assembled `<Routes>` — the shared prerendered table first, then the
 * client-only `/admin` and `*` routes, `*` last.
 *
 * Importable with no props, so `entry-client.tsx` mounts it as a plain
 * `<ClientApp />` and `ssrHydrationParity.test.tsx` can render it directly
 * to compare against the server's `render()` output per path.
 */
export const ClientApp: React.FC = () => (
  <BrowserRouter>
    <AppShell fallback={<LoadingFallback />}>
      <Routes>
        {prerenderedRouteElements(CLIENT_PAGES)}
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AppShell>
  </BrowserRouter>
);
