import React from "react";
import { useLanguage } from "@shared/context/LanguageContext";
import {
  Smartphone,
  MonitorPlay,
  Bell,
  ShoppingCart,
  Globe,
} from "lucide-react";

const CartaDigitalComoFuncionaSection: React.FC = () => {
  const { t } = useLanguage();

  const steps = [
    {
      icon: <Smartphone size={28} />,
      title: t.cartaFlujoStep1Title,
      desc: t.cartaFlujoStep1Desc,
    },
    {
      icon: <MonitorPlay size={28} />,
      title: t.cartaFlujoStep2Title,
      desc: t.cartaFlujoStep2Desc,
    },
    {
      icon: <Bell size={28} />,
      title: t.cartaFlujoStep3Title,
      desc: t.cartaFlujoStep3Desc,
    },
    {
      icon: <ShoppingCart size={28} />,
      title: t.cartaFlujoStep4Title,
      desc: t.cartaFlujoStep4Desc,
    },
    {
      icon: <Globe size={28} />,
      title: t.cartaFlujoStep5Title,
      desc: t.cartaFlujoStep5Desc,
    },
  ];

  return (
    <section id="como-funciona" className="py-16 md:py-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 md:mb-16">
            <div className="text-xs font-semibold tracking-[0.3em] text-[var(--color-primary)] uppercase mb-3 md:mb-4">
              {t.cartaFlujoTitle}
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-[1.15] font-display">
              {t.cartaFlujoSubtitle}
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 relative">
            <div
              className="absolute top-14 left-[5%] right-[5%] h-px bg-gradient-to-r from-[var(--color-primary)] to-transparent hidden lg:block"
              style={{ opacity: 0.3 }}
            ></div>
            {steps.map((step) => (
              <div
                key={step.title}
                className="text-center relative z-10 p-3 md:p-4 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-primary)] transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-full bg-[var(--color-bg-alt)] border-2 border-[var(--color-primary)] flex items-center justify-center text-xl md:text-2xl lg:text-3xl mx-auto mb-3 md:mb-4">
                  {step.icon}
                </div>
                <div className="font-bold text-sm md:text-base mb-1">
                  {step.title}
                </div>
                <div className="text-xs text-muted leading-relaxed">
                  {step.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartaDigitalComoFuncionaSection;
