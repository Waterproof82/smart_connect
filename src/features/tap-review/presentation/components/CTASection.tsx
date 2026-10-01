import React from "react";
import { Check } from "lucide-react";
import { useLanguage } from "@shared/context/LanguageContext";
import { WhatsAppCta } from "@shared/presentation/layout";

/**
 * Closing CTA of /tarjetas-nfc — same grammar as the shared ClosingCta
 * (one sentence, one WhatsApp action) plus the three reassurance points.
 */
const CTASection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section
      aria-labelledby="nfc-cta-title"
      className="ds-section ds-section--alt"
    >
      <div className="ds-container ds-container--prose text-center grid justify-items-center gap-[var(--space-md)]">
        <h2 id="nfc-cta-title" className="ds-h2">
          {t.tapReviewCTATitle}
        </h2>
        <p className="ds-lede">{t.tapReviewCTASubtitle}</p>
        <WhatsAppCta
          label={t.tapReviewCTABtnPrimary}
          message={t.waMsgNfc}
          servicio="Tarjetas NFC"
        />
        <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted list-none p-0 m-0">
          {[
            t.tapReviewCTAFeature1,
            t.tapReviewCTAFeature2,
            t.tapReviewCTAFeature3,
          ].map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <Check
                className="w-4 h-4 text-[var(--color-success-text)]"
                aria-hidden="true"
              />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default CTASection;
