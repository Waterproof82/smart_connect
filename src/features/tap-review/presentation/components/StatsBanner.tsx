import React from "react";
import { useLanguage } from "@shared/context/LanguageContext";
import StarRating from "./StarRating";

const StatsBanner: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="container mx-auto px-6 my-12">
      <div className="bg-gradient-to-r from-[var(--color-bg-alt)] to-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <StarRating rating={4.9} />
              <span className="ml-2 text-lg font-bold text-default">4.9/5</span>
            </div>
            <span className="text-muted">|</span>
            <span className="text-muted font-medium">
              {t.tapReviewStatsBusinesses}
            </span>
          </div>
          <div className="flex items-center gap-6 text-center">
            <div>
              <p className="text-3xl font-bold text-[var(--color-accent)]">
                +600K
              </p>
              <p className="text-sm text-muted">{t.tapReviewStatsReviews}</p>
            </div>
            <div className="w-px h-12 bg-[var(--color-border)]"></div>
            <div>
              <p className="text-3xl font-bold text-[var(--color-accent)]">
                +400
              </p>
              <p className="text-sm text-muted">{t.tapReviewStatsDaily}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsBanner;
