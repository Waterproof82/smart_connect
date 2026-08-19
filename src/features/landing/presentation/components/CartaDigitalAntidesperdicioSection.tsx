import React from "react";
import { Timer, Megaphone, TrendingUp } from "lucide-react";
import { useLanguage } from "@shared/context/LanguageContext";

const CartaDigitalAntidesperdicioSection: React.FC = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: <Timer className="w-6 h-6" aria-hidden="true" />,
      title: t.cartaAntidesperdicioFeature1Title,
      desc: t.cartaAntidesperdicioFeature1Desc,
    },
    {
      icon: <Megaphone className="w-6 h-6" aria-hidden="true" />,
      title: t.cartaAntidesperdicioFeature2Title,
      desc: t.cartaAntidesperdicioFeature2Desc,
    },
    {
      icon: <TrendingUp className="w-6 h-6" aria-hidden="true" />,
      title: t.cartaAntidesperdicioFeature3Title,
      desc: t.cartaAntidesperdicioFeature3Desc,
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-[var(--color-bg)]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-[1.15] font-display">
              {t.cartaAntidesperdicioTitle}
            </h2>
            <p className="text-base font-semibold text-[var(--color-primary)] mt-3">
              {t.cartaAntidesperdicioSubtitle}
            </p>
            <p className="text-sm text-muted leading-relaxed mt-4 max-w-2xl mx-auto">
              {t.cartaAntidesperdicioDesc}
            </p>
          </div>

          <ul className="mt-8 space-y-4 list-none">
            {features.map((feature) => (
              <li
                key={feature.title}
                data-testid="antidesperdicio-feature"
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-5 md:p-6 flex gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex-shrink-0 mt-1 text-[var(--color-primary)]">
                  {feature.icon}
                </div>
                <div>
                  <div className="font-bold text-base md:text-lg mb-1">
                    {feature.title}
                  </div>
                  <div className="text-sm text-muted leading-relaxed">
                    {feature.desc}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default CartaDigitalAntidesperdicioSection;
