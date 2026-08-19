import React from "react";
import { UtensilsCrossed, ShoppingCart } from "lucide-react";
import { useLanguage } from "@shared/context/LanguageContext";

const CartaDigitalModosSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="py-16 md:py-24 bg-[var(--color-bg-alt)]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10 md:mb-14">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-[1.15] font-display">
              {t.cartaModosTitle}
            </h2>
            <p className="text-base text-muted mt-4">
              {t.cartaModosSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div
              data-testid="modo-card"
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 md:p-8"
            >
              <div className="w-7 h-7 mb-4 text-[var(--color-primary)]">
                <UtensilsCrossed className="w-full h-full" aria-hidden="true" />
              </div>
              <h3 className="font-black text-xl md:text-2xl font-display mb-3">
                {t.cartaModoRestauranteTitle}
              </h3>
              <p className="text-sm text-muted leading-relaxed mb-6">
                {t.cartaModoRestauranteDesc}
              </p>
              <ul className="space-y-2 list-none">
                <li className="flex items-start gap-2 text-sm">
                  <span className="text-[var(--color-primary)] font-bold mt-0.5">✓</span>
                  <span>{t.cartaModoRestauranteFeature1}</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <span className="text-[var(--color-primary)] font-bold mt-0.5">✓</span>
                  <span>{t.cartaModoRestauranteFeature2}</span>
                </li>
              </ul>
            </div>

            <div
              data-testid="modo-card"
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 md:p-8"
            >
              <div className="w-7 h-7 mb-4 text-[var(--color-primary)]">
                <ShoppingCart className="w-full h-full" aria-hidden="true" />
              </div>
              <h3 className="font-black text-xl md:text-2xl font-display mb-3">
                {t.cartaModoTiendaTitle}
              </h3>
              <p className="text-sm text-muted leading-relaxed mb-6">
                {t.cartaModoTiendaDesc}
              </p>
              <ul className="space-y-2 list-none">
                <li className="flex items-start gap-2 text-sm">
                  <span className="text-[var(--color-primary)] font-bold mt-0.5">✓</span>
                  <span>{t.cartaModoTiendaFeature1}</span>
                </li>
                <li className="flex items-start gap-2 text-sm">
                  <span className="text-[var(--color-primary)] font-bold mt-0.5">✓</span>
                  <span>{t.cartaModoTiendaFeature2}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartaDigitalModosSection;
