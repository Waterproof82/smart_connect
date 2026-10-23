import React from "react";
import { TrendingUp, X } from "lucide-react";
import { useLanguage } from "@shared/context/LanguageContext";

/**
 * 30-day free trial and its two outcomes. Commitment wording only — no
 * guarantee claim (keywordCopy.cartaDiferenciacion.test.ts). The page's
 * single primary CTA stays in CartaDigitalCTAFinalSection, right after.
 */
const CartaDigitalPruebaSection: React.FC = () => {
  const { t } = useLanguage();

  const steps = [
    {
      label: t.cartaPruebaStep1Label,
      title: t.cartaPruebaStep1Title,
      desc: t.cartaPruebaStep1Desc,
    },
    {
      label: t.cartaPruebaStep2Label,
      title: t.cartaPruebaStep2Title,
      desc: t.cartaPruebaStep2Desc,
    },
    {
      label: t.cartaPruebaStep3Label,
      title: t.cartaPruebaStep3Title,
      desc: t.cartaPruebaStep3Desc,
    },
  ];

  return (
    <section
      id="prueba-gratis"
      aria-labelledby="carta-prueba-title"
      className="ds-section ds-section--alt"
    >
      <div className="ds-container">
        <div className="ds-section-head">
          <p className="ds-kicker">{t.cartaPruebaKicker}</p>
          <h2 id="carta-prueba-title" className="ds-h2">
            {t.cartaPruebaTitle}
          </h2>
          <p className="ds-lede">{t.cartaPruebaIntro}</p>
        </div>

        <ol
          data-testid="prueba-steps"
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 list-none"
        >
          {steps.map((step) => (
            <li
              key={step.label}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 md:p-6"
            >
              <span className="block text-sm font-semibold text-[var(--color-primary)] mb-2">
                {step.label}
              </span>
              <span className="block font-display font-bold text-lg md:text-xl mb-1">
                {step.title}
              </span>
              <span className="block text-sm text-muted leading-relaxed">
                {step.desc}
              </span>
            </li>
          ))}
        </ol>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-4 md:mt-6">
          <div className="flex gap-4 bg-[var(--color-accent-subtle)] border-2 border-[var(--color-primary)] rounded-xl p-5 md:p-6">
            <TrendingUp
              className="w-6 h-6 shrink-0 text-[var(--color-primary)]"
              aria-hidden="true"
            />
            <div>
              <h3 className="font-display font-bold text-lg md:text-xl mb-1">
                {t.cartaPruebaYesTitle}
              </h3>
              <p className="text-sm md:text-base">{t.cartaPruebaYesDesc}</p>
            </div>
          </div>
          <div className="flex gap-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 md:p-6">
            <X className="w-6 h-6 shrink-0 text-muted" aria-hidden="true" />
            <div>
              <h3 className="font-display font-bold text-lg md:text-xl mb-1">
                {t.cartaPruebaNoTitle}
              </h3>
              <p className="text-sm md:text-base">{t.cartaPruebaNoDesc}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartaDigitalPruebaSection;
