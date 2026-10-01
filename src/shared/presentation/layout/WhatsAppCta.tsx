import React from "react";
import { MessageCircle } from "lucide-react";
import { useLanguage } from "@shared/context/LanguageContext";
import { useWhatsappPhone } from "@shared/hooks";
import { buildWhatsappLink } from "@shared/utils/whatsappLink";

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
 * URL rules live in buildWhatsappLink (wa.me + pre-filled text, or the
 * absolute `/#contacto` fallback in SSR / without a configured phone).
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
  const { href, external } = buildWhatsappLink(phone, {
    message: message ?? t.waMsgDefault,
    servicio,
  });

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
