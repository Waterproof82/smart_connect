import React, { useRef, useState } from "react";
import { useLanguage } from "@shared/context/LanguageContext";
import { useIntersectionObserver } from "@shared/hooks";
import { Smartphone, Star, Award } from "lucide-react";

const HowItWorks: React.FC = () => {
  const { t } = useLanguage();
  const sectionRef = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(sectionRef, {
    rootMargin: "0px 0px -50px 0px",
  });

  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const steps = [
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: t.tapReviewHowStep1Title,
      desc: t.tapReviewHowStep1Desc,
      image: "/assets/nfc/put_exibitor.webp",
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: t.tapReviewHowStep2Title,
      desc: t.tapReviewHowStep2Desc,
      image: "/assets/nfc/place_device.jpg",
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: t.tapReviewHowStep3Title,
      desc: t.tapReviewHowStep3Desc,
      image: "/assets/nfc/review.webp",
    },
  ];

  return (
    <div ref={sectionRef} className="py-20">
      <div className="container mx-auto px-6">
        <div
          className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t.tapReviewHowTitle}
          </h2>
          <p className="text-muted">{t.tapReviewHowSubtitle}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`relative p-8 bg-[var(--color-bg-alt)] rounded-3xl transition-all duration-700 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{ transitionDelay: `${idx * 150}ms` }}
            >
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-[var(--color-accent)] rounded-full flex items-center justify-center text-[var(--color-on-accent)] font-bold text-xl">
                {idx + 1}
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-20 h-20 bg-[var(--color-surface)] rounded-2xl flex items-center justify-center mb-6 text-[var(--color-accent)]">
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-default">
                  {step.title}
                </h3>
                <p className="text-muted">{step.desc}</p>
                <div className="mt-6 w-full h-48 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-2xl flex items-center justify-center overflow-hidden p-2">
                  {imageErrors[idx] ? (
                    <div className="text-center p-4">
                      <div className="w-16 h-16 mx-auto mb-2 text-[var(--color-accent)]">
                        {step.icon}
                      </div>
                      <p className="text-xs text-muted font-medium">
                        Paso {idx + 1}
                      </p>
                    </div>
                  ) : (
                    <img
                      src={step.image}
                      alt={step.title}
                      className="w-full h-full object-contain drop-shadow-lg"
                      onError={() =>
                        setImageErrors((prev) => ({ ...prev, [idx]: true }))
                      }
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
