import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@shared/context/LanguageContext";
import { SOLUTIONS } from "@shared/config/solutions";
import type { Translation } from "@shared/context/LanguageContext";
import { WhatsAppCta } from "@shared/presentation/layout";

const linkClass =
  "hover:text-[var(--color-text)] focus-visible:text-[var(--color-text)] focus-visible:underline transition-colors";

/**
 * Site-wide footer (design.md § Footer — Ft5 Statement): a closing line +
 * the WhatsApp action, then the internal-linking map that links every
 * product/service, company and legal page from every route
 * (docs/SEO_PROTOCOL.md §3 — keep these links).
 */
export const SiteFooter: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-[var(--color-bg-alt)] border-t border-[var(--color-border)] pt-[var(--space-3xl)] pb-[var(--space-lg)]">
      <div className="ds-container">
        <div className="grid gap-[var(--space-lg)] pb-[var(--space-2xl)] mb-[var(--space-xl)] border-b border-[var(--color-border)] md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <p className="font-display font-bold text-[length:var(--text-display-s)] leading-[1.05] tracking-[-0.02em] text-default m-0 max-w-[22ch] [overflow-wrap:anywhere] [text-wrap:balance]">
            {t.footerStatement}
          </p>
          <WhatsAppCta />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
          <div>
            <Link to="/" className="font-display font-bold text-xl text-default">
              Digitaliza{" "}
              <span className="text-[var(--color-primary)]">Tenerife</span>
            </Link>
            <p className="text-muted text-sm mt-3 leading-relaxed">
              {t.footerTagline}
            </p>
          </div>
          <nav aria-label={t.footerServicesTitle}>
            <h2 className="text-sm font-bold text-muted uppercase tracking-wider mb-4">
              {t.footerServicesTitle}
            </h2>
            <ul className="space-y-2 text-sm text-muted">
              {SOLUTIONS.map((solution) => (
                <li key={solution.id}>
                  <Link to={solution.href} className={linkClass}>
                    {t[solution.titleKey as keyof Translation] as string}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label={t.footerCompanyTitle}>
            <h2 className="text-sm font-bold text-muted uppercase tracking-wider mb-4">
              {t.footerCompanyTitle}
            </h2>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link to="/about" className={linkClass}>
                  {t.footerAbout}
                </Link>
              </li>
              <li>
                <Link to="/#contacto" className={linkClass}>
                  {t.footerNavContacto}
                </Link>
              </li>
            </ul>
          </nav>
          <nav aria-label={t.footerLegalTitle}>
            <h2 className="text-sm font-bold text-muted uppercase tracking-wider mb-4">
              {t.footerLegalTitle}
            </h2>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link to="/legal/aviso" className={linkClass}>
                  {t.footerLegalAviso}
                </Link>
              </li>
              <li>
                <Link to="/legal/privacidad" className={linkClass}>
                  {t.footerLegalPrivacidad}
                </Link>
              </li>
              <li>
                <Link to="/legal/cookies" className={linkClass}>
                  {t.footerLegalCookies}
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="border-t border-[var(--color-border)] pt-[var(--space-md)] text-muted text-sm">
          <p>{t.footerCopyright}</p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
