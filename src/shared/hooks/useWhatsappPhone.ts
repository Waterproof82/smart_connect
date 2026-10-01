import { useEffect, useState } from "react";
import { getAppSettings } from "@shared/services/settingsService";

/**
 * Strips a raw phone string down to digits (and a leading `+`), the format
 * expected by `wa.me/<number>` deep links.
 */
export function sanitizeWhatsappPhone(raw: string): string {
  return raw.replaceAll(/[^\d+]/g, "");
}

// One in-flight request per page load, shared by every caller (PageShell,
// page components, sections) so the shared WhatsApp CTA adds no extra reads.
let phonePromise: Promise<string> | null = null;

function loadWhatsappPhone(): Promise<string> {
  phonePromise ??= getAppSettings()
    .then((settings) => sanitizeWhatsappPhone(settings.whatsappPhone ?? ""))
    .catch(() => {
      phonePromise = null;
      return "";
    });
  return phonePromise;
}

/** Test-only: clears the shared request cache. */
export function resetWhatsappPhoneCache(): void {
  phonePromise = null;
}

/**
 * Fetches the WhatsApp contact phone once (wraps the canonical
 * `getAppSettings()` service) and returns it pre-sanitized for `wa.me` links.
 *
 * Intended to be called ONCE in `App.tsx` and prop-drilled to any section
 * that needs it (CartaDigitalSection, TapReviewSection), so the whole page
 * only performs a single Supabase read instead of one per section.
 */
export function useWhatsappPhone(): string {
  const [whatsappPhone, setWhatsappPhone] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    // Failures resolve to "" — WhatsApp CTAs fall back to /#contacto.
    loadWhatsappPhone().then((phone) => {
      if (!cancelled && phone) setWhatsappPhone(phone);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return whatsappPhone;
}
