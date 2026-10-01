import React from "react";
import { SiteFooter } from "@shared/components/SiteFooter";
import { MobileWhatsAppBar } from "@shared/presentation/layout";
import { useLanguage } from "@shared/context/LanguageContext";
import { Navbar } from "./Navbar";

interface PageShellProps {
  children: React.ReactNode;
  /** Pre-filled message for the sticky mobile WhatsApp bar. */
  waMessage?: string;
  /** Service forwarded to /#contacto when no WhatsApp phone is configured. */
  servicio?: string;
  /** Floating widgets rendered after <main> (e.g. the chatbot). */
  extras?: React.ReactNode;
  /** Set false on pages that must stay free of the sticky bar (404). */
  showWhatsAppBar?: boolean;
}

/**
 * Shared frame for every public route (design.md § What pages MUST share):
 * skip link, fixed nav, <main id="main">, footer and the mobile WhatsApp bar.
 */
export const PageShell: React.FC<PageShellProps> = ({
  children,
  waMessage,
  servicio,
  extras,
  showWhatsAppBar = true,
}) => {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = React.useState(false);
  const sentinelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-base text-default">
      <div
        ref={sentinelRef}
        className="absolute top-[50px] h-px w-px"
        aria-hidden="true"
      />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:bg-[var(--color-accent)] focus:text-[var(--color-on-accent)] focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-bold"
      >
        {t.skipLink}
      </a>
      <Navbar scrolled={scrolled} />
      <main id="main" aria-label="Contenido principal">
        {children}
      </main>
      {extras}
      <SiteFooter />
      {showWhatsAppBar && (
        <>
          <div className="ds-wa-bar-spacer" aria-hidden="true" />
          <MobileWhatsAppBar message={waMessage} servicio={servicio} />
        </>
      )}
    </div>
  );
};

export default PageShell;
