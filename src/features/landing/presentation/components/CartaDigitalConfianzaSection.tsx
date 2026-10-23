import React from "react";
import { Check, ShieldAlert, ShieldCheck, UserRound, X } from "lucide-react";
import { useLanguage } from "@shared/context/LanguageContext";

/**
 * Pillar 1 of the Carta Digital differentiation: who is behind the menu.
 * Contrasts an anonymous app (unknown servers, ticket support, data kept
 * by the platform) with a real contact person in Tenerife.
 */
const CartaDigitalConfianzaSection: React.FC = () => {
  const { t } = useLanguage();

  const stakes = [
    t.cartaConfianzaStake1,
    t.cartaConfianzaStake2,
    t.cartaConfianzaStake3,
    t.cartaConfianzaStake4,
    t.cartaConfianzaStake5,
    t.cartaConfianzaStake6,
  ];

  const anon = [
    t.cartaConfianzaAnon1,
    t.cartaConfianzaAnon2,
    t.cartaConfianzaAnon3,
    t.cartaConfianzaAnon4,
    t.cartaConfianzaAnon5,
  ];

  const own = [
    t.cartaConfianzaOwn1,
    t.cartaConfianzaOwn2,
    t.cartaConfianzaOwn3,
    t.cartaConfianzaOwn4,
    t.cartaConfianzaOwn5,
  ];

  return (
    <section
      id="confianza"
      aria-labelledby="carta-confianza-title"
      className="ds-section ds-section--alt"
    >
      <div className="ds-container">
        <div className="ds-section-head">
          <p className="ds-kicker">{t.cartaConfianzaKicker}</p>
          <h2 id="carta-confianza-title" className="ds-h2">
            {t.cartaConfianzaTitle}
          </h2>
          <p className="ds-lede">{t.cartaConfianzaIntro}</p>
        </div>

        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 md:p-6 mb-6 md:mb-8">
          <p
            id="carta-confianza-stakes"
            className="text-sm font-semibold text-muted mb-3"
          >
            {t.cartaConfianzaStakesLabel}
          </p>
          <ul
            aria-labelledby="carta-confianza-stakes"
            className="flex flex-wrap gap-2 list-none"
          >
            {stakes.map((stake) => (
              <li
                key={stake}
                className="px-3 py-1.5 rounded-full bg-[var(--color-bg-alt)] border border-[var(--color-border)] text-sm font-medium"
              >
                {stake}
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[var(--color-surface)] border border-[var(--color-error-border)] rounded-xl p-6 md:p-8">
            <h3
              id="carta-confianza-anon"
              className="flex items-center gap-3 font-display font-bold text-xl md:text-2xl mb-5"
            >
              <ShieldAlert
                className="w-6 h-6 shrink-0 text-[var(--color-error-text)]"
                aria-hidden="true"
              />
              {t.cartaConfianzaAnonTitle}
            </h3>
            <ul
              aria-labelledby="carta-confianza-anon"
              className="space-y-3 list-none"
            >
              {anon.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm md:text-base">
                  <X
                    className="w-5 h-5 shrink-0 mt-0.5 text-[var(--color-error-text)]"
                    aria-hidden="true"
                  />
                  <span className="text-muted">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-[var(--color-surface)] border-2 border-[var(--color-primary)] rounded-xl p-6 md:p-8">
            <h3
              id="carta-confianza-own"
              className="flex items-center gap-3 font-display font-bold text-xl md:text-2xl mb-5"
            >
              <ShieldCheck
                className="w-6 h-6 shrink-0 text-[var(--color-primary)]"
                aria-hidden="true"
              />
              {t.cartaConfianzaOwnTitle}
            </h3>
            <ul
              aria-labelledby="carta-confianza-own"
              className="space-y-3 list-none"
            >
              {own.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm md:text-base">
                  <Check
                    className="w-5 h-5 shrink-0 mt-0.5 text-[var(--color-primary)]"
                    aria-hidden="true"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="mt-6 md:mt-8 flex items-start gap-3 bg-[var(--color-accent-subtle)] border border-[var(--color-accent-border)] rounded-xl p-5 md:p-6 font-semibold">
          <UserRound
            className="w-6 h-6 shrink-0 text-[var(--color-primary)]"
            aria-hidden="true"
          />
          <span>{t.cartaConfianzaNote}</span>
        </p>
      </div>
    </section>
  );
};

export default CartaDigitalConfianzaSection;
