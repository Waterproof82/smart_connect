import React from "react";
import { FaqList } from "@shared/presentation/layout";
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
  ];
}

/**
 * Carta Digital FAQ group — consumed by the standalone /carta-digital page
 * (CartaDigitalPage.tsx), not by home, so the same Q&A is never marked up
 * as FAQPage on two URLs.
 */
export function useCartaFaqGroup(): HomeFaqGroup {
  const { t } = useLanguage();

  return {
    title: t.cartaFaqTitle,
    items: [
      { q: t.cartaFaqQ1, a: t.cartaFaqA1 },
      { q: t.cartaFaqQ2, a: t.cartaFaqA2 },
      { q: t.cartaFaqQ3, a: t.cartaFaqA3 },
      { q: t.cartaFaqQ4, a: t.cartaFaqA4 },
      { q: t.cartaFaqQ5, a: t.cartaFaqA5 },
    ],
  };
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
      { q: t.tapReviewFAQ4Question, a: t.tapReviewFAQ4Answer },
    ],
  };
}

const HomeFaqSection: React.FC = () => {
  const { t } = useLanguage();
  const groups = useHomeFaqGroups();

  return (
    <div className="ds-container ds-container--prose">
      <div className="ds-section-head">
        <h2 id="faq-title" className="ds-h2">
          {t.homeFaqTitle}
        </h2>
      </div>
      <div className="grid gap-[var(--space-xl)]">
        {groups.map((group) => (
          <div key={group.title}>
            {groups.length > 1 && (
              <h3 className="ds-h3 text-muted mb-2">{group.title}</h3>
            )}
            <FaqList items={group.items} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeFaqSection;
