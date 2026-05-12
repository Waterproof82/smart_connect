import React from "react";
import { useLanguage } from "@shared/context/LanguageContext";

const CartaDigitalBeneficiosSection: React.FC = () => {
  const { t } = useLanguage();

  const beneficios = [
    {
      num: "01",
      icon: "🍽️",
      title: t.cartaBeneficio1Title,
      desc: t.cartaBeneficio1Desc,
      tag: t.cartaBeneficio1Tag,
    },
    {
      num: "02",
      icon: "🌍",
      title: t.cartaBeneficio2Title,
      desc: t.cartaBeneficio2Desc,
      tag: t.cartaBeneficio2Tag,
    },
    {
      num: "03",
      icon: "💰",
      title: t.cartaBeneficio3Title,
      desc: t.cartaBeneficio3Desc,
      tag: t.cartaBeneficio3Tag,
    },
    {
      num: "04",
      icon: "👤",
      title: t.cartaBeneficio4Title,
      desc: t.cartaBeneficio4Desc,
      tag: t.cartaBeneficio4Tag,
    },
    {
      num: "05",
      icon: "💬",
      title: t.cartaBeneficio5Title,
      desc: t.cartaBeneficio5Desc,
      tag: t.cartaBeneficio5Tag,
    },
    {
      num: "06",
      icon: "🌐",
      title: t.cartaBeneficio6Title,
      desc: t.cartaBeneficio6Desc,
      tag: t.cartaBeneficio6Tag,
    },
    {
      num: "07",
      icon: "⚙️",
      title: t.cartaBeneficio7Title,
      desc: t.cartaBeneficio7Desc,
      tag: t.cartaBeneficio7Tag,
      fullWidth: true,
    },
  ];

  return (
    <section
      id="beneficios"
      className="py-16 md:py-24 bg-[var(--color-bg-alt)]"
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 md:mb-20">
            <div className="text-xs font-semibold tracking-[0.3em] text-[var(--color-primary)] uppercase mb-3 md:mb-4">
              {t.cartaBeneficiosTitle}
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-[1.15] font-display">
              {t.cartaBeneficiosSubtitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {beneficios.map((item) => (
              <div
                key={item.num}
                className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg p-5 md:p-6 flex gap-4 md:gap-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 ${item.fullWidth ? "md:col-span-2" : ""}`}
              >
                <div className="text-3xl md:text-4xl lg:text-5xl font-black text-[var(--color-accent-subtle)] font-display leading-none hidden sm:block">
                  {item.num}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 md:gap-4">
                    <div className="text-2xl md:text-3xl flex-shrink-0 mt-1">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-base md:text-lg mb-2">
                        {item.title}
                      </div>
                      <div className="text-sm text-muted leading-relaxed">
                        {item.desc}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--color-border)]">
                    <div className="text-xs font-bold text-[var(--color-primary)] bg-[var(--color-accent-subtle)] w-6 h-6 rounded-full flex items-center justify-center">
                      {item.num}
                    </div>
                    <div className="inline-block px-3 py-1 rounded-full bg-[var(--color-accent-subtle)] border border-[var(--color-accent-border)] text-xs text-[var(--color-primary)] font-semibold">
                      {item.tag}
                    </div>
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

export default CartaDigitalBeneficiosSection;
