import React from "react";
import { useLanguage } from "@shared/context/LanguageContext";
import { Smartphone, QrCode, Nfc, MessageSquare } from "lucide-react";

/**
 * Facts strip (seo-trust-claims-cleanup PR2b, design.md D2): replaces the
 * old unverified "30-day guarantee / free 24h shipping / 24/7 support"
 * badges with 4 verifiable product facts. No stars, no third-party figures.
 */
const TrustBadges: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="border-t border-b border-[var(--color-border)] py-8 bg-[var(--color-surface)] mt-12">
      <div className="ds-container">
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          <div className="flex items-center gap-2 text-muted">
            <Smartphone className="w-5 h-5" aria-hidden="true" />
            <span className="text-sm font-medium">
              {t.tapReviewTrustNoApp}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted">
            <QrCode className="w-5 h-5" aria-hidden="true" />
            <span className="text-sm font-medium">
              {t.tapReviewTrustQrFallback}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted">
            <Nfc className="w-5 h-5" aria-hidden="true" />
            <span className="text-sm font-medium">
              {t.tapReviewTrustCompat}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted">
            <MessageSquare className="w-5 h-5" aria-hidden="true" />
            <span className="text-sm font-medium">{t.tapReviewTrustNoSub}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustBadges;
