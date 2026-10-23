import React from "react";
import { Helmet } from "react-helmet-async";
import { RelatedServices } from "@shared/components/RelatedServices";
import { PageShell } from "@features/landing/presentation/components/PageShell";
import {
  PageHero,
  WhatsAppCta,
  ClosingCta,
  Section,
  FaqList,
} from "@shared/presentation/layout";
import TpvModulesSection from "@shared/components/tpv/TpvModulesSection";
import {
  ServiceSchema,
  BreadcrumbListSchema,
  SeoFaqSchema,
} from "@shared/presentation/components/SeoSchema";
import { useLanguage } from "@shared/context/LanguageContext";
import { useWhatsappPhone } from "@shared/hooks";
import { SOLUTIONS } from "@shared/config/solutions";

const ORG_URL = "https://digitalizatenerife.es";
const PAGE_URL = `${ORG_URL}/tpv-restaurantes`;
const PAGE_TITLE =
  "TPV táctil para restaurantes en Tenerife | Digitaliza Tenerife";
const PAGE_DESCRIPTION =
  "TPV táctil en Tenerife y Canarias para restaurantes, pizzerías, bares y comercios: cobro, comandero, cocina, reservas, stock y alérgenos. 13 módulos.";

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
  const faqs = [
    { question: t.tpvFaqQ1, answer: t.tpvFaqA1 },
    { question: t.tpvFaqQ2, answer: t.tpvFaqA2 },
    { question: t.tpvFaqQ3, answer: t.tpvFaqA3 },
    { question: t.tpvFaqQ4, answer: t.tpvFaqA4 },
  ];
  const sectors = [
    { title: t.tpvSectorRestTitle, desc: t.tpvSectorRestDesc },
    { title: t.tpvSectorPizzaTitle, desc: t.tpvSectorPizzaDesc },
    { title: t.tpvSectorBarTitle, desc: t.tpvSectorBarDesc },
    { title: t.tpvSectorShopTitle, desc: t.tpvSectorShopDesc },
  ];

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
          content="TPV táctil para restaurantes y bares con 13 módulos"
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
        areaServed={solutionMeta?.jsonLd.areaServed}
        serviceType={solutionMeta?.jsonLd.serviceType}
      />
      <BreadcrumbListSchema
        breadcrumbs={[
          { name: "Inicio", url: `${ORG_URL}/` },
          { name: "TPV para restaurantes", url: PAGE_URL },
        ]}
      />

      <SeoFaqSchema faqs={faqs} />

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

        <Section
          id="tpv-tactil-tenerife"
          width="prose"
          title={t.tpvTactilTitle}
          intro={t.tpvTactilDesc}
        />

        <Section
          id="tpv-por-negocio"
          tone="alt"
          title={t.tpvSectorsTitle}
          intro={t.tpvSectorsIntro}
        >
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-[var(--space-md)] list-none p-0 m-0">
            {sectors.map(({ title, desc }) => (
              <li key={title} className="ds-card">
                <h3 className="ds-h3 mb-2">{title}</h3>
                <p className="text-muted leading-relaxed m-0">{desc}</p>
              </li>
            ))}
          </ul>
        </Section>

        <TpvModulesSection whatsappPhone={whatsappPhone} />

        <Section id="tpv-faq" width="prose" title={t.tpvFaqTitle}>
          <FaqList items={faqs.map((f) => ({ q: f.question, a: f.answer }))} />
        </Section>

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
