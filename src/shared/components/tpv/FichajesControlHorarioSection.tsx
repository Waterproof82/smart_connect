/**
 * FichajesControlHorarioSection — bespoke module section for the
 * "fichajes-control-horario" entry of TPV_MODULES (design.md D1/D4).
 * Real self-hosted photo via TpvModuleFigure and a per-module OKLCH accent
 * (design.md D3/D5/D6 — visual redesign PR3).
 */
import React from "react";
import { Clock, UserCheck, BarChart3, FileCheck2 } from "lucide-react";
import { useLanguage } from "@shared/context/LanguageContext";
import { accentStyle } from "@shared/config/accents";
import type { TpvModuleSectionProps } from "./TpvModuleSections";
import TpvModuleFigure from "./TpvModuleFigure";

const BULLET_ICONS = [Clock, UserCheck, BarChart3, FileCheck2];

const FichajesControlHorarioSection: React.FC<TpvModuleSectionProps> = ({
  whatsappPhone,
}) => {
  const { t } = useLanguage();

  const bullets = [
    { title: t.fichajesBullet1Title, desc: t.fichajesBullet1Desc },
    { title: t.fichajesBullet2Title, desc: t.fichajesBullet2Desc },
    { title: t.fichajesBullet3Title, desc: t.fichajesBullet3Desc },
    { title: t.fichajesBullet4Title, desc: t.fichajesBullet4Desc },
  ];

  const ctaHref = whatsappPhone ? `https://wa.me/${whatsappPhone}` : "#contacto";

  return (
    <section
      id="fichajes-control-horario"
      aria-labelledby="fichajes-control-horario-title"
      className="py-16 md:py-24 bg-[var(--color-bg)]"
      style={accentStyle("--color-icon-blue")}
    >
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="text-xs font-semibold tracking-wider uppercase text-[var(--color-primary)] mb-3">
          {t.fichajesEyebrow}
        </div>
        <h2
          id="fichajes-control-horario-title"
          className="text-3xl md:text-4xl font-bold mb-4 text-default max-w-2xl"
        >
          {t.fichajesTitle}
        </h2>
        <p className="text-muted leading-relaxed mb-10 max-w-2xl">
          {t.fichajesDesc}
        </p>

        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6 list-none">
            {bullets.map((bullet, idx) => {
              const Icon = BULLET_ICONS[idx];
              return (
                <li key={bullet.title} className="flex gap-4">
                  <div className="w-11 h-11 shrink-0 rounded-xl flex items-center justify-center text-[color:var(--tpv-accent)] tpv-accent-chip">
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

          <TpvModuleFigure
            src="/assets/tpv/fichajes-control-horario.webp"
            alt={t.fichajesFigureAlt}
            width={936}
            height={702}
          />
        </div>

        <a
          href={ctaHref}
          target={whatsappPhone ? "_blank" : undefined}
          rel={whatsappPhone ? "noopener noreferrer" : undefined}
          className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-primary)] hover:underline mt-10"
        >
          {t.fichajesCtaLabel}
        </a>
      </div>
    </section>
  );
};

export default FichajesControlHorarioSection;
