/**
 * TapReviewSection Component
 * @module features/tap-review/presentation
 *
 * NFC Tap-to-Review solution — merged into the home page as a full
 * scrollable section (was previously its own /tap-review page). No
 * Helmet, no JSON-LD, no Navbar/Footer here: App.tsx owns the single
 * <Helmet> and the JSON-LD graph (via buildHomeSchema) for the whole
 * home page now.
 */

import React from "react";
import { Check, Smartphone, ChevronDown } from "lucide-react";
import { useLanguage } from "@shared/context/LanguageContext";

// Import components from presentation/components/ (Clean Architecture)
import ProductGallery from "./components/ProductGallery";
import StatsBanner from "./components/StatsBanner";
import HowItWorks from "./components/HowItWorks";
import Features from "./components/Features";
import SocialProof from "./components/SocialProof";
import CTASection from "./components/CTASection";
import TrustBadges from "./components/TrustBadges";

interface TapReviewSectionProps {
  /** Pre-fetched, wa.me-ready phone number — single fetch lives in App.tsx via useWhatsappPhone(). */
  whatsappPhone?: string;
}

export const TapReviewSection: React.FC<TapReviewSectionProps> = ({
  whatsappPhone = "",
}) => {
  const { t } = useLanguage();

  return (
    <div
      id="tarjetas-nfc"
      className="bg-[var(--color-bg)] pt-20 md:pt-32 pb-16"
    >
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <div>
            <div className="inline-flex items-center gap-2 bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-4 py-2 rounded-full text-sm font-bold mb-6">
              <Smartphone className="w-4 h-4" />
              {t.tapReviewEyebrow}
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              {t.tapReviewHeroTitle}
              <span className="text-[var(--color-accent)]">
                {" "}
                {t.tapReviewHeroAccent}
              </span>
            </h2>
            <p className="text-lg text-muted mb-8 leading-relaxed">
              {t.tapReviewHeroSubtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <a
                href={
                  whatsappPhone
                    ? `https://wa.me/${whatsappPhone}`
                    : "#contacto?servicio=Tap%20Review%20NFC"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                {t.tapReviewHeroBtnContact}
              </a>
              <a
                href="#product"
                className="btn-secondary"
              >
                {t.tapReviewHeroBtnProduct}
                <ChevronDown className="w-4 h-4" />
              </a>
            </div>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2 bg-[var(--color-bg-alt)] px-4 py-2 rounded-lg">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-muted">{t.tapReviewHeroFeature1}</span>
              </div>
              <div className="flex items-center gap-2 bg-[var(--color-bg-alt)] px-4 py-2 rounded-lg">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-muted">{t.tapReviewHeroFeature2}</span>
              </div>
              <div className="flex items-center gap-2 bg-[var(--color-bg-alt)] px-4 py-2 rounded-lg">
                <Check className="w-4 h-4 text-green-500" />
                <span className="text-muted">{t.tapReviewHeroFeature3}</span>
              </div>
            </div>
          </div>

          <div id="product">
            <ProductGallery />
          </div>
        </div>
      </div>

      <TrustBadges />
      <StatsBanner />
      <HowItWorks />
      <Features />
      <SocialProof />
      <CTASection whatsappPhone={whatsappPhone} />
    </div>
  );
};
