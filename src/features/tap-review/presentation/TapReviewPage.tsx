import React from "react";
import { Helmet } from "react-helmet-async";
import { Navbar } from "@features/landing/presentation/components/Navbar";
import {
  ServiceSchema,
  SeoFaqSchema,
  BreadcrumbListSchema,
} from "@shared/presentation/components/SeoSchema";
import {
  useNfcFaqGroup,
} from "@features/landing/presentation/components/HomeFaqSection";
import { useLanguage } from "@shared/context/LanguageContext";
import { useWhatsappPhone } from "@shared/hooks";
import { SOLUTIONS } from "@shared/config/solutions";
import { TapReviewSection } from "./TapReviewSection";

const ORG_URL = "https://digitalizatenerife.es";
const PAGE_URL = `${ORG_URL}/tarjetas-nfc`;
const PAGE_TITLE = "Tarjetas NFC Tap-to-Review | Digitaliza Tenerife";
// Deliberately distinct from PAGE_TITLE: the <title> carries the brand
// suffix for the SERP snippet, the H1 should read as a natural sentence
// for users and crawlers instead of repeating the title verbatim.
const PAGE_H1 =
  "Tarjetas NFC Tap-to-Review para multiplicar tus reseñas de Google";
const PAGE_DESCRIPTION =
  "Tarjetas NFC para que los clientes dejen reseñas en Google e Instagram con un solo toque. Multiplica tus reseñas sin apps ni fricción.";

/**
 * Standalone /tarjetas-nfc route — un-merged from home in PR3.
 * Template = AboutPage.tsx: own <Helmet> + page-level JSON-LD (reused
 * schema components, not hand-rolled) + shared Navbar + TapReviewSection
 * body + its own NFC FAQ group.
 */
const TapReviewPage: React.FC = () => {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = React.useState(false);
  const sentinelRef = React.useRef<HTMLDivElement>(null);
  const whatsappPhone = useWhatsappPhone();
  const nfcFaqGroup = useNfcFaqGroup();

  const solutionMeta = SOLUTIONS.find((s) => s.id === "tarjetas-nfc");

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
        <link rel="alternate" hrefLang="es" href={PAGE_URL} />
        <link rel="alternate" hrefLang="x-default" href={PAGE_URL} />
        <meta property="og:title" content={PAGE_TITLE} />
        <meta property="og:description" content={PAGE_DESCRIPTION} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:image" content={`${ORG_URL}/icon.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={PAGE_TITLE} />
        <meta name="twitter:description" content={PAGE_DESCRIPTION} />
        <meta name="twitter:image" content={`${ORG_URL}/icon.png`} />
      </Helmet>

      <ServiceSchema
        name={solutionMeta?.serviceValue ?? "Tarjetas NFC Reseñas"}
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
          { name: "Tarjetas NFC", url: PAGE_URL },
        ]}
      />
      <SeoFaqSchema
        faqs={nfcFaqGroup.items.map((item) => ({
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
          <section className="pt-20">
            <h1 className="sr-only">{PAGE_H1}</h1>
            <TapReviewSection whatsappPhone={whatsappPhone} />
          </section>

          <section
            aria-label={nfcFaqGroup.title}
            className="max-w-3xl mx-auto px-4 md:px-6 py-16 md:py-24"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black leading-[1.15] font-display mb-10 md:mb-14 text-center">
              {nfcFaqGroup.title}
            </h2>
            <div className="space-y-3">
              {nfcFaqGroup.items.map((faq) => (
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
        </main>

        <footer className="bg-[var(--color-bg-alt)] border-t border-[var(--color-border)] py-8">
          <div className="container mx-auto px-6 text-center text-muted text-sm">
            <p>&copy; {t.footerCopyright}</p>
          </div>
        </footer>
      </div>
    </>
  );
};

export default TapReviewPage;
