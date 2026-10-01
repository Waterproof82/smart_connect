import React from "react";
import { useLanguage } from "@shared/context/LanguageContext";

interface CartaDigitalGlovoSectionProps {
  whatsappPhone: string;
}

const CartaDigitalGlovoSection: React.FC<CartaDigitalGlovoSectionProps> = ({
  whatsappPhone,
}) => {
  const { t } = useLanguage();
  const ctaHref = whatsappPhone
    ? `https://wa.me/${whatsappPhone}`
    : "/#contacto?servicio=Carta%20Digital%20Premium";

  return (
    <section
      id="sin-comisiones"
      className="ds-section bg-[var(--color-bg-alt)]"
    >
      <div className="ds-container">
        <div className="max-w-4xl mx-auto text-center">
          <div className="text-xs font-semibold tracking-[0.3em] text-[var(--color-primary)] uppercase mb-3 md:mb-4">
            {t.glovoEyebrow}
          </div>
          <h2 className="ds-h2 mb-4 md:mb-6">
            {t.glovoTitle}
          </h2>
          <p className="text-base md:text-lg text-muted leading-relaxed max-w-2xl mx-auto mb-10 md:mb-12">
            {t.glovoDesc}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 max-w-2xl mx-auto mb-10">
            <div className="bg-[var(--color-surface)] border border-[var(--color-error-border)] rounded-lg p-6">
              <div className="text-sm text-muted mb-2">{t.glovoOtherLabel}</div>
              <div className="text-5xl font-black tabular-nums text-[var(--color-error-text)]">
                {t.glovoOtherValue}
              </div>
            </div>
            <div className="bg-[var(--color-surface)] border border-[var(--color-primary)] rounded-lg p-6">
              <div className="text-sm text-muted mb-2">{t.glovoOwnLabel}</div>
              <div className="text-5xl font-black tabular-nums text-[var(--color-primary)]">
                {t.glovoOwnValue}
              </div>
            </div>
          </div>

          <a
            href={ctaHref}
            className="inline-flex items-center justify-center min-h-[48px] px-8 py-3 rounded-xl font-bold bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-on-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] transition-colors"
          >
            {t.glovoCta}
          </a>
        </div>
      </div>
    </section>
  );
};

export default CartaDigitalGlovoSection;
