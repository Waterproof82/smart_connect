import React from "react";
import { useLanguage } from "@shared/context/LanguageContext";
import { SeoFaqSchema } from "@shared/presentation/components/SeoSchema";

const HomeFaqSection: React.FC = () => {
  const { t } = useLanguage();

  const faqs = [
    { q: t.homeFaqQ1, a: t.homeFaqA1 },
    { q: t.homeFaqQ2, a: t.homeFaqA2 },
    { q: t.homeFaqQ3, a: t.homeFaqA3 },
    { q: t.homeFaqQ4, a: t.homeFaqA4 },
    { q: t.homeFaqQ5, a: t.homeFaqA5 },
    { q: t.homeFaqQ6, a: t.homeFaqA6 },
  ];

  return (
    <>
      <SeoFaqSchema
        faqs={faqs.map((faq) => ({ question: faq.q, answer: faq.a }))}
      />
      <section
        aria-label={t.homeFaqTitle}
        className="max-w-3xl mx-auto px-4 md:px-6"
      >
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black leading-[1.15] font-display mb-10 md:mb-14 text-center">
          {t.homeFaqTitle}
        </h2>
        <div className="space-y-3">
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
      </section>
    </>
  );
};

export default HomeFaqSection;
