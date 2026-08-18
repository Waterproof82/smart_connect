/**
 * RbacRolesSection — bespoke module section for the "rbac-roles" entry of
 * TPV_MODULES (design.md D1/D4). Real self-hosted photo via TpvModuleFigure
 * and a per-module OKLCH accent (design.md D3/D5/D6 — visual redesign PR4).
 */
import React from "react";
import { ShieldCheck, Lock, History, UserPlus } from "lucide-react";
import { useLanguage } from "@shared/context/LanguageContext";
import { accentStyle } from "@shared/config/accents";
import type { TpvModuleSectionProps } from "./TpvModuleSections";
import TpvModuleFigure from "./TpvModuleFigure";

const BULLET_ICONS = [ShieldCheck, Lock, History, UserPlus];

const RbacRolesSection: React.FC<TpvModuleSectionProps> = ({
  whatsappPhone,
}) => {
  const { t } = useLanguage();

  const bullets = [
    { title: t.rbacRolesBullet1Title, desc: t.rbacRolesBullet1Desc },
    { title: t.rbacRolesBullet2Title, desc: t.rbacRolesBullet2Desc },
    { title: t.rbacRolesBullet3Title, desc: t.rbacRolesBullet3Desc },
    { title: t.rbacRolesBullet4Title, desc: t.rbacRolesBullet4Desc },
  ];

  const ctaHref = whatsappPhone ? `https://wa.me/${whatsappPhone}` : "#contacto";

  return (
    <section
      id="rbac-roles"
      aria-labelledby="rbac-roles-title"
      className="py-16 md:py-24 bg-[var(--color-bg)]"
      style={accentStyle("--color-icon-orange")}
    >
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="text-xs font-semibold tracking-wider uppercase text-[var(--color-primary)] mb-3">
          {t.rbacRolesEyebrow}
        </div>
        <h2
          id="rbac-roles-title"
          className="text-3xl md:text-4xl font-bold mb-4 text-default max-w-2xl"
        >
          {t.rbacRolesTitle}
        </h2>
        <p className="text-muted leading-relaxed mb-10 max-w-2xl">
          {t.rbacRolesDesc}
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
            src="/assets/tpv/rbac-roles.webp"
            alt={t.rbacRolesFigureAlt}
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
          {t.rbacRolesCtaLabel}
        </a>
      </div>
    </section>
  );
};

export default RbacRolesSection;
