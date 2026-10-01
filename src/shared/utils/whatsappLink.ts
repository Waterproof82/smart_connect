/**
 * Single source of truth for every WhatsApp CTA URL on the public site
 * (design.md § CTA voice).
 *
 * - With a phone: `https://wa.me/<digits>?text=<pre-filled message>`,
 *   opened in a new tab (`external: true`). wa.me only accepts digits, so
 *   `+`, spaces and dashes are stripped.
 * - Without a phone (SSR, settings not loaded, fetch failure): the absolute
 *   `/#contacto` form anchor, optionally carrying `?servicio=` so the form
 *   preselects the service. Absolute so it works from every route.
 *
 * Clicks are tracked by the delegated listener in analyticsEvents.ts
 * (matches `wa.me`); callers must not add their own analytics onClick.
 */
export interface WhatsappLinkOptions {
  message?: string;
  servicio?: string;
}

export interface WhatsappLink {
  href: string;
  external: boolean;
}

export function buildWhatsappLink(
  phone: string,
  { message, servicio }: WhatsappLinkOptions = {},
): WhatsappLink {
  const digits = phone.replaceAll(/\D/g, "");
  if (!digits) {
    return {
      href: servicio
        ? `/#contacto?servicio=${encodeURIComponent(servicio)}`
        : "/#contacto",
      external: false,
    };
  }
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return { href: `https://wa.me/${digits}${text}`, external: true };
}
