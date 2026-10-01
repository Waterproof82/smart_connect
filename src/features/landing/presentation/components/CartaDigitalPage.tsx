import React from "react";
import { Helmet } from "react-helmet-async";
import { SiteFooter } from "@shared/components/SiteFooter";
import { RelatedServices } from "@shared/components/RelatedServices";
import { Navbar } from "@features/landing/presentation/components/Navbar";
import CartaDigitalSection from "@features/landing/presentation/components/CartaDigitalSection";
import {
  ServiceSchema,
  SeoFaqSchema,
  BreadcrumbListSchema,
} from "@shared/presentation/components/SeoSchema";
import { useCartaFaqGroup } from "@features/landing/presentation/components/HomeFaqSection";
import { useLanguage } from "@shared/context/LanguageContext";
import { useWhatsappPhone } from "@shared/hooks";
import { SOLUTIONS } from "@shared/config/solutions";

const ORG_URL = "https://digitalizatenerife.es";
const PAGE_URL = `${ORG_URL}/carta-digital`;
const PAGE_TITLE = "Carta Digital para Restaurantes | Digitaliza Tenerife";
const PAGE_DESCRIPTION =
  "Carta digital con pedidos en mesa y para recoger. Sin pagar comisión a Glovo: ahorra el 30 % del margen de cada pedido.";

/**
 * Standalone /carta-digital route. Template = TapReviewPage.tsx: own
 * <Helmet> + page-level JSON-LD + shared Navbar + section body + FAQ group.
 */
const CartaDigitalPage: React.FC = () => {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = React.useState(false);
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const whatsappPhone = useWhatsappPhone();
  const cartaFaqGroup = useCartaFaqGroup();
  const solutionMeta = SOLUTIONS.find((s) => s.id === "carta-digital");

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
          content="https://digitalizatenerife.es/og/carta-digital.png"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content="Carta digital: ahorra el 30 % que se lleva Glovo de cada pedido"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={PAGE_TITLE} />
        <meta name="twitter:description" content={PAGE_DESCRIPTION} />
        <meta
          name="twitter:image"
          content="https://digitalizatenerife.es/og/carta-digital.png"
        />
      </Helmet>

      <ServiceSchema
        name={solutionMeta?.serviceValue ?? "Carta Digital Premium"}
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
          { name: "Carta Digital", url: PAGE_URL },
        ]}
      />
      <SeoFaqSchema
        faqs={cartaFaqGroup.items.map((item) => ({
          question: item.q,
          answer: item.a,
        }))}
      />

      <div className="min-h-screen bg-base text-default">
        <div
          ref={sentinelRef}
          className="absolute top-[50px] h-px w-px"
          aria-hidden="true"
        />
        <Navbar scrolled={scrolled} />

        <main id="main" aria-label="Contenido principal">
          <h1 className="sr-only">{t.cartaPageH1}</h1>
          <CartaDigitalSection
            id="carta-digital"
            whatsappPhone={whatsappPhone}
          />

          <section
            aria-label={cartaFaqGroup.title}
            className="max-w-3xl mx-auto px-4 md:px-6 py-16 md:py-24"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black leading-[1.15] font-display mb-10 md:mb-14 text-center">
              {cartaFaqGroup.title}
            </h2>
            <div className="space-y-3">
              {cartaFaqGroup.items.map((faq) => (
                <details
                  key={faq.q}
                  className="group border border-[var(--color-border)] rounded-lg bg-[var(--color-surface)] overflow-hidden"
                >
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-semibold text-base select-none hover:bg-[var(--color-accent-subtle)] transition-colors duration-150">
                    {faq.q}
                    <span className="ml-4 shrink-0 text-[var(--color-primary)] group-open:rotate-45 transition-transform duration-200">
                      +
                    </span>
                  </summary>
                  <p className="px-5 pb-4 pt-2 text-sm text-muted leading-relaxed">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </section>
          <RelatedServices currentId="carta-digital" />
        </main>

        <SiteFooter />
      </div>
    </>
  );
};

export default CartaDigitalPage;
