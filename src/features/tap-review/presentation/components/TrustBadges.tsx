import React from "react";
import { useLanguage } from "@shared/context/LanguageContext";
import { Shield, Zap, Users, MessageSquare } from "lucide-react";

const TrustBadges: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="border-t border-b border-[var(--color-border)] py-8 bg-[var(--color-surface)] mt-12">
      <div className="container mx-auto px-6">
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16">
          <div className="flex items-center gap-2 text-muted">
            <Shield className="w-5 h-5" />
            <span className="text-sm font-medium">
              {t.tapReviewTrust30Days}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted">
            <Zap className="w-5 h-5" />
            <span className="text-sm font-medium">{t.tapReviewTrust24h}</span>
          </div>
          <div className="flex items-center gap-2 text-muted">
            <Users className="w-5 h-5" />
            <span className="text-sm font-medium">
              {t.tapReviewTrustSupport}
            </span>
          </div>
          <div className="flex items-center gap-2 text-muted">
            <MessageSquare className="w-5 h-5" />
            <span className="text-sm font-medium">{t.tapReviewTrustNoSub}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustBadges;
