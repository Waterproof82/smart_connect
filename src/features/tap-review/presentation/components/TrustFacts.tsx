import React from "react";
import { useLanguage } from "@shared/context/LanguageContext";
import { Settings, Smartphone, MessageCircle } from "lucide-react";

/**
 * TrustFacts (seo-trust-claims-cleanup PR2b, design.md D3): replaces
 * SocialProof's 3 fabricated testimonials with 3 factual cards sourced from
 * the existing NFC FAQ copy — no stars, no avatars, no invented quotes.
 */
const TrustFacts: React.FC = () => {
  const { t } = useLanguage();

  const facts = [
    {
      icon: <Settings className="w-6 h-6" aria-hidden="true" />,
      title: t.tapReviewFact1Title,
      desc: t.tapReviewFact1Desc,
    },
    {
      icon: <Smartphone className="w-6 h-6" aria-hidden="true" />,
      title: t.tapReviewFact2Title,
      desc: t.tapReviewFact2Desc,
    },
    {
      icon: <MessageCircle className="w-6 h-6" aria-hidden="true" />,
      title: t.tapReviewFact3Title,
      desc: t.tapReviewFact3Desc,
    },
  ];

  return (
    <div className="py-20">
      <div className="ds-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="ds-h2 mb-4">{t.tapReviewFactsTitle}</h2>
          <p className="text-muted">{t.tapReviewFactsSubtitle}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {facts.map((fact) => (
            <div
              key={fact.title}
              className="p-8 bg-[var(--color-bg-alt)] rounded-xl"
            >
              <div className="w-12 h-12 rounded-xl bg-[var(--color-surface)] flex items-center justify-center mb-6 text-[var(--color-accent)]">
                {fact.icon}
              </div>
              <h3 className="ds-h3 mb-3 text-default">{fact.title}</h3>
              <p className="text-muted">{fact.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustFacts;
