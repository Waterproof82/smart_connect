import React from "react";
import { useLanguage } from "@shared/context/LanguageContext";

const CartaDigitalBBDDSection: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section
      id="bbdd"
      className="py-16 md:py-24"
      style={{
        background:
          "linear-gradient(135deg, var(--color-bg) 0%, var(--color-bg-alt) 100%)",
      }}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto text-center mb-12 md:mb-16">
          <div className="text-xs font-semibold tracking-[0.3em] text-[var(--color-primary)] uppercase mb-3 md:mb-4">
            {t.cartaBBDDTitle}
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-[1.15] mb-4 md:mb-6 font-display">
            {t.cartaBBDDSubtitle}
          </h2>
          <p className="text-base text-muted leading-relaxed">
            {t.cartaBBDDDesc}
          </p>
        </div>

        <div className="flex flex-col items-center max-w-md mx-auto">
          <div className="flex flex-wrap gap-2 md:gap-3 justify-center mb-6 md:mb-8">
            <div className="px-3 md:px-4 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-accent-border)] text-xs md:text-sm font-medium flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]"></div>
              {t.cartaBBDDLabel1}
            </div>
            <div className="px-3 md:px-4 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-accent-border)] text-xs md:text-sm font-medium flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--color-primary)]"></div>
              {t.cartaBBDDLabel2}
            </div>
          </div>

          <div className="text-2xl text-[var(--color-primary)] mb-4">↓</div>

          <div className="bg-[var(--color-surface)] border border-[var(--color-accent-border)] rounded-2xl p-6 md:p-8 w-full relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[var(--color-primary)] text-[var(--color-bg)] text-xs font-bold tracking-widest px-4 py-1 rounded-full">
              {t.cartaBBDDLabelTuBBDD}
            </div>
            <div className="flex flex-wrap gap-2 md:gap-3 justify-center">
              <div className="px-3 md:px-4 py-1.5 md:py-2 rounded bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-xs md:text-sm text-muted">
                {t.cartaBBDDData1}
              </div>
              <div className="px-3 md:px-4 py-1.5 md:py-2 rounded bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-xs md:text-sm text-muted">
                {t.cartaBBDDData2}
              </div>
              <div className="px-3 md:px-4 py-1.5 md:py-2 rounded bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-xs md:text-sm text-muted">
                {t.cartaBBDDData3}
              </div>
              <div className="px-3 md:px-4 py-1.5 md:py-2 rounded bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-xs md:text-sm text-muted">
                {t.cartaBBDDData4}
              </div>
            </div>
          </div>

          <div className="text-2xl text-[var(--color-primary)] my-4">↓</div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-3 w-full">
            <div className="px-3 md:px-4 py-3 md:py-4 rounded-xl text-center bg-[var(--color-accent-subtle)] border border-[var(--color-accent-border)] text-xs md:text-sm font-semibold text-[var(--color-primary)]">
              {t.cartaBBDDAction1}
            </div>
            <div className="px-3 md:px-4 py-3 md:py-4 rounded-xl text-center bg-[var(--color-accent-subtle)] border border-[var(--color-accent-border)] text-xs md:text-sm font-semibold text-[var(--color-primary)]">
              {t.cartaBBDDAction2}
            </div>
            <div className="px-3 md:px-4 py-3 md:py-4 rounded-xl text-center bg-[var(--color-accent-subtle)] border border-[var(--color-accent-border)] text-xs md:text-sm font-semibold text-[var(--color-primary)]">
              {t.cartaBBDDAction3}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartaDigitalBBDDSection;
