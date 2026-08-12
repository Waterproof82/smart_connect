/**
 * DeliveryTakeawaySection — bespoke module section for the
 * "delivery-takeaway" entry of TPV_MODULES (design.md D1/D4). The "cero
 * comisiones" claim reuses the site's existing truthful 0%-commissions
 * stat (see App.tsx stat strip) rather than inventing a new number.
 * Real self-hosted photo via TpvModuleFigure and a per-module OKLCH accent
 * (design.md D3/D5/D6 — visual redesign PR3).
 */
import React from "react";
import { Bike, MapPin, PackageCheck, Percent } from "lucide-react";
import { useLanguage } from "@shared/context/LanguageContext";
import { accentStyle } from "@shared/config/accents";
import type { TpvModuleSectionProps } from "./TpvModuleSections";
import TpvModuleFigure from "./TpvModuleFigure";

const BULLET_ICONS = [Bike, MapPin, PackageCheck, Percent];

const DeliveryTakeawaySection: React.FC<TpvModuleSectionProps> = ({
  whatsappPhone,
}) => {
  const { t } = useLanguage();

  const bullets = [
    {
      title: t.deliveryTakeawayBullet1Title,
      desc: t.deliveryTakeawayBullet1Desc,
    },
    {
      title: t.deliveryTakeawayBullet2Title,
      desc: t.deliveryTakeawayBullet2Desc,
    },
    {
      title: t.deliveryTakeawayBullet3Title,
      desc: t.deliveryTakeawayBullet3Desc,
    },
    {
      title: t.deliveryTakeawayBullet4Title,
      desc: t.deliveryTakeawayBullet4Desc,
    },
  ];

  const ctaHref = whatsappPhone ? `https://wa.me/${whatsappPhone}` : "#contacto";

  return (
    <section
      id="delivery-takeaway"
      aria-labelledby="delivery-takeaway-title"
      className="py-16 md:py-24 bg-[var(--color-bg-alt)]"
      style={accentStyle("--color-icon-rose")}
    >
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="text-xs font-semibold tracking-wider uppercase text-[var(--color-primary)] mb-3">
          {t.deliveryTakeawayEyebrow}
        </div>
        <h2
          id="delivery-takeaway-title"
          className="text-3xl md:text-4xl font-bold mb-4 text-default max-w-2xl"
        >
          {t.deliveryTakeawayTitle}
        </h2>
        <p className="text-muted leading-relaxed mb-10 max-w-2xl">
          {t.deliveryTakeawayDesc}
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
            src="/assets/tpv/delivery-takeaway.webp"
            alt={t.deliveryTakeawayFigureAlt}
            width={1400}
            height={1050}
          />
        </div>

        <a
          href={ctaHref}
          target={whatsappPhone ? "_blank" : undefined}
          rel={whatsappPhone ? "noopener noreferrer" : undefined}
          className="inline-flex items-center gap-2 text-sm font-bold text-[var(--color-primary)] hover:underline mt-10"
        >
          {t.deliveryTakeawayCtaLabel}
        </a>
      </div>
    </section>
  );
};

export default DeliveryTakeawaySection;
