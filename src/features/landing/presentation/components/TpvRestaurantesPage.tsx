import React from "react";
import { Helmet } from "react-helmet-async";
import { SiteFooter } from "@shared/components/SiteFooter";
import { RelatedServices } from "@shared/components/RelatedServices";
import { Navbar } from "@features/landing/presentation/components/Navbar";
import TpvModulesSection from "@shared/components/tpv/TpvModulesSection";
import {
  ServiceSchema,
  BreadcrumbListSchema,
} from "@shared/presentation/components/SeoSchema";
import { useLanguage } from "@shared/context/LanguageContext";
import { useWhatsappPhone } from "@shared/hooks";
import { SOLUTIONS } from "@shared/config/solutions";

const ORG_URL = "https://digitalizatenerife.es";
const PAGE_URL = `${ORG_URL}/tpv-restaurantes`;
const PAGE_TITLE = "TPV para restaurantes: 13 módulos | Digitaliza Tenerife";
const PAGE_DESCRIPTION =
  "TPV para restaurantes y bares en Canarias: cobro, comandero, KDS de cocina, reservas, stock, alérgenos y más. 13 módulos integrados en un solo sistema.";

/**
 * Standalone /tpv-restaurantes route — the 13 TPV_MODULES sections moved
 * off the home page. TpvModulesSection is imported eagerly (not lazy) so
 * the prerendered HTML contains the module content.
 */
const TpvRestaurantesPage: React.FC = () => {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = React.useState(false);
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const whatsappPhone = useWhatsappPhone();
  const solutionMeta = SOLUTIONS.find((s) => s.id === "tpv-restaurantes");
  const ctaHref = whatsappPhone
    ? `https://wa.me/${whatsappPhone}`
    : "/#contacto?servicio=TPV%20para%20restaurantes";

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
    <>
      <Helmet>
        <title>{PAGE_TITLE}</title>
        <meta name="description" content={PAGE_DESCRIPTION} />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:locale" content="es_ES" />
        <meta property="og:site_name" content="Digitaliza Tenerife" />
        <meta property="og:title" content={PAGE_TITLE} />
        <meta property="og:description" content={PAGE_DESCRIPTION} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={PAGE_URL} />
        <meta
          property="og:image"
          content="https://digitalizatenerife.es/og/tpv-restaurantes.png"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content="TPV para restaurantes con 13 módulos"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={PAGE_TITLE} />
        <meta name="twitter:description" content={PAGE_DESCRIPTION} />
        <meta
          name="twitter:image"
          content="https://digitalizatenerife.es/og/tpv-restaurantes.png"
        />
      </Helmet>

      <ServiceSchema
        name={solutionMeta?.serviceValue ?? "TPV para restaurantes"}
        description={solutionMeta?.jsonLd.description ?? PAGE_DESCRIPTION}
        url={PAGE_URL}
        providerName="Digitaliza Tenerife"
        providerUrl={ORG_URL}
        providerLogoUrl={`${ORG_URL}/icon.png`}
        areaServed={solutionMeta?.jsonLd.areaServed}
        serviceType={solutionMeta?.jsonLd.serviceType}
      />
      <BreadcrumbListSchema
        breadcrumbs={[
          { name: "Inicio", url: `${ORG_URL}/` },
          { name: "TPV para restaurantes", url: PAGE_URL },
        ]}
      />

      <div className="min-h-screen bg-base text-default">
        <div
          ref={sentinelRef}
          className="absolute top-[50px] h-px w-px"
          aria-hidden="true"
        />
        <Navbar scrolled={scrolled} />

        <main id="main" aria-label="Contenido principal">
          <section className="pt-32 pb-12 md:pt-40 md:pb-16">
            <div className="container mx-auto px-4 md:px-6 max-w-4xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-[1.15] font-display mb-6">
                {t.tpvH1}
              </h1>
              <p className="text-lg text-muted leading-relaxed max-w-2xl mb-10">
                {t.tpvIntro}
              </p>
              <a
                href={ctaHref}
                className="inline-flex items-center justify-center min-h-[48px] px-8 py-3 rounded-xl font-bold bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-on-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] transition-colors"
              >
                {t.tpvCtaButton}
              </a>
            </div>
          </section>

          <TpvModulesSection whatsappPhone={whatsappPhone} />

          <section className="py-16 bg-[var(--color-bg-alt)] text-center">
            <h2 className="text-2xl md:text-3xl font-black font-display mb-6 px-4">
              {t.tpvCtaTitle}
            </h2>
            <a
              href={ctaHref}
              className="inline-flex items-center justify-center min-h-[48px] px-8 py-3 rounded-xl font-bold bg-[var(--color-accent)] hover:bg-[var(--color-accent-hover)] text-[var(--color-on-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] transition-colors"
            >
              {t.tpvCtaButton}
            </a>
          </section>
          <RelatedServices currentId="tpv-restaurantes" />
        </main>

        <SiteFooter />
      </div>
    </>
  );
};

export default TpvRestaurantesPage;
