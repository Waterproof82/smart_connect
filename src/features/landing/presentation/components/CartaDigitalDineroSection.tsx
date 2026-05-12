import React from "react";
import { useLanguage } from "@shared/context/LanguageContext";
import {
  TrendingDown,
  TrendingUp,
  Mail,
  Eye,
  UserX,
  BarChart3,
} from "lucide-react";

const CartaDigitalDineroSection: React.FC = () => {
  const { t } = useLanguage();

  const card1Items = [
    {
      icon: <TrendingDown size={18} />,
      label: t.cartaDineroCard1Item1,
      pct: -15,
    },
    {
      icon: <Eye size={18} />,
      label: t.cartaDineroCard1Item2,
      pct: -10,
    },
    {
      icon: <UserX size={18} />,
      label: t.cartaDineroCard1Item3,
      pct: -5,
    },
  ];

  const card2Items = [
    {
      icon: <TrendingUp size={18} />,
      label: t.cartaDineroCard2Item1,
      pct: 15,
    },
    {
      icon: <Eye size={18} />,
      label: t.cartaDineroCard2Item2,
      pct: 10,
    },
    {
      icon: <Mail size={18} />,
      label: t.cartaDineroCard2Item3,
      pct: 5,
    },
    {
      icon: <BarChart3 size={18} />,
      label: t.cartaDineroCard2Item4,
      pct: 5,
    },
  ];

  return (
    <section id="dinero" className="py-16 md:py-24 bg-[var(--color-bg-alt)]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center mb-12 md:mb-16">
          <div className="text-xs font-semibold tracking-[0.3em] text-[var(--color-primary)] uppercase mb-3 md:mb-4">
            {t.cartaDineroTitle}
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black leading-[1.15] mb-4 md:mb-6 font-display">
            {t.cartaDineroSubtitle}
          </h2>
          <p className="text-base text-muted leading-relaxed max-w-lg mx-auto">
            {t.cartaDineroCalcDesc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto mb-12 md:mb-16">
          <div className="relative group w-full bg-[var(--color-surface)] rounded-3xl p-6 md:p-8 border border-[var(--color-error-border)] flex flex-col">
            <div className="absolute -right-6 -bottom-6 text-[120px] text-[var(--color-error-text)] opacity-[0.05] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
              <TrendingDown size={120} strokeWidth={1} />
            </div>

            <div className="text-xs font-bold tracking-widest uppercase text-[var(--color-error-text)] mb-6">
              {t.cartaDineroCard1Title}
            </div>

            <div className="flex-1 space-y-4">
              {card1Items.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-[var(--color-error-text)]">
                        {item.icon}
                      </span>
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-right text-[var(--color-error-text)] tabular-nums">
                      {item.pct}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--color-bg-alt)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--color-error-text)] rounded-full transition-all duration-1000"
                      style={{ width: `${Math.abs(item.pct)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-6 mt-6 border-t border-[var(--color-border)]">
              <span className="text-sm text-muted">
                {t.cartaDineroCard1Total}
              </span>
              <span className="text-2xl font-black text-[var(--color-error-text)] font-display">
                -30%
              </span>
            </div>
          </div>

          <div className="relative group w-full bg-[var(--color-surface)] rounded-3xl p-6 md:p-8 border border-[var(--color-success-border)] flex flex-col">
            <div className="absolute -right-6 -bottom-6 text-[120px] text-[var(--color-success-text)] opacity-[0.05] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
              <TrendingUp size={120} strokeWidth={1} />
            </div>

            <div className="text-xs font-bold tracking-widest uppercase text-[var(--color-success-text)] mb-6">
              {t.cartaDineroCard2Title}
            </div>

            <div className="flex-1 space-y-4">
              {card2Items.map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-[var(--color-success-text)]">
                        {item.icon}
                      </span>
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <span className="text-sm font-semibold text-right text-[var(--color-success-text)] tabular-nums">
                      +{item.pct}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-[var(--color-bg-alt)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--color-success-text)] rounded-full transition-all duration-1000"
                      style={{ width: `${item.pct}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between pt-6 mt-6 border-t border-[var(--color-border)]">
              <span className="text-sm text-muted">
                {t.cartaDineroCard2Total}
              </span>
              <span className="text-2xl font-black text-[var(--color-success-text)] font-display">
                +35%
              </span>
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[var(--color-success-bg)] border border-[var(--color-success-border)]">
            <span className="text-sm md:text-base font-semibold text-[var(--color-success-text)]">
              Visibilidad + Mailings = Crecimiento real.
            </span>
            <span className="text-2xl font-black text-[var(--color-success-text)] font-display">
              📈
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CartaDigitalDineroSection;
