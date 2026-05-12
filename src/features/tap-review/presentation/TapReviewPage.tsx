/**
 * TapReviewPage Component
 * @module features/tap-review/presentation
 *
 * NFC Tap-to-Review solution page - similar design to tapstar.es
 * Clean Architecture: imports components from presentation/components/
 */

import React from "react";
import { Helmet } from "react-helmet-async";
import { Check, Smartphone, ChevronDown } from "lucide-react";
import { useLanguage } from "@shared/context/LanguageContext";

// Import components from presentation/components/ (Clean Architecture)
import Navbar from "./components/Navbar";
import ProductGallery from "./components/ProductGallery";
import StatsBanner from "./components/StatsBanner";
import HowItWorks from "./components/HowItWorks";
import Features from "./components/Features";
import SocialProof from "./components/SocialProof";
import FAQ from "./components/FAQ";
import CTASection from "./components/CTASection";
import TrustBadges from "./components/TrustBadges";
import Footer from "./components/Footer";

interface TapReviewPageProps {
  whatsappPhone?: string;
}

export const TapReviewPage: React.FC<TapReviewPageProps> = ({
  whatsappPhone = "",
}) => {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>{t.tapReviewMetaTitle}</title>
        <meta name="description" content={t.tapReviewMetaDesc} />
      </Helmet>

      <Navbar />

      <div className="min-h-screen bg-[var(--color-bg)] pt-24 pb-16">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div>
              <div className="inline-flex items-center gap-2 bg-[var(--color-accent)]/10 text-[var(--color-accent)] px-4 py-2 rounded-full text-sm font-bold mb-6">
                <Smartphone className="w-4 h-4" />
                {t.tapReviewEyebrow}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                {t.tapReviewHeroTitle}
                <span className="text-[var(--color-accent)]">
                  {" "}
                  {t.tapReviewHeroAccent}
                </span>
              </h1>
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
                  className="inline-flex items-center justify-center gap-2 bg-[var(--color-accent)] text-[var(--color-on-accent)] font-bold px-8 py-4 rounded-xl hover:bg-[var(--color-accent-hover)] transition-colors min-h-[48px]"
                >
                  {t.tapReviewHeroBtnContact}
                </a>
                <a
                  href="#product"
                  className="inline-flex items-center justify-center gap-2 bg-[var(--color-surface)] text-default font-bold px-8 py-4 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-bg-alt)] transition-colors min-h-[48px]"
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
        <FAQ />
        <CTASection whatsappPhone={whatsappPhone} />
      </div>

      <Footer />
    </>
  );
};
