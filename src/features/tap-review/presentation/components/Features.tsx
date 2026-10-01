import React from "react";
import { useLanguage } from "@shared/context/LanguageContext";
import { QrCode, Zap, Star, Shield } from "lucide-react";
import { accentStyle, type AccentToken } from "@shared/config/accents";

const Features: React.FC = () => {
  const { t } = useLanguage();

  const features: {
    icon: React.ReactNode;
    title: string;
    desc: string;
    accent: AccentToken;
  }[] = [
    {
      icon: <QrCode className="w-6 h-6" />,
      title: t.tapReviewFeatNFC,
      desc: t.tapReviewFeatNFCDesc,
      accent: "--color-icon-blue",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: t.tapReviewFeatSpeed,
      desc: t.tapReviewFeatSpeedDesc,
      accent: "--color-icon-amber",
    },
    {
      icon: <Star className="w-6 h-6" />,
      title: t.tapReviewFeatGoogle,
      desc: t.tapReviewFeatGoogleDesc,
      accent: "--color-icon-green",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: t.tapReviewFeatNoSub,
      desc: t.tapReviewFeatNoSubDesc,
      accent: "--color-icon-purple",
    },
  ];

  return (
    <div className="py-20 bg-[var(--color-bg-alt)]">
      <div className="ds-container">
        <div
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="ds-h2 mb-4">
            {t.tapReviewFeatTitle}
          </h2>
          <p className="text-muted">{t.tapReviewFeatSubtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="p-6 bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)]"
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 tpv-accent-chip text-[color:var(--tpv-accent)]"
                style={accentStyle(feature.accent)}
              >
                {feature.icon}
              </div>
              <h3 className="ds-h3 mb-2 text-default">
                {feature.title}
              </h3>
              <p className="text-sm text-muted">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Features;
