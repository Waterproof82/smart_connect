/**
 * GA4 conversion events (contact intent and leads).
 *
 * Events go through the gtag() loaded in index.html, which already applies
 * Consent Mode v2 (analytics_storage denied until the visitor accepts), and
 * only on public routes (`window.__scAnalyticsScope`, see analyticsScope.ts).
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

export function trackEvent(
  name: string,
  params: Record<string, string> = {},
): void {
  const win = globalThis as GtagWindow;
  if (!win.__scAnalyticsScope || typeof win.gtag !== "function") return;
  win.gtag("event", name, params);
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
