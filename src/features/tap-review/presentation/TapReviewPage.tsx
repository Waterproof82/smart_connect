import React from "react";
import { Helmet } from "react-helmet-async";
import { RelatedServices } from "@shared/components/RelatedServices";
import { PageShell } from "@features/landing/presentation/components/PageShell";
import { Section, FaqList } from "@shared/presentation/layout";
import { useLanguage } from "@shared/context/LanguageContext";
import {
  ServiceSchema,
  SeoFaqSchema,
  BreadcrumbListSchema,
} from "@shared/presentation/components/SeoSchema";
import { useNfcFaqGroup } from "@features/landing/presentation/components/HomeFaqSection";
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
  const nfcFaqGroup = useNfcFaqGroup();

  const solutionMeta = SOLUTIONS.find((s) => s.id === "tarjetas-nfc");

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
        <meta
          property="og:image"
          content="https://digitalizatenerife.es/og/tarjetas-nfc.png"
        />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content="Tarjetas NFC para multiplicar tus reseñas en Google"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={PAGE_TITLE} />
        <meta name="twitter:description" content={PAGE_DESCRIPTION} />
        <meta
          name="twitter:image"
          content="https://digitalizatenerife.es/og/tarjetas-nfc.png"
        />
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

      <PageShell waMessage={t.waMsgNfc} servicio="Tarjetas NFC">
        {/* H1 wording frozen (SEO_PROTOCOL P-13) — do not change. */}
        <h1 className="sr-only">{PAGE_H1}</h1>
        <TapReviewSection />

        <Section id="faq" width="prose" title={nfcFaqGroup.title}>
          <FaqList items={nfcFaqGroup.items} />
        </Section>
        <RelatedServices currentId="tarjetas-nfc" />
      </PageShell>
    </>
  );
};

export default TapReviewPage;
