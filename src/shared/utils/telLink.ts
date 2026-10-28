/**
 * `tel:` URL for the contact phone (app_settings.whatsapp_phone, which is
 * stored with country code). Clicks are tracked as `contact_phone` by the
 * delegated listener in analyticsEvents.ts; callers must not add their own
 * analytics onClick. Returns undefined when there is no usable number.
 */
export function buildTelHref(phone: string): string | undefined {
  const digits = phone.replaceAll(/\D/g, "");
  return digits ? `tel:+${digits}` : undefined;
}
