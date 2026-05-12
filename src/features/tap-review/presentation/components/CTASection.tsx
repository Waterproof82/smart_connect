import React, { useRef } from "react";
import { useLanguage } from "@shared/context/LanguageContext";
import { useIntersectionObserver } from "@shared/hooks";
import { Check } from "lucide-react";

interface CTASectionProps {
  whatsappPhone?: string;
}

const CTASection: React.FC<CTASectionProps> = ({ whatsappPhone = "" }) => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(sectionRef, {
    rootMargin: "0px 0px -50px 0px",
  });

  return (
    <div ref={sectionRef} className="py-20">
      <div className="container mx-auto px-6">
        <div
          className={`relative bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-primary)] rounded-3xl p-12 md:p-16 text-center transition-all duration-1000 overflow-hidden ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full translate-x-1/3 translate-y-1/3"></div>
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              {t.tapReviewCTATitle}
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-2xl mx-auto">
              {t.tapReviewCTASubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={
                  whatsappPhone
                    ? `https://wa.me/${whatsappPhone}`
                    : "#contacto?servicio=Tap%20Review%20NFC"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white text-[var(--color-accent)] font-bold px-8 py-4 rounded-xl hover:bg-white/90 transition-colors min-h-[48px]"
              >
                {t.tapReviewCTABtnPrimary}
              </a>
            </div>
            <div className="flex flex-wrap justify-center gap-6 mt-8 text-white/80 text-sm">
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                {t.tapReviewCTAFeature1}
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                {t.tapReviewCTAFeature2}
              </span>
              <span className="flex items-center gap-2">
                <Check className="w-4 h-4" />
                {t.tapReviewCTAFeature3}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTASection;
