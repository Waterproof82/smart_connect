/**
 * StockInventarioSection — bespoke module section for the "stock-inventario"
 * entry of TPV_MODULES (design.md D1/D4). Real self-hosted photo via
 * TpvModuleFigure and a per-module OKLCH accent (design.md D3/D5/D6 —
 * visual redesign PR3).
 */
import React from "react";
import { Package, Trash2, AlertTriangle, BarChart3 } from "lucide-react";
import { useLanguage } from "@shared/context/LanguageContext";
import { buildWhatsappLink } from "@shared/utils/whatsappLink";
import { accentStyle } from "@shared/config/accents";
import type { TpvModuleSectionProps } from "./TpvModuleSections";
import TpvModuleFigure from "./TpvModuleFigure";

const BULLET_ICONS = [Package, AlertTriangle, Trash2, BarChart3];

const StockInventarioSection: React.FC<TpvModuleSectionProps> = ({
  whatsappPhone,
}) => {
  const { t } = useLanguage();

  const bullets = [
    { title: t.stockInventarioBullet1Title, desc: t.stockInventarioBullet1Desc },
    { title: t.stockInventarioBullet2Title, desc: t.stockInventarioBullet2Desc },
    { title: t.stockInventarioBullet3Title, desc: t.stockInventarioBullet3Desc },
    { title: t.stockInventarioBullet4Title, desc: t.stockInventarioBullet4Desc },
  ];

  const cta = buildWhatsappLink(whatsappPhone ?? "", {
    message: t.waMsgTpv,
    servicio: "TPV para restaurantes",
  });

  return (
    <section
      id="stock-inventario"
      aria-labelledby="stock-inventario-title"
      className="ds-section bg-[var(--color-bg)]"
      style={accentStyle("--color-icon-green")}
    >
      <div className="ds-container">
        <div className="ds-kicker mb-3">
          {t.stockInventarioEyebrow}
        </div>
        <h2
          id="stock-inventario-title"
          className="ds-h2 mb-4 text-default max-w-2xl"
        >
          {t.stockInventarioTitle}
        </h2>
        <p className="text-muted leading-relaxed mb-10 max-w-2xl">
          {t.stockInventarioDesc}
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
            src="/assets/tpv/stock-inventario.webp"
            alt={t.stockInventarioFigureAlt}
            width={936}
            height={702}
          />
        </div>

        <a
          href={cta.href}
          target={cta.external ? "_blank" : undefined}
          rel={cta.external ? "noopener noreferrer" : undefined}
          className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-primary)] hover:underline mt-10"
        >
          {t.stockInventarioCtaLabel}
        </a>
      </div>
    </section>
  );
};

export default StockInventarioSection;
