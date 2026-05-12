import React from "react";
import { useLanguage } from "@shared/context/LanguageContext";

interface CartaDigitalHeroSectionProps {
  onScrollToSection: (id: string) => void;
}

const CartaDigitalHeroSection: React.FC<CartaDigitalHeroSectionProps> = ({
  onScrollToSection,
}) => {
  const { t } = useLanguage();

  return (
    <section
      id="hero"
      className="min-h-screen flex flex-col items-center justify-center px-4 md:px-6 pt-24 pb-16 relative overflow-hidden"
      style={{
        background:
          "radial-gradient(ellipse at 30% 50%, color-mix(in oklch, var(--color-primary) 8%, transparent) 0%, transparent 60%), radial-gradient(ellipse at 70% 20%, color-mix(in oklch, var(--color-success-text) 5%, transparent) 0%, transparent 50%), var(--color-bg)",
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
        }}
      ></div>

      <div className="container mx-auto relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-block text-xs font-semibold tracking-[0.25em] text-[var(--color-primary)] uppercase border border-[var(--color-accent-border)] px-4 py-2 rounded-full mb-6 md:mb-8">
            {t.cartaHeroEyebrow}
          </div>
          <div className="text-sm md:text-base text-muted font-medium mb-4">
            📍 {t.cartaHeroTenerife}
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.1] mb-4 md:mb-6 font-display">
            {t.cartaHeroTitle1}
            <br />
            <span className="text-[var(--color-primary)] italic">
              {t.cartaHeroTitleAccent}
            </span>
            <br />
            {t.cartaHeroTitle2}
          </h1>

          <p className="text-base md:text-lg lg:text-xl text-muted max-w-xl mx-auto mb-8 md:mb-12 leading-relaxed">
            {t.cartaHeroSubtitle}
          </p>

          <div className="flex flex-wrap gap-3 md:gap-4 justify-center mb-10 md:mb-16">
            <button
              onClick={() => onScrollToSection("demo")}
              className="px-6 md:px-8 py-3 md:py-4 rounded-xl bg-[var(--color-primary)] text-[var(--color-bg)] font-semibold text-sm tracking-wider uppercase hover:opacity-90 transition-all cursor-pointer border-none min-h-[44px]"
            >
              {t.cartaHeroButtonDemo}
            </button>
            <button
              onClick={() => onScrollToSection("dinero")}
              className="px-6 md:px-8 py-3 md:py-4 rounded-xl bg-transparent text-default font-medium text-sm cursor-pointer border border-[var(--color-border)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all min-h-[44px]"
            >
              {t.cartaHeroButtonCalc}
            </button>
          </div>

          <div className="flex flex-wrap gap-6 md:gap-10 lg:gap-12 justify-center">
            {[
              { num: "5", label: t.cartaHeroStat1Label },
              { num: "0%", label: t.cartaHeroStat2Label },
              { num: "24/7", label: t.cartaHeroStat3Label },
              { num: "∞", label: t.cartaHeroStat4Label },
            ].map((stat) => (
              <div key={stat.num} className="text-center">
                <div className="text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--color-primary)] font-display">
                  {stat.num}
                </div>
                <div className="text-xs text-muted uppercase tracking-widest mt-1">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartaDigitalHeroSection;
