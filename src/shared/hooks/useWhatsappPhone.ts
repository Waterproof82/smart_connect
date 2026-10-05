import { useEffect, useState } from "react";
import {
  getAppSettings,
  resetAppSettingsCache,
} from "@shared/services/settingsService";

/**
 * Strips a raw phone string down to digits (and a leading `+`), the format
 * expected by `wa.me/<number>` deep links.
 */
export function sanitizeWhatsappPhone(raw: string): string {
  return raw.replaceAll(/[^\d+]/g, "");
}

/**
 * Test-only: clears the shared request cache. Delegates to
 * `settingsService.resetAppSettingsCache()` — this hook no longer keeps
 * its own `phonePromise` cache (S5, SDD `landing-main-thread-tbt`); the
 * single in-flight/resolved request per page load is now shared by every
 * `getAppSettings()` consumer (this hook, `Contact.tsx`) inside
 * settingsService itself.
 */
export function resetWhatsappPhoneCache(): void {
  resetAppSettingsCache();
}

/**
 * Fetches the WhatsApp contact phone (wraps the canonical
 * `getAppSettings()` service, which dedupes concurrent calls on its own)
 * and returns it pre-sanitized for `wa.me` links.
 *
 * Safe to call from every section that needs it (PageShell, WhatsAppCta,
 * Contact, ExpertAssistantWithRAG) — the whole page performs at most one
 * settings read no matter how many consumers mount.
 */
export function useWhatsappPhone(): string {
  const [whatsappPhone, setWhatsappPhone] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    // Failures resolve to "" — WhatsApp CTAs fall back to /#contacto.
    getAppSettings()
      .then((settings) => sanitizeWhatsappPhone(settings.whatsappPhone ?? ""))
      .catch(() => "")
      .then((phone) => {
        if (!cancelled && phone) setWhatsappPhone(phone);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return whatsappPhone;
}
