import { useEffect, useState } from "react";
import { getAppSettings } from "@shared/services/settingsService";

/**
 * Strips a raw phone string down to digits (and a leading `+`), the format
 * expected by `wa.me/<number>` deep links.
 */
export function sanitizeWhatsappPhone(raw: string): string {
  return raw.replaceAll(/[^\d+]/g, "");
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

    const fetchWhatsApp = async () => {
      try {
        const settings = await getAppSettings();
        if (!cancelled && settings.whatsappPhone) {
          setWhatsappPhone(sanitizeWhatsappPhone(settings.whatsappPhone));
        }
      } catch {
        // Silently fail — WhatsApp CTAs fall back to #contacto.
      }
    };

    fetchWhatsApp();
    return () => {
      cancelled = true;
    };
  }, []);

  return whatsappPhone;
}
