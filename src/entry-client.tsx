import { hydrateRoot, createRoot } from "react-dom/client";
import { scheduleWebMCPRegistration } from "./webmcpBoot";
import { registerContactClickTracking } from "@shared/utils/analyticsEvents";
import { routeForPath } from "./clientRoutes";
import { ClientApp } from "./ClientApp";
import "./index.css";

// GA4: WhatsApp / phone / email link clicks as conversion events
registerContactClickTracking();

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Could not find root element to mount to");
// Non-nullable alias used by the hydrate/render calls below.
const root: HTMLElement = rootElement;

// Prerendered pages (/, /about, /tarjetas-nfc, /carta-digital, /ia-chatbots-tenerife, /tpv-restaurantes, /legal/*) ship SSR HTML inside
// #root → hydrateRoot. SPA routes (/admin) serve _spa.html, which contains only
// the <!--ssr-outlet--> comment → createRoot, to avoid hydration errors.
const hasSSRContent = root.children.length > 0;

const app = <ClientApp />;

// design.md D1/D2 (seo-audit-followups, S1): on a prerendered route,
// await the matched chunk's preload() before hydrateRoot so the first
// client render mounts the resolved component directly — never
// React.lazy's throw-a-promise path, so hydration never discards the
// SSR HTML (React error #421). "/" is static (routeForPath returns
// null) and /admin never has SSR content, so neither one preloads
// anything here. If the chunk fails to load, hydrate anyway — same
// fallback behaviour as before this change.
// Top-level await (ES2022 module): nothing imports this entry, so awaiting
// here blocks no other module.
if (hasSSRContent) {
  const route = routeForPath(window.location.pathname);
  if (route) {
    try {
      await route.preload();
    } catch {
      // Preload failed — fall through and hydrate with the
      // existing Suspense/lazy fallback behaviour.
    }
  }
  hydrateRoot(root, app);
} else {
  createRoot(root).render(app);
}
// design.md D8 (core-web-vitals-perf PR3): schedule WebMCP tool
// registration after hydration/render instead of statically importing
// and calling it at module scope, so @mcp-b/webmcp-polyfill and the
// tool descriptors no longer pay their eval cost before/during
// hydration. Runs after BOTH branches to keep /admin parity.
scheduleWebMCPRegistration();
