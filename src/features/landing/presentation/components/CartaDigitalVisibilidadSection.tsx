import React from "react";
import { Check, MapPin, Sparkles } from "lucide-react";
import { useLanguage } from "@shared/context/LanguageContext";

/**
 * Pillar 2 of the Carta Digital differentiation: local SEO + GEO (AI
 * assistants) and the feedback loop between the menu, the Google Business
 * Profile, the customer database and Google reviews.
 */
const CartaDigitalVisibilidadSection: React.FC = () => {
  const { t } = useLanguage();

  const columns = [
    {
      id: "carta-vis-seo",
      icon: MapPin,
      title: t.cartaVisSeoTitle,
      sub: t.cartaVisSeoSub,
      items: [t.cartaVisSeo1, t.cartaVisSeo2, t.cartaVisSeo3, t.cartaVisSeo4],
    },
    {
      id: "carta-vis-geo",
      icon: Sparkles,
      title: t.cartaVisGeoTitle,
      sub: t.cartaVisGeoSub,
      items: [t.cartaVisGeo1, t.cartaVisGeo2, t.cartaVisGeo3, t.cartaVisGeo4],
    },
  ];

  const loop = [
    t.cartaVisLoop1,
    t.cartaVisLoop2,
    t.cartaVisLoop3,
    t.cartaVisLoop4,
    t.cartaVisLoop5,
    t.cartaVisLoop6,
  ];

  return (
    <section
      id="visibilidad"
      aria-labelledby="carta-visibilidad-title"
      className="ds-section"
    >
      <div className="ds-container">
        <div className="ds-section-head">
          <p className="ds-kicker">{t.cartaVisKicker}</p>
          <h2 id="carta-visibilidad-title" className="ds-h2">
            {t.cartaVisTitle}
          </h2>
          <p className="ds-lede">{t.cartaVisIntro}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {columns.map(({ id, icon: Icon, title, sub, items }) => (
            <div
              key={id}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 md:p-8"
            >
              <div className="flex items-center gap-3 mb-5">
                <span className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center bg-[var(--color-accent-subtle)] text-[var(--color-primary)]">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 id={id} className="font-display font-bold text-xl md:text-2xl leading-tight">
                    {title}
                  </h3>
                  <p className="text-sm text-muted">{sub}</p>
                </div>
              </div>
              <ul aria-labelledby={id} className="space-y-3 list-none">
                {items.map((item) => (
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
          ))}
        </div>

        <div className="mt-10 md:mt-14">
          <h3
            id="carta-vis-loop"
            className="font-display font-bold text-xl md:text-2xl mb-5"
          >
            {t.cartaVisLoopTitle}
          </h3>
          <ol
            aria-labelledby="carta-vis-loop"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 list-none"
          >
            {loop.map((step, idx) => (
              <li
                key={step}
                className="flex items-center gap-4 bg-[var(--color-bg-alt)] border border-[var(--color-border)] rounded-xl p-4 md:p-5"
              >
                <span className="font-display font-bold text-2xl text-[var(--color-primary)] tabular-nums">
                  {idx + 1}
                </span>
                <span className="text-sm md:text-base font-medium">{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default CartaDigitalVisibilidadSection;
