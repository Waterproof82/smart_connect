import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@shared/context/LanguageContext";
import { SOLUTIONS } from "@shared/config/solutions";
import type { Translation } from "@shared/context/LanguageContext";

const linkClass =
  "hover:text-[var(--color-text)] focus-visible:text-[var(--color-text)] focus-visible:underline transition-colors";

/**
 * Site-wide footer: links every product/service page, company pages and
 * legal pages from every route (internal-linking map, docs/SEO_PROTOCOL.md §3).
 */
export const SiteFooter: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-[var(--color-bg-alt)] border-t border-[var(--color-border)] pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 mb-12">
          <div>
            <Link to="/" className="font-bold text-xl text-default">
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
        <div className="border-t border-[var(--color-border)] pt-8 text-center text-muted text-sm">
          <p>{t.footerCopyright}</p>
        </div>
      </div>
    </footer>
  );
};

export default SiteFooter;
