import React from "react";
import { useLanguage } from "@shared/context/LanguageContext";
import {
  SeoFaqSchema,
  HowToSchema,
} from "@shared/presentation/components/SeoSchema";

const CartaDigitalFaqSection: React.FC = () => {
  const { t } = useLanguage();

  const faqs = [
    { q: t.cartaFaqQ1, a: t.cartaFaqA1 },
    { q: t.cartaFaqQ2, a: t.cartaFaqA2 },
    { q: t.cartaFaqQ3, a: t.cartaFaqA3 },
    { q: t.cartaFaqQ4, a: t.cartaFaqA4 },
    { q: t.cartaFaqQ5, a: t.cartaFaqA5 },
  ];

  const steps = [
    { name: t.cartaHowToStep1Name, text: t.cartaHowToStep1Text },
    { name: t.cartaHowToStep2Name, text: t.cartaHowToStep2Text },
    { name: t.cartaHowToStep3Name, text: t.cartaHowToStep3Text },
  ];

  return (
    <>
      <SeoFaqSchema
        faqs={faqs.map((faq) => ({ question: faq.q, answer: faq.a }))}
      />
      <HowToSchema
        title={t.cartaHowToTitle}
        description={t.cartaHowToDesc}
        steps={steps}
      />
      <section
        id="carta-faq"
        aria-label={t.cartaFaqTitle}
        className="py-16 md:py-24 bg-[var(--color-bg-alt)]"
      >
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black leading-[1.15] font-display mb-10 md:mb-14 text-center">
              {t.cartaFaqTitle}
            </h3>
            <div className="space-y-3 mb-16 md:mb-24">
              {faqs.map((faq) => (
                <details
                  key={faq.q}
                  className="group border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] overflow-hidden"
                >
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-semibold text-base select-none hover:bg-[var(--color-accent-subtle)] transition-colors duration-150">
                    {faq.q}
                    <span className="ml-4 shrink-0 text-[var(--color-primary)] group-open:rotate-45 transition-transform duration-200">
                      +
                    </span>
                  </summary>
                  <p className="px-5 pb-4 pt-2 text-sm text-muted leading-relaxed">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-black leading-[1.15] font-display mb-4 text-center">
                {t.cartaHowToTitle}
              </h3>
              <p className="text-center text-muted text-sm mb-10">
                {t.cartaHowToDesc}
              </p>
              <ol className="space-y-4 list-none">
                {steps.map((step, index) => (
                  <li
                    key={step.name}
                    className="flex gap-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-5 md:p-6"
                  >
                    <div className="text-3xl font-black text-[var(--color-accent-subtle)] font-display leading-none shrink-0">
                      0{index + 1}
                    </div>
                    <div>
                      <div className="font-bold text-base mb-1">{step.name}</div>
                      <div className="text-sm text-muted leading-relaxed">
                        {step.text}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default CartaDigitalFaqSection;
