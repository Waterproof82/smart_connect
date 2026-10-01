import React from "react";
import { useLanguage } from "@shared/context/LanguageContext";
import { WhatsAppCta } from "./WhatsAppCta";

interface MobileWhatsAppBarProps {
  message?: string;
  servicio?: string;
}

/**
 * Mobile-only sticky bar (C4) keeping the WhatsApp CTA one tap away on long
 * pages. Rendered in SSR (pure markup + CSS, hidden ≥ md) and paired with
 * `.ds-wa-bar-spacer` in PageShell so it never covers content — no CLS.
 */
export const MobileWhatsAppBar: React.FC<MobileWhatsAppBarProps> = ({
  message,
  servicio,
}) => {
  const { t } = useLanguage();
  return (
    <aside className="ds-wa-bar" aria-label={t.waCtaLabel}>
      <p className="ds-wa-bar__line">{t.waBarLine}</p>
      <WhatsAppCta
        size="sm"
        label={t.waCtaShort}
        message={message}
        servicio={servicio}
      />
    </aside>
  );
};

export default MobileWhatsAppBar;
