import React from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "@shared/context/LanguageContext";

const CartaDigitalFooter: React.FC = () => {
  const { t } = useLanguage();
  const { hash } = useLocation();

  const linkClass = "hover:text-[var(--color-text)] transition-colors";
  const isActive = (href: string) =>
    href === "/" ? !hash : hash === href.replace("/#", "#");

  return (
    <footer className="bg-[var(--color-bg-alt)] border-t border-[var(--color-border)] pt-12 md:pt-16 pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-12">
          <div>
            <span className="font-bold text-xl text-default">
              SmartConnect{" "}
              <span className="text-[var(--color-primary)]">AI</span>
            </span>
            <p className="text-muted text-sm mt-3 leading-relaxed">
              {t.footerTagline}
            </p>
          </div>
          <nav aria-label="Navegación del footer">
            <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-4">
              {t.footerNavTitle}
            </h3>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <a
                  href="/"
                  className={`${linkClass} ${isActive("/") ? "text-[var(--color-text)] font-medium" : ""}`}
                  aria-current={isActive("/") ? "page" : undefined}
                >
                  {t.footerNavInicio}
                </a>
              </li>
              <li>
                <a
                  href="/#soluciones"
                  className={`${linkClass} ${isActive("/#soluciones") ? "text-[var(--color-text)] font-medium" : ""}`}
                  aria-current={isActive("/#soluciones") ? "page" : undefined}
                >
                  {t.footerNavSoluciones}
                </a>
              </li>
              <li>
                <a
                  href="/#exito"
                  className={`${linkClass} ${isActive("/#exito") ? "text-[var(--color-text)] font-medium" : ""}`}
                  aria-current={isActive("/#exito") ? "page" : undefined}
                >
                  {t.footerNavExito}
                </a>
              </li>
              <li>
                <a
                  href="/#contacto"
                  className={`${linkClass} ${isActive("/#contacto") ? "text-[var(--color-text)] font-medium" : ""}`}
                  aria-current={isActive("/#contacto") ? "page" : undefined}
                >
                  {t.footerNavContacto}
                </a>
              </li>
            </ul>
          </nav>
          <div>
            <h3 className="text-sm font-bold text-muted uppercase tracking-wider mb-4">
              {t.footerLegalTitle}
            </h3>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <a
                  href="mailto:legal@smartconnect.ai"
                  className="hover:text-[var(--color-text)] transition-colors"
                >
                  {t.footerLegalAviso}
                </a>
              </li>
              <li>
                <a
                  href="mailto:legal@smartconnect.ai"
                  className="hover:text-[var(--color-text)] transition-colors"
                >
                  {t.footerLegalPrivacidad}
                </a>
              </li>
              <li>
                <a
                  href="mailto:legal@smartconnect.ai"
                  className="hover:text-[var(--color-text)] transition-colors"
                >
                  {t.footerLegalCookies}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[var(--color-border)] pt-6 md:pt-8 text-center text-muted text-sm">
          <p>&copy; {t.footerCopyright}</p>
        </div>
      </div>
    </footer>
  );
};

export default CartaDigitalFooter;
