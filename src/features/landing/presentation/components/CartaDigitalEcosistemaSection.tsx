import React from "react";
import {
  ArrowDown,
  ChefHat,
  Receipt,
  Search,
  ShoppingBag,
  UserRound,
} from "lucide-react";
import { useLanguage } from "@shared/context/LanguageContext";

/**
 * The full Carta Digital ecosystem in four stages: discovery (Google,
 * social media, own landing, reviews) → orders (online, delivery, table,
 * waiter PDA) → preparation (one-tap reply, kitchen/bar routing) →
 * payment and management (table payment with tips, POS, Veri*factu).
 */
const CartaDigitalEcosistemaSection: React.FC = () => {
  const { t } = useLanguage();

  const stages = [
    {
      icon: Search,
      title: t.cartaEcoStage1Title,
      items: [
        t.cartaEcoStage1Item1,
        t.cartaEcoStage1Item2,
        t.cartaEcoStage1Item3,
        t.cartaEcoStage1Item4,
      ],
    },
    {
      icon: ShoppingBag,
      title: t.cartaEcoStage2Title,
      items: [
        t.cartaEcoStage2Item1,
        t.cartaEcoStage2Item2,
        t.cartaEcoStage2Item3,
        t.cartaEcoStage2Item4,
      ],
    },
    {
      icon: ChefHat,
      title: t.cartaEcoStage3Title,
      items: [t.cartaEcoStage3Item1, t.cartaEcoStage3Item2, t.cartaEcoStage3Item3],
    },
    {
      icon: Receipt,
      title: t.cartaEcoStage4Title,
      items: [
        t.cartaEcoStage4Item1,
        t.cartaEcoStage4Item2,
        t.cartaEcoStage4Item3,
        t.cartaEcoStage4Item4,
      ],
    },
  ];

  return (
    <section
      id="ecosistema"
      aria-labelledby="carta-ecosistema-title"
      className="ds-section"
    >
      <div className="ds-container">
        <div className="ds-section-head">
          <p className="ds-kicker">{t.cartaEcoKicker}</p>
          <h2 id="carta-ecosistema-title" className="ds-h2">
            {t.cartaEcoTitle}
          </h2>
          <p className="ds-lede">{t.cartaEcoIntro}</p>
        </div>

        <ol data-testid="eco-stages" className="list-none max-w-4xl">
          {stages.map(({ icon: Icon, title, items }, idx) => (
            <li key={title} className="flex flex-col items-stretch">
              <div className="grid grid-cols-1 md:grid-cols-[14rem_minmax(0,1fr)] gap-4 md:gap-6 items-center bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 md:p-6">
                <div className="flex items-center gap-3">
                  <span className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center bg-[var(--color-accent-subtle)] text-[var(--color-primary)]">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <div>
                    <span className="block font-display font-bold text-sm text-[var(--color-primary)] tabular-nums">
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <h3 className="font-display font-bold text-lg md:text-xl leading-tight">
                      {title}
                    </h3>
                  </div>
                </div>
                <ul className="flex flex-wrap gap-2 list-none">
                  {items.map((item) => (
                    <li
                      key={item}
                      className="px-3 py-1.5 rounded-full bg-[var(--color-accent-subtle)] border border-[var(--color-accent-border)] text-sm font-medium"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              {idx < stages.length - 1 && (
                <ArrowDown
                  className="w-5 h-5 my-2 self-center text-[var(--color-primary)]"
                  aria-hidden="true"
                />
              )}
            </li>
          ))}
        </ol>

        <p className="mt-6 md:mt-8 max-w-4xl flex items-start gap-3 bg-[var(--color-accent-subtle)] border border-[var(--color-accent-border)] rounded-xl p-5 md:p-6 font-semibold">
          <UserRound
            className="w-6 h-6 shrink-0 text-[var(--color-primary)]"
            aria-hidden="true"
          />
          <span>{t.cartaEcoNote}</span>
        </p>
      </div>
    </section>
  );
};

export default CartaDigitalEcosistemaSection;
