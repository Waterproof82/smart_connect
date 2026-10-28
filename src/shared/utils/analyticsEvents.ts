import { readConsent } from "./consentStorage";

/**
 * GA4 conversion events (contact intent, leads and CTA clicks).
 *
 * Events go through the gtag() loaded in index.html, only on public routes
 * (`window.__scAnalyticsScope`, see analyticsScope.ts) and only while the
 * stored consent (`sc_consent_v1`) grants analytics: Consent Mode would
 * otherwise still send cookieless pings while analytics_storage is denied.
 * Never send personal data: no phone numbers, emails or form contents.
 */
export type ContactEventName =
  "contact_whatsapp" | "contact_phone" | "contact_email";

type GtagWindow = typeof globalThis & {
  gtag?: (...args: unknown[]) => void;
  __scAnalyticsScope?: boolean;
};

export function classifyContactHref(href: string): ContactEventName | null {
  if (/^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(href)) {
    return "contact_whatsapp";
  }
  if (href.startsWith("tel:")) return "contact_phone";
  if (href.startsWith("mailto:")) return "contact_email";
  return null;
}

export type CtaEventName = "cta_contact_click" | "cta_demo_click";
export type CtaLocation = "hero" | "header" | "footer";

function hasAnalyticsConsent(): boolean {
  try {
    return readConsent(globalThis.localStorage)?.categories.analytics === true;
  } catch {
    // No storage (SSR, blocked): stay denied.
    return false;
  }
}

export function trackEvent(
  name: string,
  params: Record<string, string> = {},
): void {
  const win = globalThis as GtagWindow;
  if (!win.__scAnalyticsScope || typeof win.gtag !== "function") return;
  if (!hasAnalyticsConsent()) return;
  win.gtag("event", name, params);
}

/** One CTA click: page_path + cta_location only, nothing personal. */
export function trackCtaClick(
  name: CtaEventName,
  ctaLocation: CtaLocation,
  getPath: () => string = () => globalThis.location.pathname,
): void {
  trackEvent(name, { page_path: getPath(), cta_location: ctaLocation });
}

/**
 * One delegated click listener for every WhatsApp / phone / email link on
 * the site (there are dozens of wa.me CTAs across sections), instead of
 * wiring each component. Returns a cleanup function.
 */
export function registerContactClickTracking(
  doc: Document = document,
  getPath: () => string = () => globalThis.location.pathname,
): () => void {
  const onClick = (event: Event) => {
    const target = event.target as Element | null;
    if (!target || typeof target.closest !== "function") return;
    const href = target.closest("a[href]")?.getAttribute("href") ?? "";
    const name = classifyContactHref(href);
    if (name) trackEvent(name, { page_path: getPath() });
  };
  doc.addEventListener("click", onClick, { capture: true });
  return () => doc.removeEventListener("click", onClick, { capture: true });
}
