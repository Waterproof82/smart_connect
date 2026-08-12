import React from "react";
import { useLanguage } from "@shared/context/LanguageContext";

export interface HomeFaqEntry {
  q: string;
  a: string;
}

interface HomeFaqGroup {
  title: string;
  items: HomeFaqEntry[];
}

/**
 * Returns the audited, deduped FAQ set for the home page: the original
 * general FAQ plus the Carta Digital Premium FAQ. Exported so App.tsx can
 * flatten it into `buildHomeSchema()`'s single FAQPage node without
 * re-declaring the question list.
 *
 * PR3: the Tarjetas NFC FAQ group was un-merged into `useNfcFaqGroup()`
 * below — it now lives on the standalone `/tarjetas-nfc` page, not home.
 */
export function useHomeFaqGroups(): HomeFaqGroup[] {
  const { t } = useLanguage();

  return [
    {
      title: t.homeFaqTitle,
      items: [
        { q: t.homeFaqQ1, a: t.homeFaqA1 },
        { q: t.homeFaqQ2, a: t.homeFaqA2 },
        { q: t.homeFaqQ3, a: t.homeFaqA3 },
        { q: t.homeFaqQ4, a: t.homeFaqA4 },
        { q: t.homeFaqQ5, a: t.homeFaqA5 },
        { q: t.homeFaqQ6, a: t.homeFaqA6 },
      ],
    },
    {
      title: t.cartaFaqTitle,
      items: [
        { q: t.cartaFaqQ1, a: t.cartaFaqA1 },
        { q: t.cartaFaqQ2, a: t.cartaFaqA2 },
        { q: t.cartaFaqQ3, a: t.cartaFaqA3 },
        { q: t.cartaFaqQ4, a: t.cartaFaqA4 },
        { q: t.cartaFaqQ5, a: t.cartaFaqA5 },
      ],
    },
  ];
}

/**
 * Tarjetas NFC FAQ group — un-merged from `useHomeFaqGroups()` in PR3.
 * Consumed by the standalone `/tarjetas-nfc` page (TapReviewPage.tsx),
 * not by home.
 */
export function useNfcFaqGroup(): HomeFaqGroup {
  const { t } = useLanguage();

  return {
    title: t.tapReviewFAQTitle,
    items: [
      { q: t.tapReviewFAQ1Question, a: t.tapReviewFAQ1Answer },
      { q: t.tapReviewFAQ2Question, a: t.tapReviewFAQ2Answer },
      { q: t.tapReviewFAQ3Question, a: t.tapReviewFAQ3Answer },
    ],
  };
}

const HomeFaqSection: React.FC = () => {
  const { t } = useLanguage();
  const groups = useHomeFaqGroups();

  return (
    <section
      aria-label={t.homeFaqTitle}
      className="max-w-3xl mx-auto px-4 md:px-6"
    >
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-black leading-[1.15] font-display mb-10 md:mb-14 text-center">
        {t.homeFaqTitle}
      </h2>
      {groups.map((group) => (
        <div key={group.title} className="mb-10 md:mb-14 last:mb-0">
          <h3 className="text-lg font-bold text-muted uppercase tracking-wider mb-4">
            {group.title}
          </h3>
          <div className="space-y-3">
            {group.items.map((faq) => (
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
        </div>
      ))}
    </section>
  );
};

export default HomeFaqSection;
