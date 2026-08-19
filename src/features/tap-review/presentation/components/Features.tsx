import React, { useRef } from "react";
import { useLanguage } from "@shared/context/LanguageContext";
import { useIntersectionObserver } from "@shared/hooks";
import { QrCode, Zap, Star, Shield } from "lucide-react";
import { accentStyle, type AccentToken } from "@shared/config/accents";

const Features: React.FC = () => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(sectionRef, {
    rootMargin: "0px 0px -50px 0px",
  });

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
    <div ref={sectionRef} className="py-20 bg-[var(--color-bg-alt)]">
      <div className="container mx-auto px-6">
        <div
          className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t.tapReviewFeatTitle}
          </h2>
          <p className="text-muted">{t.tapReviewFeatSubtitle}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className={`p-6 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)] transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${idx * 100}ms` }}
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 tpv-accent-chip text-[color:var(--tpv-accent)]"
                style={accentStyle(feature.accent)}
              >
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold mb-2 text-default">
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
