/**
 * KdsCocinaSection — bespoke module section for the "kds-cocina" entry of
 * TPV_MODULES (design.md D1/D4).
 */
import React from "react";
import { ChefHat, Timer, ListChecks, Bell } from "lucide-react";
import { useLanguage } from "@shared/context/LanguageContext";
import type { TpvModuleSectionProps } from "./TpvModuleSections";

const BULLET_ICONS = [ChefHat, Timer, ListChecks, Bell];

const KdsCocinaSection: React.FC<TpvModuleSectionProps> = ({
  whatsappPhone,
}) => {
  const { t } = useLanguage();

  const bullets = [
    { title: t.kdsCocinaBullet1Title, desc: t.kdsCocinaBullet1Desc },
    { title: t.kdsCocinaBullet2Title, desc: t.kdsCocinaBullet2Desc },
    { title: t.kdsCocinaBullet3Title, desc: t.kdsCocinaBullet3Desc },
    { title: t.kdsCocinaBullet4Title, desc: t.kdsCocinaBullet4Desc },
  ];

  const ctaHref = whatsappPhone ? `https://wa.me/${whatsappPhone}` : "#contacto";

  return (
    <section
      id="kds-cocina"
      aria-labelledby="kds-cocina-title"
      className="py-16 md:py-24 bg-[var(--color-bg)]"
    >
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="text-xs font-semibold tracking-wider uppercase text-[var(--color-primary)] mb-3">
          {t.kdsCocinaEyebrow}
        </div>
        <h2
          id="kds-cocina-title"
          className="text-3xl md:text-4xl font-bold mb-4 text-default max-w-2xl"
        >
          {t.kdsCocinaTitle}
        </h2>
        <p className="text-muted leading-relaxed mb-10 max-w-2xl">
          {t.kdsCocinaDesc}
        </p>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10 list-none">
          {bullets.map((bullet, idx) => {
            const Icon = BULLET_ICONS[idx];
            return (
              <li key={bullet.title} className="flex gap-4">
                <div className="w-11 h-11 shrink-0 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-icon-emerald)]">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-bold text-sm mb-1 text-default">
                    {bullet.title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">
                    {bullet.desc}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>

        <a
          href={ctaHref}
          target={whatsappPhone ? "_blank" : undefined}
          rel={whatsappPhone ? "noopener noreferrer" : undefined}
          className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-primary)] hover:underline"
        >
          {t.kdsCocinaCtaLabel}
        </a>
      </div>
    </section>
  );
};

export default KdsCocinaSection;
