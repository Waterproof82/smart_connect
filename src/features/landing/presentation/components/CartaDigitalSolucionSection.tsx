import React from "react";
import { useLanguage } from "@shared/context/LanguageContext";

const CartaDigitalSolucionSection: React.FC = () => {
  const { t } = useLanguage();

  const pills = [
    "📱 QR",
    "🌍 5 idiomas",
    "🎬 Media",
    "🛒 Take Away",
    "💬 WhatsApp",
    "📧 Email",
    "📊 Stats",
    "🔍 SEO",
    "⭐ Google",
  ];

  return (
    <section
      id="solucion"
      className="py-16 md:py-24"
      style={{
        background:
          "linear-gradient(135deg, var(--color-bg) 0%, var(--color-bg-alt) 100%)",
      }}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto relative">
          <div className="text-center mb-10 md:mb-16">
            <div className="text-xs font-semibold tracking-[0.3em] text-[var(--color-success-text)] uppercase mb-3 md:mb-4">
              {t.cartaSolucionTitle}
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-[1.15] mb-6 md:mb-10 font-display">
              {t.cartaSolucionSubtitle}
            </h2>
          </div>

          <div className="bg-[var(--color-success-bg)] border border-[var(--color-success-border)] rounded-2xl md:rounded-3xl p-6 md:p-10 lg:p-14 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-48 h-48 md:w-64 md:h-64 rotate-12 opacity-[0.08] pointer-events-none group-hover:opacity-[0.12] transition-opacity">
              <img
                src="/assets/Tarjeta_NFC_negra_MontesTAP.webp"
                alt="NFC SmartConnect Background"
                width="256"
                height="256"
                loading="lazy"
                className="w-full h-full object-contain"
              />
            </div>

            <p className="text-lg md:text-xl lg:text-2xl font-bold leading-relaxed font-display relative z-10">
              {t.cartaSolucionPrefix}
              <span className="text-[var(--color-success-text)]">
                {t.cartaSolucionHighlight}
              </span>
              {t.cartaSolucionSuffix}
            </p>
            <p className="text-base text-muted leading-relaxed mt-4 md:mt-6 max-w-2xl relative z-10">
              {t.cartaSolucionDesc}
            </p>
            <div className="flex flex-wrap gap-2 md:gap-3 justify-center mt-6 md:mt-10 relative z-10">
              {pills.map((pill) => (
                <div
                  key={pill}
                  className="px-3 md:px-4 py-1.5 md:py-2 rounded-full bg-[var(--color-accent-subtle)] border border-[var(--color-accent-border)] text-xs md:text-sm text-[var(--color-primary)] font-medium"
                >
                  {pill}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartaDigitalSolucionSection;
