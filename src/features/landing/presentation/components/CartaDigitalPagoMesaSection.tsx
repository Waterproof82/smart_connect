import React from "react";
import { HandCoins, ListChecks, Receipt, Split, Star } from "lucide-react";
import { useLanguage } from "@shared/context/LanguageContext";

/**
 * Table payment from the digital menu: suggested tip on the receipt,
 * even split, pay-for-what-you-ordered and a Google review right after
 * paying. Informational only — the page's single primary CTA stays in
 * CartaDigitalCTAFinalSection.
 */
const CartaDigitalPagoMesaSection: React.FC = () => {
  const { t } = useLanguage();

  const features = [
    { icon: HandCoins, title: t.cartaPagoFeat1Title, desc: t.cartaPagoFeat1Desc },
    { icon: Split, title: t.cartaPagoFeat2Title, desc: t.cartaPagoFeat2Desc },
    { icon: ListChecks, title: t.cartaPagoFeat3Title, desc: t.cartaPagoFeat3Desc },
    { icon: Star, title: t.cartaPagoFeat4Title, desc: t.cartaPagoFeat4Desc },
  ];

  return (
    <section
      id="pago-en-mesa"
      aria-labelledby="carta-pago-title"
      className="ds-section ds-section--alt"
    >
      <div className="ds-container">
        <div className="ds-section-head">
          <p className="ds-kicker">{t.cartaPagoKicker}</p>
          <h2 id="carta-pago-title" className="ds-h2">
            {t.cartaPagoTitle}
          </h2>
          <p className="ds-lede">{t.cartaPagoIntro}</p>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 list-none">
          {features.map(({ icon: Icon, title, desc }) => (
            <li
              key={title}
              className="flex gap-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 md:p-6"
            >
              <span className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center bg-[var(--color-accent-subtle)] text-[var(--color-primary)]">
                <Icon className="w-5 h-5" aria-hidden="true" />
              </span>
              <div>
                <h3 className="font-display font-bold text-lg mb-1">{title}</h3>
                <p className="text-sm text-muted leading-relaxed">{desc}</p>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-6 md:mt-8 flex items-start gap-3 text-sm md:text-base text-muted">
          <Receipt
            className="w-5 h-5 shrink-0 mt-0.5 text-[var(--color-primary)]"
            aria-hidden="true"
          />
          <span>{t.cartaPagoNote}</span>
        </p>
      </div>
    </section>
  );
};

export default CartaDigitalPagoMesaSection;
