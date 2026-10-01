import React from "react";
import { useLanguage } from "@shared/context/LanguageContext";
import { WhatsAppCta } from "@shared/presentation/layout";

/** Closing block of /carta-digital: one WhatsApp action + a form fallback. */
const CartaDigitalCTAFinalSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section
      id="cta-final"
      aria-labelledby="cta-final-title"
      className="ds-section ds-section--alt"
    >
      <div className="ds-container">
        <div className="text-center max-w-2xl mx-auto">
          <p className="ds-kicker mb-4">{t.cartaCTATitle}</p>
          <h2 id="cta-final-title" className="ds-h2 mb-6">
            {t.cartaCTASubtitle}
          </h2>
          <p className="text-base md:text-lg text-muted max-w-md mx-auto mb-8 md:mb-12 leading-relaxed">
            {t.featuresCartaDigitalDesc}
          </p>

          <div className="ds-actions justify-center mb-[var(--space-xl)]">
            <WhatsAppCta
              label={t.cartaCTABtnDemo}
              message={t.waMsgCarta}
              servicio="Carta Digital"
            />
            <a
              href="/#contacto?servicio=Carta%20Digital"
              className="btn-ghost"
            >
              {t.cartaCTABtnContact}
            </a>
          </div>

          <ul className="flex flex-wrap gap-x-6 gap-y-2 justify-center text-sm text-muted list-none p-0 m-0 border-t border-[var(--color-border)] pt-[var(--space-md)]">
            {[
              t.cartaCTANoContract,
              t.cartaCTASignup48h,
              t.cartaCTASupport,
              t.cartaCTANoComm,
            ].map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default CartaDigitalCTAFinalSection;
