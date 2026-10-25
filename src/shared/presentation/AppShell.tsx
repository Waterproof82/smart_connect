import type { ReactNode } from "react";
import { Suspense } from "react";
import { HelmetProvider, type HelmetServerState } from "react-helmet-async";
import { ThemeProvider } from "@shared/context/ThemeContext";
import { LanguageProvider } from "@shared/context/LanguageContext";
import { ConsentProvider } from "@shared/context/ConsentContext";
import { ScrollToTop } from "@shared/components/ScrollToTop";
import { CookieConsent } from "@shared/components/CookieConsent";

/**
 * Shared provider tree (design.md shared-app-shell, Shared AppShell
 * Provider Tree). Both entry-client.tsx and entry-server.tsx render this
 * — the Router (BrowserRouter / StaticRouter) stays entry-specific,
 * OUTSIDE this component, so it can keep its own location source.
 *
 * `helmetContext` is passed into `HelmetProvider` only by the server
 * entry (so `render()` can read `.helmet` after `renderToString`); the
 * client entry omits it and lets `HelmetProvider` manage its own
 * internal instance.
 */
export interface AppShellProps {
  children: ReactNode;
  fallback?: ReactNode;
  helmetContext?: { helmet?: HelmetServerState };
}

export function AppShell({ children, fallback = null, helmetContext }: AppShellProps) {
  return (
    <HelmetProvider context={helmetContext}>
      <ThemeProvider>
        <LanguageProvider>
          <ConsentProvider>
            <ScrollToTop />
            <CookieConsent />
            <Suspense fallback={fallback}>{children}</Suspense>
          </ConsentProvider>
        </LanguageProvider>
      </ThemeProvider>
    </HelmetProvider>
  );
}
