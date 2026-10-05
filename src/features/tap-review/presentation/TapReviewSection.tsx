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
import { Check, ChevronDown } from "lucide-react";
import { useLanguage } from "@shared/context/LanguageContext";
import { WhatsAppCta } from "@shared/presentation/layout";

// Import components from presentation/components/ (Clean Architecture)
import ProductGallery from "./components/ProductGallery";
import HowItWorks from "./components/HowItWorks";
import Features from "./components/Features";
import TrustFacts from "./components/TrustFacts";
import CTASection from "./components/CTASection";
import TrustBadges from "./components/TrustBadges";

/**
 * WhatsApp CTAs resolve the phone through the shared, cached
 * useWhatsappPhone() inside <WhatsAppCta/> — no prop drilling needed.
 */
export const TapReviewSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div id="tarjetas-nfc">
      {/* Same hero grammar as PageHero; heading stays h2 because the page
          owns a frozen sr-only h1 (SEO_PROTOCOL P-13). */}
      <header className="ds-hero">
        <div className="ds-container grid grid-cols-1 lg:grid-cols-2 gap-[var(--space-2xl)] items-start">
          <div className="grid gap-[var(--space-md)] min-w-0">
            <h2 className="ds-h1 ds-h1--s">
              {t.tapReviewHeroTitle}{" "}
              <span className="text-[var(--color-primary)]">
                {t.tapReviewHeroAccent}
              </span>
            </h2>
            <p className="ds-lede">{t.tapReviewHeroSubtitle}</p>

            <div className="ds-actions">
              <WhatsAppCta
                label={t.tapReviewHeroBtnContact}
                message={t.waMsgNfc}
                servicio="Tarjetas NFC"
              />
              <a href="#product" className="btn-ghost">
                {t.tapReviewHeroBtnProduct}
                <ChevronDown className="w-4 h-4" aria-hidden="true" />
              </a>
            </div>

            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted list-none p-0 m-0">
              {[
                t.tapReviewHeroFeature1,
                t.tapReviewHeroFeature2,
                t.tapReviewHeroFeature3,
              ].map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <Check
                    className="w-4 h-4 text-[var(--color-success-text)]"
                    aria-hidden="true"
                  />
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          <div id="product" className="min-w-0">
            <ProductGallery />
          </div>
        </div>
      </header>

      <TrustBadges />
      <HowItWorks />
      <Features />
      <TrustFacts />
      <CTASection />
    </div>
  );
};
