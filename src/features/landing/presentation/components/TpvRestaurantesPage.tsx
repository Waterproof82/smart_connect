import React from "react";
import { Helmet } from "react-helmet-async";
import { RelatedServices } from "@shared/components/RelatedServices";
import { PageShell } from "@features/landing/presentation/components/PageShell";
import {
  PageHero,
  WhatsAppCta,
  ClosingCta,
} from "@shared/presentation/layout";
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
  const whatsappPhone = useWhatsappPhone();
  const solutionMeta = SOLUTIONS.find((s) => s.id === "tpv-restaurantes");
  const servicio = "TPV para restaurantes";

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

      <PageShell waMessage={t.waMsgTpv} servicio={servicio}>
        <PageHero
          title={t.tpvH1}
          lede={t.tpvIntro}
          actions={
            <WhatsAppCta
              label={t.tpvCtaButton}
              message={t.waMsgTpv}
              servicio={servicio}
            />
          }
        />

        <TpvModulesSection whatsappPhone={whatsappPhone} />

        <ClosingCta
          id="tpv-cta"
          title={t.tpvCtaTitle}
          label={t.tpvCtaButton}
          message={t.waMsgTpv}
          servicio={servicio}
        />
        <RelatedServices currentId="tpv-restaurantes" />
      </PageShell>
    </>
  );
};

export default TpvRestaurantesPage;
