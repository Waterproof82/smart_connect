/**
 * MultiIvaIgicSection — bespoke module section for the "multi-iva-igic"
 * entry of TPV_MODULES (design.md D1/D4). Framed generally as legally
 * compliant multi-rate tax handling (IVA/IGIC) — no specific regulation
 * article numbers are cited, per session guard. Real self-hosted photo via
 * TpvModuleFigure and a per-module OKLCH accent (design.md D3/D5/D6 —
 * visual redesign PR3).
 */
import React from "react";
import { Scale, Receipt, FileCheck2, ShieldCheck } from "lucide-react";
import { useLanguage } from "@shared/context/LanguageContext";
import { accentStyle } from "@shared/config/accents";
import type { TpvModuleSectionProps } from "./TpvModuleSections";
import TpvModuleFigure from "./TpvModuleFigure";

const BULLET_ICONS = [Scale, Receipt, FileCheck2, ShieldCheck];

const MultiIvaIgicSection: React.FC<TpvModuleSectionProps> = ({
  whatsappPhone,
}) => {
  const { t } = useLanguage();

  const bullets = [
    { title: t.multiIvaIgicBullet1Title, desc: t.multiIvaIgicBullet1Desc },
    { title: t.multiIvaIgicBullet2Title, desc: t.multiIvaIgicBullet2Desc },
    { title: t.multiIvaIgicBullet3Title, desc: t.multiIvaIgicBullet3Desc },
    { title: t.multiIvaIgicBullet4Title, desc: t.multiIvaIgicBullet4Desc },
  ];

  const ctaHref = whatsappPhone ? `https://wa.me/${whatsappPhone}` : "#contacto";

  return (
    <section
      id="multi-iva-igic"
      aria-labelledby="multi-iva-igic-title"
      className="py-16 md:py-24 bg-[var(--color-bg-alt)]"
      style={accentStyle("--color-icon-indigo")}
    >
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="text-xs font-semibold tracking-wider uppercase text-[var(--color-primary)] mb-3">
          {t.multiIvaIgicEyebrow}
        </div>
        <h2
          id="multi-iva-igic-title"
          className="text-3xl md:text-4xl font-bold mb-4 text-default max-w-2xl"
        >
          {t.multiIvaIgicTitle}
        </h2>
        <p className="text-muted leading-relaxed mb-10 max-w-2xl">
          {t.multiIvaIgicDesc}
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
            src="/assets/tpv/multi-iva-igic.webp"
            alt={t.multiIvaIgicFigureAlt}
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
          {t.multiIvaIgicCtaLabel}
        </a>
      </div>
    </section>
  );
};

export default MultiIvaIgicSection;
