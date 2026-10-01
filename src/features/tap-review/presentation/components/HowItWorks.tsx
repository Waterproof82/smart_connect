import React, { useState } from "react";
import { useLanguage } from "@shared/context/LanguageContext";
import { Smartphone, Star, Award } from "lucide-react";
import { sanitizeInput } from "@shared/utils/sanitizer";
import { HowToSchema } from "../../../../shared/presentation/components/SeoSchema";

const HowItWorks: React.FC = () => {
  const { t } = useLanguage();
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  const steps = [
    {
      icon: <Smartphone className="w-8 h-8" />,
      title: t.tapReviewHowStep1Title,
      desc: t.tapReviewHowStep1Desc,
      image: "/assets/nfc/put_exibitor.webp",
      width: 3200,
      height: 3200,
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: t.tapReviewHowStep2Title,
      desc: t.tapReviewHowStep2Desc,
      image: "/assets/nfc/place_device.jpg",
      width: 868,
      height: 1000,
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: t.tapReviewHowStep3Title,
      desc: t.tapReviewHowStep3Desc,
      image: "/assets/nfc/review.webp",
      width: 609,
      height: 406,
    },
  ];

  return (
    <>
      <HowToSchema
        title={t.tapReviewHowTitle}
        description={t.tapReviewHowSubtitle}
        steps={steps.map((step) => ({
          name: step.title,
          text: step.desc,
          image: step.image,
        }))}
      />
      <section className="ds-section">
        <div className="ds-container">
          <div
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="ds-h2 mb-4">
              {t.tapReviewHowTitle}
            </h2>
            <p className="text-muted">{t.tapReviewHowSubtitle}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, idx) => (
              <div
                key={step.image}
                className="relative p-8 bg-[var(--color-bg-alt)] rounded-xl"
                style={{ transitionDelay: `${idx * 150}ms` }}
              >
                <div className="absolute -top-4 -left-4 w-12 h-12 bg-[var(--color-accent)] rounded-full flex items-center justify-center text-[var(--color-on-accent)] font-bold text-xl">
                  {idx + 1}
                </div>
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-[var(--color-surface)] rounded-xl flex items-center justify-center mb-6 text-[var(--color-accent)]">
                    {step.icon}
                  </div>
                  <h3 className="ds-h3 mb-3 text-default">
                    {sanitizeInput(step.title)}
                  </h3>
                  <p className="text-muted">{sanitizeInput(step.desc)}</p>
                  <div className="mt-6 w-full h-48 bg-gradient-to-br from-[var(--color-bg-alt)] to-[var(--color-surface)] rounded-xl flex items-center justify-center overflow-hidden p-2">
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
                        alt={sanitizeInput(step.title)}
                        width={step.width}
                        height={step.height}
                        loading="lazy"
                        decoding="async"
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
      </section>
    </>
  );
};

export default HowItWorks;
