import React from "react";
import { MessageCircle } from "lucide-react";
import { useLanguage } from "@shared/context/LanguageContext";
import { useWhatsappPhone } from "@shared/hooks";

export interface WhatsAppCtaProps {
  /** Visible label. Defaults to `t.waCtaLabel`. */
  label?: string;
  /** Pre-filled WhatsApp message. Defaults to `t.waMsgDefault`. */
  message?: string;
  /** Service name forwarded to the contact form when no phone is set. */
  servicio?: string;
  size?: "md" | "sm";
  block?: boolean;
  className?: string;
}

/**
 * The single primary action of the site (design.md § CTA voice).
 *
 * Renders `https://wa.me/<phone>?text=…` once the phone is known; the SSR
 * HTML and any failure fall back to the absolute `/#contacto` form link.
 * Clicks are tracked by the delegated listener in analyticsEvents.ts
 * (matches `wa.me`), so no onClick handler is attached here.
 */
export const WhatsAppCta: React.FC<WhatsAppCtaProps> = ({
  label,
  message,
  servicio,
  size = "md",
  block = false,
  className = "",
}) => {
  const { t } = useLanguage();
  const phone = useWhatsappPhone();
  const text = message ?? t.waMsgDefault;

  const fallback = servicio
    ? `/#contacto?servicio=${encodeURIComponent(servicio)}`
    : "/#contacto";
  const href = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
    : fallback;
  const external = Boolean(phone);

  const classes = [
    "btn-wa",
    size === "sm" ? "btn-wa--sm" : "",
    block ? "btn-wa--block" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <a
      href={href}
      className={classes}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
    >
      <MessageCircle className="w-5 h-5 shrink-0" aria-hidden="true" />
      <span>{label ?? t.waCtaLabel}</span>
      {external && <span className="sr-only"> {t.waNewTab}</span>}
    </a>
  );
};

export default WhatsAppCta;
