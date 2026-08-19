import React from "react";
import {
  Smartphone,
  Users,
  CheckCircle2,
  UtensilsCrossed,
} from "lucide-react";
import { useLanguage } from "@shared/context/LanguageContext";

const CartaDigitalTelegramSection: React.FC = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: <Smartphone className="w-full h-full" aria-hidden="true" />,
      title: t.cartaTelegramFeature1Title,
      desc: t.cartaTelegramFeature1Desc,
    },
    {
      icon: <Users className="w-full h-full" aria-hidden="true" />,
      title: t.cartaTelegramFeature2Title,
      desc: t.cartaTelegramFeature2Desc,
    },
    {
      icon: <CheckCircle2 className="w-full h-full" aria-hidden="true" />,
      title: t.cartaTelegramFeature3Title,
      desc: t.cartaTelegramFeature3Desc,
    },
    {
      icon: <UtensilsCrossed className="w-full h-full" aria-hidden="true" />,
      title: t.cartaTelegramFeature4Title,
      desc: t.cartaTelegramFeature4Desc,
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-[var(--color-bg)]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-[1.15] font-display">
              {t.cartaTelegramTitle}
            </h2>
            <p className="text-base text-muted mt-4 max-w-2xl mx-auto">
              {t.cartaTelegramSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                data-testid="telegram-feature"
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-5 md:p-6 flex gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="w-6 h-6 md:w-7 md:h-7 flex-shrink-0 mt-1 text-[var(--color-primary)]">
                  {feature.icon}
                </div>
                <div>
                  <div className="font-bold text-base md:text-lg mb-2">
                    {feature.title}
                  </div>
                  <div className="text-sm text-muted leading-relaxed">
                    {feature.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartaDigitalTelegramSection;
